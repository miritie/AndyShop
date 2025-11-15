/**
 * Constantes de l'application
 */

window.Constants = {
  // ===== TYPES & STATUTS =====
  TypesBoutique: {
    PARFUMS: 'Parfums',
    CHAUSSURES: 'Chaussures',
    BIJOUX: 'Bijoux',
    AUTRE: 'Autre'
  },

  CategoriesArticle: {
    PARFUM: 'Parfum',
    CHAUSSURE: 'Chaussure',
    BIJOU: 'Bijou',
    AUTRE: 'Autre'
  },

  TypesClient: {
    COLLEGUE: 'Collègue',
    VOISIN: 'Voisin',
    SERVICE_PUBLIC: 'Service public',
    SERVICE_PRIVE: 'Service privé',
    AUTRE: 'Autre'
  },

  ModesPaiement: {
    CASH: 'Cash',
    MOBILE_MONEY: 'Mobile Money',
    VIREMENT: 'Virement',
    AUTRE: 'Autre'
  },

  StatutsVente: {
    PAYE: 'Payé',
    PARTIEL: 'Partiellement payé',
    CREDIT: 'Crédit'
  },

  StatutsDette: {
    ACTIVE: 'Active',
    SOLDEE: 'Soldée',
    EN_RETARD: 'En retard'
  },

  StatutsRelance: {
    PROGRAMMEE: 'Programmée',
    ENVOYEE: 'Envoyée',
    ECHEC: 'Échec'
  },

  CanauxRelance: {
    WHATSAPP: 'WhatsApp',
    SMS: 'SMS',
    APPEL: 'Appel',
    AUTRE: 'Autre'
  },

  LieuxAchat: {
    LOCAL: 'Local',
    EXTERIEUR: 'Extérieur'
  },

  Devises: {
    XOF: 'XOF',
    EUR: 'EUR',
    USD: 'USD',
    OTHER: 'Autre'
  },

  // ===== MESSAGES & TEMPLATES =====
  Messages: {
    SUCCESS: {
      VENTE_CREEE: 'Vente enregistrée avec succès !',
      PAIEMENT_ENREGISTRE: 'Paiement enregistré avec succès !',
      CLIENT_CREE: 'Client ajouté avec succès !',
      LOT_CREE: 'Lot créé avec succès !',
      ARTICLE_CREE: 'Article ajouté avec succès !',
      SYNC_OK: 'Synchronisation réussie !'
    },
    ERROR: {
      SYNC_FAILED: 'Erreur de synchronisation',
      INVALID_FORM: 'Veuillez vérifier les champs du formulaire',
      NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet.',
      AIRTABLE_CONFIG: 'Configuration Airtable manquante. Vérifiez config.js',
      INSUFFICIENT_STOCK: 'Stock insuffisant pour cet article',
      INVALID_AMOUNT: 'Montant invalide',
      PAYMENT_EXCEEDS_DEBT: 'Le montant alloué dépasse la dette'
    },
    WARNING: {
      STOCK_FAIBLE: 'Attention : stock faible !',
      DUPLICATE_PHONE: 'Un client avec ce numéro existe déjà',
      UNSAVED_CHANGES: 'Vous avez des modifications non enregistrées'
    },
    INFO: {
      LOADING: 'Chargement...',
      SYNCING: 'Synchronisation en cours...'
    }
  },

  // ===== TEMPLATES WHATSAPP =====
  WhatsAppTemplates: {
    FACTURE: `Bonjour {client_name},

Voici votre facture :

📋 Facture {reference}
📅 Date : {date}

{articles}

💰 Total : {total} {currency}
✅ Payé : {paye} {currency}
⏳ Reste dû : {reste} {currency}

Merci pour votre confiance !
{boutique_name}`,

    RECU: `Bonjour {client_name},

Paiement bien reçu !

📋 Reçu {reference}
📅 Date : {date}
💰 Montant : {montant} {currency}
💳 Mode : {mode}

{dettes_impactees}

💵 Nouveau solde : {nouveau_solde} {currency}

Merci !
{boutique_name}`,

    RELANCE_AMICALE: `Bonjour {client_name},

J'espère que tu vas bien ! 😊

Je te rappelle gentiment ton solde en cours :

{dettes_details}

💰 Total à régler : {total_du} {currency}

Merci de régulariser dès que possible 🙏

{boutique_name}`,

    RELANCE_FERME: `Bonjour {client_name},

Rappel concernant vos échéances en retard :

{dettes_details}

💰 Total à régler : {total_du} {currency}
⚠️ Retard : {jours_retard} jours

Merci de régulariser au plus vite.

{boutique_name}`,

    RELANCE_ECHEANCE: `Bonjour {client_name},

Petit rappel pour votre échéance du {date_echeance} :

💰 Montant : {montant} {currency}

Merci !
{boutique_name}`
  },

  // ===== RÈGLES MÉTIER =====
  Rules: {
    MIN_PHONE_LENGTH: 8,
    MAX_PHONE_LENGTH: 15,
    MIN_PASSWORD_LENGTH: 6,
    MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5 MB
    ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    DEBOUNCE_SEARCH: 300, // ms
    TOAST_DURATION: 3000, // ms
    CACHE_EXPIRY: 30 * 60 * 1000 // 30 minutes
  },

  // ===== ICÔNES SVG (inline) =====
  Icons: {
    CHECK: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    ALERT: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    INFO: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    CLOSE: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    ARROW_RIGHT: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    CAMERA: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>'
  }
};
