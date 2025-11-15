/**
 * Service Analytics
 * Calculs de reporting (CA, marges, statistiques)
 */

window.AnalyticsService = {
  /**
   * Calcule le CA sur une période
   * @param {Array} ventes - Liste des ventes
   * @param {Date} startDate - Date de début
   * @param {Date} endDate - Date de fin
   * @returns {Object}
   */
  calculateCA(ventes, startDate = null, endDate = null) {
    let filtered = ventes;

    if (startDate || endDate) {
      filtered = ventes.filter(v => {
        const date = new Date(v.date_vente);
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      });
    }

    const total = filtered.reduce((sum, v) => sum + (v.montant_total || 0), 0);
    const encaisse = filtered.reduce((sum, v) => sum + (v.montant_paye_initial || 0), 0);
    const enAttente = total - encaisse;

    return {
      total,
      encaisse,
      enAttente,
      count: filtered.length
    };
  },

  /**
   * Calcule les dettes en cours
   */
  calculateDettes(dettes) {
    const actives = dettes.filter(d => d.montant_restant > 0);
    const total = actives.reduce((sum, d) => sum + (d.montant_restant || 0), 0);
    const enRetard = actives.filter(d => {
      const echeancier = Helpers.parseEcheancier(d.echeancier);
      return echeancier.some(e => new Date(e.date) < new Date());
    });

    return {
      total,
      count: actives.length,
      enRetard: enRetard.length
    };
  },

  /**
   * Top articles les plus vendus
   */
  getTopArticles(lignesVente, limit = 5) {
    const grouped = Helpers.groupBy(lignesVente, 'article');
    const stats = Object.keys(grouped).map(articleId => {
      const lignes = grouped[articleId];
      const quantite = lignes.reduce((sum, l) => sum + l.quantite, 0);
      const ca = lignes.reduce((sum, l) => sum + l.total_ligne, 0);
      return {
        article: lignes[0].article_nom || articleId,
        quantite,
        ca
      };
    });

    return Helpers.sortBy(stats, 'quantite', 'desc').slice(0, limit);
  },

  /**
   * Performance par boutique
   */
  getStatsByBoutique(ventes, lignesVente) {
    const grouped = Helpers.groupBy(ventes, 'boutique_principale');
    return Object.keys(grouped).map(boutiqueId => {
      const ventesB = grouped[boutiqueId];
      const ca = ventesB.reduce((sum, v) => sum + v.montant_total, 0);
      return {
        boutique: boutiqueId,
        ca,
        ventes: ventesB.length
      };
    });
  }
};
