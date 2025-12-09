-- FIX_QCM_FILE_PATHS_FINAL.sql
-- Purpose: Fix all QCM image file_path to match actual Storage location
-- All QCM images are in QCM/ folder with .jpg extension

-- Show current paths before fix
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE category = 'QCM'
ORDER BY name;

-- Fix ALL QCM image paths to use QCM/ folder and .jpg extension
UPDATE app_images
SET 
  file_path = 'QCM/' || (
    -- Extract the UUID part (everything after the last /)
    CASE 
      WHEN file_path LIKE '%/%' THEN SUBSTRING(file_path FROM POSITION('/' IN REVERSE(file_path)) + 1)
      ELSE file_path
    END
  ) || '.jpg',
  updated_at = NOW()
WHERE category = 'QCM';

-- Simpler approach: just replace the path directly
UPDATE app_images
SET 
  file_path = REPLACE(REPLACE(file_path, 'qcm/', 'QCM/'), 'public/', 'QCM/'),
  updated_at = NOW()
WHERE category = 'QCM';

-- Then ensure all end with .jpg
UPDATE app_images
SET 
  file_path = CASE 
    WHEN file_path NOT LIKE '%.jpg' THEN 
      CASE 
        WHEN file_path LIKE '%.png' THEN REPLACE(file_path, '.png', '.jpg')
        ELSE file_path || '.jpg'
      END
    ELSE file_path
  END,
  updated_at = NOW()
WHERE category = 'QCM';

-- Verify the fix
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE category = 'QCM'
ORDER BY name;
