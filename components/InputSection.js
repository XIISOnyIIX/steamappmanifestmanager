class InputSection {
  constructor(onScan, onOutputDirSelect) {
    this.onScan = onScan;
    this.onOutputDirSelect = onOutputDirSelect;
    this.outputDir = null;
    this.isScanning = false;
  }

  render() {
    const container = document.getElementById('inputSection');
    if (!container) {
      return;
    }

    container.innerHTML = `
      <!-- APPID Input -->
      <div class="input-wrapper glass relative">
        <input 
          type="number" 
          id="appIdInput" 
          placeholder="Enter APPID"
          class="input-glass w-48"
          min="1"
        />
      </div>
      
      <!-- Split Button Group -->
      <div class="split-button-group inline-flex relative">
        <!-- Main Scan Button (Left) -->
        <button id="scanButton" class="scan-main-btn px-6 py-2 hover:bg-white/10 transition-all flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <span id="scanButtonText">Scan</span>
        </button>
        
        <!-- Dropdown Toggle (Right) -->
        <button id="scanDropdown" class="scan-dropdown-btn px-3 py-2 hover:bg-white/10 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <!-- Dropdown Menu -->
        <div id="scanMenu" class="scan-dropdown-menu hidden">
          <button class="dropdown-item">
            <span class="icon">📚</span>
            <div class="text-container">
              <div class="title">Scan All Installed Games</div>
              <div class="subtitle">Find all Steam games on all drives</div>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Output Directory Controls -->
      <div class="flex items-center gap-2">
        <!-- Output Directory Picker -->
        <button id="outputDirButton" class="glass p-2 rounded-lg transition-all hover:scale-105" style="color: #66c0f4;" title="Select output directory">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
        </button>
        
        <!-- Open Output Directory Button -->
        <button id="openOutputDirButton" class="glass p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100" style="color: #66c0f4;" title="Open output folder" disabled>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        </button>
        
        <!-- Info/About Button -->
        <button id="infoButton" class="info-button glass p-2 rounded-lg" style="color: #66c0f4;" title="About">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const input = document.getElementById('appIdInput');
    const scanButton = document.getElementById('scanButton');
    const outputDirButton = document.getElementById('outputDirButton');
    const openOutputDirButton = document.getElementById('openOutputDirButton');
    const infoButton = document.getElementById('infoButton');
    const scanDropdown = document.getElementById('scanDropdown');
    const scanMenu = document.getElementById('scanMenu');
    const dropdownItem = document.querySelector('.scan-dropdown-menu .dropdown-item');

    if (!input || !scanButton || !outputDirButton || !openOutputDirButton || !scanDropdown || !scanMenu) {
      return;
    }

    // Enter key to scan single APPID
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.isScanning) {
        this.handleScan();
      }
    });

    // Main button - scan single APPID
    scanButton.addEventListener('click', () => {
      if (!this.isScanning) {
        this.handleScan();
      }
    });

    // Dropdown toggle - show/hide menu
    scanDropdown.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isHidden = scanMenu.classList.contains('hidden');
      
      // Toggle menu visibility
      scanMenu.classList.toggle('hidden');
      
      // Toggle active state on button
      if (isHidden) {
        scanDropdown.classList.add('active');
      } else {
        scanDropdown.classList.remove('active');
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const buttonGroup = scanDropdown.closest('.split-button-group');
      
      // If click is outside button group, close menu
      if (buttonGroup && !buttonGroup.contains(e.target)) {
        scanMenu.classList.add('hidden');
        scanDropdown.classList.remove('active');
      }
    });

    // Dropdown menu item - scan all installed games
    if (dropdownItem) {
      dropdownItem.addEventListener('click', async () => {
        // Close dropdown
        scanMenu.classList.add('hidden');
        scanDropdown.classList.remove('active');
        
        // Confirm action
        const confirmed = await confirmModal.show(
          'Scan All Installed Games?',
          'This will scan all games currently installed on Steam. This may take a few minutes for large libraries.'
        );
        
        if (!confirmed) {
          return;
        }
        
        // Call scan all method
        this.handleScanAll();
      });
    }

    // Output directory button
    outputDirButton.addEventListener('click', async () => {
      await this.selectOutputDirectory();
    });

    // Open output directory button
    openOutputDirButton.addEventListener('click', async () => {
      await this.openOutputDirectory();
    });

    // Info/About button
    if (infoButton) {
      infoButton.addEventListener('click', () => {
        if (typeof aboutModal !== 'undefined' && aboutModal.show) {
          aboutModal.show();
        } else {
          console.error('About modal not available');
        }
      });
    }
  }

  async handleScan() {
    // Scan single APPID
    // GUARD: Prevent scanning during initialization
    if (window.app && window.app.isInitializing) {
      return;
    }
    
    const input = document.getElementById('appIdInput');
    if (!input) return;

    const appId = input.value.trim();

    if (!appId) {
      toastManager.warning('Please enter an APPID');
      input.focus();
      return;
    }

    const appIdNum = parseInt(appId);
    if (isNaN(appIdNum) || appIdNum <= 0) {
      toastManager.error('Please enter a valid positive APPID');
      input.focus();
      return;
    }

    this.setScanning(true);
    
    try {
      await this.onScan(appIdNum);
      input.value = '';
    } catch (error) {
      toastManager.error(error.message);
    } finally {
      this.setScanning(false);
    }
  }

  async handleScanAll() {
    // Scan all installed games
    // GUARD: Prevent scanning during initialization
    if (window.app && window.app.isInitializing) {
      return;
    }

    this.setScanning(true);
    
    try {
      // Call scan all method from app
      if (window.app && window.app.scanAllInstalledGames) {
        await window.app.scanAllInstalledGames();
      } else {
        throw new Error('Scan all functionality not available');
      }
    } catch (error) {
      toastManager.error(error.message);
    } finally {
      this.setScanning(false);
    }
  }

  setScanning(scanning) {
    this.isScanning = scanning;
    const scanButton = document.getElementById('scanButton');
    const scanDropdown = document.getElementById('scanDropdown');
    const input = document.getElementById('appIdInput');

    if (!scanButton || !scanDropdown || !input) return;

    if (scanning) {
      scanButton.disabled = true;
      scanDropdown.disabled = true;
      input.disabled = true;
      scanButton.innerHTML = `
        <div class="spinner spinner-sm"></div>
        <span id="scanButtonText">Scanning...</span>
      `;
    } else {
      scanButton.disabled = false;
      scanDropdown.disabled = false;
      input.disabled = false;
      scanButton.className = 'scan-main-btn px-6 py-2 hover:bg-white/10 transition-all flex items-center gap-2';
      scanButton.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <span id="scanButtonText">Scan</span>
      `;
    }
  }

  updateScanProgress(current, total) {
    const scanButtonText = document.getElementById('scanButtonText');
    if (scanButtonText) {
      scanButtonText.textContent = `${current}/${total}`;
    }
  }

  async selectOutputDirectory() {
    try {
      const { ipcRenderer } = require('electron');
      const dir = await ipcRenderer.invoke('select-output-directory');
      if (dir) {
        this.outputDir = dir;
        this.updateOutputDirDisplay();
        this.onOutputDirSelect(dir);
        toastManager.success('Output directory selected');
      }
    } catch (error) {
      console.error('Error selecting output directory:', error);
      toastManager.error('Failed to select directory');
    }
  }

  updateOutputDirDisplay() {
    const button = document.getElementById('outputDirButton');
    const openButton = document.getElementById('openOutputDirButton');
    if (!button) return;

    if (this.outputDir) {
      button.style.background = 'rgba(139, 197, 63, 0.2)';
      button.style.borderColor = 'rgba(139, 197, 63, 0.3)';
      button.innerHTML = `
        <svg class="w-6 h-6" style="color: #8bc53f;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;

      if (openButton) {
        openButton.disabled = false;
      }
    }
  }

  async openOutputDirectory() {
    if (!this.outputDir) {
      toastManager.warning('Please select an output directory first');
      return;
    }

    try {
      const { ipcRenderer } = require('electron');
      const result = await ipcRenderer.invoke('open-directory', this.outputDir);
      
      if (!result.success) {
        toastManager.error(`Failed to open directory: ${result.error}`);
      }
    } catch (error) {
      console.error('Error opening directory:', error);
      toastManager.error('Failed to open directory');
    }
  }

  getOutputDir() {
    return this.outputDir;
  }
}
