-- ============================================================================
-- FIX: Vérifier et corriger les politiques RLS sur la table profiles
-- ============================================================================
-- Ce script permet de s'assurer que les utilisateurs peuvent lire leur propre profil

-- 1. Vérifier si RLS est activé sur profiles
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 2. Lister toutes les politiques existantes sur profiles
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
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 3. Supprimer les anciennes politiques restrictives si elles existent
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile and contributors" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- 4. Créer une politique permissive pour permettre à chaque utilisateur de lire son propre profil
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 5. Permettre aux admins de tout voir
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'administrateur'
    )
  );

-- 6. Permettre aux formateurs de voir leurs apprenants
CREATE POLICY "Trainers can read their learners"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles trainer
      WHERE trainer.id = auth.uid() 
      AND trainer.role = 'formateur'
      AND (
        profiles.assigned_trainer_id = auth.uid()
        OR profiles.id = auth.uid()
      )
    )
  );

-- 7. Vérifier que les politiques ont été créées
SELECT 
  policyname, 
  permissive, 
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 8. Tester l'accès (à exécuter après connexion)
-- SELECT * FROM profiles WHERE id = auth.uid();

-- ============================================================================
-- Instructions complémentaires
-- ============================================================================
/*
Si le problème persiste après avoir exécuté ce script :

1. Vérifiez que l'utilisateur existe bien dans la table profiles :
   SELECT * FROM profiles WHERE email = 'admin@sarassure.net';

2. Si l'utilisateur n'existe pas, créez-le :
   INSERT INTO profiles (id, email, role, first_name, last_name)
   VALUES (
     '<user_id_from_auth>',
     'admin@sarassure.net',
     'administrateur',
     'Admin',
     'SARASSURE'
   );

3. Vérifiez que l'ID dans auth.users correspond à l'ID dans profiles :
   SELECT 
     u.id as auth_id,
     u.email as auth_email,
     p.id as profile_id,
     p.email as profile_email,
     p.role
   FROM auth.users u
   LEFT JOIN profiles p ON u.id = p.id
   WHERE u.email = 'admin@sarassure.net';

4. Si les IDs ne correspondent pas, mettez à jour :
   UPDATE profiles 
   SET id = (SELECT id FROM auth.users WHERE email = 'admin@sarassure.net')
   WHERE email = 'admin@sarassure.net';
*/

SELECT '✅ Politiques RLS mises à jour avec succès!' as status;
