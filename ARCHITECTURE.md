# Architecture AndyShop

## Vue d'ensemble

AndyShop est une **application web SPA (Single Page Application)** en vanilla JavaScript, conçue **mobile-first** pour gérer une activité de vente multi-boutiques.

## Stack technique

- **Frontend** : HTML5 + CSS3 (variables) + JavaScript ES6+ (Vanilla)
- **Backend** : Airtable (API REST)
- **Stockage** : OneDrive / Google Drive / LocalStorage
- **Routing** : Hash-based router custom
- **Communication** : WhatsApp (wa.me links)

## Structure du projet

```
AndyShop/
├── index.html              # Point d'entrée
├── css/
│   ├── variables.css       # Variables globales (couleurs, espacements)
│   ├── reset.css           # Reset CSS
│   ├── layout.css          # Structure responsive (header, nav, main)
│   ├── components.css      # Composants réutilisables (boutons, cards, modales)
│   └── screens.css         # Styles spécifiques par écran
├── js/
│   ├── app.js              # Point d'entrée JS, initialisation
│   ├── config.js           # Configuration (API keys, etc.) - GIT IGNORED
│   ├── config.example.js   # Template de configuration
│   ├── utils/
│   │   ├── constants.js    # Constantes (statuts, types, templates)
│   │   └── helpers.js      # Fonctions utilitaires
│   ├── services/
│   │   ├── airtable.js     # Service CRUD Airtable
│   │   ├── storage.js      # Abstraction stockage fichiers
│   │   ├── whatsapp.js     # Génération messages WhatsApp
│   │   ├── pdf.js          # Génération factures/reçus PDF
│   │   └── analytics.js    # Calculs reporting
│   ├── models/
│   │   ├── boutique.js     # Modèle Boutique
│   │   ├── article.js      # Modèle Article
│   │   ├── lot.js          # Modèle Lot
│   │   ├── client.js       # Modèle Client
│   │   ├── vente.js        # Modèle Vente
│   │   ├── paiement.js     # Modèle Paiement
│   │   ├── dette.js        # Modèle Dette
│   │   └── relance.js      # Modèle Relance
│   └── ui/
│       ├── router.js       # Gestion navigation
│       ├── components.js   # Composants UI (toast, modal, loader)
│       ├── forms.js        # Helpers formulaires (autocomplete)
│       └── screens/
│           ├── home.js     # Écran Accueil / Dashboard
│           ├── vente.js    # Écran Nouvelle Vente
│           ├── paiement.js # Écran Encaisser Paiement
│           ├── clients.js  # Écran Liste Clients
│           ├── client-detail.js # Écran Détail Client
│           ├── stocks.js   # Écran Stocks
│           ├── lots.js     # Écran Gestion Lots
│           ├── articles.js # Écran Catalogue Articles
│           ├── dettes.js   # Écran Dettes & Relances
│           ├── rapports.js # Écran Rapports
│           └── plus.js     # Écran Menu Plus
└── assets/
    └── img/
        └── placeholder.png
```

## Patterns & Conventions

### 1. Module Pattern

Chaque fichier JS expose un objet global dans `window` :

```javascript
// services/airtable.js
window.AirtableService = {
  async getAll(tableName) { /* ... */ }
};

// models/client.js
window.ClientModel = {
  tableName: 'Clients',
  async getAll() { /* ... */ }
};
```

### 2. Service Layer

Les services encapsulent la logique métier :

- **AirtableService** : CRUD générique Airtable
- **StorageService** : Upload fichiers (abstraction provider)
- **WhatsAppService** : Génération messages + liens
- **PDFService** : Génération documents
- **AnalyticsService** : Calculs statistiques

### 3. Model Layer

Les modèles sont des wrappers autour des services pour chaque entité :

```javascript
window.ClientModel = {
  tableName: 'Clients',
  async getAll() { return AirtableService.getAll(this.tableName); },
  async create(data) { return AirtableService.create(this.tableName, data); }
};
```

### 4. Screen-based UI

Chaque écran est une fonction async retournant du HTML :

```javascript
window.HomeScreen = async () => {
  const data = await VenteModel.getAll();
  return `<h1>Accueil</h1><div>${data}</div>`;
};
```

