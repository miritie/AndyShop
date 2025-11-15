# Test - Fonctionnalité "Nouveau Client"

## Écran 1: Clients (Plus → Clients)

### Étapes de test:
1. Cliquer sur **"Plus"** (bottom nav)
2. Cliquer sur **"Clients"** dans le menu
3. Cliquer sur **"+ Nouveau client"**
4. Remplir le formulaire:
   - Nom complet: "Jean Kouadio" ✅ 
   - Téléphone: "+225 0749189195" ✅
   - Email: "jean@example.com" (optionnel)
   - Adresse: "Cocody, Angré" (optionnel)
   - Type: "Collègue" ✅
   - Notes: "Client régulier" (optionnel)
5. Cliquer sur **"Créer"**

### Résultats attendus:
- ✅ Toast "Création du client..."
- ✅ Appel API Airtable réussi
- ✅ Toast "Client ajouté avec succès !"
- ✅ Modale fermée automatiquement
- ✅ Liste clients rechargée avec le nouveau client
- ✅ Nouveau client visible dans la liste

### Cas d'erreur à tester:
1. **Champs vides:**
   - Ne rien remplir → "Le nom et le téléphone sont obligatoires"
   
2. **Téléphone invalide:**
   - Nom: "Test", Téléphone: "123" → "Numéro de téléphone invalide"
   
3. **Doublon téléphone:**
   - Créer avec même numéro qu'un client existant → "Un client avec ce numéro existe déjà"

---

## Écran 2: Vente (Nouvelle Vente → Étape 1)

### Étapes de test:
1. Cliquer sur **"Vente"** (bottom nav)
2. Dans le champ de recherche, taper "Maxence"
3. Si aucun résultat → Cliquer **"+ Créer Maxence"** dans les résultats
   OU cliquer sur **"+ Créer un nouveau client"**
4. Le formulaire s'ouvre avec:
   - Nom: "Maxence" (pré-rempli si recherche était un nom)
   - OU Téléphone: "0749189195" (pré-rempli si recherche était un numéro)
5. Compléter les champs manquants
6. Cliquer sur **"Créer"**

### Résultats attendus:
- ✅ Toast "Création du client..."
- ✅ Appel API Airtable réussi
- ✅ Toast "Client ajouté avec succès !"
- ✅ Modale fermée automatiquement
- ✅ Client sélectionné automatiquement dans l'étape 1
- ✅ Bouton "Continuer" activé (car client + boutique sélectionnés)
- ✅ Peut continuer vers l'étape 2 (Articles)

### Cas d'erreur à tester:
1. **Champs vides:**
   - Ne rien remplir → "Veuillez remplir tous les champs obligatoires"
   
2. **Téléphone invalide:**
   - Nom: "Test", Téléphone: "123" → "Numéro de téléphone invalide"
   
3. **Doublon téléphone:**
   - Créer avec même numéro → "Un client avec ce numéro existe déjà"

---

## Validations Communes

### Téléphone:
- ✅ Minimum 8 caractères (sans espaces)
- ✅ Maximum 15 caractères (sans espaces)
- ✅ Accepte: +, chiffres, espaces
- ✅ Exemples valides: "+225 07 49 18 91 95", "0749189195", "+33 1 42 96 89 00"
- ❌ Exemples invalides: "123", "abc", "12 34"

### Détection doublons:
- ✅ Recherche par numéro de téléphone exact
- ✅ Message clair: "Un client avec ce numéro existe déjà"
- ✅ Ne crée pas de doublon dans Airtable

---

## Checklist Finale

### Écran Clients:
- [ ] Formulaire s'ouvre correctement
- [ ] Tous les champs sont présents (6 champs)
- [ ] Validation fonctionne
- [ ] Création réussit avec données valides
- [ ] Liste se recharge après création
- [ ] Nouveau client apparaît

### Écran Vente:
- [ ] Formulaire s'ouvre correctement
- [ ] Pré-remplissage fonctionne (nom OU téléphone)
- [ ] Validation fonctionne
- [ ] Création réussit avec données valides
- [ ] Client sélectionné automatiquement après création
- [ ] Peut continuer vers étape 2

### Gestion erreurs:
- [ ] Champs vides → Message approprié
- [ ] Téléphone invalide → Message approprié
- [ ] Doublon → Message approprié
- [ ] Erreur réseau → Message d'erreur clair

---

## Débogage

Si un problème survient, vérifier dans la console (F12):

1. **Erreur 422:**
   - Vérifier que les champs vides ne sont PAS envoyés
   - Voir js/models/client.js lignes 38-51

2. **FournisseurModel not found:**
   - Vérifier que index.html charge js/models/fournisseur.js
   - Ligne 120 de index.html

3. **Client non ajouté à la liste:**
   - Vérifier que Router.refresh() est appelé
   - Voir js/ui/screens/clients.js ligne 154

4. **Client non sélectionné (Vente):**
   - Vérifier VenteWizardState.client = client
   - Voir js/ui/screens/vente.js ligne 727
