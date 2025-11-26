/**
 * Script pour appliquer la migration user_id sur la table versions
 * Exécutez ce script dans Supabase SQL Editor
 */

-- 1. Ajouter la colonne user_id
ALTER TABLE versions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Créer l'index
CREATE INDEX IF NOT EXISTS idx_versions_user_id ON versions(user_id);

-- 3. Remplir les user_id existants basés sur les tasks
UPDATE versions 
SET user_id = tasks.owner_id 
FROM tasks 
WHERE versions.task_id = tasks.id 
AND tasks.owner_id IS NOT NULL 
AND versions.user_id IS NULL;

-- 4. Vérifier le résultat
SELECT 
  v.id,
  v.creation_status,
  v.user_id,
  t.owner_id as task_owner,
  CASE WHEN v.user_id = '5bc174ed-7d77-4eb3-b962-ff118aaadef1' THEN 'ADMIN' ELSE 'CONTRIBUTOR' END as user_type
FROM versions v 
LEFT JOIN tasks t ON v.task_id = t.id 
WHERE v.creation_status = 'validated'
ORDER BY v.created_at DESC;