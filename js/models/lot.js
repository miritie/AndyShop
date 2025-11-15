/**
 * Modèle Lot
 */

window.LotModel = {
  tableName: AppConfig?.airtable?.tables?.lots || 'Lots',
  lignesTableName: AppConfig?.airtable?.tables?.lignesLot || 'Lignes_Lot',

  /**
   * Récupère tous les lots
   */
  async getAll(options = {}) {
    return AirtableService.getAll(this.tableName, {
      sort: [{ field: 'date_achat', direction: 'desc' }],
      ...options
    });
  },

  /**
   * Récupère un lot par ID
   */
  async getById(id) {
    return AirtableService.getById(this.tableName, id);
  },

  /**
   * Récupère les lignes d'un lot
   */
  async getLignesLot(lotId) {
    const formula = `{lot}="${lotId}"`;
    return AirtableService.findByFormula(this.lignesTableName, formula);
  },

  /**
   * Crée un lot avec ses lignes
   */
  async create(data) {
    // Générer la référence
    const reference = Helpers.generateReference('lot', Date.now());

    // Calculer le coût total
    const coutTotal = (data.montant_global || 0) + (data.frais_divers || 0);

    // Créer le lot
    const lot = await AirtableService.create(this.tableName, {
      reference,
      fournisseur: data.fournisseur,
      date_achat: data.date_achat || new Date().toISOString(),
      lieu_achat: data.lieu_achat || Constants.LieuxAchat.LOCAL,
      devise: data.devise || Constants.Devises.XOF,
      montant_global: data.montant_global,
      frais_divers: data.frais_divers || 0,
      notes: data.notes || ''
    });

    // Créer les lignes du lot
    const lignes = await AirtableService.createMany(
      this.lignesTableName,
      data.lignes.map(ligne => ({
        lot: [lot.id],
        article: [ligne.articleId],
        quantite_initiale: ligne.quantite,
        cout_total_article: ligne.cout_unitaire * ligne.quantite,
        prix_vente_souhaite: ligne.prix_vente_souhaite || 0
      }))
    );

    return { lot, lignes };
  },

  /**
   * Met à jour un lot
   */
  async update(id, data) {
    return AirtableService.update(this.tableName, id, data);
  },

  /**
   * Calcule la répartition automatique des coûts
   * @param {number} montantGlobal - Montant global du lot
   * @param {number} fraisDivers - Frais divers (transport, douane, etc.)
   * @param {Array} lignes - Lignes avec quantite et cout_unitaire_base
   * @returns {Array} Lignes avec cout_unitaire final calculé
   */
  calculateRepartitionCouts(montantGlobal, fraisDivers, lignes) {
    // Calcul du total des coûts de base (somme des coûts unitaires × quantités)
    const totalCoutsBase = lignes.reduce((sum, l) => sum + (l.cout_unitaire_base * l.quantite), 0);

    // Si pas de coûts de base, répartir équitablement
    if (totalCoutsBase === 0) {
      const totalQuantite = lignes.reduce((sum, l) => sum + l.quantite, 0);
      const coutParArticle = (montantGlobal + fraisDivers) / totalQuantite;

      return lignes.map(ligne => ({
        ...ligne,
        cout_unitaire: Math.round(coutParArticle),
        cout_total: Math.round(coutParArticle * ligne.quantite)
      }));
    }

    // Répartition proportionnelle des frais
    const ratioFrais = (montantGlobal + fraisDivers) / totalCoutsBase;

    return lignes.map(ligne => {
      const coutUnitaire = Math.round(ligne.cout_unitaire_base * ratioFrais);
      return {
        ...ligne,
        cout_unitaire: coutUnitaire,
        cout_total: coutUnitaire * ligne.quantite
      };
    });
  }
};
