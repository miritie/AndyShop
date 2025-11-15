/**
 * Configuration de l'application (LOCAL - NE PAS COMMITTER)
 *
 * INSTRUCTIONS :
 * Remplissez vos vraies clés API et identifiants ci-dessous
 */

window.AppConfig = {
  airtable: {
    apiKey:
      "patyCcUpabDv4vXhd.31c66723c3e0ac95c060410702767d1351fd26e335be3e740f4514b8f828c557", // TODO: Remplacer par votre Personal Access Token
    baseId: "appRfeVgdy8HsBm7t", // TODO: Remplacer par votre Base ID
    tables: {
      boutiques: "Boutiques",
      fournisseurs: "Fournisseurs",
      articles: "Articles",
      lots: "Lots",
      lignesLot: "Lignes_Lot",
      clients: "Clients",
      ventes: "Ventes",
      lignesVente: "Lignes_Vente",
      paiements: "Paiements",
      dettes: "Dettes",
      allocationsPaiement: "Allocations_Paiement",
      relances: "Relances",
    },
  },

  storage: {
    provider: "local", // 'local' | 'onedrive' | 'googledrive'
    onedrive: {
      clientId: "YOUR_AZURE_CLIENT_ID",
      redirectUri: window.location.origin,
      folder: "/AndyShop/Preuves",
    },
    googledrive: {
      apiKey: "AIzaSyA4mo1GYGdORwkYtvjKBRnPHxPcWjCjzkU",
      clientId:
        "108984429800-o2nbi366i5sk0csk5732jv3v83cd8gth.apps.googleusercontent.com",
      folderId: "1CvTHXqlVzIsquE0RZJYtSH7jZ6s-PmT",
    },
  },

  whatsapp: {},

  business: {
    currency: "XOF",
    lowStockThreshold: 5,
    relanceDelays: { before: 1, after: 2 },
    lotStrategy: "FIFO",
    refFormats: {
      vente: "VTE-{YEAR}-{NUM}",
      paiement: "PAY-{YEAR}-{NUM}",
      lot: "LOT-{YEAR}-{NUM}",
    },
  },

  app: {
    name: "AndyShop",
    version: "1.0.0",
    cacheExpiry: 30,
    autoSync: true,
    syncInterval: 300,
    debug: true,
  },
};