### 5. Hash-based Routing

Navigation via hash (`#/vente`, `#/clients`) :

```javascript
Router.register('/vente', VenteScreen);
Router.navigate('/vente'); // Change l'URL et affiche l'écran
```

### 6. État global

Un objet central `AppState` stocke les données en cache :

```javascript
window.AppState = {
  currentUser: null,
  boutiques: [],
  clients: [],
  ventes: [],
  cache: { lastSync: null }
};
```

## Flux de données

```
USER ACTION
    ↓
UI EVENT (onclick, onsubmit)
    ↓
SCREEN FUNCTION
    ↓
MODEL METHOD (ClientModel.create)
    ↓
SERVICE CALL (AirtableService.create)
    ↓
AIRTABLE API
    ↓
RESPONSE
    ↓
UPDATE APPSTATE (cache)
    ↓
RE-RENDER SCREEN ou TOAST
```

## Écrans & Routes

| Route | Écran | Fonctionnalité |
|-------|-------|----------------|
| `#/home` | HomeScreen | Dashboard (stats, actions rapides) |
| `#/vente` | VenteScreen | Wizard nouvelle vente |
| `#/paiement` | PaiementScreen | Encaisser paiement |
| `#/clients` | ClientsScreen | Liste clients |
| `#/client/:id` | ClientDetailScreen | Détail client |
| `#/stocks` | StocksScreen | Vue stocks par article |
| `#/lots` | LotsScreen | Gestion lots |
| `#/articles` | ArticlesScreen | Catalogue articles |
| `#/dettes` | DettesScreen | Dettes & relances |
| `#/rapports` | RapportsScreen | Statistiques |
| `#/plus` | PlusScreen | Menu secondaire |

## Responsive Design

**Mobile First** → Progressive Enhancement

```css
/* Mobile (défaut) */
@media (min-width: 481px) { /* Tablet */ }
@media (min-width: 769px) { /* Desktop */ }
```

Sur desktop :
- Bottom nav → Side nav
- Grilles multi-colonnes
- Modales centrées

## Points d'extension

### 1. Stockage Cloud

**Fichier** : `js/services/storage.js`

Actuellement : fallback localStorage (base64)

À implémenter :
- OneDrive via Microsoft Graph API + MSAL.js
- Google Drive via gapi.client

Voir commentaires `POINT D'EXTENSION` dans le code.

### 2. WhatsApp Business API

**Fichier** : `js/services/whatsapp.js`

Actuellement : liens `wa.me` (gratuit, pas d'API)

À implémenter :
- Envoi automatique via Cloud API (Meta)

### 3. Génération PDF

**Fichier** : `js/services/pdf.js`

Actuellement : HTML imprimable

À implémenter :
- jsPDF + html2canvas pour vrais PDFs

### 4. Authentification

Actuellement : pas d'auth (application mono-utilisateur)

À implémenter :
- Firebase Auth
- Airtable Users (avec table Users)
- Gestion des rôles

## Sécurité

⚠️ **Important** :

- `config.js` contient les clés API → **GIT IGNORED**
- Ne jamais committer de vraies clés
- Utiliser des tokens Airtable avec permissions minimales
- Valider toutes les entrées utilisateur côté front

## Performance

- Debounce sur recherches (300ms)
- Cache local (AppState)
- Pagination Airtable (max 100 records par défaut)
- Lazy loading des images

## Évolutions futures

- [ ] PWA (Progressive Web App) : Service Worker, offline mode
- [ ] Notifications push
- [ ] Multi-utilisateurs avec authentification
- [ ] Synchronisation bidirectionnelle (conflict resolution)
- [ ] Export Excel des rapports
- [ ] Mode dark complet
- [ ] Internationalisation (i18n)
- [ ] Tests automatisés (Jest)

## Support navigateurs

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11 non supporté

## Contribution

Pour ajouter une fonctionnalité :

1. Créer le modèle si nécessaire (`js/models/`)
2. Créer l'écran (`js/ui/screens/`)
3. Enregistrer la route dans `js/app.js`
4. Ajouter le style dans `css/screens.css` si besoin
5. Tester sur mobile et desktop

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-01-15
