class GameCard {
  constructor(gameData, onSave, onHover) {
    this.gameData = gameData;
    this.onSave = onSave;
    this.onHover = onHover;
    this.isSaving = false;
    this.isSaved = false;
    this.isExpanded = false;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'aceternity-card animate-fade-in';
    card.dataset.appId = this.gameData.appId;

    const statusBadge = this.getStatusBadge();
    const manifestCount = this.gameData.manifests ? this.gameData.manifests.length : 0;

    card.innerHTML = `
      <div class="relative">
        ${this.gameData.headerImage ? `
          <div class="w-full h-48 overflow-hidden bg-dark-900">
            <img 
              src="${this.gameData.headerImage}" 
              alt="${this.gameData.name}"
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center text-gray-600\\'>Image not available</div>'"
            />
          </div>
        ` : `
          <div class="w-full h-48 bg-dark-900 flex items-center justify-center">
            <svg class="w-16 h-16 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
        `}
        
        <div class="absolute top-3 right-3">
          ${statusBadge}
        </div>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="text-xl font-bold text-gray-100 leading-tight">${this.gameData.name}</h3>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge-primary">APPID: ${this.gameData.appId}</span>
            ${manifestCount > 0 ? `
              <span class="badge-success">${manifestCount} manifest${manifestCount !== 1 ? 's' : ''} found</span>
            ` : `
              <span class="badge-warning">No manifests found</span>
            `}
          </div>
        </div>

        ${manifestCount > 0 ? `
          <div>
            <button 
              class="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
              onclick="document.getElementById('manifests-${this.gameData.appId}').classList.toggle('open'); this.querySelector('svg').classList.toggle('rotate-180')"
            >
              <svg class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
              Show Depot Details
            </button>
            <div id="manifests-${this.gameData.appId}" class="collapsible-content mt-2 space-y-2">
              ${this.renderManifestList()}
            </div>
          </div>
        ` : ''}

        <div class="flex gap-2">
          <button 
            id="saveBtn-${this.gameData.appId}"
            class="magic-button-primary flex-1 ${manifestCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
            ${manifestCount === 0 ? 'disabled' : ''}
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              Save
            </span>
          </button>
          
          <button 
            class="magic-button-secondary"
            onclick="this.closest('.aceternity-card').querySelector('.collapsible-content')?.classList.toggle('open')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    if (manifestCount > 0) {
      const saveBtn = card.querySelector(`#saveBtn-${this.gameData.appId}`);
      saveBtn.addEventListener('click', () => this.handleSave());

      card.addEventListener('mouseenter', () => {
        if (this.onHover) {
          this.onHover(this.gameData);
        }
      });
    }

    return card;
  }

  renderManifestList() {
    if (!this.gameData.manifests || this.gameData.manifests.length === 0) {
      return '';
    }

    return this.gameData.manifests.map(manifest => `
      <div class="bg-dark-900 rounded p-3 text-xs space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-gray-400">Depot ID:</span>
          <span class="text-primary-300 font-mono">${manifest.depotId}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-400">Manifest ID:</span>
          <span class="text-primary-300 font-mono">${manifest.manifestId}</span>
        </div>
        ${manifest.decryptionKey ? `
          <div class="flex items-center gap-2">
            <span class="text-gray-400">Decryption Key:</span>
            <span class="text-green-300 font-mono text-[10px]">${manifest.decryptionKey.substring(0, 16)}...</span>
          </div>
        ` : `
          <div class="flex items-center gap-2">
            <span class="text-yellow-400 text-xs">⚠ No decryption key found</span>
          </div>
        `}
      </div>
    `).join('');
  }

  getStatusBadge() {
    if (this.gameData.error) {
      return '<span class="badge-error">Error</span>';
    }
    if (this.gameData.loading) {
      return '<span class="badge-primary">Loading...</span>';
    }
    if (this.isSaved) {
      return '<span class="badge-success">✓ Saved</span>';
    }
    return '';
  }

  async handleSave() {
    if (this.isSaving || this.isSaved) return;

    this.isSaving = true;
    const saveBtn = document.querySelector(`#saveBtn-${this.gameData.appId}`);
    const originalContent = saveBtn.innerHTML;
    
    saveBtn.innerHTML = `
      <span class="flex items-center justify-center gap-2">
        <div class="loading-spinner"></div>
        Saving...
      </span>
    `;
    saveBtn.disabled = true;

    try {
      await this.onSave(this.gameData);
      this.isSaved = true;
      
      saveBtn.innerHTML = `
        <span class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Saved
        </span>
      `;
      saveBtn.classList.remove('magic-button-primary');
      saveBtn.classList.add('magic-button-success');
      
      const card = saveBtn.closest('.aceternity-card');
      const badge = card.querySelector('.absolute.top-3.right-3');
      badge.innerHTML = '<span class="badge-success">✓ Saved</span>';
      
      toastManager.success(`Successfully saved manifests for ${this.gameData.name}`);
    } catch (error) {
      toastManager.error(`Failed to save: ${error.message}`);
      saveBtn.innerHTML = originalContent;
      saveBtn.disabled = false;
    } finally {
      this.isSaving = false;
    }
  }
}
