# Configuration Table Fournisseurs - Airtable

## Structure de la Table

Créer une nouvelle table nommée **"Fournisseurs"** dans votre base Airtable avec les champs suivants:

| Nom du champ | Type | Options | Obligatoire | Notes |
|--------------|------|---------|-------------|-------|
| `nom` | Single line text | - | ✅ Oui | Nom du fournisseur/grossiste |
| `pays` | Single select | Local, Extérieur | ✅ Oui | Provenance |
| `telephone` | Phone number | - | Non | Format international |
| `email` | Email | - | Non | Contact email |
| `type_produits` | Multiple select | Parfums, Chaussures, Bijoux, Autre | Non | Types de produits fournis |
| `notes` | Long text | - | Non | Notes libres |
| `date_creation` | Created time | - | Auto | Date de création automatique |

## Configuration des Champs Single/Multiple Select

### Champ `pays` (Single select)
Options:
- Local
- Extérieur

### Champ `type_produits` (Multiple select)
Options:
- Parfums
- Chaussures
- Bijoux
- Autre

## Import des Données de Test

1. **Télécharger le fichier CSV** : `data/fournisseurs_test.csv`

2. **Dans Airtable:**
   - Ouvrir la table Fournisseurs
   - Cliquer sur le bouton "..." (trois points) en haut à droite
   - Sélectionner "Import data" → "CSV file"
   - Uploader le fichier `fournisseurs_test.csv`
   - Mapper les colonnes aux champs appropriés
   - Valider l'import

## Données de Test Incluses

Le fichier CSV contient 6 fournisseurs:

**Fournisseurs Extérieurs:**
1. **Parfums de Paris** (France) - Parfums de luxe
2. **Chaussures Milano** (Italie) - Chaussures haut de gamme
3. **Bijoux Dubai** (EAU) - Bijouterie or 18K

**Fournisseurs Locaux:**
4. **Grossiste Local CI** - Multi-produits (tout type)
5. **Beauty Supply Abidjan** - Parfums et beauté
6. **Shoes & More** - Chaussures sport et casual

## Vérification

Après l'import, vérifiez que:
- ✅ Les 6 fournisseurs sont bien importés
- ✅ Le champ `pays` contient "Local" ou "Extérieur"
- ✅ Le champ `type_produits` contient les bonnes catégories
- ✅ Les téléphones sont au format international
- ✅ La `date_creation` est automatiquement remplie

## Utilisation dans l'Application

Les fournisseurs seront utilisés dans:
- **Écran Lots** : Sélection du fournisseur lors de l'achat de stock
- **Formulaire Nouveau Lot** : Liste déroulante des fournisseurs
- **Statistiques** : Suivi des achats par fournisseur

## Ajout Manuel de Fournisseurs

Si vous préférez ajouter manuellement, utilisez ces exemples:

```
Nom: Parfums de Paris
Pays: Extérieur
Téléphone: +33 1 42 96 89 00
Email: contact@parfumsparis.fr
Type produits: Parfums
Notes: Fournisseur de parfums de luxe français
```

---

**Prochaine Étape:** Une fois la table créée, l'écran Lots fonctionnera correctement!
