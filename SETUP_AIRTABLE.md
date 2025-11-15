# 🎯 Setup Airtable - Guide ultra-rapide

## Étape 1 : Créer la base

1. Aller sur [airtable.com](https://airtable.com)
2. Se connecter (ou créer un compte gratuit)
3. Cliquer sur **"Create a base"** → **"Start from scratch"**
4. Nommer la base : **AndyShop**

## Étape 2 : Créer les tables (méthode rapide)

### Table 1 : Boutiques

1. Renommer "Table 1" → **Boutiques**
2. Créer les champs (cliquer sur **+** en haut à droite) :

| Nom du champ | Type | Options |
|--------------|------|---------|
| nom | Single line text | - |
| type | Single select | Options : Parfums, Chaussures, Bijoux, Autre |
| logo_url | URL | - |
| couleur_principale | Single line text | - |
| couleur_secondaire | Single line text | - |
| texte_legal | Long text | - |
| actif | Checkbox | - |
| date_creation | Date | Format : Local, Include time |

3. **Importer les données** :
   - Cliquer sur **"..."** (en haut) → **"Import data"** → **"CSV file"**
   - Sélectionner `/data/csv/01_Boutiques.csv`
   - Mapper les colonnes → **Import**

### Tables 2-12 : Même processus

Pour chaque table suivante :
1. Cliquer sur **"Add or import"** → **"Create empty table"**
2. Nommer la table
3. Créer les champs selon [AIRTABLE_SCHEMA.md](AIRTABLE_SCHEMA.md)
4. Importer le CSV correspondant

**Ordre à respecter** :
- ✅ Boutiques (déjà fait)
- Fournisseurs
- Articles
- Clients
- Lots
- Lignes_Lot
- Ventes
- Lignes_Vente
- Paiements
- Dettes
- Allocations_Paiement
- Relances

---

## Étape 3 : Obtenir les identifiants

### 3.1 - Personal Access Token

1. Aller sur [https://airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Cliquer sur **"Create new token"**
3. Nom : `AndyShop Token`
4. **Scopes** (permissions) :
   - Cocher **data.records:read**
   - Cocher **data.records:write**
5. **Access** :
   - Sélectionner votre base **AndyShop**
6. Cliquer **"Create token"**
7. **COPIER LE TOKEN** (commence par `pat...`)

### 3.2 - Base ID

1. Ouvrir votre base AndyShop
2. Dans l'URL du navigateur, copier l'ID entre `airtable.com/` et `/...`

   Exemple :
   ```
   https://airtable.com/appXXXXXXXXXXXX/tblYYYYYYYYYYYY/...
                          ^^^^^^^^^^^^^^^^
                          Copier cette partie
   ```

---

## Étape 4 : Configurer l'application

Ouvrir `/Volumes/DATA/DEVS/AndyShop/js/config.js` et remplacer :

```javascript
window.AppConfig = {
  airtable: {
    apiKey: 'COLLER_VOTRE_TOKEN_ICI',  // Ex: patAbC123XyZ...
    baseId: 'COLLER_VOTRE_BASE_ID',    // Ex: appXXXXXXXXXXXX
    tables: {
      // Ne pas toucher, déjà configuré
      boutiques: 'Boutiques',
      // ...
    }
  },
  // ... reste identique
};
```

---

## Étape 5 : Tester !

```bash
cd /Volumes/DATA/DEVS/AndyShop
python3 -m http.server 8000
```

Ouvrir : http://localhost:8000

**Vous devriez voir** :
- Dashboard avec les stats (CA, dettes, etc.)
- Liste des clients
- Stocks des articles
- Toutes les fonctionnalités opérationnelles !

---

## ⚡ Méthode ultra-rapide (import en bloc)

Si vous êtes à l'aise avec Airtable :

1. Créer la base AndyShop
2. Utiliser l'extension **"CSV Import"** d'Airtable
3. Importer les 12 CSV en une fois
4. Configurer manuellement les relations (Link to another record)

**Temps estimé** : 10 minutes au lieu de 20

---

## 🐛 Problèmes courants

### "Unauthorized" ou 401
→ Vérifier le token Airtable (copier-coller sans espace)

### "Base not found"
→ Vérifier le Base ID dans l'URL

### Données ne s'affichent pas
→ Ouvrir la console (F12) et vérifier les erreurs
→ Vérifier que les noms de tables correspondent exactement

### Relations cassées
→ Les créer manuellement dans Airtable après import

---

**Prêt à tester !** 🚀
