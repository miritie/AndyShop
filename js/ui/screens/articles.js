/**
 * Écran Articles - Gestion du catalogue produits
 */

// État de l'écran Articles
const ArticlesScreenState = {
  view: 'list', // 'list' | 'create' | 'edit' | 'detail'
  selectedArticle: null,
  articles: [],
  boutiques: [],
  filter: {
    boutique: 'all',
    categorie: 'all',
    actif: 'all',
    search: ''
  },
  form: {
    id: null,
    nom: '',
    boutique: '',
    categorie: '',
    image_url: '',
    imageFile: null,
    notes: '',
    actif: true
  },

  resetForm() {
    this.form = {
      id: null,
      nom: '',
      boutique: '',
      categorie: '',
      image_url: '',
      imageFile: null,
      notes: '',
      actif: true
    };
  },

  getCategories() {
    const categories = [...new Set(this.articles.map(a => a.categorie).filter(Boolean))];
    return categories.sort();
  }
};

window.ArticlesScreen = async () => {
  try {
    // Charger les données
    const [articles, boutiques] = await Promise.all([
      ArticleModel.getAll(),
      BoutiqueModel.getAll()
    ]);

    ArticlesScreenState.articles = articles || [];
    ArticlesScreenState.boutiques = boutiques || [];

    return renderArticlesMain();
  } catch (error) {
    console.error('Error loading articles screen:', error);
    Helpers.log('error', 'Articles screen error', error);
    return `<div class="error">Erreur lors du chargement des articles: ${error.message}</div>`;
  }
};

/**
 * Rendu principal
 */
function renderArticlesMain() {
  const state = ArticlesScreenState;

  if (state.view === 'create' || state.view === 'edit') {
    return renderArticleForm();
  } else if (state.view === 'detail' && state.selectedArticle) {
    return renderArticleDetail();
  } else {
    return renderArticlesList();
  }
}

/**
 * Liste des articles
 */
