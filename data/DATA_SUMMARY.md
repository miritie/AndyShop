# 📊 Résumé du jeu de données de test

## Vue d'ensemble

Ce jeu de données couvre **4 mois d'activité** (janvier - avril 2024) pour les 3 boutiques.

---

## 📈 Statistiques globales

### Chiffre d'affaires par boutique

| Boutique | Nombre de ventes | CA total | CA moyen/vente |
|----------|------------------|----------|----------------|
| **Pinho** (Parfums) | 13 ventes | ~750 000 XOF | 57 692 XOF |
| **BelPaire** (Chaussures) | 11 ventes | ~685 000 XOF | 62 273 XOF |
| **Jewely** (Bijoux) | 6 ventes | ~365 000 XOF | 60 833 XOF |
| **TOTAL** | **30 ventes** | **~1 800 000 XOF** | **60 000 XOF** |

### Répartition des paiements

| Mode de paiement | Nombre | Montant total | % |
|------------------|--------|---------------|---|
| Cash | 45% | ~810 000 XOF | 45% |
| Mobile Money | 35% | ~630 000 XOF | 35% |
| Virement | 20% | ~360 000 XOF | 20% |

### État des dettes

- **Total facturé** : ~1 800 000 XOF
- **Total encaissé** : ~1 500 000 XOF (83%)
- **Dettes soldées** : 7 dettes
- **Dettes actives** : 5 dettes (~50 000 XOF)
- **Taux de recouvrement** : 97%

---

## 👥 Top 5 clients (par CA)

1. **Diabaté Mamadou** - 245 000 XOF (2 ventes) - ✅ Toujours payé
2. **Brou André** - 235 000 XOF (3 ventes) - ✅ Toujours cash
3. **Koffi Martin** - 120 000 XOF (1 vente) - ✅ Virement
4. **Ouattara Seydou** - 171 000 XOF (2 ventes) - ⚠️ 1000 XOF restant
5. **Touré Issouf** - 90 000 XOF (1 vente) - ✅ Virement

---

## 🏆 Top 5 articles vendus

1. **Dior Sauvage 100ml** - 11 unités vendues (~265 000 XOF)
2. **Nike Air Max 90** - 9 unités vendues (~245 000 XOF)
3. **Adidas Superstar** - 5 unités vendues (~125 000 XOF)
4. **Chanel N°5 50ml** - 2 unités vendues (~56 000 XOF)
5. **Gucci Bloom 100ml** - 4 unités vendues (~136 000 XOF)

---

## 📦 État des stocks (échantillon)

| Article | Stock initial | Vendu | Stock restant | Valeur restante |
|---------|---------------|-------|---------------|-----------------|
| Dior Sauvage 100ml | 25 | 11 | 14 | ~168 000 XOF |
| Nike Air Max 90 | 20 | 9 | 11 | ~154 000 XOF |
| Chanel N°5 50ml | 12 | 2 | 10 | ~125 000 XOF |
| Collier Or 18K | 9 | 3 | 6 | ~300 000 XOF |

**Valeur totale du stock restant** : ~3 500 000 XOF

---

## 💰 Analyse des marges (exemples)

### Lot LOT-2024-001 (Parfums Pinho)

- **Coût d'acquisition** : 465 000 XOF (450K + 15K frais)
- **CA généré** : ~390 000 XOF (sur 18/37 unités vendues)
- **Marge réalisée** : ~90 000 XOF (+23%)
- **Projection totale** : ~190 000 XOF (+41%) si tout vendu

### Lot LOT-2024-002 (Chaussures)

- **Coût d'acquisition** : 920 000 XOF (800K + 120K frais)
- **CA généré** : ~490 000 XOF (sur 28/75 unités vendues)
- **Marge réalisée** : ~145 000 XOF (+30%)
- **Projection totale** : ~650 000 XOF (+71%) si tout vendu

---

## 📅 Échéancier en cours (avril 2024)

### Dettes actives

1. **Bamba Moussa** (VTE-2024-015)
   - Montant initial : 25 000 XOF
   - Payé : 25 000 XOF (2 versements)
   - Reste : 0 XOF ✅
   - Prochaine échéance : N/A

2. **Adjoua Marie-Claire** (VTE-2024-022)
   - Montant initial : 32 000 XOF
   - Payé : 25 000 XOF
   - **Reste : 7 000 XOF** ⚠️
   - Échéance dépassée : 15/04 (en retard)

