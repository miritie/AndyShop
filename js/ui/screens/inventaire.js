/**
 * Écran Inventaire - Gestion des inventaires physiques et ajustements de stock
 */

// État de l'écran Inventaire
const InventaireScreenState = {
  view: 'menu', // 'menu' | 'comptage' | 'historique'
  articles: [],
  boutiques: [],
  ajustements: [],

  // État du comptage
  comptage: {
    boutique: '',
    date: new Date().toISOString().split('T')[0],
    items: [], // { articleId, articleNom, stockTheorique, stockCompte, difference, notes }
    enCours: false
  },

  resetComptage() {
    this.comptage = {
      boutique: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      enCours: false
    };
  }
};

window.InventaireScreen = async () => {
  // Charger les données
  const [articles, boutiques, ajustements] = await Promise.all([
    ArticleModel.getAll(),
    BoutiqueModel.getAll(),
    AjustementStockModel ? AjustementStockModel.getAll() : Promise.resolve([])
  ]);

  InventaireScreenState.articles = articles;
  InventaireScreenState.boutiques = boutiques;
  InventaireScreenState.ajustements = ajustements;

  return renderInventaireMain();
};

/**
 * Rendu principal
 */
function renderInventaireMain() {
  const state = InventaireScreenState;

  if (state.view === 'comptage') {
    return renderComptageInventaire();
  } else if (state.view === 'historique') {
    return renderHistoriqueAjustements();
  } else {
    return renderInventaireMenu();
  }
}

/**
 * Menu principal de l'inventaire
 */
