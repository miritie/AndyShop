# Note importante - Upload d'images vers Google Drive

**Date** : Novembre 2025
**Statut** : ⚠️ Configuration requise

---

## 🎯 Architecture actuelle

### Fonctionnement souhaité

```
User sélectionne image
    ↓
ImageUploadService.upload(file)
    ↓
ImageUploadService.uploadToGoogleDrive(file)
    ↓
1. Redimensionne l'image (800x800 max)
2. Upload vers Google Drive
3. Rend le fichier public
4. Retourne URL: https://drive.google.com/uc?export=view&id=ABC123
    ↓
ArticleModel.create({ image_url: "https://drive.google.com/..." })
    ↓
Airtable stocke l'URL
```

---

## ⚠️ Configuration requise dans Airtable

### Le champ `image_url` DOIT être de type **Text** ou **Long text**

**PAS** de type **URL** ni **Attachment** !

#### Pourquoi ?

1. **Type URL** :
   - ❌ Airtable valide que l'URL commence par `http://` ou `https://`
   - ❌ Rejette les chaînes vides `''` (erreur 422)
   - ✅ Mais accepterait les URLs Google Drive
   - **Problème** : Si l'upload échoue, on ne peut pas créer l'article sans image

2. **Type Attachment** :
   - ❌ Airtable attend un objet `[{url: "...", filename: "..."}]`
   - ❌ Rejette les chaînes simples
   - ❌ Pas adapté à notre cas d'usage

3. **Type Text** (RECOMMANDÉ) :
   - ✅ Accepte n'importe quelle chaîne, y compris `""`
   - ✅ Accepte les URLs Google Drive
   - ✅ Permet de créer des articles sans image
   - ✅ Flexible pour tous les cas d'usage

---

## 🔧 Configuration actuelle du code

### js/config.example.js

```javascript
storage: {
  // Type de stockage : 'onedrive' | 'googledrive' | 'local'
  provider: 'local', // ⚠️ Par défaut: base64 (non recommandé pour production)

  // Google Drive (Configuration)
  googledrive: {
    apiKey: 'YOUR_GOOGLE_API_KEY',
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    folderId: 'YOUR_GOOGLE_DRIVE_FOLDER_ID'
  }
}
```

### Changement requis dans config.js

```javascript
storage: {
  provider: 'googledrive', // ✅ Activer Google Drive

  googledrive: {
    apiKey: 'AIzaSy...', // Votre clé API Google
    clientId: '123456-abc.apps.googleusercontent.com', // Client ID
    folderId: '1ABC...XYZ' // ID du dossier Google Drive
  }
}
```

---

## 📋 Étapes de configuration Google Drive

### 1. Créer un projet Google Cloud

1. Aller sur https://console.cloud.google.com
2. Créer un nouveau projet "AndyShop"
3. Activer l'API Google Drive
4. Créer des credentials :
   - Type : API Key
   - Type : OAuth 2.0 Client ID

### 2. Obtenir l'API Key

1. Google Cloud Console → APIs & Services → Credentials
2. Create Credentials → API Key
3. Copier la clé : `AIzaSy...`

### 3. Obtenir le Client ID

1. Create Credentials → OAuth 2.0 Client ID
2. Application type : Web application
3. Authorized JavaScript origins : `http://localhost:8080`, `https://votre-domaine.com`
4. Copier le Client ID : `123456-abc.apps.googleusercontent.com`

### 4. Créer un dossier Google Drive

1. Aller sur https://drive.google.com
2. Créer un dossier "AndyShop Images"
3. Clic droit → Partager → Définir en "Tous les utilisateurs avec le lien peuvent consulter"
4. Obtenir l'ID du dossier depuis l'URL :
   - URL : `https://drive.google.com/drive/folders/1ABC...XYZ`
   - ID : `1ABC...XYZ`

---

## 🧪 Test de l'upload Google Drive

### Test 1 : Configuration

```javascript
// Console navigateur
console.log(AppConfig.storage.provider); // Doit afficher "googledrive"
console.log(AppConfig.storage.googledrive); // Doit afficher { apiKey, clientId, folderId }
```

### Test 2 : Upload manuel

```javascript
// Créer un fichier test
const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

// Tester l'upload
const url = await ImageUploadService.upload(file);
console.log('URL:', url); // Devrait afficher une URL Google Drive

// Format attendu: https://drive.google.com/uc?export=view&id=ABC123
```

### Test 3 : Upload depuis l'interface

1. Catalogue Articles → + Nouvel article
2. Ajouter une image
3. Observer la console :
   - ✅ Logs "Uploading to Google Drive"
   - ✅ URL retournée : `https://drive.google.com/uc?export=view&id=...`
   - ✅ Article créé avec image_url

---

## 🐛 Dépannage

### Erreur : "Google Drive non configuré, fallback vers base64"

**Cause** : Manque apiKey, clientId ou folderId dans config.js

