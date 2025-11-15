/** Écran Encaisser Paiement - PLACEHOLDER */
window.PaiementScreen = async () => {
  const clients = await ClientModel.getClientsWithDettes();
  return `
    <h2>Encaisser un paiement</h2>
    <div class="list">
      ${clients.map(c => `
        <div class="list-item list-item-clickable">
          <div class="list-item-content">
            <div class="list-item-title">${c.nom_complet}</div>
            <div class="list-item-subtitle">${Helpers.formatCurrency(c.solde_du)} à encaisser</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};
