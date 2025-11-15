# Guide des Rapports - AndyShop

## Vue d'ensemble

Le système de rapports d'AndyShop offre une interface complète pour analyser vos données avec :
- **6 rapports standards** prédéfinis
- **Visualisations graphiques** (Chart.js)
- **Tableaux détaillés** avec basculement en un clic
- **Export PDF** professionnel
- **Architecture extensible** pour rapports personnalisés

---

## Rapports standards disponibles

### 1. Chiffre d'affaires 📈

**Description** : Évolution du CA par période

**Données affichées** :
- Montant par période
- Nombre de transactions
- Total général
- Graphique en courbe

**Utilisation** :
```javascript
const data = await RapportsService.genererCA('mois');
// Périodes disponibles: 'jour', 'semaine', 'mois', 'trimestre', 'annee', '30jours', '90jours'
```

**Filtres** :
- Période (mois par défaut)
- Boutique (optionnel)

---

### 2. Marges 💰

**Description** : Analyse des marges bénéficiaires

**Données affichées** :
- Marge brute par période
- Taux de marge (%)
- Nombre de transactions
- Graphique en courbe

**Calcul** :
```
Marge = Total ventes - Coût d'achat (via lignes_lot)
Taux de marge = (Marge / Total ventes) × 100
```

**Utilisation** :
```javascript
const data = await RapportsService.genererMarges('mois', 'Boutique A');
```

---

### 3. Top Articles 🏆

**Description** : Articles les plus vendus

**Données affichées** :
- Nom de l'article
- Catégorie
- Quantité vendue
- Montant total
- Graphique en barres horizontales

**Utilisation** :
```javascript
const data = await RapportsService.genererTopArticles(10, 'mois', 'Boutique A');
// Paramètres: (limite, période, boutique)
```

**Classement** : Par montant total (décroissant)

---

### 4. Performance Boutiques 🏪

**Description** : Comparaison des boutiques

**Données affichées** :
- Nom de la boutique
- Type
- Nombre de ventes
- Montant total
- Graphique en barres verticales

**Utilisation** :
```javascript
const data = await RapportsService.genererPerformanceBoutiques('mois');
```

**Classement** : Par montant total (décroissant)

---

### 5. Suivi des dettes ⚠️

**Description** : État des créances clients

**Données affichées** :
- Nom du client
- Téléphone
- Total achats
- Total payé
- Solde dû
- Nombre de dettes

**Utilisation** :
```javascript
const data = await RapportsService.genererSuiviDettes();
```

**Classement** : Par solde dû (décroissant)

**Note** : Affiche uniquement les clients avec un solde > 0

---

### 6. État des stocks 📦

**Description** : Situation actuelle des stocks

**Données affichées** :
- Nom de l'article
- Catégorie
- Boutique
- Stock actuel
- Statut (Rupture / Faible / OK)
- Statistiques (graphique circulaire)

**Utilisation** :
```javascript
const data = await RapportsService.genererEtatStocks('Boutique A');
```

**Seuils** :
- **Rupture** : stock = 0
- **Faible** : 0 < stock ≤ seuil (configurable dans `AppConfig.business.lowStockThreshold`)
- **OK** : stock > seuil

---

## Interface utilisateur

### Navigation

1. **Menu principal** : `Menu Plus → Rapports`
2. **Sélection du rapport** : Cliquer sur un rapport standard
3. **Visualisation** : Le rapport s'affiche en mode graphique par défaut

### Basculement Graph ↔ Tableau

**Boutons de basculement** :
- 📊 Graphique
- 📋 Tableau

**En un clic** : Change la vue sans recharger les données

### Export PDF

**Bouton** : 📄 Exporter PDF

**Contenu du PDF** :
- En-tête avec titre et date
- Résumé des indicateurs clés
- Tableau complet des données
- Formatage professionnel

**Nom du fichier** : `rapport_{type}_{date}.pdf`

---

## Types de graphiques

