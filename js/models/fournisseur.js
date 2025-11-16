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
    // Préparer les données de base
    const fournisseurData = {
      nom: data.nom,
      pays: data.pays || 'Local'
    };

    // Airtable Date field (sans heure) attend format YYYY-MM-DD
    const today = new Date();
    const dateOnly = today.toISOString().split('T')[0];
    fournisseurData.date_creation = dateOnly;

    // Ajouter les champs optionnels seulement s'ils sont fournis et non vides
    if (data.telephone) fournisseurData.telephone = data.telephone;
    if (data.email) fournisseurData.email = data.email;
    if (data.type_produits) fournisseurData.type_produits = data.type_produits;
    if (data.notes) fournisseurData.notes = data.notes;

    return AirtableService.create(this.tableName, fournisseurData);
  }
};
