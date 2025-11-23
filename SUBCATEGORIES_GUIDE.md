# Guide des Sous-Catégories pour Exercices

## Vue d'ensemble
Les sous-catégories permettent d'organiser les exercices de manière hiérarchique. Par exemple, vous pouvez avoir une catégorie "Communication" avec des sous-catégories comme "Verbal", "Non-verbal", "Écrit", etc.

## Structure de la Base de Données

### Changements appliqués
- La table `task_categories` possède maintenant une colonne `parent_category_id` qui permet de créer une hiérarchie.
- Un index a été créé pour optimiser les requêtes sur les sous-catégories.

### Migration Supabase
Un fichier `migrations_add_subcategories.sql` est disponible pour mettre à jour votre Supabase si la colonne n'existe pas encore.

**Étapes pour appliquer la migration** :
1. Ouvrez Supabase Console → SQL Editor
2. Collez le contenu de `migrations_add_subcategories.sql`
3. Cliquez "Run"

## Utilisation dans l'Admin

### Interface de Gestion des Catégories

Accédez à **Admin → Gestion des Catégories** pour voir la nouvelle UI :

#### Ajouter une catégorie principale
1. Cliquez sur le bouton **"Ajouter une Catégorie"** (vert)
2. Entrez le nom de la catégorie
3. Cliquez "Ajouter"

#### Ajouter une sous-catégorie
1. Cliquez sur le bouton **"Ajouter une Sous-Catégorie"** (gris)
2. Sélectionnez la catégorie parente dans le dropdown
3. Entrez le nom de la sous-catégorie
4. Cliquez "Ajouter"

#### Visualiser et gérer les sous-catégories
- Les catégories principales s'affichent en **gras** avec une **flèche déroulante** (▶)
- Cliquez sur la flèche pour développer/replier les sous-catégories
- Les sous-catégories s'affichent **indentées** avec un style bleu
- Vous pouvez éditer ou supprimer chaque sous-catégorie individuellement

### Actions disponibles

| Action | Catégorie | Sous-catégorie | Notes |
|--------|-----------|----------------|-------|
| Éditer | ✅ | ✅ | Cliquez le crayon bleu |
| Supprimer | ✅ | ✅ | Cliquez la corbeille rouge |
| Promouvoir | ❌ | ⏳ | Fonctionnalité future |
| Protéger | ⏳ | ⏳ | Prevent deletion of core categories |

## API & Fonctions (Côté Développeur)

### Fonctions dans `src/data/tasks.js`

```javascript
// Récupérer la hiérarchie complète (catégories + sous-catégories)
await fetchCategoriesHierarchy()
// Retourne : [{ id, name, parent_category_id, subcategories: [...] }, ...]

// Ajouter une sous-catégorie à une catégorie parente
await addSubcategory(parentCategoryId, subcategoryName)

// Changer la catégorie parente d'une sous-catégorie
await updateSubcategoryParent(subcategoryId, newParentId)

// Promouvoir une sous-catégorie en catégorie principale
await removeSubcategoryParent(categoryId)
// Define: Ajouter à `removeSubcategoryParent` usage documentation
```

### Contexte AdminContext

Ces fonctions sont exposées via `useAdmin()` :
- `addSubcategory(parentCategoryId, subcategoryName)`
- `updateSubcategoryParent(subcategoryId, newParentId)`
- `removeSubcategoryParent(categoryId)`
- `categoriesHierarchy` (état avec la hiérarchie complète)

## Exemple d'Utilisation

### Créer une structure type

1. **Catégories principales** :
   - Communication
   - Gestion d'objets
   - Autonomie
   - Compétences académiques

2. **Sous-catégories de "Communication"** :
   - Verbal
   - Non-verbal
   - Écrit
   - Écoute

3. **Sous-catégories de "Gestion d'objets"** :
   - Manipulation fine
   - Pincer/Saisir
   - Insérer/Retirer

## Notes Importantes

### Limites Actuelles
- Les sous-catégories ne peuvent pas avoir de sous-sous-catégories (un seul niveau d'imbrication)
- Vous ne pouvez pas actuellement assigner des exercices directement aux sous-catégories via l'UI simple (voir section Limitation Technique)

### Limitation Technique : Assignation aux Sous-Catégories
Les exercices sont actuellement assignés via `category_id` qui pointe vers un ID de catégorie. Deux approches :

**Option 1** (Recommandée) : Les sous-catégories sont purement pour l'organisation UI. Les exercices continuent à pointer vers les catégories principales.

**Option 2** (À implémenter) : Mettre à jour le formulaire de création/édition d'exercice pour permettre de sélectionner une sous-catégorie dans le dropdown. Cela nécessite un changement mineur dans `src/components/admin/AdminExerciseForm.jsx`.

## Prochaines Étapes

- [ ] Permettre l'assignation des exercices aux sous-catégories
- [ ] Ajouter un tri/réorganisation par drag-and-drop
- [ ] Support multi-niveaux de hiérarchie (si besoin)
- [ ] Affichage des sous-catégories dans la page apprenant (filtrage)

## Support
Si vous avez des questions ou rencontrez des problèmes :
1. Vérifiez que la migration SQL a été appliquée correctement dans Supabase
2. Testez la requête `SELECT * FROM task_categories;` dans le SQL Editor de Supabase
3. Consultez les logs du navigateur (DevTools → Console)
