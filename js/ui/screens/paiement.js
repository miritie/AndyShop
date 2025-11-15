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
          <label for="paiement-preuve">Lien preuve (capture/photo)</label>
          <input 
            type="url" 
            id="paiement-preuve" 
            class="form-input" 
            placeholder="https://drive.google.com/file/d/..."
          />
          <small class="form-hint">
            Optionnel: Lien vers capture écran ou photo du paiement
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
    const preuve = document.getElementById('paiement-preuve').value.trim();
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