| Rapport | Type de graphique | Bibliothèque |
|---------|-------------------|--------------|
| CA | Courbe avec zone | Chart.js (line) |
| Marges | Courbe avec zone | Chart.js (line) |
| Top Articles | Barres horizontales | Chart.js (bar, indexAxis: 'y') |
| Performance Boutiques | Barres verticales | Chart.js (bar) |
| Suivi dettes | Tableau uniquement | - |
| État stocks | Diagramme circulaire | Chart.js (doughnut) |

---

## Architecture technique

### Structure des fichiers

```
AndyShop/
├── js/
│   ├── services/
│   │   └── rapports.js           # Backend service (calculs)
│   └── ui/screens/
│       └── rapports.js            # Frontend UI (interface)
├── css/
│   └── components.css             # Styles .data-table
└── index.html                     # Chargement Chart.js + jsPDF
```

### État de l'écran

```javascript
const RapportsScreenState = {
  view: 'menu',           // 'menu' | 'rapport' | 'personnalise'
  currentRapport: null,   // Type de rapport affiché
  viewMode: 'graph',      // 'graph' | 'table'
  chartInstance: null,    // Instance Chart.js
  rapportData: null       // Données du rapport
};
```

### Flux de données

```
User click
    ↓
RapportsActions.showRapport(type)
    ↓
RapportsService.generer{Type}()
    ↓
Airtable API (via Models)
    ↓
Calculs + Agrégations
    ↓
RapportsScreenState.rapportData
    ↓
Router.refresh()
    ↓
renderRapport() → renderGraph() | renderTable()
    ↓
Chart.js draw | HTML table
```

---

## Personnalisation

### Ajouter un nouveau rapport standard

**1. Backend** (`js/services/rapports.js`)

```javascript
async genererMonRapport(periode = 'mois') {
  const data = await MonModel.getAll();

  // Filtres et calculs
  const resultat = this.regrouperParPeriode(data, periode, (item) => {
    return item.valeur;
  });

  return {
    type: 'mon_rapport',
    titre: 'Mon Rapport',
    periode,
    donnees: resultat,
    total: resultat.reduce((sum, d) => sum + d.valeur, 0)
  };
}
```

**2. Frontend** (`js/ui/screens/rapports.js`)

Ajouter au menu :
```javascript
<div class="list-item list-item-clickable" onclick="RapportsActions.showRapport('mon_rapport')">
  <div class="list-item-avatar" style="background: var(--color-primary-light);">
    🎯
  </div>
  <div class="list-item-content">
    <div class="list-item-title">Mon Rapport</div>
    <div class="list-item-subtitle">Description</div>
  </div>
</div>
```

Ajouter le switch case :
```javascript
case 'mon_rapport':
  data = await RapportsService.genererMonRapport('mois');
  break;
```

Ajouter le rendu tableau :
```javascript
if (data.type === 'mon_rapport') {
  return `<table>...</table>`;
}
```

Ajouter le rendu graphique :
```javascript
if (data.type === 'mon_rapport') {
  chartConfig = { type: 'bar', ... };
}
```

---

## Rapports personnalisés

**Statut** : En développement

**Fonctionnalités prévues** :
- Sélection des dimensions (colonnes)
- Sélection des mesures (agrégations)
- Filtres dynamiques
- Sauvegarde dans localStorage
- Partage de rapports

**Structure de configuration** :

```javascript
const config = {
  titre: 'Mon rapport personnalisé',
  type: 'ventes',
  dimensions: ['boutique', 'categorie'],
  mesures: [
    { nom: 'Total ventes', champ: 'montant_total', type: 'sum' },
    { nom: 'Nombre', champ: 'id', type: 'count' }
  ],
  filtres: [
    { champ: 'date_vente', operateur: '>=', valeur: '2025-01-01' }
  ],
  periode: 'mois'
};

const data = await RapportsService.genererPersonnalise(config);
```

---

## Dépendances externes

### Chart.js 4.4.0

