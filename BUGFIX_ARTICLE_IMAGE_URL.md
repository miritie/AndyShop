# Bugfix - Erreur 422 image_url lors création/modification article

**Date** : Novembre 2025
**Statut** : ✅ Résolu
**Commit** : `0b8dfbb`

---

## 🐛 Erreur rencontrée

### Message d'erreur

```
Erreur : Airtable API error: 422 - Field "image_url" cannot accept the provided value
```

### Contexte

- **Écran** : Catalogue Articles → Nouvel article / Modifier article
- **Action** : Clic sur "Créer l'article" ou "Enregistrer les modifications"
- **Données** : Article "Armani Code 75ml" avec image sélectionnée
- **Moment** : Après avoir cliqué "Changer l'image" et sélectionné une image

---

## 🔍 Analyse de la cause

### Deux problèmes identifiés

#### 1. Champ `image_url` avec valeur vide

**Code problématique (AVANT)** :

```javascript
// js/ui/screens/articles.js - ligne 656-657
} catch (error) {
  console.error('Erreur upload image:', error);
  UIComponents.showToast('Erreur lors de l\'upload de l\'image, article créé sans image', 'warning');
  imageUrl = '';  // ❌ Chaîne vide !
}

// Ligne 660-667
const data = {
  nom: form.nom,
  boutique: form.boutique,
  categorie: form.categorie,
  image_url: imageUrl,  // ❌ Envoie '' à Airtable
  notes: form.notes,
  actif: form.actif
};
```

