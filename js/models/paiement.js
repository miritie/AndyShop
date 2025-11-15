window.PaiementModel = {
  tableName: AppConfig?.airtable?.tables?.paiements || 'Paiements',
  async create(data) {
    const reference = Helpers.generateReference('paiement', Date.now());
    return AirtableService.create(this.tableName, { reference, ...data, date_paiement: new Date().toISOString() });
  }
};
