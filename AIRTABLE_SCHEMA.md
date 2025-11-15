# Structure Airtable - AndyShop

## Vue d'ensemble

La base Airtable **AndyShop** contient **12 tables** interconnectées.

## Ordre de création recommandé

Pour éviter les erreurs de dépendances, créer les tables dans cet ordre :

1. Boutiques
2. Fournisseurs
3. Articles
4. Lots
5. Lignes_Lot
6. Clients
7. Ventes
8. Lignes_Vente
9. Paiements
10. Dettes
11. Allocations_Paiement
12. Relances

---

## 📋 Détail des tables

### TABLE 1 : Boutiques

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `nom` | Single line text | - | Ex: "Pinho" |
| `type` | Single select | Parfums, Chaussures, Bijoux, Autre | - |
| `logo_url` | URL | - | URL de l'image du logo |
| `couleur_principale` | Single line text | - | Code hex, ex: "#8b5cf6" |
| `couleur_secondaire` | Single line text | - | Optionnel |
| `texte_legal` | Long text | - | Pied de page factures |
| `actif` | Checkbox | - | Boutique active ? |
| `date_creation` | Date | - | Auto |

**Exemples de données** :
- Pinho, Parfums, #8b5cf6
- BelPaire, Chaussures, #f59e0b
- Jewely, Bijoux, #ec4899

---

### TABLE 2 : Fournisseurs

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `nom` | Single line text | - | Nom du grossiste |
| `pays` | Single select | Local, Extérieur | - |
| `telephone` | Phone | - | Format international |
| `email` | Email | - | Optionnel |
| `type_produits` | Multiple select | Parfums, Chaussures, Bijoux, Autre | - |
| `notes` | Long text | - | Notes libres |
| `date_creation` | Date | - | Auto |

---

### TABLE 3 : Articles

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `nom` | Single line text | - | Nom de l'article |
| `boutique` | Link to another record | → Boutiques | - |
| `categorie` | Single select | Parfum, Chaussure, Bijou, Autre | - |
| `image_url` | URL | - | URL photo article |
| `notes` | Long text | - | Description |
| `actif` | Checkbox | - | Article actif ? |
| `stock_total` | Rollup | Rollup from Lignes_Lot → SUM(quantite_restante) | Calculé auto |
| `date_creation` | Date | - | Auto |

---

### TABLE 4 : Lots

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `reference` | Formula | `"LOT-" & YEAR(CREATED_TIME()) & "-" & RECORD_ID()` | Ex: LOT-2025-001 |
| `fournisseur` | Link to another record | → Fournisseurs | - |
| `date_achat` | Date | - | Date d'acquisition |
| `lieu_achat` | Single select | Local, Extérieur | - |
| `devise` | Single select | XOF, EUR, USD, Autre | - |
| `montant_global` | Currency (XOF) | - | Coût total du lot |
| `frais_divers` | Currency (XOF) | - | Transport, douane, etc. |
| `montant_total` | Formula | `{montant_global} + {frais_divers}` | Calculé auto |
| `notes` | Long text | - | Notes libres |

---

### TABLE 5 : Lignes_Lot

**Composition des lots (articles + quantités)**

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `lot` | Link to another record | → Lots | Lot parent |
| `article` | Link to another record | → Articles | Article concerné |
| `quantite_initiale` | Number | Integer | Quantité achetée |
| `quantite_vendue` | Rollup | Rollup from Lignes_Vente → SUM(quantite) | Calculé auto |
| `quantite_restante` | Formula | `{quantite_initiale} - {quantite_vendue}` | Stock restant |
| `cout_total_article` | Currency (XOF) | - | Part du coût du lot |
| `cout_unitaire` | Formula | `{cout_total_article} / {quantite_initiale}` | Coût par unité |
| `prix_vente_souhaite` | Currency (XOF) | - | Prix de vente cible |

---

### TABLE 6 : Clients

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `nom_complet` | Single line text | - | Nom/prénom ou surnom |
| `telephone` | Phone | - | **Unique** (clé) |
| `email` | Email | - | Optionnel |
| `adresse` | Long text | - | Optionnel |
| `type_client` | Single select | Collègue, Voisin, Service public, Service privé, Autre | - |
| `notes` | Long text | - | Notes libres |
| `total_achats` | Rollup | Rollup from Ventes → SUM(montant_total) | Calculé auto |
| `total_paye` | Rollup | Rollup from Paiements → SUM(montant) | Calculé auto |
| `solde_du` | Formula | `{total_achats} - {total_paye}` | Dette totale |
| `date_creation` | Date | - | Auto |

---

### TABLE 7 : Ventes

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `reference` | Formula | `"VTE-" & YEAR(CREATED_TIME()) & "-" & RECORD_ID()` | Ex: VTE-2025-042 |
| `client` | Link to another record | → Clients | Client acheteur |
| `date_vente` | Date | Include time | Date de la transaction |
| `montant_total` | Rollup | Rollup from Lignes_Vente → SUM(total_ligne) | Calculé auto |
| `montant_paye_initial` | Currency (XOF) | - | Montant payé au moment de la vente |
| `montant_restant_du` | Formula | `{montant_total} - {montant_paye_initial}` | Reste à payer |
| `boutique_principale` | Link to another record | → Boutiques | Boutique majoritaire |
| `notes` | Long text | - | Notes libres |

