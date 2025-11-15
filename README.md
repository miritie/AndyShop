# AndyShop - Gestion Multi-Boutiques

Application web mobile-first pour gérer une activité de vente multi-boutiques (cash & crédit, recouvrement, stocks, lots).

## 📋 Fonctionnalités

- ✅ **Gestion des boutiques** : Pinho, BelPaire, Jewely (identité visuelle)
- ✅ **Gestion des articles** : Catalogue avec photos
- ✅ **Gestion des lots** : Acquisitions multi-articles avec répartition des coûts
- ✅ **Gestion des stocks** : Suivi par article et par lot (FIFO)
- ✅ **Gestion des clients** : Base mutualisée avec historique
- ✅ **Gestion des ventes** : Multi-articles, prix négociés, paiements partiels
- ✅ **Gestion des dettes** : Échéanciers personnalisés, allocations de paiements
- ✅ **Recouvrement** : Relances programmées, messages WhatsApp
- ✅ **Documents** : Factures et reçus (WhatsApp + PDF)
- ✅ **Reporting** : CA, marges, top articles, performance par boutique

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3 (variables), JavaScript (Vanilla)
- **Base de données** : Airtable
- **Stockage fichiers** : OneDrive / Google Drive / Local (fallback)
- **Communication** : WhatsApp (liens wa.me + génération de messages)
- **PDF** : HTML imprimable (extensible avec jsPDF)

## 📦 Installation

### 1. Prérequis

