/** Écran Stocks */
window.StocksScreen = async () => {
  const articles = await ArticleModel.getAll();
  return `
    <h2>Stocks</h2>
    <div class="list">
      ${articles.map(a => `
        <div class="list-item">
          <div class="list-item-avatar">${a.image_url ? `<img src="${a.image_url}">` : a.nom[0]}</div>
          <div class="list-item-content">
            <div class="list-item-title">${a.nom}</div>
            <div class="list-item-subtitle">${a.categorie || ''}</div>
          </div>
          <div class="stock-quantity-value">${a.stock_total || 0}</div>
        </div>
      `).join('')}
    </div>
  `;
};
