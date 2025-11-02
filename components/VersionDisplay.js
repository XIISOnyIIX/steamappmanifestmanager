class VersionDisplay {
  constructor() {
    this.appVersion = null;
    this.element = null;
  }

  async initialize() {
    try {
      // Get app version from main process
      const { ipcRenderer } = require('electron');
      this.appVersion = await ipcRenderer.invoke('get-app-version');
    } catch (error) {
      console.error('Failed to get app version:', error);
      this.appVersion = '1.0.1'; // Fallback
    }

    this.render();
  }

  render() {
    // Create version display element
    this.element = document.createElement('div');
    this.element.className = 'version-display';
    this.element.innerHTML = `
      <span class="version-text">v${this.appVersion}</span>
    `;

    // Add to body
    document.body.appendChild(this.element);
  }
}

const versionDisplay = new VersionDisplay();
