/**
 * Modèle Client
 * Gestion des opérations liées aux clients
 */

window.ClientModel = {
  tableName: AppConfig?.airtable?.tables?.clients || 'Clients',

  /**
   * Récupère tous les clients
   */
  async getAll() {
    return AirtableService.getAll(this.tableName, {
      sort: [{ field: 'nom_complet', direction: 'asc' }]
    });
  },

  /**
   * Recherche un client par téléphone
   */
  async findByPhone(phone) {
    const results = await AirtableService.findByField(this.tableName, 'telephone', phone);
    return results[0] || null;
  },

  /**
   * Crée un nouveau client
   */
  async create(data) {
    // Vérifie les doublons par téléphone
    if (data.telephone) {
      const existing = await this.findByPhone(data.telephone);
      if (existing) {
        throw new Error(Constants.Messages.WARNING.DUPLICATE_PHONE);
      }
    }

    return AirtableService.create(this.tableName, {
      nom_complet: data.nom_complet,
      telephone: data.telephone,
      email: data.email || '',
      adresse: data.adresse || '',
      type_client: data.type_client || Constants.TypesClient.AUTRE,
      notes: data.notes || '',
      date_creation: new Date().toISOString()
    });
  },

  /**
   * Met à jour un client
   */
  async update(id, data) {
    return AirtableService.update(this.tableName, id, data);
  },

  /**
   * Récupère les clients avec dettes
   */
  async getClientsWithDettes() {
    const formula = '{solde_du} > 0';
    return AirtableService.findByFormula(this.tableName, formula);
  }
};
