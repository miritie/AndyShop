/**
 * Modèle Paiement
 * Gestion des paiements reçus des clients
 */

window.PaiementModel = {
  tableName: AppConfig?.airtable?.tables?.paiements || 'Paiements',

  /**
   * Récupère tous les paiements
   */
  async getAll(options = {}) {
    return AirtableService.getAll(this.tableName, {
      sort: [{ field: 'date_paiement', direction: 'desc' }],
      ...options
    });
  },

  /**
   * Récupère les paiements d'un client
   */
  async getByClient(clientId) {
    const formula = `{client} = '${clientId}'`;
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Crée un nouveau paiement
   */
  async create(data) {
    // Préparer les données (ne pas envoyer les champs vides)
    const paiementData = {
      client: data.client,
      montant: data.montant,
      mode_paiement: data.mode_paiement || Constants.ModesPaiement.CASH,
      date_paiement: data.date_paiement || new Date().toISOString()
    };

    // Ajouter les champs optionnels seulement s'ils sont fournis
    if (data.preuve_url) paiementData.preuve_url = data.preuve_url;
    if (data.notes) paiementData.notes = data.notes;

    return AirtableService.create(this.tableName, paiementData);
  }
};
