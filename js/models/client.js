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
   * Note: solde_du est un champ calculé (Formula), donc on doit utiliser
   * une formule qui compare total_achats et total_paye (qui sont des Rollups numériques)
   */
  async getClientsWithDettes() {
    // On récupère tous les clients et on filtre côté client
    // car solde_du est un champ Formula qu'on ne peut pas filtrer directement
    const allClients = await this.getAll();
    return allClients.filter(client => {
      const solde = parseFloat(client.solde_du) || 0;
      return solde > 0;
    });
  }
};
