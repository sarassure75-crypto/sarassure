-- ================================================================
-- POLITIQUES RLS SÉCURISÉES POUR SARASSURE
-- ================================================================
-- Aucune récursion : utilise UNIQUEMENT auth.uid() pour les conditions
-- Permet à l'application de fonctionner tout en sécurisant les données
-- ================================================================

-- ===== 1. PROFILES - BASE UTILISATEUR =====
-- IMPORTANT: Ne PAS lire profiles dans les conditions (récursion!)
-- Utiliser UNIQUEMENT auth.uid() pour comparaisons

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;

-- Tout le monde peut lire (nécessaire pour trainer/learner links)
CREATE POLICY "authenticated_read_profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs créent leur propre profil (déclenché par trigger handle_new_user)
CREATE POLICY "users_insert_own_profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Les utilisateurs mettent à jour leur propre profil
CREATE POLICY "users_update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== 2. APP_IMAGES - Images de l'app =====
ALTER TABLE public.app_images DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_app_images" ON public.app_images;
DROP POLICY IF EXISTS "users_insert_own_images" ON public.app_images;
DROP POLICY IF EXISTS "users_update_own_images" ON public.app_images;

-- Tout le monde peut lire les images
CREATE POLICY "authenticated_read_app_images"
ON public.app_images FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs créent leurs propres images
CREATE POLICY "users_insert_own_images"
ON public.app_images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Les propriétaires mettent à jour leurs images
CREATE POLICY "users_update_own_images"
ON public.app_images FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

ALTER TABLE public.app_images ENABLE ROW LEVEL SECURITY;

-- ===== 3. TASK_CATEGORIES - Catégories =====
ALTER TABLE public.task_categories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_categories" ON public.task_categories;
DROP POLICY IF EXISTS "authenticated_insert_categories" ON public.task_categories;
DROP POLICY IF EXISTS "authenticated_update_categories" ON public.task_categories;

-- Tout le monde peut lire les catégories
CREATE POLICY "authenticated_read_categories"
ON public.task_categories FOR SELECT
TO authenticated
USING (true);

