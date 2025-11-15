/**
 * Écran Rapports
 * Interface complète avec graphiques, tableaux et export PDF
 */

const RapportsScreenState = {
  view: 'menu', // 'menu' | 'rapport' | 'personnalise'
  currentRapport: null,
  viewMode: 'graph', // 'graph' | 'table'
  chartInstance: null,
  rapportData: null
};

window.RapportsScreen = async () => {
  if (RapportsScreenState.view === 'menu') {
    return renderMenu();
  } else if (RapportsScreenState.view === 'rapport') {
    return renderRapport();
  } else if (RapportsScreenState.view === 'personnalise') {
    return renderPersonnalise();
  }
};

function renderMenu() {
  return `
    <h2>Rapports & Analyses</h2>
    <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-md);">
      Statistiques et analyses détaillées de votre activité
    </p>

    <div class="card" style="margin-bottom: var(--spacing-md);">
      <div class="card-header">
        <div class="card-title">Rapports standards</div>
      </div>
      <div class="card-body" style="padding: 0;">
        <div class="list">
          <div class="list-item list-item-clickable" onclick="RapportsActions.showRapport('ca')">
            <div class="list-item-avatar" style="background: var(--color-primary-light); color: var(--color-primary);">
              📈
            </div>
            <div class="list-item-content">
              <div class="list-item-title">Chiffre d'affaires</div>
              <div class="list-item-subtitle">Évolution du CA par période</div>
            </div>
          </div>

          <div class="list-item list-item-clickable" onclick="RapportsActions.showRapport('marges')">
            <div class="list-item-avatar" style="background: var(--color-success-light); color: var(--color-success);">
              💰
            </div>
            <div class="list-item-content">
              <div class="list-item-title">Marges</div>
              <div class="list-item-subtitle">Analyse des marges bénéficiaires</div>
            </div>
          </div>

          <div class="list-item list-item-clickable" onclick="RapportsActions.showRapport('top_articles')">
            <div class="list-item-avatar" style="background: var(--color-warning-light); color: var(--color-warning);">
              🏆
            </div>
            <div class="list-item-content">
              <div class="list-item-title">Top Articles</div>
              <div class="list-item-subtitle">Articles les plus vendus</div>
            </div>
          </div>

          <div class="list-item list-item-clickable" onclick="RapportsActions.showRapport('performance_boutiques')">
            <div class="list-item-avatar" style="background: var(--color-info-light); color: var(--color-info);">
              🏪
            </div>
            <div class="list-item-content">
              <div class="list-item-title">Performance Boutiques</div>
              <div class="list-item-subtitle">Comparaison des boutiques</div>
            </div>
          </div>

          <div class="list-item list-item-clickable" onclick="RapportsActions.showRapport('dettes')">
            <div class="list-item-avatar" style="background: var(--color-error-light); color: var(--color-error);">
              ⚠️
            </div>
            <div class="list-item-content">
              <div class="list-item-title">Suivi des dettes</div>
              <div class="list-item-subtitle">État des créances clients</div>
            </div>
          </div>

          <div class="list-item list-item-clickable" onclick="RapportsActions.showRapport('stocks')">
            <div class="list-item-avatar" style="background: var(--color-secondary-light); color: var(--color-secondary);">
              📦
            </div>
            <div class="list-item-content">
              <div class="list-item-title">État des stocks</div>
              <div class="list-item-subtitle">Situation actuelle des stocks</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Rapports personnalisés</div>
      </div>
      <div class="card-body">
        <button class="btn btn-primary btn-block" onclick="RapportsActions.showPersonnalise()">
          ➕ Créer un rapport personnalisé
        </button>
      </div>
    </div>
  `;
}

