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
    console.log('🔍 Detecting Steam library folders...');
    
    for (const steamPath of this.steamPaths) {
      // Add the main Steam installation path
      this.libraryPaths.push(steamPath);
      console.log(`✅ Found Steam library: ${steamPath}`);

      // Try modern location first: steamapps/libraryfolders.vdf
      let vdfPath = this.joinPath(steamPath, 'steamapps', 'libraryfolders.vdf');
      let exists = await ipcRenderer.invoke('check-file-exists', vdfPath);
      
      // Fallback to older location: config/libraryfolders.vdf
      if (!exists) {
        vdfPath = this.joinPath(steamPath, 'config', 'libraryfolders.vdf');
        exists = await ipcRenderer.invoke('check-file-exists', vdfPath);
      }
      
      if (exists) {
        try {
          const content = await ipcRenderer.invoke('read-file', vdfPath);
          const parsed = VDF.parse(content);
          
          if (parsed && parsed.libraryfolders) {
            const folders = parsed.libraryfolders;
            let additionalLibrariesCount = 0;
            
            for (const key in folders) {
              if (key !== 'contentstatsid' && folders[key].path) {
                const libPath = folders[key].path.replace(/\\\\/g, '\\');
                
                // Verify the path exists before adding
                const pathExists = await ipcRenderer.invoke('check-file-exists', libPath);
                if (pathExists && !this.libraryPaths.includes(libPath)) {
                  this.libraryPaths.push(libPath);
                  additionalLibrariesCount++;
                  console.log(`✅ Found additional Steam library: ${libPath}`);
                }
              }
            }
            
            if (additionalLibrariesCount > 0) {
              console.log(`📚 Total additional libraries found: ${additionalLibrariesCount}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse libraryfolders.vdf: ${error.message}`);
        }
      } else {
        console.warn(`⚠️ libraryfolders.vdf not found at ${vdfPath}`);
      }
    }
    
    console.log(`📊 Total Steam libraries detected: ${this.libraryPaths.length}`);
    console.log('🔍 All library paths:', this.libraryPaths);
  }

  async scanManifestsForAppId(appId) {
    try {
      console.log(`🔎 Scanning manifests for APPID ${appId} across all libraries...`);
      const manifests = [];
      const depotIds = await this.getDepotIdsForAppId(appId);
      
      if (depotIds.length === 0) {
        console.warn(`⚠️ No depot IDs found for APPID ${appId}`);
      } else {
        console.log(`📦 Found ${depotIds.length} depot(s) for APPID ${appId}: ${depotIds.join(', ')}`);
      }

      const decryptionKeys = await this.getDecryptionKeys();

      for (const libraryPath of this.libraryPaths) {
        const depotCachePath = this.joinPath(libraryPath, 'depotcache');
        const exists = await ipcRenderer.invoke('check-file-exists', depotCachePath);
        
        if (!exists) {
          console.log(`⏭️  Skipping ${libraryPath} (no depotcache)`);
          continue;
        }

        console.log(`🔍 Scanning depotcache in: ${libraryPath}`);

        try {
          const files = await ipcRenderer.invoke('read-dir', depotCachePath);
          
          if (!Array.isArray(files)) {
            console.warn(`⚠️ Invalid files list for ${depotCachePath}`);
            continue;
          }
          
          let foundInThisLibrary = 0;
          
          for (const file of files) {
            try {
              if (file && typeof file === 'string' && file.endsWith('.manifest')) {
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
                    foundInThisLibrary++;
                  }
                }
              }
            } catch (fileError) {
              console.warn(`⚠️ Error processing file ${file}: ${fileError.message}`);
            }
          }
          
          if (foundInThisLibrary > 0) {
            console.log(`✅ Found ${foundInThisLibrary} manifest(s) in ${libraryPath}`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to scan depotcache at ${depotCachePath}: ${error.message}`);
        }
      }

      console.log(`✅ Total manifests found for APPID ${appId}: ${manifests.length}`);
      return manifests;
    } catch (error) {
      console.error('❌ Error scanning manifests:', error);
      throw new Error(`Failed to scan manifests: ${error.message}`);
    }
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
    try {
      if (!appId || !manifests || !Array.isArray(manifests)) {
        throw new Error('Invalid parameters for Lua script generation');
      }

      let script = `addappid(${appId})\n`;
      
      for (const manifest of manifests) {
        if (manifest && manifest.manifestId) {
          script += `setManifestid(${appId},"${manifest.manifestId}")\n`;
          if (manifest.decryptionKey) {
            script += `setDecryptionKey(${appId},"${manifest.decryptionKey}")\n`;
          }
        }
      }

      return script;
    } catch (error) {
      console.error('Error generating Lua script:', error);
      throw new Error(`Failed to generate Lua script: ${error.message}`);
    }
  }

  async findAllInstalledGames() {
    console.log('🎮 Starting scan for all installed games across all libraries...');
    
    try {
      const installedGames = [];
      
      console.log(`📁 Scanning ${this.libraryPaths.length} Steam library location(s):`);
      this.libraryPaths.forEach((path, index) => {
        console.log(`  ${index + 1}. ${path}`);
      });
      
      for (const libraryPath of this.libraryPaths) {
        const steamappsPath = this.joinPath(libraryPath, 'steamapps');
        const exists = await ipcRenderer.invoke('check-file-exists', steamappsPath);
        
        if (!exists) {
          console.warn(`⚠️ steamapps folder not found in: ${libraryPath}`);
          continue;
        }

        try {
          const files = await ipcRenderer.invoke('read-dir', steamappsPath);
          
          if (!Array.isArray(files)) {
            console.warn(`⚠️ Invalid files list for ${steamappsPath}`);
            continue;
          }
          
          // Find all appmanifest_*.acf files
          const manifestFiles = files.filter(f => 
            f && typeof f === 'string' && f.startsWith('appmanifest_') && f.endsWith('.acf')
          );
          
          console.log(`🔍 Found ${manifestFiles.length} game manifest(s) in ${libraryPath}`);
          
          // Extract APPID and check if installed
          for (const file of manifestFiles) {
            try {
              const match = file.match(/^appmanifest_(\d+)\.acf$/);
              if (!match) continue;
              
              const appId = match[1];
              const acfPath = this.joinPath(steamappsPath, file);
              
              // Parse ACF to check if actually installed
              const content = await ipcRenderer.invoke('read-file', acfPath);
              const parsed = VDF.parse(content);
              
              if (parsed && parsed.AppState) {
                const appState = parsed.AppState;
                
                // Check StateFlags to ensure game is fully installed
                if (appState.StateFlags) {
                  const stateFlags = parseInt(appState.StateFlags);
                  // StateFlags & 4 means fully installed
                  if (stateFlags & 4) {
                    installedGames.push({
                      appId: appId,
                      name: appState.name || 'Unknown',
                      libraryPath: libraryPath
                    });
                  }
                }
              }
            } catch (fileError) {
              console.warn(`⚠️ Error processing manifest file ${file}: ${fileError.message}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to scan steamapps at ${steamappsPath}: ${error.message}`);
        }
      }
      
      console.log(`✅ Total installed games found: ${installedGames.length}`);
      return installedGames;
    } catch (error) {
      console.error('❌ Error finding installed games:', error);
      throw new Error(`Failed to find installed games: ${error.message}`);
    }
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