3. **Ouattara Seydou** (VTE-2024-009 & VTE-2024-028)
   - Dette 1 : 1 000 XOF restant
   - Dette 2 : 45 000 XOF (**échéance 15/04 en retard**)
   - **Total : 46 000 XOF** ⚠️⚠️

---

## 📱 Relances programmées

| Client | Dette | Statut | Date prévue | Type |
|--------|-------|--------|-------------|------|
| Bamba Moussa | VTE-2024-015 | ✅ Envoyée | 24/03/2024 | Amicale |
| Adjoua Marie-Claire | VTE-2024-022 | ✅ Envoyée | 14/04/2024 | Rappel J-1 |
| Ouattara Seydou | VTE-2024-028 | ⏳ Programmée | 16/04/2024 | Ferme (retard) |
| Bamba Moussa | VTE-2024-015 | ⏳ Programmée | 24/04/2024 | Rappel échéance |
| Adjoua Marie-Claire | VTE-2024-022 | ⏳ Programmée | 20/04/2024 | Ferme (retard) |

---

## 🎯 Scénarios de test possibles

### 1. Nouvelle vente avec paiement cash complet
- Client : Kouadio Jean-Baptiste (bon payeur)
- Articles : Parfums Pinho
- Résultat attendu : Stock mis à jour, aucune dette créée

### 2. Vente avec crédit et échéancier
- Client : Sanogo Mariam (infirmière, crédit apprécié)
- Articles : Bijoux ou chaussures
- Échéancier : 2-3 mois
- Résultat attendu : Dette créée, relances programmées

### 3. Encaissement partiel sur dette existante
- Client : Adjoua Marie-Claire (7 000 XOF restants)
- Montant : 5 000 XOF
- Résultat attendu : Dette réduite à 2 000 XOF

### 4. Relance client en retard
- Client : Ouattara Seydou (46 000 XOF en retard)
- Action : Générer message WhatsApp ferme
- Résultat attendu : Message généré, traçabilité enregistrée

### 5. Création nouveau lot multi-articles
- Fournisseur : Grossiste Adjamé
- Articles : Mix parfums + bijoux
- Coût : 350 000 XOF + 10 000 XOF frais
- Résultat attendu : Stock mis à jour, coûts répartis

### 6. Vente multi-boutiques
- Client : Diabaté Mamadou (gros budget)
- Articles : Parfum Pinho + Chaussures BelPaire + Bijoux Jewely
- Total : ~100 000 XOF
- Résultat attendu : Vente enregistrée avec boutique principale = celle du plus gros montant

### 7. Génération facture avec identité visuelle
- Client : Koffi Martin (exigent)
- Vente : VTE-2024-020
- Résultat attendu : PDF avec logo Pinho, couleurs #8b5cf6

---

## 🔄 Évolution mensuelle

### Janvier 2024
- 4 ventes
- CA : ~220 000 XOF
- Nouveaux clients : 8

### Février 2024
- 12 ventes
- CA : ~750 000 XOF
- Nouveaux clients : 8

### Mars 2024
- 11 ventes
- CA : ~680 000 XOF
- Nouveaux clients : 4

### Avril 2024 (en cours)
- 3 ventes
- CA : ~150 000 XOF
- Encaissements : ~95 000 XOF

**Tendance** : Croissance forte en février (pics St-Valentin), stabilisation en mars

---

## 💡 Insights métier

### Observations positives ✅

1. **Taux de recouvrement élevé** (97%) - excellent suivi des dettes
2. **Diversification des clients** - 20 clients actifs sur 4 mois
3. **Marges confortables** - Entre 23% et 71% selon les lots
4. **Mix de paiements** - Bonne répartition cash/mobile money/virement

### Points d'attention ⚠️

1. **Ouattara Seydou** - 46 000 XOF en retard, nécessite relance ferme
2. **Stock important** - 3,5M XOF immobilisé, optimiser rotations
3. **Concentration CA** - 40% du CA sur 5 clients, risque de dépendance
4. **Échéanciers non respectés** - 2 clients en retard sur 5 dettes actives

### Recommandations 💡

1. Relancer activement les clients en retard (Ouattara, Adjoua)
2. Proposer des promotions sur articles à faible rotation
3. Fidéliser les gros clients (Diabaté, Brou, Koffi)
4. Diversifier la base clients (prospection services publics/privés)
5. Ajuster les échéanciers selon profils clients

---

**Jeu de données prêt à l'emploi pour tester toutes les fonctionnalités d'AndyShop !** 🎉
