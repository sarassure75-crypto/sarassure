-- Migration: Fix RLS policies for contributors to create versions and steps
-- Date: 2025-11-26
-- Purpose: Allow contributors to create versions and steps for their own tasks

-- DROP old policies for versions (optional, if they're too restrictive)
DROP POLICY IF EXISTS "Allow admins and trainers to manage exercises" ON public.versions;

-- NEW: Allow contributors to manage versions for their own tasks
CREATE POLICY "Contributors can manage versions for their own tasks" 
  ON public.versions 
  FOR ALL 
  USING (
    -- User is admin/trainer
    (get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text]))
    OR
    -- OR user owns the task that this version belongs to
    (task_id IN (
      SELECT id FROM public.tasks 
      WHERE owner_id = auth.uid()
    ))
  )
  WITH CHECK (
    -- User is admin/trainer
    (get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text]))
    OR
    -- OR user owns the task that this version belongs to
    (task_id IN (
      SELECT id FROM public.tasks 
      WHERE owner_id = auth.uid()
    ))
  );

-- Keep the admin/trainer policy
CREATE POLICY "Admins and trainers manage exercises" 
  ON public.versions 
  FOR ALL 
  USING ((get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text])))
  WITH CHECK ((get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text])));

-- READ policy already exists: "Allow all users to read exercises"

-- ============================================================

-- DROP old policies for steps (optional)
DROP POLICY IF EXISTS "Allow admins and trainers to manage steps" ON public.steps;

-- NEW: Allow contributors to manage steps for their own versions
CREATE POLICY "Contributors can manage steps for their own versions"
  ON public.steps
  FOR ALL
  USING (
    -- User is admin/trainer
    (get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text]))
    OR
    -- OR user owns the task that contains this version that contains this step
    (version_id IN (
      SELECT v.id FROM public.versions v
      JOIN public.tasks t ON v.task_id = t.id
      WHERE t.owner_id = auth.uid()
    ))
  )
  WITH CHECK (
    -- User is admin/trainer
    (get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text]))
    OR
    -- OR user owns the task that contains this version that contains this step
    (version_id IN (
      SELECT v.id FROM public.versions v
      JOIN public.tasks t ON v.task_id = t.id
      WHERE t.owner_id = auth.uid()
    ))
  );

-- Keep the admin/trainer policy
CREATE POLICY "Admins and trainers manage steps"
  ON public.steps
  FOR ALL
  USING ((get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text])))
  WITH CHECK ((get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text])));

-- READ policy already exists: "Allow all users to read steps"

-- ============================================================

-- NOTE: Also allow contributors to read their own tasks
-- (This might already work through the tasks RLS policy)

-- Test: After applying this migration:
-- 1. Go to Supabase SQL Editor
-- 2. Copy and paste this entire script
-- 3. Execute
-- 4. Test creating a new contribution as a non-admin user
-- 5. Should now succeed!
