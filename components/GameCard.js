class GameCard {
  constructor(gameData, onSave, onRemove) {
    this.gameData = gameData;
    this.onSave = onSave;
    this.onRemove = onRemove;
    this.isSaving = false;
    this.saveCount = 0;
    this.lastSaved = null;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in';
    card.dataset.appId = this.gameData.appId;

    const manifestCount = this.gameData.manifests ? this.gameData.manifests.length : 0;

    card.innerHTML = `
      <!-- Banner Image -->
      ${this.gameData.headerImage ? `
        <figure class="relative">
          <img 
            src="${this.gameData.headerImage}" 
            alt="${this.gameData.name}"
            class="w-full h-48 object-cover"
            onerror="this.parentElement.innerHTML='<div class=\\'w-full h-48 flex items-center justify-center bg-base-300\\'>Image not available</div>'"
          />
          ${this.saveCount > 0 ? `
            <div class="absolute top-3 right-3">
              <span class="badge badge-success gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            </div>
          ` : ''}
        </figure>
      ` : `
        <div class="w-full h-48 bg-base-300 flex items-center justify-center">
          <svg class="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
      `}
      
      <!-- Card Body -->
      <div class="card-body">
        <h2 class="card-title">
          ${this.gameData.name}
          <div class="badge badge-primary">APPID: ${this.gameData.appId}</div>
        </h2>
        
        <p class="text-sm opacity-70">
          ${manifestCount > 0 ? `${manifestCount} manifest${manifestCount !== 1 ? 's' : ''} found` : 'No manifests found'}
        </p>

        ${manifestCount > 0 ? this.renderDepotDetails() : ''}

        ${this.lastSaved ? `
          <div class="text-xs opacity-60 mt-2">
            Last saved: ${new Date(this.lastSaved).toLocaleString()}
          </div>
        ` : ''}

        <!-- Action Buttons -->
        <div class="card-actions justify-end mt-4">
          ${manifestCount > 0 ? `
            <button 
              id="saveBtn-${this.gameData.appId}"
              class="btn btn-success gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              ${this.saveCount > 0 ? 'Save Again' : 'Save'}
            </button>
          ` : ''}
          <button 
            id="removeBtn-${this.gameData.appId}"
            class="btn btn-error gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Remove
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners(card);
    return card;
  }

  renderDepotDetails() {
    if (!this.gameData.manifests || this.gameData.manifests.length === 0) {
      return '';
    }

    return `
      <div class="collapse collapse-arrow bg-base-200 mt-2">
        <input type="checkbox" id="collapse-${this.gameData.appId}" /> 
        <div class="collapse-title font-medium">
          Show Depot Details
        </div>
        <div class="collapse-content"> 
          <div class="overflow-x-auto">
            <table class="table table-xs table-zebra">
              <thead>
                <tr>
                  <th>Depot ID</th>
                  <th>Manifest ID</th>
                  <th>Decryption Key</th>
                </tr>
              </thead>
              <tbody>
                ${this.gameData.manifests.map(manifest => `
                  <tr>
                    <td class="font-mono text-xs">${manifest.depotId}</td>
                    <td class="font-mono text-xs">${manifest.manifestId}</td>
                    <td class="font-mono text-xs">
                      ${manifest.decryptionKey ? 
                        `<span class="text-success">${manifest.decryptionKey.substring(0, 16)}...</span>` : 
                        `<span class="text-warning">⚠ None</span>`
                      }
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners(card) {
    const saveBtn = card.querySelector(`#saveBtn-${this.gameData.appId}`);
    const removeBtn = card.querySelector(`#removeBtn-${this.gameData.appId}`);

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.handleSave(card));
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => this.handleRemove(card));
    }
  }

  async handleSave(card) {
    if (this.isSaving) return;

    this.isSaving = true;
    const saveBtn = card.querySelector(`#saveBtn-${this.gameData.appId}`);
    const originalContent = saveBtn.innerHTML;
    
    saveBtn.innerHTML = `
      <span class="loading loading-spinner"></span>
      Saving...
    `;
    saveBtn.disabled = true;

    try {
      await this.onSave(this.gameData);
      this.saveCount++;
      this.lastSaved = new Date();
      
      saveBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Saved!
      `;
      
      setTimeout(() => {
        saveBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
          Save Again
        `;
        saveBtn.disabled = false;
      }, 2000);

      const badge = card.querySelector('.badge-success');
      if (!badge) {
        const figure = card.querySelector('figure');
        if (figure) {
          figure.classList.add('relative');
          const badgeDiv = document.createElement('div');
          badgeDiv.className = 'absolute top-3 right-3';
          badgeDiv.innerHTML = `
            <span class="badge badge-success gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          `;
          figure.appendChild(badgeDiv);
        }
      }

      const lastSavedDiv = card.querySelector('.card-body > .text-xs.opacity-60');
      if (lastSavedDiv) {
        lastSavedDiv.textContent = `Last saved: ${new Date(this.lastSaved).toLocaleString()}`;
      } else {
        const cardActions = card.querySelector('.card-actions');
        const newDiv = document.createElement('div');
        newDiv.className = 'text-xs opacity-60 mt-2';
        newDiv.textContent = `Last saved: ${new Date(this.lastSaved).toLocaleString()}`;
        cardActions.parentElement.insertBefore(newDiv, cardActions);
      }
      
      toastManager.success(`Successfully saved manifests for ${this.gameData.name}`);
    } catch (error) {
      toastManager.error(`Failed to save: ${error.message}`);
      saveBtn.innerHTML = originalContent;
      saveBtn.disabled = false;
    } finally {
      this.isSaving = false;
    }
  }

  async handleRemove(card) {
    const confirmed = await confirmModal.show(
      'Remove Game?',
      `This will remove ${this.gameData.name} from the list. Any saved files will remain.`
    );

    if (confirmed) {
      card.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        card.remove();
        if (this.onRemove) {
          this.onRemove(this.gameData.appId);
        }
        toastManager.success(`Removed ${this.gameData.name} from list`);
      }, 300);
    }
  }
}
