# Guide Complet : Correction du Système d'Images QCM

## 🔍 Diagnostic et Résolution des Erreurs 422

### Problème Identifié
Les utilisateurs rapportent des erreurs **422** lors du chargement des images QCM. Console affiche des UUIDs qui n'existent pas comme fichiers.

**Cause Racine:** Les données de configuration des images (stocker `image_id` vs `file_path`) étaient inconsistantes.

### ✅ État du Code Actuel

**AdminQuestionnaireEditor.jsx** ✓ CORRECT
```javascript
// Ligne 466-470: Sauvegarde correctement image_id
updateQuestion(question.id, 'imageId', value === 'none' ? null : value);
// Récupère le nom pour affichage
const img = images.find(i => i.id === value);
updateQuestion(question.id, 'imageName', value === 'none' ? null : img?.name || null);
```

**AdminTaskManager.jsx** ✓ CORRECT
```javascript
// Ligne 80-81: Sauvegarde dans BD
image_id: q.imageId,      // UUID de l'image sélectionnée
image_name: q.imageName    // Nom pour affichage seulement
```

**QuestionnairePlayerPage.jsx** ✓ CORRECT
```javascript
// Ligne 63-73: JOIN correct
.select(`
  *,
  app_images:image_id (id, name, file_path),
  questionnaire_choices (
    *,
    app_images:image_id (id, name, file_path)
  )
`)
// Ligne 316, 364: Utilise correctement file_path
src={getImageUrl(currentQuestion.image.filePath)}
```

## 🧹 Nettoyage des Données Corrompues

Si vous avez des données de QCMs existants avec des images cassées:

### Étape 1: Identifier les problèmes
```bash
# Exécuter dans Supabase SQL Editor:
cat DIAGNOSE_QCM_IMAGES.sql
```

