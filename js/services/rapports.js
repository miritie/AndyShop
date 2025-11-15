/**
 * Service de génération de rapports
 * Calcule les données pour tous les types de rapports
 */

window.RapportsService = {
  /**
   * Génère le rapport de chiffre d'affaires
   */
  async genererCA(periode = 'mois', boutique = null) {
    const ventes = await VenteModel.getAll();
    const lignesVente = await VenteModel.getAllLignes();

    // Filtrer par boutique si spécifié
    let ventesFiltered = ventes;
    if (boutique) {
      ventesFiltered = ventes.filter(v => v.boutique_principale === boutique);
    }

    // Regrouper par période
    const data = this.regrouperParPeriode(ventesFiltered, periode, (vente) => {
      // Calculer le montant total de la vente
      const lignes = lignesVente.filter(l => l.vente && l.vente.includes(vente.id));
      return lignes.reduce((sum, l) => sum + (l.total_ligne || 0), 0);
    });

    return {
      type: 'ca',
      titre: 'Chiffre d\'affaires',
      periode,
      boutique,
      donnees: data,
      total: data.reduce((sum, d) => sum + d.valeur, 0)
    };
  },

  /**
   * Génère le rapport de marges
   */
  async genererMarges(periode = 'mois', boutique = null) {
    const ventes = await VenteModel.getAll();
    const lignesVente = await VenteModel.getAllLignes();
    const lignesLot = await LotModel.getAllLignes();

    let ventesFiltered = ventes;
    if (boutique) {
      ventesFiltered = ventes.filter(v => v.boutique_principale === boutique);
    }

    const data = this.regrouperParPeriode(ventesFiltered, periode, (vente) => {
      const lignes = lignesVente.filter(l => l.vente && l.vente.includes(vente.id));

      let coutTotal = 0;
      let venteTotal = 0;

      lignes.forEach(ligne => {
        venteTotal += ligne.total_ligne || 0;

        // Trouver le coût d'achat via ligne_lot
        if (ligne.ligne_lot && ligne.ligne_lot.length > 0) {
          const ligneLot = lignesLot.find(ll => ll.id === ligne.ligne_lot[0]);
          if (ligneLot) {
            coutTotal += (ligneLot.cout_unitaire || 0) * (ligne.quantite || 0);
          }
        }
      });

      return venteTotal - coutTotal; // Marge brute
    });

    const totalMarge = data.reduce((sum, d) => sum + d.valeur, 0);
    const totalVentes = data.reduce((sum, d) => sum + d.metadata?.venteTotal || 0, 0);

    return {
      type: 'marges',
      titre: 'Marges',
      periode,
      boutique,
      donnees: data,
      total: totalMarge,
      pourcentage: totalVentes > 0 ? (totalMarge / totalVentes) * 100 : 0
    };
  },

  /**
   * Génère le rapport des top articles
   */
  async genererTopArticles(limit = 10, periode = 'mois', boutique = null) {
    const lignesVente = await VenteModel.getAllLignes();
    const articles = await ArticleModel.getAll();
    const ventes = await VenteModel.getAll();

    // Filtrer par période
    const dateDebut = this.getDateDebut(periode);
    const ventesFiltered = ventes.filter(v => {
      const dateVente = new Date(v.date_vente);
      return dateVente >= dateDebut;
    });

    // Filtrer par boutique
    if (boutique) {
      ventesFiltered = ventesFiltered.filter(v => v.boutique_principale === boutique);
    }

    // Calculer les ventes par article
    const articlesStats = {};

    lignesVente.forEach(ligne => {
      // Vérifier si la ligne appartient à une vente filtrée
      const vente = ventesFiltered.find(v => ligne.vente && ligne.vente.includes(v.id));
      if (!vente) return;

      const articleId = ligne.article && ligne.article[0];
      if (!articleId) return;

      if (!articlesStats[articleId]) {
        const article = articles.find(a => a.id === articleId);
        articlesStats[articleId] = {
          id: articleId,
          nom: article?.nom || 'Article inconnu',
          categorie: article?.categorie || '',
          quantite: 0,
          montant: 0
        };
      }

      articlesStats[articleId].quantite += ligne.quantite || 0;
      articlesStats[articleId].montant += ligne.total_ligne || 0;
    });

    // Convertir en tableau et trier
    const data = Object.values(articlesStats)
      .sort((a, b) => b.montant - a.montant)
      .slice(0, limit);

    return {
      type: 'top_articles',
      titre: `Top ${limit} articles`,
      periode,
      boutique,
      donnees: data,
      total: data.reduce((sum, d) => sum + d.montant, 0)
    };
  },

  /**
   * Génère le rapport de performance par boutique
   */
  async genererPerformanceBoutiques(periode = 'mois') {
    const boutiques = await BoutiqueModel.getAll();
    const ventes = await VenteModel.getAll();
    const lignesVente = await VenteModel.getAllLignes();

    const dateDebut = this.getDateDebut(periode);
    const ventesFiltered = ventes.filter(v => {
      const dateVente = new Date(v.date_vente);
      return dateVente >= dateDebut;
    });

    const data = boutiques.map(boutique => {
      const ventesB = ventesFiltered.filter(v => v.boutique_principale === boutique.nom);

      const montantTotal = ventesB.reduce((sum, vente) => {
        const lignes = lignesVente.filter(l => l.vente && l.vente.includes(vente.id));
        return sum + lignes.reduce((s, l) => s + (l.total_ligne || 0), 0);
      }, 0);

      return {
        boutique: boutique.nom,
        type: boutique.type,
        nbVentes: ventesB.length,
        montant: montantTotal
      };
    });

    return {
      type: 'performance_boutiques',
      titre: 'Performance par boutique',
      periode,
      donnees: data.sort((a, b) => b.montant - a.montant),
      total: data.reduce((sum, d) => sum + d.montant, 0)
    };
  },

  /**
   * Génère le rapport de suivi des dettes
   */
  async genererSuiviDettes() {
    const clients = await ClientModel.getAll();
    const dettes = await DetteModel.getAll();
    const paiements = await PaiementModel.getAll();

    const clientsAvecDettes = clients
      .map(client => {
        const dettesClient = dettes.filter(d =>
          d.client && d.client.includes(client.id)
        );

        const paiementsClient = paiements.filter(p =>
          p.client && p.client.includes(client.id)
        );

        const totalAchats = client.total_achats || 0;
        const totalPaye = paiementsClient.reduce((sum, p) => sum + (p.montant || 0), 0);
        const soldeDu = totalAchats - totalPaye;

        return {
          id: client.id,
          nom: client.nom_complet,
          telephone: client.telephone,
          totalAchats,
          totalPaye,
          soldeDu,
          nbDettes: dettesClient.length
        };
      })
      .filter(c => c.soldeDu > 0)
      .sort((a, b) => b.soldeDu - a.soldeDu);

    return {
      type: 'suivi_dettes',
      titre: 'Suivi des dettes clients',
      donnees: clientsAvecDettes,
      total: clientsAvecDettes.reduce((sum, c) => sum + c.soldeDu, 0),
      nbClients: clientsAvecDettes.length
    };
  },

  /**
   * Génère le rapport d'état des stocks
   */
  async genererEtatStocks(boutique = null) {
    let articles = await ArticleModel.getAll();

    if (boutique) {
      articles = articles.filter(a => a.boutique === boutique);
    }

    const lowStockThreshold = AppConfig.business.lowStockThreshold || 5;

    const data = articles.map(article => ({
      id: article.id,
      nom: article.nom,
      categorie: article.categorie,
      boutique: article.boutique,
      stock: article.stock_total || 0,
      statut: (article.stock_total || 0) <= 0 ? 'rupture' :
              (article.stock_total || 0) <= lowStockThreshold ? 'faible' : 'ok'
    }));

    const stats = {
      rupture: data.filter(d => d.statut === 'rupture').length,
      faible: data.filter(d => d.statut === 'faible').length,
      ok: data.filter(d => d.statut === 'ok').length
    };

    return {
      type: 'etat_stocks',
      titre: 'État des stocks',
      boutique,
      donnees: data.sort((a, b) => a.stock - b.stock),
      stats,
      total: data.length
    };
  },

  /**
   * Génère un rapport personnalisé
   */
  async genererPersonnalise(config) {
    // config = { type, dimensions, mesures, filtres, periode }
    const { type, dimensions, mesures, filtres, periode } = config;

    // Charger les données nécessaires
    const data = await this.chargerDonnees(type);

    // Appliquer les filtres
    let dataFiltered = this.appliquerFiltres(data, filtres);

    // Appliquer la période
    if (periode) {
      dataFiltered = this.filtrerParPeriode(dataFiltered, periode);
    }

    // Grouper par dimensions et calculer les mesures
    const resultat = this.grouperEtCalculer(dataFiltered, dimensions, mesures);

    return {
      type: 'personnalise',
      titre: config.titre || 'Rapport personnalisé',
      config,
      donnees: resultat
    };
  },

  /**
   * Utilitaires
   */

  regrouperParPeriode(items, periode, calculValeur) {
    const groupes = {};

    items.forEach(item => {
      const cle = this.getClePeriode(item.date_vente || item.date_creation, periode);

      if (!groupes[cle]) {
        groupes[cle] = {
          periode: cle,
          valeur: 0,
          count: 0
        };
      }

      groupes[cle].valeur += calculValeur(item);
      groupes[cle].count++;
    });

    return Object.values(groupes).sort((a, b) => a.periode.localeCompare(b.periode));
  },

  getClePeriode(date, periode) {
    const d = new Date(date);

    switch (periode) {
      case 'jour':
        return d.toISOString().split('T')[0];
      case 'semaine':
        const weekNum = this.getWeekNumber(d);
        return `${d.getFullYear()}-S${weekNum}`;
      case 'mois':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      case 'trimestre':
        const quarter = Math.floor(d.getMonth() / 3) + 1;
        return `${d.getFullYear()}-T${quarter}`;
      case 'annee':
        return String(d.getFullYear());
      default:
        return d.toISOString().split('T')[0];
    }
  },

  getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  },

  getDateDebut(periode) {
    const maintenant = new Date();

    switch (periode) {
      case 'jour':
        return new Date(maintenant.setHours(0, 0, 0, 0));
      case 'semaine':
        const jour = maintenant.getDay();
        const diff = maintenant.getDate() - jour + (jour === 0 ? -6 : 1);
        return new Date(maintenant.setDate(diff));
      case 'mois':
        return new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      case 'trimestre':
        const quarter = Math.floor(maintenant.getMonth() / 3);
        return new Date(maintenant.getFullYear(), quarter * 3, 1);
      case 'annee':
        return new Date(maintenant.getFullYear(), 0, 1);
      case '30jours':
        return new Date(maintenant.setDate(maintenant.getDate() - 30));
      case '90jours':
        return new Date(maintenant.setDate(maintenant.getDate() - 90));
      default:
        return new Date(0);
    }
  },

  async chargerDonnees(type) {
    switch (type) {
      case 'ventes':
        return {
          ventes: await VenteModel.getAll(),
          lignes: await VenteModel.getAllLignes()
        };
      case 'articles':
        return await ArticleModel.getAll();
      case 'clients':
        return await ClientModel.getAll();
      case 'stocks':
        return await ArticleModel.getAll();
      default:
        return [];
    }
  },

  appliquerFiltres(data, filtres) {
    if (!filtres || filtres.length === 0) return data;

    return data.filter(item => {
      return filtres.every(filtre => {
        const { champ, operateur, valeur } = filtre;
        const valeurItem = item[champ];

        switch (operateur) {
          case '=':
            return valeurItem === valeur;
          case '!=':
            return valeurItem !== valeur;
          case '>':
            return valeurItem > valeur;
          case '<':
            return valeurItem < valeur;
          case '>=':
            return valeurItem >= valeur;
          case '<=':
            return valeurItem <= valeur;
          case 'contient':
            return String(valeurItem).toLowerCase().includes(String(valeur).toLowerCase());
          default:
            return true;
        }
      });
    });
  },

  grouperEtCalculer(data, dimensions, mesures) {
    const groupes = {};

    data.forEach(item => {
      const cle = dimensions.map(dim => item[dim] || 'N/A').join('|');

      if (!groupes[cle]) {
        groupes[cle] = {
          dimensions: {},
          mesures: {}
        };

        dimensions.forEach((dim, idx) => {
          groupes[cle].dimensions[dim] = cle.split('|')[idx];
        });

        mesures.forEach(mesure => {
          groupes[cle].mesures[mesure.nom] = mesure.type === 'count' ? 0 : 0;
        });
      }

      // Calculer les mesures
      mesures.forEach(mesure => {
        switch (mesure.type) {
          case 'sum':
            groupes[cle].mesures[mesure.nom] += item[mesure.champ] || 0;
            break;
          case 'count':
            groupes[cle].mesures[mesure.nom]++;
            break;
          case 'avg':
            // Géré après le groupement
            break;
        }
      });
    });

    return Object.values(groupes);
  }
};
