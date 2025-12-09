-- VERIFY_QCM_PATHS.sql
-- Check the current state of QCM image paths in the database

SELECT 
  id,
  name,
  category,
  file_path,
  created_at
FROM app_images
WHERE category = 'QCM'
ORDER BY created_at DESC;

-- Also check if there are any with wrong paths
SELECT 
  id,
  name,
  category,
  file_path,
  'WRONG PATH' as issue
FROM app_images
WHERE category = 'QCM'
  AND (
    file_path NOT LIKE 'QCM/%.jpg'
    OR file_path LIKE '%.png'
  );
