const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');
const vdf = require('vdf-parser');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function getSteamPath() {
  const platform = os.platform();
  
  if (platform === 'win32') {
    const possiblePaths = [
      'C:\\Program Files (x86)\\Steam',
      'C:\\Program Files\\Steam',
      path.join(os.homedir(), 'AppData', 'Local', 'Steam')
    ];
    
    for (const steamPath of possiblePaths) {
      if (fsSync.existsSync(steamPath)) {
        return steamPath;
      }
    }
  } else if (platform === 'linux') {
    const possiblePaths = [
      path.join(os.homedir(), '.steam', 'steam'),
      path.join(os.homedir(), '.local', 'share', 'Steam')
    ];
    
    for (const steamPath of possiblePaths) {
      if (fsSync.existsSync(steamPath)) {
        return steamPath;
      }
    }
  } else if (platform === 'darwin') {
    const steamPath = path.join(os.homedir(), 'Library', 'Application Support', 'Steam');
    if (fsSync.existsSync(steamPath)) {
      return steamPath;
    }
  }
  
  return null;
}

function parseVDF(content) {
  try {
    return vdf.parse(content);
  } catch (error) {
    console.error('VDF parse error:', error);
    return null;
  }
}

async function getSteamLibraries() {
  const steamPath = getSteamPath();
  if (!steamPath) {
    throw new Error('Steam installation not found');
  }

  const libraries = [steamPath];
  const libraryFoldersPath = path.join(steamPath, 'config', 'libraryfolders.vdf');

  try {
    const content = await fs.readFile(libraryFoldersPath, 'utf8');
    const parsed = parseVDF(content);
    
    if (parsed && parsed.libraryfolders) {
      for (const key in parsed.libraryfolders) {
        const library = parsed.libraryfolders[key];
        if (library && typeof library === 'object' && library.path) {
          libraries.push(library.path);
        }
      }
    }
  } catch (error) {
    console.warn('Could not parse libraryfolders.vdf:', error);
  }

  return libraries;
}

async function getDecryptionKeys() {
  const steamPath = getSteamPath();
  if (!steamPath) {
    return {};
  }

  const configPath = path.join(steamPath, 'config', 'config.vdf');
  const keys = {};

  try {
    const content = await fs.readFile(configPath, 'utf8');
    const parsed = parseVDF(content);
    
    if (parsed && parsed.InstallConfigStore && parsed.InstallConfigStore.Software && 
        parsed.InstallConfigStore.Software.Valve && parsed.InstallConfigStore.Software.Valve.Steam &&
        parsed.InstallConfigStore.Software.Valve.Steam.depots) {
      const depots = parsed.InstallConfigStore.Software.Valve.Steam.depots;
      
      for (const depotId in depots) {
        const depot = depots[depotId];
        if (depot && depot.DecryptionKey) {
          keys[depotId] = depot.DecryptionKey;
        }
      }
    }
  } catch (error) {
    console.warn('Could not parse config.vdf:', error);
  }

  return keys;
}