**CDN** : `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`

**Documentation** : https://www.chartjs.org/docs/latest/

**Types de graphiques utilisés** :
- `line` : Courbes (CA, Marges)
- `bar` : Barres (Top Articles, Performance)
- `doughnut` : Circulaire (État stocks)

### jsPDF 2.5.1

**CDN** : `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`

**Plugin autoTable** : `https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.7.1/jspdf.plugin.autotable.min.js`

**Documentation** : https://github.com/parallax/jsPDF

**Utilisation** :
```javascript
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
doc.autoTable({ head: [...], body: [...] });
doc.save('rapport.pdf');
```

---

## Performance

### Optimisations

1. **Cache des instances Chart.js** : Destruction avant création
2. **Lazy loading** : Graphiques dessinés après le rendu DOM (`setTimeout`)
3. **Agrégations côté service** : Calculs en JavaScript (pas d'appels multiples Airtable)

### Limites

- **Pas de pagination** : Tous les enregistrements chargés en mémoire
- **Pas de cache** : Requêtes Airtable à chaque affichage
- **Graphiques lourds** : Peut ralentir avec >1000 points de données

### Recommandations

- Utiliser les filtres de période pour limiter le volume
- Éviter d'afficher >100 éléments dans les graphiques
- Préférer les tableaux pour les grandes listes

---

## Dépannage

### Le graphique ne s'affiche pas

**Causes possibles** :
1. Chart.js non chargé → Vérifier la console
2. Canvas non trouvé → Vérifier `setTimeout` dans `renderGraph()`
3. Données vides → Vérifier `rapportData.donnees`

**Solution** :
```javascript
// Console
console.log(RapportsScreenState.rapportData);
console.log(window.Chart); // Devrait afficher la classe Chart
```

### Export PDF échoue

**Causes possibles** :
1. jsPDF non chargé → Vérifier `window.jspdf`
2. Données mal formatées → Vérifier le type du rapport
3. Caractères spéciaux → Problème d'encodage

**Solution** :
```javascript
// Console
console.log(window.jspdf);
console.log(window.jspdf.jsPDF);
```

### Données incorrectes

**Causes possibles** :
1. Formules Airtable incorrectes
2. Relations mal configurées
3. Filtres de période mal appliqués

**Solution** : Vérifier les calculs dans la console
```javascript
const data = await RapportsService.genererCA('mois');
console.log(data);
```

---

## Test des rapports

### Rapport CA

```javascript
// Console navigateur
const ca = await RapportsService.genererCA('mois');
console.log('Total CA:', ca.total);
console.log('Nb périodes:', ca.donnees.length);
```

### Rapport Marges

```javascript
const marges = await RapportsService.genererMarges('trimestre');
console.log('Taux de marge:', marges.pourcentage.toFixed(2) + '%');
```

### Rapport Top Articles

```javascript
const top = await RapportsService.genererTopArticles(5, '30jours');
console.log('Top 1:', top.donnees[0].nom);
```

---

## Prochaines étapes

### Améliorations prévues

1. **Rapports personnalisés** : Interface de création complète
2. **Filtres dynamiques** : Dates, boutiques, catégories
3. **Comparaisons** : Période actuelle vs période précédente
4. **Graphiques avancés** : Graphiques combinés, sparklines
5. **Export Excel** : Alternative à PDF
6. **Sauvegarde de rapports** : localStorage + partage
7. **Planification** : Envoi automatique par email
8. **Dashboard** : Widgets de rapports sur l'accueil

---

## Ressources

- **Service rapports** : [js/services/rapports.js](js/services/rapports.js)
- **Interface rapports** : [js/ui/screens/rapports.js](js/ui/screens/rapports.js)
- **Documentation Chart.js** : https://www.chartjs.org
- **Documentation jsPDF** : https://artskydj.github.io/jsPDF/docs/

---

**Version** : 1.1.1
**Date** : Novembre 2025
**Statut** : ✅ Production Ready
