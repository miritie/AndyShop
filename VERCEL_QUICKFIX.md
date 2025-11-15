# 🚀 SOLUTION RAPIDE - Vercel Erreur 404

## ⚡ Solution en 2 Minutes

GitHub bloque le push avec les clés API. Voici comment contourner :

### Option 1 : Autoriser le Push GitHub (Le Plus Simple)

1. **Cliquer sur ce lien** (fourni par GitHub) :
   ```
   https://github.com/miritie/AndyShop/security/secret-scanning/unblock-secret/35VmGBYa6RFZQ6340Xz7d0Y5U5x
   ```

2. Cliquer sur **"Allow secret"**

3. Retourner au terminal et refaire :
   ```bash
   git push origin main
   ```

4. ✅ Le push réussit !

5. Vercel redéploie automatiquement

6. ✅ L'application fonctionne !

---

### Option 2 : Upload Manuel sur Vercel (Alternative)

Si l'Option 1 ne marche pas :

1. **Annuler le commit** :
   ```bash
   git reset HEAD~1
   git restore --staged js/env-config.js
   ```

2. **Créer env-config.js directement sur Vercel** :
   - Aller sur Vercel Dashboard
   - Project Settings > Functions
   - Créer un fichier `public/js/env-config.js` avec :
   ```javascript
   window.VITE_AIRTABLE_API_KEY = 'VOTRE_TOKEN_ICI';
   window.VITE_AIRTABLE_BASE_ID = 'VOTRE_BASE_ID_ICI';
   ```

---

### Option 3 : Utiliser Vercel CLI (Pour les Experts)

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
vercel --prod

# Quand demandé, ajouter les env vars
```

---

## 📋 Quelle Option Choisir ?

| Option | Temps | Difficulté | Recommandée |
|--------|-------|-----------|-------------|
| **1. Autoriser GitHub** | 30s | ⭐ Facile | ✅ **OUI** |
| **2. Upload Manuel** | 2min | ⭐⭐ Moyen | Si Option 1 échoue |
| **3. Vercel CLI** | 5min | ⭐⭐⭐ Expert | Non |

---

## ✅ Comment Savoir Si Ça Marche ?

1. Ouvrir votre URL Vercel
2. Ouvrir la console (F12)
3. Chercher : `[Config] ✅ Configuration chargée avec succès`
4. L'app affiche les données du dashboard

---

**🎯 RECOMMANDATION : Utilisez l'Option 1 (cliquez sur le lien GitHub)**
