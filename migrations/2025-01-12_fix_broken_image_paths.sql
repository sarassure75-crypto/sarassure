-- Migration: Fix broken image paths (public/ prefix issue)
-- Reason: Some images were uploaded with 'public/filename.jpg' paths that don't exist in storage
-- These cause 404 errors. They should either be deleted or moved to correct category paths.

BEGIN;

-- First, let's identify images with problematic paths
-- These images have 'public/' in their path and don't exist in storage
DELETE FROM public.app_images
WHERE file_path LIKE 'public/%'
AND NOT EXISTS (
  SELECT 1 FROM public.app_images ai2
  WHERE ai2.category != 'default'
  AND ai2.id = app_images.id
);

-- For any remaining 'public/' paths, move them to 'default' category with corrected path
UPDATE public.app_images
SET 
  file_path = 'default/' || SUBSTRING(file_path, 8),
  category = 'default'
WHERE file_path LIKE 'public/%';

COMMIT;

-- Verification query (check results after running migration):
-- SELECT id, name, file_path, category FROM public.app_images WHERE file_path LIKE 'default/%' OR file_path LIKE 'public/%';
