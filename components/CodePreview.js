class CodePreview {
  constructor() {
    this.currentCode = '';
    this.isVisible = false;
  }

  show(gameData) {
    this.isVisible = true;
    const panel = document.getElementById('codePreviewPanel');
    const container = document.getElementById('codePreview');
    
    if (!gameData || !gameData.manifests || gameData.manifests.length === 0) {
      panel.classList.add('hidden');
      return;
    }

    panel.classList.remove('hidden');

    const luaScript = this.generateLuaScript(gameData);
    this.currentCode = luaScript;

    container.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
          <h3 class="text-lg font-semibold text-gray-100">Lua Script Preview</h3>
          <span class="text-sm text-gray-400">- ${gameData.name}</span>
        </div>
        <div class="flex gap-2">
          <button 
            id="copyCodeBtn"
            class="magic-button-secondary text-sm px-4 py-2"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Copy
            </span>
          </button>
          <button 
            id="closePreviewBtn"
            class="magic-button-secondary text-sm px-3 py-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="code-block max-h-64 overflow-y-auto">
        <pre class="text-primary-300">${this.syntaxHighlight(luaScript)}</pre>
      </div>
    `;

    document.getElementById('copyCodeBtn').addEventListener('click', () => {
      this.copyToClipboard();
    });

    document.getElementById('closePreviewBtn').addEventListener('click', () => {
      this.hide();
    });
  }

  hide() {
    this.isVisible = false;
    const panel = document.getElementById('codePreviewPanel');
    panel.classList.add('hidden');
  }

  generateLuaScript(gameData) {
    let script = `addappid(${gameData.appId})\n`;
    
    for (const manifest of gameData.manifests) {
      script += `setManifestid(${gameData.appId},"${manifest.manifestId}")\n`;
      if (manifest.decryptionKey) {
        script += `setDecryptionKey(${gameData.appId},"${manifest.decryptionKey}")\n`;
      }
    }

    return script;
  }

  syntaxHighlight(code) {
    return code
      .replace(/addappid/g, '<span class="text-purple-400">addappid</span>')
      .replace(/setManifestid/g, '<span class="text-purple-400">setManifestid</span>')
      .replace(/setDecryptionKey/g, '<span class="text-purple-400">setDecryptionKey</span>')
      .replace(/(\d+)/g, '<span class="text-blue-400">$1</span>')
      .replace(/"([^"]+)"/g, '<span class="text-green-400">"$1"</span>');
  }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.currentCode);
      toastManager.success('Code copied to clipboard!');
      
      const btn = document.getElementById('copyCodeBtn');
      const originalContent = btn.innerHTML;
      btn.innerHTML = `
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Copied!
        </span>
      `;
      
      setTimeout(() => {
        btn.innerHTML = originalContent;
      }, 2000);
    } catch (error) {
      toastManager.error('Failed to copy code');
    }
  }

  update(gameData) {
    if (this.isVisible) {
      this.show(gameData);
    }
  }
}
