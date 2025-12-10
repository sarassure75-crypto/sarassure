-- ============================================================================
-- SCRIPT: Créer les comptes de test et vérifier la cohérence des rôles
-- ============================================================================

-- 1. Vérifier tous les profils existants
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  learner_code,
  assigned_trainer_id
FROM profiles
ORDER BY 
  CASE role
    WHEN 'administrateur' THEN 1
    WHEN 'formateur' THEN 2
    WHEN 'contributeur' THEN 3
    WHEN 'apprenant' THEN 4
    ELSE 5
  END,
  email;

-- 2. Corriger les rôles mal orthographiés (contributor → contributeur)
UPDATE profiles
SET role = 'contributeur'
WHERE role = 'contributor';

-- 3. Trouver ou créer un apprenant avec le code 434684
DO $$
DECLARE
  learner_exists BOOLEAN;
  learner_id UUID;
  learner_email TEXT := 'apprenant.test@sarassure.net';
BEGIN
  -- Vérifier si un apprenant avec ce code existe
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE learner_code = '434684'
  ) INTO learner_exists;

  IF NOT learner_exists THEN
    RAISE NOTICE '⚠️ Aucun apprenant avec le code 434684 trouvé. Création...';
    
    -- Créer d'abord l'utilisateur dans auth.users
    -- Note: Ceci nécessite l'accès admin Supabase ou utiliser la fonction signup
    
    -- Pour l'instant, on va juste créer/mettre à jour le profil
    -- L'utilisateur devra être créé via l'interface de signup
    
    -- Vérifier si un profil avec cet email existe déjà
    SELECT id INTO learner_id FROM profiles WHERE email = learner_email;
    
    IF learner_id IS NULL THEN
      RAISE NOTICE 'Créer un nouvel apprenant via l''interface de signup avec:';
      RAISE NOTICE 'Email: %', learner_email;
      RAISE NOTICE 'Le code 434684 sera assigné après création';
    ELSE
      -- Mettre à jour le code apprenant existant
      UPDATE profiles
      SET learner_code = '434684',
          role = 'apprenant'
      WHERE id = learner_id;
      RAISE NOTICE '✅ Code 434684 assigné au profil existant';
    END IF;
  ELSE
    RAISE NOTICE '✅ Apprenant avec code 434684 existe déjà';
    SELECT id, email, first_name, last_name 
    FROM profiles 
    WHERE learner_code = '434684';
  END IF;
END $$;

-- 4. Créer un apprenant de test si nécessaire (via SQL direct)
-- Remplacer <UUID> par un UUID généré depuis auth.users
INSERT INTO profiles (id, email, role, first_name, last_name, learner_code)
SELECT 
  gen_random_uuid(), -- Ou utilisez l'ID depuis auth.users
  'apprenant.test@sarassure.net',
  'apprenant',
  'Apprenant',
  'Test',
  '434684'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE learner_code = '434684'
);

-- 5. Vérifier que l'admin existe avec le bon rôle
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  CASE 
    WHEN role = 'administrateur' THEN '✅ Rôle correct'
    ELSE '❌ Rôle incorrect: ' || role
  END as status
FROM profiles
WHERE email = 'admin@sarassure.net';

-- 6. Corriger le rôle admin si nécessaire
UPDATE profiles
SET role = 'administrateur',
    first_name = COALESCE(NULLIF(first_name, ''), 'Admin'),
    last_name = COALESCE(NULLIF(last_name, ''), 'SARASSURE')
WHERE email LIKE '%admin%' AND role != 'administrateur';

-- 7. Créer des comptes de test de base si manquants
-- Admin
INSERT INTO profiles (id, email, role, first_name, last_name)
SELECT 
  gen_random_uuid(),
  'admin@sarassure.net',
  'administrateur',
  'Admin',
  'SARASSURE'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@sarassure.net');

-- Formateur
INSERT INTO profiles (id, email, role, first_name, last_name)
SELECT 
  gen_random_uuid(),
  'formateur@sarassure.net',
  'formateur',
  'Formateur',
  'Test'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'formateur@sarassure.net');

-- Contributeur
INSERT INTO profiles (id, email, role, first_name, last_name)
SELECT 
  gen_random_uuid(),
  'contributeur@sarassure.net',
  'contributeur',
  'Contributeur',
  'Test'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'contributeur@sarassure.net');

-- 8. Rapport final
SELECT 
  role,
  COUNT(*) as count,
  string_agg(email, ', ') as emails
FROM profiles
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'administrateur' THEN 1
    WHEN 'formateur' THEN 2
    WHEN 'contributeur' THEN 3
    WHEN 'apprenant' THEN 4
    ELSE 5
  END;

-- 9. Liste des codes apprenants
SELECT 
  email,
  learner_code,
  first_name,
  last_name,
  assigned_trainer_id
FROM profiles
WHERE role = 'apprenant' AND learner_code IS NOT NULL
ORDER BY learner_code;

SELECT '✅ Vérification et correction des profils terminée!' as status;

-- ============================================================================
-- IMPORTANT: Synchronisation auth.users <-> profiles
-- ============================================================================
/*
Pour que les comptes fonctionnent, il faut aussi créer les utilisateurs dans auth.users.
Vous devez faire cela via:

1. L'interface de signup de l'application
2. Ou le dashboard Supabase (Authentication > Add user)
3. Ou via l'API Supabase admin

Exemple de création via l'application:
- Aller sur /register
- Créer les utilisateurs avec les emails ci-dessus
- Les profils seront automatiquement liés

Pour l'apprenant avec code 434684:
- Créer via /register avec role "apprenant"
- Mettre à jour le learner_code à 434684 dans profiles
- Mettre à jour le mot de passe à 434684 dans auth.users
*/
