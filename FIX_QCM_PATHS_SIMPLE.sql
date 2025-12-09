-- FIX_QCM_PATHS_SIMPLE.sql
-- Purpose: Fix all QCM image file_path to point to QCM/*.jpg in Storage

-- First, show what we have
SELECT 
  id,
  name,
  file_path
FROM app_images
WHERE category = 'QCM'
ORDER BY file_path;

-- Extract UUID from current file_path and rebuild as QCM/UUID.jpg
-- Use split_part to safely extract filename, then remove extension

UPDATE app_images
SET file_path = 'QCM/' || REGEXP_REPLACE(
  -- Get filename: everything after last /
  SPLIT_PART(file_path, '/', (LENGTH(file_path) - LENGTH(REPLACE(file_path, '/', ''))) + 1),
  '\.\w+$',  -- Replace file extension
  '.jpg'
)
WHERE category = 'QCM';

-- Verify
SELECT 
  id,
  name,
  file_path
FROM app_images
WHERE category = 'QCM'
ORDER BY file_path;
