class AboutModal {
  constructor() {
    this.modal = null;
    this.appVersion = null;
  }

  async initialize() {
    // Get app version from main process
    try {
      const { ipcRenderer } = require('electron');
      this.appVersion = await ipcRenderer.invoke('get-app-version');
    } catch (error) {
      console.error('Failed to get app version:', error);
      this.appVersion = '1.0.0'; // Fallback
    }

    const container = document.getElementById('modalContainer');
    if (!container) {
      console.error('Modal container not found');
      return;
    }

    // Create the modal HTML
    const modalHTML = `
      <div id="aboutModal" class="about-modal-overlay hidden" onclick="if(event.target === this) aboutModal.close()">
        <div class="about-modal-content" onclick="event.stopPropagation()">
          <!-- Close Button -->
          <button class="about-modal-close" onclick="aboutModal.close()" title="Close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <!-- App Logo -->
          <div class="about-logo">
            <div class="about-logo-inner">
              <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          
          <!-- App Name -->
          <h2 class="about-title">Steam Manifest Scanner</h2>
          
          <!-- Version -->
          <div class="about-version">
            <span class="about-version-label">Version</span>
            <span class="about-version-number">${this.appVersion}</span>
          </div>
          
          <!-- Action Buttons -->
          <div class="about-buttons">
            <button class="about-button about-button-primary" onclick="aboutModal.viewPatchNotes()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>View Patch Notes</span>
            </button>
            
            <button class="about-button about-button-secondary" onclick="aboutModal.checkForUpdates()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>Check for Updates</span>
            </button>
          </div>
          
          <!-- Credits -->
          <div class="about-credits">
            Made with ❤️ by <span class="about-credits-author">XIISOnyIIX</span>
          </div>
        </div>
      </div>
    `;

    // Append modal to container (don't replace confirmModal)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    container.appendChild(tempDiv.firstElementChild);

    this.modal = document.getElementById('aboutModal');

    // Add ESC key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  show() {
    if (!this.modal) {
      console.error('About modal not initialized');
      return;
    }
    
    this.modal.classList.remove('hidden');
    // Force reflow to ensure animation plays
    void this.modal.offsetWidth;
    this.modal.classList.add('active');
  }

  close() {
    if (!this.modal) return;
    
    this.modal.classList.remove('active');
    // Wait for animation to complete before hiding
    setTimeout(() => {
      this.modal.classList.add('hidden');
    }, 300);
  }

  viewPatchNotes() {
    if (typeof patchNotesModal !== 'undefined') {
      patchNotesModal.show();
    } else {
      toastManager.error('Patch notes modal not loaded');
    }
  }

  async checkForUpdates() {
    try {
      const { ipcRenderer } = require('electron');
      
      // Get the check button and show loading state
      const checkBtn = document.querySelector('.about-button-secondary');
      if (checkBtn) {
        checkBtn.disabled = true;
        checkBtn.innerHTML = `
          <div class="spinner spinner-sm"></div>
          <span>Checking...</span>
        `;
      }

      const result = await ipcRenderer.invoke('check-for-updates');
      
      // Restore button state
      if (checkBtn) {
        checkBtn.disabled = false;
        checkBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Check for Updates</span>
        `;
      }

      if (result.available) {
        toastManager.info(`Update available: ${result.version}`);
      } else if (result.error) {
        toastManager.error(`Update check failed: ${result.error}`);
      } else {
        toastManager.success('You\'re up to date!');
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      toastManager.error('Failed to check for updates');
    }
  }
}

const aboutModal = new AboutModal();
