-- ============================================================================
-- SCRIPT: Créer ou restaurer l'apprenant avec code 434684
-- ============================================================================

-- 1. Vérifier si l'apprenant existe déjà
SELECT 
  p.id,
  p.email,
  p.role,
  p.first_name,
  p.last_name,
  p.learner_code,
  p.assigned_trainer_id,
  CASE 
    WHEN p.learner_code = '434684' THEN '✅ Code correct'
    ELSE '❌ Code manquant ou incorrect'
  END as status
FROM profiles p
WHERE p.learner_code = '434684' OR p.email = 'apprenant434684@sarassure.net';

-- 2. Option A: Mettre à jour un profil existant pour lui donner le code 434684
-- Décommenter et ajuster l'email si vous voulez utiliser un profil existant
/*
UPDATE profiles
SET learner_code = '434684',
    role = 'apprenant'
WHERE email = 'votre.email@example.com';
*/

-- 3. Option B: Créer un nouveau profil avec le code 434684
-- Note: L'utilisateur doit d'abord exister dans auth.users
-- Vous devez le créer via l'interface signup ou le dashboard Supabase

-- Vérifier les utilisateurs auth sans profil
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_id,
  CASE 
    WHEN p.id IS NULL THEN '❌ Pas de profil'
    ELSE '✅ Profil existe'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%apprenant%' OR p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Créer le profil pour l'apprenant 434684
-- Remplacer <USER_ID> par l'ID depuis auth.users ou créer un nouvel UUID
INSERT INTO profiles (
  id,
  email,
  role,
  first_name,
  last_name,
  learner_code
)
VALUES (
  -- Soit utilisez l'ID d'un utilisateur existant depuis auth.users:
  -- (SELECT id FROM auth.users WHERE email = 'apprenant434684@sarassure.net'),
  -- Soit créez un nouvel UUID (mais alors l'utilisateur ne pourra pas se connecter):
  gen_random_uuid(),
  'apprenant434684@sarassure.net',
  'apprenant',
  'Apprenant',
  'Test 434684',
  '434684'
)
ON CONFLICT (id) DO UPDATE
SET learner_code = '434684',
    role = 'apprenant',
    email = 'apprenant434684@sarassure.net';

-- 5. Vérifier que le code a été créé
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  learner_code,
  '✅ Créé avec succès' as status
FROM profiles
WHERE learner_code = '434684';

-- 6. Créer plusieurs apprenants de test avec codes
INSERT INTO profiles (id, email, role, first_name, last_name, learner_code)
VALUES
  (gen_random_uuid(), 'apprenant1@sarassure.net', 'apprenant', 'Apprenant', 'Un', '111111'),
  (gen_random_uuid(), 'apprenant2@sarassure.net', 'apprenant', 'Apprenant', 'Deux', '222222'),
  (gen_random_uuid(), 'apprenant3@sarassure.net', 'apprenant', 'Apprenant', 'Trois', '333333'),
  (gen_random_uuid(), 'apprenant434684@sarassure.net', 'apprenant', 'Apprenant', 'Test', '434684')
ON CONFLICT (email) DO UPDATE
SET learner_code = EXCLUDED.learner_code,
    role = 'apprenant';

-- 7. Liste de tous les codes apprenants
SELECT 
  learner_code,
  email,
  first_name,
  last_name,
  assigned_trainer_id,
  created_at
FROM profiles
WHERE role = 'apprenant' AND learner_code IS NOT NULL
ORDER BY learner_code;

SELECT '✅ Apprenants créés avec succès!' as status;

-- ============================================================================
-- IMPORTANT: Pour que l'apprenant puisse se connecter
-- ============================================================================
/*
Le code apprenant sert à la fois d'identifiant et de mot de passe.

Pour créer un utilisateur fonctionnel:

1. Via le dashboard Supabase:
   - Aller dans Authentication > Users
   - Add user
   - Email: apprenant434684@sarassure.net
   - Password: 434684
   - Ensuite exécuter ce script pour créer/mettre à jour le profil

2. Via l'application (méthode recommandée):
   - Créer une fonction de création d'apprenant côté serveur
   - Qui crée à la fois l'utilisateur auth ET le profil

3. Fonction Supabase Edge Function:
   - Créer une edge function qui utilise l'API admin
   - Pour créer l'utilisateur avec le bon mot de passe

Exemple de ce qu'il faudrait faire côté application:
```javascript
// Créer l'utilisateur dans auth
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: 'apprenant434684@sarassure.net',
  password: '434684',
});

// Puis créer/mettre à jour le profil
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({
    id: authData.user.id,
    email: 'apprenant434684@sarassure.net',
    role: 'apprenant',
    first_name: 'Apprenant',
    last_name: 'Test',
    learner_code: '434684'
  });
```
*/
