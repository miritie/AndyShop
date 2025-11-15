# 📦 Fichiers de données - Récapitulatif

## ✅ Ajout terminé !

J'ai créé un **jeu de données complet et cohérent** pour tester l'application AndyShop.

---

## 📁 Fichiers créés

### Dossier `/data/csv/` (12 fichiers CSV)

| # | Fichier | Lignes | Description |
|---|---------|--------|-------------|
| 1 | `01_Boutiques.csv` | 3 | Pinho, BelPaire, Jewely avec identité visuelle |
| 2 | `02_Fournisseurs.csv` | 5 | Grossistes locaux (Abidjan) et internationaux (Dubai, Chine, France, Maroc) |
| 3 | `03_Articles.csv` | 21 | 7 parfums, 7 chaussures, 7 bijoux avec images placeholder |
| 4 | `04_Clients.csv` | 20 | Profils variés : collègues, voisins, services publics/privés |
| 5 | `05_Lots.csv` | 10 | Acquisitions groupées de janvier à mars 2024 |
| 6 | `06_Lignes_Lot.csv` | 25 | Composition détaillée des lots (articles + quantités + coûts) |
| 7 | `07_Ventes.csv` | 30 | Transactions de janvier à avril 2024 |
| 8 | `08_Lignes_Vente.csv` | 40 | Détail des articles vendus avec prix négociés |
| 9 | `09_Paiements.csv` | 12 | Encaissements tracés avec preuves (cash, mobile money, virement) |
| 10 | `10_Dettes.csv` | 12 | Crédits avec échéanciers JSON |
| 11 | `11_Allocations_Paiement.csv` | 12 | Liaisons paiements ↔ dettes |
| 12 | `12_Relances.csv` | 5 | Relances programmées et envoyées |

**Total : 195 lignes de données**

---

### Documentation (4 fichiers)

| Fichier | Description |
|---------|-------------|
| `data/README.md` | Vue d'ensemble des données de test |
| `data/IMPORT_GUIDE.md` | Guide pas à pas pour importer dans Airtable (7 pages) |
| `data/DATA_SUMMARY.md` | Statistiques détaillées et insights métier (6 pages) |
| `data/CSV_FILES_LIST.txt` | Récapitulatif visuel avec tableaux ASCII |

---

## 📊 Contenu des données

### Volume réaliste

- **Période** : 4 mois (janvier - avril 2024)
- **CA total** : ~1 800 000 XOF
- **Encaissé** : ~1 500 000 XOF (83%)
- **Dettes actives** : ~50 000 XOF
- **Valeur stock** : ~3 500 000 XOF

### Répartition

**Par boutique :**
- Pinho (Parfums) : 13 ventes, ~750 000 XOF
- BelPaire (Chaussures) : 11 ventes, ~685 000 XOF
- Jewely (Bijoux) : 6 ventes, ~365 000 XOF

**Par mode de paiement :**
- Cash : 45% (~810 000 XOF)
- Mobile Money : 35% (~630 000 XOF)
- Virement : 20% (~360 000 XOF)

**Clients :**
- 20 clients actifs
- 5 clients débiteurs
- Top client : Diabaté Mamadou (245 000 XOF)

---

## 🎯 Scénarios testables

Les données permettent de tester **tous les flux métier** :

✅ **Ventes** : cash complètes, crédit, paiement partiel, multi-boutiques
✅ **Paiements** : multiples, partiels, avec preuves
✅ **Dettes** : échéanciers, soldées, en retard
✅ **Relances** : programmées, envoyées, traçabilité
✅ **Stocks** : FIFO, alertes stock faible
✅ **Lots** : multi-articles, répartition coûts, marges
✅ **Documents** : factures, reçus, relevés
✅ **Reporting** : CA, marges, top articles/clients

---

## 🚀 Import dans Airtable

### Méthode recommandée

1. **Créer la base Airtable** selon [AIRTABLE_SCHEMA.md](AIRTABLE_SCHEMA.md)
2. **Importer les CSV** dans l'ordre (01 → 12) via "Import data" → "CSV file"
3. **Configurer les formules** (Rollups et Formulas) selon le guide
4. **Vérifier les relations** entre tables
5. **Tester l'application** !

### Guide détaillé

👉 **Lire absolument** : [data/IMPORT_GUIDE.md](data/IMPORT_GUIDE.md)

