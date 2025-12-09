-- MIGRATE_PUBLIC_IMAGES_TO_CATEGORY.sql
-- Move images from public/ folder path to their correct category folder
-- For images that have a category set but file_path points to public/

UPDATE app_images
SET file_path = CASE
  WHEN category IN ('QCM', 'wallpaper', 'Pictogramme', 'Capture D''écran') 
    THEN category || '/' || RIGHT(file_path, LENGTH(file_path) - POSITION('/' IN file_path))
  ELSE file_path
END
WHERE file_path LIKE 'public/%'
  AND category != 'default'
  AND category IS NOT NULL;

-- Verify the changes
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE file_path LIKE 'public/%'
  OR (category = 'QCM' AND file_path NOT LIKE 'QCM/%')
ORDER BY category, created_at DESC;
