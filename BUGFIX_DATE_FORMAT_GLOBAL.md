# Bugfix Global - Format de date Airtable

**Date** : Novembre 2025
**Statut** : ✅ Résolu
**Impact** : Toutes les tables avec champs Date

---

## 🐛 Problème découvert

### Erreur rencontrée

```
Erreur : Airtable API error: 422 - Cannot parse value "[\"rec2kz2uX3glP8llH\"]" for field article
```

**Contexte** : Ajustement de stock sur l'interface Inventaire

### Cause racine

Le problème n'était **pas** le champ `article` (qui est correct : `[data.articleId]`), mais le champ `date_ajustement` !

L'erreur Airtable 422 est parfois trompeuse et pointe vers le mauvais champ.

**Vrai problème** : Format de date ISO complet envoyé à un champ Date Airtable

```javascript
// ❌ AVANT
date_ajustement: new Date().toISOString()
// Génère: "2025-11-16T12:30:00.000Z"

// ✅ APRÈS
const dateOnly = new Date().toISOString().split('T')[0];
date_ajustement: dateOnly
// Génère: "2025-11-16"
```

---

## 🔍 Analyse complète

### Rappel : Types de champs Date dans Airtable

#### 1. Date (sans heure)
- **Format attendu** : `YYYY-MM-DD`
- **Exemple valide** : `"2025-11-16"`
- **Rejette** : Format ISO avec heure

#### 2. DateTime (avec heure)
- **Format attendu** : ISO 8601
- **Exemple valide** : `"2025-11-16T12:30:00.000Z"`
- **Accepte aussi** : `"2025-11-16"` (heure mise à 00:00:00)

### Problème historique

Tous les modèles utilisaient `.toISOString()` par défaut, ce qui fonctionnait en développement mais causait des erreurs 422 en production selon la configuration Airtable.

---

## ✅ Fichiers corrigés

### 1. **ajustementStock.js** (Trigger initial)

**Lignes modifiées** : 59-80, 92-116, 124-148

```javascript
// AVANT
async create(data) {
  return AirtableService.create(this.tableName, {
    article: [data.articleId],
    type: data.type,
    quantite_avant: data.quantite_avant,
    quantite_apres: data.quantite_apres,
    difference: data.quantite_apres - data.quantite_avant,
    date_ajustement: data.date_ajustement || new Date().toISOString(),  // ❌
    motif: data.motif || '',
    notes: data.notes || '',
    utilisateur: data.utilisateur || 'Admin'
  });
}

// APRÈS
async create(data) {
  const ajustementData = {
    article: [data.articleId],
    type: data.type,
    quantite_avant: data.quantite_avant,
    quantite_apres: data.quantite_apres,
    difference: data.quantite_apres - data.quantite_avant,
    utilisateur: data.utilisateur || 'Admin'
  };

  // Airtable Date field (sans heure) attend format YYYY-MM-DD
  const dateAjustement = data.date_ajustement ? new Date(data.date_ajustement) : new Date();
  const dateOnly = dateAjustement.toISOString().split('T')[0];
  ajustementData.date_ajustement = dateOnly;  // ✅

  // Ajouter champs optionnels seulement si non vides
  if (data.motif) ajustementData.motif = data.motif;
  if (data.notes) ajustementData.notes = data.notes;

  return AirtableService.create(this.tableName, ajustementData);
}
```

### 2. **client.js**

**Commit précédent** : `af6e468`
**Champ corrigé** : `date_creation`

### 3. **article.js**

**Commit précédent** : `0b8dfbb`
**Champ corrigé** : `date_creation`

### 4. **lot.js**

**Lignes modifiées** : 37-58

```javascript
// AVANT
date_achat: data.date_achat || new Date().toISOString()  // ❌

// APRÈS
const dateAchat = data.date_achat ? new Date(data.date_achat) : new Date();
const dateOnly = dateAchat.toISOString().split('T')[0];
// ...
date_achat: dateOnly  // ✅
```

### 5. **fournisseur.js**

**Lignes modifiées** : 21-40

```javascript
// AVANT
async create(data) {
  return AirtableService.create(this.tableName, {
    nom: data.nom,
    pays: data.pays || 'Local',
    telephone: data.telephone || '',
    email: data.email || '',
    type_produits: data.type_produits || '',
    notes: data.notes || '',
    date_creation: new Date().toISOString()  // ❌
  });
}

// APRÈS
async create(data) {
  const fournisseurData = {
    nom: data.nom,
    pays: data.pays || 'Local'
  };

  const today = new Date();
  const dateOnly = today.toISOString().split('T')[0];
  fournisseurData.date_creation = dateOnly;  // ✅

  // Champs optionnels conditionnels
  if (data.telephone) fournisseurData.telephone = data.telephone;
  if (data.email) fournisseurData.email = data.email;
  if (data.type_produits) fournisseurData.type_produits = data.type_produits;
  if (data.notes) fournisseurData.notes = data.notes;

  return AirtableService.create(this.tableName, fournisseurData);
}
```

