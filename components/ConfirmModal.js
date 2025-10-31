class ConfirmModal {
  constructor() {
    this.modal = null;
    this.resolveCallback = null;
  }

  initialize() {
    const container = document.getElementById('modalContainer');
    if (!container) {
      console.warn('Modal container not found');
      return;
    }

    container.innerHTML = `
      <div id="confirmModal" class="modal-overlay hidden" onclick="if(event.target === this) confirmModal.close(false)">
        <div class="modal-content" onclick="event.stopPropagation()">
          <h3 class="text-2xl font-bold mb-4 text-gradient-cyan-purple" id="modalTitle">Confirm Action</h3>
          <p class="text-slate-300 mb-6" id="modalMessage"></p>
          <div class="flex gap-3 justify-end">
            <button class="btn-glass" id="modalCancel">Cancel</button>
            <button class="btn-glass-danger" id="modalConfirm">Confirm</button>
          </div>
        </div>
      </div>
    `;

    this.modal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('modalCancel');
    const confirmBtn = document.getElementById('modalConfirm');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.close(false);
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.close(true);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
        this.close(false);
      }
    });
  }

  show(title, message) {
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
      const titleEl = document.getElementById('modalTitle');
      const messageEl = document.getElementById('modalMessage');
      
      if (titleEl) titleEl.textContent = title;
      if (messageEl) messageEl.textContent = message;
      
      if (this.modal) {
        this.modal.classList.remove('hidden');
      }
    });
  }

  close(confirmed) {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
    if (this.resolveCallback) {
      this.resolveCallback(confirmed);
      this.resolveCallback = null;
    }
  }
}

const confirmModal = new ConfirmModal();
