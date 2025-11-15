/**
 * Écran Accueil / Dashboard
 */

window.HomeScreen = async () => {
  // Récupère les données nécessaires
  const ventes = await VenteModel.getAll({ maxRecords: 100 });
  const clients = await ClientModel.getAll();

  // Calculs stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const caJour = AnalyticsService.calculateCA(ventes, today);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const caMois = AnalyticsService.calculateCA(ventes, monthStart);

  const clientsWithDettes = clients.filter(c => c.solde_du > 0);
  const totalDettes = clientsWithDettes.reduce((sum, c) => sum + c.solde_du, 0);

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-icon primary">${Constants.Icons.INFO}</div>
        <div class="stat-card-value">${Helpers.formatCurrency(caJour.total)}</div>
        <div class="stat-card-label">CA du jour</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon success">${Constants.Icons.CHECK}</div>
        <div class="stat-card-value">${Helpers.formatCurrency(caMois.total)}</div>
        <div class="stat-card-label">CA du mois</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon warning">${Constants.Icons.ALERT}</div>
        <div class="stat-card-value">${Helpers.formatCurrency(totalDettes)}</div>
        <div class="stat-card-label">Dettes actives</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon error">${Constants.Icons.ALERT}</div>
        <div class="stat-card-value">${clientsWithDettes.length}</div>
        <div class="stat-card-label">Clients débiteurs</div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="quick-action-btn" onclick="Router.navigate('/vente')">
        <div class="quick-action-icon" style="background-color: var(--color-primary-light);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
          </svg>
        </div>
        <div class="quick-action-content">
          <div class="quick-action-title">Nouvelle vente</div>
          <div class="quick-action-subtitle">Enregistrer une vente</div>
        </div>
      </div>

      <div class="quick-action-btn" onclick="Router.navigate('/paiement')">
        <div class="quick-action-icon" style="background-color: var(--color-success-light);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div class="quick-action-content">
          <div class="quick-action-title">Encaisser un paiement</div>
          <div class="quick-action-subtitle">${clientsWithDettes.length} clients en attente</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Activité récente</div>
      </div>
      <div class="card-body">
        <div class="activity-timeline">
          ${ventes.slice(0, 5).map(v => `
            <div class="timeline-item">
              <div class="timeline-icon" style="background-color: var(--color-success-light); color: var(--color-success);">
                ${Constants.Icons.CHECK}
              </div>
              <div class="timeline-content">
                <div class="timeline-title">Vente ${v.reference}</div>
                <div class="timeline-meta">${Helpers.formatDate(v.date_vente)} • ${Helpers.formatCurrency(v.montant_total)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};
