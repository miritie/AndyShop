# 🧪 Rapport de test - AndyShop

**Date** : Novembre 2025
**Version** : 1.1.1
**Serveur** : http://localhost:8080

---

## ✅ Tests d'infrastructure

### Serveur web
- ✅ Serveur HTTP en cours d'exécution sur le port 8080
- ✅ Page d'accueil accessible (HTTP 200)
- ✅ Tous les fichiers statiques accessibles

### Fichiers JavaScript
Tous les nouveaux fichiers sont correctement chargés :
- ✅ `js/services/imageUpload.js` (HTTP 200)
- ✅ `js/services/rapports.js` (HTTP 200)
- ✅ `js/models/ajustementStock.js` (HTTP 200)
- ✅ `js/ui/screens/inventaire.js` (HTTP 200)

### Routes
Toutes les routes sont correctement enregistrées dans le routeur :
- ✅ `/home` → HomeScreen
- ✅ `/vente` → VenteScreen
- ✅ `/paiement` → PaiementScreen
- ✅ `/clients` → ClientsScreen
- ✅ `/stocks` → StocksScreen
- ✅ **`/inventaire`** → InventaireScreen (NOUVEAU)
- ✅ `/lots` → LotsScreen
- ✅ `/articles` → ArticlesScreen
- ✅ `/dettes` → DettesScreen
- ✅ **`/rapports`** → RapportsScreen
- ✅ `/plus` → PlusScreen

---

## 🎯 Fonctionnalités à tester manuellement

### 1. Création rapide d'article dans le wizard de lot

**Chemin** : Menu Plus → Lots → + Nouveau lot → Étape 2

**Test** :
1. [ ] Cliquer sur "+ Nouvel article"
2. [ ] Remplir le formulaire (nom, boutique, catégorie)
3. [ ] Optionnel : Ajouter une image
4. [ ] Cliquer sur "Créer et ajouter au lot"
5. [ ] Vérifier que l'article est créé
6. [ ] Vérifier que le modal d'ajout au lot s'ouvre
7. [ ] Ajouter l'article au lot (quantité, coût, prix vente)
8. [ ] Vérifier que l'article apparaît dans la liste du lot

**Résultat attendu** : Article créé dans Airtable et ajouté au lot en une seule action

---

### 2. Création rapide de fournisseur dans le wizard de lot

**Chemin** : Menu Plus → Lots → + Nouveau lot → Étape 1

**Test** :
1. [ ] Cliquer sur "+ Nouveau" à côté du champ Fournisseur
2. [ ] Remplir le formulaire (nom, pays, téléphone, etc.)
3. [ ] Cliquer sur "Créer et utiliser"
4. [ ] Vérifier que le fournisseur est créé
5. [ ] Vérifier qu'il est automatiquement sélectionné dans le champ

**Résultat attendu** : Fournisseur créé et sélectionné automatiquement

---

### 3. Upload d'images vers Google Drive

**Chemin** : Menu Plus → Articles → + Nouvel article

**Test** :
1. [ ] Créer un nouvel article
2. [ ] Ajouter une image (JPG, PNG ou WebP)
3. [ ] Observer la console pour voir les logs d'upload
4. [ ] Vérifier si l'image est uploadée sur Google Drive ou en base64
5. [ ] Enregistrer l'article
6. [ ] Vérifier dans Airtable que l'URL de l'image est stockée

**Résultat attendu** :
- Si Google Drive configuré : URL Google Drive
- Sinon : Data URL base64 (fallback)

---

### 4. Inventaire physique

**Chemin** : Menu Plus → Inventaire

**Test du menu principal** :
1. [ ] Accéder à l'écran Inventaire
2. [ ] Vérifier les 3 options : Nouvel inventaire, Ajustement rapide, Historique

