/**
 * Écran Encaisser Paiement
 * Permet d'enregistrer un paiement pour un client ayant des dettes
 */

window.PaiementScreen = async () => {
  const clients = await ClientModel.getClientsWithDettes();
  
  if (clients.length === 0) {
    return `
      <h2>Encaisser un paiement</h2>
      <div class="empty-state">
        <p>Aucun client avec des dettes en attente</p>
        <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-top: var(--spacing-sm);">
          Les paiements apparaîtront ici quand des clients auront des montants dus
        </p>
      </div>
    `;
  }

  return `
    <h2>Encaisser un paiement</h2>
    <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-md);">
      Sélectionnez un client pour enregistrer un paiement
    </p>

    <div class="list">
      ${"${"}clients.map(c => renderClientItem(c)).join('')}
    </div>
  `;
};

function renderClientItem(client) {
  const initial = client.nom_complet ? client.nom_complet[0].toUpperCase() : '?';
  const nomEscaped = client.nom_complet.replace(/'/g, "\\'");
  
  return `
    <div class="list-item list-item-clickable" onclick="PaiementActions.showPaiementModal('${"${"}client.id}', '${"${"}nomEscaped}', ${"${"}client.solde_du})">
      <div class="list-item-avatar">${"${"}initial}</div>
      <div class="list-item-content">
        <div class="list-item-title">${"${"}client.nom_complet}</div>
        <div class="list-item-subtitle">
          ${"${"}client.telephone || 'Pas de téléphone'}
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 600; color: var(--color-error); font-size: 1.1rem;">
          ${"${"}Helpers.formatCurrency(client.solde_du)}
        </div>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary);">
          à encaisser
        </div>
      </div>
    </div>
  `;
}

window.PaiementActions = {
  capturedPhotoUrl: null,

  async capturePhoto() {
    try {
      UIComponents.showToast('Ouverture de la caméra...', 'info');

      // Capturer et uploader la photo
      const url = await GoogleDriveService.captureAndUpload();

      // Sauvegarder l'URL
      this.capturedPhotoUrl = url;

      // Afficher l'aperçu
      const previewDiv = document.getElementById('paiement-preuve-preview');
      const previewImg = document.getElementById('paiement-preuve-img');
      const inputUrl = document.getElementById('paiement-preuve');

      previewImg.src = url;
      previewDiv.style.display = 'block';
      inputUrl.style.display = 'none';

      UIComponents.showToast('Photo capturée et uploadée avec succès', 'success');

    } catch (error) {
      console.error('Erreur capture photo:', error);

      if (error.message === 'Capture annulée') {
        return; // Pas de message d'erreur
      }

      UIComponents.showToast('Erreur: ' + error.message, 'error');
    }
  },

  toggleManualUrl() {
    const inputUrl = document.getElementById('paiement-preuve');
    const previewDiv = document.getElementById('paiement-preuve-preview');

    if (inputUrl.style.display === 'none') {
      inputUrl.style.display = 'block';
      previewDiv.style.display = 'none';
      this.capturedPhotoUrl = null;
      inputUrl.focus();
    } else {
      inputUrl.style.display = 'none';
      inputUrl.value = '';
    }
  },

  removePhoto() {
    this.capturedPhotoUrl = null;
    const previewDiv = document.getElementById('paiement-preuve-preview');
    const inputUrl = document.getElementById('paiement-preuve');

    previewDiv.style.display = 'none';
    inputUrl.style.display = 'none';
    inputUrl.value = '';
  },

  showPaiementModal(clientId, clientNom, soldeDu) {
    UIComponents.showModal(
      'Encaisser paiement',
      `
        <div class="form-group">
          <label>Client</label>
          <div class="form-input" style="background: var(--color-bg-secondary); cursor: not-allowed;" disabled>
            ${"${"}clientNom}
          </div>
        </div>

        <div class="form-group">
          <label>Montant dû</label>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-error); padding: var(--spacing-sm) 0;">
            ${"${"}Helpers.formatCurrency(soldeDu)}
          </div>
        </div>

        <div class="form-group">
          <label for="paiement-montant">Montant reçu * (XOF)</label>
          <input 
            type="number" 
            id="paiement-montant" 
            class="form-input" 
            placeholder="Montant encaissé"
            min="0"
            max="${"${"}soldeDu}"
            required 
          />
          <small class="form-hint">
            Maximum: ${"${"}Helpers.formatCurrency(soldeDu)}
          </small>
        </div>

        <div class="form-group">
          <label for="paiement-mode">Mode de paiement *</label>
          <select id="paiement-mode" class="form-input">
            ${"${"}Object.values(Constants.ModesPaiement).map(mode => `
              <option value="${"${"}mode}">${"${"}mode}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="paiement-preuve">Preuve de paiement</label>
          <div style="display: flex; gap: var(--spacing-sm);">
            <button
              type="button"
              class="btn btn-secondary"
              style="flex: 1;"
              onclick="PaiementActions.capturePhoto()"
            >
              📷 Prendre une photo
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              style="flex: 1;"
              onclick="PaiementActions.toggleManualUrl()"
            >
              🔗 Saisir un lien
            </button>
          </div>
          <input
            type="url"
            id="paiement-preuve"
            class="form-input"
            placeholder="https://drive.google.com/file/d/..."
            style="display: none; margin-top: var(--spacing-sm);"
          />
          <div id="paiement-preuve-preview" style="display: none; margin-top: var(--spacing-sm);">
            <img id="paiement-preuve-img" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 2px solid var(--color-border);" />
            <div style="margin-top: var(--spacing-xs); font-size: 0.875rem; color: var(--color-success);">
              ✓ Photo capturée
              <button type="button" onclick="PaiementActions.removePhoto()" style="margin-left: var(--spacing-xs); color: var(--color-error); background: none; border: none; cursor: pointer; text-decoration: underline;">
                Supprimer
              </button>
            </div>
          </div>
          <small class="form-hint">
            Optionnel: Photo de la preuve du paiement
          </small>
        </div>

        <div class="form-group">
          <label for="paiement-notes">Notes</label>
          <textarea 
            id="paiement-notes" 
            class="form-input" 
            placeholder="Notes sur ce paiement..."
            rows="2"
          ></textarea>
        </div>
      `,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Enregistrer', class: 'btn-primary', onclick: `PaiementActions.confirmPaiement('${"${"}clientId}', ${"${"}soldeDu})` }
      ]
    );

    setTimeout(() => document.getElementById('paiement-montant')?.focus(), 100);
  },

  async confirmPaiement(clientId, soldeDu) {
    const montant = parseFloat(document.getElementById('paiement-montant').value);
    const mode = document.getElementById('paiement-mode').value;
    const preuveManual = document.getElementById('paiement-preuve').value.trim();
    const preuve = this.capturedPhotoUrl || preuveManual;
    const notes = document.getElementById('paiement-notes').value.trim();

    // Validation
    if (!montant || montant <= 0) {
      UIComponents.showToast('Veuillez saisir un montant valide', 'error');
      return;
    }

    if (montant > soldeDu) {
      UIComponents.showToast(`Le montant ne peut pas dépasser ${"${"}Helpers.formatCurrency(soldeDu)}`, 'error');
      return;
    }

    try {
      UIComponents.showToast('Enregistrement du paiement...', 'info');

      // Créer le paiement
      const paiementData = {
        client: [clientId],
        montant: montant,
        mode_paiement: mode,
        date_paiement: new Date().toISOString()
      };

      if (preuve) paiementData.preuve_url = preuve;
      if (notes) paiementData.notes = notes;

      await PaiementModel.create(paiementData);

      // Réinitialiser l'URL de la photo capturée
      this.capturedPhotoUrl = null;

      UIComponents.closeModal();
      UIComponents.showToast(Constants.Messages.SUCCESS.PAIEMENT_ENREGISTRE, 'success');

      // Recharger l'écran
      await Router.refresh();

    } catch (error) {
      console.error('Erreur enregistrement paiement:', error);
      UIComponents.showToast('Erreur : ' + error.message, 'error');
    }
  }
};
