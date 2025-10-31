const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getSteamPath: () => ipcRenderer.invoke('get-steam-path'),
  scanDepotcache: () => ipcRenderer.invoke('scan-depotcache'),
  selectManifestFiles: () => ipcRenderer.invoke('select-manifest-files'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  saveLuaScripts: (data) => ipcRenderer.invoke('save-lua-scripts', data),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings)
});