function renderArticlesList() {
  const state = ArticlesScreenState;

  // Filtrer les articles
  let articlesFiltered = state.articles || [];

  if (state.filter.boutique !== 'all') {
    articlesFiltered = articlesFiltered.filter(a => a.boutique === state.filter.boutique);
  }

  if (state.filter.categorie !== 'all') {
    articlesFiltered = articlesFiltered.filter(a => a.categorie === state.filter.categorie);
  }

  if (state.filter.actif !== 'all') {
    const isActif = state.filter.actif === 'actif';
    articlesFiltered = articlesFiltered.filter(a => a.actif === isActif);
  }

  if (state.filter.search) {
    const search = state.filter.search.toLowerCase();
    articlesFiltered = articlesFiltered.filter(a =>
      a.nom?.toLowerCase().includes(search) ||
      a.categorie?.toLowerCase().includes(search) ||
      a.notes?.toLowerCase().includes(search)
    );
  }

  // Statistiques
  const stats = {
    total: (state.articles || []).length,
    actifs: (state.articles || []).filter(a => a.actif).length,
    inactifs: (state.articles || []).filter(a => !a.actif).length,
    categories: state.getCategories().length
  };

  const categories = state.getCategories();

  return `
    <div class="articles-screen">
      <div class="screen-header">
        <h2>Catalogue Articles</h2>
        <button class="btn btn-primary" onclick="ArticlesActions.startCreate()">
          + Nouvel article
        </button>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid mb-md">
        <div class="stat-card">
          <div class="stat-card-value">${stats.total}</div>
          <div class="stat-card-label">Total articles</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value text-success">${stats.actifs}</div>
          <div class="stat-card-label">Actifs</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value text-error">${stats.inactifs}</div>
          <div class="stat-card-label">Inactifs</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${stats.categories}</div>
          <div class="stat-card-label">Catégories</div>
        </div>
      </div>

      <!-- Recherche et filtres -->
      <div class="card mb-md">
        <div class="card-body">
          <div class="form-group">
            <input
              type="text"
              class="form-input"
              placeholder="Rechercher un article..."
              value="${state.filter.search}"
              oninput="ArticlesActions.setSearch(this.value)"
            />
          </div>

          <div class="filters-row">
            <select class="form-input" onchange="ArticlesActions.setFilterBoutique(this.value)">
              <option value="all" ${state.filter.boutique === 'all' ? 'selected' : ''}>Toutes les boutiques</option>
              ${(state.boutiques || []).map(b => `
                <option value="${b.nom}" ${state.filter.boutique === b.nom ? 'selected' : ''}>${b.nom}</option>
              `).join('')}
            </select>

            <select class="form-input" onchange="ArticlesActions.setFilterCategorie(this.value)">
              <option value="all" ${state.filter.categorie === 'all' ? 'selected' : ''}>Toutes les catégories</option>
              ${categories.map(c => `
                <option value="${c}" ${state.filter.categorie === c ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>

            <select class="form-input" onchange="ArticlesActions.setFilterActif(this.value)">
              <option value="all" ${state.filter.actif === 'all' ? 'selected' : ''}>Tous les statuts</option>
              <option value="actif" ${state.filter.actif === 'actif' ? 'selected' : ''}>Actifs</option>
              <option value="inactif" ${state.filter.actif === 'inactif' ? 'selected' : ''}>Inactifs</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Liste des articles -->
      ${articlesFiltered.length > 0 ? `
        <div class="articles-grid">
          ${articlesFiltered.map(article => renderArticleCard(article)).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p>Aucun article trouvé</p>
          ${state.filter.search || state.filter.boutique !== 'all' || state.filter.categorie !== 'all' ? `
            <button class="btn btn-secondary mt-md" onclick="ArticlesActions.resetFilters()">
              Réinitialiser les filtres
            </button>
          ` : `
            <button class="btn btn-primary mt-md" onclick="ArticlesActions.startCreate()">
              + Créer le premier article
            </button>
          `}
        </div>
      `}
    </div>
  `;
}

/**
 * Carte d'article
 */
function renderArticleCard(article) {
  return `
    <div class="article-card ${!article.actif ? 'article-inactive' : ''}" onclick="ArticlesActions.selectArticle('${article.id}')">
      <div class="article-image" style="background-image: url('${article.image_url || 'https://via.placeholder.com/200/e5e7eb/9ca3af?text=Pas+d%27image'}')">
        ${!article.actif ? '<div class="article-inactive-badge">Inactif</div>' : ''}
      </div>
      <div class="article-content">
        <div class="article-name">${article.nom}</div>
        <div class="article-meta">
          <span class="badge badge-primary">${article.categorie || 'Sans catégorie'}</span>
          <span class="badge badge-secondary">${article.boutique || 'N/A'}</span>
        </div>
        ${article.notes ? `
          <div class="article-notes">${Helpers.truncate(article.notes, 60)}</div>
        ` : ''}
      </div>
      <div class="article-actions" onclick="event.stopPropagation()">
        <button class="btn btn-sm btn-outline" onclick="ArticlesActions.startEdit('${article.id}')">
          Modifier
        </button>
        ${article.actif ? `
          <button class="btn btn-sm btn-warning" onclick="ArticlesActions.toggleActif('${article.id}', false)">
            Désactiver
          </button>
        ` : `
          <button class="btn btn-sm btn-success" onclick="ArticlesActions.toggleActif('${article.id}', true)">
            Activer
          </button>
        `}
      </div>
    </div>
  `;
}

/**
 * Formulaire article (création/édition)
 */
function renderArticleForm() {
  const state = ArticlesScreenState;
  const isEdit = state.view === 'edit';
  const form = state.form;

  return `
    <div class="article-form-container">
      <div class="form-header">
        <button class="btn btn-secondary btn-sm" onclick="ArticlesActions.cancelForm()">
          ← Retour
        </button>
        <h2>${isEdit ? 'Modifier l\'article' : 'Nouvel article'}</h2>
      </div>

      <div class="card">
        <div class="card-body">
          <!-- Image de l'article -->
          <div class="form-group">
            <label>Image de l'article</label>
            <div class="image-upload-container">
              <div
                class="image-preview"
                id="image-preview"
                style="background-image: url('${form.image_url || 'https://via.placeholder.com/300/e5e7eb/9ca3af?text=Aucune+image'}')"
              >
                ${!form.image_url && !form.imageFile ? '<span>Cliquez pour ajouter une image</span>' : ''}
              </div>
              <input
                type="file"
                id="image-input"
                accept="image/*"
                style="display: none;"
                onchange="ArticlesActions.handleImageSelect(event)"
              />
              <button
                class="btn btn-secondary btn-block mt-md"
                onclick="document.getElementById('image-input').click()"
              >
                ${form.image_url || form.imageFile ? 'Changer l\'image' : 'Ajouter une image'}
              </button>
              ${form.image_url || form.imageFile ? `
                <button class="btn btn-danger btn-block mt-sm" onclick="ArticlesActions.removeImage()">
                  Supprimer l'image
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Nom -->
          <div class="form-group">
            <label for="article-nom">Nom de l'article *</label>
            <input
              type="text"
              id="article-nom"
              class="form-input"
              placeholder="Ex: Nike Air Max 90"
              value="${form.nom}"
              oninput="ArticlesActions.updateField('nom', this.value)"
            />
          </div>

          <!-- Boutique -->
          <div class="form-group">
            <label for="article-boutique">Boutique *</label>
            <select
              id="article-boutique"
              class="form-input"
              onchange="ArticlesActions.updateField('boutique', this.value)"
            >
              <option value="">Sélectionner une boutique</option>
              ${(state.boutiques || []).map(b => `
                <option value="${b.nom}" ${form.boutique === b.nom ? 'selected' : ''}>${b.nom}</option>
              `).join('')}
            </select>
          </div>

          <!-- Catégorie -->
          <div class="form-group">
            <label for="article-categorie">Catégorie</label>
            <input
              type="text"
              id="article-categorie"
              class="form-input"
              placeholder="Ex: Chaussure, Parfum, Bijou..."
              value="${form.categorie}"
              oninput="ArticlesActions.updateField('categorie', this.value)"
              list="categories-list"
            />
            <datalist id="categories-list">
              ${state.getCategories().map(c => `<option value="${c}">`).join('')}
            </datalist>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label for="article-notes">Notes / Description</label>
            <textarea
              id="article-notes"
              class="form-input"
              rows="4"
              placeholder="Détails, caractéristiques, pointures disponibles..."
              oninput="ArticlesActions.updateField('notes', this.value)"
            >${form.notes}</textarea>
          </div>

          <!-- Actif -->
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                ${form.actif ? 'checked' : ''}
                onchange="ArticlesActions.updateField('actif', this.checked)"
              />
              <span>Article actif (visible dans le catalogue)</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="btn-group mt-md">
        <button class="btn btn-secondary" onclick="ArticlesActions.cancelForm()">
          Annuler
        </button>
        <button
          class="btn btn-success"
          onclick="ArticlesActions.submitForm()"
          ${!form.nom || !form.boutique ? 'disabled' : ''}
        >
          ${isEdit ? 'Enregistrer les modifications' : 'Créer l\'article'}
        </button>
      </div>
    </div>
  `;
}

/**
 * Détail d'un article
 */
function renderArticleDetail() {
  const state = ArticlesScreenState;
  const article = state.articles.find(a => a.id === state.selectedArticle);

  if (!article) {
    ArticlesScreenState.view = 'list';
    return renderArticlesList();
  }

  return `
    <div class="article-detail">
      <div class="detail-header">
        <button class="btn btn-secondary btn-sm" onclick="ArticlesActions.backToList()">
          ← Retour
        </button>
        <h2>Détail de l'article</h2>
      </div>

      <div class="card mb-md">
        <div class="article-detail-image" style="background-image: url('${article.image_url || 'https://via.placeholder.com/400/e5e7eb/9ca3af?text=Pas+d%27image'}')">
          ${!article.actif ? '<div class="article-inactive-badge">Inactif</div>' : ''}
        </div>
        <div class="card-body">
          <h3 class="article-detail-name">${article.nom}</h3>

          <div class="article-detail-meta mb-md">
            <span class="badge badge-lg badge-primary">${article.categorie || 'Sans catégorie'}</span>
            <span class="badge badge-lg badge-secondary">${article.boutique || 'N/A'}</span>
            <span class="badge badge-lg ${article.actif ? 'badge-success' : 'badge-error'}">
              ${article.actif ? 'Actif' : 'Inactif'}
            </span>
          </div>

          ${article.notes ? `
            <div class="article-detail-section">
              <h4>Description</h4>
              <p>${article.notes}</p>
            </div>
          ` : ''}

          <div class="article-detail-section">
            <h4>Informations</h4>
            <div class="summary-row">
              <span>Date de création :</span>
              <strong>${Helpers.formatDate(article.date_creation)}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="btn-group">
        <button class="btn btn-primary" onclick="ArticlesActions.startEdit('${article.id}')">
          Modifier
        </button>
        ${article.actif ? `
          <button class="btn btn-warning" onclick="ArticlesActions.toggleActif('${article.id}', false)">
            Désactiver
          </button>
        ` : `
          <button class="btn btn-success" onclick="ArticlesActions.toggleActif('${article.id}', true)">
            Activer
          </button>
        `}
        <button class="btn btn-danger" onclick="ArticlesActions.deleteArticle('${article.id}')">
          Supprimer
        </button>
      </div>
    </div>
  `;
}

/**
 * Actions de l'écran Articles
 */
window.ArticlesActions = {
  /**
   * Filtres
   */
  setSearch(value) {
    ArticlesScreenState.filter.search = value;
    Router.refresh();
  },

  setFilterBoutique(value) {
    ArticlesScreenState.filter.boutique = value;
    Router.refresh();
  },

  setFilterCategorie(value) {
    ArticlesScreenState.filter.categorie = value;
    Router.refresh();
  },

  setFilterActif(value) {
    ArticlesScreenState.filter.actif = value;
    Router.refresh();
  },

  resetFilters() {
    ArticlesScreenState.filter = {
      boutique: 'all',
      categorie: 'all',
      actif: 'all',
      search: ''
    };
    Router.refresh();
  },

  /**
   * Navigation
   */
  selectArticle(articleId) {
    ArticlesScreenState.selectedArticle = articleId;
    ArticlesScreenState.view = 'detail';
    Router.refresh();
  },

  backToList() {
    ArticlesScreenState.view = 'list';
    ArticlesScreenState.selectedArticle = null;
    Router.refresh();
  },

  /**
   * Formulaire
   */
  startCreate() {
    ArticlesScreenState.resetForm();
    ArticlesScreenState.view = 'create';
    Router.refresh();
  },

  startEdit(articleId) {
    const article = ArticlesScreenState.articles.find(a => a.id === articleId);
    if (!article) return;

    ArticlesScreenState.form = {
      id: article.id,
      nom: article.nom || '',
      boutique: article.boutique || '',
      categorie: article.categorie || '',
      image_url: article.image_url || '',
      imageFile: null,
      notes: article.notes || '',
      actif: article.actif !== false
    };

    ArticlesScreenState.view = 'edit';
    Router.refresh();
  },

  cancelForm() {
    UIComponents.showModal(
      'Annuler les modifications',
      '<p>Êtes-vous sûr de vouloir annuler ? Les données non enregistrées seront perdues.</p>',
      [
        { label: 'Non', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Oui, annuler', class: 'btn-danger', onclick: 'ArticlesActions.confirmCancel()' }
      ]
    );
  },

  confirmCancel() {
    UIComponents.closeModal();
    ArticlesScreenState.view = 'list';
    Router.refresh();
  },

  updateField(field, value) {
    ArticlesScreenState.form[field] = value;
    Router.refresh();
  },

  /**
   * Gestion de l'image
   */
  async handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validation
    const validation = ImageUploadService.validate(file);
    if (!validation.valid) {
      UIComponents.showToast(validation.error, 'error');
      return;
    }

    try {
      // Prévisualisation immédiate
      const previewElement = document.getElementById('image-preview');
      if (previewElement) {
        ImageUploadService.preview(file, previewElement);
      }

      // Stocker le fichier pour upload lors de la soumission
      ArticlesScreenState.form.imageFile = file;
      ArticlesScreenState.form.image_url = ''; // On va uploader

      UIComponents.showToast('Image sélectionnée', 'success');
      await Router.refresh();

    } catch (error) {
      console.error('Erreur sélection image:', error);
      UIComponents.showToast('Erreur lors de la sélection de l\'image', 'error');
    }
  },

  removeImage() {
    ArticlesScreenState.form.image_url = '';
    ArticlesScreenState.form.imageFile = null;
    Router.refresh();
  },

  /**
   * Soumission du formulaire
   */
  async submitForm() {
    const form = ArticlesScreenState.form;
    const isEdit = ArticlesScreenState.view === 'edit';

    if (!form.nom || !form.boutique) {
      UIComponents.showToast('Veuillez remplir les champs obligatoires', 'error');
      return;
    }

    try {
      UIComponents.showToast(isEdit ? 'Modification en cours...' : 'Création en cours...', 'info');

      // Upload de l'image si un fichier a été sélectionné
      let imageUrl = form.image_url;
      if (form.imageFile) {
        try {
          imageUrl = await ArticleModel.uploadImage(form.imageFile);
        } catch (error) {
          console.error('Erreur upload image:', error);
          UIComponents.showToast('Erreur lors de l\'upload de l\'image, article créé sans image', 'warning');
          imageUrl = '';
        }
      }

      const data = {
        nom: form.nom,
        boutique: form.boutique,
        categorie: form.categorie,
        image_url: imageUrl,
        notes: form.notes,
        actif: form.actif
      };

      if (isEdit) {
        await ArticleModel.update(form.id, data);
        UIComponents.showToast('Article modifié avec succès !', 'success');
      } else {
        await ArticleModel.create(data);
        UIComponents.showToast('Article créé avec succès !', 'success');
      }

      // Retour à la liste
      ArticlesScreenState.view = 'list';
      await Router.navigate('/articles');

    } catch (error) {
      console.error('Erreur soumission formulaire:', error);
      UIComponents.showToast('Erreur : ' + error.message, 'error');
    }
  },

  /**
   * Activation/Désactivation
   */
  async toggleActif(articleId, actif) {
    try {
      if (actif) {
        await ArticleModel.activate(articleId);
        UIComponents.showToast('Article activé', 'success');
      } else {
        await ArticleModel.deactivate(articleId);
        UIComponents.showToast('Article désactivé', 'success');
      }

      await Router.refresh();

    } catch (error) {
      console.error('Erreur toggle actif:', error);
      UIComponents.showToast('Erreur : ' + error.message, 'error');
    }
  },

  /**
   * Suppression
   */
  deleteArticle(articleId) {
    const article = ArticlesScreenState.articles.find(a => a.id === articleId);
    if (!article) return;

    UIComponents.showModal(
      'Supprimer l\'article',
      `<p>Êtes-vous sûr de vouloir supprimer définitivement <strong>${article.nom}</strong> ?</p>
       <p class="text-error">Cette action est irréversible.</p>`,
      [
        { label: 'Annuler', class: 'btn-secondary', onclick: 'UIComponents.closeModal()' },
        { label: 'Supprimer', class: 'btn-danger', onclick: `ArticlesActions.confirmDelete('${articleId}')` }
      ]
    );
  },

  async confirmDelete(articleId) {
    try {
      UIComponents.closeModal();
      UIComponents.showToast('Suppression en cours...', 'info');

      await ArticleModel.delete(articleId);

      UIComponents.showToast('Article supprimé', 'success');

      ArticlesScreenState.view = 'list';
      await Router.navigate('/articles');

    } catch (error) {
      console.error('Erreur suppression:', error);
      UIComponents.showToast('Erreur : ' + error.message, 'error');
    }
  }
};
