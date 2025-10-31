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
      <button class="text-slate-400 hover:text-white transition-colors" onclick="this.parentElement.remove()">
        &times;
      </button>
    `;

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
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
