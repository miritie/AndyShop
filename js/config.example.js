/**
 * Configuration de l'application
 *
 * INSTRUCTIONS :
 * 1. Copiez ce fichier en "config.js"
 * 2. Remplissez vos vraies clés API et identifiants
 * 3. NE COMMITEZ JAMAIS config.js dans Git (déjà dans .gitignore)
 */

window.AppConfig = {
  // ===== AIRTABLE =====
  airtable: {
    // Votre Personal Access Token Airtable
    // Créer un PAT : https://airtable.com/create/tokens
    apiKey: 'patXXXXXXXXXXXXXX',

    // ID de votre base Airtable (commence par "app...")
    // Visible dans l'URL : https://airtable.com/appXXXXXXXXXXXX/...
    baseId: 'appXXXXXXXXXXXX',

    // Noms des tables (doivent correspondre exactement aux noms dans Airtable)
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

  // ===== STOCKAGE FICHIERS (OneDrive / Google Drive) =====
  storage: {
    // Type de stockage : 'onedrive' | 'googledrive' | 'local'
    provider: 'local', // Changer en 'onedrive' ou 'googledrive' après configuration

    // OneDrive (Microsoft Graph API)
    onedrive: {
      // Client ID de votre application Azure AD
      clientId: 'YOUR_AZURE_CLIENT_ID',
      // Redirect URI (doit être configuré dans Azure)
      redirectUri: window.location.origin,
      // Dossier de stockage dans OneDrive
      folder: '/AndyShop/Preuves'
    },

    // Google Drive API
    googledrive: {
      // API Key Google Cloud
      apiKey: 'YOUR_GOOGLE_API_KEY',
      // Client ID OAuth 2.0
      clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      // Dossier de stockage (ID du dossier Drive)
      folderId: 'YOUR_FOLDER_ID'
    }
  },

  // ===== WHATSAPP =====
  whatsapp: {
    // Utilisation de l'API Web WhatsApp (wa.me)
    // Pas de configuration nécessaire pour démarrer

    // Si vous avez un compte WhatsApp Business API :
    // apiKey: 'YOUR_WHATSAPP_BUSINESS_API_KEY',
    // phoneNumberId: 'YOUR_PHONE_NUMBER_ID'
  },

  // ===== PARAMÈTRES MÉTIER =====
  business: {
    // Devise par défaut
    currency: 'XOF',

    // Seuil de stock faible (alerte)
    lowStockThreshold: 5,

    // Délais de relance (en jours)
    relanceDelays: {
      before: 1,  // J-1 avant échéance
      after: 2    // J+2 après échéance
    },

    // Stratégie de sélection de lot par défaut
    lotStrategy: 'FIFO', // 'FIFO' | 'MANUAL'

    // Format des références auto-générées
    refFormats: {
      vente: 'VTE-{YEAR}-{NUM}',
      paiement: 'PAY-{YEAR}-{NUM}',
      lot: 'LOT-{YEAR}-{NUM}'
    }
  },

  // ===== PARAMÈTRES TECHNIQUES =====
  app: {
    // Nom de l'application
    name: 'AndyShop',

    // Version
    version: '1.0.0',

    // Durée du cache local (en minutes)
    cacheExpiry: 30,

    // Sync auto avec Airtable
    autoSync: true,

    // Interval de sync auto (en secondes)
    syncInterval: 300, // 5 minutes

    // Mode debug (affiche les logs dans la console)
    debug: true
  }
};