Cela montre:
- Images cassées (image_id qui n'existe pas)
- Chemins manquants dans app_images
- Statistiques par catégorie

### Étape 2: Nettoyer les données
```bash
# Exécuter dans Supabase SQL Editor:
cat CLEANUP_BROKEN_QCM_IMAGES.sql
```

Cela:
- Supprime les références à des images inexistantes
- Met les colonnes image_id/image_name à NULL
- Verrouille les données valides

### Étape 3: Valider la correction
```bash
# Exécuter dans Supabase SQL Editor:
cat VALIDATE_QCM_IMAGES.sql
```

Cela vérifie:
- Tous les image_id peuvent être JOINés à app_images
- Tous les file_path existent
- Plus de références cassées

## 📋 Checklist d'Implémentation

### Configuration Backend
- [ ] `questionnaire_questions` table avec colonnes `image_id` (UUID FK) et `image_name` (TEXT)
- [ ] `questionnaire_choices` table avec mêmes colonnes
- [ ] Foreign keys point vers `app_images(id)`
- [ ] RLS policies permettent la lecture/écriture

### Configuration Frontend
- [ ] AdminQuestionnaireEditor importe `getImageUrl` ✓
- [ ] Sauvegardes `imageId` (UUID) pas file_path ✓
- [ ] AdminTaskManager insert avec `image_id` et `image_name` ✓
- [ ] QuestionnairePlayerPage fait JOIN avec app_images ✓
- [ ] Utilise `filePath` du JOIN pour getImageUrl() ✓

### Catégories d'Images
- [ ] Catégorie 'QCM' existe dans app_images ✓
- [ ] Catégorie 'wallpaper' existe dans app_images ✓
- [ ] Images chargées avec correct category et file_path

### Images Prédéfinies
```sql
-- Vérifier que ces images existent:
SELECT * FROM app_images 
WHERE category IN ('QCM', 'wallpaper')
AND file_path IS NOT NULL;
```

## 🚀 Workflow Complet de Sélection d'Image

```
1. Admin ouvre AdminQuestionnaireEditor
   ↓
2. Charge les images disponibles (app_images)
   .select('id, name, file_path, category')
   ↓
3. Affiche dropdown avec image names
   ↓
4. Admin sélectionne une image
   → value = image.id (UUID)
   ↓
5. Code sauvegarde:
   imageId = value (UUID)
   imageName = image.name (string pour display)
   ↓
6. AdminTaskManager insert en BD:
   {
     image_id: imageId (UUID),
     image_name: imageName (string)
   }
   ↓
7. QuestionnairePlayerPage charge:
   .select(`*, app_images:image_id (...)`)
   → JOIN retourne file_path depuis app_images
   ↓
8. Affiche l'image:
   src={getImageUrl(app_images.file_path)}
   → Génère URL Supabase Storage
   ↓
9. Image chargée correctement ✓
```

## 📸 Ajout de Nouvelles Images QCM

### Depuis l'Admin Panel (Non implémenté actuellement)
1. Aller à "Gestion des Images"
2. Upload image
3. Sélectionner catégorie = "QCM"
4. Sauvegarder

### Via SQL (Temporaire)
```sql
INSERT INTO app_images (name, category, file_path)
VALUES 
  ('Math Diagram', 'QCM', 'qcm/math-diagram.png'),
  ('Anatomy Chart', 'QCM', 'qcm/anatomy-chart.png');
```

### Via Code (Testing)
```javascript
// Importer depuis supabaseClient
import { supabase } from '@/lib/supabaseClient';

const { data, error } = await supabase
  .from('app_images')
  .insert({
    name: 'New QCM Image',
    category: 'QCM',
    file_path: 'qcm/filename.png'
  });
```

## 🧪 Test End-to-End

### 1. Créer un QCM de Test
```javascript
// Dans AdminQuestionnaireEditor
const testQuestion = {
  instruction: "Select the correct image",
  imageId: "uuid-of-qcm-image",  // Sélectionner une vraie image QCM
  questionType: "image_choice"
};
```

### 2. Vérifier l'Admin Preview
- Aperçu de l'image s'affiche sans erreurs
- Pas d'erreur 422 en console

### 3. Sauvegarder le QCM
- Vérifier dans BD que image_id est un UUID valide
- Vérifier que image_name est rempli

### 4. Charger le QCM comme Apprenant
- Pas d'erreur 422
- Image se charge et s'affiche
- Tailles et proportions correctes

### 5. Répondre au Questionnaire
- Les images des choix s'affichent aussi
- Score calculé correctement

## 🐛 Troubleshooting

### Erreur 422 - Image Not Found
**Symptôme:** Console: "Failed to load image: UUID-filename"

**Solutions:**
1. Vérifier que `image_id` en BD est un UUID valide
2. Vérifier que cet UUID existe dans `app_images.id`
3. Vérifier que `app_images.file_path` est non-null et valide
4. Exécuter CLEANUP_BROKEN_QCM_IMAGES.sql

### Image Preview Ne S'Affiche Pas en Admin
**Symptôme:** Sélection fonctionne mais pas d'aperçu

**Solutions:**
1. Vérifier que getImageUrl() retourne une URL valide
2. Tester l'URL directement dans le navigateur
3. Vérifier les RLS policies de Supabase Storage

### Images Sauvegardes Mais Pas Visibles à l'Apprenant
**Symptôme:** Admin voit l'image, apprenant ne la voit pas

**Solutions:**
1. Vérifier le JOIN dans QuestionnairePlayerPage
2. S'assurer que image_id dans BD est non-null
3. Vérifier que app_images.file_path est valide
4. Vérifier les RLS policies pour SELECT sur app_images

## 📊 Requêtes SQL Utiles

### Voir tous les QCMs avec images
```sql
SELECT qq.id, qq.instruction, ai.name, ai.file_path, ai.category
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id;
```

### Voir une image spécifique
```sql
SELECT * FROM app_images WHERE category = 'QCM' LIMIT 5;
```

### Recalculer les image_name à partir des IDs
```sql
UPDATE questionnaire_questions qq
SET image_name = ai.name
FROM app_images ai
WHERE qq.image_id = ai.id;
```

## 📝 Notes Importantes

1. **image_id** doit toujours être un UUID valide referençant une ligne dans app_images
2. **image_name** est juste pour affichage/debug, pas utilisé pour charger l'image
3. **file_path** est stocké dans app_images et c'est la vrai source de vérité
4. Le JOIN `app_images:image_id` est crucial dans QuestionnairePlayerPage
5. getImageUrl(file_path) génère les URLs publiques Supabase Storage

## ✨ Prochaines Améliorations

- [ ] Interface web pour upload d'images QCM (admin panel)
- [ ] Aperçu d'image lors de la sélection
- [ ] Bulk upload de catégories d'images
- [ ] Validation de file_path lors de l'insertion dans app_images
- [ ] Cache des images pour perfs
