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
      <!-- APPID Input -->
      <div class="input-wrapper glass relative">
        <input 
          type="number" 
          id="appIdInput" 
          placeholder="Enter APPID (e.g., 480, 730)"
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
        
        <!-- Dropdown Toggle (Right) - NO GAP -->
        <button id="scanDropdown" class="scan-dropdown-btn px-3 py-2 hover:bg-white/10 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        <!-- Dropdown Menu -->
        <div id="scanMenu" class="scan-dropdown-menu glass-strong hidden absolute top-full right-0 mt-2 rounded-lg overflow-hidden min-w-[220px] shadow-xl z-50" style="margin-top: 8px;">
          <button class="dropdown-item w-full px-4 py-3 text-left transition-colors flex items-center gap-3" style="cursor: pointer;">
            <span class="text-2xl">📚</span>
            <div>
              <div class="font-medium text-white">Scan All Installed Games</div>
              <div class="text-xs text-slate-400">Find all Steam games</div>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Output Directory Picker -->
      <button id="outputDirButton" class="glass p-2 rounded-lg transition-all hover:scale-105" style="color: #66c0f4;" title="Select output directory">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
        </svg>
      </button>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    console.log('=== DROPDOWN DEBUG START ===');
    
    const input = document.getElementById('appIdInput');
    const scanButton = document.getElementById('scanButton');
    const outputDirButton = document.getElementById('outputDirButton');
    const scanDropdown = document.getElementById('scanDropdown');
    const scanMenu = document.getElementById('scanMenu');
    const dropdownItem = document.querySelector('.scan-dropdown-menu .dropdown-item');

    // Debug: Check if elements exist
    console.log('🔍 Element check:');
    console.log('  - input exists?', !!input);
    console.log('  - scanButton exists?', !!scanButton);
    console.log('  - outputDirButton exists?', !!outputDirButton);
    console.log('  - scanDropdown exists?', !!scanDropdown);
    console.log('  - scanMenu exists?', !!scanMenu);
    console.log('  - dropdownItem exists?', !!dropdownItem);

    if (!input || !scanButton || !outputDirButton || !scanDropdown || !scanMenu) {
      console.error('❌ Input section elements not found!');
      console.error('Missing elements:', {
        input: !input,
        scanButton: !scanButton,
        outputDirButton: !outputDirButton,
        scanDropdown: !scanDropdown,
        scanMenu: !scanMenu
      });
      return;
    }

    if (scanMenu) {
      console.log('📊 Menu initial state:');
      console.log('  - classList:', scanMenu.classList.toString());
      console.log('  - display style:', window.getComputedStyle(scanMenu).display);
      console.log('  - position:', window.getComputedStyle(scanMenu).position);
      console.log('  - zIndex:', window.getComputedStyle(scanMenu).zIndex);
    }

    console.log('🔧 Attaching event listeners...');

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
      console.log('🚨 DROPDOWN BUTTON CLICKED!');
      console.log('  - Event target:', e.target);
      console.log('  - Current target:', e.currentTarget);
      
      e.preventDefault();
      e.stopPropagation();
      
      if (scanMenu) {
        const isHidden = scanMenu.classList.contains('hidden');
        console.log('  - Menu currently hidden?', isHidden);
        console.log('  - Menu classList before toggle:', scanMenu.classList.toString());
        
        scanMenu.classList.toggle('hidden');
        
        console.log('  - Menu classList after toggle:', scanMenu.classList.toString());
        console.log('  - Menu hidden after toggle?', scanMenu.classList.contains('hidden'));
        console.log('  - Menu display style:', window.getComputedStyle(scanMenu).display);
        console.log('  - Menu visibility:', window.getComputedStyle(scanMenu).visibility);
        console.log('  - Menu opacity:', window.getComputedStyle(scanMenu).opacity);
        
        // Add active class when dropdown is open
        if (isHidden) {
          scanDropdown.classList.add('active');
          console.log('  - Added "active" class to dropdown button');
        } else {
          scanDropdown.classList.remove('active');
          console.log('  - Removed "active" class from dropdown button');
        }
        
        // Get menu position info
        const rect = scanMenu.getBoundingClientRect();
        console.log('  - Menu position:', {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        });
      } else {
        console.error('❌ scanMenu element not found in click handler!');
      }
      
      console.log('✅ Click handler completed');
    });

    console.log('✅ Dropdown click listener attached');

    // Close menu when clicking outside (use capture phase to ensure it doesn't interfere)
    const closeMenuHandler = (e) => {
      // Check if click is outside both menu and button
      if (!scanMenu.contains(e.target) && !scanDropdown.contains(e.target)) {
        if (!scanMenu.classList.contains('hidden')) {
          console.log('🔴 Click outside detected - closing menu');
          scanMenu.classList.add('hidden');
          scanDropdown.classList.remove('active');
        }
      }
    };
    
    // Use setTimeout to avoid immediate closure on the same click that opened it
    setTimeout(() => {
      document.addEventListener('click', closeMenuHandler);
      console.log('✅ Document click listener attached (delayed)');
    }, 0);

    console.log('✅ Document click listener will be attached');

    // Dropdown menu item - scan all installed games
    if (dropdownItem) {
      dropdownItem.addEventListener('click', async () => {
        console.log('📚 Scan All menu item clicked');
        
        // Close dropdown
        scanMenu.classList.add('hidden');
        scanDropdown.classList.remove('active');
        
        // Confirm action
        const confirmed = await confirmModal.show(
          'Scan All Installed Games?',
          'This will scan all games currently installed on Steam. This may take a few minutes for large libraries.'
        );
        
        if (!confirmed) {
          console.log('User cancelled scan all');
          return;
        }
        
        console.log('User confirmed - starting scan all');
        // Call scan all method
        this.handleScanAll();
      });
      console.log('✅ Dropdown menu item listener attached');
    } else {
      console.warn('⚠️ No dropdown item found - scan all will not work');
    }

    // Output directory button
    outputDirButton.addEventListener('click', async () => {
      await this.selectOutputDirectory();
    });

    console.log('=== DROPDOWN DEBUG END ===');
    console.log('✅ All event listeners attached successfully');
    
    // Add global test function for debugging
    window.testDropdownMenu = () => {
      console.log('🧪 TESTING DROPDOWN MENU');
      const menu = document.getElementById('scanMenu');
      if (menu) {
        console.log('Menu found - forcing visible');
        menu.classList.remove('hidden');
        menu.style.display = 'block';
        menu.style.position = 'absolute';
        menu.style.zIndex = '9999';
        menu.style.background = 'rgba(255, 0, 0, 0.9)';
        menu.style.color = 'white';
        menu.style.padding = '20px';
        menu.style.border = '3px solid yellow';
        console.log('✅ Menu should now be visible with red background');
        console.log('Menu position:', menu.getBoundingClientRect());
      } else {
        console.error('❌ Menu element does not exist in DOM!');
      }
    };
    console.log('💡 Test function available: window.testDropdownMenu()');
  }

  async handleScan() {
    // Scan single APPID
    console.log('🔍 handleScan called - User initiated scan');
    
    // GUARD: Prevent scanning during initialization
    if (window.app && window.app.isInitializing) {
      console.warn('⚠️ BLOCKED: Cannot scan during initialization');
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
    console.log('🔍 handleScanAll called - User initiated scan all');
    
    // GUARD: Prevent scanning during initialization
    if (window.app && window.app.isInitializing) {
      console.warn('⚠️ BLOCKED: Cannot scan during initialization');
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
