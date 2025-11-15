/**
 * Écran Lots - Gestion d'acquisition de stock
 */

// État de l'écran Lots
const LotsScreenState = {
  view: 'list', // 'list' | 'wizard' | 'detail'
  selectedLot: null,
  lots: [],
  articles: [],
  fournisseurs: [],

  // État du wizard
  wizard: {
    step: 1,
    fournisseur: '',
    date_achat: new Date().toISOString().split('T')[0],
    lieu_achat: Constants.LieuxAchat.LOCAL,
    devise: Constants.Devises.XOF,
    montant_global: 0,
    frais_divers: 0,
    notes: '',
    lignes: [] // { articleId, articleNom, quantite, cout_unitaire_base, prix_vente_souhaite }
  },

  resetWizard() {
    this.wizard = {
      step: 1,
      fournisseur: '',
      date_achat: new Date().toISOString().split('T')[0],
      lieu_achat: Constants.LieuxAchat.LOCAL,
      devise: Constants.Devises.XOF,
      montant_global: 0,
      frais_divers: 0,
      notes: '',
      lignes: []
    };
  },

  getTotalCoutsBase() {
    return this.wizard.lignes.reduce((sum, l) => sum + (l.cout_unitaire_base * l.quantite), 0);
  },

  getTotalQuantite() {
    return this.wizard.lignes.reduce((sum, l) => sum + l.quantite, 0);
  }
};

window.LotsScreen = async () => {
  // Charger les données
  const [lots, articles, fournisseurs] = await Promise.all([
    LotModel.getAll(),
    ArticleModel.getAll(),
    FournisseurModel ? FournisseurModel.getAll() : Promise.resolve([])
  ]);

  LotsScreenState.lots = lots;
  LotsScreenState.articles = articles;
  LotsScreenState.fournisseurs = fournisseurs;

  return renderLotsMain();
};

/**
 * Rendu principal
 */
function renderLotsMain() {
  const state = LotsScreenState;

  if (state.view === 'wizard') {
    return renderWizardLot();
  } else if (state.view === 'detail' && state.selectedLot) {
    return renderLotDetail();
  } else {
    return renderLotsList();
  }
}

/**
 * Liste des lots
 */
