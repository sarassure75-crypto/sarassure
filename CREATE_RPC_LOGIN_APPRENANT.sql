-- CRÉER UNE RPC FUNCTION SÉCURISÉE POUR LOGIN APPRENANT
-- Exécuter dans Supabase SQL Editor

-- 1. Créer la function pour récupérer le profil par learner_code
CREATE OR REPLACE FUNCTION get_profile_by_learner_code(input_learner_code TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  learner_code TEXT,
  role TEXT,
  first_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.learner_code,
    p.role,
    p.first_name
  FROM profiles p
  WHERE p.learner_code = input_learner_code
  LIMIT 1;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog';

-- 2. Accorder les permissions
GRANT EXECUTE ON FUNCTION get_profile_by_learner_code(TEXT) TO authenticated, anon;

-- 3. Vérifier que la function a été créée
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_profile_by_learner_code';