function renderRapport() {
  const data = RapportsScreenState.rapportData;
  if (!data) return '<p>Chargement...</p>';

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
      <h2>${data.titre}</h2>
      <button class="btn btn-secondary btn-sm" onclick="RapportsActions.backToMenu()">
        ← Retour
      </button>
    </div>

    <div class="card" style="margin-bottom: var(--spacing-md);">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-sm);">
          <div style="display: flex; gap: var(--spacing-sm);">
            <button
              class="btn ${RapportsScreenState.viewMode === 'graph' ? 'btn-primary' : 'btn-secondary'}"
              onclick="RapportsActions.switchView('graph')"
            >
              📊 Graphique
            </button>
            <button
              class="btn ${RapportsScreenState.viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}"
              onclick="RapportsActions.switchView('table')"
            >
              📋 Tableau
            </button>
          </div>
          <button class="btn btn-success" onclick="RapportsActions.exportPDF()">
            📄 Exporter PDF
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        ${RapportsScreenState.viewMode === 'graph' ? renderGraph() : renderTable()}
      </div>
    </div>

    ${renderSummary()}
  `;
}

function renderGraph() {
  setTimeout(() => RapportsActions.drawChart(), 0);
  return `
    <div style="position: relative; height: 400px;">
      <canvas id="rapport-chart"></canvas>
    </div>
  `;
}

function renderTable() {
  const data = RapportsScreenState.rapportData;

  if (data.type === 'ca' || data.type === 'marges') {
    return `
      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Période</th>
              <th style="text-align: right;">Montant</th>
              <th style="text-align: right;">Nb transactions</th>
            </tr>
          </thead>
          <tbody>
            ${data.donnees.map(item => `
              <tr>
                <td>${item.periode}</td>
                <td style="text-align: right; font-weight: 600;">${Helpers.formatCurrency(item.valeur)}</td>
                <td style="text-align: right;">${item.count}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight: 700; background: var(--color-bg-secondary);">
              <td>TOTAL</td>
              <td style="text-align: right;">${Helpers.formatCurrency(data.total)}</td>
              <td style="text-align: right;">${data.donnees.reduce((sum, d) => sum + d.count, 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  if (data.type === 'top_articles') {
    return `
      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Rang</th>
              <th>Article</th>
              <th>Catégorie</th>
              <th style="text-align: right;">Quantité</th>
              <th style="text-align: right;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${data.donnees.map((item, idx) => `
              <tr>
                <td style="font-weight: 700;">#${idx + 1}</td>
                <td>${item.nom}</td>
                <td><span class="badge badge-secondary">${item.categorie || 'N/A'}</span></td>
                <td style="text-align: right;">${item.quantite}</td>
                <td style="text-align: right; font-weight: 600;">${Helpers.formatCurrency(item.montant)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (data.type === 'performance_boutiques') {
    return `
      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Boutique</th>
              <th>Type</th>
              <th style="text-align: right;">Nb ventes</th>
              <th style="text-align: right;">Montant total</th>
            </tr>
          </thead>
          <tbody>
            ${data.donnees.map(item => `
              <tr>
                <td style="font-weight: 600;">${item.boutique}</td>
                <td><span class="badge badge-secondary">${item.type}</span></td>
                <td style="text-align: right;">${item.nbVentes}</td>
                <td style="text-align: right; font-weight: 600;">${Helpers.formatCurrency(item.montant)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (data.type === 'suivi_dettes') {
    return `
      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Téléphone</th>
              <th style="text-align: right;">Total achats</th>
              <th style="text-align: right;">Total payé</th>
              <th style="text-align: right;">Solde dû</th>
            </tr>
          </thead>
          <tbody>
            ${data.donnees.map(item => `
              <tr>
                <td style="font-weight: 600;">${item.nom}</td>
                <td>${item.telephone || 'N/A'}</td>
                <td style="text-align: right;">${Helpers.formatCurrency(item.totalAchats)}</td>
                <td style="text-align: right; color: var(--color-success);">${Helpers.formatCurrency(item.totalPaye)}</td>
                <td style="text-align: right; font-weight: 600; color: var(--color-error);">${Helpers.formatCurrency(item.soldeDu)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight: 700; background: var(--color-bg-secondary);">
              <td colspan="4">TOTAL</td>
              <td style="text-align: right; color: var(--color-error);">${Helpers.formatCurrency(data.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  if (data.type === 'etat_stocks') {
    return `
      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Catégorie</th>
              <th>Boutique</th>
              <th style="text-align: right;">Stock</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${data.donnees.map(item => `
              <tr>
                <td style="font-weight: 600;">${item.nom}</td>
                <td><span class="badge badge-secondary">${item.categorie || 'N/A'}</span></td>
                <td>${item.boutique}</td>
                <td style="text-align: right; font-weight: 600;">${item.stock}</td>
                <td>
                  <span class="badge badge-${item.statut === 'rupture' ? 'error' : item.statut === 'faible' ? 'warning' : 'success'}">
                    ${item.statut === 'rupture' ? 'Rupture' : item.statut === 'faible' ? 'Faible' : 'OK'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return '<p>Format de tableau non supporté pour ce type de rapport</p>';
}

function renderSummary() {
  const data = RapportsScreenState.rapportData;

  let summary = `
    <div class="card" style="margin-top: var(--spacing-md);">
      <div class="card-header">
        <div class="card-title">Résumé</div>
      </div>
      <div class="card-body">
        <div class="stats-grid">
  `;

  if (data.type === 'ca' || data.type === 'marges') {
    summary += `
      <div class="stat-card">
        <div class="stat-card-value">${Helpers.formatCurrency(data.total)}</div>
        <div class="stat-card-label">Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${data.donnees.length}</div>
        <div class="stat-card-label">Périodes</div>
      </div>
    `;

    if (data.type === 'marges' && data.pourcentage) {
      summary += `
        <div class="stat-card">
          <div class="stat-card-value">${data.pourcentage.toFixed(1)}%</div>
          <div class="stat-card-label">Taux de marge</div>
        </div>
      `;
    }
  }

  if (data.type === 'top_articles') {
    summary += `
      <div class="stat-card">
        <div class="stat-card-value">${data.donnees.length}</div>
        <div class="stat-card-label">Articles</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${Helpers.formatCurrency(data.total)}</div>
        <div class="stat-card-label">CA total</div>
      </div>
    `;
  }

  if (data.type === 'performance_boutiques') {
    summary += `
      <div class="stat-card">
        <div class="stat-card-value">${data.donnees.length}</div>
        <div class="stat-card-label">Boutiques</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${Helpers.formatCurrency(data.total)}</div>
        <div class="stat-card-label">CA total</div>
      </div>
    `;
  }

  if (data.type === 'suivi_dettes') {
    summary += `
      <div class="stat-card">
        <div class="stat-card-value" style="color: var(--color-error);">${data.nbClients}</div>
        <div class="stat-card-label">Clients débiteurs</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value" style="color: var(--color-error);">${Helpers.formatCurrency(data.total)}</div>
        <div class="stat-card-label">Total dû</div>
      </div>
    `;
  }

  if (data.type === 'etat_stocks') {
    summary += `
      <div class="stat-card">
        <div class="stat-card-value" style="color: var(--color-error);">${data.stats.rupture}</div>
        <div class="stat-card-label">En rupture</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value" style="color: var(--color-warning);">${data.stats.faible}</div>
        <div class="stat-card-label">Stock faible</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value" style="color: var(--color-success);">${data.stats.ok}</div>
        <div class="stat-card-label">Stock OK</div>
      </div>
    `;
  }

  summary += `
        </div>
      </div>
    </div>
  `;

  return summary;
}

function renderPersonnalise() {
  return `
    <h2>Rapport personnalisé</h2>
    <div class="card">
      <div class="card-body">
        <p style="text-align: center; color: var(--color-text-secondary); padding: var(--spacing-xl);">
          Fonctionnalité en développement
        </p>
        <button class="btn btn-secondary btn-block" onclick="RapportsActions.backToMenu()">
          ← Retour au menu
        </button>
      </div>
    </div>
  `;
}

window.RapportsActions = {
  async showRapport(type) {
    try {
      UIComponents.showToast('Génération du rapport...', 'info');

      let data;

      switch(type) {
        case 'ca':
          data = await RapportsService.genererCA('mois');
          break;
        case 'marges':
          data = await RapportsService.genererMarges('mois');
          break;
        case 'top_articles':
          data = await RapportsService.genererTopArticles(10, 'mois');
          break;
        case 'performance_boutiques':
          data = await RapportsService.genererPerformanceBoutiques('mois');
          break;
        case 'dettes':
          data = await RapportsService.genererSuiviDettes();
          break;
        case 'stocks':
          data = await RapportsService.genererEtatStocks();
          break;
      }

      RapportsScreenState.rapportData = data;
      RapportsScreenState.currentRapport = type;
      RapportsScreenState.view = 'rapport';
      RapportsScreenState.viewMode = 'graph';

      await Router.refresh();

    } catch (error) {
      console.error('Erreur génération rapport:', error);
      UIComponents.showToast('Erreur: ' + error.message, 'error');
    }
  },

  backToMenu() {
    RapportsScreenState.view = 'menu';
    RapportsScreenState.rapportData = null;
    RapportsScreenState.currentRapport = null;
    if (RapportsScreenState.chartInstance) {
      RapportsScreenState.chartInstance.destroy();
      RapportsScreenState.chartInstance = null;
    }
    Router.refresh();
  },

  switchView(mode) {
    if (RapportsScreenState.viewMode === mode) return;

    RapportsScreenState.viewMode = mode;

    if (RapportsScreenState.chartInstance && mode === 'table') {
      RapportsScreenState.chartInstance.destroy();
      RapportsScreenState.chartInstance = null;
    }

    Router.refresh();
  },

  drawChart() {
    const data = RapportsScreenState.rapportData;
    if (!data) return;

    const canvas = document.getElementById('rapport-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (RapportsScreenState.chartInstance) {
      RapportsScreenState.chartInstance.destroy();
    }

    let chartConfig;

    if (data.type === 'ca' || data.type === 'marges') {
      chartConfig = {
        type: 'line',
        data: {
          labels: data.donnees.map(d => d.periode),
          datasets: [{
            label: data.titre,
            data: data.donnees.map(d => d.valeur),
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return Helpers.formatCurrency(context.parsed.y);
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => Helpers.formatCurrency(value)
              }
            }
          }
        }
      };
    }

    if (data.type === 'top_articles') {
      chartConfig = {
        type: 'bar',
        data: {
          labels: data.donnees.map(d => d.nom.substring(0, 20)),
          datasets: [{
            label: 'Montant des ventes',
            data: data.donnees.map(d => d.montant),
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => Helpers.formatCurrency(context.parsed.x)
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (value) => Helpers.formatCurrency(value)
              }
            }
          }
        }
      };
    }

    if (data.type === 'performance_boutiques') {
      chartConfig = {
        type: 'bar',
        data: {
          labels: data.donnees.map(d => d.boutique),
          datasets: [{
            label: 'Montant des ventes',
            data: data.donnees.map(d => d.montant),
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => Helpers.formatCurrency(context.parsed.y)
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => Helpers.formatCurrency(value)
              }
            }
          }
        }
      };
    }

    if (data.type === 'etat_stocks') {
      chartConfig = {
        type: 'doughnut',
        data: {
          labels: ['Rupture', 'Stock faible', 'Stock OK'],
          datasets: [{
            data: [data.stats.rupture, data.stats.faible, data.stats.ok],
            backgroundColor: [
              'rgba(239, 68, 68, 0.7)',
              'rgba(251, 191, 36, 0.7)',
              'rgba(34, 197, 94, 0.7)'
            ],
            borderColor: [
              'rgb(239, 68, 68)',
              'rgb(251, 191, 36)',
              'rgb(34, 197, 94)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            }
          }
        }
      };
    }

    if (data.type === 'suivi_dettes') {
      // Table only for dettes
      RapportsScreenState.viewMode = 'table';
      Router.refresh();
      return;
    }

    if (chartConfig) {
      RapportsScreenState.chartInstance = new Chart(ctx, chartConfig);
    }
  },

  async exportPDF() {
    try {
      UIComponents.showToast('Génération du PDF...', 'info');

      const data = RapportsScreenState.rapportData;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // En-tête
      doc.setFontSize(20);
      doc.text(data.titre, 15, 20);

      doc.setFontSize(10);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 15, 30);

      // Résumé
      let y = 45;
      doc.setFontSize(12);
      doc.text('Résumé', 15, y);
      y += 10;

      doc.setFontSize(10);

      if (data.type === 'ca' || data.type === 'marges') {
        doc.text(`Total: ${Helpers.formatCurrency(data.total)}`, 15, y);
        y += 7;
        doc.text(`Nombre de périodes: ${data.donnees.length}`, 15, y);
        y += 7;

        if (data.type === 'marges' && data.pourcentage) {
          doc.text(`Taux de marge: ${data.pourcentage.toFixed(1)}%`, 15, y);
          y += 7;
        }
      }

      if (data.type === 'top_articles') {
        doc.text(`Nombre d'articles: ${data.donnees.length}`, 15, y);
        y += 7;
        doc.text(`CA total: ${Helpers.formatCurrency(data.total)}`, 15, y);
        y += 7;
      }

      if (data.type === 'performance_boutiques') {
        doc.text(`Nombre de boutiques: ${data.donnees.length}`, 15, y);
        y += 7;
        doc.text(`CA total: ${Helpers.formatCurrency(data.total)}`, 15, y);
        y += 7;
      }

      if (data.type === 'suivi_dettes') {
        doc.text(`Clients débiteurs: ${data.nbClients}`, 15, y);
        y += 7;
        doc.text(`Total dû: ${Helpers.formatCurrency(data.total)}`, 15, y);
        y += 7;
      }

      if (data.type === 'etat_stocks') {
        doc.text(`Rupture: ${data.stats.rupture}`, 15, y);
        y += 7;
        doc.text(`Stock faible: ${data.stats.faible}`, 15, y);
        y += 7;
        doc.text(`Stock OK: ${data.stats.ok}`, 15, y);
        y += 7;
      }

      y += 5;

      // Tableau de données
      if (data.type === 'ca' || data.type === 'marges') {
        doc.autoTable({
          startY: y,
          head: [['Période', 'Montant', 'Transactions']],
          body: data.donnees.map(d => [
            d.periode,
            Helpers.formatCurrency(d.valeur),
            d.count.toString()
          ]),
          foot: [['TOTAL', Helpers.formatCurrency(data.total), data.donnees.reduce((s, d) => s + d.count, 0).toString()]]
        });
      }

      if (data.type === 'top_articles') {
        doc.autoTable({
          startY: y,
          head: [['Rang', 'Article', 'Catégorie', 'Quantité', 'Montant']],
          body: data.donnees.map((d, idx) => [
            `#${idx + 1}`,
            d.nom,
            d.categorie || 'N/A',
            d.quantite.toString(),
            Helpers.formatCurrency(d.montant)
          ])
        });
      }

      if (data.type === 'performance_boutiques') {
        doc.autoTable({
          startY: y,
          head: [['Boutique', 'Type', 'Nb ventes', 'Montant']],
          body: data.donnees.map(d => [
            d.boutique,
            d.type,
            d.nbVentes.toString(),
            Helpers.formatCurrency(d.montant)
          ])
        });
      }

      if (data.type === 'suivi_dettes') {
        doc.autoTable({
          startY: y,
          head: [['Client', 'Téléphone', 'Total achats', 'Total payé', 'Solde dû']],
          body: data.donnees.map(d => [
            d.nom,
            d.telephone || 'N/A',
            Helpers.formatCurrency(d.totalAchats),
            Helpers.formatCurrency(d.totalPaye),
            Helpers.formatCurrency(d.soldeDu)
          ]),
          foot: [['TOTAL', '', '', '', Helpers.formatCurrency(data.total)]]
        });
      }

      if (data.type === 'etat_stocks') {
        doc.autoTable({
          startY: y,
          head: [['Article', 'Catégorie', 'Boutique', 'Stock', 'Statut']],
          body: data.donnees.map(d => [
            d.nom,
            d.categorie || 'N/A',
            d.boutique,
            d.stock.toString(),
            d.statut === 'rupture' ? 'Rupture' : d.statut === 'faible' ? 'Faible' : 'OK'
          ])
        });
      }

      // Télécharger
      const filename = `rapport_${data.type}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      UIComponents.showToast('PDF exporté avec succès', 'success');

    } catch (error) {
      console.error('Erreur export PDF:', error);
      UIComponents.showToast('Erreur lors de l\'export PDF: ' + error.message, 'error');
    }
  },

  showPersonnalise() {
    RapportsScreenState.view = 'personnalise';
    Router.refresh();
  }
};
