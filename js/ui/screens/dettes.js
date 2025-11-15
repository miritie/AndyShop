/**
 * Écran Dettes & Relances
 */

// État de l'écran Dettes
const DettesScreenState = {
  filter: 'toutes', // 'toutes' | 'actives' | 'en_retard' | 'soldees'
  selectedDette: null,
  dettes: [],
  clients: [],
  boutiques: []
};

window.DettesScreen = async () => {
  // Charger les données
  const [allDettes, clients, boutiques] = await Promise.all([
    DetteModel.getAll(),
    ClientModel.getAll(),
    BoutiqueModel.getAll()
  ]);

  DettesScreenState.dettes = allDettes;
  DettesScreenState.clients = clients;
  DettesScreenState.boutiques = boutiques;

  return renderDettesMain();
};

/**
 * Rendu principal de l'écran
 */
function renderDettesMain() {
  const state = DettesScreenState;

  // Si une dette est sélectionnée, afficher le détail
  if (state.selectedDette) {
    return renderDetteDetail(state.selectedDette);
  }

  // Sinon, afficher la liste
  return renderDettesListe();
}

/**
 * Rendu de la liste des dettes
 */
function renderDettesListe() {
  const state = DettesScreenState;

  // Filtrer les dettes selon le filtre actif
  let dettesFiltered = state.dettes;

  if (state.filter === 'actives') {
    dettesFiltered = state.dettes.filter(d => d.montant_restant > 0 && DetteModel.calculateStatut(d) === Constants.StatutsDette.ACTIVE);
  } else if (state.filter === 'en_retard') {
    dettesFiltered = state.dettes.filter(d => d.montant_restant > 0 && DetteModel.calculateStatut(d) === Constants.StatutsDette.EN_RETARD);
  } else if (state.filter === 'soldees') {
    dettesFiltered = state.dettes.filter(d => !d.montant_restant || d.montant_restant <= 0);
  }

  // Calculer les statistiques
  const stats = {
    total: state.dettes.length,
    actives: state.dettes.filter(d => d.montant_restant > 0 && DetteModel.calculateStatut(d) === Constants.StatutsDette.ACTIVE).length,
    enRetard: state.dettes.filter(d => d.montant_restant > 0 && DetteModel.calculateStatut(d) === Constants.StatutsDette.EN_RETARD).length,
    soldees: state.dettes.filter(d => !d.montant_restant || d.montant_restant <= 0).length,
    montantTotal: state.dettes.reduce((sum, d) => sum + (d.montant_restant || 0), 0)
  };

  return `
    <div class="dettes-screen">
      <div class="screen-header">
        <h2>Dettes & Relances</h2>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid mb-md">
        <div class="stat-card">
          <div class="stat-card-value">${stats.total}</div>
          <div class="stat-card-label">Total dettes</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value text-warning">${stats.enRetard}</div>
          <div class="stat-card-label">En retard</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value text-success">${stats.actives}</div>
          <div class="stat-card-label">Actives</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${Helpers.formatCurrency(stats.montantTotal)}</div>
          <div class="stat-card-label">Montant total dû</div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="client-filters mb-md">
        <div class="filter-chip ${state.filter === 'toutes' ? 'active' : ''}" onclick="DettesActions.setFilter('toutes')">
          Toutes (${stats.total})
        </div>
        <div class="filter-chip ${state.filter === 'actives' ? 'active' : ''}" onclick="DettesActions.setFilter('actives')">
          Actives (${stats.actives})
        </div>
        <div class="filter-chip ${state.filter === 'en_retard' ? 'active' : ''}" onclick="DettesActions.setFilter('en_retard')">
          En retard (${stats.enRetard})
        </div>
        <div class="filter-chip ${state.filter === 'soldees' ? 'active' : ''}" onclick="DettesActions.setFilter('soldees')">
          Soldées (${stats.soldees})
        </div>
      </div>

      <!-- Liste des dettes -->
      ${dettesFiltered.length > 0 ? `
        <div class="dettes-list">
          ${dettesFiltered.map(dette => renderDetteCard(dette)).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p>Aucune dette ${state.filter === 'toutes' ? '' : state.filter}</p>
        </div>
      `}
    </div>
  `;
}

/**
 * Rendu d'une carte de dette
 */
function renderDetteCard(dette) {
  const client = DettesScreenState.clients.find(c => c.id === dette.client?.[0] || c.nom_complet === dette.client_nom);
  const statut = DetteModel.calculateStatut(dette);
  const prochaineEcheance = DetteModel.getProchaineEcheance(dette);
  const echeancesPassees = DetteModel.getEcheancesPassees(dette);

  const statutClass = statut === Constants.StatutsDette.EN_RETARD ? 'badge-error' :
                      statut === Constants.StatutsDette.SOLDEE ? 'badge-success' :
                      'badge-warning';

  return `
    <div class="dette-card" onclick="DettesActions.selectDette('${dette.id}')">
      <div class="dette-card-header">
        <div>
          <div class="dette-client-name">${client?.nom_complet || dette.client_nom || 'Client inconnu'}</div>
          <div class="dette-client-meta">
            ${Helpers.formatDate(dette.date_creation)} • ${dette.vente_reference || 'Vente'}
            ${client?.telephone ? ` • ${client.telephone}` : ''}
          </div>
        </div>
        <div>
          <div class="dette-amount">${Helpers.formatCurrency(dette.montant_restant || dette.montant_initial)}</div>
          <div class="badge ${statutClass}">${statut}</div>
        </div>
      </div>

      ${prochaineEcheance ? `
        <div class="dette-echeance">
          <span>Prochaine échéance :</span>
          <strong>${Helpers.formatDate(prochaineEcheance.date)} - ${Helpers.formatCurrency(prochaineEcheance.montant)}</strong>
        </div>
      ` : ''}

      ${echeancesPassees.length > 0 && dette.montant_restant > 0 ? `
        <div class="dette-overdue">
          ${Constants.Icons.ALERT}
          <span>${echeancesPassees.length} échéance(s) passée(s)</span>
        </div>
      ` : ''}

      <div class="dette-actions" onclick="event.stopPropagation()">
        ${statut !== Constants.StatutsDette.SOLDEE ? `
          <button class="btn btn-sm btn-primary" onclick="DettesActions.showRelanceModal('${dette.id}', '${client?.id || ''}')">
            Relancer
          </button>
        ` : ''}
        <button class="btn btn-sm btn-outline" onclick="DettesActions.selectDette('${dette.id}')">
          Détails
        </button>
      </div>
    </div>
  `;
}

/**
 * Rendu du détail d'une dette
 */
function renderDetteDetail(detteId) {
  const state = DettesScreenState;
  const dette = state.dettes.find(d => d.id === detteId);

  if (!dette) {
    return renderDettesListe();
  }

  const client = state.clients.find(c => c.id === dette.client?.[0] || c.nom_complet === dette.client_nom);
  const statut = DetteModel.calculateStatut(dette);
  const echeancier = Helpers.parseEcheancier(dette.echeancier);
  const prochaineEcheance = DetteModel.getProchaineEcheance(dette);

  return `
    <div class="dette-detail">
      <div class="detail-header">
        <button class="btn btn-secondary btn-sm" onclick="DettesActions.backToList()">
          ← Retour
        </button>
        <h2>Détail de la dette</h2>
      </div>

      <!-- Informations client -->
      <div class="card mb-md">
        <div class="card-header">
          <strong>Client</strong>
        </div>
        <div class="card-body">
          <div class="summary-row">
            <span>Nom :</span>
            <strong>${client?.nom_complet || dette.client_nom || 'Inconnu'}</strong>
          </div>
          ${client?.telephone ? `
            <div class="summary-row">
              <span>Téléphone :</span>
              <strong>${client.telephone}</strong>
            </div>
          ` : ''}
          <div class="summary-row">
            <span>Solde total dû :</span>
            <strong class="text-error">${Helpers.formatCurrency(client?.solde_du || 0)}</strong>
          </div>
        </div>
      </div>

      <!-- Informations dette -->
      <div class="card mb-md">
        <div class="card-header">
          <strong>Dette</strong>
          <div class="badge ${statut === Constants.StatutsDette.EN_RETARD ? 'badge-error' : statut === Constants.StatutsDette.SOLDEE ? 'badge-success' : 'badge-warning'}">
            ${statut}
          </div>
        </div>
        <div class="card-body">
          <div class="summary-row">
            <span>Vente :</span>
            <strong>${dette.vente_reference || 'N/A'}</strong>
          </div>
          <div class="summary-row">
            <span>Date de création :</span>
            <strong>${Helpers.formatDate(dette.date_creation)}</strong>
          </div>
          <hr />
          <div class="summary-row">
            <span>Montant initial :</span>
            <strong>${Helpers.formatCurrency(dette.montant_initial)}</strong>
          </div>
          <div class="summary-row">
            <span>Montant payé :</span>
            <strong class="text-success">${Helpers.formatCurrency((dette.montant_initial || 0) - (dette.montant_restant || 0))}</strong>
          </div>
          <div class="summary-row">
            <span>Reste à payer :</span>
            <strong class="text-error">${Helpers.formatCurrency(dette.montant_restant || 0)}</strong>
          </div>
        </div>
      </div>

      <!-- Échéancier -->
      ${echeancier && echeancier.length > 0 ? `
        <div class="card mb-md">
          <div class="card-header">
            <strong>Échéancier (${echeancier.length} paiement${echeancier.length > 1 ? 's' : ''})</strong>
          </div>
          <div class="card-body">
            ${echeancier.map((e, index) => {
              const isPassed = new Date(e.date) < new Date();
              const isCurrent = prochaineEcheance && e.date === prochaineEcheance.date;

              return `
                <div class="echeance-item ${isPassed ? 'echeance-passed' : ''} ${isCurrent ? 'echeance-current' : ''}">
                  <div class="echeance-number">${index + 1}</div>
                  <div class="echeance-info">
                    <div class="echeance-date">${Helpers.formatDate(e.date)}</div>
                    <div class="echeance-montant">${Helpers.formatCurrency(e.montant)}</div>
                  </div>
                  ${isPassed ? `
                    <div class="echeance-status">
                      ${Constants.Icons.ALERT}
                      <span>En retard</span>
                    </div>
                  ` : isCurrent ? `
                    <div class="echeance-status echeance-status-current">
                      ${Constants.Icons.INFO}
                      <span>Prochaine</span>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Notes -->
      ${dette.notes ? `
        <div class="card mb-md">
          <div class="card-header">
            <strong>Notes</strong>
          </div>
          <div class="card-body">
            <p>${dette.notes}</p>
          </div>
        </div>
      ` : ''}

      <!-- Actions -->
      ${statut !== Constants.StatutsDette.SOLDEE ? `
        <div class="btn-group">
          <button class="btn btn-primary" onclick="DettesActions.showRelanceModal('${dette.id}', '${client?.id || ''}')">
            Envoyer une relance
          </button>
          ${client?.id ? `
            <button class="btn btn-outline" onclick="Router.navigate('/client/${client.id}')">
              Voir le client
            </button>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Actions de l'écran Dettes
 */
window.DettesActions = {
  /**
   * Change le filtre actif
   */
  async setFilter(filter) {
    DettesScreenState.filter = filter;
    await Router.refresh();
  },

  /**
   * Sélectionne une dette pour voir le détail
   */
  async selectDette(detteId) {
    DettesScreenState.selectedDette = detteId;
    await Router.refresh();
  },

  /**
   * Retour à la liste
   */
  async backToList() {
    DettesScreenState.selectedDette = null;
    await Router.refresh();
  },

  /**
   * Affiche la modal de relance
   */
  showRelanceModal(detteId, clientId) {
    const dette = DettesScreenState.dettes.find(d => d.id === detteId);
    const client = DettesScreenState.clients.find(c => c.id === clientId);

    if (!dette || !client) {
      UIComponents.showToast('Données incomplètes', 'error');
      return;
    }

    const statut = DetteModel.calculateStatut(dette);
    const typeRelance = statut === Constants.StatutsDette.EN_RETARD ? 'ferme' : 'amicale';

    UIComponents.showModal(
      'Envoyer une relance',
      `
        <div class="form-group">
          <label>Client</label>
          <div class="form-input" disabled>${client.nom_complet}</div>
        </div>

        <div class="form-group">
          <label>Téléphone</label>
          <div class="form-input" disabled>${client.telephone || 'Non renseigné'}</div>
        </div>

        <div class="form-group">
          <label for="relance-type">Type de relance</label>
          <select id="relance-type" class="form-input" onchange="DettesActions.updateRelancePreview('${detteId}', '${clientId}')">
            <option value="amicale" ${typeRelance === 'amicale' ? 'selected' : ''}>Relance amicale</option>
            <option value="ferme" ${typeRelance === 'ferme' ? 'selected' : ''}>Relance ferme</option>
            <option value="echeance">Rappel d'échéance</option>
          </select>
        </div>

        <div class="form-group">
          <label for="relance-canal">Canal</label>
          <select id="relance-canal" class="form-input">
            <option value="${Constants.CanauxRelance.WHATSAPP}">WhatsApp</option>
            <option value="${Constants.CanauxRelance.SMS}">SMS</option>
            <option value="${Constants.CanauxRelance.APPEL}">Appel téléphonique</option>
          </select>
        </div>

        <div class="form-group">
          <label>Aperçu du message</label>
          <div id="relance-preview" class="relance-preview"></div>
        </div>
      `,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Envoyer', class: 'btn-primary', onclick: `DettesActions.sendRelance('${detteId}', '${clientId}')` }
      ]
    );

    // Afficher l'aperçu initial
    setTimeout(() => DettesActions.updateRelancePreview(detteId, clientId), 100);
  },

  /**
   * Met à jour l'aperçu de la relance
   */
  updateRelancePreview(detteId, clientId) {
    const dette = DettesScreenState.dettes.find(d => d.id === detteId);
    const client = DettesScreenState.clients.find(c => c.id === clientId);
    const type = document.getElementById('relance-type')?.value || 'amicale';

    if (!dette || !client) return;

    // Générer le message
    const boutique = DettesScreenState.boutiques[0]; // Boutique principale
    const message = WhatsAppService.generateRelance(client, [dette], type, boutique);

    // Afficher l'aperçu
    const previewDiv = document.getElementById('relance-preview');
    if (previewDiv) {
      previewDiv.textContent = message;
    }
  },

  /**
   * Envoie une relance
   */
  async sendRelance(detteId, clientId) {
    const dette = DettesScreenState.dettes.find(d => d.id === detteId);
    const client = DettesScreenState.clients.find(c => c.id === clientId);
    const type = document.getElementById('relance-type')?.value || 'amicale';
    const canal = document.getElementById('relance-canal')?.value || Constants.CanauxRelance.WHATSAPP;

    if (!dette || !client) {
      UIComponents.showToast('Données incomplètes', 'error');
      return;
    }

    if (!client.telephone && canal !== Constants.CanauxRelance.APPEL) {
      UIComponents.showToast('Le client n\'a pas de numéro de téléphone', 'error');
      return;
    }

    try {
      UIComponents.showToast('Préparation de la relance...', 'info');

      // Générer le message
      const boutique = DettesScreenState.boutiques[0];
      const message = WhatsAppService.generateRelance(client, [dette], type, boutique);

      // Enregistrer la relance dans Airtable
      await RelanceModel.create({
        client: [clientId],
        dette: [detteId],
        canal,
        message,
        statut: Constants.StatutsRelance.ENVOYEE,
        date_envoyee: new Date().toISOString()
      });

      UIComponents.closeModal();

      // Ouvrir WhatsApp ou copier le message
      if (canal === Constants.CanauxRelance.WHATSAPP) {
        WhatsAppService.openWhatsApp(client.telephone, message);
        UIComponents.showToast('WhatsApp ouvert avec le message', 'success');
      } else if (canal === Constants.CanauxRelance.SMS) {
        // Copier le message dans le presse-papier
        const copied = await WhatsAppService.copyMessage(message);
        if (copied) {
          UIComponents.showToast('Message copié dans le presse-papier. Ouvrez votre application SMS.', 'success');
        }
      } else {
        UIComponents.showToast(`Relance enregistrée. N'oubliez pas d'appeler ${client.nom_complet} au ${client.telephone}`, 'info');
      }

    } catch (error) {
      console.error('Erreur envoi relance:', error);
      UIComponents.showToast('Erreur lors de l\'envoi : ' + error.message, 'error');
    }
  }
};
