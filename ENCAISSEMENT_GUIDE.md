# Guide - Fonctionnalité Encaissement

## Vue d'ensemble

La fonctionnalité d'encaissement permet d'enregistrer les paiements reçus des clients ayant des dettes.

## Fonctionnement

### 1. Accès à l'écran
- Cliquer sur **"Encaisser"** dans la navigation bottom
- L'écran affiche uniquement les clients avec des dettes (solde_du > 0)

### 2. Liste des clients
Chaque client affiché montre:
- Nom du client
- Téléphone
- **Montant dû** en rouge (montant total de la dette)

### 3. Enregistrer un paiement

**Étapes:**
1. Cliquer sur le client dans la liste
2. Le formulaire s'ouvre avec:
   - Client (pré-rempli, non modifiable)
   - Montant dû (affiché en grand, rouge)
   - **Montant reçu*** (saisir le montant encaissé)
   - **Mode de paiement*** (sélectionner dans la liste)
   - Lien preuve (optionnel - URL vers capture/photo)
   - Notes (optionnel)
3. Cliquer sur **"Enregistrer"**

### 4. Modes de paiement disponibles

Définis dans `Constants.ModesPaiement`:
- **Cash** - Espèces
- **Mobile Money** - Orange Money, MTN Mobile Money, Moov Money, Wave
- **Virement** - Virement bancaire
- **Autre** - Autre mode

### 5. Validations

**Montant reçu:**
- ✅ Doit être > 0
- ✅ Ne peut pas dépasser le montant dû
- ❌ Exemple invalide: Montant = 0 ou montant > dette

**Champs obligatoires:**
- Montant reçu
- Mode de paiement

**Champs optionnels:**
- Lien preuve (URL vers Google Drive, Dropbox, etc.)
- Notes

### 6. Résultat

Après enregistrement:
- ✅ Toast "Paiement enregistré avec succès !"
- ✅ Paiement créé dans Airtable
- ✅ Liste rechargée automatiquement
- ✅ Si dette soldée → client disparaît de la liste

## Structure de données Airtable

### Table Paiements

| Champ | Type | Description |
|-------|------|-------------|
| `reference` | Formula | PAY-2025-XXX (auto-généré) |
| `client` | Link | Lien vers le client |
| `date_paiement` | Date/Time | Date d'encaissement |
| `montant` | Currency (XOF) | Montant encaissé |
| `mode_paiement` | Single Select | Cash, Mobile Money, Virement, Autre |
| `preuve_url` | URL | Lien vers justificatif |
| `notes` | Long Text | Notes libres |

## Calcul de la dette

Le **solde_du** affiché pour chaque client est calculé dans la table Clients:
```
solde_du = total_achats - total_paye
```

Où:
- `total_achats` = Somme de toutes les ventes du client
- `total_paye` = Somme de tous les paiements du client

### Comportement attendu

**Exemple 1: Paiement partiel**
- Dette initiale: 100,000 XOF
- Paiement encaissé: 50,000 XOF
- Nouvelle dette: 50,000 XOF
- Résultat: Client reste dans la liste avec 50,000 XOF

**Exemple 2: Paiement total**
- Dette initiale: 100,000 XOF
- Paiement encaissé: 100,000 XOF
- Nouvelle dette: 0 XOF
- Résultat: Client disparaît de la liste d'encaissement

**Exemple 3: Sur-paiement (non autorisé)**
- Dette initiale: 100,000 XOF
- Tentative: 150,000 XOF
- Résultat: ❌ Erreur "Le montant ne peut pas dépasser 100,000 XOF"

## Upload de preuve

### Options recommandées:

**1. Google Drive (Recommandé)**
```
1. Upload la capture/photo sur Google Drive
2. Partager le fichier → "Accès: Toute personne disposant du lien"
3. Copier le lien
4. Coller dans le champ "Lien preuve"
```

**2. Autres options:**
- Dropbox
- OneDrive
- WeTransfer
- Tout service cloud avec partage par lien

### Format du lien:
- ✅ Bon: `https://drive.google.com/file/d/XXXX/view?usp=sharing`
- ✅ Bon: `https://www.dropbox.com/s/XXXX/capture.jpg`
- ❌ Mauvais: Lien non valide ou fichier privé

## Cas d'usage

### Scénario 1: Paiement Mobile Money
```
Client: Maxence Koné
Dette: 150,000 XOF
Paiement reçu: 75,000 XOF
Mode: Mobile Money
Preuve: Screenshot Wave reçu sur Drive
Notes: "Paiement partiel - reste 75,000 XOF à venir le 15/12"
```

### Scénario 2: Paiement Cash complet
```
Client: Marie Diabaté
Dette: 50,000 XOF
Paiement reçu: 50,000 XOF
Mode: Cash
Preuve: (vide)
Notes: "Dette soldée"
```

### Scénario 3: Virement bancaire
```
Client: Jean-Paul Adjoumani
Dette: 500,000 XOF
Paiement reçu: 500,000 XOF
Mode: Virement
Preuve: Lien vers relevé bancaire PDF
Notes: "Référence: VIR20250115-123456"
```

## Débogage

### Problème: Client n'apparaît pas dans la liste

**Causes possibles:**
1. Le client n'a pas de dette (solde_du = 0)
2. Erreur de calcul dans Airtable

**Solution:**
1. Vérifier dans Airtable → Clients → Champ `solde_du`
2. Vérifier que `total_achats` > `total_paye`

### Problème: Erreur 422 lors de l'enregistrement

**Causes possibles:**
1. Champs obligatoires manquants
2. Type de données incorrect

**Solution:**
1. Vérifier que `montant` est un nombre
2. Vérifier que `client` est un tableau `[clientId]`
3. Voir console (F12) pour détails

### Problème: Dette ne se met pas à jour

**Causes possibles:**
1. Rollup/Formula Airtable non synchronisé
2. Lien client incorrect

**Solution:**
1. Recharger Airtable (Ctrl+R)
2. Vérifier le lien `client` dans le paiement créé

---

**Fichiers concernés:**
- Écran: [js/ui/screens/paiement.js](js/ui/screens/paiement.js)
- Modèle: [js/models/paiement.js](js/models/paiement.js)
- Constantes: [js/utils/constants.js](js/utils/constants.js)
