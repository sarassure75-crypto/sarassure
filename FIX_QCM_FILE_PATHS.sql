-- FIX_QCM_FILE_PATHS.sql
-- Purpose: Fix QCM image file_path from "public/UUID.png" to "qcm/UUID.png"

-- Show current broken paths
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE category = 'QCM'
  AND file_path LIKE 'public/%'
ORDER BY name;

-- Fix the paths
UPDATE app_images
SET 
  file_path = 'qcm/' || SUBSTRING(file_path FROM 8),  -- Remove "public/" and replace with "qcm/"
  updated_at = NOW()
WHERE category = 'QCM'
  AND file_path LIKE 'public/%';

-- Verify the fix
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE category = 'QCM'
ORDER BY name;
