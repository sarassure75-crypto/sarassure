-- CRÉER DES RPC FUNCTIONS SÉCURISÉES POUR LA CRÉATION DES TÂCHES
-- Exécuter dans Supabase SQL Editor

-- 1. RPC pour créer une tâche
CREATE OR REPLACE FUNCTION create_task(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_icon_name TEXT DEFAULT NULL,
  p_creation_status TEXT DEFAULT 'draft',
  p_category_id UUID DEFAULT NULL,
  p_task_type TEXT DEFAULT 'normal'
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  icon_name TEXT,
  creation_status TEXT,
  category_id UUID,
  task_type TEXT,
  is_deleted BOOLEAN,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO tasks (title, description, icon_name, creation_status, category_id, task_type, is_deleted)
  VALUES (p_title, p_description, p_icon_name, p_creation_status, p_category_id, p_task_type, false)
  RETURNING tasks.id, tasks.title, tasks.description, tasks.icon_name, tasks.creation_status, 
            tasks.category_id, tasks.task_type, tasks.is_deleted, tasks.created_at;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog';

-- 2. RPC pour créer une version
CREATE OR REPLACE FUNCTION create_version(
  p_task_id UUID,
  p_description TEXT DEFAULT NULL,
  p_video_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  task_id UUID,
  description TEXT,
  video_url TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO versions (task_id, description, video_url)
  VALUES (p_task_id, p_description, p_video_url)
  RETURNING versions.id, versions.task_id, versions.description, versions.video_url, versions.created_at;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog';

-- 3. RPC pour créer une étape
CREATE OR REPLACE FUNCTION create_step(
  p_version_id UUID,
  p_step_order INT,
  p_step_type TEXT,
  p_content_text TEXT DEFAULT NULL,
  p_areas JSON DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  version_id UUID,
  step_order INT,
  step_type TEXT,
  content_text TEXT,
  areas JSON,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO steps (version_id, step_order, step_type, content_text, areas)
  VALUES (p_version_id, p_step_order, p_step_type, p_content_text, p_areas)
  RETURNING steps.id, steps.version_id, steps.step_order, steps.step_type, 
            steps.content_text, steps.areas, steps.created_at;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog';

-- 4. Accorder les permissions
GRANT EXECUTE ON FUNCTION create_task(TEXT, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_version(UUID, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_step(UUID, INT, TEXT, TEXT, JSON) TO authenticated, anon;

-- 5. Vérifier que les functions ont été créées
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname IN ('create_task', 'create_version', 'create_step')
ORDER BY p.proname;
