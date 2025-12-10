-- VÉRIFIER LES EXERCICES EN BASE DE DONNÉES
-- Exécuter dans Supabase SQL Editor

-- 1. Compter les exercices (tasks)
SELECT COUNT(*) as total_exercises, 
       SUM(CASE WHEN is_deleted = false THEN 1 ELSE 0 END) as active_exercises,
       SUM(CASE WHEN is_deleted = true THEN 1 ELSE 0 END) as deleted_exercises
FROM tasks;

-- 2. Lister les 20 derniers exercices
SELECT id, title, creation_status, is_deleted, created_at, task_type
FROM tasks
ORDER BY created_at DESC
LIMIT 20;

-- 3. Vérifier les versions des exercices
SELECT 
  t.id as task_id,
  t.title,
  t.is_deleted,
  COUNT(v.id) as version_count,
  COUNT(s.id) as step_count
FROM tasks t
LEFT JOIN versions v ON t.id = v.task_id
LEFT JOIN steps s ON v.id = s.version_id
GROUP BY t.id, t.title, t.is_deleted
LIMIT 20;

-- 4. Chercher les exercices supprimés par erreur
SELECT id, title, is_deleted, deleted_at, created_at
FROM tasks
WHERE is_deleted = true
ORDER BY deleted_at DESC
LIMIT 20;

-- 5. Vérifier les exercices récents (derniers 24h)
SELECT id, title, creation_status, is_deleted, created_at
FROM tasks
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- 6. Vérifier les politiques RLS sur tasks
SELECT *
FROM pg_policies
WHERE tablename = 'tasks';
