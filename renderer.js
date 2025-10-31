class SteamManifestApp {
  constructor() {
    this.scanner = new SteamScanner();
    this.inputSection = null;
    this.codePreview = new CodePreview();
    this.scannedGames = new Map();
    this.outputDir = null;
  }

  async initialize() {
    toastManager.initialize();
    
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
    this.updateAllSaveButtons();
  }

  updateAllSaveButtons() {
    const cards = document.querySelectorAll('.aceternity-card');
    cards.forEach(card => {
      const saveBtn = card.querySelector('[id^="saveBtn-"]');
      if (saveBtn && !saveBtn.disabled) {
        saveBtn.disabled = !this.outputDir;
        if (this.outputDir) {
          saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
          saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
      }
    });
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
    loadingCard.className = 'aceternity-card animate-fade-in';
    loadingCard.dataset.appId = appId;
    loadingCard.dataset.loading = 'true';

    loadingCard.innerHTML = `
      <div class="p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="loading-spinner"></div>
          <div>
            <h3 class="text-lg font-semibold text-gray-100">Loading APPID ${appId}...</h3>
            <p class="text-sm text-gray-400">Fetching game information and scanning manifests</p>
          </div>
        </div>
        <div class="space-y-2">
          <div class="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div class="h-full bg-primary-500 shimmer-effect"></div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(loadingCard);
    return loadingCard;
  }

  replaceLoadingCard(loadingCard, gameData) {
    const gameCard = new GameCard(
      gameData,
      (data) => this.saveGameManifests(data),
      (data) => this.codePreview.show(data)
    );
    const newCard = gameCard.render();
    loadingCard.replaceWith(newCard);
  }

  replaceLoadingCardWithError(loadingCard, appId, errorMessage) {
    const errorCard = document.createElement('div');
    errorCard.className = 'aceternity-card border-red-500/50 animate-fade-in';
    errorCard.dataset.appId = appId;

    errorCard.innerHTML = `
      <div class="p-6 space-y-4">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-red-400">Error Loading APPID ${appId}</h3>
            <p class="text-gray-300 mt-1">${errorMessage}</p>
          </div>
        </div>
        <button 
          class="magic-button-secondary w-full"
          onclick="this.closest('.aceternity-card').remove(); if(document.getElementById('cardsContainer').children.length === 0) document.getElementById('emptyState').classList.remove('hidden');"
        >
          Remove
        </button>
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

    const result = await window.electronAPI.saveManifests({
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

  hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
      emptyState.classList.add('hidden');
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
