/**
 * Modèle AjustementStock
 * Gère les ajustements manuels de stock (inventaire, pertes, casse, etc.)
 */

window.AjustementStockModel = {
  tableName: 'Ajustements_Stock',

  /**
   * Types d'ajustement
   */
  Types: {
    INVENTAIRE: 'Inventaire',
    PERTE: 'Perte',
    CASSE: 'Casse',
    VOL: 'Vol',
    RETOUR: 'Retour',
    AUTRE: 'Autre'
  },

  /**
   * Récupère tous les ajustements
   */
  async getAll(options = {}) {
    return AirtableService.getAll(this.tableName, {
      sort: [{ field: 'date_ajustement', direction: 'desc' }],
      ...options
    });
  },

  /**
   * Récupère un ajustement par ID
   */
  async getById(id) {
    return AirtableService.getById(this.tableName, id);
  },

  /**
   * Récupère les ajustements par article
   */
  async getByArticle(articleId) {
    const formula = `{article}="${articleId}"`;
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Récupère les ajustements par type
   */
  async getByType(type) {
    const formula = `{type}="${type}"`;
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Crée un ajustement de stock
   * @param {Object} data - Données de l'ajustement
   * @returns {Promise<Object>} L'ajustement créé
   */
  async create(data) {
    // Préparer les données de base
    const ajustementData = {
      article: [data.articleId], // Link to Article
      type: data.type,
      quantite_avant: data.quantite_avant,
      quantite_apres: data.quantite_apres,
      difference: data.quantite_apres - data.quantite_avant,
      utilisateur: data.utilisateur || 'Admin'
    };

    // Airtable Date field (sans heure) attend format YYYY-MM-DD
    const dateAjustement = data.date_ajustement ? new Date(data.date_ajustement) : new Date();
    const dateOnly = dateAjustement.toISOString().split('T')[0];
    ajustementData.date_ajustement = dateOnly;

    // Ajouter les champs optionnels seulement s'ils sont fournis et non vides
    if (data.motif) ajustementData.motif = data.motif;
    if (data.notes) ajustementData.notes = data.notes;

    return AirtableService.create(this.tableName, ajustementData);
  },

  /**
   * Effectue un ajustement de stock complet
   * Crée l'ajustement ET met à jour le stock réel
   * @param {string} articleId - ID de l'article
   * @param {number} nouvelleQuantite - Nouvelle quantité en stock
   * @param {string} type - Type d'ajustement
   * @param {string} motif - Motif de l'ajustement
   * @param {string} notes - Notes optionnelles
   * @returns {Promise<Object>} L'ajustement créé
   */
  async ajusterStock(articleId, nouvelleQuantite, type, motif, notes = '') {
    try {
      // Récupérer l'article pour connaître le stock actuel
      const article = await ArticleModel.getById(articleId);
      const quantiteAvant = article.stock_total || 0;

      // Créer l'ajustement (date_ajustement sera formatée dans create())
      const ajustement = await this.create({
        articleId,
        type,
        quantite_avant: quantiteAvant,
        quantite_apres: nouvelleQuantite,
        motif,
        notes
      });

      // Note: Le stock réel sera mis à jour via les lignes de lot
      // Cette fonction crée principalement un enregistrement d'audit

      return ajustement;
    } catch (error) {
      console.error('Erreur lors de l\'ajustement de stock:', error);
      throw error;
    }
  },

  /**
   * Effectue un inventaire complet
   * Compare le stock théorique au stock physique compté
   * @param {Array} comptages - [{articleId, quantiteComptee, notes}]
   * @returns {Promise<Array>} Les ajustements créés
   */
  async effectuerInventaire(comptages) {
    const ajustements = [];

    for (const comptage of comptages) {
      const article = await ArticleModel.getById(comptage.articleId);
      const stockTheorique = article.stock_total || 0;
      const stockPhysique = comptage.quantiteComptee;

      // Si différence, créer un ajustement
      if (stockTheorique !== stockPhysique) {
        const ajustement = await this.create({
          articleId: comptage.articleId,
          type: this.Types.INVENTAIRE,
          quantite_avant: stockTheorique,
          quantite_apres: stockPhysique,
          motif: 'Inventaire physique',
          notes: comptage.notes || `Écart de ${Math.abs(stockTheorique - stockPhysique)} unité(s)`
        });

        ajustements.push(ajustement);
      }
    }

    return ajustements;
  },

  /**
   * Supprime un ajustement
   */
  async delete(id) {
    return AirtableService.delete(this.tableName, id);
  }
};
