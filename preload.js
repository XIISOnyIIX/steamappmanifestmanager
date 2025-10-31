const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectOutputDirectory: () => ipcRenderer.invoke('select-output-directory'),
  saveManifests: (data) => ipcRenderer.invoke('save-manifests', data),
  checkFileExists: (filePath) => ipcRenderer.invoke('check-file-exists', filePath),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  readDir: (dirPath) => ipcRenderer.invoke('read-dir', dirPath),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
});
