class GameCard {
  constructor(gameData, onSave, onRemove) {
    this.gameData = gameData;
    this.onSave = onSave;
    this.onRemove = onRemove;
    this.isSaving = false;
    this.saveCount = 0;
    this.lastSaved = null;
  }

  animateCount(element, start, end, duration = 600) {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      element.textContent = `${current} manifest${current !== 1 ? 's' : ''} found`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  createConfetti(button) {
    const colors = ['#66c0f4', '#8bc53f', '#c7d5e0'];
    const confettiCount = 15;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '6px';
      confetti.style.height = '6px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.left = '50%';
      confetti.style.top = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '1000';
      
      button.style.position = 'relative';
      button.appendChild(confetti);
      
      const angle = (Math.PI * 2 * i) / confettiCount;
      const velocity = 50 + Math.random() * 50;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      confetti.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }).onfinish = () => confetti.remove();
    }
  }

  render() {
    try {
      const card = document.createElement('div');
      card.className = 'card-glass group animate-fade-in';
      card.dataset.appId = this.gameData.appId;

      const manifestCount = this.gameData.manifests ? this.gameData.manifests.length : 0;

      card.innerHTML = `
        <!-- Header Image with overlay -->
        <div class="card-image-container relative overflow-hidden rounded-t-2xl">
          ${this.gameData.headerImage ? `
            <img 
              src="${this.escapeHtml(this.gameData.headerImage)}" 
              alt="${this.escapeHtml(this.gameData.name)}"
              class="card-image w-full h-48 object-cover"
              onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center\\'>Image not available</div>'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
          ` : `
            <div class="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <svg class="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          `}
          
          <!-- Floating badges -->
          <div class="absolute top-3 right-3 flex gap-2 z-10">
            <span class="badge-glass-cyan">
              APPID: ${this.gameData.appId}
            </span>
            ${this.saveCount > 0 ? `
              <span class="badge-glass-success">
                ✓ Saved
              </span>
            ` : ''}
          </div>
        </div>
        
        <!-- Card Content -->
        <div class="p-6 space-y-4">
          <!-- Game Title -->
          <h3 class="text-2xl font-bold text-gradient-white-cyan">
            ${this.escapeHtml(this.gameData.name)}
          </h3>
          
          <!-- Manifest Count -->
          <div class="flex items-center gap-2 text-sm text-slate-300">
            <div class="w-2 h-2 rounded-full animate-pulse" style="background-color: #66c0f4;"></div>
            <span id="count-${this.gameData.appId}">${manifestCount > 0 ? `${manifestCount} manifest${manifestCount !== 1 ? 's' : ''} found` : 'No manifests found'}</span>
          </div>
          
          ${manifestCount > 0 ? this.renderDepotDetails() : ''}

          ${this.lastSaved ? `
            <div class="text-xs text-slate-500 mt-2">
              Last saved: ${new Date(this.lastSaved).toLocaleString()}
            </div>
          ` : ''}

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            ${manifestCount > 0 ? `
              <button 
                id="saveBtn-${this.gameData.appId}"
                class="flex-1 btn-glass-success flex items-center justify-center gap-2"
              >
                <span>💾</span>
                <span>${this.saveCount > 0 ? 'Save Again' : 'Save'}</span>
              </button>
            ` : ''}
            <button 
              id="removeBtn-${this.gameData.appId}"
              class="btn-glass-danger flex items-center gap-2"
            >
              <span>🗑️</span>
            </button>
          </div>
        </div>
      `;

      this.attachEventListeners(card);
      
      // Animate manifest count
      if (manifestCount > 0) {
        setTimeout(() => {
          const countElement = card.querySelector(`#count-${this.gameData.appId}`);
          if (countElement) {
            this.animateCount(countElement, 0, manifestCount);
          }
        }, 100);
      }
      
      return card;
    } catch (error) {
      console.error('Error rendering game card:', error);
      if (toastManager && toastManager.error) {
        toastManager.error(`Failed to create card: ${error.message}`);
      }
      return this.renderErrorCard();
    }
  }

  renderErrorCard() {
    const card = document.createElement('div');
    card.className = 'glass-strong rounded-2xl p-6 border-2 border-red-500/50';
    card.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 class="text-lg font-semibold text-red-400">Error Creating Card</h3>
          <p class="text-sm text-slate-400">Failed to render game card. Please try again.</p>
        </div>
      </div>
    `;
    return card;
  }

  renderDepotDetails() {
    if (!this.gameData.manifests || this.gameData.manifests.length === 0) {
      return '';
    }

    try {
      const collapseId = `collapse-${this.gameData.appId}`;
      return `
        <div class="collapse-glass">
          <input type="checkbox" id="${collapseId}" class="depot-checkbox" />
          <label for="${collapseId}" class="collapse-header">
            <span class="font-medium text-cyan-400">Depot Details</span>
            <svg class="w-5 h-5 transition-transform duration-300" id="chevron-${this.gameData.appId}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </label>
          
          <div class="collapse-content" id="content-${this.gameData.appId}">
            <div class="space-y-2 p-4">
              ${this.gameData.manifests.map((manifest, index) => `
                <div class="depot-item glass p-3 rounded-lg space-y-1" style="animation-delay: ${0.1 + index * 0.1}s">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Depot ID:</span>
                    <span class="font-mono text-cyan-400">${this.escapeHtml(String(manifest.depotId))}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Manifest ID:</span>
                    <span class="font-mono text-purple-400">${this.escapeHtml(String(manifest.manifestId))}</span>
                  </div>
                  <div class="text-xs text-slate-500 font-mono truncate">
                    ${manifest.decryptionKey ? 
                      `Key: ${this.escapeHtml(manifest.decryptionKey.substring(0, 32))}...` : 
                      `<span class="text-yellow-400">⚠ No decryption key</span>`
                    }
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error rendering depot details:', error);
      return '<p class="text-sm text-red-400">Error loading depot details</p>';
    }
  }

  attachEventListeners(card) {
    try {
      const saveBtn = card.querySelector(`#saveBtn-${this.gameData.appId}`);
      const removeBtn = card.querySelector(`#removeBtn-${this.gameData.appId}`);
      const collapseCheckbox = card.querySelector(`#collapse-${this.gameData.appId}`);

      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.handleSave(card));
      }

      if (removeBtn) {
        removeBtn.addEventListener('click', () => this.handleRemove(card));
      }

      if (collapseCheckbox) {
        collapseCheckbox.addEventListener('change', (e) => {
          const content = card.querySelector(`#content-${this.gameData.appId}`);
          const chevron = card.querySelector(`#chevron-${this.gameData.appId}`);
          const collapseGlass = card.querySelector('.collapse-glass');
          
          if (e.target.checked) {
            if (collapseGlass) collapseGlass.classList.add('open');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
          } else {
            if (collapseGlass) collapseGlass.classList.remove('open');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
          }
        });
      }
    } catch (error) {
      console.error('Error attaching event listeners:', error);
    }
  }

  async handleSave(card) {
    if (this.isSaving) return;

    this.isSaving = true;
    const saveBtn = card.querySelector(`#saveBtn-${this.gameData.appId}`);
    
    if (!saveBtn) {
      this.isSaving = false;
      return;
    }

    const originalContent = saveBtn.innerHTML;
    
    try {
      saveBtn.innerHTML = `
        <div class="spinner spinner-sm"></div>
        <span>Saving...</span>
      `;
      saveBtn.disabled = true;

      await this.onSave(this.gameData);
      this.saveCount++;
      this.lastSaved = new Date();
      
      saveBtn.innerHTML = `
        <span>✓</span>
        <span>Saved!</span>
      `;
      saveBtn.classList.add('success');
      
      // Create confetti effect
      this.createConfetti(saveBtn);
      
      setTimeout(() => {
        if (saveBtn) {
          saveBtn.innerHTML = `
            <span>💾</span>
            <span>Save Again</span>
          `;
          saveBtn.classList.remove('success');
          saveBtn.disabled = false;
        }
      }, 2000);

      // Add saved badge if not present
      const badgesContainer = card.querySelector('.absolute.top-3.right-3');
      if (badgesContainer && !card.querySelector('.badge-glass-success')) {
        const savedBadge = document.createElement('span');
        savedBadge.className = 'badge-glass-success';
        savedBadge.textContent = '✓ Saved';
        badgesContainer.appendChild(savedBadge);
      }

      // Update or add last saved timestamp
      const cardContent = card.querySelector('.p-6');
      let lastSavedDiv = card.querySelector('.text-xs.text-slate-500');
      if (lastSavedDiv) {
        lastSavedDiv.textContent = `Last saved: ${new Date(this.lastSaved).toLocaleString()}`;
      } else if (cardContent) {
        lastSavedDiv = document.createElement('div');
        lastSavedDiv.className = 'text-xs text-slate-500 mt-2';
        lastSavedDiv.textContent = `Last saved: ${new Date(this.lastSaved).toLocaleString()}`;
        const actionsDiv = card.querySelector('.flex.gap-3.pt-4');
        if (actionsDiv) {
          cardContent.insertBefore(lastSavedDiv, actionsDiv);
        }
      }
      
      if (toastManager && toastManager.success) {
        toastManager.success(`Successfully saved manifests for ${this.gameData.name}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      if (toastManager && toastManager.error) {
        toastManager.error(`Failed to save: ${error.message}`);
      }
      if (saveBtn) {
        saveBtn.innerHTML = originalContent;
        saveBtn.disabled = false;
      }
    } finally {
      this.isSaving = false;
    }
  }

  async handleRemove(card) {
    try {
      if (typeof confirmModal !== 'undefined') {
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
            if (toastManager && toastManager.success) {
              toastManager.success(`Removed ${this.gameData.name} from list`);
            }
          }, 300);
        }
      } else {
        // Fallback if confirmModal is not available
        if (confirm(`Remove ${this.gameData.name} from the list?`)) {
          card.remove();
          if (this.onRemove) {
            this.onRemove(this.gameData.appId);
          }
        }
      }
    } catch (error) {
      console.error('Remove error:', error);
      if (toastManager && toastManager.error) {
        toastManager.error(`Failed to remove card: ${error.message}`);
      }
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
