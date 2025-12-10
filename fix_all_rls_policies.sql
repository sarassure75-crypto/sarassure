-- CORRECTION COMPLÈTE: Récursion infinie sur TOUTES les tables
-- Toutes les tables qui ont des foreign keys vers profiles causent des récursions

-- ============================================
-- 1. IMAGES_METADATA
-- ============================================
ALTER TABLE images_metadata DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all images" ON images_metadata;
DROP POLICY IF EXISTS "Users can insert own images" ON images_metadata;
DROP POLICY IF EXISTS "Users can update own images" ON images_metadata;
DROP POLICY IF EXISTS "Contributors can manage their images" ON images_metadata;
DROP POLICY IF EXISTS "Admins can view all images" ON images_metadata;
DROP POLICY IF EXISTS "Enable read for authenticated" ON images_metadata;

CREATE POLICY "Allow authenticated to read all images"
ON images_metadata FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated to insert images"
ON images_metadata FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to update their images"
ON images_metadata FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

ALTER TABLE images_metadata ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. VERSIONS (tasks)
-- ============================================
ALTER TABLE versions DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all versions" ON versions;
DROP POLICY IF EXISTS "Contributors can manage versions" ON versions;
DROP POLICY IF EXISTS "Enable read for authenticated" ON versions;

CREATE POLICY "Allow authenticated to read versions"
ON versions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated to insert versions"
ON versions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow contributors to update their versions"
ON versions FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CONTACT_MESSAGES
-- ============================================
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON contact_messages;
DROP POLICY IF EXISTS "Enable read for authenticated" ON contact_messages;

CREATE POLICY "Allow authenticated to read messages"
ON contact_messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow anyone to insert messages"
ON contact_messages FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to update their messages"
ON contact_messages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. FAQ_ITEMS
-- ============================================
ALTER TABLE faq_items DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for all" ON faq_items;
DROP POLICY IF EXISTS "Admins can manage FAQ" ON faq_items;

CREATE POLICY "Allow anyone to read FAQ"
ON faq_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated to manage FAQ"
ON faq_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated to update FAQ"
ON faq_items FOR UPDATE
TO authenticated
USING (true);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. TASKS
-- ============================================
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tasks" ON tasks;
DROP POLICY IF EXISTS "Contributors can manage tasks" ON tasks;

CREATE POLICY "Allow authenticated to read tasks"
ON tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated to insert tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow contributors to update tasks"
ON tasks FOR UPDATE
TO authenticated
USING (true);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. LEARNER_PROGRESS
-- ============================================
ALTER TABLE learner_progress DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON learner_progress;
DROP POLICY IF EXISTS "Trainers can view learner progress" ON learner_progress;

CREATE POLICY "Allow authenticated to read progress"
ON learner_progress FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to manage own progress"
ON learner_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Allow users to update own progress"
ON learner_progress FOR UPDATE
TO authenticated
USING (auth.uid() = learner_id);

ALTER TABLE learner_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. TRAINER_LEARNER_LINKS
-- ============================================
ALTER TABLE trainer_learner_links DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers can view their learners" ON trainer_learner_links;

CREATE POLICY "Allow authenticated to read links"
ON trainer_learner_links FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow trainers to create links"
ON trainer_learner_links FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Allow trainers to update links"
ON trainer_learner_links FOR UPDATE
TO authenticated
USING (auth.uid() = trainer_id);

ALTER TABLE trainer_learner_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
