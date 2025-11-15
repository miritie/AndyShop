# Guide d'importation des données dans Airtable

## 📋 Jeu de données inclus

Ce dossier contient **12 fichiers CSV** avec des données de test réalistes et cohérentes :

- **3 boutiques** (Pinho, BelPaire, Jewely)
- **5 fournisseurs** (locaux et internationaux)
- **21 articles** (parfums, chaussures, bijoux)
- **20 clients** (collègues, voisins, services publics/privés)
- **10 lots d'acquisition** (janvier à mars 2024)
- **25 lignes de lot** (composition des lots)
- **30 ventes** (janvier à avril 2024)
- **40 lignes de vente** (détail des articles vendus)
- **12 paiements** (cash, mobile money, virements)
- **12 dettes** (avec échéanciers)
- **12 allocations** (liaisons paiements/dettes)
- **5 relances** (programmées et envoyées)

**Volume financier total** :
- CA total : ~1 800 000 XOF
- Encaissé : ~1 500 000 XOF
- Dettes actives : ~50 000 XOF
- Valeur des stocks : ~3 500 000 XOF

---

## 🚀 Méthode d'importation

### Option 1 : Import CSV direct (RECOMMANDÉ)

#### Étape 1 : Créer les tables vides

1. Connectez-vous à Airtable
2. Créez une nouvelle base : **AndyShop**
3. Pour chaque table, créez la structure selon [AIRTABLE_SCHEMA.md](../../AIRTABLE_SCHEMA.md)

#### Étape 2 : Importer les CSV dans l'ordre

⚠️ **IMPORTANT** : Respecter cet ordre pour éviter les erreurs de relations !

1. **01_Boutiques.csv**
   - Aller dans la table "Boutiques"
   - Cliquer sur "..." (menu) → "Import data" → "CSV file"
   - Sélectionner `01_Boutiques.csv`
   - Mapper les colonnes (vérifier que les types correspondent)
   - Importer

2. **02_Fournisseurs.csv**
   - Table "Fournisseurs"
   - Même processus

3. **03_Articles.csv**
   - Table "Articles"
   - ⚠️ Pour le champ `boutique`, Airtable va créer un lien automatique si les noms correspondent
   - Importer

4. **04_Clients.csv**
   - Table "Clients"
   - Importer

5. **05_Lots.csv**
   - Table "Lots"
   - ⚠️ Le champ `fournisseur` créera un lien automatique
   - Importer

6. **06_Lignes_Lot.csv**
   - Table "Lignes_Lot"
   - ⚠️ Les champs `lot` et `article` utilisent des références
   - Format : `LOT-2024-001` pour lot, `Dior Sauvage 100ml` pour article
   - Airtable va matcher automatiquement si les références existent
   - Importer

7. **07_Ventes.csv**
   - Table "Ventes"
   - ⚠️ Champs `client` et `boutique_principale` : liens automatiques
   - Importer

8. **08_Lignes_Vente.csv**
   - Table "Lignes_Vente"
   - ⚠️ Le champ `ligne_lot` utilise le format : `LOT-2024-001|Dior Sauvage 100ml`
   - Vous devrez peut-être créer ces relations manuellement
   - Importer

9. **09_Paiements.csv**
   - Table "Paiements"
   - Importer

10. **10_Dettes.csv**
    - Table "Dettes"
    - ⚠️ Le champ `echeancier` contient du JSON, il restera en texte
    - Importer

11. **11_Allocations_Paiement.csv**
    - Table "Allocations_Paiement"
    - ⚠️ Format des références : `Adjoua Marie-Claire|VTE-2024-002`
    - Peut nécessiter un mapping manuel
    - Importer

12. **12_Relances.csv**
    - Table "Relances"
    - Importer

---

### Option 2 : Import manuel (si problèmes avec CSV)

Si l'import CSV pose problème (notamment pour les relations), voici la méthode manuelle :

