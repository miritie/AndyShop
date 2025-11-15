/** Écran Stocks */
window.StocksScreen = async () => {
  const [articles, boutiques] = await Promise.all([
    ArticleModel.getAll(),
    BoutiqueModel.getAll()
  ]);

  const articlesByBoutique = {};

  boutiques.forEach(b => {
    articlesByBoutique[b.id] = {
      boutique: b,
      articles: articles.filter(a => a.boutique && a.boutique.includes(b.id))
    };
  });

  const groups = Object.values(articlesByBoutique);

  return '<h2>Stocks par boutique</h2>' +
    groups.map(group => renderBoutiqueGroup(group)).join('');
};

function renderBoutiqueGroup({ boutique, articles }) {
  const color = boutique.couleur_principale || 'var(--color-primary)';

  return `
    <div class="card mb-md">
      <div class="card-header" style="background: ${color}; color: white;">
        <h3 style="margin: 0; font-size: 1.1rem;">${boutique.nom} (${boutique.type})</h3>
        <div style="font-size: 0.875rem; opacity: 0.9;">${articles.length} article(s)</div>
      </div>
      <div class="card-body" style="padding: 0;">
        ${articles.length === 0 ? `
          <div class="empty-state" style="padding: var(--spacing-lg);">
            Aucun article dans cette boutique
          </div>
        ` : `
          <div class="list">
            ${articles.map(a => renderArticleItem(a)).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderArticleItem(article) {
  const imageUrl = getImageUrl(article.image_url);
  const stock = article.stock_total || 0;
  const stockClass = stock <= AppConfig.business.lowStockThreshold ? 'stock-low' : '';
  const initial = article.nom ? article.nom[0].toUpperCase() : '?';

  return `
    <div class="list-item">
      <div class="list-item-avatar">
        ${imageUrl ?
          `<img src="${imageUrl}" alt="${article.nom}" onerror="this.parentElement.innerHTML='${initial}'">` :
          initial
        }
      </div>
      <div class="list-item-content">
        <div class="list-item-title">${article.nom}</div>
        <div class="list-item-subtitle">${article.categorie || 'Autre'}</div>
      </div>
      <div class="stock-quantity ${stockClass}">
        <div class="stock-quantity-value">${stock}</div>
        <div class="stock-quantity-label">en stock</div>
      </div>
    </div>
  `;
}

function getImageUrl(url) {
  if (!url) return null;

  if (url.startsWith('http') && !url.includes('drive.google.com')) {
    return url;
  }

  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }

  return url;
}
