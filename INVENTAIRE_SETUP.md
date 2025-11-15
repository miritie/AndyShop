# Configuration de la table Ajustements_Stock dans Airtable

## Nouvelle table à créer

Pour utiliser la fonctionnalité d'inventaire physique et d'ajustements de stock, vous devez créer une nouvelle table dans votre base Airtable **AndyShop**.

### TABLE : Ajustements_Stock

#### Champs requis :

1. **article** (Link to Articles)
   - Type : Link to another record
   - Table liée : Articles
   - Configuration : Permet de lier à un seul article

2. **type** (Single select)
   - Type : Single select
   - Options :
     - Inventaire
     - Perte
     - Casse
     - Vol
     - Retour
     - Autre

3. **quantite_avant** (Number)
   - Type : Number
   - Format : Integer
   - Description : Stock théorique avant ajustement

4. **quantite_apres** (Number)
   - Type : Number
   - Format : Integer
   - Description : Stock physique après ajustement

5. **difference** (Number)
   - Type : Number
   - Format : Integer
   - Description : Différence (quantite_apres - quantite_avant)

6. **date_ajustement** (Date)
   - Type : Date
   - Format : Date et heure (ISO)
   - Description : Date et heure de l'ajustement

7. **motif** (Single line text)
   - Type : Single line text
   - Description : Raison de l'ajustement

8. **notes** (Long text)
   - Type : Long text
   - Description : Notes complémentaires

9. **utilisateur** (Single line text)
   - Type : Single line text
   - Description : Nom de l'utilisateur ayant effectué l'ajustement

#### Champs calculés optionnels :

10. **article_nom** (Lookup)
    - Type : Lookup
    - Champ source : article → nom
    - Description : Nom de l'article (pour affichage)

## Fonctionnalités disponibles

Une fois la table créée, vous aurez accès à :

### 1. Inventaire physique complet

- Comptage article par article
- Comparaison automatique stock théorique vs stock physique
- Détection des écarts
- Enregistrement des ajustements pour traçabilité

**Accès** : Menu Plus → Inventaire → Nouvel inventaire

### 2. Ajustement rapide

- Correction rapide d'un seul article
- Choix du type d'ajustement (perte, casse, vol, etc.)
- Justification obligatoire

**Accès** : Menu Plus → Inventaire → Ajustement rapide

### 3. Historique des ajustements

- Vue de tous les ajustements passés
- Filtrage par type, date, article
- Traçabilité complète

**Accès** : Menu Plus → Inventaire → Historique

## Notes importantes

⚠️ **Important** : Cette table sert uniquement à l'**historique et la traçabilité** des écarts d'inventaire.

Le **stock réel** dans Airtable est calculé automatiquement via :
- Les **Lignes_Lot** (entrées de stock)
- Les **Lignes_Vente** (sorties de stock)

Les ajustements d'inventaire permettent de :
1. Identifier les écarts entre stock théorique et physique
2. Tracer les pertes, casses, vols
3. Auditer les inventaires passés
4. Analyser les problèmes de stock

## Migration

Si vous avez déjà des données en production, les ajustements d'inventaire fonctionneront immédiatement après la création de la table. Aucune migration de données existantes n'est requise.
