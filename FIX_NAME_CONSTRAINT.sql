-- FIX_NAME_CONSTRAINT.sql
-- Remove the problematic unique constraint on just 'name'
-- and replace it with a composite constraint on (name, category)

-- First, drop the old constraint
ALTER TABLE app_images 
DROP CONSTRAINT IF EXISTS app_images_name_key;

-- Create a new composite unique constraint
ALTER TABLE app_images 
ADD CONSTRAINT app_images_name_category_key UNIQUE (name, category);
