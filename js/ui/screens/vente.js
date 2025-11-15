/**
 * Écran Nouvelle Vente - Wizard multi-étapes
 */

// État du wizard
const VenteWizardState = {
  step: 1,
  client: null,
  boutique: null,
  panier: [],
  montantPaye: 0,

  reset() {
    this.step = 1;
    this.client = null;
    this.boutique = null;
    this.panier = [];
    this.montantPaye = 0;
  },

  getTotalPanier() {
    return this.panier.reduce((sum, item) => sum + (item.quantite * item.prixUnitaire), 0);
  },

  addToPanier(article, quantite, prixUnitaire) {
    const existing = this.panier.find(p => p.articleId === article.id);
    if (existing) {
      existing.quantite += quantite;
    } else {
      this.panier.push({
        articleId: article.id,
        articleNom: article.nom,
        quantite,
        prixUnitaire,
        ligneLotId: null // Peut être enrichi avec une sélection de lot
      });
    }
  },

  removeFromPanier(articleId) {
    this.panier = this.panier.filter(p => p.articleId !== articleId);
  },

  updatePanierQuantite(articleId, quantite) {
    const item = this.panier.find(p => p.articleId === articleId);
    if (item) {
      item.quantite = quantite;
    }
  }
};

window.VenteScreen = async () => {
  const clients = await ClientModel.getAll();
  const articles = await ArticleModel.getAll();
  const boutiques = await BoutiqueModel.getAll();

  return renderStep(clients, articles, boutiques);
};

/**
 * Rendu de l'étape courante
 */
function renderStep(clients, articles, boutiques) {
  const state = VenteWizardState;

  return `
    <div class="wizard-container">
      ${renderWizardHeader()}
      ${renderWizardSteps()}

      ${state.step === 1 ? renderStep1(clients, boutiques) : ''}
      ${state.step === 2 ? renderStep2(articles) : ''}
      ${state.step === 3 ? renderStep3() : ''}
      ${state.step === 4 ? renderStep4() : ''}
    </div>
  `;
}

/**
 * En-tête du wizard avec titre et progression
 */
function renderWizardHeader() {
  return `
    <div class="wizard-header">
      <h2>Nouvelle Vente</h2>
      <button class="btn btn-secondary btn-sm" onclick="VenteWizardActions.cancel()">
        Annuler
      </button>
    </div>
  `;
}

/**
 * Indicateurs des étapes
 */
