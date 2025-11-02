class UpdateNotification {
  constructor() {
    this.notification = null;
    this.updateInfo = null;
    this.downloadProgress = 0;
  }

  initialize() {
    const { ipcRenderer } = require('electron');

    // Listen for update events from main process
    ipcRenderer.on('update-available', (event, info) => {
      this.updateInfo = info;
      this.showUpdateAvailable(info.version);
    });

    ipcRenderer.on('download-progress', (event, progress) => {
      this.updateDownloadProgress(progress);
    });

    ipcRenderer.on('update-downloaded', (event, info) => {
      this.showUpdateReady(info.version);
    });
  }

  showUpdateAvailable(version) {
    // Remove any existing notification
    this.remove();

    // Create notification banner
    this.notification = document.createElement('div');
    this.notification.id = 'updateNotification';
    this.notification.className = 'update-notification glass-strong animate-slide-down';
    this.notification.innerHTML = `
      <div class="update-notification-content">
        <div class="flex items-center gap-3">
          <div class="update-icon">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-slate-100">Update Available</p>
            <p class="text-sm text-slate-300">Version ${version} is ready to download</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-glass-sm" onclick="updateNotification.downloadUpdate()">
              Download
            </button>
            <button class="btn-glass-danger-sm" onclick="updateNotification.dismiss()">
              Later
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.notification);
  }

  async downloadUpdate() {
    try {
      const { ipcRenderer } = require('electron');
      
      // Update notification to show downloading state
      if (this.notification) {
        this.notification.innerHTML = `
          <div class="update-notification-content">
            <div class="flex items-center gap-3">
              <div class="update-icon">
                <div class="spinner spinner-sm"></div>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-slate-100">Downloading Update</p>
                <div class="mt-2">
                  <div class="w-full bg-slate-700 rounded-full h-2">
                    <div id="updateProgressBar" class="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all" style="width: 0%"></div>
                  </div>
                  <p class="text-xs text-slate-400 mt-1">
                    <span id="updateProgressText">0%</span>
                  </p>
                </div>
              </div>
              <button class="btn-glass-danger-sm" onclick="updateNotification.dismiss()">
                Hide
              </button>
            </div>
          </div>
        `;
      }

      const result = await ipcRenderer.invoke('download-update');
      
      if (!result.success) {
        toastManager.error(`Failed to download update: ${result.error}`);
        this.remove();
      }
    } catch (error) {
      console.error('Failed to download update:', error);
      toastManager.error('Failed to download update');
      this.remove();
    }
  }

  updateDownloadProgress(progress) {
    const progressBar = document.getElementById('updateProgressBar');
    const progressText = document.getElementById('updateProgressText');
    
    if (progressBar && progressText) {
      const percent = Math.round(progress.percent || 0);
      progressBar.style.width = `${percent}%`;
      
      const transferredMB = (progress.transferred / 1024 / 1024).toFixed(1);
      const totalMB = (progress.total / 1024 / 1024).toFixed(1);
      progressText.textContent = `${percent}% (${transferredMB} / ${totalMB} MB)`;
    }
  }

  showUpdateReady(version) {
    // Remove any existing notification
    this.remove();

    // Create notification banner
    this.notification = document.createElement('div');
    this.notification.id = 'updateNotification';
    this.notification.className = 'update-notification glass-strong animate-slide-down';
    this.notification.innerHTML = `
      <div class="update-notification-content">
        <div class="flex items-center gap-3">
          <div class="update-icon update-ready">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-slate-100">Update Ready</p>
            <p class="text-sm text-slate-300">Version ${version} is downloaded. Restart to install?</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-glass-sm" onclick="updateNotification.installUpdate()">
              Restart Now
            </button>
            <button class="btn-glass-danger-sm" onclick="updateNotification.dismiss()">
              Later
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.notification);
    
    // Also show a toast
    toastManager.success(`Update ${version} is ready to install!`);
  }

  async installUpdate() {
    try {
      const { ipcRenderer } = require('electron');
      
      const result = await ipcRenderer.invoke('install-update');
      
      if (!result.success) {
        toastManager.error(`Failed to install update: ${result.error}`);
      }
      // If successful, the app will restart automatically
    } catch (error) {
      console.error('Failed to install update:', error);
      toastManager.error('Failed to install update');
    }
  }

  dismiss() {
    if (this.notification) {
      this.notification.classList.add('animate-slide-up');
      setTimeout(() => {
        this.remove();
      }, 300);
    }
  }

  remove() {
    if (this.notification && this.notification.parentNode) {
      this.notification.parentNode.removeChild(this.notification);
      this.notification = null;
    }
  }
}

const updateNotification = new UpdateNotification();
