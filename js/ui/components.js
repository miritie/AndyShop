/**
 * Composants UI réutilisables
 */

window.UIComponents = {
  /**
   * Affiche un toast (notification)
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: Constants.Icons.CHECK,
      error: Constants.Icons.ALERT,
      warning: Constants.Icons.ALERT,
      info: Constants.Icons.INFO
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, Constants.Rules.TOAST_DURATION);
  },

  /**
   * Affiche une modale
   */
  showModal(title, content, actions = []) {
    const container = document.getElementById('modal-container');
    container.innerHTML = `
      <div class="modal-backdrop" onclick="UIComponents.closeModal()"></div>
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-close" onclick="UIComponents.closeModal()">
            ${Constants.Icons.CLOSE}
          </button>
        </div>
        <div class="modal-body">${content}</div>
        ${actions.length > 0 ? `
          <div class="modal-footer btn-group">
            ${actions.map(a => `<button class="btn ${a.class || 'btn-primary'}" onclick="${a.onclick}">${a.label}</button>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
    container.classList.add('active');
  },

  /**
   * Ferme la modale
   */
  closeModal() {
    const container = document.getElementById('modal-container');
    container.classList.remove('active');
    setTimeout(() => container.innerHTML = '', 300);
  },

  /**
   * Affiche un loader
   */
  showLoader(message = 'Chargement...') {
    return `<div class="loader"><div class="loader-spinner"></div><p>${message}</p></div>`;
  }
};
