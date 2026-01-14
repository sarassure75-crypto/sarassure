-- ================================================================
-- DIAGNOSTIC DES POLITIQUES RLS POUR STEPS ET VERSIONS
-- ================================================================
-- À exécuter dans l'éditeur SQL de Supabase pour diagnostiquer
-- le problème de visibilité des étapes côté apprenant
-- ================================================================

-- 1. Vérifier que RLS est activé sur les tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tasks', 'versions', 'steps')
ORDER BY tablename;

-- 2. Lister toutes les politiques RLS actives pour ces tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tasks', 'versions', 'steps')
ORDER BY tablename, policyname;

-- 3. Tester la requête avec un utilisateur spécifique
-- IMPORTANT: Remplacer USER_ID_HERE par l'ID de l'utilisateur apprenant qui a le problème
-- Pour obtenir l'ID: SELECT id, email, role FROM auth.users LIMIT 10;

-- Simuler la requête comme si on était l'utilisateur
-- SET LOCAL role TO authenticated;
-- SET LOCAL request.jwt.claims TO '{"sub":"USER_ID_HERE","role":"authenticated"}';

-- 4. Compter les steps par version
SELECT 
  v.id as version_id,
  v.title as version_title,
  COUNT(s.id) as steps_count,
  ARRAY_AGG(s.id ORDER BY s.step_order) as step_ids
FROM versions v
LEFT JOIN steps s ON s.version_id = v.id
GROUP BY v.id, v.title
ORDER BY v.created_at DESC
LIMIT 20;

-- 5. Vérifier si les steps ont bien une FK vers versions
SELECT 
  s.id as step_id,
  s.version_id,
  s.step_order,
  s.instruction,
  v.id as version_exists
FROM steps s
LEFT JOIN versions v ON v.id = s.version_id
WHERE v.id IS NULL -- Steps orphelins
LIMIT 10;

-- 6. Test de la requête imbriquée (similaire à ce que fait l'app)
-- Note: Cette requête utilise la syntaxe SQL standard, pas PostgREST
WITH task_data AS (
  SELECT 
    t.id as task_id,
    t.title as task_title,
    json_agg(
      json_build_object(
        'id', v.id,
        'title', v.title,
        'steps', (
          SELECT json_agg(
            json_build_object(
              'id', s.id,
              'step_order', s.step_order,
              'instruction', s.instruction
            ) ORDER BY s.step_order
          )
          FROM steps s
          WHERE s.version_id = v.id
        )
      ) ORDER BY v.created_at DESC
    ) as versions
  FROM tasks t
  LEFT JOIN versions v ON v.task_id = t.id
  GROUP BY t.id, t.title
)
SELECT * FROM task_data
LIMIT 5;

-- 7. Vérifier les permissions sur les fonctions qui pourraient être utilisées
SELECT 
  routine_schema,
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%step%'
ORDER BY routine_name;

-- ================================================================
-- INSTRUCTIONS
-- ================================================================
-- 1. Exécuter section par section dans l'éditeur SQL Supabase
-- 2. Noter les résultats, en particulier:
--    - La section 1 doit montrer rowsecurity = true pour les 3 tables
--    - La section 2 doit montrer les politiques pour SELECT sur steps et versions
--    - La section 4 doit montrer le nombre d'étapes par version
-- 3. Si une version a 0 steps alors qu'elle devrait en avoir, c'est un problème de données
-- 4. Si les politiques sont absentes ou restrictives, c'est un problème de RLS
-- ================================================================
