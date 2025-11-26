# CORRECTIONS VOCABULAIRE ET INCOHÉRENCES - 26/11/2025

## ✅ VALIDATION DE LA TERMINOLOGIE

Après vérification complète du code par rapport à `TERMINOLOGIE_PROJET.md` :

### **Rôles dans Supabase** (CORRECT ✅)
```sql
-- Dans la base de données profiles.role :
'administrateur'  -- Admin (français)
'formateur'       -- Trainer (français)  
'apprenant'       -- Learner (français)
'contributor'     -- Contributor (ANGLAIS - exception confirmée)
```

### **USER_ROLES dans le code** (CORRECT ✅)
```javascript
// src/data/users.js
export const USER_ROLES = {
  ADMIN: 'administrateur',      // ✅ Correspond à Supabase
  TRAINER: 'formateur',         // ✅ Correspond à Supabase
  LEARNER: 'apprenant',         // ✅ Correspond à Supabase
  CONTRIBUTOR: 'contributor',   // ✅ Correspond à Supabase (anglais)
};
```

### **Routes React** (CORRECT ✅)
```javascript
// Routes en français (comme spécifié dans TERMINOLOGIE_PROJET.md)
/contributeur                           // ✅
/contributeur/nouvelle-contribution     // ✅
/contributeur/bibliotheque             // ✅
/contributeur/mes-contributions        // ✅
/contributeur/profil                   // ✅
/formateur                             // ✅
/compte-formateur                      // ✅
/compte-apprenant                      // ✅
```

---

## 🔧 CORRECTIONS APPLIQUÉES

### 1. **Domaine sarassure.com → sarassure.net**

**Fichiers à corriger manuellement** (documentation uniquement, pas de code) :
- `QUICK-REFERENCE-CARD.md` (2 occurrences)
- `HOSTINGER_UPLOAD_MANIFEST.md` (4 occurrences)
- `DOCUMENTATION-INDEX.md` (1 occurrence)
- `DEPLOYMENT_READY_2025.md` (1 occurrence)
- `DEPLOYMENT_CHECKLIST_2025.md` (3 occurrences)
- `00-START-HERE-DEPLOYMENT-PACKAGE.md` (2 occurrences)

**Note**: Ces fichiers contiennent uniquement de la documentation. Le code source ne contient aucune référence hardcodée au domaine.

### 2. **Problème d'affichage des images - AdminExerciseValidation**

**Problème identifié** :
- Les URLs d'images n'étaient pas correctement générées avec `getPublicUrl()`
- Pas de logging pour déboguer les erreurs de chargement

**Corrections appliquées** :
```javascript
// src/pages/AdminExerciseValidation.jsx
// ✅ Ajout de console.log pour tracer les URLs générées
// ✅ Ajout de image_path en plus de image_url pour debug

// src/components/admin/ExerciseStepViewer.jsx
// ✅ Ajout de onLoad handler pour confirmer le chargement
// ✅ Amélioration du message d'erreur avec URL ET path
// ✅ Meilleur affichage des erreurs avec formatage
```

### 3. **Zones d'action (SVG overlays)**

**Corrections précédentes conservées** :
- ✅ Simplification des coordonnées (déjà en %)
- ✅ Synchronisation du zoom avec les SVG
- ✅ Bordures en pointillés (strokeDasharray)
- ✅ Meilleure opacité et visibilité

---

## 📋 CHECKLIST DE VÉRIFICATION

### Vocabulaire et Rôles
- [✅] USER_ROLES utilise les valeurs françaises correctes
- [✅] 'contributor' est bien en anglais (exception)
- [✅] Routes React en français
- [✅] Aucune référence à 'contributeur' dans les requêtes DB

### Buckets Storage
- [✅] `app-images` (pour les screenshots d'exercices)
- [✅] `contributions-images` (pour les contributions)
- [✅] `images` (pour les images générales)
- [✅] `wallpapers` (pour les fonds d'écran)

### Domaine
- [⚠️] Documentation contient `sarassure.com` → à remplacer par `sarassure.net`
- [✅] Code source ne contient aucune référence hardcodée au domaine

---

## 🐛 DEBUGGING - Images qui ne s'affichent pas

### Logs ajoutés pour diagnostic :
```javascript
// Console logs ajoutés :
1. "Image URL generated: [url]" - Lors de la génération d'URL
2. "Image loaded successfully: [url]" - Quand l'image se charge
3. "Image load error: [url]" - Si l'image ne charge pas
4. "Image path: [path]" - Le chemin original dans la DB
```

### Points à vérifier :
1. **Dans la console du navigateur** :
   - Les URLs générées sont-elles valides ?
   - Les chemins de fichier dans `app_images.file_path` sont-ils corrects ?
   - Y a-t-il des erreurs CORS ou 403 ?

2. **Dans Supabase** :
   - Le bucket `app-images` existe-t-il ?
   - Est-il configuré comme public ?
   - Les fichiers existent-ils vraiment aux chemins spécifiés ?

3. **Permissions RLS** :
   - Les policies du bucket permettent-elles la lecture publique ?

---

## 🎯 RECOMMANDATIONS

### Pour corriger le domaine dans la documentation :
```bash
# PowerShell - Remplacer sarassure.com par sarassure.net
Get-ChildItem -Path . -Filter "*.md" -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace 'sarassure\.com', 'sarassure.net' | Set-Content $_.FullName
}
```

### Pour tester les images :
1. Ouvrir la console du navigateur (F12)
2. Aller sur `/admin/validation/exercices`
3. Vérifier les logs :
   - "Image URL generated" doit apparaître
   - Si "Image load error" apparaît, vérifier l'URL affichée
4. Tester l'URL directement dans le navigateur
5. Vérifier les permissions du bucket dans Supabase

---

## 📝 NOTES IMPORTANTES

### Pourquoi 'contributor' est en anglais ?
D'après `TERMINOLOGIE_PROJET.md`, c'est une **exception intentionnelle** pour maintenir la cohérence avec le nom de table `contributors` (au pluriel, en anglais). C'est un choix de design documenté.

### Différence entre app-images et images
- **app-images** : Screenshots d'applications pour les étapes d'exercices
- **images** : Images générales, fonds d'écran, illustrations
- **contributions-images** : Images uploadées par les contributeurs (1MB max)

### Bucket `app-images` - Configuration requise
```sql
-- Le bucket doit être PUBLIC
-- RLS policies doivent permettre SELECT pour tous
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'app-images');
```

---

**Dernière mise à jour** : 26 novembre 2025  
**Fichiers modifiés** :
- `src/pages/AdminExerciseValidation.jsx`
- `src/components/admin/ExerciseStepViewer.jsx`
