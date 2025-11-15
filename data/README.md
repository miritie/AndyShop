# 📁 Données de test AndyShop

Ce dossier contient un **jeu de données complet et cohérent** pour tester l'application AndyShop.

## 📋 Contenu

- **12 fichiers CSV** prêts à importer dans Airtable
- **Guide d'importation** détaillé
- **Résumé statistique** des données

## 🚀 Démarrage rapide

1. Lire [IMPORT_GUIDE.md](IMPORT_GUIDE.md)
2. Créer la base Airtable avec la structure du [AIRTABLE_SCHEMA.md](../AIRTABLE_SCHEMA.md)
3. Importer les CSV dans l'ordre (01 à 12)
4. Configurer les formules et rollups
5. Tester l'application !

## 📊 Vue d'ensemble des données

### Volume
- 3 boutiques (Pinho, BelPaire, Jewely)
- 5 fournisseurs
- 21 articles
- 20 clients
- 10 lots d'acquisition
- 30 ventes sur 4 mois
- 12 paiements traçables
- 5 dettes actives

### Période couverte
**Janvier - Avril 2024** (4 mois d'activité)

### Montants
- **CA total** : ~1 800 000 XOF
- **Encaissé** : ~1 500 000 XOF (83%)
- **Dettes actives** : ~50 000 XOF
- **Valeur stock** : ~3 500 000 XOF

## 📄 Fichiers CSV

| Fichier | Table Airtable | Lignes | Description |
|---------|----------------|--------|-------------|
| `01_Boutiques.csv` | Boutiques | 3 | Pinho, BelPaire, Jewely |
| `02_Fournisseurs.csv` | Fournisseurs | 5 | Locaux et internationaux |
| `03_Articles.csv` | Articles | 21 | Parfums, chaussures, bijoux |
| `04_Clients.csv` | Clients | 20 | Profils variés |
| `05_Lots.csv` | Lots | 10 | Acquisitions groupées |
| `06_Lignes_Lot.csv` | Lignes_Lot | 25 | Composition des lots |
| `07_Ventes.csv` | Ventes | 30 | Transactions |
| `08_Lignes_Vente.csv` | Lignes_Vente | 40 | Détail articles vendus |
| `09_Paiements.csv` | Paiements | 12 | Encaissements tracés |
| `10_Dettes.csv` | Dettes | 12 | Crédits avec échéanciers |
| `11_Allocations_Paiement.csv` | Allocations_Paiement | 12 | Liaisons paiements/dettes |
| `12_Relances.csv` | Relances | 5 | Relances programmées |

## 🎯 Scénarios de test inclus

Les données permettent de tester :

✅ **Ventes cash complètes** (ex: Kouadio Jean-Baptiste, Brou André)
✅ **Ventes avec crédit** (ex: Adjoua Marie-Claire, Sanogo Mariam)
✅ **Paiements partiels** (ex: Traoré Aminata)
✅ **Paiements multiples** (ex: Bamba Moussa - 2 versements)
✅ **Dettes soldées** (7 cas)
✅ **Dettes en retard** (Ouattara Seydou, Adjoua Marie-Claire)
✅ **Relances envoyées** (2 cas tracés)
✅ **Relances programmées** (3 cas futurs)
✅ **Gestion multi-boutiques** (ventes réparties sur 3 boutiques)
✅ **Lots multi-articles** (tous les lots contiennent 2-4 articles)
✅ **Stocks FIFO** (traçabilité lot d'origine)

## 📖 Documentation

- **[IMPORT_GUIDE.md](IMPORT_GUIDE.md)** : Guide pas à pas pour importer les données
- **[DATA_SUMMARY.md](DATA_SUMMARY.md)** : Statistiques détaillées et insights métier

## ⚙️ Format des données

### Dates
Format ISO : `YYYY-MM-DD` ou `YYYY-MM-DD HH:MM`

### Montants
Devise : XOF (Franc CFA)

### Échéanciers
Format JSON dans le champ `echeancier` :
```json
[{"date":"2024-05-25","montant":10000}]
```

### Images
URLs placeholder (via.placeholder.com) - À remplacer par vos vraies images

### Relations
Format : `Nom de l'enregistrement` ou `Reference`
- Exemple boutique : `Pinho`
- Exemple lot : `LOT-2024-001`
- Exemple vente : `VTE-2024-001`

## 🔍 Vérification post-import

Après import, vérifier :

- [ ] **Stocks calculés** : Articles.stock_total affiche des valeurs
- [ ] **CA clients** : Clients.total_achats cohérents
- [ ] **Dettes** : montant_restant = montant_initial - montant_paye
- [ ] **Relations** : Tous les liens fonctionnent
- [ ] **Formules** : Rollups et formulas retournent des valeurs

## 💡 Astuces

### Si l'import CSV échoue
1. Vérifier que les noms de colonnes correspondent exactement
2. Vérifier les types de champs (Date, Currency, etc.)
3. Importer via Excel/Google Sheets puis copier-coller

### Si les relations ne se créent pas
1. Vérifier que les noms correspondent exactement (casse importante)
2. Créer les relations manuellement après import
3. Utiliser l'interface Airtable pour lier les enregistrements

### Si les formules ne calculent pas
1. Reconfigurer manuellement après import
2. Suivre les instructions dans [IMPORT_GUIDE.md](IMPORT_GUIDE.md#corrections-post-import)

---

**Données réalistes, cohérentes et prêtes à l'emploi !** 🚀

Pour toute question, consulter la documentation principale dans [../README.md](../README.md)
