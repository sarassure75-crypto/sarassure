-- Migration: Fix invalid creation_status values
-- Purpose: Correct any invalid status values that don't match the CHECK constraint
-- Date: 2025-12-05

-- VERSIONS TABLE (creation_status is TEXT)
-- Update any NULL or invalid statuses to 'draft' in versions table
UPDATE public.versions
SET creation_status = 'draft'
WHERE creation_status IS NULL 
   OR creation_status NOT IN ('draft', 'pending', 'needs_changes', 'validated', 'rejected');

-- Update any 'published' status to 'validated' in versions table
UPDATE public.versions
SET creation_status = 'validated'
WHERE creation_status = 'published';

-- TASKS TABLE (creation_status is JSONB)
-- Update any NULL or invalid statuses to 'draft' in tasks table
UPDATE public.tasks
SET creation_status = '"draft"'::jsonb
WHERE creation_status IS NULL 
   OR creation_status::text NOT IN ('"draft"', '"pending"', '"needs_changes"', '"validated"', '"rejected"');

-- Update any 'published' status to 'validated' in tasks table
UPDATE public.tasks
SET creation_status = '"validated"'::jsonb
WHERE creation_status::text = '"published"';

-- Verify the fix for VERSIONS
SELECT 
  'versions' as table_name,
  creation_status as status,
  COUNT(*) as count
FROM public.versions
GROUP BY creation_status
UNION ALL
-- Verify the fix for TASKS
SELECT 
  'tasks' as table_name,
  TRIM(creation_status::text, '"') as status,
  COUNT(*) as count
FROM public.tasks
GROUP BY creation_status
ORDER BY table_name, status;
