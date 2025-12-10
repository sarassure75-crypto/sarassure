-- DIAGNOSTIC COMPLET AUTHENTIFICATION APPRENANT
-- Exécuter dans Supabase SQL Editor

-- 1. Vérifier que get_user_profile existe et est correctement configurée
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_user_profile'
LIMIT 1;

-- 2. Vérifier que get_my_role existe
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_my_role'
LIMIT 1;

-- 3. Vérifier les utilisateurs apprenants
SELECT id, email, raw_user_meta_data, created_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'apprenant'
LIMIT 10;

-- 4. Vérifier les profils apprenants
SELECT id, email, learner_code, role, first_name, assigned_trainer_id
FROM profiles
WHERE role = 'apprenant'
LIMIT 10;

-- 5. Vérifier les politiques RLS sur profiles
SELECT *
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY schemaname, tablename, policyname;

-- 6. Vérifier si RLS est activé sur la table profiles
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 7. Vérifier les erreurs d'authentification récentes
SELECT id, email, last_sign_in_at, created_at
FROM auth.users
WHERE created_at > NOW() - INTERVAL '24 hours'
LIMIT 20;

-- 8. Compter les apprenants actifs
SELECT 
  COUNT(*) as total_apprenants,
  SUM(CASE WHEN last_sign_in_at IS NOT NULL THEN 1 ELSE 0 END) as apprenants_connectes
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'apprenant';
