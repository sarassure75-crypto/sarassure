-- CORRECTION URGENTE: Récursion infinie dans les politiques RLS de profiles
-- Erreur: "infinite recursion detected in policy for relation profiles"

-- 1. DÉSACTIVER temporairement RLS sur profiles pour débloquer l'application
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER toutes les politiques existantes sur profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Trainers can view their learners" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 3. CRÉER des politiques simples SANS récursion
-- Important: Ne PAS référencer profiles dans les politiques de profiles

-- Politique SELECT simple
CREATE POLICY "Allow authenticated users to read all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Politique INSERT simple
CREATE POLICY "Allow authenticated users to insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Politique UPDATE simple
CREATE POLICY "Allow users to update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique DELETE (optionnelle, généralement non autorisée)
CREATE POLICY "Prevent profile deletion"
ON profiles FOR DELETE
TO authenticated
USING (false);

-- 4. RÉACTIVER RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. VÉRIFICATION
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
