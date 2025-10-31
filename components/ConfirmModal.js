class ConfirmModal {
  constructor() {
    this.modal = null;
    this.resolveCallback = null;
  }

  initialize() {
    this.modal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('modalCancel');
    const confirmBtn = document.getElementById('modalConfirm');

    cancelBtn.addEventListener('click', () => {
      this.close(false);
    });

    confirmBtn.addEventListener('click', () => {
      this.close(true);
    });
  }

  show(title, message) {
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalMessage').textContent = message;
      this.modal.showModal();
    });
  }

  close(confirmed) {
    this.modal.close();
    if (this.resolveCallback) {
      this.resolveCallback(confirmed);
      this.resolveCallback = null;
    }
  }
}

const confirmModal = new ConfirmModal();
