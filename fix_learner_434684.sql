-- Script de correction pour l'apprenant 434684
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si le profil existe
SELECT id, email, learner_code, role 
FROM profiles 
WHERE learner_code = '434684' OR email = 'apprenant-1751022150002@example.com';

-- 2. Vérifier si l'utilisateur existe dans auth.users
SELECT id, email 
FROM auth.users 
WHERE email = 'apprenant-1751022150002@example.com';

-- 3. Si le profil existe mais le code est NULL, mettre à jour
UPDATE profiles 
SET learner_code = '434684',
    role = 'apprenant'
WHERE email = 'apprenant-1751022150002@example.com';

-- 4. Si l'utilisateur n'existe pas dans auth.users, le créer
-- NOTE: Ceci doit être fait via le Dashboard Supabase Authentication
-- Aller dans: Authentication > Users > Add user
-- Email: apprenant-1751022150002@example.com
-- Password: 434684
-- Auto Confirm User: OUI

-- 5. Après création de l'utilisateur auth, vérifier que le profil a été créé automatiquement
-- Si pas créé automatiquement, créer manuellement:
-- Récupérer l'ID de l'utilisateur créé, puis:
/*
INSERT INTO profiles (id, email, role, learner_code, first_name)
VALUES (
  'UUID_DE_AUTH_USER',  -- Remplacer par l'UUID réel
  'apprenant-1751022150002@example.com',
  'apprenant',
  '434684',
  'Apprenant 434684'
)
ON CONFLICT (id) DO UPDATE 
SET learner_code = '434684',
    role = 'apprenant';
*/

-- 6. Vérification finale
SELECT 
  p.id,
  p.email,
  p.learner_code,
  p.role,
  a.email as auth_email,
  a.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users a ON a.id = p.id
WHERE p.learner_code = '434684';
