class PatchNotesModal {
  constructor() {
    this.modal = null;
  }

  initialize() {
    const container = document.getElementById('modalContainer');
    if (!container) {
      console.error('Modal container not found');
      return;
    }

    // Create the modal HTML
    const modalHTML = `
      <div id="patchNotesModal" class="about-modal-overlay patch-notes-modal hidden" onclick="if(event.target === this) patchNotesModal.close()">
        <div class="about-modal-content patch-notes-content" onclick="event.stopPropagation()">
          <!-- Close Button -->
          <button class="about-modal-close" onclick="patchNotesModal.close()" title="Close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <!-- Content (populated dynamically) -->
          <div id="patchNotesContent">
            <!-- Loaded dynamically -->
          </div>
        </div>
      </div>
    `;

    // Append modal to container
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    container.appendChild(tempDiv.firstElementChild);

    this.modal = document.getElementById('patchNotesModal');

    // Add ESC key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  async show() {
    if (!this.modal) {
      console.error('Patch notes modal not initialized');
      return;
    }

    const contentDiv = document.getElementById('patchNotesContent');
    
    // Show loading state
    contentDiv.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <div class="spinner spinner-lg mb-4"></div>
        <p class="text-slate-300">Loading patch notes...</p>
      </div>
    `;

    this.modal.classList.remove('hidden');
    void this.modal.offsetWidth;
    this.modal.classList.add('active');

    // Fetch patch notes from GitHub
    try {
      const response = await fetch('https://api.github.com/repos/XIISOnyIIX/steamappmanifestmanager/releases/latest');
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('NO_RELEASES');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const release = await response.json();
      
      // Parse the release date
      const releaseDate = new Date(release.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Convert markdown-style formatting to HTML (basic)
      const formattedBody = this.formatMarkdown(release.body || 'No release notes available.');

      contentDiv.innerHTML = `
        <div class="patch-notes-header">
          <div class="flex items-center gap-3 mb-2">
            <svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <div>
              <h2 class="text-2xl font-bold text-gradient-cyan-purple">Patch Notes</h2>
            </div>
          </div>
          <div class="flex items-center gap-4 text-sm text-slate-400">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              <strong>Version:</strong> ${release.tag_name}
            </span>
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <strong>Released:</strong> ${releaseDate}
            </span>
          </div>
        </div>
        <div class="patch-notes-body">
          ${formattedBody}
        </div>
      `;

    } catch (error) {
      console.error('Error fetching patch notes:', error);
      
      // Handle 404 specifically with a friendly message
      if (error.message === 'NO_RELEASES') {
        contentDiv.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12">
            <div class="relative mb-6">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                <svg class="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-pulse">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-2xl font-bold text-gradient-cyan-purple mb-3">No Releases Yet</h3>
            <p class="text-slate-300 text-center max-w-md mb-2">This is the first version of the app!</p>
            <p class="text-slate-400 text-center text-sm">Check back soon for updates and patch notes.</p>
          </div>
        `;
      } else {
        // Show error message for other errors
        contentDiv.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12">
            <svg class="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-xl font-semibold text-red-400 mb-2">Failed to Load Patch Notes</h3>
            <p class="text-slate-300 text-center max-w-md mb-4">${this.escapeHtml(error.message)}</p>
            <button class="btn-glass" onclick="patchNotesModal.show()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>Retry</span>
            </button>
          </div>
        `;
      }
    }
  }

  formatMarkdown(text) {
    // Basic markdown formatting
    let formatted = this.escapeHtml(text);
    
    // Headers
    formatted = formatted.replace(/^### (.+)$/gm, '<h4 class="text-lg font-semibold text-cyan-400 mt-4 mb-2">$1</h4>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h3 class="text-xl font-semibold text-cyan-400 mt-6 mb-3">$1</h3>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h2 class="text-2xl font-bold text-cyan-400 mt-8 mb-4">$1</h2>');
    
    // Bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-200">$1</strong>');
    formatted = formatted.replace(/__(.+?)__/g, '<strong class="font-semibold text-slate-200">$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    formatted = formatted.replace(/_(.+?)_/g, '<em class="italic">$1</em>');
    
    // Code blocks
    formatted = formatted.replace(/```(.+?)```/gs, '<pre class="bg-slate-900/50 rounded-lg p-4 my-3 overflow-x-auto"><code>$1</code></pre>');
    
    // Inline code
    formatted = formatted.replace(/`(.+?)`/g, '<code class="bg-slate-900/50 px-2 py-1 rounded text-cyan-400">$1</code>');
    
    // Lists
    formatted = formatted.replace(/^[\*\-\+] (.+)$/gm, '<li class="ml-4">• $1</li>');
    formatted = formatted.replace(/(<li.+<\/li>)/s, '<ul class="my-2 space-y-1 text-slate-300">$1</ul>');
    
    // Links
    formatted = formatted.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Line breaks
    formatted = formatted.replace(/\n\n/g, '</p><p class="mb-3 text-slate-300">');
    formatted = '<p class="mb-3 text-slate-300">' + formatted + '</p>';
    
    return formatted;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  close() {
    if (!this.modal) return;
    
    this.modal.classList.remove('active');
    setTimeout(() => {
      this.modal.classList.add('hidden');
    }, 300);
  }
}

const patchNotesModal = new PatchNotesModal();
