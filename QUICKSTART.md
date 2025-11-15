# 🚀 Démarrage Rapide - AndyShop

## En 5 étapes

### 1️⃣ Créer la base Airtable

1. Aller sur [airtable.com](https://airtable.com)
2. Créer une nouvelle base : **AndyShop**
3. Créer les 12 tables (voir structure complète dans [README.md](README.md#2-configuration-airtable))

**Tables minimum pour démarrer** :
- Boutiques
- Clients
- Articles
- Ventes

### 2️⃣ Obtenir les identifiants Airtable

1. **Personal Access Token** :
   - [https://airtable.com/create/tokens](https://airtable.com/create/tokens)
   - Créer un token avec `data.records:read` et `data.records:write`
   - Copier le token (ex: `patAbCd123...`)

2. **Base ID** :
   - Ouvrir votre base AndyShop
   - Dans l'URL, copier l'ID : `airtable.com/appXXXXXXXXXXXX/...`

### 3️⃣ Configurer l'application

Ouvrir `js/config.js` et remplacer :

```javascript
window.AppConfig = {
  airtable: {
    apiKey: 'patVOTRE_TOKEN_ICI',  // ⬅️ Coller votre token
    baseId: 'appVOTRE_BASE_ID',    // ⬅️ Coller votre Base ID
    tables: {
      // Les noms doivent correspondre exactement à vos tables Airtable
      boutiques: 'Boutiques',
      clients: 'Clients',
      articles: 'Articles',
      ventes: 'Ventes',
      // ... autres tables
    }
  },
  // ... reste de la config
};
```

### 4️⃣ Lancer l'application

**Option A** : Serveur Python (recommandé)

```bash
cd /chemin/vers/AndyShop
python -m http.server 8000
```

Ouvrir : [http://localhost:8000](http://localhost:8000)

**Option B** : Serveur Node.js

```bash
npx http-server -p 8000
```

**Option C** : Double-clic sur `index.html`

⚠️ Certaines fonctionnalités peuvent ne pas marcher (CORS, fetch API)

### 5️⃣ Ajouter des données de test

1. Dans Airtable, ajouter manuellement :
   - 1-2 boutiques (ex: Pinho, BelPaire)
   - 3-5 articles
   - 2-3 clients

2. Rafraîchir l'application → les données s'affichent !

---

## ✅ Checklist de vérification

- [ ] Base Airtable créée avec au moins 4 tables
- [ ] Token Airtable généré
- [ ] Base ID copié
- [ ] `js/config.js` configuré
- [ ] Serveur web lancé
- [ ] Application accessible sur `http://localhost:8000`
- [ ] Données de test ajoutées dans Airtable
- [ ] Écran d'accueil affiche les statistiques

---

## 🐛 Problèmes courants

### "Configuration manquante"
→ Vérifier que `js/config.js` existe et contient les bonnes clés

### "Fetch failed" ou erreurs réseau
→ Lancer l'app via un serveur web (pas `file://`)

### "Unauthorized" ou 401
→ Vérifier que le token Airtable est valide et a les bonnes permissions

### Données ne s'affichent pas
→ Ouvrir la console (F12) et vérifier les erreurs
→ Vérifier que les noms de tables dans `config.js` correspondent exactement à Airtable

### Erreur CORS
→ Vérifier que le token Airtable a les bonnes permissions
→ Utiliser un serveur web local

---

## 📱 Tester sur mobile

1. Trouver l'IP locale de votre ordinateur :
   ```bash
   # macOS/Linux
   ifconfig | grep inet

   # Windows
   ipconfig
   ```

2. Lancer le serveur avec l'IP locale :
   ```bash
   python -m http.server 8000
   ```

3. Sur le mobile, accéder à :
   ```
   http://192.168.X.X:8000
   ```
   (Remplacer par votre IP locale)

4. Ajouter à l'écran d'accueil (iOS/Android) pour un effet "app native"

---

## 🎯 Prochaines étapes

Une fois l'application lancée :

1. **Explorer les écrans** via la navigation bottom
2. **Créer une vente de test** (écran Vente)
3. **Encaisser un paiement** (écran Encaisser)
4. **Tester la génération de facture WhatsApp**
5. **Consulter les rapports** (Menu Plus → Rapports)

Pour aller plus loin :
- Implémenter les écrans PLACEHOLDER (voir `js/ui/screens/`)
- Ajouter OneDrive/Google Drive (voir `ARCHITECTURE.md`)
- Personnaliser le design (voir `css/variables.css`)

---

**Besoin d'aide ?** Consulter [README.md](README.md) ou [ARCHITECTURE.md](ARCHITECTURE.md)
