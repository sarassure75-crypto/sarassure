# Guide de Diagnostic - Problème de visibilité des étapes côté apprenant

## Symptômes
- ✅ L'exercice est visible côté apprenant
- ✅ La version est visible côté apprenant  
- ❌ Les étapes ne sont PAS visibles côté apprenant
- ✅ Les étapes SONT visibles côté admin

## Causes possibles

### 1. Problème de politiques RLS (Row Level Security)
Les politiques RLS sur la table `steps` peuvent bloquer l'accès pour les apprenants.

**Test SQL à exécuter dans Supabase:**
```sql
-- Voir le fichier migrations/DIAGNOSTIC_STEPS_RLS.sql
```

### 2. Problème de requête imbriquée
Supabase peut avoir du mal avec les jointures imbriquées `tasks > versions > steps` si les politiques RLS ne sont pas correctement configurées.

**Solution:** Charger les steps séparément au lieu d'utiliser une jointure imbriquée.

### 3. Problème de cache
Le cache côté client peut contenir des données périmées sans les steps.

**Solution:** Vider le cache local et forcer un rechargement.

## Tests de diagnostic

### Test 1: Console du navigateur
1. Ouvrir http://localhost:3000 en mode apprenant
2. Ouvrir la console (F12)
3. Charger un exercice qui pose problème
4. Regarder les logs de debug commençant par `🔍 DEBUG`
5. Vérifier que `steps` est présent et non vide

### Test 2: Fichier debug-steps.js
1. Ouvrir la console sur http://localhost:3000
2. Taper: `testStepsQuery()`
3. Entrer l'ID de la tâche et de la version
4. Analyser les résultats des 4 tests

### Test 3: SQL Supabase
1. Ouvrir le dashboard Supabase
2. Aller dans SQL Editor
3. Exécuter le fichier `migrations/DIAGNOSTIC_STEPS_RLS.sql`
4. Analyser les résultats

## Solutions rapides

### Solution 1: Vérifier les politiques RLS
Si les politiques sont trop restrictives:
```sql
-- Dans l'éditeur SQL Supabase
DROP POLICY IF EXISTS "authenticated_read_steps" ON public.steps;

CREATE POLICY "authenticated_read_steps"
ON public.steps FOR SELECT
TO authenticated
USING (true); -- Permet à TOUS les utilisateurs authentifiés de lire
```

### Solution 2: Modifier la requête pour charger les steps séparément
Dans `ExercisePage.jsx`, au lieu de:
```javascript
.select('id, title, video_url, task_type, versions(*, steps(*))')
```

Utiliser:
```javascript
// 1. Charger la task et les versions
const { data: task } = await supabase
  .from('tasks')
  .select('id, title, video_url, task_type, versions(*)')
  .eq('id', taskId)
  .maybeSingle();

// 2. Charger les steps séparément pour chaque version
for (const version of task.versions) {
  const { data: steps } = await supabase
    .from('steps')
    .select('*')
    .eq('version_id', version.id)
    .order('step_order');
  version.steps = steps;
}
```

### Solution 3: Vider le cache
```javascript
// Dans la console du navigateur
localStorage.clear();
location.reload();
```

## Fichiers modifiés pour le diagnostic
- ✅ `src/pages/ExercisePage.jsx` - Ajout de logs de debug
- ✅ `src/debug-steps.js` - Fonction de test interactive
- ✅ `migrations/DIAGNOSTIC_STEPS_RLS.sql` - Requêtes de diagnostic SQL

## Étapes suivantes
1. Exécuter les 3 tests de diagnostic ci-dessus
2. Noter les résultats (présence de steps dans les logs, erreurs SQL, etc.)
3. Appliquer la solution appropriée selon les résultats
4. Tester en mode apprenant pour confirmer la résolution
5. Supprimer les logs de debug une fois le problème résolu

## Logs à surveiller
```
🔍 DEBUG ExercisePage - Requête task: {...}
🔍 DEBUG - Versions dans taskData: [...]
🔍 DEBUG - Version X: {stepsCount: 0/N}
🔍 DEBUG - Steps avant tri: [...]
```

Si `stepsCount: 0` alors qu'il devrait y avoir des étapes, c'est le problème !