- Un compte [Airtable](https://airtable.com) (gratuit)
- Un navigateur moderne (Chrome, Firefox, Safari, Edge)
- (Optionnel) Un serveur web local pour tests (ex: `python -m http.server`)

### 2. Configuration Airtable

#### Créer la base Airtable

1. Connectez-vous à Airtable
2. Créez une nouvelle base : **AndyShop**
3. Créez les 12 tables suivantes avec leurs champs :

**TABLE : Boutiques**
- `nom` (Single line text)
- `type` (Single select : Parfums, Chaussures, Bijoux, Autre)
- `logo_url` (URL)
- `couleur_principale` (Single line text)
- `couleur_secondaire` (Single line text)
- `texte_legal` (Long text)
- `actif` (Checkbox)
- `date_creation` (Date)

**TABLE : Fournisseurs**
- `nom` (Single line text)
- `pays` (Single select : Local, Extérieur)
- `telephone` (Phone)
- `email` (Email)
- `type_produits` (Multiple select)
- `notes` (Long text)
- `date_creation` (Date)

**TABLE : Articles**
- `nom` (Single line text)
- `boutique` (Link to Boutiques)
- `categorie` (Single select)
- `image_url` (URL)
- `notes` (Long text)
- `actif` (Checkbox)
- `stock_total` (Rollup : SUM des Lignes_Lot.quantite_restante)
- `date_creation` (Date)

**TABLE : Lots**
- `reference` (Formula : "LOT-" & YEAR(CREATED_TIME()) & "-" & RECORD_ID())
- `fournisseur` (Link to Fournisseurs)
- `date_achat` (Date)
- `lieu_achat` (Single select : Local, Extérieur)
- `devise` (Single select : XOF, EUR, USD, Autre)
- `montant_global` (Currency)
- `frais_divers` (Currency)
- `montant_total` (Formula : montant_global + frais_divers)
- `notes` (Long text)

**TABLE : Lignes_Lot**
- `lot` (Link to Lots)
- `article` (Link to Articles)
- `quantite_initiale` (Number)
- `quantite_vendue` (Rollup)
- `quantite_restante` (Formula : quantite_initiale - quantite_vendue)
- `cout_total_article` (Currency)
- `cout_unitaire` (Formula : cout_total_article / quantite_initiale)
- `prix_vente_souhaite` (Currency)

**TABLE : Clients**
- `nom_complet` (Single line text)
- `telephone` (Phone) - **Unique**
- `email` (Email)
- `adresse` (Long text)
- `type_client` (Single select)
- `notes` (Long text)
- `total_achats` (Rollup : SUM des Ventes.montant_total)
- `total_paye` (Rollup : SUM des Paiements.montant)
- `solde_du` (Formula : total_achats - total_paye)
- `date_creation` (Date)

**TABLE : Ventes**
- `reference` (Formula)
- `client` (Link to Clients)
- `date_vente` (Date)
- `montant_total` (Rollup)
- `montant_paye_initial` (Currency)
- `montant_restant_du` (Formula)
- `boutique_principale` (Link to Boutiques)
- `notes` (Long text)

**TABLE : Lignes_Vente**
- `vente` (Link to Ventes)
- `article` (Link to Articles)
- `ligne_lot` (Link to Lignes_Lot)
- `quantite` (Number)
- `prix_unitaire_negocie` (Currency)
- `total_ligne` (Formula : quantite * prix_unitaire_negocie)

**TABLE : Paiements**
- `reference` (Formula)
- `client` (Link to Clients)
- `date_paiement` (Date)
- `montant` (Currency)
- `mode_paiement` (Single select : Cash, Mobile Money, Virement, Autre)
- `preuve_url` (URL)
- `notes` (Long text)

**TABLE : Dettes**
- `client` (Link to Clients)
- `vente` (Link to Ventes)
- `montant_initial` (Currency)
- `montant_paye` (Rollup)
- `montant_restant` (Formula)
- `date_creation` (Date)
- `echeancier` (Long text - JSON)
- `statut` (Formula)

**TABLE : Allocations_Paiement**
- `paiement` (Link to Paiements)
- `dette` (Link to Dettes)
- `montant_alloue` (Currency)
- `date_allocation` (Date)

**TABLE : Relances**
- `client` (Link to Clients)
- `dette` (Link to Dettes)
- `date_programmee` (Date)
- `date_envoyee` (Date)
- `canal` (Single select : WhatsApp, SMS, Appel, Autre)
- `message` (Long text)
- `statut` (Single select : Programmée, Envoyée, Échec)

#### Obtenir les identifiants Airtable

1. **Personal Access Token (PAT)** :
   - Allez sur [https://airtable.com/create/tokens](https://airtable.com/create/tokens)
   - Créez un token avec les permissions : `data.records:read` et `data.records:write`
   - Copiez le token (commence par `pat...`)

2. **Base ID** :
   - Ouvrez votre base AndyShop
   - Dans l'URL, copiez l'identifiant entre `airtable.com/` et `/...`
   - Exemple : `https://airtable.com/appXXXXXXXXXXXX/...` → `appXXXXXXXXXXXX`

### 3. Configuration de l'application

1. **Cloner ou télécharger le projet**
   ```bash
   cd /chemin/vers/AndyShop
   ```

2. **Configurer Airtable**
   - Ouvrez `js/config.js`
   - Remplacez `patXXXXXXXXXXXXXX` par votre Personal Access Token
   - Remplacez `appXXXXXXXXXXXX` par votre Base ID

3. **(Optionnel) Configurer le stockage OneDrive/Google Drive**
   - Voir section "Extensions" ci-dessous

### 4. Lancer l'application

#### Méthode 1 : Serveur local (recommandé)

```bash
# Python 3
python -m http.server 8000

# Ou avec Node.js (npx http-server)
npx http-server -p 8000
```

Ouvrez : [http://localhost:8000](http://localhost:8000)

#### Méthode 2 : Double-clic sur index.html

⚠️ Certaines fonctionnalités (fetch API) peuvent nécessiter un serveur web.

### 5. Premier démarrage

1. Ouvrez l'application
2. L'écran d'accueil charge les données Airtable
3. Explorez les différents écrans via la navigation

## 📱 Utilisation

### Navigation

- **Bottom Nav (mobile)** : 5 onglets principaux
  - 🏠 Accueil : Dashboard
  - 🛒 Vente : Nouvelle vente
  - 💰 Encaisser : Paiements
  - 📦 Stocks : Vue stocks
  - ⚙️ Plus : Menu (Clients, Rapports, Lots, Dettes)

### Flux principaux

#### 1. Créer une vente
1. Tap **Vente**
2. Sélectionner le client (ou créer nouveau)
3. Ajouter des articles au panier
4. Modifier les prix si négociés
5. Saisir le paiement (total/partiel/aucun)
6. Valider → Facture générée automatiquement
7. Envoyer via WhatsApp

#### 2. Encaisser un paiement
1. Tap **Encaisser**
2. Sélectionner le client
3. Voir les dettes actives
4. Saisir le montant reçu
5. Ajouter une preuve (photo/capture)
6. Allouer sur les dettes (auto ou manuel)
7. Valider → Reçu généré
8. Envoyer via WhatsApp

#### 3. Créer un lot d'acquisition
1. Menu **Plus** → **Lots**
2. Nouveau lot
3. Sélectionner fournisseur
4. Saisir coût global
5. Ajouter les articles composants
6. Répartir les coûts
7. Valider → Stocks mis à jour

#### 4. Relancer un client
1. Menu **Plus** → **Dettes & Relances**
2. Voir clients en retard
3. Tap **Relancer**
4. Modèle de message généré
5. Copier ou ouvrir WhatsApp
6. Envoyer
7. Traçabilité enregistrée

## 🔧 Extensions & Points d'intégration

### Stockage OneDrive

**Fichiers concernés** : `js/services/storage.js`

1. **Prérequis** :
   - Créer une application Azure AD : [https://portal.azure.com](https://portal.azure.com)
   - Obtenir Client ID
   - Configurer Redirect URI

2. **Code à ajouter** :
   - Charger MSAL.js
   - Implémenter `initOneDrive()` et `uploadToOneDrive()`
   - Voir commentaires dans `storage.js`

3. **Configuration** :
   - Modifier `config.js` :
     ```javascript
     storage: {
       provider: 'onedrive',
       onedrive: {
         clientId: 'VOTRE_CLIENT_ID',
         redirectUri: window.location.origin,
         folder: '/AndyShop/Preuves'
       }
     }
     ```

### Stockage Google Drive

**Fichiers concernés** : `js/services/storage.js`

1. **Prérequis** :
   - Créer un projet Google Cloud
   - Activer Google Drive API
   - Obtenir API Key et Client ID OAuth

2. **Code à ajouter** :
   - Charger gapi.client
   - Implémenter `initGoogleDrive()` et `uploadToGoogleDrive()`

3. **Configuration** :
   - Modifier `config.js` :
     ```javascript
     storage: {
       provider: 'googledrive',
       googledrive: {
         apiKey: 'VOTRE_API_KEY',
         clientId: 'VOTRE_CLIENT_ID',
         folderId: 'ID_DU_DOSSIER'
       }
     }
     ```

### WhatsApp Business API

**Fichiers concernés** : `js/services/whatsapp.js`

Par défaut, l'app utilise des liens `wa.me` (gratuit, pas d'API requise).

Pour intégrer l'envoi automatique :

1. **Prérequis** :
   - Compte WhatsApp Business
   - Accès à Cloud API (Meta)

2. **Code à ajouter** :
   - Voir commentaires dans `whatsapp.js`
   - Implémenter `sendMessage()`

3. **Configuration** :
   - Modifier `config.js` :
     ```javascript
     whatsapp: {
       apiKey: 'VOTRE_API_KEY',
       phoneNumberId: 'VOTRE_PHONE_NUMBER_ID'
     }
     ```

### Génération PDF (jsPDF)

**Fichiers concernés** : `js/services/pdf.js`

Par défaut, génère du HTML imprimable.

Pour générer de vrais PDF :

1. **Ajouter jsPDF** :
   - Dans `index.html`, avant `</body>` :
     ```html
     <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
     ```

2. **Implémenter `downloadPDF()`** :
   - Voir commentaires dans `pdf.js`

## 🎨 Personnalisation

### Couleurs & Thème

Modifier `css/variables.css` :

```css
:root {
  --color-primary: #6366f1;  /* Couleur principale */
  --color-secondary: #ec4899; /* Couleur secondaire */
  /* ... */
}
```

### Ajout d'un écran

1. Créer `js/ui/screens/mon-ecran.js` :
   ```javascript
   window.MonEcranScreen = async (params) => {
     return `<h2>Mon Écran</h2><p>Contenu</p>`;
   };
   ```

2. Enregistrer la route dans `js/app.js` :
   ```javascript
   Router.register('/mon-ecran', MonEcranScreen);
   ```

3. Ajouter un lien :
   ```html
   <a href="#/mon-ecran">Mon Écran</a>
   ```

## 📊 Modèle de données (Résumé)

```
BOUTIQUES → ARTICLES → LIGNES_LOT ← LOTS ← FOURNISSEURS
                ↓
          LIGNES_VENTE ← VENTES ← CLIENTS
                              ↓
                         PAIEMENTS / DETTES / RELANCES
```

Voir section **Étape 1 : Modèle de données** dans le cahier des charges pour le détail complet.

## 🐛 Dépannage

### L'app ne charge pas les données

1. Vérifier `js/config.js` :
   - API Key valide
   - Base ID correct
2. Ouvrir la console (F12) → vérifier les erreurs
3. Vérifier les permissions du token Airtable

### Erreur "Fetch failed"

- Lancer l'app depuis un serveur web (pas `file://`)

### Les images ne s'affichent pas

- Vérifier les URLs dans Airtable
- Pour stockage local : vérifier localStorage

## 📄 Licence

Projet personnel - Usage libre

## 👤 Auteur

AndyShop - Gestion Multi-Boutiques
Version 1.0.0

---

**Note** : Ce projet est un POC (Proof of Concept). Certains écrans sont en mode PLACEHOLDER et nécessitent une implémentation complète (voir commentaires dans le code).
