/** Écran Menu Plus */
window.PlusScreen = async () => {
  return `
    <h2>Menu</h2>
    <div class="menu-list">
      <div class="menu-item" onclick="Router.navigate('/clients')">
        <div class="menu-item-icon">👥</div>
        <div class="menu-item-content">
          <div class="menu-item-title">Clients</div>
          <div class="menu-item-subtitle">Gérer la base clients</div>
        </div>
      </div>
      <div class="menu-item" onclick="Router.navigate('/lots')">
        <div class="menu-item-icon">📦</div>
        <div class="menu-item-content">
          <div class="menu-item-title">Lots</div>
          <div class="menu-item-subtitle">Acquisitions & stocks</div>
        </div>
      </div>
      <div class="menu-item" onclick="Router.navigate('/rapports')">
        <div class="menu-item-icon">📊</div>
        <div class="menu-item-content">
          <div class="menu-item-title">Rapports</div>
          <div class="menu-item-subtitle">Statistiques & analyses</div>
        </div>
      </div>
      <div class="menu-item" onclick="Router.navigate('/dettes')">
        <div class="menu-item-icon">⚠️</div>
        <div class="menu-item-content">
          <div class="menu-item-title">Dettes & Relances</div>
          <div class="menu-item-subtitle">Gestion du recouvrement</div>
        </div>
      </div>
    </div>
  `;
};
