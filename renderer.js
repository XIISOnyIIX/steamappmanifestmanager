// Global error handlers to prevent crashes
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  const errorDiv = document.createElement('div');
  errorDiv.className = 'glass-strong rounded-xl p-4 mb-4 border-2 border-red-500/50';
  errorDiv.innerHTML = `
    <div class="flex items-center gap-3">
      <svg class="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div>
        <p class="font-medium text-red-400">Critical Error</p>
        <p class="text-sm text-slate-300">${event.message || 'Unknown error occurred'}</p>
      </div>
    </div>
  `;
  document.body.insertBefore(errorDiv, document.body.firstChild);
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (typeof toastManager !== 'undefined' && toastManager.error) {
    toastManager.error('An error occurred: ' + (event.reason?.message || 'Unknown error'));
  }
  event.preventDefault();
});

class SteamManifestApp {
  constructor() {
    this.scanner = null;
    this.inputSection = null;
    this.scannedGames = new Map();
    this.outputDir = null;
    this.scanCancelled = false;
  }

  async initialize() {
    try {
      console.log('Initializing Steam Manifest App...');
      
      // Initialize toast manager
      if (typeof toastManager !== 'undefined') {
        toastManager.initialize();
        console.log('Toast manager initialized');
      }
      
      // Initialize confirm modal
      if (typeof confirmModal !== 'undefined') {
        confirmModal.initialize();
        console.log('Confirm modal initialized');
      }
      
      // Initialize input section
      if (typeof InputSection !== 'undefined') {
        this.inputSection = new InputSection(
          (appId) => this.scanAppId(appId),
          (dir) => this.setOutputDirectory(dir)
        );
        this.inputSection.render();
        console.log('Input section initialized');
      } else {
        throw new Error('InputSection component not loaded');
      }

      // Initialize Steam scanner
      if (typeof SteamScanner !== 'undefined') {
        this.scanner = new SteamScanner();
        await this.scanner.initialize();
        console.log('Steam scanner initialized');
        if (toastManager && toastManager.success) {
          toastManager.success('Steam installation detected');
        }
      } else {
        throw new Error('SteamScanner not loaded');
      }

      // Initialize cancel scan button
      const cancelBtn = document.getElementById('cancelScanBtn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this.cancelScan();
        });
      }

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError(`Failed to initialize: ${error.message}`);
      if (toastManager && toastManager.error) {
        toastManager.error(error.message);
      }
    }
  }

  cancelScan() {
    this.scanCancelled = true;
  }

  setOutputDirectory(dir) {
    this.outputDir = dir;
  }

  async scanAppId(appId) {
    if (this.scannedGames.has(appId)) {
      toastManager.warning(`APPID ${appId} has already been scanned`);
      return;
    }

    const loadingCard = this.addLoadingCard(appId);

    try {
      const gameInfo = await this.fetchGameInfo(appId);
      
      if (!gameInfo.success) {
        throw new Error(gameInfo.error || 'Failed to fetch game information');
      }

      const manifests = await this.scanner.scanManifestsForAppId(appId);

      const gameData = {
        appId,
        name: gameInfo.name,
        headerImage: gameInfo.headerImage,
        type: gameInfo.type,
        manifests,
      };

      this.scannedGames.set(appId, gameData);
      this.replaceLoadingCard(loadingCard, gameData);
      
      if (manifests.length === 0) {
        toastManager.warning(`No manifests found for ${gameInfo.name}`);
      } else {
        toastManager.success(`Found ${manifests.length} manifest(s) for ${gameInfo.name}`);
      }

      this.hideEmptyState();
    } catch (error) {
      console.error('Scan error:', error);
      this.replaceLoadingCardWithError(loadingCard, appId, error.message);
      toastManager.error(`Error scanning APPID ${appId}: ${error.message}`);
    }
  }

  async scanAllInstalledGames() {
    this.scanCancelled = false;
    
    // Show loading overlay
    this.showLoadingOverlay('Finding installed games...');

    try {
      // Find all installed games
      const games = await this.scanner.findAllInstalledGames();
      console.log(`Found ${games.length} installed games`);

      if (games.length === 0) {
        this.hideLoadingOverlay();
        toastManager.warning('No installed Steam games found');
        return;
      }

      // Update loading message
      this.updateLoadingMessage(`Scanning ${games.length} games...`);
      this.updateLoadingCount(0, games.length);

      // Scan each game with rate limiting
      let processed = 0;
      let successful = 0;
      let failed = 0;
      const batchSize = 5; // Process 5 at a time to avoid overwhelming Steam API

      for (let i = 0; i < games.length; i += batchSize) {
        if (this.scanCancelled) {
          this.hideLoadingOverlay();
          toastManager.info(`Scan cancelled. Processed ${processed} of ${games.length} games.`);
          return;
        }

        const batch = games.slice(i, i + batchSize);

        // Process batch in parallel
        await Promise.all(batch.map(async (game) => {
          try {
            // Skip if already scanned
            if (!this.scannedGames.has(game.appId)) {
              await this.scanGameByAppId(game.appId);
              successful++;
            }
          } catch (error) {
            console.error(`Failed to scan ${game.appId} (${game.name}):`, error);
            failed++;
          } finally {
            processed++;
            this.updateLoadingProgress(processed, games.length);
            this.updateLoadingCount(processed, games.length);
          }
        }));

        // Small delay between batches to respect rate limits
        if (i + batchSize < games.length && !this.scanCancelled) {
          await this.sleep(500);
        }
      }

      this.hideLoadingOverlay();
      toastManager.success(`Scan complete! Successfully scanned ${successful} games.${failed > 0 ? ` (${failed} failed)` : ''}`);

    } catch (error) {
      console.error('Failed to scan all games:', error);
      this.hideLoadingOverlay();
      toastManager.error(`Failed to scan installed games: ${error.message}`);
    }
  }

  async scanGameByAppId(appId) {
    try {
      const gameInfo = await this.fetchGameInfo(appId);
      
      if (!gameInfo.success) {
        throw new Error(gameInfo.error || 'Failed to fetch game information');
      }

      const manifests = await this.scanner.scanManifestsForAppId(appId);

      const gameData = {
        appId,
        name: gameInfo.name,
        headerImage: gameInfo.headerImage,
        type: gameInfo.type,
        manifests,
      };

      this.scannedGames.set(appId, gameData);
      
      // Create and add card immediately
      const gameCard = new GameCard(
        gameData,
        (data) => this.saveGameManifests(data),
        (id) => this.removeGame(id)
      );
      const newCard = gameCard.render();
      
      const container = document.getElementById('cardsGrid');
      if (container && newCard) {
        container.appendChild(newCard);
      }

      this.hideEmptyState();
    } catch (error) {
      console.error(`Error scanning APPID ${appId}:`, error);
      throw error;
    }
  }

  showLoadingOverlay(message) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingTitle = document.getElementById('loadingTitle');
    
    if (overlay) {
      overlay.classList.remove('hidden');
    }
    
    if (loadingTitle) {
      loadingTitle.textContent = message || 'Loading...';
    }
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
    this.scanCancelled = false;
  }

  updateLoadingMessage(message) {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
      loadingMessage.textContent = message;
    }
  }

  updateLoadingProgress(current, total) {
    const progress = document.getElementById('loadingProgress');
    if (progress) {
      const percentage = (current / total) * 100;
      progress.style.width = `${percentage}%`;
    }
  }

  updateLoadingCount(current, total) {
    const loadingCount = document.getElementById('loadingCount');
    if (loadingCount) {
      loadingCount.textContent = `${current} / ${total} games`;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchGameInfo(appId) {
    try {
      const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (!data[appId] || !data[appId].success) {
        return {
          success: false,
          error: 'Invalid APPID or game not found',
        };
      }

      const gameData = data[appId].data;
      return {
        success: true,
        name: gameData.name || 'Unknown Game',
        headerImage: gameData.header_image || '',
        type: gameData.type || 'game',
        appId: gameData.steam_appid || appId,
      };
    } catch (error) {
      console.error('Fetch game info error:', error);
      return {
        success: false,
        error: `Network error: ${error.message}`,
      };
    }
  }

  addLoadingCard(appId) {
    try {
      const container = document.getElementById('cardsGrid');
      if (!container) {
        throw new Error('Cards container not found');
      }

      const loadingCard = document.createElement('div');
      loadingCard.className = 'glass-strong rounded-xl p-6 animate-fade-in';
      loadingCard.dataset.appId = appId;
      loadingCard.dataset.loading = 'true';

      loadingCard.innerHTML = `
        <div class="skeleton-image shimmer"></div>
        <div class="skeleton-text shimmer"></div>
        <div class="skeleton-text shimmer short"></div>
        <div class="flex items-center gap-2 mt-4">
          <div class="spinner spinner-sm"></div>
          <span class="text-sm" style="color: #c7d5e0;">Scanning APPID ${appId}...</span>
        </div>
      `;

      container.appendChild(loadingCard);
      return loadingCard;
    } catch (error) {
      console.error('Error adding loading card:', error);
      toastManager.error('Failed to create loading card');
      return null;
    }
  }

  replaceLoadingCard(loadingCard, gameData) {
    try {
      if (!loadingCard) {
        throw new Error('Loading card not found');
      }

      const gameCard = new GameCard(
        gameData,
        (data) => this.saveGameManifests(data),
        (appId) => this.removeGame(appId)
      );
      const newCard = gameCard.render();
      
      if (newCard && loadingCard.parentNode) {
        loadingCard.replaceWith(newCard);
      }
    } catch (error) {
      console.error('Error replacing loading card:', error);
      toastManager.error('Failed to create game card');
      if (loadingCard && loadingCard.parentNode) {
        loadingCard.remove();
      }
    }
  }

  replaceLoadingCardWithError(loadingCard, appId, errorMessage) {
    try {
      if (!loadingCard) return;

      const errorCard = document.createElement('div');
      errorCard.className = 'glass-strong rounded-xl p-6 border-2 border-red-500/50 animate-fade-in';
      errorCard.dataset.appId = appId;

      errorCard.innerHTML = `
        <div class="flex items-start gap-3 mb-4">
          <svg class="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-red-400">Error Loading APPID ${appId}</h3>
            <p class="mt-1 text-slate-300">${this.escapeHtml(errorMessage)}</p>
          </div>
        </div>
        <div class="flex justify-end">
          <button 
            class="btn-glass-danger"
            onclick="this.closest('.glass-strong').remove(); if(document.getElementById('cardsGrid').children.length === 0) { document.getElementById('emptyState').classList.remove('hidden'); document.getElementById('cardsGrid').classList.add('hidden'); }"
          >
            Remove
          </button>
        </div>
      `;

      if (loadingCard.parentNode) {
        loadingCard.replaceWith(errorCard);
      }
    } catch (error) {
      console.error('Error creating error card:', error);
      if (loadingCard && loadingCard.parentNode) {
        loadingCard.remove();
      }
    }
  }

  async saveGameManifests(gameData) {
    if (!this.outputDir) {
      toastManager.error('Please select an output directory first');
      throw new Error('No output directory selected');
    }

    if (!gameData.manifests || gameData.manifests.length === 0) {
      throw new Error('No manifests to save');
    }

    try {
      const luaScript = this.scanner.generateLuaScript(gameData.appId, gameData.manifests);

      const { ipcRenderer } = require('electron');
      const result = await ipcRenderer.invoke('save-manifests', {
        outputDir: this.outputDir,
        gameName: gameData.name,
        manifests: gameData.manifests,
        luaScript,
        appId: gameData.appId,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Save manifests error:', error);
      throw error;
    }
  }

  removeGame(appId) {
    try {
      this.scannedGames.delete(appId);
      
      const container = document.getElementById('cardsGrid');
      if (container && container.children.length === 0) {
        this.showEmptyState();
      }
    } catch (error) {
      console.error('Error removing game:', error);
    }
  }

  hideEmptyState() {
    try {
      const emptyState = document.getElementById('emptyState');
      const cardsGrid = document.getElementById('cardsGrid');
      if (emptyState) {
        emptyState.classList.add('hidden');
      }
      if (cardsGrid) {
        cardsGrid.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error hiding empty state:', error);
    }
  }

  showEmptyState() {
    try {
      const emptyState = document.getElementById('emptyState');
      const cardsGrid = document.getElementById('cardsGrid');
      if (emptyState) {
        emptyState.classList.remove('hidden');
      }
      if (cardsGrid) {
        cardsGrid.classList.add('hidden');
      }
    } catch (error) {
      console.error('Error showing empty state:', error);
    }
  }

  showError(message) {
    try {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'glass-strong rounded-xl p-4 mb-4 border-2 border-red-500/50 mx-auto max-w-2xl';
      errorDiv.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-slate-300">${this.escapeHtml(message)}</p>
        </div>
      `;
      const main = document.querySelector('main');
      if (main) {
        main.insertBefore(errorDiv, main.firstChild);
      }
    } catch (error) {
      console.error('Error showing error message:', error);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Scroll reveal animations
const observeScrollAnimations = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  // Observe all cards
  document.querySelectorAll('.card-glass').forEach(card => {
    card.classList.add('scroll-reveal');
    observer.observe(card);
  });
};

// Re-observe when new cards are added
const originalAppendChild = Element.prototype.appendChild;
Element.prototype.appendChild = function(child) {
  const result = originalAppendChild.call(this, child);
  if (child && child.classList && child.classList.contains('card-glass')) {
    child.classList.add('scroll-reveal');
    setTimeout(() => {
      child.classList.add('visible');
    }, 100);
  }
  return result;
};

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('DOM loaded, initializing app...');
    app = new SteamManifestApp();
    await app.initialize();
    
    // Expose app globally for InputSection
    window.app = app;
    
    // Initialize scroll animations
    observeScrollAnimations();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    document.body.innerHTML += `
      <div class="glass-strong rounded-xl p-6 m-6 border-2 border-red-500/50">
        <h2 class="text-xl font-bold text-red-400 mb-2">Failed to Initialize</h2>
        <p class="text-slate-300 mb-4">${error.message || 'Unknown error'}</p>
        <p class="text-sm text-slate-400">Please check the console for more details or restart the application.</p>
      </div>
    `;
  }
});