Ce guide contient :
- Instructions pas à pas
- Liste complète des formules à configurer
- Vérifications post-import
- Dépannage des problèmes courants

---

## 📈 Insights métier

Les données incluent des **cas réalistes** :

### ✅ Bons clients
- Brou André : 3 ventes, toujours cash, 235 000 XOF
- Diabaté Mamadou : 2 ventes, virements, 245 000 XOF
- Koffi Martin : 1 vente, 120 000 XOF, exigent sur qualité

### ⚠️ Clients à suivre
- Ouattara Seydou : 46 000 XOF en retard (2 échéances dépassées)
- Adjoua Marie-Claire : 7 000 XOF restant (échéance dépassée)
- Bamba Moussa : 2 versements reçus, prochain attendu 25/05

### 📦 Performance stocks
- Dior Sauvage : Best-seller (11 unités vendues)
- Nike Air Max 90 : Forte demande (9 unités)
- Collier Or 18K : Haute valeur (45 000 XOF/unité)

### 💰 Marges réalisées
- LOT-2024-001 : +23% (parfums)
- LOT-2024-002 : +30% (chaussures)
- LOT-2024-008 : +50% (bijoux précieux)

---

## 🔧 Points techniques

### Format des données

**Dates** : ISO 8601 (`YYYY-MM-DD` ou `YYYY-MM-DD HH:MM`)
**Montants** : Nombres entiers (XOF - Franc CFA)
**Échéanciers** : JSON dans champ texte
```json
[{"date":"2024-05-25","montant":10000}]
```

### Relations

Les CSV utilisent des **références textuelles** qui se transforment automatiquement en liens Airtable :
- Boutiques : par nom (`Pinho`, `BelPaire`, `Jewely`)
- Fournisseurs : par nom
- Articles : par nom
- Lots : par référence (`LOT-2024-001`)
- Ventes : par référence (`VTE-2024-001`)
- Clients : par nom complet

### Images

URLs placeholder (via.placeholder.com) - **À remplacer par vos vraies images**

Format suggéré :
```
https://via.placeholder.com/200/COULEUR/FFFFFF?text=NOM
```

---

## 📝 Fichiers modifiés

### config.js

⚠️ **Note** : J'ai remarqué que vous avez déjà configuré vos clés Airtable dans `js/config.js` :
- API Key : `patvEkyjvDPuPZl0w...`
- Base ID : `appRfeVgdy8HsBm7t`

**L'application est donc prête à utiliser ces données dès que vous les importerez dans Airtable !**

---

## ✨ Prochaines étapes

### 1. Importer les données (15-30 min)

```bash
cd /Volumes/DATA/DEVS/AndyShop/data
# Lire IMPORT_GUIDE.md
# Importer les CSV dans Airtable
```

### 2. Lancer l'application

```bash
cd /Volumes/DATA/DEVS/AndyShop
python -m http.server 8000
# Ouvrir http://localhost:8000
```

### 3. Tester les fonctionnalités

- Dashboard avec stats en temps réel
- Liste clients avec dettes
- Stocks par article
- Génération de factures WhatsApp
- Relances client

---

## 🎉 Résultat

Vous disposerez d'une **application complètement fonctionnelle** avec :

- ✅ Données réalistes sur 4 mois
- ✅ 30 ventes à analyser
- ✅ 20 clients avec profils variés
- ✅ Dettes actives à recouvrer
- ✅ Relances à envoyer
- ✅ Stocks à gérer
- ✅ CA et marges à calculer

**Idéal pour une démonstration ou un POC auprès de votre épouse !** 🚀

---

## 📚 Documentation complète

| Fichier | Contenu |
|---------|---------|
| [README.md](README.md) | Documentation principale du projet |
| [QUICKSTART.md](QUICKSTART.md) | Démarrage rapide en 5 étapes |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture technique |
| [AIRTABLE_SCHEMA.md](AIRTABLE_SCHEMA.md) | Structure des 12 tables |
| [data/IMPORT_GUIDE.md](data/IMPORT_GUIDE.md) | Guide import CSV |
| [data/DATA_SUMMARY.md](data/DATA_SUMMARY.md) | Statistiques détaillées |
| [CHANGELOG.md](CHANGELOG.md) | Historique des versions |

---

**Tout est prêt pour être testé !** 🎊
