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
      console.error('Input section container not found');
      return;
    }

    container.innerHTML = `
      <label class="toggle-container">
        <input type="checkbox" id="scanAllToggle" class="toggle-input" />
        <span class="toggle-switch"></span>
        <span class="toggle-label">Scan all installed</span>
      </label>
      
      <div class="input-wrapper glass relative">
        <input 
          type="number" 
          id="appIdInput" 
          placeholder="Enter APPID"
          class="input-glass w-48"
          min="1"
        />
      </div>
      
      <button id="scanButton" class="btn-glass flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <span id="scanButtonText">Scan</span>
      </button>
      
      <button id="outputDirButton" class="glass p-2 rounded-lg transition-all hover:scale-105" style="color: #66c0f4;" title="Select output directory">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
        </svg>
      </button>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const input = document.getElementById('appIdInput');
    const scanButton = document.getElementById('scanButton');
    const outputDirButton = document.getElementById('outputDirButton');
    const scanAllToggle = document.getElementById('scanAllToggle');

    if (!input || !scanButton || !outputDirButton || !scanAllToggle) {
      console.error('Input section elements not found');
      return;
    }

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.isScanning) {
        this.handleScan();
      }
    });

    scanButton.addEventListener('click', () => {
      if (!this.isScanning) {
        this.handleScan();
      }
    });

    outputDirButton.addEventListener('click', async () => {
      await this.selectOutputDirectory();
    });

    scanAllToggle.addEventListener('change', (e) => {
      this.handleToggleChange(e.target.checked);
    });
  }

  handleToggleChange(scanAll) {
    const input = document.getElementById('appIdInput');
    const scanButtonText = document.getElementById('scanButtonText');
    
    if (!input || !scanButtonText) return;

    // ONLY update UI state - DO NOT trigger any scanning!
    // Scanning only happens when user clicks the Scan button
    if (scanAll) {
      input.disabled = true;
      input.placeholder = 'Scan all mode enabled';
      input.style.opacity = '0.5';
      scanButtonText.textContent = 'Scan All';
    } else {
      input.disabled = false;
      input.placeholder = 'Enter APPID';
      input.style.opacity = '1';
      scanButtonText.textContent = 'Scan';
    }
  }

  async handleScan() {
    // THIS IS THE ONLY METHOD THAT SHOULD TRIGGER SCANNING
    // Called when user clicks the Scan button or presses Enter
    const input = document.getElementById('appIdInput');
    const scanAllToggle = document.getElementById('scanAllToggle');
    
    if (!input || !scanAllToggle) return;

    const scanAll = scanAllToggle.checked;

    if (scanAll) {
      // Scan all installed games
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
    } else {
      // Scan single APPID mode
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
  }

  setScanning(scanning) {
    this.isScanning = scanning;
    const scanButton = document.getElementById('scanButton');
    const input = document.getElementById('appIdInput');
    const scanAllToggle = document.getElementById('scanAllToggle');

    if (!scanButton || !input) return;

    if (scanning) {
      scanButton.disabled = true;
      input.disabled = true;
      if (scanAllToggle) scanAllToggle.disabled = true;
      scanButton.innerHTML = `
        <div class="spinner spinner-sm"></div>
        <span>Scanning...</span>
      `;
    } else {
      scanButton.disabled = false;
      if (scanAllToggle) {
        scanAllToggle.disabled = false;
        // Re-apply input state based on toggle
        if (scanAllToggle.checked) {
          input.disabled = true;
        } else {
          input.disabled = false;
        }
      } else {
        input.disabled = false;
      }
      scanButton.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <span>Scan</span>
      `;
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
    if (!button) return;

    if (this.outputDir) {
      button.style.background = 'rgba(139, 197, 63, 0.2)';
      button.style.borderColor = 'rgba(139, 197, 63, 0.3)';
      button.innerHTML = `
        <svg class="w-6 h-6" style="color: #8bc53f;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;
    }
  }

  getOutputDir() {
    return this.outputDir;
  }
}
