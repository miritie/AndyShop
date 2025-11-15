# Bugfix - Erreur création client : date_creation

**Date** : Novembre 2025
**Statut** : ✅ Résolu
**Commit** : `af6e468`

---

## 🐛 Erreur rencontrée

### Message d'erreur

```
Erreur : Airtable API error: 422 - Field "date_creation" cannot accept the provided value
```

### Contexte

- **Écran** : Nouvelle Vente → Création du client (formulaire modal)
- **Action** : Clic sur "Créer" après avoir rempli nom + téléphone
- **Données** : Nom = "Maxence", Téléphone = "0749189195", Type = "Collègue"

---

## 🔍 Analyse de la cause

### Code problématique (AVANT)

```javascript
// js/models/client.js - ligne 43
const clientData = {
  nom_complet: data.nom_complet,
  telephone: data.telephone,
  type_client: data.type_client || Constants.TypesClient.AUTRE,
  date_creation: new Date().toISOString()  // ❌ PROBLÈME ICI
};
```

### Pourquoi ça ne marchait pas ?

**Le problème** : Incompatibilité de format de date entre JavaScript et Airtable

| Aspect | Valeur |
|--------|--------|
| **JavaScript envoie** | `new Date().toISOString()` |
| **Format généré** | `"2025-11-15T20:15:00.000Z"` |
| **Type de champ Airtable** | `Date` (sans heure) |
| **Format attendu** | `"2025-11-15"` (YYYY-MM-DD) |
| **Résultat** | ❌ Erreur 422 |

### Types de champs Date dans Airtable

Airtable a **deux types** de champs de date :

#### 1. Date (sans heure)

```javascript
// Format accepté
"2025-11-15"           ✅
"2025-01-01"           ✅

// Format rejeté
"2025-11-15T20:15:00.000Z"  ❌ Erreur 422
"11/15/2025"                 ❌ Erreur 422
"15-11-2025"                 ❌ Erreur 422
```

#### 2. DateTime (avec heure)

```javascript
// Format accepté (ISO 8601)
"2025-11-15T20:15:00.000Z"  ✅
"2025-11-15T20:15:00+00:00" ✅

// Format accepté (partiel)
"2025-11-15"                ✅ (heure mise à 00:00:00)
```

### Notre cas

Le champ `date_creation` dans la table **Clients** d'Airtable est configuré comme **Date** (sans heure).

Donc il faut envoyer uniquement `YYYY-MM-DD`, pas le format ISO complet.

---

## ✅ Solution implémentée

### Code corrigé (APRÈS)

```javascript
// js/models/client.js - lignes 38-49
const clientData = {
  nom_complet: data.nom_complet,
  telephone: data.telephone,
  type_client: data.type_client || Constants.TypesClient.AUTRE
};

// Airtable Date field (sans heure) attend format YYYY-MM-DD
// Si le champ est DateTime, utiliser ISO, sinon utiliser date simple
const today = new Date();
const dateOnly = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
clientData.date_creation = dateOnly;
```

### Explications

1. **Séparation de la logique**
   - On crée d'abord l'objet avec les champs obligatoires
   - Puis on ajoute la date dans le bon format

2. **Extraction de la date**
   ```javascript
   new Date().toISOString()              // "2025-11-15T20:15:00.000Z"
   .split('T')                           // ["2025-11-15", "20:15:00.000Z"]
   [0]                                   // "2025-11-15" ✅
   ```

3. **Commentaire explicatif**
   - Indique pourquoi on utilise ce format
   - Mentionne l'alternative pour DateTime

---

## 🧪 Tests de validation

### Test 1 : Création client basique

**Procédure** :
1. Aller sur Nouvelle Vente
2. Dans l'autocomplete client, cliquer "+ Créer un nouveau client"
3. Remplir :
   - Nom complet : "Maxence"
   - Téléphone : "0749189195"
   - Type : "Collègue"
4. Cliquer "Créer"

**Résultat attendu** :
- ✅ Toast "Client créé avec succès"
- ✅ Pas d'erreur 422
- ✅ Client créé dans Airtable avec date_creation = date du jour
- ✅ Modal se ferme
- ✅ Client sélectionné automatiquement

---

### Test 2 : Vérification dans Airtable

**Procédure** :
1. Ouvrir Airtable → Table Clients
2. Trouver le client "Maxence"
3. Vérifier le champ `date_creation`

**Résultat attendu** :
- ✅ Date affichée : aujourd'hui (format : 15 nov. 2025 ou équivalent)
- ✅ Pas d'heure affichée (juste la date)
- ✅ Format interne : `2025-11-15`

---

### Test 3 : Création client avec tous les champs

**Procédure** :
1. Créer un client avec :
   - Nom : "Jean Dupont"
   - Téléphone : "0612345678"
   - Type : "VIP"
   - Email : "jean@example.com"
   - Adresse : "123 Rue de la Paix"
   - Notes : "Client fidèle"
2. Cliquer "Créer"

**Résultat attendu** :
- ✅ Client créé avec tous les champs
- ✅ date_creation au format YYYY-MM-DD
- ✅ Pas d'erreur

---

## 📊 Comparaison formats de date

### Formats JavaScript courants

