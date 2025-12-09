# Test Plan: QCM Image Selection Workflow

## Objectif
Vérifier que le système de sélection d'images pour les QCMs fonctionne correctement du bout à bout.

## 1. Vérifier les Données de Base

### SQL à exécuter dans Supabase
```sql
-- Vérifier que les images QCM existent
SELECT * FROM app_images WHERE category = 'QCM';
-- Devrait retourner au moins quelques images

-- Vérifier le schéma des tables QCM
SELECT 
  qq.id, qq.task_id, qq.instruction, qq.image_id, qq.image_name,
  ai.id as app_image_id, ai.name as img_name, ai.file_path
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id
LIMIT 5;
-- Devrait montrer un JOIN correct
```

### Résultats attendus:
- Au moins 5 images QCM disponibles
- Chaque image a un UUID valide en `id`
- Chaque image a un `file_path` non-null

## 2. Test 1: Créer un Nouveau QCM avec Image

### Étapes:
1. Aller à l'interface Admin → Créer un nouveau QCM
2. Remplir: Titre, Description, Catégorie
3. Ajouter une question
4. Remplir le texte de la question
5. **Sélectionner une image** du dropdown
6. ✅ Vérifier que l'aperçu de l'image s'affiche

### Logs attendus en Console:
```
✓ No 422 errors
✓ Image preview renders
✓ No "Image non disponible" message
```

### Valider en SQL:
```sql
-- Récupérer le QCM créé
SELECT qq.id, qq.task_id, qq.image_id, qq.image_name, ai.file_path
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id
WHERE qq.task_id = '<ID du QCM créé>';

-- DOIT retourner:
-- qq.image_id = UUID valide
-- ai.file_path = 'qcm/diagram.png' ou similaire
```

## 3. Test 2: Ajouter Image aux Réponses

### Étapes:
1. Dans le même QCM, ajouter 2 réponses
2. Sélectionner une image pour chaque réponse
3. ✅ Vérifier que les aperçus s'affichent

### Valider en SQL:
```sql
-- Récupérer les réponses avec images
SELECT 
  qc.id, qc.text, qc.image_id, qc.image_name,
  ai.file_path, ai.name
FROM questionnaire_choices qc
LEFT JOIN app_images ai ON qc.image_id = ai.id
WHERE qc.question_id = '<ID de la question>';

-- DOIT retourner:
-- qc.image_id = UUID valide (pas NULL)
-- ai.file_path = 'qcm/...' (pas NULL)
```

## 4. Test 3: Charger le QCM comme Apprenant

### Étapes:
1. Fermer l'éditeur admin
2. Aller dans "Mes Questionnaires"
3. Ouvrir le QCM créé
4. ✅ Vérifier que l'image de la question s'affiche
5. ✅ Vérifier que les images des réponses s'affichent
6. Répondre au questionnaire

### Logs attendus en Console:
```
✓ No 422 errors
✓ Images load successfully
✓ No "Image non disponible" messages
✓ Proper dimensions and proportions
```

### Valider techniquement:
- Inspect → Network tab
- Chercher les requêtes vers Supabase Storage
- Statut HTTP = 200 (pas 422)

## 5. Test 4: Éditer un QCM Existant

### Étapes:
1. Retourner à l'éditeur admin
2. Éditer le QCM créé
3. ✅ Vérifier que les images sélectionnées s'affichent en aperçu
4. Modifier l'image d'une question
5. ✅ Vérifier que le nouvel aperçu s'affiche

### Résultat attendu:
- Les images modifiées se sauvegardent correctement
- Pas de perte de données

## 6. Test 5: QCM Sans Image

### Étapes:
1. Créer un QCM SANS sélectionner d'image
2. Sauvegarder
3. Charger comme apprenant
4. ✅ Vérifier que ça fonctionne normalement (sans les conteneurs d'image)

### Valider en SQL:
```sql
SELECT qq.image_id FROM questionnaire_questions WHERE task_id = '<ID>';
-- DOIT retourner: NULL (pas d'erreur, juste pas d'image)
```

## Checklist de Validation

### Code:
- [ ] AdminQuestionnaireEditor.jsx charge les images QCM
- [ ] AdminQuestionnaireEditor.jsx sauvegarde `imageId` (UUID) pas `file_path`
- [ ] AdminQuestionnaireEditor.jsx affiche aperçu avec getImageUrl()
- [ ] AdminTaskManager.jsx insert avec `image_id` et `image_name`
- [ ] QuestionnairePlayerPage.jsx fait JOIN avec app_images
- [ ] QuestionnairePlayerPage.jsx utilise `file_path` du JOIN

### Données:
- [ ] Images QCM existent en BD (category = 'QCM')
- [ ] Chaque image a un `file_path` valide
- [ ] Pas de références cassées (image_id invalide)
- [ ] No 422 errors in console

### UX:
- [ ] Admin voit aperçu d'image lors de la sélection
- [ ] Admin voit aperçu lors de l'édition
- [ ] Apprenant voit les images correctement dimensionnées
- [ ] Images se chargent rapidement

## Debugging: Si Ça Ne Fonctionne Pas

### Symptôme: Erreur 422 en Console

**Vérifier:**
1. Admin console → Network tab
2. Chercher requête vers Supabase Storage
3. Clic droit → Copy URL
4. Essayer l'URL directement dans le navigateur
5. Si 404 → le fichier n'existe pas en Storage
6. Si 403 → problème de permissions RLS

**Solution:**
```sql
-- Vérifier que image_id existe
SELECT ai.id, ai.file_path 
FROM app_images ai 
WHERE ai.id = '<le UUID de erreur>';

-- Si rien → l'image n'existe pas en BD
-- Solution: Nettoyer avec CLEANUP_BROKEN_QCM_IMAGES.sql
```

### Symptôme: Aperçu ne s'affiche pas en Admin

**Vérifier:**
1. Ouvrir DevTools → Console
2. Y a-t-il des erreurs getImageUrl()?
3. Vérifier que images[] n'est pas vide:
   ```javascript
   console.log('Images disponibles:', window.images);
   // Si empty → loadQCMImages() a échoué
   ```

**Solution:**
```javascript
// Dans console browser:
supabase.from('app_images').select('*').eq('category', 'QCM').then(r => console.log(r));
// Vérifier que ça retourne des images
```

### Symptôme: Image sauvegardée mais pas visible à l'apprenant

**Vérifier:**
1. Vérifier que questionnairePlayerPage reçoit les données:
   ```sql
   SELECT qq.id, qq.image_id, ai.file_path 
   FROM questionnaire_questions qq
   LEFT JOIN app_images ai ON qq.image_id = ai.id
   WHERE qq.task_id = '<task_id>';
   ```
2. image_id doit être non-NULL et existant dans app_images

**Solution:**
```javascript
// Dans QuestionnairePlayerPage, vérifier le state:
console.log('Questions chargées:', questions);
console.log('Question image:', currentQuestion.image);
// Si image = null → JOIN a échoué (image_id cassé)
```

## Après Validation

Une fois que tous les tests passent:
1. Commit: "fix: QCM image selection and display workflow"
2. Documenter les changements en BD
3. Informer les utilisateurs

## Notes

- Les images QCM doivent être uploadées manuellement en Supabase Storage (dossier 'qcm/')
- Chaque image doit avoir une entrée dans app_images avec file_path correspondant
- Ne jamais stocker `file_path` dans `image_id` - toujours utiliser UUIDs
- Le JOIN est crucial pour la résolution file_path au runtime
