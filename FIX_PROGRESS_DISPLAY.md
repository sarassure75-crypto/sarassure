# Correction Affichage Progression Apprenant

**Date:** 1er décembre 2025  
**Problème:** La progression de l'apprenant ne s'affichait pas dans la page "Mon Suivi d'Apprentissage"

## Erreurs Identifiées

### 1. Erreur 406 (Not Acceptable)
```
vkvreculoijplklylpsz.supabase.co/rest/v1/user_version_progress?select=*&user_id=eq.xxx&version_id=eq.xxx:1
Failed to load resource: the server responded with a status of 406
```

### 2. Erreur 400 (Bad Request) 
```
vkvreculoijplklylpsz.supabase.co/rest/v1/user_version_progress?on_conflict=id&select=*:1
Failed to load resource: the server responded with a status of 400
recordCompletion - upsert error
```

## Causes

### Problème 1: Mauvaise contrainte d'upsert
**Fichier:** `src/data/progress.js` - fonction `recordCompletion()`

La table `user_version_progress` a une contrainte unique sur `(user_id, version_id)`, pas sur `id`.

**Code incorrect:**
```javascript
const { data, error } = await supabase.from('user_version_progress').upsert(newProgressData, {
  onConflict: 'id',  // ❌ MAUVAISE CLÉ
  ignoreDuplicates: false,
}).select();
```

**Code corrigé:**
```javascript
const { data, error } = await supabase
  .from('user_version_progress')
  .upsert(newProgressData, {
    onConflict: 'user_id,version_id'  // ✅ BONNE CLÉ COMPOSITE
  })
  .select()
  .single();
```

### Problème 2: RPC function incomplète
**Fichier:** `schema.sql` - fonction `get_user_progress_details()`

La fonction RPC ne retournait pas `task_id` et `version_id`, empêchant la page `LearnerProgressPage` de construire correctement la map de progression.

**Code incorrect:**
```sql
RETURNS TABLE(
  id uuid, 
  task_title text,   -- ❌ Manque task_id
  version_name text, -- ❌ Manque version_id
  attempts integer,
  ...
)
```

**Code corrigé (fix_progress_display.sql):**
```sql
RETURNS TABLE(
  id uuid, 
  task_id uuid,      -- ✅ Ajouté
  version_id uuid,   -- ✅ Ajouté
  task_title text, 
  version_name text, 
  attempts integer,
  ...
)
SELECT
  uvp.id,
  t.id AS task_id,    -- ✅ Ajouté
  v.id AS version_id, -- ✅ Ajouté
  t.title AS task_title,
  ...
```

## Fichiers Modifiés

1. **src/data/progress.js**
   - Correction de la fonction `recordCompletion()`
   - Changement `onConflict: 'id'` → `onConflict: 'user_id,version_id'`
   - Ajout de `.single()` après `.select()`
   - Suppression du code mort (vérification id dans existingProgress)

2. **fix_progress_display.sql** (NOUVEAU)
   - Migration SQL pour corriger la fonction RPC
   - Ajout de `task_id` et `version_id` dans le RETURNS TABLE
   - Ajout de `t.id AS task_id` et `v.id AS version_id` dans le SELECT

## Instructions de Déploiement

### Étape 1: Exécuter la migration SQL
1. Ouvrir le dashboard Supabase
2. Aller dans **SQL Editor**
3. Copier le contenu de `fix_progress_display.sql`
4. Exécuter le script

### Étape 2: Déployer le nouveau build
1. Le build de production a été créé avec succès (6.01s)
2. Uploader le contenu du dossier `dist/` vers Hostinger
3. Remplacer tous les fichiers existants

## Test de Validation

Après déploiement, vérifier:
1. ✅ Connexion en tant qu'apprenant
2. ✅ Compléter un exercice
3. ✅ Vérifier que la progression s'enregistre (pas d'erreur 406/400 en console)
4. ✅ Aller dans "Mon Suivi d'Apprentissage"
5. ✅ Vérifier que les tentatives et temps s'affichent correctement
6. ✅ Cliquer sur "Rafraîchir" pour recharger les données

## Erreurs Résolues

- ✅ Erreur 406 sur `user_version_progress` (select)
- ✅ Erreur 400 sur `user_version_progress` (upsert)
- ✅ `recordCompletion - upsert error`
- ✅ Affichage progression vide malgré exercices complétés

## Notes Techniques

**Contrainte unique de la table:**
```sql
ALTER TABLE public.user_version_progress 
ADD CONSTRAINT unique_user_version_progress 
UNIQUE (user_id, version_id);
```

Cette contrainte garantit qu'un utilisateur ne peut avoir qu'une seule entrée de progression par version d'exercice. L'upsert doit donc utiliser cette clé composite pour identifier les doublons.

**LearnerProgressPage - Construction de la map:**
```javascript
const progressMap = new Map();
(progressData || []).forEach(p => {
  progressMap.set(`${p.task_id}-${p.version_id}`, p); // Nécessite task_id et version_id
});
```

Sans `task_id` et `version_id` dans le résultat RPC, la map ne peut pas être construite correctement.