-- Admins/contributeurs créent des catégories (pas de vérification role ici, c'est côté app)
CREATE POLICY "authenticated_insert_categories"
ON public.task_categories FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins/contributeurs mettent à jour
CREATE POLICY "authenticated_update_categories"
ON public.task_categories FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

-- ===== 4. TASKS - Exercices/tâches =====
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_tasks" ON public.tasks;
DROP POLICY IF EXISTS "authenticated_insert_tasks" ON public.tasks;
DROP POLICY IF EXISTS "authenticated_update_tasks" ON public.tasks;
DROP POLICY IF EXISTS "authenticated_delete_tasks" ON public.tasks;

-- Tout le monde peut lire les tâches publiques
CREATE POLICY "authenticated_read_tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (true);

-- Les contributeurs créent des tâches
CREATE POLICY "authenticated_insert_tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

-- Les propriétaires mettent à jour leurs tâches
CREATE POLICY "authenticated_update_tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id OR owner_id IS NULL)
WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

-- Les propriétaires suppriment leurs tâches
CREATE POLICY "authenticated_delete_tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (auth.uid() = owner_id OR owner_id IS NULL);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ===== 5. VERSIONS - Versions d'exercices =====
ALTER TABLE public.versions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_versions" ON public.versions;
DROP POLICY IF EXISTS "authenticated_insert_versions" ON public.versions;
DROP POLICY IF EXISTS "authenticated_update_versions" ON public.versions;

-- Tout le monde peut lire les versions
CREATE POLICY "authenticated_read_versions"
ON public.versions FOR SELECT
TO authenticated
USING (true);

-- Les contributeurs créent des versions
CREATE POLICY "authenticated_insert_versions"
ON public.versions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Les contributeurs mettent à jour les versions
CREATE POLICY "authenticated_update_versions"
ON public.versions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;

-- ===== 6. STEPS - Étapes des exercices =====
ALTER TABLE public.steps DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_steps" ON public.steps;
DROP POLICY IF EXISTS "authenticated_insert_steps" ON public.steps;
DROP POLICY IF EXISTS "authenticated_update_steps" ON public.steps;

-- Tout le monde peut lire les étapes
CREATE POLICY "authenticated_read_steps"
ON public.steps FOR SELECT
TO authenticated
USING (true);

-- Les contributeurs créent des étapes
CREATE POLICY "authenticated_insert_steps"
ON public.steps FOR INSERT
TO authenticated
WITH CHECK (true);

-- Les contributeurs mettent à jour
CREATE POLICY "authenticated_update_steps"
ON public.steps FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;

-- ===== 7. USER_VERSION_PROGRESS - Progression utilisateur =====
ALTER TABLE public.user_version_progress DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_own_progress" ON public.user_version_progress;
DROP POLICY IF EXISTS "users_insert_own_progress" ON public.user_version_progress;
DROP POLICY IF EXISTS "users_update_own_progress" ON public.user_version_progress;

-- Les utilisateurs lisent leur propre progression
CREATE POLICY "users_read_own_progress"
ON public.user_version_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Les utilisateurs insèrent leur propre progression
CREATE POLICY "users_insert_own_progress"
ON public.user_version_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs mettent à jour leur progression
CREATE POLICY "users_update_own_progress"
ON public.user_version_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_version_progress ENABLE ROW LEVEL SECURITY;

-- ===== 8. ERROR_REPORTS - Signalements d'erreur =====
ALTER TABLE public.error_reports DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_error_reports" ON public.error_reports;
DROP POLICY IF EXISTS "authenticated_insert_error_reports" ON public.error_reports;
DROP POLICY IF EXISTS "authenticated_update_error_reports" ON public.error_reports;

-- Tout le monde peut lire les rapports
CREATE POLICY "authenticated_read_error_reports"
ON public.error_reports FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs créent leurs propres rapports
CREATE POLICY "authenticated_insert_error_reports"
ON public.error_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Les admins mettent à jour (pas de vérif role côté SQL, c'est côté app)
CREATE POLICY "authenticated_update_error_reports"
ON public.error_reports FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

-- ===== 9. ERROR_REPORTS_LOG - Log suppression erreurs =====
ALTER TABLE public.error_reports_log DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_error_reports_log" ON public.error_reports_log;
DROP POLICY IF EXISTS "authenticated_insert_error_reports_log" ON public.error_reports_log;

-- Tout le monde peut lire le log
CREATE POLICY "authenticated_read_error_reports_log"
ON public.error_reports_log FOR SELECT
TO authenticated
USING (true);

-- Les admins créent des entrées log
CREATE POLICY "authenticated_insert_error_reports_log"
ON public.error_reports_log FOR INSERT
TO authenticated
WITH CHECK (true);

ALTER TABLE public.error_reports_log ENABLE ROW LEVEL SECURITY;

-- ===== 10. FAQ_ITEMS - FAQ =====
ALTER TABLE public.faq_items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_faq" ON public.faq_items;
DROP POLICY IF EXISTS "authenticated_insert_faq" ON public.faq_items;
DROP POLICY IF EXISTS "authenticated_update_faq" ON public.faq_items;

-- Tout le monde peut lire la FAQ
CREATE POLICY "authenticated_read_faq"
ON public.faq_items FOR SELECT
TO authenticated
USING (true);

-- Les contributeurs créent des items
CREATE POLICY "authenticated_insert_faq"
ON public.faq_items FOR INSERT
TO authenticated
WITH CHECK (true);

-- Les contributeurs mettent à jour
CREATE POLICY "authenticated_update_faq"
ON public.faq_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- ===== 11. LEARNER_VISIBILITY - Visibilité des tâches =====
ALTER TABLE public.learner_visibility DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_visibility" ON public.learner_visibility;
DROP POLICY IF EXISTS "authenticated_insert_visibility" ON public.learner_visibility;
DROP POLICY IF EXISTS "authenticated_update_visibility" ON public.learner_visibility;

-- Tout le monde peut lire
CREATE POLICY "authenticated_read_visibility"
ON public.learner_visibility FOR SELECT
TO authenticated
USING (true);

-- Les formateurs/admins créent des règles
CREATE POLICY "authenticated_insert_visibility"
ON public.learner_visibility FOR INSERT
TO authenticated
WITH CHECK (true);

-- Les formateurs/admins mettent à jour
CREATE POLICY "authenticated_update_visibility"
ON public.learner_visibility FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE public.learner_visibility ENABLE ROW LEVEL SECURITY;

-- ===== 12. SATISFACTION_RESPONSES - Sondage de satisfaction =====
ALTER TABLE public.satisfaction_responses DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_satisfaction" ON public.satisfaction_responses;
DROP POLICY IF EXISTS "authenticated_insert_own_satisfaction" ON public.satisfaction_responses;
DROP POLICY IF EXISTS "authenticated_update_own_satisfaction" ON public.satisfaction_responses;

-- Tout le monde peut lire (pour calculer la moyenne)
CREATE POLICY "authenticated_read_satisfaction"
ON public.satisfaction_responses FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs insèrent leur propre réponse
CREATE POLICY "authenticated_insert_own_satisfaction"
ON public.satisfaction_responses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = learner_id);

-- Les utilisateurs mettent à jour leur réponse
CREATE POLICY "authenticated_update_own_satisfaction"
ON public.satisfaction_responses FOR UPDATE
TO authenticated
USING (auth.uid() = learner_id)
WITH CHECK (auth.uid() = learner_id);

ALTER TABLE public.satisfaction_responses ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- VÉRIFICATION FINALE
-- ================================================================
-- Affiche toutes les politiques créées
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Affiche toutes les tables avec RLS activé
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
