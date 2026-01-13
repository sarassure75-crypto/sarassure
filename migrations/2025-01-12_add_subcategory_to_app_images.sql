-- Migration: Add subcategory column to app_images table
-- Reason: The application code references subcategory but the column doesn't exist
-- This causes 400 errors when trying to update images

BEGIN;

-- Add subcategory column to app_images
ALTER TABLE public.app_images
ADD COLUMN subcategory text DEFAULT 'général';

-- Add metadata column to store additional image information
ALTER TABLE public.app_images
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;

-- Update existing RLS policies to include new columns
-- The policies remain the same as we're not changing access rules

COMMIT;

-- Verification query (safe to run multiple times)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'app_images' 
-- ORDER BY ordinal_position;
