/**
 * Modèle Dette
 */

window.DetteModel = {
  tableName: AppConfig?.airtable?.tables?.dettes || 'Dettes',

  /**
   * Récupère toutes les dettes
   */
  async getAll(options = {}) {
    return AirtableService.getAll(this.tableName, {
      sort: [{ field: 'date_creation', direction: 'desc' }],
      ...options
    });
  },

  /**
   * Récupère les dettes d'un client
   */
  async getByClient(clientId) {
    const formula = `{client}="${clientId}"`;
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Récupère les dettes actives (montant_restant > 0)
   */
  async getActives() {
    const formula = '{montant_restant} > 0';
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Récupère les dettes soldées (montant_restant = 0)
   */
  async getSoldees() {
    const formula = '{montant_restant} = 0';
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Récupère les dettes en retard
   */
  async getEnRetard() {
    const today = new Date().toISOString().split('T')[0];
    // Formule Airtable pour vérifier si une échéance est passée
    const formula = `AND({montant_restant} > 0, {statut} = "En retard")`;
    return AirtableService.findByFormula(this.tableName, formula);
  },

  /**
   * Crée une dette
   */
  async create(data) {
    return AirtableService.create(this.tableName, data);
  },

  /**
   * Met à jour une dette
   */
  async update(id, data) {
    return AirtableService.update(this.tableName, id, data);
  },

  /**
   * Calcule le statut d'une dette (côté client si pas calculé par Airtable)
   */
  calculateStatut(dette) {
    if (!dette.montant_restant || dette.montant_restant <= 0) {
      return Constants.StatutsDette.SOLDEE;
    }

    // Vérifie si une échéance est passée
    const echeancier = Helpers.parseEcheancier(dette.echeancier);
    const today = new Date();

    const hasOverduePayment = echeancier.some(e => {
      const echeanceDate = new Date(e.date);
      return echeanceDate < today;
    });

    if (hasOverduePayment) {
      return Constants.StatutsDette.EN_RETARD;
    }

    return Constants.StatutsDette.ACTIVE;
  },

  /**
   * Obtient la prochaine échéance d'une dette
   */
  getProchaineEcheance(dette) {
    const echeancier = Helpers.parseEcheancier(dette.echeancier);
    if (!echeancier || echeancier.length === 0) return null;

    const today = new Date();
    const prochaineEcheance = echeancier.find(e => new Date(e.date) >= today);

    return prochaineEcheance || null;
  },

  /**
   * Obtient les échéances passées d'une dette
   */
  getEcheancesPassees(dette) {
    const echeancier = Helpers.parseEcheancier(dette.echeancier);
    if (!echeancier || echeancier.length === 0) return [];

    const today = new Date();
    return echeancier.filter(e => new Date(e.date) < today);
  }
};
