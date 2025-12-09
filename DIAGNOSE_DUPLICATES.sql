-- DIAGNOSE_DUPLICATES.sql
-- Find duplicate image names in app_images table

SELECT 
  name,
  category,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as ids
FROM app_images
GROUP BY name, category
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Show all QCM images with their paths
SELECT 
  id,
  name,
  file_path,
  category
FROM app_images
WHERE category = 'QCM'
ORDER BY name;

-- Show the image names that are causing the constraint violation
SELECT 
  name,
  COUNT(*) as how_many,
  ARRAY_AGG(DISTINCT category) as categories,
  ARRAY_AGG(DISTINCT file_path) as paths
FROM app_images
GROUP BY name
HAVING COUNT(*) > 1;
