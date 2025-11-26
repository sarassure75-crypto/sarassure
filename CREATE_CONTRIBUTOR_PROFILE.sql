-- ============================================================================
-- CRÉER UN PROFIL CONTRIBUTEUR
-- Étapes:
-- 1. Créer l'utilisateur dans Supabase Auth
-- 2. Exécuter cette requête SQL pour créer le profil
-- ============================================================================

-- ÉTAPE 1: Créer l'utilisateur dans Supabase Auth (interface Web)
-- - Aller à: Supabase Dashboard → Authentication → Users
-- - Cliquer "Add user"
-- - Email: sara_semhoun@yahoo.fr
-- - Password: test123
-- - Cliquer "Create user"
-- - Copier l'ID généré (UUID) et le mettre à la place de 'YOUR_USER_ID_HERE'

-- ÉTAPE 2: Exécuter cette requête SQL (remplace YOUR_USER_ID_HERE par l'UUID réel)
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  pseudonym,
  role,
  created_at,
  updated_at
)
VALUES (
  'YOUR_USER_ID_HERE',  -- À remplacer par l'UUID réel de l'utilisateur créé dans Auth
  'sara_semhoun@yahoo.fr',
  'Sara',
  'Semhoun',
  'sara_contributor',  -- Pseudo optionnel
  'contributor',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  email = 'sara_semhoun@yahoo.fr',
  role = 'contributor',
  updated_at = now();

-- Vérification: afficher le profil créé
SELECT id, email, first_name, last_name, role FROM profiles 
WHERE email = 'sara_semhoun@yahoo.fr';
