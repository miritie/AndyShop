/** Écran Détail Client */
window.ClientDetailScreen = async (params) => {
  const client = await AirtableService.getById('Clients', params.id);
  return `
    <div class="card mb-md">
      <div class="card-body">
        <h2>${client.nom_complet}</h2>
        <p>${client.telephone}</p>
        <p class="text-muted">${client.type_client}</p>
      </div>
    </div>
    <div class="client-summary">
      <div class="client-summary-row">
        <span class="client-summary-label">Total achats</span>
        <span class="client-summary-value">${Helpers.formatCurrency(client.total_achats || 0)}</span>
      </div>
      <div class="client-summary-row">
        <span class="client-summary-label">Solde dû</span>
        <span class="client-summary-value text-error">${Helpers.formatCurrency(client.solde_du || 0)}</span>
      </div>
    </div>
    <div class="btn-group mt-md">
      <button class="btn btn-primary">Encaisser</button>
      <button class="btn btn-secondary">Relancer</button>
    </div>
  `;
};