function renderWizardSteps() {
  const state = VenteWizardState;
  const steps = [
    { num: 1, label: 'Client' },
    { num: 2, label: 'Articles' },
    { num: 3, label: 'Paiement' },
    { num: 4, label: 'Confirmation' }
  ];

  return `
    <div class="wizard-steps">
      ${steps.map(s => `
        <div class="wizard-step ${s.num === state.step ? 'active' : ''} ${s.num < state.step ? 'completed' : ''}">
          <div class="wizard-step-number">${s.num}</div>
          <div class="wizard-step-label">${s.label}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * ÉTAPE 1 : Sélection du client et de la boutique
 */
function renderStep1(clients, boutiques) {
  const state = VenteWizardState;

  return `
    <div class="wizard-content">
      <h3>Sélectionner le client</h3>

      ${!state.client ? `
        <div class="form-group">
          <label for="client-search">Rechercher un client</label>
          <input
            type="text"
            id="client-search"
            class="form-input"
            placeholder="Nom, téléphone..."
            autocomplete="off"
          />
          <div id="client-search-results" class="autocomplete-results"></div>
        </div>

        <div class="text-center mt-md mb-md">
          <button class="btn btn-outline" onclick="VenteWizardActions.showNewClientModal()">
            + Créer un nouveau client
          </button>
        </div>
      ` : `
        <div class="card mb-md">
          <div class="card-body">
            <div class="client-selected">
              <div class="client-info">
                <div class="client-name">${state.client.nom_complet}</div>
                <div class="client-phone">${state.client.telephone || 'Pas de téléphone'}</div>
                ${state.client.solde_du > 0 ? `
                  <div class="client-debt">Dette actuelle : ${Helpers.formatCurrency(state.client.solde_du)}</div>
                ` : ''}
              </div>
              <button class="btn btn-secondary btn-sm" onclick="VenteWizardActions.clearClient()">
                Changer
              </button>
            </div>
          </div>
        </div>
      `}

      <div class="form-group">
        <label for="boutique-select">Boutique</label>
        <select id="boutique-select" class="form-input" onchange="VenteWizardActions.selectBoutique(this.value)">
          <option value="">-- Sélectionner une boutique --</option>
          ${boutiques.map(b => `
            <option value="${b.id}" ${state.boutique?.id === b.id ? 'selected' : ''}>
              ${b.nom} (${b.type})
            </option>
          `).join('')}
        </select>
      </div>
    </div>

    <div class="wizard-footer">
      <button class="btn btn-primary btn-block" onclick="VenteWizardActions.nextStep()" ${!state.client || !state.boutique ? 'disabled' : ''}>
        Continuer ${Constants.Icons.ARROW_RIGHT}
      </button>
    </div>

    <script>
      // Configuration de l'autocomplete client
      (function() {
        const clients = ${JSON.stringify(clients)};
        VenteWizardActions.setupClientSearch(clients);
      })();
    </script>
  `;
}

/**
 * ÉTAPE 2 : Ajout d'articles au panier
 */
function renderStep2(articles) {
  const state = VenteWizardState;
  const articlesActifs = articles.filter(a => a.actif !== false);

  return `
    <div class="wizard-content">
      <h3>Ajouter des articles</h3>

      <div class="form-group">
        <label for="article-search">Rechercher un article</label>
        <input
          type="text"
          id="article-search"
          class="form-input"
          placeholder="Nom de l'article..."
        />
        <div id="article-search-results" class="autocomplete-results"></div>
      </div>

      ${state.panier.length > 0 ? `
        <div class="card mb-md">
          <div class="card-header">
            <strong>Panier (${state.panier.length} article${state.panier.length > 1 ? 's' : ''})</strong>
            <div class="text-lg">${Helpers.formatCurrency(state.getTotalPanier())}</div>
          </div>
          <div class="card-body">
            <div class="panier-list">
              ${state.panier.map(item => `
                <div class="panier-item">
                  <div class="panier-item-info">
                    <div class="panier-item-name">${item.articleNom}</div>
                    <div class="panier-item-details">
                      <input
                        type="number"
                        class="form-input-sm"
                        value="${item.quantite}"
                        min="1"
                        style="width: 60px;"
                        onchange="VenteWizardActions.updateQuantite('${item.articleId}', this.value)"
                      />
                      <span>×</span>
                      <input
                        type="number"
                        class="form-input-sm"
                        value="${item.prixUnitaire}"
                        min="0"
                        style="width: 100px;"
                        onchange="VenteWizardActions.updatePrix('${item.articleId}', this.value)"
                      />
                      <span>=</span>
                      <strong>${Helpers.formatCurrency(item.quantite * item.prixUnitaire)}</strong>
                    </div>
                  </div>
                  <button class="btn btn-danger btn-sm" onclick="VenteWizardActions.removeFromPanier('${item.articleId}')">
                    ${Constants.Icons.CLOSE}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : `
        <div class="empty-state">
          <p>Panier vide. Ajoutez des articles ci-dessus.</p>
        </div>
      `}
    </div>

    <div class="wizard-footer btn-group">
      <button class="btn btn-secondary" onclick="VenteWizardActions.prevStep()">
        Retour
      </button>
      <button class="btn btn-primary" onclick="VenteWizardActions.nextStep()" ${state.panier.length === 0 ? 'disabled' : ''}>
        Continuer ${Constants.Icons.ARROW_RIGHT}
      </button>
    </div>

    <script>
      // Configuration de l'autocomplete article
      setTimeout(() => {
        FormHelpers.setupAutocomplete(
          'article-search',
          ${JSON.stringify(articlesActifs)},
          (article) => VenteWizardActions.showAddArticleModal(article),
          ['nom', 'categorie']
        );
      }, 100);
    </script>
  `;
}

/**
 * ÉTAPE 3 : Révision et paiement
 */
function renderStep3() {
  const state = VenteWizardState;
  const total = state.getTotalPanier();
  const reste = total - state.montantPaye;

  return `
    <div class="wizard-content">
      <h3>Révision et paiement</h3>

      <div class="card mb-md">
        <div class="card-header">
          <strong>Récapitulatif</strong>
        </div>
        <div class="card-body">
          <div class="summary-row">
            <span>Client :</span>
            <strong>${state.client.nom_complet}</strong>
          </div>
          <div class="summary-row">
            <span>Boutique :</span>
            <strong>${state.boutique.nom}</strong>
          </div>
          <div class="summary-row">
            <span>Articles :</span>
            <strong>${state.panier.length}</strong>
          </div>
          <hr />
          ${state.panier.map(item => `
            <div class="summary-row small">
              <span>${item.articleNom} (×${item.quantite})</span>
              <span>${Helpers.formatCurrency(item.quantite * item.prixUnitaire)}</span>
            </div>
          `).join('')}
          <hr />
          <div class="summary-row text-lg">
            <strong>Total :</strong>
            <strong>${Helpers.formatCurrency(total)}</strong>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <strong>Paiement initial</strong>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="montant-paye">Montant payé maintenant</label>
            <input
              type="number"
              id="montant-paye"
              class="form-input"
              min="0"
              max="${total}"
              value="${state.montantPaye}"
              placeholder="0"
              oninput="VenteWizardActions.updateMontantPaye(this.value)"
            />
            <small class="form-hint">Laisser à 0 pour vente à crédit</small>
          </div>

          ${state.montantPaye > 0 ? `
            <div class="payment-summary">
              <div class="summary-row">
                <span>Montant payé :</span>
                <strong class="text-success">${Helpers.formatCurrency(state.montantPaye)}</strong>
              </div>
              <div class="summary-row">
                <span>Reste à payer :</span>
                <strong class="${reste > 0 ? 'text-warning' : 'text-success'}">${Helpers.formatCurrency(reste)}</strong>
              </div>
            </div>
          ` : `
            <div class="alert alert-warning">
              Vente à crédit : le client devra payer ${Helpers.formatCurrency(total)}
            </div>
          `}
        </div>
      </div>
    </div>

    <div class="wizard-footer btn-group">
      <button class="btn btn-secondary" onclick="VenteWizardActions.prevStep()">
        Retour
      </button>
      <button class="btn btn-success" onclick="VenteWizardActions.submitVente()">
        ${Constants.Icons.CHECK} Enregistrer la vente
      </button>
    </div>
  `;
}

/**
 * ÉTAPE 4 : Confirmation
 */
function renderStep4() {
  const state = VenteWizardState;
  const total = state.getTotalPanier();
  const reste = total - state.montantPaye;

  return `
    <div class="wizard-content">
      <div class="success-state">
        <div class="success-icon">${Constants.Icons.CHECK}</div>
        <h3>Vente enregistrée avec succès !</h3>

        <div class="card mb-md">
          <div class="card-body">
            <div class="summary-row">
              <span>Client :</span>
              <strong>${state.client.nom_complet}</strong>
            </div>
            <div class="summary-row">
              <span>Montant total :</span>
              <strong>${Helpers.formatCurrency(total)}</strong>
            </div>
            <div class="summary-row">
              <span>Montant payé :</span>
              <strong>${Helpers.formatCurrency(state.montantPaye)}</strong>
            </div>
            ${reste > 0 ? `
              <div class="summary-row">
                <span>Reste dû :</span>
                <strong class="text-warning">${Helpers.formatCurrency(reste)}</strong>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="wizard-footer btn-group">
      <button class="btn btn-secondary" onclick="Router.navigate('/home')">
        Retour à l'accueil
      </button>
      <button class="btn btn-primary" onclick="VenteWizardActions.newVente()">
        Nouvelle vente
      </button>
    </div>
  `;
}

/**
 * Actions du wizard
 */
window.VenteWizardActions = {
  async selectClient(client) {
    VenteWizardState.client = client;
    await Router.refresh();
  },

  clearClient() {
    VenteWizardState.client = null;
    Router.refresh();
  },

  selectBoutique(boutiqueId) {
    const boutiques = AppState.boutiques || [];
    VenteWizardState.boutique = boutiques.find(b => b.id === boutiqueId);
    Router.refresh();
  },

  async nextStep() {
    if (VenteWizardState.step < 4) {
      VenteWizardState.step++;
      await Router.refresh();
    }
  },

  async prevStep() {
    if (VenteWizardState.step > 1) {
      VenteWizardState.step--;
      await Router.refresh();
    }
  },

  cancel() {
    UIComponents.showModal(
      'Annuler la vente',
      '<p>Êtes-vous sûr de vouloir annuler cette vente ? Toutes les données seront perdues.</p>',
      [
        { label: 'Non', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Oui, annuler', class: 'btn-danger', onclick: 'VenteWizardActions.confirmCancel()' }
      ]
    );
  },

  confirmCancel() {
    VenteWizardState.reset();
    UIComponents.closeModal();
    Router.navigate('/home');
  },

  showAddArticleModal(article) {
    // Réinitialiser le champ de recherche
    document.getElementById('article-search').value = '';
    document.getElementById('article-search-results').innerHTML = '';

    UIComponents.showModal(
      'Ajouter au panier',
      `
        <div class="form-group">
          <label>Article</label>
          <div class="form-input" disabled>${article.nom}</div>
        </div>
        <div class="form-group">
          <label for="modal-quantite">Quantité</label>
          <input type="number" id="modal-quantite" class="form-input" value="1" min="1" />
        </div>
        <div class="form-group">
          <label for="modal-prix">Prix unitaire (XOF)</label>
          <input type="number" id="modal-prix" class="form-input" value="0" min="0" />
          <small class="form-hint">Entrez le prix négocié pour cette vente</small>
        </div>
      `,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Ajouter', class: 'btn-primary', onclick: `VenteWizardActions.confirmAddArticle('${article.id}', '${article.nom.replace(/'/g, "\\'")}')` }
      ]
    );

    // Focus sur le prix
    setTimeout(() => document.getElementById('modal-prix')?.focus(), 100);
  },

  async confirmAddArticle(articleId, articleNom) {
    const quantite = parseInt(document.getElementById('modal-quantite').value) || 1;
    const prix = parseInt(document.getElementById('modal-prix').value) || 0;

    if (prix <= 0) {
      UIComponents.showToast('Veuillez entrer un prix valide', 'error');
      return;
    }

    VenteWizardState.addToPanier(
      { id: articleId, nom: articleNom },
      quantite,
      prix
    );

    UIComponents.closeModal();
    await Router.refresh();
    UIComponents.showToast('Article ajouté au panier', 'success');
  },

  async removeFromPanier(articleId) {
    VenteWizardState.removeFromPanier(articleId);
    await Router.refresh();
    UIComponents.showToast('Article retiré du panier', 'info');
  },

  async updateQuantite(articleId, quantite) {
    const qty = parseInt(quantite) || 1;
    VenteWizardState.updatePanierQuantite(articleId, qty);
    await Router.refresh();
  },

  async updatePrix(articleId, prix) {
    const item = VenteWizardState.panier.find(p => p.articleId === articleId);
    if (item) {
      item.prixUnitaire = parseInt(prix) || 0;
      await Router.refresh();
    }
  },

  updateMontantPaye(montant) {
    VenteWizardState.montantPaye = parseInt(montant) || 0;
    Router.refresh();
  },

  async submitVente() {
    const state = VenteWizardState;
    const total = state.getTotalPanier();

    if (!state.client || !state.boutique || state.panier.length === 0) {
      UIComponents.showToast('Données incomplètes', 'error');
      return;
    }

    try {
      UIComponents.showToast('Enregistrement en cours...', 'info');

      // Créer la vente
      const result = await VenteModel.create({
        clientId: state.client.id,
        boutiqueId: state.boutique.id,
        montantTotal: total,
        montantPaye: state.montantPaye,
        lignes: state.panier.map(item => ({
          articleId: item.articleId,
          quantite: item.quantite,
          prixUnitaire: item.prixUnitaire,
          ligneLotId: item.ligneLotId
        }))
      });

      // Mettre à jour l'état global
      if (!AppState.ventes) AppState.ventes = [];
      AppState.ventes.unshift(result.vente);

      UIComponents.showToast(Constants.Messages.SUCCESS.VENTE_CREEE, 'success');

      // Passer à l'étape de confirmation
      state.step = 4;
      await Router.refresh();

    } catch (error) {
      console.error('Erreur création vente:', error);
      UIComponents.showToast('Erreur lors de l\'enregistrement : ' + error.message, 'error');
    }
  },

  newVente() {
    VenteWizardState.reset();
    Router.navigate('/vente');
  },

  // Sauvegarder la recherche en cours pour pré-remplir le formulaire
  currentSearch: '',

  setupClientSearch(clients) {
    const input = document.getElementById('client-search');
    const resultsDiv = document.getElementById('client-search-results');

    if (!input || !resultsDiv) return;

    const search = Helpers.debounce((query) => {
      this.currentSearch = query;

      if (!query || query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
      }

      const matches = clients.filter(client => {
        const nomMatch = client.nom_complet?.toLowerCase().includes(query.toLowerCase());
        const telMatch = client.telephone?.includes(query);
        return nomMatch || telMatch;
      }).slice(0, 10);

      if (matches.length === 0) {
        resultsDiv.innerHTML = `
          <div class="autocomplete-empty">
            Aucun client trouvé
            <button class="btn btn-primary btn-sm mt-sm" onclick="VenteWizardActions.showNewClientModal()" style="width: 100%;">
              + Créer "${query}"
            </button>
          </div>
        `;
      } else {
        resultsDiv.innerHTML = matches.map(client => `
          <div class="autocomplete-item" onclick='VenteWizardActions.selectClient(${JSON.stringify(client).replace(/'/g, "\\'")}); event.stopPropagation();'>
            <div style="font-weight: 500;">${client.nom_complet}</div>
            <div style="font-size: 0.875rem; color: var(--color-text-secondary);">${client.telephone || 'Pas de téléphone'}</div>
            ${client.solde_du > 0 ? `<div style="font-size: 0.875rem; color: var(--color-error);">Dette: ${Helpers.formatCurrency(client.solde_du)}</div>` : ''}
          </div>
        `).join('');
      }
    }, 300);

    input.addEventListener('input', (e) => search(e.target.value));
    input.focus();
  },

  showNewClientModal() {
    // Essayer d'extraire nom et téléphone de la recherche
    const searchValue = this.currentSearch || '';
    const isPhone = /^\+?[\d\s]+$/.test(searchValue);

    const defaultNom = !isPhone ? searchValue : '';
    const defaultTel = isPhone ? searchValue : '';

    UIComponents.showModal(
      'Nouveau client',
      `
        <div class="form-group">
          <label for="new-client-nom">Nom complet *</label>
          <input type="text" id="new-client-nom" class="form-input" placeholder="Jean Kouadio" value="${defaultNom}" />
        </div>
        <div class="form-group">
          <label for="new-client-tel">Téléphone *</label>
          <input type="tel" id="new-client-tel" class="form-input" placeholder="+225 XX XX XX XX XX" value="${defaultTel}" />
        </div>
        <div class="form-group">
          <label for="new-client-type">Type de client</label>
          <select id="new-client-type" class="form-input">
            ${Object.values(Constants.TypesClient).map(type => `
              <option value="${type}">${type}</option>
            `).join('')}
          </select>
        </div>
      `,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Créer', class: 'btn-primary', onclick: 'VenteWizardActions.confirmNewClient()' }
      ]
    );

    // Focus sur le champ vide
    setTimeout(() => {
      if (!defaultNom) {
        document.getElementById('new-client-nom')?.focus();
      } else if (!defaultTel) {
        document.getElementById('new-client-tel')?.focus();
      }
    }, 100);
  },

  async confirmNewClient() {
    const nom = document.getElementById('new-client-nom').value.trim();
    const tel = document.getElementById('new-client-tel').value.trim();
    const type = document.getElementById('new-client-type').value;

    if (!nom || !tel) {
      UIComponents.showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (!Helpers.isValidPhone(tel)) {
      UIComponents.showToast('Numéro de téléphone invalide', 'error');
      return;
    }

    try {
      UIComponents.showToast('Création du client...', 'info');

      const client = await ClientModel.create({
        nom_complet: nom,
        telephone: tel,
        type_client: type
      });

      // Mettre à jour l'état global
      if (!AppState.clients) AppState.clients = [];
      AppState.clients.push(client);

      // Sélectionner le nouveau client
      VenteWizardState.client = client;

      UIComponents.closeModal();
      UIComponents.showToast(Constants.Messages.SUCCESS.CLIENT_CREE, 'success');
      await Router.refresh();

    } catch (error) {
      console.error('Erreur création client:', error);
      UIComponents.showToast('Erreur : ' + error.message, 'error');
    }
  }
};
