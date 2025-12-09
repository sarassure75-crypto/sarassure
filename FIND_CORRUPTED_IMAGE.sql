-- FIND_CORRUPTED_IMAGE.sql
-- Find images that are referenced in questionnaires but might be problematic

-- First, show all QCM images and where they're used
SELECT 
  ai.id,
  ai.name,
  ai.file_path,
  ai.category,
  COUNT(DISTINCT qq.id) as used_in_questions,
  COUNT(DISTINCT qc.id) as used_in_choices
FROM app_images ai
LEFT JOIN questionnaire_questions qq ON qq.image_id = ai.id
LEFT JOIN questionnaire_choices qc ON qc.image_id = ai.id
WHERE ai.category = 'QCM'
GROUP BY ai.id, ai.name, ai.file_path, ai.category
ORDER BY ai.created_at DESC;

-- Show if there are any NULL or empty file_paths in QCM
SELECT 
  id,
  name,
  file_path,
  'MISSING PATH' as issue
FROM app_images
WHERE category = 'QCM'
  AND (file_path IS NULL OR file_path = '');

-- Show the specific image that's showing in admin (based on the screenshot)
SELECT 
  id,
  name,
  file_path,
  category,
  created_at
FROM app_images
WHERE category = 'QCM'
ORDER BY created_at DESC
LIMIT 10;
