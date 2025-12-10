-- URGENCE: DÉSACTIVER RLS TEMPORAIREMENT POUR DIAGNOSTIC
-- Exécuter dans Supabase SQL Editor

-- 1. Désactiver RLS sur profiles (cause probable de la récursion)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier quelles policies existent sur profiles
SELECT policyname, tablename, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 3. Vérifier la structure de la colonne creation_status
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'creation_status';

-- 4. Vérifier les policies sur toutes les autres tables
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE tablename IN ('tasks', 'versions', 'steps', 'images_metadata', 'contact_messages', 'faq_items')
ORDER BY tablename, policyname;

-- 5. Si tout est OK, réactiver RLS avec les bonnes policies
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
