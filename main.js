const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

let mainWindow;
let updateDownloaded = false;

// Configure auto-updater
autoUpdater.autoDownload = false; // Don't auto-download, let user decide
autoUpdater.autoInstallOnAppQuit = true; // Install on quit if downloaded

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
  sendStatusToWindow('update-checking');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  sendStatusToWindow('update-available', {
    version: info.version,
    releaseDate: info.releaseDate,
    releaseNotes: info.releaseNotes
  });
  
  // Show non-intrusive notification
  if (mainWindow) {
    mainWindow.webContents.send('update-available', {
      version: info.version
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info.version);
  sendStatusToWindow('update-not-available');
});

autoUpdater.on('error', (err) => {
  console.error('Update error:', err);
  sendStatusToWindow('update-error', { 
    error: err.message || 'Unknown error occurred' 
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`Download progress: ${progressObj.percent}%`);
  sendStatusToWindow('download-progress', {
    percent: progressObj.percent,
    transferred: progressObj.transferred,
    total: progressObj.total
  });
  
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);
  updateDownloaded = true;
  sendStatusToWindow('update-downloaded', {
    version: info.version
  });
  
  // Show notification that update is ready
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', {
      version: info.version
    });
  }
});

function sendStatusToWindow(status, data = {}) {
  console.log('Update status:', status, data);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-status', { status, ...data });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'build/icon.ico'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    backgroundColor: '#0f172a',
    titleBarStyle: 'default',
    show: false,
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Hide menu bar in production, keep it visible in development
  if (app.isPackaged) {
    Menu.setApplicationMenu(null);
  }
  
  createWindow();
  
  // Auto-check for updates on startup (only in production)
  if (app.isPackaged) {
    // Delay the check by 3 seconds to not interfere with app startup
    setTimeout(() => {
      console.log('Auto-checking for updates on startup...');
      autoUpdater.checkForUpdates().catch(err => {
        console.error('Auto-update check failed:', err);
      });
    }, 3000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('select-output-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Output Directory',
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('save-manifests', async (event, { outputDir, gameName, manifests, luaScript, appId }) => {
  try {
    const sanitizedName = gameName.replace(/[<>:"/\\|?*]/g, '_');
    const gameDir = path.join(outputDir, sanitizedName);

    await fs.mkdir(gameDir, { recursive: true });

    for (const manifest of manifests) {
      const sourcePath = manifest.fullPath;
      const destPath = path.join(gameDir, manifest.file);
      
      if (fsSync.existsSync(sourcePath)) {
        await fs.copyFile(sourcePath, destPath);
      } else {
        throw new Error(`Manifest file not found: ${sourcePath}`);
      }
    }

    const luaPath = path.join(gameDir, `script_${appId}.lua`);
    await fs.writeFile(luaPath, luaScript, 'utf-8');

    return {
      success: true,
      path: gameDir,
    };
  } catch (error) {
    console.error('Save error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});

ipcMain.handle('check-file-exists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});

ipcMain.handle('read-dir', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('open-directory', async (event, dirPath) => {
  try {
    if (!dirPath) {
      return { success: false, error: 'No directory path provided' };
    }

    if (!fsSync.existsSync(dirPath)) {
      return { success: false, error: 'Directory does not exist' };
    }

    const result = await shell.openPath(dirPath);
    
    if (result) {
      return { success: false, error: result };
    }

    return { success: true };
  } catch (error) {
    console.error('Error opening directory:', error);
    return { success: false, error: error.message };
  }
});

// Auto-updater IPC handlers
ipcMain.handle('check-for-updates', async () => {
  try {
    if (!app.isPackaged) {
      // In development, simulate no update available
      return { 
        available: false, 
        error: 'Update checking is only available in production builds' 
      };
    }
    
    const result = await autoUpdater.checkForUpdates();
    
    if (!result || !result.updateInfo) {
      return { available: false };
    }
    
    const currentVersion = app.getVersion();
    const latestVersion = result.updateInfo.version;
    
    if (latestVersion !== currentVersion) {
      return {
        available: true,
        version: latestVersion,
        currentVersion: currentVersion,
        releaseDate: result.updateInfo.releaseDate,
        releaseNotes: result.updateInfo.releaseNotes
      };
    }
    
    return { available: false, currentVersion };
  } catch (error) {
    console.error('Check for updates error:', error);
    return { 
      available: false, 
      error: error.message || 'Failed to check for updates' 
    };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    if (!app.isPackaged) {
      return { 
        success: false, 
        error: 'Update downloading is only available in production builds' 
      };
    }
    
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error('Download update error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to download update' 
    };
  }
});

ipcMain.handle('install-update', () => {
  if (updateDownloaded) {
    // Quit and install the update
    setImmediate(() => {
      autoUpdater.quitAndInstall(false, true);
    });
    return { success: true };
  }
  return { 
    success: false, 
    error: 'No update has been downloaded yet' 
  };
});

ipcMain.handle('get-update-status', () => {
  return {
    downloaded: updateDownloaded,
    isPackaged: app.isPackaged
  };
});
