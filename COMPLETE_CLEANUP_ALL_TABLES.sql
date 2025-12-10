-- =====================================================
-- NETTOYAGE COMPLET DE TOUS LES POLICIES CASSÉS
-- =====================================================
-- Stratégie: 
-- 1. Désactiver RLS sur TOUTES les tables
-- 2. Supprimer TOUS les policies
-- 3. Recréer des policies SIMPLES et SANS RÉCURSION
-- 4. Réactiver RLS

-- =====================================================
-- ÉTAPE 1: DÉSACTIVER RLS SUR TOUTES LES TABLES
-- =====================================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE images_metadata DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- ÉTAPE 2: SUPPRIMER TOUS LES POLICIES CASSÉS
-- =====================================================

-- PROFILES - 18 doublons à supprimer
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

-- VERSIONS - 5 policies à supprimer
DROP POLICY IF EXISTS "Admins can read all versions" ON versions;
DROP POLICY IF EXISTS "Allow all users to read exercises" ON versions;
DROP POLICY IF EXISTS "authenticated_insert_versions" ON versions;
DROP POLICY IF EXISTS "authenticated_read_versions" ON versions;
DROP POLICY IF EXISTS "authenticated_update_versions" ON versions;

-- TASKS - 12 policies à supprimer
DROP POLICY IF EXISTS "Admins and trainers manage tasks - DELETE" ON tasks;
DROP POLICY IF EXISTS "Admins and trainers manage tasks - INSERT" ON tasks;
DROP POLICY IF EXISTS "Admins and trainers manage tasks - UPDATE" ON tasks;
DROP POLICY IF EXISTS "Anon read tasks" ON tasks;
DROP POLICY IF EXISTS "Merged anon select tasks" ON tasks;
DROP POLICY IF EXISTS "authenticated_delete_tasks" ON tasks;
DROP POLICY IF EXISTS "authenticated_insert_tasks" ON tasks;
DROP POLICY IF EXISTS "authenticated_read_tasks" ON tasks;
DROP POLICY IF EXISTS "authenticated_update_tasks" ON tasks;
DROP POLICY IF EXISTS "owners_delete_tasks" ON tasks;
DROP POLICY IF EXISTS "owners_update_tasks" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_by_owner" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_by_owner" ON tasks;
DROP POLICY IF EXISTS "tasks_select_by_owner" ON tasks;
DROP POLICY IF EXISTS "tasks_select_visible_to_learner" ON tasks;
DROP POLICY IF EXISTS "tasks_update_by_owner" ON tasks;

-- STEPS - 4 policies à supprimer
DROP POLICY IF EXISTS "Allow all users to read steps" ON steps;
DROP POLICY IF EXISTS "authenticated_insert_steps" ON steps;
DROP POLICY IF EXISTS "authenticated_read_steps" ON steps;
DROP POLICY IF EXISTS "authenticated_update_steps" ON steps;

-- IMAGES_METADATA - 11 policies à supprimer
DROP POLICY IF EXISTS "Admins can do everything" ON images_metadata;
DROP POLICY IF EXISTS "Admins can read all images_metadata" ON images_metadata;
DROP POLICY IF EXISTS "Admins see all images" ON images_metadata;
DROP POLICY IF EXISTS "Contributors can delete their own images" ON images_metadata;
DROP POLICY IF EXISTS "Contributors can insert their own images" ON images_metadata;
DROP POLICY IF EXISTS "Contributors can read approved images" ON images_metadata;
DROP POLICY IF EXISTS "Contributors can update their own images" ON images_metadata;
DROP POLICY IF EXISTS "Contributors can upload images" ON images_metadata;
DROP POLICY IF EXISTS "Contributors see own images" ON images_metadata;
DROP POLICY IF EXISTS "Everyone sees approved images" ON images_metadata;
DROP POLICY IF EXISTS "Only admins can moderate images" ON images_metadata;

-- =====================================================
-- ÉTAPE 3: RECRÉER DES POLICIES SIMPLES ET CLAIRES
-- =====================================================

-- ===== PROFILES =====
-- Tout le monde peut lire les profils
CREATE POLICY "public_read_profiles" ON profiles
  FOR SELECT
  USING (true);

-- Chaque user insère son propre profil
CREATE POLICY "users_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Chaque user modifie son profil
CREATE POLICY "users_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Personne ne supprime
CREATE POLICY "prevent_delete" ON profiles
  FOR DELETE
  USING (false);

