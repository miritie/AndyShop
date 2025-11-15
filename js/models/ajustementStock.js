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
    return AirtableService.create(this.tableName, {
      article: [data.articleId], // Link to Article
      type: data.type,
      quantite_avant: data.quantite_avant,
      quantite_apres: data.quantite_apres,
      difference: data.quantite_apres - data.quantite_avant,
      date_ajustement: data.date_ajustement || new Date().toISOString(),
      motif: data.motif || '',
      notes: data.notes || '',
      utilisateur: data.utilisateur || 'Admin'
    });
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

      // Créer l'ajustement
      const ajustement = await this.create({
        articleId,
        type,
        quantite_avant: quantiteAvant,
        quantite_apres: nouvelleQuantite,
        motif,
        notes,
        date_ajustement: new Date().toISOString()
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
          notes: comptage.notes || `Écart de ${Math.abs(stockTheorique - stockPhysique)} unité(s)`,
          date_ajustement: new Date().toISOString()
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
