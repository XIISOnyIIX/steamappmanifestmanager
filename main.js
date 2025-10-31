const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
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

app.whenReady().then(createWindow);

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