---

### TABLE 8 : Lignes_Vente

**Détail des articles vendus**

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `vente` | Link to another record | → Ventes | Vente parent |
| `article` | Link to another record | → Articles | Article vendu |
| `ligne_lot` | Link to another record | → Lignes_Lot | Lot d'origine (FIFO) |
| `quantite` | Number | Integer | Quantité vendue |
| `prix_unitaire_negocie` | Currency (XOF) | - | Prix réellement pratiqué |
| `total_ligne` | Formula | `{quantite} * {prix_unitaire_negocie}` | Total ligne |

---

### TABLE 9 : Paiements

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `reference` | Formula | `"PAY-" & YEAR(CREATED_TIME()) & "-" & RECORD_ID()` | Ex: PAY-2025-087 |
| `client` | Link to another record | → Clients | Client payeur |
| `date_paiement` | Date | Include time | Date de réception |
| `montant` | Currency (XOF) | - | Montant total reçu |
| `mode_paiement` | Single select | Cash, Mobile Money, Virement, Autre | - |
| `preuve_url` | URL | - | Lien vers capture/photo |
| `notes` | Long text | - | Notes libres |

---

### TABLE 10 : Dettes

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `client` | Link to another record | → Clients | Client débiteur |
| `vente` | Link to another record | → Ventes | Vente d'origine |
| `montant_initial` | Currency (XOF) | - | Montant de la dette initiale |
| `montant_paye` | Rollup | Rollup from Allocations_Paiement → SUM(montant_alloue) | Calculé auto |
| `montant_restant` | Formula | `{montant_initial} - {montant_paye}` | Solde restant |
| `date_creation` | Date | - | Date création dette |
| `echeancier` | Long text | - | JSON : `[{"date":"2025-12-01","montant":50000}]` |
| `statut` | Formula | `IF({montant_restant} = 0, "Soldée", "Active")` | Statut calculé |

---

### TABLE 11 : Allocations_Paiement

**Liaison many-to-many entre Paiements et Dettes**

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `paiement` | Link to another record | → Paiements | Paiement source |
| `dette` | Link to another record | → Dettes | Dette impactée |
| `montant_alloue` | Currency (XOF) | - | Part du paiement allouée |
| `date_allocation` | Date | - | Date d'allocation |

---

### TABLE 12 : Relances

**Traçabilité des relances**

| Nom du champ | Type | Options | Notes |
|--------------|------|---------|-------|
| `client` | Link to another record | → Clients | Client relancé |
| `dette` | Link to another record | → Dettes | Dette concernée (optionnel) |
| `date_programmee` | Date | - | Date prévue |
| `date_envoyee` | Date | - | Date effective d'envoi |
| `canal` | Single select | WhatsApp, SMS, Appel, Autre | - |
| `message` | Long text | - | Contenu de la relance |
| `statut` | Single select | Programmée, Envoyée, Échec | - |

---

## 🔗 Relations entre tables

```
BOUTIQUES (1) ──→ (N) ARTICLES
                       │
                       ↓
                 LIGNES_LOT (N) ←── (1) LOTS ←── (1) FOURNISSEURS
                       │
                       ↓
                 LIGNES_VENTE (N) ←── (1) VENTES ←── (1) CLIENTS
                                            │               │
                                            │               ↓
                                            │          PAIEMENTS (N)
                                            │               │
                                            ↓               ↓
                                       DETTES (N) ←→ ALLOCATIONS_PAIEMENT
                                            │
                                            ↓
                                       RELANCES (N)
```

---

## ⚙️ Configuration des Rollup & Formula

### Articles.stock_total (Rollup)
```
Rollup from: Lignes_Lot (via article field)
Aggregation function: SUM(values)
Field: quantite_restante
```

### Clients.total_achats (Rollup)
```
Rollup from: Ventes (via client field)
Aggregation function: SUM(values)
Field: montant_total
```

### Clients.total_paye (Rollup)
```
Rollup from: Paiements (via client field)
Aggregation function: SUM(values)
Field: montant
```

### Clients.solde_du (Formula)
```
{total_achats} - {total_paye}
```

### Ventes.montant_total (Rollup)
```
Rollup from: Lignes_Vente (via vente field)
Aggregation function: SUM(values)
Field: total_ligne
```

---

## 🎯 Données de test recommandées

### Boutiques (3 lignes)
1. Pinho | Parfums | #8b5cf6 | ✓ actif
2. BelPaire | Chaussures | #f59e0b | ✓ actif
3. Jewely | Bijoux | #ec4899 | ✓ actif

### Clients (3 lignes)
1. Kouadio Jean | +225 07 12 34 56 | Collègue
2. Adjoua Marie | +225 05 98 76 54 | Voisin
3. Brou André | +225 01 23 45 67 | Service public

### Articles (5 lignes)
1. Parfum Dior | Boutique: Pinho | Parfum
2. Parfum Chanel | Boutique: Pinho | Parfum
3. Chaussure Nike | Boutique: BelPaire | Chaussure
4. Collier Or | Boutique: Jewely | Bijou
5. Bague Argent | Boutique: Jewely | Bijou

---

**Note** : Une fois les tables créées, obtenir le **Base ID** et le **Personal Access Token** pour configurer `config.js`
