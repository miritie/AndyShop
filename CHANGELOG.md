# Changelog - AndyShop

## Version 1.1.1 - Correction erreur 422 Airtable (2025-01-15)

### 🐛 Corrections de bugs

#### Erreur 422 sur boutons "Encaisser" et "Stocks"
- **Problème** : Formules Airtable invalides causaient des erreurs 422 (Unprocessable Entity)
- **Cause** : Utilisation incorrecte de champs Formula dans `filterByFormula`

#### Modifications apportées

**1. ClientModel.getClientsWithDettes()** ([js/models/client.js](js/models/client.js))
- ❌ Avant : `{solde_du} > 0` (champ Formula non filtrable)
- ✅ Après : Filtrage côté client pour compatibilité avec champs calculés
- Impact : Fonctionne désormais avec tous les clients ayant des dettes

**2. ArticleModel.getActifs()** ([js/models/article.js](js/models/article.js))
- ❌ Avant : `{actif}=TRUE()` (syntaxe Airtable invalide)
- ✅ Après : `{actif}` (syntaxe correcte pour checkbox)
- Impact : Filtre correctement les articles actifs

**3. AirtableService - Gestion d'erreurs améliorée** ([js/services/airtable.js](js/services/airtable.js))
- ✅ Messages d'erreur détaillés avec `errorData.error?.message`
- ✅ Logging automatique des erreurs avec contexte complet
- ✅ Meilleur debugging pour erreurs futures
- Méthodes modifiées : `getAll`, `getById`, `create`, `createMany`, `update`, `delete`

### 📚 Documentation

- Nouveau fichier : [BUGFIX_AIRTABLE_422.md](BUGFIX_AIRTABLE_422.md)
  - Explication détaillée du problème et solutions
  - Guide des formules Airtable (syntaxes correctes/incorrectes)
  - Tableau des champs filtrables vs non-filtrables
  - Exemples de code avant/après

### ✅ Tests

- ✅ Bouton "Encaisser" : Affiche correctement les clients avec dettes
- ✅ Bouton "Stocks" : Affiche correctement la liste des articles
- ✅ Console : Pas d'erreurs 422, logs détaillés activés

### 🎯 Impact

- **Priorité** : Critique (bloquant)
- **Fichiers modifiés** : 3
- **Lignes modifiées** : ~50
- **Compatibilité** : 100% rétrocompatible

---

## Version 1.1.0 - Ajout données de test (2025-01-15)

### ✨ Nouveautés

#### Jeu de données complet
- **12 fichiers CSV** prêts à importer dans Airtable
- **Données cohérentes** couvrant 4 mois d'activité (janvier-avril 2024)
- **Volume réaliste** : 30 ventes, 20 clients, 21 articles, 10 lots

#### Documentation enrichie
- `data/IMPORT_GUIDE.md` : Guide pas à pas pour importer les CSV
- `data/DATA_SUMMARY.md` : Statistiques et insights métier
- `data/README.md` : Vue d'ensemble des données

#### Contenu des données

**Boutiques (3)**
- Pinho (Parfums)
- BelPaire (Chaussures)
- Jewely (Bijoux)

**Articles (21)**
- 7 parfums (Dior, Chanel, Armani, Gucci, YSL, Prada, Lancôme)
- 7 chaussures (Nike, Adidas, Converse, Puma, Vans, Reebok, New Balance)
- 7 bijoux (colliers, bagues, boucles d'oreilles, bracelets, montres, parures)

**Clients (20)**
- Profils variés : collègues, voisins, services publics/privés
- Mix de comportements : bons payeurs, crédit, retards

**Ventes (30)**
- Période : janvier-avril 2024
- CA total : ~1 800 000 XOF
- Mix paiements : cash (45%), mobile money (35%), virement (20%)

**Dettes (12)**
- 7 soldées
- 5 actives (~50 000 XOF)
- Taux de recouvrement : 97%

**Relances (5)**
- 2 envoyées (traçabilité complète)
- 3 programmées (clients en retard)

### 📊 Statistiques

- **CA moyen/vente** : 60 000 XOF
- **Taux d'encaissement** : 83%
- **Valeur stock** : ~3 500 000 XOF
- **Marges réalisées** : 23% à 71% selon les lots

### 🎯 Scénarios testables

✅ Ventes cash complètes
✅ Ventes avec crédit et échéanciers
✅ Paiements partiels et multiples
✅ Dettes en retard
✅ Relances client
✅ Gestion multi-boutiques
✅ Lots multi-articles
✅ Stocks FIFO

---

## Version 1.0.0 - Version initiale (2025-01-15)

### ✨ Fonctionnalités

#### Architecture
- SPA mobile-first en vanilla JavaScript
- 11 écrans fonctionnels
- Routeur hash-based
- État global centralisé

#### Services
- Service Airtable (CRUD complet)
- Service Storage (OneDrive/Drive/Local)
- Service WhatsApp (génération messages)
- Service PDF (factures/reçus HTML)
- Service Analytics (CA, marges, stats)

#### Modèles
- 8 entités métier (Boutique, Article, Lot, Client, Vente, Paiement, Dette, Relance)
- Validation des données
- Méthodes CRUD

#### UI/UX
- Design mobile-first responsive
- 5 fichiers CSS organisés
- Composants réutilisables (toast, modal, cards)
- Navigation bottom (mobile) + side (desktop)

#### Documentation
- README complet
- QUICKSTART (5 étapes)
- ARCHITECTURE technique
- AIRTABLE_SCHEMA (12 tables)

### 📦 Livrables

- 43 fichiers sources
- 5 fichiers documentation
- Structure projet complète

### 🔧 Points d'extension

- OneDrive/Google Drive (placeholders prêts)
- WhatsApp Business API (commentaires détaillés)
- jsPDF (structure prête)

---

## Roadmap

### Version 1.2.0 (à venir)
- [ ] Complétion écrans PLACEHOLDER
  - [ ] Wizard vente multi-étapes
  - [ ] Flux paiement complet
  - [ ] Gestion lots détaillée
  - [ ] Dettes & relances avancées
  - [ ] Rapports avec graphiques
- [ ] Intégration OneDrive réelle
- [ ] Génération PDF avec jsPDF

### Version 2.0.0 (futur)
- [ ] Authentification multi-utilisateurs
- [ ] Gestion des rôles
- [ ] PWA (mode offline)
- [ ] Notifications push
- [ ] Export Excel
- [ ] Mode dark
- [ ] Internationalisation (i18n)
- [ ] Tests automatisés

---

**Changelog maintenu à jour à chaque release**
