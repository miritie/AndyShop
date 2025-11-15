/** Écran Liste Clients */
window.ClientsScreen = async () => {
  const clients = await ClientModel.getAll();
  return `
    <button class="btn btn-primary btn-block mb-md" onclick="UIComponents.showToast('Ajout client à implémenter', 'info')">+ Nouveau client</button>
    <div class="list">
      ${clients.map(c => `
        <div class="list-item list-item-clickable" onclick="Router.navigate('/client/${c.id}')">
          <div class="list-item-avatar">${c.nom_complet[0]}</div>
          <div class="list-item-content">
            <div class="list-item-title">${c.nom_complet}</div>
            <div class="list-item-subtitle">${c.telephone || ''} ${c.solde_du > 0 ? '• ' + Helpers.formatCurrency(c.solde_du) : ''}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};
