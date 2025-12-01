# Système de sous-catégories pour images - Récapitulatif

## Date: 2025-12-01

## Objectif
Ajouter un système de sous-catégories aux images pour améliorer l'organisation et faciliter la sélection dans les formulaires, notamment pour la catégorie "Capture d'écran" qui contenait trop d'images.

## Sous-catégories créées
Par défaut, trois sous-catégories ont été définies :
- **général** (sous-catégorie par défaut)
- **parametres** 
- **first acces**

## Modifications apportées

### 1. Base de données (`migration_add_image_subcategories.sql`)
✅ Nouveau fichier de migration SQL créé avec :
- Ajout du champ `subcategory` à la table `app_images` (TEXT, défaut: 'général')
- Index créé pour améliorer les performances de recherche
- Fonction RPC `get_distinct_image_subcategories(category_filter)` pour récupérer les sous-catégories disponibles
- Mise à jour des images existantes avec la valeur par défaut 'général'

**À faire:** Exécuter cette migration sur Supabase :
```bash
# Copier le contenu de migration_add_image_subcategories.sql
# et l'exécuter dans l'éditeur SQL de Supabase
```

### 2. Couche de données (`src/data/images.js`)
✅ Ajout du support des sous-catégories :
- Export de `DEFAULT_SUBCATEGORIES` constant
- Cache et promises pour les sous-catégories
- Fonction `getImageSubcategories(category, forceRefresh)` avec cache
- Invalidation du cache de sous-catégories dans toutes les fonctions CRUD
- `addImage()` définit automatiquement 'général' comme sous-catégorie par défaut

### 3. Outil de téléversement d'images (`src/components/admin/AdminImageTools.jsx`)
✅ Ajout du sélecteur de sous-catégorie :
- Import de `FolderTree` icon et fonctions de sous-catégories
- État `selectedSubcategory` et `availableSubcategories`
- `useEffect` pour charger les sous-catégories quand la catégorie change
- Nouveau champ `<select>` pour choisir la sous-catégorie
- La sous-catégorie est incluse dans les métadonnées lors du téléversement

### 4. Galerie d'images admin (`src/components/admin/AdminImageGallery.jsx`)
✅ Filtre par sous-catégorie ajouté :
- Import de `getImageSubcategories` et `DEFAULT_SUBCATEGORIES`
- États `subcategoryFilter` et `availableSubcategories`
- `useEffect` pour charger les sous-catégories selon la catégorie sélectionnée
- Logique de filtrage mise à jour pour inclure la sous-catégorie
- UI de filtrage : boutons pour chaque sous-catégorie (affichés uniquement si une catégorie spécifique est sélectionnée)
- Dialog d'édition mis à jour :
  - Chargement dynamique des sous-catégories
  - Sélecteur de sous-catégorie dans le formulaire
  - `handleUpdate()` inclut maintenant la sous-catégorie

### 5. Formulaire de création d'étape (`src/components/admin/AdminStepForm.jsx`)
✅ Filtre de sous-catégories pour les captures d'écran :
- Import de `getImageSubcategories` et `DEFAULT_SUBCATEGORIES`
- États `subcategoryFilter` et `availableSubcategories`
- `useEffect` pour charger les sous-catégories de "Capture d'écran"
- Variable `screenshotImages` filtrée par sous-catégorie
- Boutons de filtre par sous-catégorie au-dessus du sélecteur d'image
- Liste déroulante affiche uniquement les images de la sous-catégorie sélectionnée

## Comportement

### Dans AdminImageTools (téléversement)
1. L'utilisateur sélectionne une image
2. Le formulaire affiche :
   - Catégorie (liste déroulante)
   - **Sous-catégorie** (liste déroulante - chargée dynamiquement selon la catégorie)
3. Par défaut, 'général' est sélectionné
4. La sous-catégorie est enregistrée avec l'image

### Dans AdminImageGallery (galerie)
1. L'utilisateur filtre par catégorie (ex: "Capture d'écran")
2. **Nouveau:** Des boutons de sous-catégories apparaissent ("Toutes", "général", "parametres", "first acces")
3. Cliquer sur une sous-catégorie filtre instantanément les images affichées
4. L'édition d'une image permet de changer sa sous-catégorie

### Dans AdminStepForm (création d'étape)
1. Le champ "Capture d'écran" affiche maintenant des **boutons de filtre** au-dessus
2. Par défaut "Toutes" est sélectionné (affiche toutes les captures)
3. Cliquer sur "parametres" → affiche uniquement les captures de la sous-catégorie "parametres"
4. La liste déroulante est automatiquement filtrée

## Avantages

### ✅ Organisation améliorée
- Les images sont maintenant organisées en catégories ET sous-catégories
- Plus facile de retrouver une capture spécifique

### ✅ Liste plus courte et ciblée
- Dans le formulaire de création d'étape, la liste n'affiche que les images pertinentes
- Réduit le scroll et améliore l'UX

### ✅ Extensible
- Facile d'ajouter de nouvelles sous-catégories via l'interface ou en base
- Le système charge dynamiquement les sous-catégories disponibles

### ✅ Rétrocompatible
- Les images existantes reçoivent automatiquement la sous-catégorie 'général'
- Aucune perte de données

## Tests à effectuer

1. **Migration SQL**
   - [ ] Exécuter la migration sur Supabase
   - [ ] Vérifier que le champ `subcategory` existe dans `app_images`
   - [ ] Tester la fonction RPC `get_distinct_image_subcategories`

2. **Téléversement d'image**
   - [ ] Téléverser une nouvelle image
   - [ ] Vérifier que le sélecteur de sous-catégorie est présent
   - [ ] Changer de catégorie → les sous-catégories se mettent à jour
   - [ ] Sélectionner une sous-catégorie et valider
   - [ ] Vérifier en DB que la sous-catégorie est bien enregistrée

3. **Galerie d'images**
   - [ ] Filtrer par "Capture d'écran"
   - [ ] Vérifier que les boutons de sous-catégories apparaissent
   - [ ] Cliquer sur "parametres" → seules les images "parametres" s'affichent
   - [ ] Éditer une image → changer sa sous-catégorie → vérifier la sauvegarde

4. **Formulaire d'étape**
   - [ ] Créer/éditer une étape
   - [ ] Dans "Capture d'écran", vérifier la présence des boutons de filtre
   - [ ] Cliquer sur "first acces" → seules ces images doivent apparaître dans le select
   - [ ] Sélectionner "Toutes" → toutes les captures doivent réapparaître

## Notes techniques

- **Cache** : Les sous-catégories sont mises en cache pour éviter des appels répétés à la DB
- **Invalidation** : Le cache est invalidé lors de l'ajout/modification/suppression d'images
- **Fallback** : En cas d'erreur de chargement, les sous-catégories par défaut sont utilisées
- **Dynamique** : Les sous-catégories sont chargées depuis la DB (fonction RPC), pas hardcodées

## Améliorations futures possibles

1. Interface d'administration pour gérer les sous-catégories (ajouter/renommer/supprimer)
2. Migration automatique : proposer de catégoriser automatiquement les images existantes selon leur nom
3. Compteurs : afficher le nombre d'images par sous-catégorie dans les filtres
4. Multi-sélection : permettre de sélectionner plusieurs sous-catégories à la fois
5. Recherche : intégrer la sous-catégorie dans la recherche textuelle
