-- ============================================================================
-- SCRIPT: Vérifier et créer le profil admin manquant
-- ============================================================================

-- 1. Vérifier les utilisateurs dans auth.users sans profil dans profiles
SELECT 
  u.id,
  u.email,
  u.created_at as auth_created,
  p.id as profile_id,
  p.role,
  CASE 
    WHEN p.id IS NULL THEN '❌ Profil manquant'
    ELSE '✅ Profil existe'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. Créer les profils manquants pour les utilisateurs admin
-- (Remplacez les valeurs entre <> par les vraies valeurs)
DO $$
DECLARE
  admin_user RECORD;
BEGIN
  -- Parcourir tous les utilisateurs auth sans profil
  FOR admin_user IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Déterminer le rôle basé sur l'email ou les métadonnées
    DECLARE
      user_role TEXT := 'apprenant'; -- Par défaut
      user_first_name TEXT := '';
      user_last_name TEXT := '';
    BEGIN
      -- Extraire les métadonnées si disponibles
      IF admin_user.raw_user_meta_data IS NOT NULL THEN
        user_role := COALESCE(admin_user.raw_user_meta_data->>'role', 'apprenant');
        user_first_name := COALESCE(admin_user.raw_user_meta_data->>'first_name', '');
        user_last_name := COALESCE(admin_user.raw_user_meta_data->>'last_name', '');
      END IF;

      -- Détecter admin par email
      IF admin_user.email LIKE '%admin%' THEN
        user_role := 'administrateur';
        user_first_name := COALESCE(NULLIF(user_first_name, ''), 'Admin');
        user_last_name := COALESCE(NULLIF(user_last_name, ''), 'SARASSURE');
      END IF;

      -- Insérer le profil
      INSERT INTO profiles (id, email, role, first_name, last_name)
      VALUES (
        admin_user.id,
        admin_user.email,
        user_role,
        user_first_name,
        user_last_name
      );

      RAISE NOTICE 'Profil créé pour: % (role: %)', admin_user.email, user_role;
    END;
  END LOOP;
END $$;

-- 3. Vérifier que tous les profils sont maintenant créés
SELECT 
  u.id,
  u.email,
  p.role,
  p.first_name,
  p.last_name,
  '✅ OK' as status
FROM auth.users u
INNER JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 4. Si vous connaissez l'email de l'admin, vous pouvez forcer la création :
-- INSERT INTO profiles (id, email, role, first_name, last_name)
-- SELECT 
--   id,
--   email,
--   'administrateur',
--   'Admin',
--   'SARASSURE'
-- FROM auth.users
-- WHERE email = 'admin@sarassure.net'
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'administrateur',
--     first_name = 'Admin',
--     last_name = 'SARASSURE';

SELECT '✅ Vérification et création des profils terminée!' as status;
