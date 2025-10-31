class SteamManifestApp {
  constructor() {
    this.scanner = new SteamScanner();
    this.inputSection = null;
    this.scannedGames = new Map();
    this.outputDir = null;
  }

  async initialize() {
    toastManager.initialize();
    confirmModal.initialize();
    
    this.inputSection = new InputSection(
      (appId) => this.scanAppId(appId),
      (dir) => this.setOutputDirectory(dir)
    );
    this.inputSection.render();

    try {
      await this.scanner.initialize();
      toastManager.success('Steam installation detected');
    } catch (error) {
      this.showError(`Failed to initialize Steam scanner: ${error.message}`);
      toastManager.error(error.message);
    }
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
      this.replaceLoadingCardWithError(loadingCard, appId, error.message);
      toastManager.error(`Error scanning APPID ${appId}: ${error.message}`);
    }
  }

  async fetchGameInfo(appId) {
    try {
      const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
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
        name: gameData.name,
        headerImage: gameData.header_image,
        type: gameData.type,
        appId: gameData.steam_appid,
      };
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error.message}`,
      };
    }
  }

  addLoadingCard(appId) {
    const container = document.getElementById('cardsContainer');
    const loadingCard = document.createElement('div');
    loadingCard.className = 'card bg-base-100 shadow-xl animate-fade-in';
    loadingCard.dataset.appId = appId;
    loadingCard.dataset.loading = 'true';

    loadingCard.innerHTML = `
      <div class="card-body">
        <div class="flex items-center gap-3">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <div>
            <h3 class="text-lg font-semibold">Loading APPID ${appId}...</h3>
            <p class="text-sm opacity-70">Fetching game information and scanning manifests</p>
          </div>
        </div>
        <progress class="progress progress-primary w-full"></progress>
      </div>
    `;

    container.appendChild(loadingCard);
    return loadingCard;
  }

  replaceLoadingCard(loadingCard, gameData) {
    const gameCard = new GameCard(
      gameData,
      (data) => this.saveGameManifests(data),
      (appId) => this.removeGame(appId)
    );
    const newCard = gameCard.render();
    loadingCard.replaceWith(newCard);
  }

  replaceLoadingCardWithError(loadingCard, appId, errorMessage) {
    const errorCard = document.createElement('div');
    errorCard.className = 'card bg-base-100 shadow-xl border-2 border-error animate-fade-in';
    errorCard.dataset.appId = appId;

    errorCard.innerHTML = `
      <div class="card-body">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-error">Error Loading APPID ${appId}</h3>
            <p class="mt-1 opacity-80">${errorMessage}</p>
          </div>
        </div>
        <div class="card-actions justify-end mt-4">
          <button 
            class="btn btn-error btn-sm"
            onclick="this.closest('.card').remove(); if(document.getElementById('cardsContainer').children.length === 0) document.getElementById('emptyState').classList.remove('hidden');"
          >
            Remove
          </button>
        </div>
      </div>
    `;

    loadingCard.replaceWith(errorCard);
  }

  async saveGameManifests(gameData) {
    if (!this.outputDir) {
      toastManager.error('Please select an output directory first');
      throw new Error('No output directory selected');
    }

    if (!gameData.manifests || gameData.manifests.length === 0) {
      throw new Error('No manifests to save');
    }

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
  }

  removeGame(appId) {
    this.scannedGames.delete(appId);
    
    const container = document.getElementById('cardsContainer');
    if (container.children.length === 0) {
      this.showEmptyState();
    }
  }

  hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
      emptyState.classList.add('hidden');
    }
  }

  showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
      emptyState.classList.remove('hidden');
    }
  }

  showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    errorContainer.classList.remove('hidden');
    errorMessage.textContent = message;
  }
}

let app;
document.addEventListener('DOMContentLoaded', async () => {
  app = new SteamManifestApp();
  await app.initialize();
});
