# AUDIT COMPLET - Incohérences QCM vs Exercices

## INCOHÉRENCES TROUVÉES:

### 1. ❌ **AdminQuestionnaireValidation.jsx** - Filtre MANQUANT task_type
**Problème:** La requête charge TOUTES les versions 'pending', pas seulement les QCM
**Ligne:** 54-55
**Actuel:**
```javascript
.eq('creation_status', 'pending')
```
**Devrait être:**
```javascript
.eq('creation_status', 'pending')
.filter('task->>task_type', 'eq', 'questionnaire')
```

---

### 2. ❌ **AdminExerciseValidation.jsx** - Charge AUSSI les QCM
**Problème:** Charge toutes les versions, y compris les QCM (qui ne doivent pas y être)
**Ligne:** 45-46
**Impact:** Les QCM apparaissent dans la validation des exercices

---

### 3. ❌ **useAdminCounters.js** - Compteurs INCORRECTS
**Problème:** Compte `exercisesCount = 0` et `questionnairesCount = 0`
**Ligne:** 56-60
**Actuel:**
```javascript
const exercisesCount = versionsData?.length || 0;
const questionnairesCount = 0;  // ❌ Toujours 0!
```
**Devrait être:**
```javascript
// Séparer par task_type
const exercisesCount = exerciseVersions?.length || 0;
const questionnairesCount = questionnaireVersions?.length || 0;
```

---

### 4. ❌ **ExercisePage.jsx** - Affichage DOUBLÉ du QCM
**Problème:** Le QCM est affiché à deux endroits:
- Ligne 657-670: Dans mainContent (avec autres affichages)
- Ligne 918-933: Dans le rendu principal
**Résultat:** Confusion d'affichage, risque de duplication

---

### 5. ❌ **QuestionnaireCreation.jsx** - Pas de filtre task_type
**Problème:** Dans `handleApprove()`, ne filtre pas par task_type='questionnaire'
**Ligne:** 263

---

### 6. ✅ **AdminTaskManager.jsx** - OK ✓
Correctement route vers `/admin/validation/questionnaires` pour QCM

---

### 7. ❌ **AdminExerciseValidation.jsx** - Ne filtre PAS task_type
**Problème:** Charge toutes les versions, pas seulement 'exercise'
**Ligne:** 45-62
**Impact:** Mélange exercices et QCM

---

### 8. ❌ **ExerciseStepsPreviewPage.jsx** - Pas de task_type
**Problème:** N'affiche que les exercices, ne gère pas les QCM
**Ligne:** 32
**Impact:** Preview QCM ne fonctionne pas

---

## RÉSUMÉ DES CORRECTIONS NÉCESSAIRES:

| Fichier | Problème | Correction | Priorité |
|---------|----------|-----------|----------|
| AdminQuestionnaireValidation.jsx | Pas de filtre task_type | Ajouter filtre task_type='questionnaire' | 🔴 HAUTE |
| AdminExerciseValidation.jsx | Charge aussi les QCM | Ajouter filtre task_type='exercise' | 🔴 HAUTE |
| useAdminCounters.js | Compteurs incorrects | Séparer exercices et QCM | 🔴 HAUTE |
| ExercisePage.jsx | Affichage doublé QCM | Nettoyer affichage, garder 1 seul | 🟡 MOYEN |
| QuestionnaireCreation.jsx | Pas de filtre | Ajouter vérification task_type | 🟡 MOYEN |
| AdminExerciseValidation.jsx | Ne filtre pas task_type | Ajouter filtre dans requête | 🔴 HAUTE |