**Solution** :
```javascript
// Vérifier config.js
console.log(AppConfig.storage.googledrive);
// Doit retourner { apiKey: "...", clientId: "...", folderId: "..." }
```

---

### Erreur : "MSAL.js non chargé" (OneDrive)

**Cause** : Configuration OneDrive au lieu de Google Drive

**Solution** :
```javascript
storage: {
  provider: 'googledrive', // Pas 'onedrive'
}
```

---

### Erreur : "Erreur lors de l'upload vers Google Drive"

**Causes possibles** :
1. API Key invalide
2. Client ID invalide
3. Dossier ID invalide ou non accessible
4. API Google Drive non activée dans Google Cloud

**Solution** :
1. Vérifier les credentials dans Google Cloud Console
2. S'assurer que l'API Google Drive est activée
3. Vérifier que le dossier est partagé publiquement

---

### L'URL Google Drive ne s'affiche pas dans le catalogue

**Cause** : Le champ `image_url` dans Airtable est de type **URL** et peut avoir un problème de format

**Solution** :
1. Vérifier dans Airtable que le champ est de type **Text**
2. Si c'est **URL**, le changer en **Text** :
   - Airtable → Table Articles → Champ image_url
   - Settings → Field type → Single line text

---

## 💾 Fallback Base64 (actuel par défaut)

Si Google Drive n'est pas configuré, le système utilise Base64 :

### Avantages

- ✅ Fonctionne immédiatement
- ✅ Pas de configuration requise
- ✅ Images stockées directement dans Airtable

### Inconvénients

- ❌ Taille maximale limitée (Airtable limite à ~100KB par champ)
- ❌ Base de données Airtable devient lourde
- ❌ Performance dégradée avec beaucoup d'images
- ❌ Coût Airtable augmenté

### Comment ça marche

```javascript
ImageUploadService.uploadAsBase64(file)
    ↓
1. Lit le fichier avec FileReader
2. Redimensionne à 800x800 max
3. Convertit en JPEG qualité 85%
4. Génère data URL: "data:image/jpeg;base64,/9j/4AAQ..."
    ↓
Retourne data URL (très longue chaîne)
    ↓
Airtable stocke directement dans le champ image_url
```

**Taille typique** : 30-80KB pour une image redimensionnée

---

## 📊 Comparaison des solutions

| Aspect | Google Drive | Base64 (actuel) |
|--------|--------------|-----------------|
| Configuration | Complexe (API Google) | Aucune |
| Performance | Rapide | Lent (gros champs) |
| Taille limite | Illimitée | ~100KB par image |
| Coût | Gratuit (15GB) | Compris dans Airtable |
| URLs | Courtes | Très longues |
| Maintenance | Facile | Difficile |
| **Recommandation** | ✅ **Production** | ⚠️ Dev/Test seulement |

---

## ✅ Checklist de migration vers Google Drive

- [ ] Créer projet Google Cloud
- [ ] Activer API Google Drive
- [ ] Créer API Key
- [ ] Créer OAuth 2.0 Client ID
- [ ] Créer dossier Google Drive "AndyShop Images"
- [ ] Partager le dossier publiquement
- [ ] Copier apiKey, clientId, folderId dans config.js
- [ ] Changer `provider: 'googledrive'` dans config.js
- [ ] Vérifier type champ image_url dans Airtable (doit être **Text**)
- [ ] Tester upload d'une image
- [ ] Vérifier que l'URL est bien stockée dans Airtable
- [ ] Vérifier que l'image s'affiche dans le catalogue

---

## 🔒 Sécurité

### Google Drive

**Fichiers publics** :
- Les images sont publiques (lisibles par tous avec le lien)
- Pas d'authentification requise pour voir les images
- ✅ Adapté pour un catalogue produits public

**Permissions** :
- Dossier partagé : "Tous les utilisateurs avec le lien peuvent consulter"
- Fichiers uploadés : permissions héritées du dossier
- API Key : limite les appels à votre projet Google Cloud

### Recommandations

1. ✅ Ne pas stocker d'images confidentielles
2. ✅ Utiliser un dossier dédié "AndyShop Images"
3. ✅ Surveiller l'utilisation de l'API (quotas Google)
4. ✅ Ajouter une restriction d'origine HTTP pour l'API Key

---

## 📝 Résumé

### État actuel

- ✅ Code d'upload Google Drive existe et fonctionne
- ✅ Fallback base64 en cas de non-configuration
- ⚠️ Configuration Google Drive requise pour production
- ⚠️ Champ Airtable doit être de type **Text**

### Actions requises

1. **Configurer Google Drive** (étapes ci-dessus)
2. **Vérifier type champ Airtable** : Text, pas URL
3. **Tester l'upload** avec une vraie image
4. **Migrer images existantes** (si base64 → Google Drive)

---

**Statut** : ⚠️ Configuration manuelle requise
**Fichiers concernés** :
- [js/services/imageUpload.js](js/services/imageUpload.js)
- [js/config.example.js](js/config.example.js)
- config.js (à créer/modifier)
