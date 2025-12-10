-- =====================================================
-- NETTOYAGE COMPLET - VERSION FINALE
-- =====================================================

-- ===== PROFILES =====
DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
DROP POLICY IF EXISTS "users_insert_own" ON profiles;
DROP POLICY IF EXISTS "users_update_own" ON profiles;
DROP POLICY IF EXISTS "prevent_delete" ON profiles;

-- Recréer
CREATE POLICY "public_read_profiles" ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "users_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "prevent_delete" ON profiles
  FOR DELETE
  USING (false);

-- ===== TASKS =====
DROP POLICY IF EXISTS "public_read_tasks" ON tasks;
DROP POLICY IF EXISTS "owner_manage_tasks" ON tasks;
DROP POLICY IF EXISTS "learner_read_shared_tasks" ON tasks;

CREATE POLICY "public_read_tasks" ON tasks
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "owner_manage_tasks" ON tasks
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

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
DROP POLICY IF EXISTS "public_read_versions" ON versions;
DROP POLICY IF EXISTS "owner_manage_versions" ON versions;
DROP POLICY IF EXISTS "learner_read_shared_versions" ON versions;

CREATE POLICY "public_read_versions" ON versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = versions.task_id
        AND t.is_public = true
    )
  );

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
DROP POLICY IF EXISTS "public_read_steps" ON steps;
DROP POLICY IF EXISTS "owner_manage_steps" ON steps;

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
DROP POLICY IF EXISTS "public_read_approved_images" ON images_metadata;
DROP POLICY IF EXISTS "owner_read_own_images" ON images_metadata;
DROP POLICY IF EXISTS "owner_manage_own_images" ON images_metadata;
DROP POLICY IF EXISTS "owner_update_own_images" ON images_metadata;
DROP POLICY IF EXISTS "owner_delete_own_images" ON images_metadata;

CREATE POLICY "public_read_approved_images" ON images_metadata
  FOR SELECT
  USING (moderation_status = 'approved');

CREATE POLICY "owner_read_own_images" ON images_metadata
  FOR SELECT
  USING (auth.uid() = uploaded_by);

CREATE POLICY "owner_manage_own_images" ON images_metadata
  FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "owner_update_own_images" ON images_metadata
  FOR UPDATE
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "owner_delete_own_images" ON images_metadata
  FOR DELETE
  USING (auth.uid() = uploaded_by);

-- ===== FAQ_ITEMS =====
DROP POLICY IF EXISTS "admin_manage_faq_items" ON faq_items;
DROP POLICY IF EXISTS "admin_update_faq_items" ON faq_items;
DROP POLICY IF EXISTS "admin_delete_faq_items" ON faq_items;
DROP POLICY IF EXISTS "public_read_faq_items" ON faq_items;

CREATE POLICY "public_read_faq_items" ON faq_items
  FOR SELECT
  USING (true);

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

-- ===== VÉRIFICATION =====
SELECT tablename, COUNT(*) as nb_policies
FROM pg_policies
WHERE tablename IN ('profiles', 'tasks', 'versions', 'steps', 'images_metadata', 'faq_items')
GROUP BY tablename
ORDER BY tablename;