async function getDepotToAppidMapping() {
  const libraries = await getSteamLibraries();
  const mapping = {};
  const dlcList = {};

  for (const library of libraries) {
    const steamappsPath = path.join(library, 'steamapps');
    
    try {
      const files = await fs.readdir(steamappsPath);
      
      for (const file of files) {
        if (file.startsWith('appmanifest_') && file.endsWith('.acf')) {
          const acfPath = path.join(steamappsPath, file);
          
          try {
            const content = await fs.readFile(acfPath, 'utf8');
            const parsed = parseVDF(content);
            
            if (parsed && parsed.AppState) {
              const appid = parsed.AppState.appid;
              
              if (parsed.AppState.depots) {
                for (const key in parsed.AppState.depots) {
                  const depotId = key;
                  if (/^\d+$/.test(depotId)) {
                    mapping[depotId] = appid;
                  }
                }
              }
              
              if (parsed.AppState.extended && parsed.AppState.extended.listofdlc) {
                const dlcIds = parsed.AppState.extended.listofdlc.split(',');
                dlcList[appid] = dlcIds.map(id => id.trim());
              }
            }
          } catch (error) {
            console.warn(`Could not parse ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`Could not read steamapps directory at ${steamappsPath}:`, error);
    }
  }

  return { mapping, dlcList };
}

async function scanDepotCache() {
  const libraries = await getSteamLibraries();
  const manifests = [];

  for (const library of libraries) {
    const depotCachePath = path.join(library, 'depotcache');
    
    try {
      const files = await fs.readdir(depotCachePath);
      
      for (const file of files) {
        if (file.endsWith('.manifest')) {
          manifests.push({
            path: path.join(depotCachePath, file),
            filename: file
          });
        }
      }
    } catch (error) {
      console.warn(`Could not read depotcache at ${depotCachePath}:`, error);
    }
  }

  return manifests;
}

function extractManifestInfo(filename) {
  const manifestIdMatch = filename.match(/(\d{10,22})/);
  const depotIdMatch = filename.match(/^(\d{5,9})_/);
  
  return {
    manifestId: manifestIdMatch ? manifestIdMatch[1] : null,
    depotId: depotIdMatch ? depotIdMatch[1] : null
  };
}

ipcMain.handle('get-steam-path', async () => {
  return getSteamPath();
});

ipcMain.handle('scan-depotcache', async () => {
  try {
    const manifests = await scanDepotCache();
    const decryptionKeys = await getDecryptionKeys();
    const { mapping, dlcList } = await getDepotToAppidMapping();
    
    const results = manifests.map(manifest => {
      const info = extractManifestInfo(manifest.filename);
      const appid = info.depotId ? mapping[info.depotId] : null;
      const decryptionKey = info.depotId ? decryptionKeys[info.depotId] : null;
      
      return {
        file: manifest.filename,
        path: manifest.path,
        manifestId: info.manifestId,
        depotId: info.depotId,
        appid: appid,
        type: 'Depot',
        decryptionKey: decryptionKey,
        status: info.manifestId && info.depotId ? 'Valid' : 'Invalid filename'
      };
    });
    
    return {
      manifests: results,
      dlcList: dlcList
    };
  } catch (error) {
    throw new Error(`Failed to scan depotcache: ${error.message}`);
  }
});

ipcMain.handle('select-manifest-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Manifest Files', extensions: ['manifest'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (result.canceled) {
    return [];
  }
  
  const decryptionKeys = await getDecryptionKeys();
  const { mapping } = await getDepotToAppidMapping();
  
  const manifests = result.filePaths.map(filePath => {
    const filename = path.basename(filePath);
    const info = extractManifestInfo(filename);
    const appid = info.depotId ? mapping[info.depotId] : null;
    const decryptionKey = info.depotId ? decryptionKeys[info.depotId] : null;
    
    return {
      file: filename,
      path: filePath,
      manifestId: info.manifestId,
      depotId: info.depotId,
      appid: appid,
      type: 'Depot',
      decryptionKey: decryptionKey,
      status: info.manifestId && info.depotId ? 'Valid' : 'Invalid filename'
    };
  });
  
  return manifests;
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (result.canceled) {
    return null;
  }
  
  return result.filePaths[0];
});

ipcMain.handle('save-lua-scripts', async (event, { manifests, outputRoot, structure, pattern, dumpMode, dlcList }) => {
  try {
    const groupedByAppid = {};
    
    for (const manifest of manifests) {
      if (manifest.status === 'Valid' && manifest.appid) {
        if (!groupedByAppid[manifest.appid]) {
          groupedByAppid[manifest.appid] = [];
        }
        groupedByAppid[manifest.appid].push(manifest);
      }
    }
    
    if (dumpMode === 'base-dlc-depotcache' && dlcList) {
      for (const baseAppid in dlcList) {
        const dlcIds = dlcList[baseAppid];
        for (const dlcId of dlcIds) {
          if (!groupedByAppid[dlcId]) {
            groupedByAppid[dlcId] = [];
          }
        }
      }
    }
    
    const savedFiles = [];
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    for (const appid in groupedByAppid) {
      const manifests = groupedByAppid[appid];
      
      let luaContent = `-- APPID: ${appid}\n`;
      luaContent += `addappid(${appid})\n`;
      
      for (const manifest of manifests) {
        luaContent += `setManifestid(${appid},"${manifest.manifestId}")\n`;
        if (manifest.decryptionKey) {
          luaContent += `setDecryptionKey(${appid},"${manifest.decryptionKey}")\n`;
        }
      }
      
      let filename = pattern
        .replace(/{APPID}/g, appid)
        .replace(/{DATE}/g, date)
        .replace(/{TIME}/g, time);
      
      let outputPath = outputRoot;
      
      if (structure === 'appid') {
        outputPath = path.join(outputRoot, appid);
      } else if (structure === 'manifests') {
        outputPath = path.join(outputRoot, 'MANIFESTS', appid);
      }
      
      await fs.mkdir(outputPath, { recursive: true });
      
      const filePath = path.join(outputPath, filename);
      await fs.writeFile(filePath, luaContent, 'utf8');
      
      savedFiles.push(filePath);
    }
    
    return savedFiles;
  } catch (error) {
    throw new Error(`Failed to save Lua scripts: ${error.message}`);
  }
});

ipcMain.handle('load-settings', async () => {
  const userDataPath = app.getPath('userData');
  const settingsPath = path.join(userDataPath, 'settings.json');
  
  try {
    const content = await fs.readFile(settingsPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
});

ipcMain.handle('save-settings', async (event, settings) => {
  const userDataPath = app.getPath('userData');
  const settingsPath = path.join(userDataPath, 'settings.json');
  
  try {
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
});
