-- CHECK_APP_IMAGES_SCHEMA.sql
-- Check the table structure and constraints

SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'app_images';

-- Check unique constraints details
SELECT 
  constraint_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'app_images'
  AND constraint_name LIKE '%unique%' OR constraint_name LIKE '%key%';

-- Count all images by name
SELECT 
  name,
  COUNT(*) as count
FROM app_images
GROUP BY name
ORDER BY count DESC
LIMIT 20;