**Test d'inventaire complet** :
1. [ ] Cliquer sur "Nouvel inventaire"
2. [ ] Sélectionner une boutique
3. [ ] Démarrer le comptage
4. [ ] Rechercher et compter plusieurs articles
5. [ ] Observer les écarts détectés
6. [ ] Valider l'inventaire
7. [ ] Vérifier que les ajustements sont enregistrés

**Test d'ajustement rapide** :
1. [ ] Cliquer sur "Ajustement rapide"
2. [ ] Sélectionner un article
3. [ ] Choisir un type d'ajustement
4. [ ] Saisir la nouvelle quantité et le motif
5. [ ] Valider
6. [ ] Vérifier l'enregistrement dans Airtable

**Test d'historique** :
1. [ ] Cliquer sur "Historique"
2. [ ] Vérifier la liste des ajustements passés
3. [ ] Vérifier les détails (type, date, quantités, motif)

**Résultat attendu** : Tous les ajustements sont tracés dans la table `Ajustements_Stock`

---

### 5. Service de rapports (backend)

**Note** : L'interface UI n'est pas encore implémentée, mais le service backend est fonctionnel.

**Test via console JavaScript** :
```javascript
// Ouvrir la console du navigateur (F12)

// Test 1: Rapport CA
RapportsService.genererCA('mois').then(data => console.log('CA:', data));

// Test 2: Rapport Marges
RapportsService.genererMarges('mois').then(data => console.log('Marges:', data));

// Test 3: Top Articles
RapportsService.genererTopArticles(10, 'mois').then(data => console.log('Top Articles:', data));

// Test 4: Performance Boutiques
RapportsService.genererPerformanceBoutiques('mois').then(data => console.log('Performance:', data));

// Test 5: Suivi Dettes
RapportsService.genererSuiviDettes().then(data => console.log('Dettes:', data));

// Test 6: État Stocks
RapportsService.genererEtatStocks().then(data => console.log('Stocks:', data));
```

**Résultat attendu** : Les données des rapports sont calculées correctement

---

## 🐛 Problèmes connus

### Rapports - Interface manquante
- **État** : L'interface UI des rapports n'est pas encore implémentée
- **Workaround** : Le service backend est fonctionnel et peut être testé via la console
- **TODO** : Implémenter l'interface complète avec Chart.js et export PDF

### Google Drive - Configuration requise
- **État** : L'upload Google Drive nécessite une configuration préalable
- **Workaround** : Fallback automatique vers base64 si non configuré
- **TODO** : Documenter la configuration Google Drive API

### Table Airtable - Ajustements_Stock
- **État** : La table doit être créée manuellement dans Airtable
- **TODO** : Suivre les instructions dans INVENTAIRE_SETUP.md

---

## 📋 Checklist de test complète

### Infrastructure
- [x] Serveur web accessible
- [x] Fichiers JavaScript chargés
- [x] Routes enregistrées
- [ ] Aucune erreur JavaScript dans la console

### Fonctionnalités
- [ ] Création rapide d'article
- [ ] Création rapide de fournisseur
- [ ] Upload d'images (Google Drive ou base64)
- [ ] Inventaire physique complet
- [ ] Ajustement rapide de stock
- [ ] Historique des ajustements
- [ ] Service de rapports (console)

### Airtable
- [ ] Table Ajustements_Stock créée
- [ ] Nouveaux articles créés visibles
- [ ] Nouveaux fournisseurs créés visibles
- [ ] Ajustements d'inventaire enregistrés

---

## 🚀 Pour aller plus loin

### Tests de charge
- [ ] Tester avec plusieurs centaines d'articles
- [ ] Tester avec plusieurs milliers de ventes
- [ ] Vérifier les performances des rapports

### Tests multi-boutiques
- [ ] Tester avec 3 boutiques différentes
- [ ] Vérifier les filtres par boutique
- [ ] Vérifier l'isolation des données

### Tests de compatibilité
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile (iOS)
- [ ] Mobile (Android)

---

**Statut global** : ✅ Infrastructure OK - ⏳ Tests fonctionnels à effectuer manuellement
