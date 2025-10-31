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
      <div class="glass relative">
        <input 
          type="number" 
          id="appIdInput" 
          placeholder="Enter APPID"
          class="input-glass w-48"
          min="1"
        />
        <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
      </div>
      
      <button id="scanButton" class="btn-glass flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <span id="scanButtonText">Scan</span>
      </button>
      
      <button id="outputDirButton" class="glass p-2 rounded-lg hover:bg-white/10 transition-all hover:scale-105" title="Select output directory">
        <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    if (!input || !scanButton || !outputDirButton) {
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
  }

  async handleScan() {
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

  setScanning(scanning) {
    this.isScanning = scanning;
    const scanButton = document.getElementById('scanButton');
    const input = document.getElementById('appIdInput');

    if (!scanButton || !input) return;

    if (scanning) {
      scanButton.disabled = true;
      input.disabled = true;
      scanButton.innerHTML = `
        <div class="spinner spinner-sm"></div>
        <span>Scanning...</span>
      `;
    } else {
      scanButton.disabled = false;
      input.disabled = false;
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
      button.classList.add('bg-green-500/20', 'border-green-500/30');
      button.innerHTML = `
        <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;
    }
  }

  getOutputDir() {
    return this.outputDir;
  }
}