function renderLotsList() {
  const state = LotsScreenState;

  return `
    <div class="lots-screen">
      <div class="screen-header">
        <h2>Lots d'acquisition</h2>
        <button class="btn btn-primary" onclick="LotsActions.startWizard()">
          + Nouveau lot
        </button>
      </div>

      ${state.lots.length > 0 ? `
        <div class="lots-list">
          ${state.lots.map(lot => renderLotCard(lot)).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p>Aucun lot enregistré. Créez votre premier lot d'acquisition.</p>
          <button class="btn btn-primary mt-md" onclick="LotsActions.startWizard()">
            + Créer un lot
          </button>
        </div>
      `}
    </div>
  `;
}

/**
 * Carte de lot
 */
function renderLotCard(lot) {
  const coutTotal = (lot.montant_global || 0) + (lot.frais_divers || 0);

  return `
    <div class="lot-card" onclick="LotsActions.selectLot('${lot.id}')">
      <div class="lot-header">
        <div>
          <div class="lot-reference">${lot.reference}</div>
          <div class="lot-date">${Helpers.formatDate(lot.date_achat)}</div>
        </div>
        <div class="lot-status badge badge-success">
          ${lot.lieu_achat || 'Local'}
        </div>
      </div>

      <div class="lot-info">
        <div class="lot-info-item">
          <div class="lot-info-label">Fournisseur</div>
          <div class="lot-info-value">${lot.fournisseur || 'N/A'}</div>
        </div>
        <div class="lot-info-item">
          <div class="lot-info-label">Coût total</div>
          <div class="lot-info-value">${Helpers.formatCurrency(coutTotal)} ${lot.devise || 'XOF'}</div>
        </div>
      </div>

      ${lot.notes ? `
        <div class="lot-notes">${Helpers.truncate(lot.notes, 100)}</div>
      ` : ''}
    </div>
  `;
}

/**
 * Wizard de création de lot
 */
function renderWizardLot() {
  const state = LotsScreenState.wizard;

  return `
    <div class="wizard-container">
      <div class="wizard-header">
        <h2>Nouveau Lot</h2>
        <button class="btn btn-secondary btn-sm" onclick="LotsActions.cancelWizard()">
          Annuler
        </button>
      </div>

      <div class="wizard-steps">
        <div class="wizard-step ${state.step === 1 ? 'active' : ''} ${state.step > 1 ? 'completed' : ''}">
          <div class="wizard-step-number">1</div>
          <div class="wizard-step-label">Informations</div>
        </div>
        <div class="wizard-step ${state.step === 2 ? 'active' : ''} ${state.step > 2 ? 'completed' : ''}">
          <div class="wizard-step-number">2</div>
          <div class="wizard-step-label">Articles</div>
        </div>
        <div class="wizard-step ${state.step === 3 ? 'active' : ''}">
          <div class="wizard-step-number">3</div>
          <div class="wizard-step-label">Répartition</div>
        </div>
      </div>

      ${state.step === 1 ? renderWizardStep1() : ''}
      ${state.step === 2 ? renderWizardStep2() : ''}
      ${state.step === 3 ? renderWizardStep3() : ''}
    </div>
  `;
}

/**
 * Étape 1 : Informations du lot
 */
function renderWizardStep1() {
  const state = LotsScreenState.wizard;
  const fournisseurs = LotsScreenState.fournisseurs;

  return `
    <div class="wizard-content">
      <h3>Informations du lot</h3>

      <div class="form-group">
        <label for="lot-fournisseur">Fournisseur *</label>
        <input
          type="text"
          id="lot-fournisseur"
          class="form-input"
          placeholder="Nom du fournisseur"
          value="${state.fournisseur}"
          oninput="LotsActions.updateField('fournisseur', this.value)"
          list="fournisseurs-list"
        />
        <datalist id="fournisseurs-list">
          ${fournisseurs.map(f => `<option value="${f.nom}">`).join('')}
        </datalist>
      </div>

      <div class="form-group">
        <label for="lot-date">Date d'achat *</label>
        <input
          type="date"
          id="lot-date"
          class="form-input"
          value="${state.date_achat}"
          onchange="LotsActions.updateField('date_achat', this.value)"
        />
      </div>

      <div class="form-group">
        <label for="lot-lieu">Lieu d'achat</label>
        <select id="lot-lieu" class="form-input" value="${state.lieu_achat}" onchange="LotsActions.updateField('lieu_achat', this.value)">
          <option value="${Constants.LieuxAchat.LOCAL}">Local</option>
          <option value="${Constants.LieuxAchat.EXTERIEUR}">Extérieur</option>
        </select>
      </div>

      <div class="form-group">
        <label for="lot-devise">Devise</label>
        <select id="lot-devise" class="form-input" value="${state.devise}" onchange="LotsActions.updateField('devise', this.value)">
          ${Object.values(Constants.Devises).map(d => `
            <option value="${d}" ${state.devise === d ? 'selected' : ''}>${d}</option>
          `).join('')}
        </select>
      </div>

      <div class="form-group">
        <label for="lot-montant">Montant global * (${state.devise})</label>
        <input
          type="number"
          id="lot-montant"
          class="form-input"
          min="0"
          value="${state.montant_global}"
          oninput="LotsActions.updateField('montant_global', parseInt(this.value) || 0)"
          placeholder="0"
        />
        <small class="form-hint">Montant total payé au fournisseur</small>
      </div>

      <div class="form-group">
        <label for="lot-frais">Frais divers (${state.devise})</label>
        <input
          type="number"
          id="lot-frais"
          class="form-input"
          min="0"
          value="${state.frais_divers}"
          oninput="LotsActions.updateField('frais_divers', parseInt(this.value) || 0)"
          placeholder="0"
        />
        <small class="form-hint">Transport, douane, commission, etc.</small>
      </div>

      <div class="form-group">
        <label for="lot-notes">Notes</label>
        <textarea
          id="lot-notes"
          class="form-input"
          rows="3"
          placeholder="Détails supplémentaires..."
          oninput="LotsActions.updateField('notes', this.value)"
        >${state.notes}</textarea>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="summary-row">
            <span>Montant global :</span>
            <strong>${Helpers.formatCurrency(state.montant_global)} ${state.devise}</strong>
          </div>
          <div class="summary-row">
            <span>Frais divers :</span>
            <strong>${Helpers.formatCurrency(state.frais_divers)} ${state.devise}</strong>
          </div>
          <hr />
          <div class="summary-row text-lg">
            <strong>Coût total :</strong>
            <strong class="text-primary">${Helpers.formatCurrency(state.montant_global + state.frais_divers)} ${state.devise}</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="wizard-footer">
      <button class="btn btn-primary btn-block" onclick="LotsActions.nextStep()" ${!state.fournisseur || !state.montant_global ? 'disabled' : ''}>
        Continuer ${Constants.Icons.ARROW_RIGHT}
      </button>
    </div>
  `;
}

/**
 * Étape 2 : Ajout des articles
 */
function renderWizardStep2() {
  const state = LotsScreenState.wizard;
  const articles = LotsScreenState.articles.filter(a => a.actif !== false);

  return `
    <div class="wizard-content">
      <h3>Articles du lot</h3>

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

      ${state.lignes.length > 0 ? `
        <div class="card mb-md">
          <div class="card-header">
            <strong>Articles (${state.lignes.length})</strong>
            <div>Total : ${Helpers.formatCurrency(LotsScreenState.getTotalCoutsBase())} ${state.devise}</div>
          </div>
          <div class="card-body">
            <div class="lot-lignes-list">
              ${state.lignes.map((ligne, index) => `
                <div class="lot-ligne-item">
                  <div class="lot-ligne-info">
                    <div class="lot-ligne-name">${ligne.articleNom}</div>
                    <div class="lot-ligne-details">
                      <input
                        type="number"
                        class="form-input-sm"
                        value="${ligne.quantite}"
                        min="1"
                        style="width: 60px;"
                        onchange="LotsActions.updateLigneQuantite(${index}, this.value)"
                      />
                      <span>×</span>
                      <input
                        type="number"
                        class="form-input-sm"
                        value="${ligne.cout_unitaire_base}"
                        min="0"
                        style="width: 100px;"
                        placeholder="Coût unit."
                        onchange="LotsActions.updateLigneCout(${index}, this.value)"
                      />
                      <span>=</span>
                      <strong>${Helpers.formatCurrency(ligne.quantite * ligne.cout_unitaire_base)} ${state.devise}</strong>
                    </div>
                  </div>
                  <button class="btn btn-danger btn-sm" onclick="LotsActions.removeLigne(${index})">
                    ${Constants.Icons.CLOSE}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : `
        <div class="empty-state">
          <p>Aucun article ajouté. Recherchez et ajoutez des articles ci-dessus.</p>
        </div>
      `}
    </div>

    <div class="wizard-footer btn-group">
      <button class="btn btn-secondary" onclick="LotsActions.prevStep()">
        Retour
      </button>
      <button class="btn btn-primary" onclick="LotsActions.nextStep()" ${state.lignes.length === 0 ? 'disabled' : ''}>
        Continuer ${Constants.Icons.ARROW_RIGHT}
      </button>
    </div>

    <script>
      setTimeout(() => {
        FormHelpers.setupAutocomplete(
          'article-search',
          ${JSON.stringify(articles)},
          (article) => LotsActions.showAddArticleModal(article),
          ['nom', 'categorie']
        );
      }, 100);
    </script>
  `;
}

/**
 * Étape 3 : Répartition des coûts
 */
function renderWizardStep3() {
  const state = LotsScreenState.wizard;

  // Calculer la répartition automatique
  const lignesAvecRepartition = LotModel.calculateRepartitionCouts(
    state.montant_global,
    state.frais_divers,
    state.lignes
  );

  const totalCouts = lignesAvecRepartition.reduce((sum, l) => sum + l.cout_total, 0);

  return `
    <div class="wizard-content">
      <h3>Répartition des coûts</h3>

      <div class="card mb-md">
        <div class="card-header">
          <strong>Récapitulatif</strong>
        </div>
        <div class="card-body">
          <div class="summary-row">
            <span>Montant global :</span>
            <strong>${Helpers.formatCurrency(state.montant_global)} ${state.devise}</strong>
          </div>
          <div class="summary-row">
            <span>Frais divers :</span>
            <strong>${Helpers.formatCurrency(state.frais_divers)} ${state.devise}</strong>
          </div>
          <hr />
          <div class="summary-row text-lg">
            <strong>Coût total :</strong>
            <strong class="text-primary">${Helpers.formatCurrency(state.montant_global + state.frais_divers)} ${state.devise}</strong>
          </div>
          <div class="summary-row">
            <span>Articles :</span>
            <strong>${state.lignes.length} (${LotsScreenState.getTotalQuantite()} unités)</strong>
          </div>
        </div>
      </div>

      <div class="card mb-md">
        <div class="card-header">
          <strong>Répartition automatique des coûts</strong>
        </div>
        <div class="card-body">
          <div class="repartition-list">
            ${lignesAvecRepartition.map((ligne, index) => `
              <div class="repartition-item">
                <div class="repartition-article">
                  <div class="repartition-name">${ligne.articleNom}</div>
                  <div class="repartition-qty">${ligne.quantite} unités</div>
                </div>
                <div class="repartition-couts">
                  <div class="repartition-unitaire">
                    <label>Coût unitaire:</label>
                    <input
                      type="number"
                      class="form-input-sm"
                      value="${ligne.cout_unitaire}"
                      min="0"
                      style="width: 100px;"
                      onchange="LotsActions.updateLigneCoutFinal(${index}, this.value)"
                    />
                  </div>
                  <div class="repartition-total">
                    <strong>${Helpers.formatCurrency(ligne.cout_total)} ${state.devise}</strong>
                  </div>
                </div>
                <div class="repartition-vente">
                  <label>Prix vente souhaité:</label>
                  <input
                    type="number"
                    class="form-input-sm"
                    value="${ligne.prix_vente_souhaite || 0}"
                    min="0"
                    placeholder="0"
                    style="width: 100px;"
                    onchange="LotsActions.updateLignePrixVente(${index}, this.value)"
                  />
                </div>
              </div>
            `).join('')}
          </div>

          <hr />
          <div class="summary-row text-lg">
            <strong>Total réparti :</strong>
            <strong class="${totalCouts === (state.montant_global + state.frais_divers) ? 'text-success' : 'text-warning'}">
              ${Helpers.formatCurrency(totalCouts)} ${state.devise}
            </strong>
          </div>
          ${totalCouts !== (state.montant_global + state.frais_divers) ? `
            <div class="alert alert-warning">
              Attention : Le total réparti (${Helpers.formatCurrency(totalCouts)}) ne correspond pas au coût total du lot (${Helpers.formatCurrency(state.montant_global + state.frais_divers)}).
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <div class="wizard-footer btn-group">
      <button class="btn btn-secondary" onclick="LotsActions.prevStep()">
        Retour
      </button>
      <button class="btn btn-success" onclick="LotsActions.submitLot()">
        ${Constants.Icons.CHECK} Enregistrer le lot
      </button>
    </div>
  `;
}

/**
 * Détail d'un lot
 */
async function renderLotDetail() {
  const lotId = LotsScreenState.selectedLot;
  const lot = LotsScreenState.lots.find(l => l.id === lotId);

  if (!lot) {
    LotsScreenState.view = 'list';
    return renderLotsList();
  }

  const coutTotal = (lot.montant_global || 0) + (lot.frais_divers || 0);

  return `
    <div class="lot-detail">
      <div class="detail-header">
        <button class="btn btn-secondary btn-sm" onclick="LotsActions.backToList()">
          ← Retour
        </button>
        <h2>Détail du lot</h2>
      </div>

      <div class="card mb-md">
        <div class="card-header">
          <strong>${lot.reference}</strong>
          <div class="badge badge-success">${lot.lieu_achat || 'Local'}</div>
        </div>
        <div class="card-body">
          <div class="summary-row">
            <span>Fournisseur :</span>
            <strong>${lot.fournisseur || 'N/A'}</strong>
          </div>
          <div class="summary-row">
            <span>Date d'achat :</span>
            <strong>${Helpers.formatDate(lot.date_achat)}</strong>
          </div>
          <div class="summary-row">
            <span>Devise :</span>
            <strong>${lot.devise || 'XOF'}</strong>
          </div>
          <hr />
          <div class="summary-row">
            <span>Montant global :</span>
            <strong>${Helpers.formatCurrency(lot.montant_global)} ${lot.devise || 'XOF'}</strong>
          </div>
          <div class="summary-row">
            <span>Frais divers :</span>
            <strong>${Helpers.formatCurrency(lot.frais_divers || 0)} ${lot.devise || 'XOF'}</strong>
          </div>
          <hr />
          <div class="summary-row text-lg">
            <strong>Coût total :</strong>
            <strong class="text-primary">${Helpers.formatCurrency(coutTotal)} ${lot.devise || 'XOF'}</strong>
          </div>
        </div>
      </div>

      ${lot.notes ? `
        <div class="card mb-md">
          <div class="card-header">
            <strong>Notes</strong>
          </div>
          <div class="card-body">
            <p>${lot.notes}</p>
          </div>
        </div>
      ` : ''}

      <div class="alert alert-info">
        Les lignes du lot seront affichées ici (nécessite l'appel à LotModel.getLignesLot())
      </div>
    </div>
  `;
}

/**
 * Actions de l'écran Lots
 */
window.LotsActions = {
  startWizard() {
    LotsScreenState.resetWizard();
    LotsScreenState.view = 'wizard';
    Router.refresh();
  },

  cancelWizard() {
    UIComponents.showModal(
      'Annuler la création',
      '<p>Êtes-vous sûr de vouloir annuler ? Les données saisies seront perdues.</p>',
      [
        { label: 'Non', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Oui, annuler', class: 'btn-danger', onclick: 'LotsActions.confirmCancel()' }
      ]
    );
  },

  confirmCancel() {
    UIComponents.closeModal();
    LotsScreenState.view = 'list';
    Router.navigate('/lots');
  },

  updateField(field, value) {
    LotsScreenState.wizard[field] = value;
    Router.refresh();
  },

  nextStep() {
    if (LotsScreenState.wizard.step < 3) {
      LotsScreenState.wizard.step++;
      Router.refresh();
    }
  },

  prevStep() {
    if (LotsScreenState.wizard.step > 1) {
      LotsScreenState.wizard.step--;
      Router.refresh();
    }
  },

  showAddArticleModal(article) {
    document.getElementById('article-search').value = '';
    document.getElementById('article-search-results').innerHTML = '';

    UIComponents.showModal(
      'Ajouter au lot',
      `
        <div class="form-group">
          <label>Article</label>
          <div class="form-input" disabled>${article.nom}</div>
        </div>
        <div class="form-group">
          <label for="modal-quantite">Quantité *</label>
          <input type="number" id="modal-quantite" class="form-input" value="1" min="1" />
        </div>
        <div class="form-group">
          <label for="modal-cout">Coût unitaire de base (${LotsScreenState.wizard.devise})</label>
          <input type="number" id="modal-cout" class="form-input" value="0" min="0" placeholder="0" />
          <small class="form-hint">Coût d'achat estimé par unité (avant répartition des frais)</small>
        </div>
        <div class="form-group">
          <label for="modal-prix-vente">Prix de vente souhaité (${LotsScreenState.wizard.devise})</label>
          <input type="number" id="modal-prix-vente" class="form-input" value="0" min="0" placeholder="0" />
        </div>
      `,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Ajouter', class: 'btn-primary', onclick: `LotsActions.confirmAddArticle('${article.id}', '${article.nom.replace(/'/g, "\\'")}')` }
      ]
    );
  },

  async confirmAddArticle(articleId, articleNom) {
    const quantite = parseInt(document.getElementById('modal-quantite').value) || 1;
    const cout = parseInt(document.getElementById('modal-cout').value) || 0;
    const prixVente = parseInt(document.getElementById('modal-prix-vente').value) || 0;

    LotsScreenState.wizard.lignes.push({
      articleId,
      articleNom,
      quantite,
      cout_unitaire_base: cout,
      prix_vente_souhaite: prixVente
    });

    UIComponents.closeModal();
    await Router.refresh();
    UIComponents.showToast('Article ajouté au lot', 'success');
  },

  async removeLigne(index) {
    LotsScreenState.wizard.lignes.splice(index, 1);
    await Router.refresh();
  },

  async updateLigneQuantite(index, quantite) {
    LotsScreenState.wizard.lignes[index].quantite = parseInt(quantite) || 1;
    await Router.refresh();
  },

  async updateLigneCout(index, cout) {
    LotsScreenState.wizard.lignes[index].cout_unitaire_base = parseInt(cout) || 0;
    await Router.refresh();
  },

  updateLigneCoutFinal(index, cout) {
    LotsScreenState.wizard.lignes[index].cout_unitaire = parseInt(cout) || 0;
    LotsScreenState.wizard.lignes[index].cout_total = LotsScreenState.wizard.lignes[index].cout_unitaire * LotsScreenState.wizard.lignes[index].quantite;
    Router.refresh();
  },

  updateLignePrixVente(index, prix) {
    LotsScreenState.wizard.lignes[index].prix_vente_souhaite = parseInt(prix) || 0;
  },

  async submitLot() {
    const state = LotsScreenState.wizard;

    if (!state.fournisseur || !state.montant_global || state.lignes.length === 0) {
      UIComponents.showToast('Données incomplètes', 'error');
      return;
    }

    try {
      UIComponents.showToast('Enregistrement du lot...', 'info');

      // Récupérer les lignes avec répartition finale
      const lignesAvecRepartition = LotModel.calculateRepartitionCouts(
        state.montant_global,
        state.frais_divers,
        state.lignes
      );

      const result = await LotModel.create({
        fournisseur: state.fournisseur,
        date_achat: state.date_achat,
        lieu_achat: state.lieu_achat,
        devise: state.devise,
        montant_global: state.montant_global,
        frais_divers: state.frais_divers,
        notes: state.notes,
        lignes: lignesAvecRepartition.map(l => ({
          articleId: l.articleId,
          quantite: l.quantite,
          cout_unitaire: l.cout_unitaire,
          prix_vente_souhaite: l.prix_vente_souhaite || 0
        }))
      });

      UIComponents.showToast('Lot enregistré avec succès !', 'success');

      // Retourner à la liste
      LotsScreenState.view = 'list';
      await Router.navigate('/lots');

    } catch (error) {
      console.error('Erreur création lot:', error);
      UIComponents.showToast('Erreur : ' + error.message, 'error');
    }
  },

  selectLot(lotId) {
    LotsScreenState.selectedLot = lotId;
    LotsScreenState.view = 'detail';
    Router.refresh();
  },

  backToList() {
    LotsScreenState.view = 'list';
    LotsScreenState.selectedLot = null;
    Router.refresh();
  }
};
