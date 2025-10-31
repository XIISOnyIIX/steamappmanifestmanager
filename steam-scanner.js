const VDF = require('vdf-parser');
const { ipcRenderer } = require('electron');

class SteamScanner {
  constructor() {
    this.steamPaths = [];
    this.libraryPaths = [];
    this.platform = null;
  }

  async initialize() {
    this.platform = process.platform;
    await this.detectSteamPaths();
    await this.findLibraryFolders();
  }

  async detectSteamPaths() {
    const paths = this.getDefaultSteamPaths();
    
    for (const steamPath of paths) {
      const exists = await ipcRenderer.invoke('check-file-exists', steamPath);
      if (exists) {
        this.steamPaths.push(steamPath);
      }
    }

    if (this.steamPaths.length === 0) {
      throw new Error('Steam installation not found');
    }
  }

  getDefaultSteamPaths() {
    switch (this.platform) {
      case 'win32':
        return [
          'C:\\Program Files (x86)\\Steam',
          'C:\\Program Files\\Steam',
        ];
      case 'darwin':
        return [
          `${process.env.HOME}/Library/Application Support/Steam`,
        ];
      case 'linux':
        return [
          `${process.env.HOME}/.steam/steam`,
          `${process.env.HOME}/.local/share/Steam`,
        ];
      default:
        return [];
    }
  }

  async findLibraryFolders() {
    for (const steamPath of this.steamPaths) {
      this.libraryPaths.push(steamPath);

      const vdfPath = this.joinPath(steamPath, 'steamapps', 'libraryfolders.vdf');
      const exists = await ipcRenderer.invoke('check-file-exists', vdfPath);
      
      if (exists) {
        try {
          const content = await ipcRenderer.invoke('read-file', vdfPath);
          const parsed = VDF.parse(content);
          
          if (parsed && parsed.libraryfolders) {
            const folders = parsed.libraryfolders;
            for (const key in folders) {
              if (key !== 'contentstatsid' && folders[key].path) {
                const libPath = folders[key].path.replace(/\\\\/g, '\\');
                this.libraryPaths.push(libPath);
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to parse libraryfolders.vdf: ${error.message}`);
        }
      }
    }
  }

  async scanManifestsForAppId(appId) {
    const manifests = [];
    const depotIds = await this.getDepotIdsForAppId(appId);
    
    if (depotIds.length === 0) {
      console.warn(`No depot IDs found for APPID ${appId}`);
    }

    const decryptionKeys = await this.getDecryptionKeys();

    for (const libraryPath of this.libraryPaths) {
      const depotCachePath = this.joinPath(libraryPath, 'depotcache');
      const exists = await ipcRenderer.invoke('check-file-exists', depotCachePath);
      
      if (!exists) continue;

      try {
        const files = await ipcRenderer.invoke('read-dir', depotCachePath);
        
        for (const file of files) {
          if (file.endsWith('.manifest')) {
            const match = file.match(/^(\d+)_(\d+)\.manifest$/);
            if (match) {
              const depotId = match[1];
              const manifestId = match[2];
              
              if (depotIds.includes(depotId)) {
                const fullPath = this.joinPath(depotCachePath, file);
                manifests.push({
                  file,
                  depotId,
                  manifestId,
                  decryptionKey: decryptionKeys[depotId] || null,
                  type: 'Base',
                  fullPath,
                });
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to scan depotcache at ${depotCachePath}: ${error.message}`);
      }
    }

    return manifests;
  }

  async getDepotIdsForAppId(appId) {
    const depotIds = [];

    for (const libraryPath of this.libraryPaths) {
      const manifestPath = this.joinPath(libraryPath, 'steamapps', `appmanifest_${appId}.acf`);
      const exists = await ipcRenderer.invoke('check-file-exists', manifestPath);
      
      if (!exists) continue;

      try {
        const content = await ipcRenderer.invoke('read-file', manifestPath);
        const parsed = VDF.parse(content);
        
        if (parsed && parsed.AppState) {
          const appState = parsed.AppState;
          
          if (appState.InstalledDepots) {
            for (const depotId in appState.InstalledDepots) {
              if (!depotIds.includes(depotId)) {
                depotIds.push(depotId);
              }
            }
          }

          if (appState.MountedDepots) {
            for (const depotId in appState.MountedDepots) {
              if (!depotIds.includes(depotId)) {
                depotIds.push(depotId);
              }
            }
          }

          if (appState.depots) {
            for (const depotId in appState.depots) {
              if (!isNaN(depotId) && !depotIds.includes(depotId)) {
                depotIds.push(depotId);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to parse appmanifest for ${appId}: ${error.message}`);
      }
    }

    return depotIds;
  }

  async getDecryptionKeys() {
    const keys = {};

    for (const steamPath of this.steamPaths) {
      const configPath = this.joinPath(steamPath, 'config', 'config.vdf');
      const exists = await ipcRenderer.invoke('check-file-exists', configPath);
      
      if (!exists) continue;

      try {
        const content = await ipcRenderer.invoke('read-file', configPath);
        const parsed = VDF.parse(content);
        
        if (parsed && parsed.InstallConfigStore && parsed.InstallConfigStore.Software) {
          const software = parsed.InstallConfigStore.Software;
          if (software.Valve && software.Valve.Steam && software.Valve.Steam.depots) {
            const depots = software.Valve.Steam.depots;
            for (const depotId in depots) {
              if (depots[depotId].DecryptionKey) {
                keys[depotId] = depots[depotId].DecryptionKey;
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to parse config.vdf: ${error.message}`);
      }
    }

    return keys;
  }

  generateLuaScript(appId, manifests) {
    let script = `addappid(${appId})\n`;
    
    for (const manifest of manifests) {
      script += `setManifestid(${appId},"${manifest.manifestId}")\n`;
      if (manifest.decryptionKey) {
        script += `setDecryptionKey(${appId},"${manifest.decryptionKey}")\n`;
      }
    }

    return script;
  }

  joinPath(...parts) {
    if (this.platform === 'win32') {
      return parts.join('\\').replace(/\//g, '\\');
    }
    return parts.join('/').replace(/\\/g, '/');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SteamScanner;
}
