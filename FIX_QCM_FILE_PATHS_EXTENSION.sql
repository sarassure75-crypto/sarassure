-- FIX_QCM_FILE_PATHS_EXTENSION.sql
-- Purpose: Fix QCM image file_path extension from .png to .jpg and folder from qcm/ to QCM/

-- Show current paths
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE category = 'QCM'
ORDER BY name;

-- Fix the paths: change qcm/ to QCM/ and .png to .jpg
UPDATE app_images
SET 
  file_path = 'QCM/' || SUBSTRING(file_path FROM 5) || 'pg' 
             REPLACE(file_path, 'qcm/', 'QCM/')
             REPLACE(file_path, '.png', '.jpg'),
  updated_at = NOW()
WHERE category = 'QCM'
  AND file_path LIKE 'qcm/%';

-- Verify the fix
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE category = 'QCM'
ORDER BY name;
