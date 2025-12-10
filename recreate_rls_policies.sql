-- RECRÉATION DES POLITIQUES RLS CORRECTES
-- Script complet pour sécuriser correctement toutes les tables

-- ============================================
-- 1. PROFILES
-- ============================================
-- Tout le monde peut lire tous les profils (nécessaire pour les relations trainer/learner)
CREATE POLICY "authenticated_read_profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs peuvent insérer leur propre profil
CREATE POLICY "users_insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. TASKS
-- ============================================
-- Tout le monde peut lire les tâches
CREATE POLICY "authenticated_read_tasks"
ON tasks FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs authentifiés peuvent créer des tâches
CREATE POLICY "authenticated_insert_tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

-- Les propriétaires peuvent mettre à jour leurs tâches
CREATE POLICY "owners_update_tasks"
ON tasks FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id OR owner_id IS NULL);

-- Les propriétaires peuvent supprimer leurs tâches
CREATE POLICY "owners_delete_tasks"
ON tasks FOR DELETE
TO authenticated
USING (auth.uid() = owner_id OR owner_id IS NULL);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. VERSIONS
-- ============================================
-- Tout le monde peut lire les versions
CREATE POLICY "authenticated_read_versions"
ON versions FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs authentifiés peuvent créer des versions
CREATE POLICY "authenticated_insert_versions"
ON versions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Les utilisateurs peuvent mettre à jour les versions
CREATE POLICY "authenticated_update_versions"
ON versions FOR UPDATE
TO authenticated
USING (true);

ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. STEPS
-- ============================================
-- Tout le monde peut lire les étapes
CREATE POLICY "authenticated_read_steps"
ON steps FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs authentifiés peuvent créer des étapes
CREATE POLICY "authenticated_insert_steps"
ON steps FOR INSERT
TO authenticated
WITH CHECK (true);

-- Les utilisateurs peuvent mettre à jour les étapes
CREATE POLICY "authenticated_update_steps"
ON steps FOR UPDATE
TO authenticated
USING (true);

ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. USER_VERSION_PROGRESS
-- ============================================
-- Les utilisateurs peuvent lire leur propre progression
CREATE POLICY "users_read_own_progress"
ON user_version_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leur propre progression
CREATE POLICY "users_insert_own_progress"
ON user_version_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leur propre progression
CREATE POLICY "users_update_own_progress"
ON user_version_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE user_version_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. ERROR_REPORTS
-- ============================================
-- Tout le monde peut lire les rapports d'erreur
CREATE POLICY "authenticated_read_error_reports"
ON error_reports FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs peuvent créer des rapports d'erreur
CREATE POLICY "authenticated_insert_error_reports"
ON error_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Les utilisateurs peuvent mettre à jour les rapports
CREATE POLICY "authenticated_update_error_reports"
ON error_reports FOR UPDATE
TO authenticated
USING (true);

ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. FAQ_ITEMS
-- ============================================
-- Tout le monde peut lire la FAQ
CREATE POLICY "authenticated_read_faq"
ON faq_items FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs peuvent créer des items FAQ
CREATE POLICY "authenticated_insert_faq"
ON faq_items FOR INSERT
TO authenticated
WITH CHECK (true);

-- Les utilisateurs peuvent mettre à jour la FAQ
CREATE POLICY "authenticated_update_faq"
ON faq_items FOR UPDATE
TO authenticated
USING (true);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. APP_IMAGES
-- ============================================
-- Tout le monde peut lire les images
CREATE POLICY "authenticated_read_app_images"
ON app_images FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs peuvent insérer leurs propres images
CREATE POLICY "users_insert_own_images"
ON app_images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Les propriétaires peuvent mettre à jour leurs images
CREATE POLICY "owners_update_app_images"
ON app_images FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

ALTER TABLE app_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. TASK_CATEGORIES
-- ============================================
-- Tout le monde peut lire les catégories
CREATE POLICY "authenticated_read_categories"
ON task_categories FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs peuvent créer des catégories
CREATE POLICY "authenticated_insert_categories"
ON task_categories FOR INSERT
TO authenticated
WITH CHECK (true);

-- Les utilisateurs peuvent mettre à jour les catégories
CREATE POLICY "authenticated_update_categories"
ON task_categories FOR UPDATE
TO authenticated
USING (true);

ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. LEARNER_VISIBILITY
-- ============================================
-- Tout le monde peut lire la visibilité
CREATE POLICY "authenticated_read_visibility"
ON learner_visibility FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs peuvent créer des règles de visibilité
CREATE POLICY "authenticated_insert_visibility"
ON learner_visibility FOR INSERT
TO authenticated
WITH CHECK (true);

-- Les utilisateurs peuvent mettre à jour la visibilité
CREATE POLICY "authenticated_update_visibility"
ON learner_visibility FOR UPDATE
TO authenticated
USING (true);

ALTER TABLE learner_visibility ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
