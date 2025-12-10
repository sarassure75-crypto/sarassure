-- NETTOYAGE COMPLET DES POLICIES PROBLÉMATIQUES
-- Exécuter dans Supabase SQL Editor - UNE PAR UNE

-- 1. DÉSACTIVER RLS TEMPORAIREMENT
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES POLICIES DUPLIQUÉES
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public read access" ON profiles;
DROP POLICY IF EXISTS "Allow users to manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Prevent profile deletion" ON profiles;
DROP POLICY IF EXISTS "Trainers can read their learners" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "authenticated_read_profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_user_owner_delete" ON profiles;
DROP POLICY IF EXISTS "profiles_user_owner_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_user_owner_select" ON profiles;
DROP POLICY IF EXISTS "profiles_user_owner_update" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;

-- 3. CRÉER DES POLICIES SIMPLES ET SANS RÉCURSION
-- Policy pour lecture: tout le monde peut lire les profils
CREATE POLICY "public_read_profiles" ON profiles
  FOR SELECT
  USING (true);

-- Policy pour insertion: chaque user peut insérer son propre profil
CREATE POLICY "users_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy pour update: chaque user peut modifier son propre profil
CREATE POLICY "users_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy pour delete: personne ne peut supprimer
CREATE POLICY "prevent_delete" ON profiles
  FOR DELETE
  USING (false);

-- 4. RÉACTIVER RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. VÉRIFIER QUE TOUT EST OK
SELECT policyname, tablename, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