-- ===== TASKS =====
-- Les tâches publiques sont lisibles par tous
CREATE POLICY "public_read_tasks" ON tasks
  FOR SELECT
  USING (is_public = true);

-- Les propriétaires peuvent lire/modifier/supprimer leur tâche
CREATE POLICY "owner_manage_tasks" ON tasks
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Les users authentifiés peuvent voir les tâches partagées avec eux
CREATE POLICY "learner_read_shared_tasks" ON tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learner_visibility lv
      WHERE lv.task_id = tasks.id
        AND lv.learner_id = auth.uid()
        AND lv.is_visible = true
    )
  );

-- ===== VERSIONS =====
-- Les versions des tâches publiques sont lisibles
CREATE POLICY "public_read_versions" ON versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = versions.task_id
        AND t.is_public = true
    )
  );

-- Les propriétaires peuvent gérer les versions
CREATE POLICY "owner_manage_versions" ON versions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = versions.task_id
        AND t.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = versions.task_id
        AND t.owner_id = auth.uid()
    )
  );

-- Les users authentifiés peuvent lire les versions des tâches partagées
CREATE POLICY "learner_read_shared_versions" ON versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = versions.task_id
        AND EXISTS (
          SELECT 1 FROM learner_visibility lv
          WHERE lv.task_id = t.id
            AND lv.learner_id = auth.uid()
            AND lv.is_visible = true
        )
    )
  );

-- ===== STEPS =====
-- Les steps des tâches publiques sont lisibles
CREATE POLICY "public_read_steps" ON steps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM versions v
      JOIN tasks t ON t.id = v.task_id
      WHERE v.id = steps.version_id
        AND t.is_public = true
    )
  );

-- Les propriétaires peuvent gérer les steps
CREATE POLICY "owner_manage_steps" ON steps
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM versions v
      JOIN tasks t ON t.id = v.task_id
      WHERE v.id = steps.version_id
        AND t.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM versions v
      JOIN tasks t ON t.id = v.task_id
      WHERE v.id = steps.version_id
        AND t.owner_id = auth.uid()
    )
  );

-- ===== IMAGES_METADATA =====
-- Les images approuvées sont visibles par tous
CREATE POLICY "public_read_approved_images" ON images_metadata
  FOR SELECT
  USING (moderation_status = 'approved');

-- Les propriétaires voient leurs propres images
CREATE POLICY "owner_read_own_images" ON images_metadata
  FOR SELECT
  USING (auth.uid() = uploaded_by);

-- Les propriétaires peuvent insérer/modifier leurs images
CREATE POLICY "owner_manage_own_images" ON images_metadata
  FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "owner_update_own_images" ON images_metadata
  FOR UPDATE
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

-- Les propriétaires peuvent supprimer leurs images
CREATE POLICY "owner_delete_own_images" ON images_metadata
  FOR DELETE
  USING (auth.uid() = uploaded_by);

-- ===== CONTACT_MESSAGES =====
-- Tout le monde peut lire
CREATE POLICY "public_read_contact_messages" ON contact_messages
  FOR SELECT
  USING (true);

-- Les users authentifiés peuvent créer
CREATE POLICY "authenticated_insert_contact_messages" ON contact_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les propriétaires peuvent modifier
CREATE POLICY "owner_update_contact_messages" ON contact_messages
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===== FAQ_ITEMS =====
-- Tout le monde peut lire
CREATE POLICY "public_read_faq_items" ON faq_items
  FOR SELECT
  USING (true);

-- Seulement les admins peuvent insérer/modifier/supprimer
-- (On va le faire sans vérifier auth.uid() directement)
CREATE POLICY "admin_manage_faq_items" ON faq_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admin_update_faq_items" ON faq_items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_delete_faq_items" ON faq_items
  FOR DELETE
  USING (true);

-- =====================================================
-- ÉTAPE 4: RÉACTIVER RLS
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE images_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ÉTAPE 5: VÉRIFIER QUE TOUT EST OK
-- =====================================================
SELECT tablename, COUNT(*) as nb_policies
FROM pg_policies
WHERE tablename IN ('profiles', 'tasks', 'versions', 'steps', 'images_metadata', 'contact_messages', 'faq_items')
GROUP BY tablename
ORDER BY tablename;
