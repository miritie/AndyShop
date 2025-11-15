/**
 * Routeur simple basé sur hash
 */

window.Router = {
  routes: {},
  currentRoute: null,

  /**
   * Enregistre une route
   */
  register(path, handler) {
    this.routes[path] = handler;
  },

  /**
   * Navigue vers une route
   */
  navigate(path) {
    window.location.hash = path;
  },

  /**
   * Initialise le routeur
   */
  init() {
    // Écoute les changements de hash
    window.addEventListener('hashchange', () => this.handleRoute());

    // Charge la route initiale
    this.handleRoute();
  },

  /**
   * Gère le changement de route
   */
  async handleRoute() {
    let path = window.location.hash.slice(1) || '/home';
    this.currentRoute = path;

    // Extraction des paramètres (ex: /client/123 -> {id: 123})
    const params = {};
    let matchedRoute = null;

    for (const route in this.routes) {
      const regex = new RegExp('^' + route.replace(/:[^/]+/g, '([^/]+)') + '$');
      const match = path.match(regex);

      if (match) {
        matchedRoute = route;
        const keys = route.match(/:[^/]+/g) || [];
        keys.forEach((key, i) => {
          params[key.slice(1)] = match[i + 1];
        });
        break;
      }
    }

    const handler = this.routes[matchedRoute] || this.routes['/home'];

    // Affiche un loader
    const main = document.getElementById('app-main');
    main.innerHTML = UIComponents.showLoader();

    try {
      // Exécute le handler de la route
      const content = await handler(params);
      main.innerHTML = `<div class="screen-container">${content}</div>`;

      // Update bottom nav active state
      this.updateNavigation(path);
    } catch (error) {
      Helpers.log('error', 'Route error', error);
      main.innerHTML = `<div class="screen-container"><div class="error">Erreur: ${error.message}</div></div>`;
    }
  },

  /**
   * Met à jour la navigation active
   */
  updateNavigation(path) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href').slice(1);
      if (path.startsWith(href)) {
        item.classList.add('active');
      }
    });

    // Met à jour le titre
    const titles = {
      '/home': 'Accueil',
      '/vente': 'Nouvelle Vente',
      '/paiement': 'Encaisser',
      '/stocks': 'Stocks',
      '/clients': 'Clients',
      '/plus': 'Menu'
    };
    document.getElementById('header-title').textContent = titles[path] || 'AndyShop';
  }
};
