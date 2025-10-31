class ToastManager {
  constructor() {
    this.container = null;
  }

  initialize() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      console.warn('Toast container not found');
    }
  }

  show(message, type = 'info', duration = 3000) {
    if (!this.container) {
      console.error('Toast container not initialized');
      return;
    }

    const toast = document.createElement('div');
    toast.className = `toast-glass toast-${type}`;

    const icons = {
      info: '&#9432;',
      success: '&#10003;',
      error: '&#10006;',
      warning: '&#9888;',
    };

    toast.innerHTML = `
      <div class="toast-icon">
        <span class="text-2xl">${icons[type] || icons.info}</span>
      </div>
      <div class="flex-1">
        <p class="font-medium text-white">${this.getTitle(type)}</p>
        <p class="text-sm text-slate-300">${message}</p>
      </div>
      <button class="text-slate-400 hover:text-white transition-colors" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 400)">
        &times;
      </button>
      ${duration > 0 ? '<div class="toast-progress"></div>' : ''}
    `;

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentElement) {
          toast.classList.add('removing');
          setTimeout(() => {
            if (toast.parentElement) {
              toast.remove();
            }
          }, 400);
        }
      }, duration);
    }

    return toast;
  }

  getTitle(type) {
    const titles = {
      info: 'Info',
      success: 'Success!',
      error: 'Error',
      warning: 'Warning',
    };
    return titles[type] || 'Info';
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

const toastManager = new ToastManager();
