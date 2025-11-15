/**
 * Configuration Loader - AndyShop
 * Charge la configuration depuis config.js (local) OU depuis Vercel/Netlify (production)
 *
 * FONCTIONNEMENT:
 * - En local: Utilise js/config.js (ignoré par Git)
 * - Sur Vercel: Utilise les variables d'environnement injectées au build
 */

(function() {
  'use strict';

  /**
   * Détecte si on est en environnement de développement
   */
  function isLocalDevelopment() {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.startsWith('192.168.') ||
           window.location.protocol === 'file:';
  }

  /**
   * Charge la configuration depuis les variables d'environnement (Vercel/Netlify)
   * Sur Vercel, les variables sont accessibles via process.env au build
   * mais pour un site statique, on doit les injecter manuellement
   */
  function loadConfigFromEnv() {
    console.log('[Config] Chargement depuis variables d\'environnement...');

    // Récupération depuis window (injectées par script externe)
    const apiKey = window.VITE_AIRTABLE_API_KEY || 'NOT_SET';
    const baseId = window.VITE_AIRTABLE_BASE_ID || 'NOT_SET';

    return {
      airtable: {
        // Ces valeurs seront définies dans un script séparé injecté par Vercel
        apiKey: apiKey,
        baseId: baseId,
        tables: {
          boutiques: 'Boutiques',
          fournisseurs: 'Fournisseurs',
          articles: 'Articles',
          lots: 'Lots',
          lignesLot: 'Lignes_Lot',
          clients: 'Clients',
          ventes: 'Ventes',
          lignesVente: 'Lignes_Vente',
          paiements: 'Paiements',
          dettes: 'Dettes',
          allocationsPaiement: 'Allocations_Paiement',
          relances: 'Relances'
        }
      },

      storage: {
        provider: 'local',
        onedrive: {
          clientId: 'YOUR_AZURE_CLIENT_ID',
          redirectUri: window.location.origin,
          folder: '/AndyShop/Preuves'
        },
        googledrive: {
          apiKey: 'YOUR_GOOGLE_API_KEY',
          clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
          folderId: 'YOUR_FOLDER_ID'
        }
      },

      whatsapp: {},

      business: {
        currency: 'XOF',
        lowStockThreshold: 5,
        relanceDelays: { before: 1, after: 2 },
        lotStrategy: 'FIFO',
        refFormats: {
          vente: 'VTE-{YEAR}-{NUM}',
          paiement: 'PAY-{YEAR}-{NUM}',
          lot: 'LOT-{YEAR}-{NUM}'
        }
      },

      app: {
        name: 'AndyShop',
        version: '1.2.0',
        cacheExpiry: 30,
        autoSync: true,
        syncInterval: 300,
        debug: !isLocalDevelopment() ? false : true
      }
    };
  }

  /**
   * Initialise la configuration
   */
  function initConfig() {
    // Si window.AppConfig existe déjà (chargé depuis config.js), on l'utilise
    if (window.AppConfig && window.AppConfig.airtable && window.AppConfig.airtable.apiKey) {
      console.log('[Config] ✅ Configuration chargée depuis config.js (local)');
      return;
    }

    // Sinon, on charge depuis les variables d'environnement
    console.log('[Config] Chargement depuis environnement de production...');
    window.AppConfig = loadConfigFromEnv();

    // Vérifier que les variables ont bien été injectées
    if (window.AppConfig.airtable.apiKey === 'NOT_SET') {
      console.error('[Config] ❌ ERREUR: Variables d\'environnement non configurées !');
      console.error('[Config] Sur Vercel:');
      console.error('[Config] 1. Settings > Environment Variables');
      console.error('[Config] 2. Ajouter VITE_AIRTABLE_API_KEY');
      console.error('[Config] 3. Ajouter VITE_AIRTABLE_BASE_ID');
      console.error('[Config] 4. Créer env-config.js avec vos valeurs');

      // Afficher un message d'erreur à l'utilisateur
      document.addEventListener('DOMContentLoaded', function() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ef4444;color:white;padding:20px;text-align:center;z-index:9999;font-family:sans-serif;';
        errorDiv.innerHTML = `
          <h3 style="margin:0 0 10px 0;">⚠️ Configuration Manquante</h3>
          <p style="margin:0;">Les clés API Airtable ne sont pas configurées.</p>
          <p style="margin:5px 0 0 0;font-size:14px;">Voir DEPLOIEMENT_VERCEL.md pour les instructions.</p>
        `;
        document.body.prepend(errorDiv);
      });
    } else {
      console.log('[Config] ✅ Configuration chargée avec succès');
    }
  }

  // Initialiser au chargement du script
  initConfig();

})();
