/**
 * Modèle Vente
 */

window.VenteModel = {
  tableName: AppConfig?.airtable?.tables?.ventes || 'Ventes',
  lignesTableName: AppConfig?.airtable?.tables?.lignesVente || 'Lignes_Vente',

  async create(data) {
    // Crée la vente
    const reference = Helpers.generateReference('vente', Date.now());
    const vente = await AirtableService.create(this.tableName, {
      reference,
      client: [data.clientId],
      date_vente: new Date().toISOString(),
      montant_total: data.montantTotal,
      montant_paye_initial: data.montantPaye,
      boutique_principale: data.boutiqueId ? [data.boutiqueId] : []
    });

    // Crée les lignes de vente
    const lignes = await AirtableService.createMany(this.lignesTableName, data.lignes.map(l => ({
      vente: [vente.id],
      article: [l.articleId],
      ligne_lot: l.ligneLotId ? [l.ligneLotId] : [],
      quantite: l.quantite,
      prix_unitaire_negocie: l.prixUnitaire
    })));

    return { vente, lignes };
  },

  async getAll(options = {}) {
    return AirtableService.getAll(this.tableName, {
      sort: [{ field: 'date_vente', direction: 'desc' }],
      ...options
    });
  }
};