function renderInventaireMenu() {
  const state = InventaireScreenState;
  const ajustementsRecents = state.ajustements.slice(0, 5);

  return `
    <div class="inventaire-screen">
      <div class="screen-header">
        <h2>Inventaire & Ajustements</h2>
      </div>

      <div class="card-grid">
        <!-- Carte: Nouvel inventaire -->
        <div class="card card-clickable" onclick="InventaireActions.startComptage()">
          <div class="card-body text-center">
            <div class="stat-card-icon" style="background: var(--color-primary); color: white; margin: 0 auto;">
              📋
            </div>
            <h3 class="mt-md">Nouvel inventaire</h3>
            <p class="text-secondary">Compter le stock physique</p>
          </div>
        </div>

        <!-- Carte: Ajustement rapide -->
        <div class="card card-clickable" onclick="InventaireActions.showAjustementRapide()">
          <div class="card-body text-center">
            <div class="stat-card-icon" style="background: var(--color-warning); color: white; margin: 0 auto;">
              ⚡
            </div>
            <h3 class="mt-md">Ajustement rapide</h3>
            <p class="text-secondary">Corriger un article</p>
          </div>
        </div>

        <!-- Carte: Historique -->
        <div class="card card-clickable" onclick="InventaireActions.showHistorique()">
          <div class="card-body text-center">
            <div class="stat-card-icon" style="background: var(--color-secondary); color: white; margin: 0 auto;">
              📊
            </div>
            <h3 class="mt-md">Historique</h3>
            <p class="text-secondary">Voir les ajustements passés</p>
          </div>
        </div>
      </div>

      ${ajustementsRecents.length > 0 ? `
        <div class="card mt-md">
          <div class="card-header">
            <strong>Derniers ajustements</strong>
            <button class="btn btn-sm btn-secondary" onclick="InventaireActions.showHistorique()">
              Tout voir
            </button>
          </div>
          <div class="card-body" style="padding: 0;">
            <div class="list">
              ${ajustementsRecents.map(a => renderAjustementItem(a)).join('')}
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Écran de comptage d'inventaire
 */
function renderComptageInventaire() {
  const state = InventaireScreenState.comptage;
  const boutiques = InventaireScreenState.boutiques;

  // Filtrer les articles par boutique si sélectionnée
  let articlesACompter = InventaireScreenState.articles.filter(a => a.actif !== false);
  if (state.boutique) {
    articlesACompter = articlesACompter.filter(a => a.boutique === state.boutique);
  }

  const statsComptage = {
    total: articlesACompter.length,
    comptes: state.items.length,
    restants: articlesACompter.length - state.items.length,
    avecEcart: state.items.filter(i => i.difference !== 0).length
  };

  return `
    <div class="inventaire-comptage">
      <div class="screen-header">
        <button class="btn btn-secondary btn-sm" onclick="InventaireActions.cancelComptage()">
          ← Retour
        </button>
        <h2>Inventaire physique</h2>
      </div>

      <!-- Configuration -->
      ${!state.enCours ? `
        <div class="card mb-md">
          <div class="card-header">
            <strong>Configuration de l'inventaire</strong>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label for="comptage-boutique">Boutique *</label>
              <select id="comptage-boutique" class="form-input" onchange="InventaireActions.updateComptageField('boutique', this.value)">
                <option value="">Toutes les boutiques</option>
                ${boutiques.map(b => `
                  <option value="${b.nom}" ${state.boutique === b.nom ? 'selected' : ''}>${b.nom}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="comptage-date">Date de l'inventaire</label>
              <input
                type="date"
                id="comptage-date"
                class="form-input"
                value="${state.date}"
                onchange="InventaireActions.updateComptageField('date', this.value)"
              />
            </div>

            <button class="btn btn-primary btn-block" onclick="InventaireActions.demarrerComptage()">
              Démarrer le comptage
            </button>
          </div>
        </div>
      ` : `
        <!-- Statistiques du comptage -->
        <div class="stats-grid mb-md">
          <div class="stat-card">
            <div class="stat-card-value">${statsComptage.total}</div>
            <div class="stat-card-label">Articles à compter</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-value text-success">${statsComptage.comptes}</div>
            <div class="stat-card-label">Comptés</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-value text-warning">${statsComptage.restants}</div>
            <div class="stat-card-label">Restants</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-value text-error">${statsComptage.avecEcart}</div>
            <div class="stat-card-label">Avec écart</div>
          </div>
        </div>

        <!-- Recherche d'article -->
        <div class="card mb-md">
          <div class="card-body">
            <div class="form-group" style="margin-bottom: 0;">
              <label for="article-search-comptage">Rechercher un article</label>
              <input
                type="text"
                id="article-search-comptage"
                class="form-input"
                placeholder="Nom de l'article..."
              />
              <div id="article-search-comptage-results" class="autocomplete-results"></div>
            </div>
          </div>
        </div>

        <!-- Liste des articles comptés -->
        ${state.items.length > 0 ? `
          <div class="card mb-md">
            <div class="card-header">
              <strong>Articles comptés (${state.items.length})</strong>
            </div>
            <div class="card-body">
              <div class="comptage-list">
                ${state.items.map((item, index) => renderComptageItem(item, index)).join('')}
              </div>
            </div>
          </div>
        ` : `
          <div class="empty-state">
            <p>Aucun article compté. Recherchez et comptez les articles ci-dessus.</p>
          </div>
        `}

        <!-- Actions -->
        ${state.items.length > 0 ? `
          <div class="btn-group">
            <button class="btn btn-secondary" onclick="InventaireActions.cancelComptage()">
              Annuler
            </button>
            <button class="btn btn-success" onclick="InventaireActions.validerInventaire()">
              Valider l'inventaire (${state.items.length} articles)
            </button>
          </div>
        ` : ''}

        <script>
          setTimeout(() => {
            FormHelpers.setupAutocomplete(
              'article-search-comptage',
              ${JSON.stringify(articlesACompter)},
              (article) => InventaireActions.showCompterArticleModal(article),
              ['nom', 'categorie']
            );
          }, 100);
        </script>
      `}
    </div>
  `;
}

/**
 * Item de comptage
 */
function renderComptageItem(item, index) {
  const ecartClass = item.difference === 0 ? 'text-success' : 'text-error';
  const ecartSign = item.difference > 0 ? '+' : '';

  return `
    <div class="comptage-item">
      <div class="comptage-item-info">
        <div class="comptage-item-name">${item.articleNom}</div>
        <div class="comptage-item-stats">
          <span>Théorique: <strong>${item.stockTheorique}</strong></span>
          <span>→</span>
          <span>Compté: <strong>${item.stockCompte}</strong></span>
          <span class="${ecartClass}">
            (${ecartSign}${item.difference})
          </span>
        </div>
        ${item.notes ? `<div class="comptage-item-notes">${item.notes}</div>` : ''}
      </div>
      <div class="comptage-item-actions">
        <button class="btn btn-sm btn-outline" onclick="InventaireActions.editCompterArticle(${index})">
          Modifier
        </button>
        <button class="btn btn-sm btn-danger" onclick="InventaireActions.removeComptageItem(${index})">
          ✕
        </button>
      </div>
    </div>
  `;
}

/**
 * Historique des ajustements
 */
function renderHistoriqueAjustements() {
  const ajustements = InventaireScreenState.ajustements;

  return `
    <div class="historique-ajustements">
      <div class="screen-header">
        <button class="btn btn-secondary btn-sm" onclick="InventaireActions.backToMenu()">
          ← Retour
        </button>
        <h2>Historique des ajustements</h2>
      </div>

      ${ajustements.length > 0 ? `
        <div class="card">
          <div class="card-body" style="padding: 0;">
            <div class="list">
              ${ajustements.map(a => renderAjustementItem(a, true)).join('')}
            </div>
          </div>
        </div>
      ` : `
        <div class="empty-state">
          <p>Aucun ajustement enregistré</p>
        </div>
      `}
    </div>
  `;
}

/**
 * Item d'ajustement dans la liste
 */
function renderAjustementItem(ajustement, detailed = false) {
  const ecartClass = ajustement.difference >= 0 ? 'text-success' : 'text-error';
  const ecartSign = ajustement.difference > 0 ? '+' : '';

  return `
    <div class="list-item">
      <div class="list-item-content">
        <div class="list-item-title">${ajustement.article_nom || 'Article'}</div>
        <div class="list-item-subtitle">
          ${ajustement.type || 'Ajustement'} • ${Helpers.formatDate(ajustement.date_ajustement)}
        </div>
        ${detailed && ajustement.motif ? `
          <div class="list-item-subtitle">${ajustement.motif}</div>
        ` : ''}
      </div>
      <div class="list-item-meta">
        <div class="${ecartClass}" style="font-weight: 600;">
          ${ecartSign}${ajustement.difference}
        </div>
        <div class="text-secondary" style="font-size: 0.75rem;">
          ${ajustement.quantite_avant} → ${ajustement.quantite_apres}
        </div>
      </div>
    </div>
  `;
}

/**
 * Actions de l'écran Inventaire
 */
window.InventaireActions = {
  /**
   * Navigation
   */
  startComptage() {
    InventaireScreenState.view = 'comptage';
    InventaireScreenState.resetComptage();
    Router.refresh();
  },

  showHistorique() {
    InventaireScreenState.view = 'historique';
    Router.refresh();
  },

  backToMenu() {
    InventaireScreenState.view = 'menu';
    Router.refresh();
  },

  /**
   * Comptage
   */
  updateComptageField(field, value) {
    InventaireScreenState.comptage[field] = value;
    Router.refresh();
  },

  demarrerComptage() {
    InventaireScreenState.comptage.enCours = true;
    Router.refresh();
  },

  cancelComptage() {
    if (InventaireScreenState.comptage.items.length > 0) {
      UIComponents.showModal(
        'Annuler l\'inventaire',
        '<p>Êtes-vous sûr de vouloir annuler ? Les données de comptage seront perdues.</p>',
        [
          { label: 'Non', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
          { label: 'Oui, annuler', class: 'btn-danger', onclick: 'InventaireActions.confirmCancelComptage()' }
        ]
      );
    } else {
      this.backToMenu();
    }
  },

  confirmCancelComptage() {
    UIComponents.closeModal();
    this.backToMenu();
  },

  /**
   * Affiche le modal pour compter un article
   */
  showCompterArticleModal(article) {
    document.getElementById('article-search-comptage').value = '';
    document.getElementById('article-search-comptage-results').innerHTML = '';

    // Vérifier si déjà compté
    const dejaCompte = InventaireScreenState.comptage.items.find(i => i.articleId === article.id);
    if (dejaCompte) {
      UIComponents.showToast('Cet article a déjà été compté', 'warning');
      return;
    }

    const stockTheorique = article.stock_total || 0;

    UIComponents.showModal(
      'Compter l\'article',
      `
        <div class="form-group">
          <label>Article</label>
          <div class="form-input" disabled>${article.nom}</div>
        </div>
        <div class="form-group">
          <label>Stock théorique</label>
          <div class="form-input" disabled>${stockTheorique} unités</div>
        </div>
        <div class="form-group">
          <label for="modal-stock-compte">Stock physique compté *</label>
          <input type="number" id="modal-stock-compte" class="form-input" value="${stockTheorique}" min="0" autofocus />
        </div>
        <div class="form-group">
          <label for="modal-comptage-notes">Notes</label>
          <textarea id="modal-comptage-notes" class="form-input" rows="2" placeholder="Observations..."></textarea>
        </div>
      `,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Enregistrer', class: 'btn-primary', onclick: `InventaireActions.confirmCompterArticle('${article.id}', '${article.nom.replace(/'/g, "\\'")}', ${stockTheorique})` }
      ]
    );
  },

  confirmCompterArticle(articleId, articleNom, stockTheorique) {
    const stockCompte = parseInt(document.getElementById('modal-stock-compte').value) || 0;
    const notes = document.getElementById('modal-comptage-notes').value.trim();

    InventaireScreenState.comptage.items.push({
      articleId,
      articleNom,
      stockTheorique,
      stockCompte,
      difference: stockCompte - stockTheorique,
      notes
    });

    UIComponents.closeModal();
    Router.refresh();
    UIComponents.showToast('Article compté', 'success');
  },

  editCompterArticle(index) {
    const item = InventaireScreenState.comptage.items[index];

    UIComponents.showModal(
      'Modifier le comptage',
      `
        <div class="form-group">
          <label>Article</label>
          <div class="form-input" disabled>${item.articleNom}</div>
        </div>
        <div class="form-group">
          <label>Stock théorique</label>
          <div class="form-input" disabled>${item.stockTheorique} unités</div>
        </div>
        <div class="form-group">
          <label for="modal-stock-compte-edit">Stock physique compté *</label>
          <input type="number" id="modal-stock-compte-edit" class="form-input" value="${item.stockCompte}" min="0" autofocus />
        </div>
        <div class="form-group">
          <label for="modal-comptage-notes-edit">Notes</label>
          <textarea id="modal-comptage-notes-edit" class="form-input" rows="2">${item.notes || ''}</textarea>
        </div>
      `,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Enregistrer', class: 'btn-primary', onclick: `InventaireActions.confirmEditCompterArticle(${index})` }
      ]
    );
  },

  confirmEditCompterArticle(index) {
    const stockCompte = parseInt(document.getElementById('modal-stock-compte-edit').value) || 0;
    const notes = document.getElementById('modal-comptage-notes-edit').value.trim();

    const item = InventaireScreenState.comptage.items[index];
    item.stockCompte = stockCompte;
    item.difference = stockCompte - item.stockTheorique;
    item.notes = notes;

    UIComponents.closeModal();
    Router.refresh();
    UIComponents.showToast('Comptage modifié', 'success');
  },

  async removeComptageItem(index) {
    InventaireScreenState.comptage.items.splice(index, 1);
    await Router.refresh();
  },

  /**
   * Valide l'inventaire et crée les ajustements
   */
  async validerInventaire() {
    const items = InventaireScreenState.comptage.items;
    const itemsAvecEcart = items.filter(i => i.difference !== 0);

    if (itemsAvecEcart.length === 0) {
      UIComponents.showToast('Aucun écart détecté, inventaire conforme !', 'success');
      this.backToMenu();
      return;
    }

    UIComponents.showModal(
      'Valider l\'inventaire',
      `
        <p><strong>${itemsAvecEcart.length} article(s)</strong> avec écart détecté.</p>
        <p>Des ajustements seront enregistrés dans l'historique.</p>
        <div class="alert alert-warning mt-md">
          <strong>Note:</strong> Le stock théorique dans Airtable est calculé automatiquement via les lots et ventes.
          Ces ajustements servent uniquement d'historique pour tracer les écarts d'inventaire.
        </div>
      `,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Valider', class: 'btn-success', onclick: 'InventaireActions.confirmValiderInventaire()' }
      ]
    );
  },

  async confirmValiderInventaire() {
    try {
      UIComponents.closeModal();
      UIComponents.showToast('Enregistrement de l\'inventaire...', 'info');

      const comptages = InventaireScreenState.comptage.items.map(item => ({
        articleId: item.articleId,
        quantiteComptee: item.stockCompte,
        notes: item.notes
      }));

      const ajustements = await AjustementStockModel.effectuerInventaire(comptages);

      UIComponents.showToast(`Inventaire validé ! ${ajustements.length} ajustement(s) enregistré(s).`, 'success');

      // Retour au menu
      InventaireScreenState.view = 'menu';
      await Router.navigate('/inventaire');

    } catch (error) {
      console.error('Erreur validation inventaire:', error);
      UIComponents.showToast('Erreur : ' + error.message, 'error');
    }
  },

  /**
   * Ajustement rapide d'un article
   */
  showAjustementRapide() {
    const articles = InventaireScreenState.articles.filter(a => a.actif !== false);
    const types = Object.values(AjustementStockModel.Types);

    UIComponents.showModal(
      'Ajustement rapide',
      `
        <div class="form-group">
          <label for="ajust-article-search">Rechercher un article *</label>
          <input
            type="text"
            id="ajust-article-search"
            class="form-input"
            placeholder="Nom de l'article..."
          />
          <div id="ajust-article-search-results" class="autocomplete-results"></div>
        </div>
        <div class="form-group">
          <label for="ajust-type">Type d'ajustement *</label>
          <select id="ajust-type" class="form-input">
            ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="ajust-quantite">Nouvelle quantité *</label>
          <input type="number" id="ajust-quantite" class="form-input" value="0" min="0" />
        </div>
        <div class="form-group">
          <label for="ajust-motif">Motif *</label>
          <input type="text" id="ajust-motif" class="form-input" placeholder="Raison de l'ajustement" />
        </div>
        <div class="form-group">
          <label for="ajust-notes">Notes</label>
          <textarea id="ajust-notes" class="form-input" rows="2"></textarea>
        </div>

        <script>
          setTimeout(() => {
            let selectedArticle = null;
            FormHelpers.setupAutocomplete(
              'ajust-article-search',
              ${JSON.stringify(articles)},
              (article) => {
                selectedArticle = article;
                document.getElementById('ajust-article-search').value = article.nom;
                document.getElementById('ajust-article-search').dataset.articleId = article.id;
                document.getElementById('ajust-quantite').value = article.stock_total || 0;
                document.getElementById('ajust-article-search-results').innerHTML = '';
              },
              ['nom', 'categorie']
            );
          }, 100);
        </script>
      `,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Enregistrer', class: 'btn-success', onclick: 'InventaireActions.confirmAjustementRapide()' }
      ]
    );
  },

  async confirmAjustementRapide() {
    const articleId = document.getElementById('ajust-article-search').dataset.articleId;
    const type = document.getElementById('ajust-type').value;
    const quantite = parseInt(document.getElementById('ajust-quantite').value) || 0;
    const motif = document.getElementById('ajust-motif').value.trim();
    const notes = document.getElementById('ajust-notes').value.trim();

    if (!articleId || !motif) {
      UIComponents.showToast('Veuillez sélectionner un article et indiquer un motif', 'error');
      return;
    }

    try {
      UIComponents.closeModal();
      UIComponents.showToast('Enregistrement de l\'ajustement...', 'info');

      await AjustementStockModel.ajusterStock(articleId, quantite, type, motif, notes);

      UIComponents.showToast('Ajustement enregistré !', 'success');

      // Recharger l'écran
      await Router.navigate('/inventaire');

    } catch (error) {
      console.error('Erreur ajustement rapide:', error);
      UIComponents.showToast('Erreur : ' + error.message, 'error');
    }
  }
};
