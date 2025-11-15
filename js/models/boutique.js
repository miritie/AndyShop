window.BoutiqueModel = {
  tableName: AppConfig?.airtable?.tables?.boutiques || 'Boutiques',
  async getAll() { return AirtableService.getAll(this.tableName); },
  async create(data) { return AirtableService.create(this.tableName, data); }
};