1. **Copier-coller depuis Excel/Google Sheets**
   - Ouvrir le CSV dans Excel ou Google Sheets
   - Sélectionner et copier les données (sans l'en-tête)
   - Dans Airtable, coller dans la grille

2. **Créer les relations manuellement**
   - Pour les champs "Link to another record", cliquer et sélectionner l'enregistrement correspondant

---

## 🔧 Corrections post-import

### 1. Vérifier les formules

Après import, configurer les champs calculés (Formulas et Rollups) :

**Lots.montant_total** (Formula)
```
{montant_global} + {frais_divers}
```

**Lignes_Lot.cout_unitaire** (Formula)
```
{cout_total_article} / {quantite_initiale}
```

**Lignes_Lot.quantite_restante** (Formula)
```
{quantite_initiale} - {quantite_vendue}
```

**Lignes_Lot.quantite_vendue** (Rollup)
```
Rollup from: Lignes_Vente (via ligne_lot)
Aggregation: SUM(values)
Field: quantite
```

**Articles.stock_total** (Rollup)
```
Rollup from: Lignes_Lot (via article)
Aggregation: SUM(values)
Field: quantite_restante
```

**Ventes.montant_total** (Rollup)
```
Rollup from: Lignes_Vente (via vente)
Aggregation: SUM(values)
Field: total_ligne
```

**Ventes.montant_restant_du** (Formula)
```
{montant_total} - {montant_paye_initial}
```

**Clients.total_achats** (Rollup)
```
Rollup from: Ventes (via client)
Aggregation: SUM(values)
Field: montant_total
```

**Clients.total_paye** (Rollup)
```
Rollup from: Paiements (via client)
Aggregation: SUM(values)
Field: montant
```

**Clients.solde_du** (Formula)
```
{total_achats} - {total_paye}
```

**Dettes.montant_paye** (Rollup)
```
Rollup from: Allocations_Paiement (via dette)
Aggregation: SUM(values)
Field: montant_alloue
```

**Dettes.montant_restant** (Formula)
```
{montant_initial} - {montant_paye}
```

**Dettes.statut** (Formula)
```
IF({montant_restant} = 0, "Soldée", "Active")
```

### 2. Vérifier les relations

Après import, vérifier que les relations sont correctement créées :

- [ ] Articles liés aux Boutiques
- [ ] Lots liés aux Fournisseurs
- [ ] Lignes_Lot liées aux Lots et Articles
- [ ] Ventes liées aux Clients et Boutiques
- [ ] Lignes_Vente liées aux Ventes, Articles et Lignes_Lot
- [ ] Paiements liés aux Clients
- [ ] Dettes liées aux Clients et Ventes
- [ ] Allocations_Paiement liées aux Paiements et Dettes
- [ ] Relances liées aux Clients et Dettes

---

## 📊 Vérification des données

Une fois l'import terminé, vérifier :

### Stocks cohérents

Dans la table **Articles**, vérifier que `stock_total` affiche des valeurs :
- Dior Sauvage 100ml : ~17 unités
- Nike Air Max 90 : ~11 unités
- Collier Or 18K : ~6 unités

### CA cohérent

Dans la table **Clients**, vérifier :
- Diabaté Mamadou : total_achats ≈ 245 000 XOF
- Brou André : total_achats ≈ 235 000 XOF

### Dettes cohérentes

Dans la table **Dettes**, vérifier :
- Dettes soldées : montant_restant = 0
- Dettes actives : montant_restant > 0
- Adjoua Marie-Claire : 1 dette soldée + 1 active (7000 XOF)
- Ouattara Seydou : 2 dettes actives

---

## 🎯 Résultat attendu

Après import complet, vous devriez avoir :

- ✅ 3 boutiques actives
- ✅ 5 fournisseurs
- ✅ 21 articles avec stocks calculés automatiquement
- ✅ 20 clients avec totaux calculés
- ✅ 10 lots avec compositions détaillées
- ✅ 30 ventes avec 40 lignes de détail
- ✅ 12 paiements traçables avec preuves
- ✅ 12 dettes avec échéanciers JSON
- ✅ 12 allocations paiements/dettes
- ✅ 5 relances (2 envoyées, 3 programmées)

**L'application AndyShop pourra immédiatement exploiter ces données !**

---

## 🐛 Dépannage

### Erreur "Field type mismatch"
→ Vérifier que le type de champ dans Airtable correspond au CSV (Currency, Date, etc.)

### Relations non créées
→ Vérifier que les noms/références correspondent exactement (sensible à la casse)

### Formulas ne calculent pas
→ Reconfigurer manuellement les formules après import

### Dates au mauvais format
→ Airtable attend le format ISO : `YYYY-MM-DD` ou `YYYY-MM-DD HH:MM`

---

## 📝 Notes importantes

1. **Les URLs d'images** utilisent des placeholders (via.placeholder.com). Remplacer par vos vraies images.

2. **Les échéanciers** sont en JSON dans le champ `echeancier` des dettes. Format :
   ```json
   [{"date":"2024-05-25","montant":10000}]
   ```

3. **Les références** (VTE-2024-001, LOT-2024-001, etc.) sont générées manuellement dans les CSV.
   Dans Airtable, configurez des formules pour auto-générer.

4. **Le champ `ligne_lot`** dans Lignes_Vente peut nécessiter un mapping manuel car il référence une ligne spécifique de lot.

---

**Prêt à importer !** 🚀

Si vous rencontrez des difficultés, consultez la documentation Airtable :
https://support.airtable.com/docs/importing-data-into-airtable
