-- ================================================================
-- DIAGNOSTIC SUPABASE - Vérifier que tout fonctionne
-- ================================================================
-- Exécute cette requête dans Supabase SQL Editor

-- 1. Vérifier que get_user_profile existe et fonctionne
SELECT 
  n.nspname,
  p.proname,
  p.prosecdef,
  (regexp_matches(pg_get_functiondef(p.oid), 'SET search_path = [^,;]+', 'g'))[1] as search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname = 'get_user_profile'
ORDER BY p.proname;

-- 2. Vérifier les RLS policies sur profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 3. Vérifier que les 4 tables ont RLS
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('contact_messages', 'images_metadata', 'questionnaire_attempts', 'questionnaire_questions', 'profiles')
ORDER BY tablename;

-- 4. Vérifier les functions critiques
SELECT 
  p.proname,
  p.prosecdef,
  (regexp_matches(pg_get_functiondef(p.oid), 'SET search_path = [^,;]+', 'g'))[1] as search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN (
    'get_user_profile',
    'get_my_role',
    'current_user_id',
    'current_user_role',
    'handle_new_user'
  )
ORDER BY p.proname;

-- 5. Compter les policies totales
SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';

-- 6. Tester l'authentification (remplace UUID par un vrai user_id)
-- SELECT * FROM public.profiles LIMIT 1; -- D'abord récupérer un ID

-- ================================================================
-- Si tous les checks passent, le problème vient du frontend
-- Si get_user_profile n'existe pas, réexécuter 2025-12-10_COMPLETE_FIX_ALL.sql
-- ================================================================