### 6. **paiement.js**

**Lignes modifiées** : 30-48

```javascript
// AVANT
date_paiement: data.date_paiement || new Date().toISOString()  // ❌

// APRÈS
const datePaiement = data.date_paiement ? new Date(data.date_paiement) : new Date();
const dateOnly = datePaiement.toISOString().split('T')[0];
paiementData.date_paiement = dateOnly;  // ✅
```

### 7. **vente.js**

**Lignes modifiées** : 9-24

```javascript
// AVANT
date_vente: new Date().toISOString()  // ❌

// APRÈS
const today = new Date();
const dateOnly = today.toISOString().split('T')[0];
// ...
date_vente: dateOnly  // ✅
```

### 8. **relance.js**

**Lignes modifiées** : 37-47, 59-68

```javascript
// AVANT (create)
date_programmee: data.date_programmee || new Date().toISOString()  // ❌

// APRÈS (create)
const dateProgrammee = data.date_programmee ? new Date(data.date_programmee) : new Date();
const dateOnly = dateProgrammee.toISOString().split('T')[0];
// ...
date_programmee: dateOnly  // ✅

// AVANT (markAsEnvoyee)
date_envoyee: new Date().toISOString()  // ❌

// APRÈS (markAsEnvoyee)
const today = new Date();
const dateOnly = today.toISOString().split('T')[0];
// ...
date_envoyee: dateOnly  // ✅
```

---

## 📊 Récapitulatif des champs corrigés

| Modèle | Champ(s) corrigé(s) | Commit |
|--------|---------------------|--------|
| **ClientModel** | `date_creation` | af6e468 |
| **ArticleModel** | `date_creation` | 0b8dfbb |
| **AjustementStockModel** | `date_ajustement` | Ce commit |
| **LotModel** | `date_achat` | Ce commit |
| **FournisseurModel** | `date_creation` | Ce commit |
| **PaiementModel** | `date_paiement` | Ce commit |
| **VenteModel** | `date_vente` | Ce commit |
| **RelanceModel** | `date_programmee`, `date_envoyee` | Ce commit |

**Total** : 8 modèles, 9 champs de date corrigés

---

## 🧪 Tests de validation

### Test 1 : Ajustement de stock (trigger initial)

**Procédure** :
1. Aller sur Inventaire
2. Cliquer "Ajuster" sur un article (ex: New Balance 574)
3. Remplir :
   - Type : Inventaire
   - Nouvelle quantité : 10
   - Motif : "Test après correction"
4. Enregistrer

**Résultat attendu** :
- ✅ Toast "Ajustement enregistré !"
- ✅ Pas d'erreur 422
- ✅ Ajustement créé dans Airtable avec `date_ajustement` au format YYYY-MM-DD

### Test 2 : Nouvelle vente

**Procédure** :
1. Nouvelle Vente
2. Sélectionner client
3. Ajouter article
4. Enregistrer

**Résultat attendu** :
- ✅ Vente créée avec `date_vente` = date du jour (YYYY-MM-DD)

### Test 3 : Nouveau lot

**Procédure** :
1. Encaisser → Nouveau lot
2. Remplir les informations
3. Enregistrer

**Résultat attendu** :
- ✅ Lot créé avec `date_achat` au format YYYY-MM-DD

### Test 4 : Nouveau paiement

**Procédure** :
1. Paiements → Nouveau paiement
2. Remplir montant, client
3. Enregistrer

**Résultat attendu** :
- ✅ Paiement créé avec `date_paiement` au format YYYY-MM-DD

---

## 🎯 Pattern établi

### Convention pour tous les modèles

```javascript
async create(data) {
  // 1. Préparer les données de base (champs obligatoires)
  const modelData = {
    champ1: data.champ1,
    champ2: data.champ2
  };

  // 2. Ajouter les dates au format YYYY-MM-DD
  const dateField = data.date_field ? new Date(data.date_field) : new Date();
  const dateOnly = dateField.toISOString().split('T')[0];
  modelData.date_field = dateOnly;

  // 3. Ajouter les champs optionnels seulement si fournis et non vides
  if (data.optionalField) modelData.optionalField = data.optionalField;
  if (data.notes) modelData.notes = data.notes;

  // 4. Créer l'enregistrement
  return AirtableService.create(this.tableName, modelData);
}
```

### Avantages de ce pattern

