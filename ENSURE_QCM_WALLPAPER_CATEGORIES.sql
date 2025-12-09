-- ENSURE_QCM_WALLPAPER_CATEGORIES.sql
-- Purpose: Ensure QCM and wallpaper categories exist in the system

-- Check current categories
SELECT DISTINCT category FROM app_images ORDER BY category;

-- The categories should already exist since images have them.
-- But if needed, you can verify images with these categories exist:
SELECT 
  category,
  COUNT(*) as count
FROM app_images
WHERE category IN ('QCM', 'wallpaper')
GROUP BY category;

-- These should both return rows if categories exist properly.
-- If not, check that images were created with correct category values.
