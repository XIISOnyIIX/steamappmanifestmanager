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
      <div class="max-w-4xl mx-auto">
        <div class="flex flex-col md:flex-row gap-4 items-stretch">
          <div class="flex-1">
            <div class="relative">
              <input 
                type="number" 
                id="appIdInput" 
                class="magic-input w-full text-lg"
                placeholder="Enter APPID (e.g., 480, 730, 570)"
                min="1"
              />
              <div class="absolute inset-0 -z-10 blur-xl opacity-0 transition-opacity duration-300 bg-primary-500/20" id="inputGlow"></div>
            </div>
          </div>
          
          <button 
            id="scanButton" 
            class="magic-button-primary min-w-[140px] px-8"
          >
            <span id="scanButtonText" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Scan
            </span>
          </button>

          <button 
            id="outputDirButton" 
            class="magic-button-secondary min-w-[180px] px-6"
            title="Select output directory"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
              <span id="outputDirText">Output Directory</span>
            </span>
          </button>
        </div>

        <div id="outputDirPath" class="hidden mt-3 text-sm text-gray-400 flex items-center gap-2 justify-center">
          <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span id="outputDirPathText"></span>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const input = document.getElementById('appIdInput');
    const scanButton = document.getElementById('scanButton');
    const outputDirButton = document.getElementById('outputDirButton');
    const inputGlow = document.getElementById('inputGlow');

    input.addEventListener('focus', () => {
      inputGlow.style.opacity = '1';
    });

    input.addEventListener('blur', () => {
      inputGlow.style.opacity = '0';
    });

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
      scanButtonText.innerHTML = `
        <div class="loading-spinner"></div>
        Scanning...
      `;
    } else {
      scanButton.disabled = false;
      scanButtonText.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        Scan
      `;
    }
  }

  async selectOutputDirectory() {
    const dir = await window.electronAPI.selectOutputDirectory();
    if (dir) {
      this.outputDir = dir;
      this.updateOutputDirDisplay();
      this.onOutputDirSelect(dir);
      toastManager.success('Output directory selected');
    }
  }

  updateOutputDirDisplay() {
    const pathContainer = document.getElementById('outputDirPath');
    const pathText = document.getElementById('outputDirPathText');
    const button = document.getElementById('outputDirButton');

    if (this.outputDir) {
      pathContainer.classList.remove('hidden');
      pathText.textContent = this.outputDir;
      button.classList.remove('magic-button-secondary');
      button.classList.add('magic-button-success');
    }
  }

  getOutputDir() {
    return this.outputDir;
  }
}
