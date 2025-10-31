class InputSection {
  constructor(onScan, onOutputDirSelect) {
    this.onScan = onScan;
    this.onOutputDirSelect = onOutputDirSelect;
    this.outputDir = null;
    this.isScanning = false;
  }

  render() {
    const container = document.getElementById('inputSection');
    container.innerHTML = `
      <div class="flex gap-2">
        <input 
          type="number" 
          id="appIdInput" 
          class="input input-bordered input-primary w-48"
          placeholder="Enter APPID"
          min="1"
        />
        <button 
          id="scanButton" 
          class="btn btn-primary magic-btn magic-shimmer"
        >
          <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <span id="scanButtonText" class="relative z-10">Scan</span>
        </button>
        <button 
          id="outputDirButton" 
          class="btn btn-secondary magic-btn magic-glow-btn"
          title="Select output directory"
        >
          <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
          <span id="outputDirText" class="relative z-10">Output</span>
        </button>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const input = document.getElementById('appIdInput');
    const scanButton = document.getElementById('scanButton');
    const outputDirButton = document.getElementById('outputDirButton');

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
    const scanButtonText = document.getElementById('scanButtonText');

    if (scanning) {
      scanButton.disabled = true;
      scanButton.innerHTML = `
        <span class="loading loading-spinner relative z-10"></span>
        <span class="relative z-10">Scanning...</span>
      `;
    } else {
      scanButton.disabled = false;
      scanButton.innerHTML = `
        <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <span class="relative z-10">Scan</span>
      `;
    }
  }

  async selectOutputDirectory() {
    const { ipcRenderer } = require('electron');
    const dir = await ipcRenderer.invoke('select-output-directory');
    if (dir) {
      this.outputDir = dir;
      this.updateOutputDirDisplay();
      this.onOutputDirSelect(dir);
      toastManager.success('Output directory selected');
    }
  }

  updateOutputDirDisplay() {
    const button = document.getElementById('outputDirButton');
    const buttonText = document.getElementById('outputDirText');

    if (this.outputDir) {
      button.classList.remove('btn-secondary');
      button.classList.add('btn-success');
      buttonText.textContent = '✓ Output';
    }
  }

  getOutputDir() {
    return this.outputDir;
  }
}