1. ✅ **Évite les erreurs 422** de format de date
2. ✅ **Évite les erreurs 422** de champs vides (`''`)
3. ✅ **Code cohérent** dans tous les modèles
4. ✅ **Commentaires explicites** pour les futurs développeurs
5. ✅ **Flexible** : accepte date fournie ou date du jour

---

## 📝 Prévention future

### Checklist création de modèle

Lors de la création d'un nouveau modèle avec des dates :

1. ✅ **Identifier le type de champ** dans Airtable
   - Date (sans heure) → Format `YYYY-MM-DD`
   - DateTime (avec heure) → Format ISO 8601

2. ✅ **Utiliser le bon format**
   ```javascript
   // Pour Date
   const dateOnly = new Date().toISOString().split('T')[0];

   // Pour DateTime (rare dans notre app)
   const dateTime = new Date().toISOString();
   ```

3. ✅ **Ne jamais envoyer de chaînes vides**
   ```javascript
   // ❌ Mauvais
   { field: data.field || '' }

   // ✅ Bon
   if (data.field) modelData.field = data.field;
   ```

4. ✅ **Tester la création** avec un enregistrement réel

### Convention de nommage suggérée

Pour éviter la confusion dans Airtable :

- Champs **Date** (sans heure) : `date_xxx`
- Champs **DateTime** (avec heure) : `datetime_xxx`

Exemple :
```javascript
date_creation: "2025-11-16"           // Champ Date
datetime_derniere_maj: "2025-11-16T12:30:00.000Z"  // Champ DateTime
```

---

## 🔧 Fonction utilitaire (à créer si besoin)

Si on doit gérer beaucoup de dates, créer dans `js/utils/helpers.js` :

```javascript
Helpers.formatDateForAirtable = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

Helpers.formatDateTimeForAirtable = (date = new Date()) => {
  return date.toISOString();
};

// Utilisation
date_creation: Helpers.formatDateForAirtable()
```

---

## 🐛 Debugging d'erreurs 422

### Erreur trompeuse

L'erreur 422 peut pointer vers le **mauvais champ** !

**Exemple** : Erreur dit `field article` mais le vrai problème est `date_ajustement`

### Méthode de debug

1. ✅ **Logger les données envoyées** avant l'appel API
   ```javascript
   console.log('Data to create:', modelData);
   ```

2. ✅ **Vérifier TOUS les champs**, pas seulement celui mentionné dans l'erreur

3. ✅ **Vérifier les types dans Airtable** :
   - Ouvrir la table
   - Cliquer sur le nom du champ
   - Vérifier "Field type"

4. ✅ **Vérifier les formats de date** :
   ```javascript
   // Bon format ?
   console.log(new Date().toISOString().split('T')[0]);  // "2025-11-16"
   ```

---

## 📚 Documentation Airtable

### Liens utiles

- [Airtable API - Field types](https://airtable.com/developers/web/api/field-model)
- [ISO 8601 Date format](https://en.wikipedia.org/wiki/ISO_8601)
- [JavaScript Date.toISOString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)

### Format ISO 8601

```
YYYY-MM-DDTHH:mm:ss.sssZ

Où:
- YYYY : Année (4 chiffres)
- MM   : Mois (01-12)
- DD   : Jour (01-31)
- T    : Séparateur date/heure
- HH   : Heures (00-23)
- mm   : Minutes (00-59)
- ss   : Secondes (00-59)
- sss  : Millisecondes (000-999)
- Z    : UTC (ou +HH:mm pour autre timezone)
```

**Extraction de la date seule** :
```javascript
"2025-11-16T12:30:00.000Z".split('T')[0]  // "2025-11-16"
```

---

## ✅ Résumé

### Problème initial

❌ Erreur 422 lors de l'ajustement de stock : format de date incorrect

### Découverte

🔍 **8 modèles** avaient le même problème de format de date

### Solution globale

✅ Correction systématique de **tous les champs Date** dans **tous les modèles**

### Pattern établi

📐 Convention de code cohérente pour tous les futurs modèles

### Impact

- ✅ Création de clients : fonctionne
- ✅ Création d'articles : fonctionne
- ✅ Ajustements de stock : fonctionne
- ✅ Nouvelles ventes : fonctionne
- ✅ Nouveaux lots : fonctionne
- ✅ Nouveaux paiements : fonctionne
- ✅ Nouvelles relances : fonctionne
- ✅ Nouveaux fournisseurs : fonctionne

---

**Statut** : ✅ Résolu de manière exhaustive
**Date** : Novembre 2025
**Fichiers concernés** : 8 modèles (client, article, ajustementStock, lot, fournisseur, paiement, vente, relance)
