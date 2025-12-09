# 🔧 Correction: Ajout d'images QCM

## Problème Identifié
Les images ajoutées aux QCM ne fonctionnaient pas car:
1. ❌ **File paths stockées au lieu d'IDs** - Code sauvegardait `'public/d05a8a1d...png'` au lieu de l'UUID
2. ❌ **Chemins invalides** - Résultait en erreurs 404
3. ❌ **Aucun aperçu en admin** - Impossible de voir l'image sélectionnée

## Logs du Problème
```
AdminQuestionnaireEditor.jsx:470 "imageName": "public/d05a8a1d-2989-46be-be35-e5a7f66fa4b4.png"
                                                ↑ Mauvais: file_path au lieu d'ID

d05a8a1d-2989-46be-be35-e5a7f66fa4b4.png:1 Failed to load resource: 404
                                             ↑ Fichier n'existe pas
```

## Solution Implémentée

### 1. **Stocker l'image_id (UUID)** au lieu du file_path
```javascript
// AVANT ❌
updateQuestion(question.id, 'imageName', img?.file_path || null);
// Résultat: imageName = 'public/d05a8a1d...png'

// APRÈS ✅
updateQuestion(question.id, 'imageName', img?.name || null);
// imageName = 'Mon Image' (nom d'affichage seulement)
// imageId = '550e8400-e29b-41d4-a716-446655440000' (UUID)
```

### 2. **Charger le file_path dynamiquement** depuis app_images
```javascript
// AVANT ❌
src={getImageUrl(question.imageName)}  // essayait d'utiliser le file_path stocké

// APRÈS ✅
const imageData = images.find(i => i.id === question.imageId);
src={getImageUrl(imageData?.file_path)}  // charge depuis app_images
```

### 3. **Migration SQL** pour nettoyer les données existantes
```sql
-- fix_qcm_image_ids.sql
UPDATE questionnaire_questions
SET image_id = NULL, image_name = NULL
WHERE image_id NOT IN (SELECT id FROM app_images);
```

## Structure de Données - Maintenant Correcte

### Table: questionnaire_questions
```
| id | instruction | image_id (UUID)             | image_name (nom) |
|----|-------------|-------|
| q1 | Question 1  | 550e8400-e29b-41d4-a716... | Mon Image QCM    |
```

### Table: app_images  (lookup)
```
| id                              | name        | file_path            |
|----|-------------|-------------|
| 550e8400-e29b-41d4-a716...     | Mon Image   | wallpapers/png/...   |
```

## Comment ça marche maintenant

1. **En Admin:**
   - Sélectionner une image dans le dropdown
   - Aperçu s'affiche via `getImageUrl(app_images.file_path)` ✅
   - Sauvegarder → image_id stocké en base ✅

2. **Côté Apprenant:**
   - Charger questionnaire
   - Joindre app_images pour obtenir file_path
   - Afficher avec `getImageUrl()` ✅

## Fichiers Modifiés

### React
- `src/components/admin/AdminQuestionnaireEditor.jsx`
  - Ligne 463-490: Questions avec images
  - Ligne 523-540: Choix avec images
  - Changement: Utiliser `imageId` + lookup app_images

### SQL
- `fix_qcm_image_ids.sql`
  - Nettoie les références invalides en base

## Avant/Après

### AVANT ❌
```json
{
  "imageId": null,
  "imageName": "public/d05a8a1d-2989-46be-be35-e5a7f66fa4b4.png"
}
→ 404 Not Found
```

### APRÈS ✅
```json
{
  "imageId": "550e8400-e29b-41d4-a716-446655440000",
  "imageName": "Capture Écran - Exemple"
}
→ Charger from app_images.file_path
→ Afficher correctement ✅
```

## Procédure de Déploiement

1. **Exécuter la migration SQL**
   ```sql
   -- fix_qcm_image_ids.sql
   -- Nettoie les données existantes invalides
   ```

2. **Déployer le code**
   - AdminQuestionnaireEditor.jsx mis à jour

3. **Tester**
   - Admin → QCM → Ajouter image → Doit afficher aperçu ✅
   - Apprenant → QCM → Image doit s'afficher ✅

## Prochaines Améliorations Recommandées

- [ ] Interface d'upload d'images directement en admin
- [ ] Validation d'image au moment du sélection
- [ ] Compression automatique des images
- [ ] Pagination si nombreuses images
- [ ] Catégorisation par type QCM

---

**Commit:** `b18b2ba` ✅ Pushed to GitHub
