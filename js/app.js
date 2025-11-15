/**
 * Point d'entrée de l'application
 */

(async function initApp() {
  Helpers.log('info', 'Starting AndyShop...');

  // Vérifie la configuration
  if (!window.AppConfig) {
    alert('Configuration manquante ! Veuillez créer config.js à partir de config.example.js');
    return;
  }

  // État global de l'application
  window.AppState = {
    currentUser: null,
    boutiques: [],
    articles: [],
    clients: [],
    ventes: [],
    dettes: [],
    cache: {
      lastSync: null
    }
  };

  try {
    // Initialise le service de stockage
    await StorageService.init();

    // Enregistre les routes
    Router.register('/home', HomeScreen);
    Router.register('/vente', VenteScreen);
    Router.register('/paiement', PaiementScreen);
    Router.register('/clients', ClientsScreen);
    Router.register('/client/:id', ClientDetailScreen);
    Router.register('/stocks', StocksScreen);
    Router.register('/inventaire', InventaireScreen);
    Router.register('/lots', LotsScreen);
    Router.register('/articles', ArticlesScreen);
    Router.register('/dettes', DettesScreen);
    Router.register('/rapports', RapportsScreen);
    Router.register('/plus', PlusScreen);

    // Initialise le routeur
    Router.init();

    // Bouton de synchronisation
    document.getElementById('sync-btn').addEventListener('click', async () => {
      const btn = document.getElementById('sync-btn');
      btn.classList.add('syncing');

      try {
        UIComponents.showToast('Synchronisation...', 'info');
        // Recharge la route actuelle
        await Router.handleRoute();
        UIComponents.showToast(Constants.Messages.SUCCESS.SYNC_OK, 'success');
      } catch (error) {
        UIComponents.showToast(Constants.Messages.ERROR.SYNC_FAILED, 'error');
      } finally {
        btn.classList.remove('syncing');
      }
    });

    Helpers.log('info', 'AndyShop initialized successfully');

  } catch (error) {
    Helpers.log('error', 'Initialization error', error);
    UIComponents.showToast('Erreur d\'initialisation: ' + error.message, 'error');
  }
})();
