-- FIX_QCM_IMAGES_CATEGORY.sql
-- Purpose: Update image categories so admin can find them

-- Show images that should be QCM
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE file_path LIKE '%qcm%'
  OR file_path LIKE '%diagram%'
  OR file_path LIKE '%anatomy%'
  OR file_path LIKE '%chart%'
  OR file_path LIKE '%concept%';

-- Update them to category 'QCM'
UPDATE app_images
SET 
  category = 'QCM',
  updated_at = NOW()
WHERE file_path LIKE '%qcm/%'
  OR name LIKE '%Diagram%'
  OR name LIKE '%diagram%'
  OR name LIKE '%Anatomique%'
  OR name LIKE '%Statistiques%'
  OR name LIKE '%Conceptuelle%';

-- Also ensure wallpaper images have correct category
UPDATE app_images
SET 
  category = 'wallpaper',
  updated_at = NOW()
WHERE file_path LIKE 'wallpapers/%'
  AND category != 'wallpaper';

-- Verify the fix
SELECT 
  category,
  COUNT(*) as count
FROM app_images
GROUP BY category
ORDER BY category;

-- Show QCM images now
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE category = 'QCM'
ORDER BY name;

-- Show wallpaper images
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE category = 'wallpaper'
ORDER BY name;
