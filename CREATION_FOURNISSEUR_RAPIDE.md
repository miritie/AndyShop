# ✅ Création rapide de fournisseur implémentée

## Fonctionnalité ajoutée

Un bouton **"+ Nouveau"** a été ajouté dans l'étape 1 du wizard de création de lot, à côté du champ fournisseur.

## Fonctionnement

### 1. Interface utilisateur

**Localisation** : [lots.js:196-209](js/ui/screens/lots.js#L196-L209)

Le champ fournisseur utilise maintenant le composant `.input-with-button` :
- Input text avec autocomplétion (datalist) des fournisseurs existants
- Bouton "+ Nouveau" pour créer un fournisseur à la volée

### 2. Workflow de création

**Étapes** :
1. Cliquez sur "+ Nouveau" dans l'étape 1 du wizard de lot
2. Un modal s'ouvre avec le formulaire de création de fournisseur
3. Remplissez les champs :
   - **Nom du fournisseur** * (obligatoire)
   - Pays (Local / Extérieur)
   - Téléphone
   - Email
   - Type de produits
   - Notes
4. Cliquez sur "Créer et utiliser"
5. Le fournisseur est créé dans Airtable
6. Le fournisseur est automatiquement sélectionné dans le champ
7. Continuez la création du lot normalement

### 3. Code implémenté

**Modal de création** : [lots.js:634-671](js/ui/screens/lots.js#L634-L671)
```javascript
showCreateFournisseurModal() {
  // Affiche un modal avec tous les champs du fournisseur
  // Formulaire simplifié et intégré au workflow
}
```

**Confirmation et création** : [lots.js:676-719](js/ui/screens/lots.js#L676-L719)
```javascript
async confirmCreateFournisseur() {
  // Validation
  // Création via FournisseurModel.create()
  // Ajout à la liste locale
  // Sélection automatique
  // Rafraîchissement de l'affichage
}
```

## Avantages

✅ **Flux continu** : Plus besoin de quitter le wizard de lot
✅ **Gain de temps** : Création en 30 secondes au lieu de 2-3 minutes
✅ **Meilleure UX** : Tout se passe dans le même contexte
✅ **Cohérence** : Même pattern que la création rapide d'article

## Modèle de données

Le fournisseur créé contient :
- `nom` (obligatoire)
- `pays` (Local par défaut)
- `telephone`
- `email`
- `type_produits`
- `notes`
- `date_creation` (auto)

## Test

Pour tester :
1. Allez dans **Menu Plus → Lots**
2. Cliquez sur **+ Nouveau lot**
3. Dans l'étape 1, cliquez sur **+ Nouveau** à côté du champ Fournisseur
4. Créez un nouveau fournisseur
5. Vérifiez qu'il est automatiquement sélectionné
6. Terminez la création du lot

## Fichiers modifiés

- `js/ui/screens/lots.js` : Ajout du bouton et des fonctions de création

---

**Version** : 1.1.1
**Date** : Novembre 2025