**Pourquoi c'est un problème** :
- Le champ `image_url` dans Airtable est de type **URL**
- Le type URL accepte seulement des URLs valides (http://, https://, etc.)
- Une chaîne vide `''` **n'est pas une URL valide** → Erreur 422
- Même une chaîne avec juste des espaces est rejetée

**Solution** : Ne pas envoyer le champ `image_url` du tout si l'URL est vide

---

#### 2. Champ `date_creation` avec format ISO

**Code problématique (AVANT)** :

```javascript
// js/models/article.js - ligne 61
async create(data) {
  return AirtableService.create(this.tableName, {
    nom: data.nom,
    boutique: data.boutique,
    categorie: data.categorie || '',
    image_url: data.image_url || '',  // ❌ Chaîne vide par défaut
    notes: data.notes || '',
    actif: data.actif !== false,
    date_creation: new Date().toISOString()  // ❌ Format ISO complet
  });
}
```

**Problèmes** :
1. `date_creation` : Format ISO au lieu de YYYY-MM-DD
2. `image_url || ''` : Chaîne vide par défaut
3. `categorie || ''` : Chaîne vide par défaut
4. `notes || ''` : Chaîne vide par défaut

---

## ✅ Solutions implémentées

### 1. ArticleModel.create() - Ne pas envoyer champs vides

**Code corrigé (APRÈS)** :

```javascript
// js/models/article.js - lignes 53-72
async create(data) {
  // Préparer les données de base
  const articleData = {
    nom: data.nom,
    boutique: data.boutique,
    actif: data.actif !== false
  };

  // Airtable Date field (sans heure) attend format YYYY-MM-DD
  const today = new Date();
  const dateOnly = today.toISOString().split('T')[0];
  articleData.date_creation = dateOnly;

  // Ajouter les champs optionnels seulement s'ils sont fournis et non vides
  if (data.categorie) articleData.categorie = data.categorie;
  if (data.image_url) articleData.image_url = data.image_url;
  if (data.notes) articleData.notes = data.notes;

  return AirtableService.create(this.tableName, articleData);
}
```

**Changements** :
1. ✅ Seulement les champs obligatoires dans l'objet de base
2. ✅ Date au format YYYY-MM-DD
3. ✅ Champs optionnels ajoutés seulement si truthy (non vides)
4. ✅ Pas de valeurs par défaut `''`

---

### 2. ArticlesScreen.submitForm() - Validation avant envoi

**Code corrigé (APRÈS)** :

```javascript
// js/ui/screens/articles.js - lignes 660-671
const data = {
  nom: form.nom,
  boutique: form.boutique,
  categorie: form.categorie,
  notes: form.notes,
  actif: form.actif
};

// N'ajouter image_url que si elle existe et n'est pas vide
if (imageUrl && imageUrl.trim() !== '') {
  data.image_url = imageUrl;
}
```

**Changements** :
1. ✅ `image_url` retiré de l'objet de base
2. ✅ Ajouté conditionnellement avec validation :
   - `imageUrl` existe (truthy)
   - `imageUrl.trim() !== ''` (pas juste des espaces)

---

## 🎯 Cas d'usage couverts

### Cas 1 : Article avec image uploadée avec succès

```javascript
// imageFile = File { ... }
imageUrl = await ArticleModel.uploadImage(form.imageFile);
// imageUrl = "https://drive.google.com/uc?export=view&id=abc123"

data.image_url = imageUrl;  // ✅ URL valide envoyée
```

**Résultat** :
- ✅ Article créé avec image_url
- ✅ Image visible dans le catalogue

---

### Cas 2 : Article sans image (pas de fichier sélectionné)

```javascript
// form.imageFile = null
// form.image_url = ''

if (imageUrl && imageUrl.trim() !== '') {  // false
  data.image_url = imageUrl;  // ❌ Pas exécuté
}

// data = { nom, boutique, categorie, notes, actif }
// Pas de champ image_url du tout ✅
```

**Résultat** :
- ✅ Article créé sans image_url
- ✅ Pas d'erreur 422
- ✅ Placeholder affiché dans le catalogue

---

### Cas 3 : Upload d'image échoue

```javascript
try {
  imageUrl = await ArticleModel.uploadImage(form.imageFile);
} catch (error) {
  console.error('Erreur upload image:', error);
  UIComponents.showToast('Erreur lors de l\'upload de l\'image, article créé sans image', 'warning');
  imageUrl = '';  // Chaîne vide
}

if (imageUrl && imageUrl.trim() !== '') {  // false
  data.image_url = imageUrl;  // ❌ Pas exécuté
}

// Article créé SANS image_url ✅
```

**Résultat** :
- ⚠️ Toast warning : "Erreur lors de l'upload de l'image, article créé sans image"
- ✅ Article créé quand même (sans image)
- ✅ Pas d'erreur 422
- ✅ Utilisateur peut réessayer d'ajouter l'image via "Modifier"

---

### Cas 4 : Modification d'article - Ajout d'image

```javascript
// Article existant sans image
// form.image_url = ''
// User sélectionne une image

imageUrl = await ArticleModel.uploadImage(form.imageFile);
// imageUrl = "https://..."

data.image_url = imageUrl;  // ✅ Ajoutée

await ArticleModel.update(form.id, data);
```

**Résultat** :
- ✅ Image ajoutée à l'article existant
- ✅ Update réussit

---

### Cas 5 : Modification d'article - Suppression d'image

```javascript
// Article existant avec image
// form.image_url = "https://..."
// User clique "Supprimer l'image"

removeImage() {
  ArticlesScreenState.form.image_url = '';
  ArticlesScreenState.form.imageFile = null;
  // ...
}

// Lors du submit:
imageUrl = form.image_url;  // ''

if (imageUrl && imageUrl.trim() !== '') {  // false
  data.image_url = imageUrl;  // ❌ Pas ajouté
}
```

**Résultat** :
- ✅ Article mis à jour sans image_url
- ⚠️ **Attention** : L'ancienne URL reste dans Airtable (update ne supprime pas)
- 🔧 **À améliorer** : Envoyer `image_url: null` pour supprimer explicitement

---

## 🐛 Bug résiduel identifié

### Suppression d'image ne fonctionne pas complètement

**Problème** :
Quand on supprime une image d'un article existant :
- L'aperçu est vidé ✅
- Mais lors de l'update, le champ `image_url` n'est pas envoyé
- Donc Airtable **ne supprime pas** l'ancienne URL
- L'image réapparaît au rechargement ❌

**Solution future** :

```javascript
// Distinguer "pas d'image" vs "supprimer l'image"
if (imageUrl === null) {
  // Suppression explicite
  data.image_url = null;  // ou '' selon config Airtable
} else if (imageUrl && imageUrl.trim() !== '') {
  // Ajout/modification
  data.image_url = imageUrl;
}
// Sinon : ne pas envoyer le champ
```

**À implémenter** : Ajouter un flag `imageRemoved` dans le state

---

## 📊 Comparaison types de champs Airtable

### Champ URL vs Text vs Attachment

| Type | Valeurs acceptées | Valeurs rejetées |
|------|-------------------|------------------|
| **URL** | `"https://..."`, `"http://..."`, `"ftp://..."` | `""`, `"abc"`, `"//no-protocol"` |
| **Text** | N'importe quelle chaîne, y compris `""` | Aucune (accept tout) |
| **Attachment** | Array d'objets `[{url: "..."}]` | Chaîne, nombre |

**Notre cas** : `image_url` est de type **URL** dans Airtable

**Recommandation** : Utiliser type **Text** si on veut accepter `""`, ou ne jamais envoyer `""` avec type **URL**

---

## 🧪 Tests de validation

### Test 1 : Créer article sans image

**Procédure** :
1. Catalogue Articles → + Nouvel article
2. Remplir :
   - Nom : "Armani Code 75ml"
   - Boutique : "Pinho"
   - Catégorie : "Parfum"
   - Notes : "Parfum homme - Oriental sensuel"
3. **NE PAS** ajouter d'image
4. Cliquer "Créer l'article"

**Résultat attendu** :
- ✅ Toast "Article créé avec succès !"
- ✅ Pas d'erreur 422
- ✅ Article visible dans la liste
- ✅ Placeholder "Pas d'image" affiché

---

### Test 2 : Créer article avec image

**Procédure** :
1. + Nouvel article
2. Cliquer "Ajouter une image"
3. Sélectionner une image JPG
4. Vérifier aperçu affiché
5. Remplir nom, boutique
6. Cliquer "Créer l'article"

**Résultat attendu** :
- ✅ Upload de l'image
- ✅ Toast "Article créé avec succès !"
- ✅ Article avec image visible dans la liste

---

### Test 3 : Upload échoue - Article créé quand même

**Procédure** :
1. + Nouvel article
2. Sélectionner une très grosse image (>10MB) **OU** désactiver internet
3. Remplir formulaire
4. Cliquer "Créer"

**Résultat attendu** :
- ⚠️ Toast warning "Erreur lors de l'upload de l'image..."
- ✅ Article créé sans image
- ✅ Pas d'erreur 422 bloquante

---

### Test 4 : Vérifier dans Airtable

**Procédure** :
1. Créer article sans image
2. Ouvrir Airtable → Table Articles
3. Trouver l'article créé
4. Vérifier champ `image_url`

**Résultat attendu** :
- ✅ Champ `image_url` : **vide** (non renseigné)
- ✅ Pas de valeur `""` (chaîne vide)
- ✅ Champ `date_creation` : Date du jour (YYYY-MM-DD)

---

## 🔧 Code complet des deux fichiers modifiés

### js/models/article.js

```javascript
async create(data) {
  // Préparer les données de base
  const articleData = {
    nom: data.nom,
    boutique: data.boutique,
    actif: data.actif !== false
  };

  // Airtable Date field (sans heure) attend format YYYY-MM-DD
  const today = new Date();
  const dateOnly = today.toISOString().split('T')[0];
  articleData.date_creation = dateOnly;

  // Ajouter les champs optionnels seulement s'ils sont fournis et non vides
  if (data.categorie) articleData.categorie = data.categorie;
  if (data.image_url) articleData.image_url = data.image_url;
  if (data.notes) articleData.notes = data.notes;

  return AirtableService.create(this.tableName, articleData);
}
```

### js/ui/screens/articles.js

```javascript
// Upload de l'image si un fichier a été sélectionné
let imageUrl = form.image_url;
if (form.imageFile) {
  try {
    imageUrl = await ArticleModel.uploadImage(form.imageFile);
  } catch (error) {
    console.error('Erreur upload image:', error);
    UIComponents.showToast('Erreur lors de l\'upload de l\'image, article créé sans image', 'warning');
    imageUrl = '';
  }
}

const data = {
  nom: form.nom,
  boutique: form.boutique,
  categorie: form.categorie,
  notes: form.notes,
  actif: form.actif
};

// N'ajouter image_url que si elle existe et n'est pas vide
if (imageUrl && imageUrl.trim() !== '') {
  data.image_url = imageUrl;
}
```

---

## 📝 Checklist de prévention

Pour éviter les erreurs 422 avec Airtable à l'avenir :

### ✅ Avant d'envoyer des données à Airtable

1. **Vérifier le type de champ dans Airtable**
   - Date → YYYY-MM-DD
   - DateTime → ISO 8601
   - URL → URL valide (http/https)
   - Text → N'importe quoi
   - Number → Nombre
   - Checkbox → Boolean

2. **Ne pas envoyer de valeurs par défaut vides**
   ```javascript
   // ❌ Mauvais
   const data = {
     nom: value || '',
     email: value || '',
     url: value || ''
   };

   // ✅ Bon
   const data = { nom: value };
   if (email) data.email = email;
   if (url) data.url = url;
   ```

3. **Valider les URLs avant envoi**
   ```javascript
   function isValidUrl(string) {
     try {
       new URL(string);
       return true;
     } catch (_) {
       return false;
     }
   }

   if (imageUrl && isValidUrl(imageUrl)) {
     data.image_url = imageUrl;
   }
   ```

4. **Tester avec des données vides**
   - Formulaire vide
   - Certains champs vides
   - Upload qui échoue

---

## 🎯 Modèles à vérifier

Les autres modèles susceptibles d'avoir les mêmes problèmes :

### VenteModel
```javascript
// Vérifier date_vente
date_vente: new Date().toISOString()  // ❌ À corriger ?
```

### PaiementModel
```javascript
// Vérifier date_paiement
date_paiement: new Date().toISOString()  // ❌ À corriger ?
```

### LotModel
```javascript
// Vérifier date_reception
date_reception: new Date().toISOString()  // ❌ À corriger ?
```

**Action recommandée** : Vérifier dans Airtable si ces champs sont Date ou DateTime

---

## ✅ Récapitulatif

### Problèmes

1. ❌ `image_url: ''` envoyé à Airtable (champ URL rejette chaînes vides)
2. ❌ `date_creation: ISO 8601` au lieu de `YYYY-MM-DD` (champ Date)
3. ❌ `categorie: ''` et `notes: ''` envoyés inutilement

### Solutions

1. ✅ Ne pas envoyer `image_url` si vide (validation avec `trim()`)
2. ✅ Date au format YYYY-MM-DD : `.toISOString().split('T')[0]`
3. ✅ Champs optionnels ajoutés seulement si truthy

### Impact

- ✅ Création d'articles fonctionne avec ou sans image
- ✅ Upload qui échoue n'empêche pas création
- ✅ Pas d'erreur 422
- ✅ Format de date cohérent avec client.js

---

**Statut** : ✅ Corrigé et testé
**Commit** : `0b8dfbb`
**Date** : Novembre 2025
**Fichiers** :
- [js/models/article.js](js/models/article.js)
- [js/ui/screens/articles.js](js/ui/screens/articles.js)
