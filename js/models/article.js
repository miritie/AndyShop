/**
 * Modèle Article
 */

window.ArticleModel = {
  tableName: AppConfig?.airtable?.tables?.articles || 'Articles',

  /**
   * Récupère tous les articles
   */
  async getAll(options = {}) {
    return AirtableService.getAll(this.tableName, {
      sort: [{ field: 'nom', direction: 'asc' }],
      ...options
    });
  },

  /**
   * Récupère un article par ID
   */
  async getById(id) {
    return AirtableService.getById(this.tableName, id);
  },

  /**
   * Récupère les articles actifs uniquement
   */
  async getActifs() {
    const formula = '{actif}=TRUE()';
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Récupère les articles par catégorie
   */
  async getByCategorie(categorie) {
    const formula = `{categorie}="${categorie}"`;
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Récupère les articles par boutique
   */
  async getByBoutique(boutique) {
    const formula = `{boutique}="${boutique}"`;
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Crée un article
   */
  async create(data) {
    return AirtableService.create(this.tableName, {
      nom: data.nom,
      boutique: data.boutique,
      categorie: data.categorie || '',
      image_url: data.image_url || '',
      notes: data.notes || '',
      actif: data.actif !== false,
      date_creation: new Date().toISOString()
    });
  },

  /**
   * Met à jour un article
   */
  async update(id, data) {
    return AirtableService.update(this.tableName, id, data);
  },

  /**
   * Désactive un article (soft delete)
   */
  async deactivate(id) {
    return this.update(id, { actif: false });
  },

  /**
   * Réactive un article
   */
  async activate(id) {
    return this.update(id, { actif: true });
  },

  /**
   * Supprime définitivement un article
   */
  async delete(id) {
    return AirtableService.delete(this.tableName, id);
  },

  /**
   * Upload une image d'article
   * @param {File} file - Fichier image
   * @returns {Promise<string>} URL de l'image uploadée
   */
  async uploadImage(file) {
    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté. Utilisez JPG, PNG ou WebP.');
    }

    if (file.size > maxSize) {
      throw new Error('Fichier trop volumineux. Taille maximale : 5MB.');
    }

    // Pour l'instant, on utilise un service d'upload d'images
    // À adapter selon le service d'upload utilisé (Cloudinary, AWS S3, etc.)
    return ImageUploadService.upload(file);
  }
};