| Méthode | Résultat | Airtable Date | Airtable DateTime |
|---------|----------|---------------|-------------------|
| `new Date().toISOString()` | `2025-11-15T20:15:00.000Z` | ❌ | ✅ |
| `new Date().toISOString().split('T')[0]` | `2025-11-15` | ✅ | ✅ |
| `new Date().toLocaleDateString()` | `15/11/2025` (FR) | ❌ | ❌ |
| `new Date().toDateString()` | `Fri Nov 15 2025` | ❌ | ❌ |
| `new Date().toJSON()` | `2025-11-15T20:15:00.000Z` | ❌ | ✅ |

### Recommandations

**Pour champs Date Airtable** :
```javascript
const dateOnly = new Date().toISOString().split('T')[0];
// Résultat: "2025-11-15"
```

**Pour champs DateTime Airtable** :
```javascript
const dateTime = new Date().toISOString();
// Résultat: "2025-11-15T20:15:00.000Z"
```

**Fonction utilitaire (à créer si nécessaire)** :
```javascript
// js/utils/helpers.js
Helpers.formatDateForAirtable = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

Helpers.formatDateTimeForAirtable = (date = new Date()) => {
  return date.toISOString();
};
```

---

## 🔍 Autres modèles à vérifier

### Modèles susceptibles d'avoir le même problème

Chercher tous les endroits où on utilise `.toISOString()` pour des dates :

```bash
grep -rn "toISOString()" js/models/
```

#### Résultats à vérifier :

1. **VenteModel** - `date_vente`
2. **PaiementModel** - `date_paiement`
3. **AjustementStockModel** - `date_ajustement`
4. **LotModel** - `date_reception`

**Action** : Vérifier dans Airtable si ces champs sont de type :
- `Date` → Utiliser `.split('T')[0]`
- `DateTime` → Garder `.toISOString()`

---

## 📝 Détails techniques

### Erreur HTTP 422

**Code HTTP 422** : "Unprocessable Entity"

Signification Airtable :
- Les données sont syntaxiquement correctes
- Mais sémantiquement invalides (ne correspondent pas au type de champ)

### Validation Airtable côté API

Airtable valide strictement les types :
- ✅ String → champ Text
- ✅ Number → champ Number
- ✅ Boolean → champ Checkbox
- ✅ Array → champ Multiple Select / Link to another record
- ✅ "YYYY-MM-DD" → champ Date
- ✅ "ISO 8601" → champ DateTime

### Pourquoi split('T')[0] fonctionne ?

```javascript
const isoString = "2025-11-15T20:15:00.000Z";

// Méthode 1: split()
isoString.split('T')[0]  // "2025-11-15" ✅

// Méthode 2: substring()
isoString.substring(0, 10)  // "2025-11-15" ✅

// Méthode 3: slice()
isoString.slice(0, 10)  // "2025-11-15" ✅

// Méthode 4: regex
isoString.match(/^\d{4}-\d{2}-\d{2}/)[0]  // "2025-11-15" ✅
```

**Recommandation** : Utiliser `split('T')[0]` car :
- Plus lisible
- Plus rapide
- Intention claire

---

## 🎯 Prévention future

### Checklist création de modèle

Lors de la création d'un nouveau modèle avec des dates :

1. ✅ Vérifier le type du champ dans Airtable (Date ou DateTime)
2. ✅ Utiliser le bon format :
   - Date → `new Date().toISOString().split('T')[0]`
   - DateTime → `new Date().toISOString()`
3. ✅ Tester la création avec un enregistrement
4. ✅ Vérifier qu'aucune erreur 422 n'apparaît

### Convention de nommage

Pour éviter la confusion, utiliser :
- `date_xxx` → Champs Date (sans heure) → Format YYYY-MM-DD
- `datetime_xxx` → Champs DateTime (avec heure) → Format ISO 8601

Exemple :
```javascript
// Bon
date_creation: "2025-11-15"
datetime_derniere_connexion: "2025-11-15T20:15:00.000Z"

// Confusant
date_creation: "2025-11-15T20:15:00.000Z"  // Nom dit "date" mais format "datetime"
```

---

## 📚 Documentation Airtable

### Liens utiles

- [Airtable API - Field types](https://airtable.com/developers/web/api/field-model)
- [ISO 8601 Date format](https://en.wikipedia.org/wiki/ISO_8601)
- [JavaScript Date.toISOString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)

### Format ISO 8601 complet

```
YYYY-MM-DDTHH:mm:ss.sssZ

Où:
- YYYY : Année sur 4 chiffres
- MM   : Mois (01-12)
- DD   : Jour (01-31)
- T    : Séparateur date/heure
- HH   : Heures (00-23)
- mm   : Minutes (00-59)
- ss   : Secondes (00-59)
- sss  : Millisecondes (000-999)
- Z    : UTC timezone (ou +HH:mm pour autre timezone)
```

---

## ✅ Récapitulatif

### Problème

❌ Erreur 422 : Le champ `date_creation` ne peut pas accepter le format ISO complet avec heure

### Cause

Le champ Airtable est de type **Date** (sans heure) mais le code envoyait un format **DateTime** (ISO 8601 complet)

### Solution

✅ Extraction de la partie date uniquement avec `.split('T')[0]`

### Impact

- ✅ Création de clients fonctionne
- ✅ Date correctement stockée dans Airtable
- ✅ Format cohérent avec le type de champ

---

**Statut** : ✅ Corrigé et testé
**Commit** : `af6e468`
**Date** : Novembre 2025
**Fichier** : [js/models/client.js](js/models/client.js)
