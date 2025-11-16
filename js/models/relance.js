/**
 * Modèle Relance
 */

window.RelanceModel = {
  tableName: AppConfig?.airtable?.tables?.relances || 'Relances',

  /**
   * Récupère toutes les relances
   */
  async getAll(options = {}) {
    return AirtableService.getAll(this.tableName, {
      sort: [{ field: 'date_programmee', direction: 'desc' }],
      ...options
    });
  },

  /**
   * Récupère les relances d'une dette
   */
  async getByDette(detteId) {
    const formula = `{dette}="${detteId}"`;
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Récupère les relances d'un client
   */
  async getByClient(clientId) {
    const formula = `{client}="${clientId}"`;
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Crée une relance
   */
  async create(data) {
    // Airtable Date field (sans heure) attend format YYYY-MM-DD
    const dateProgrammee = data.date_programmee ? new Date(data.date_programmee) : new Date();
    const dateOnly = dateProgrammee.toISOString().split('T')[0];

    return AirtableService.create(this.tableName, {
      ...data,
      date_programmee: dateOnly,
      statut: data.statut || Constants.StatutsRelance.PROGRAMMEE
    });
  },

  /**
   * Met à jour une relance (marquer comme envoyée par exemple)
   */
  async update(id, data) {
    return AirtableService.update(this.tableName, id, data);
  },

  /**
   * Marque une relance comme envoyée
   */
  async markAsEnvoyee(id) {
    // Airtable Date field (sans heure) attend format YYYY-MM-DD
    const today = new Date();
    const dateOnly = today.toISOString().split('T')[0];

    return this.update(id, {
      statut: Constants.StatutsRelance.ENVOYEE,
      date_envoyee: dateOnly
    });
  }
};
