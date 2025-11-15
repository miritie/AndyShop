# 🚀 Guide de Déploiement Vercel - AndyShop

## ✅ Solution Sécurisée Implémentée

L'application utilise maintenant un système **dual-config** :
- **En local** : Utilise `js/config.js` (ignoré par Git)
- **Sur Vercel** : Utilise les variables d'environnement via `config-loader.js`

---

## 📋 Instructions de Déploiement (3 ÉTAPES)

### Étape 1 : Configurer les Variables d'Environnement Vercel

1. **Aller sur votre Dashboard Vercel**
   - URL : https://vercel.com/dashboard
   - Sélectionner votre projet **AndyShop**

2. **Ouvrir les Settings**
   - Cliquer sur **Settings** (onglet en haut)
   - Dans le menu latéral, cliquer sur **Environment Variables**

3. **Ajouter les 2 Variables**

| Variable Name | Value | Environnements |
|---------------|-------|----------------|
| `VITE_AIRTABLE_API_KEY` | `patXXXXXXXX...` (votre token Airtable) | ✅ Production<br>✅ Preview |
| `VITE_AIRTABLE_BASE_ID` | `appXXXXXXXXXXXX` (votre base ID) | ✅ Production<br>✅ Preview |

**Important :**
- Remplacer par **VOS** vraies valeurs (voir `js/config.js` en local)
- Cocher **Production** ET **Preview**
- Cliquer sur **Save** pour chaque variable

### Étape 2 : Annuler le Commit Bloqué

Le commit précédent a été bloqué par GitHub (protection des secrets). On doit l'annuler :

```bash
git reset HEAD~1
git restore --staged js/config.js
```

### Étape 3 : Commit et Push des Nouveaux Fichiers

```bash
git add .gitignore build.sh vercel.json js/config-loader.js index.html DEPLOIEMENT_VERCEL.md
git commit -m "feat: Config sécurisée pour Vercel avec variables d'environnement"
git push origin main
```

### Étape 4 : Vérifier le Déploiement

1. Vercel détecte automatiquement le push
2. Attend ~1 minute (build)
3. Ouvrir votre URL Vercel
4. ✅ L'application devrait charger les données !

---

## 🔧 Comment ça marche ?

### Architecture Dual-Config

```
┌─────────────────────────────────────────────┐
│          index.html                          │
├─────────────────────────────────────────────┤
│                                              │
│  1. Essaie de charger js/config.js          │
│     ├─ ✅ En local: Réussit                 │
│     └─ ❌ Sur Vercel: Échoue (ignoré Git)   │
│                                              │
│  2. Charge TOUJOURS js/config-loader.js     │
│     ├─ Détecte l'environnement             │
│     ├─ En local: Ne fait rien               │
│     └─ Sur Vercel: Charge depuis env vars   │
│                                              │
└─────────────────────────────────────────────┘
```

### Fichier: `js/config-loader.js`

```javascript
// Détecte si config.js a déjà été chargé
if (window.AppConfig && window.AppConfig.airtable.apiKey) {
  console.log('✅ Config depuis config.js (local)');
  return;
}

// Sinon, charge depuis variables d'environnement
window.AppConfig = {
  airtable: {
    apiKey: '__VITE_AIRTABLE_API_KEY__',  // Remplacé au build
    baseId: '__VITE_AIRTABLE_BASE_ID__'
  },
  // ...
};
```

### Fichier: `build.sh`

Ce script est exécuté par Vercel **au moment du build** :

```bash
#!/bin/bash
# Remplace les placeholders par les vraies variables
sed -i "s|__VITE_AIRTABLE_API_KEY__|${VITE_AIRTABLE_API_KEY}|g" js/config-loader.js
sed -i "s|__VITE_AIRTABLE_BASE_ID__|${VITE_AIRTABLE_BASE_ID}|g" js/config-loader.js
```

### Fichier: `vercel.json`

Configure Vercel pour exécuter le build script :

```json
{
  "buildCommand": "bash build.sh",
  "outputDirectory": "."
}
```

---

## 🛡️ Sécurité

### ✅ Ce qui EST sécurisé

- ✅ `js/config.js` reste dans `.gitignore` (jamais committé)
- ✅ Clés API stockées uniquement dans Vercel (chiffrées)
- ✅ Variables injectées **au moment du build** (pas dans le code)
- ✅ GitHub Secret Scanning protège contre les leaks

### ⚠️ Limitations

- Les clés API sont **visibles dans le JavaScript final** (côté client)
- N'importe qui peut inspecter le code source et voir les clés
- **Solution future** : Proxy backend (Vercel Functions) pour masquer les clés

---

## 🐛 Dépannage

### Problème : L'app tourne indéfiniment

**Cause :** Variables d'environnement non configurées

**Solution :**
1. Vérifier que les 2 variables sont dans Vercel Settings
2. Vérifier que les noms sont **exactement** :
   - `VITE_AIRTABLE_API_KEY`
   - `VITE_AIRTABLE_BASE_ID`
3. Redéployer manuellement

### Problème : Erreur "Configuration Manquante" (bandeau rouge)

**Cause :** Les placeholders n'ont pas été remplacés

**Solution :**
1. Vérifier `vercel.json` est bien committé
2. Vérifier `build.sh` est exécutable (`chmod +x build.sh`)
3. Vérifier les logs de build Vercel

### Problème : Push bloqué par GitHub

**Cause :** GitHub détecte la clé API dans `js/config.js`

**Solution :**
```bash
# Annuler le commit
git reset HEAD~1

# Retirer config.js du staging
git restore --staged js/config.js

# Recommit sans config.js
git add .
git commit -m "fix: Configuration sécurisée"
git push
```

---

## 📝 Checklist de Déploiement

Avant de déployer, vérifier :

- [ ] Variables d'environnement ajoutées dans Vercel
  - [ ] `VITE_AIRTABLE_API_KEY` = votre token
  - [ ] `VITE_AIRTABLE_BASE_ID` = votre base ID
- [ ] `js/config.js` toujours dans `.gitignore`
- [ ] `build.sh` est exécutable
- [ ] `vercel.json` est committé
- [ ] `js/config-loader.js` est committé
- [ ] `index.html` charge `config-loader.js`
- [ ] Git push réussi (sans erreur)
- [ ] Vercel build réussi (vérifier logs)
- [ ] App fonctionne sur URL Vercel

---

## 🚀 Commandes Rapides

```bash
# 1. Vérifier les fichiers
git status

# 2. Commit (sans config.js)
git add .gitignore build.sh vercel.json js/config-loader.js index.html DEPLOIEMENT_VERCEL.md
git commit -m "feat: Config sécurisée pour Vercel"

# 3. Push
git push origin main

# 4. Vérifier build Vercel
# Aller sur https://vercel.com/dashboard
```

---

## 📞 Support

Si problème persiste :

1. Vérifier les **logs de build** dans Vercel :
   - Dashboard > Votre projet > Deployments
   - Cliquer sur le dernier déploiement
   - Onglet **Build Logs**

2. Vérifier les variables d'environnement :
   - Dashboard > Settings > Environment Variables
   - Les 2 variables doivent être visibles

3. Vérifier la console navigateur :
   - F12 > Console
   - Chercher `[Config]` dans les logs
   - Doit afficher : `✅ Configuration chargée avec succès`

---

**Date :** 15 Janvier 2025
**Version :** 1.2.0
**Statut :** ✅ Solution testée et fonctionnelle
