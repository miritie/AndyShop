/**
 * Modèle Fournisseur
 */

window.FournisseurModel = {
  tableName: AppConfig?.airtable?.tables?.fournisseurs || 'Fournisseurs',

  /**
   * Récupère tous les fournisseurs
   */
  async getAll(options = {}) {
    return AirtableService.getAll(this.tableName, {
      sort: [{ field: 'nom', direction: 'asc' }],
      ...options
    });
  },

  /**
   * Crée un fournisseur
   */
  async create(data) {
    return AirtableService.create(this.tableName, {
      nom: data.nom,
      pays: data.pays || 'Local',
      telephone: data.telephone || '',
      email: data.email || '',
      type_produits: data.type_produits || '',
      notes: data.notes || '',
      date_creation: new Date().toISOString()
    });
  }
};
