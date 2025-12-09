-- FIX_IMAGE_CATEGORIES.sql
-- Purpose: Update all image categories to 'QCM' for images used in questionnaires
-- Problem: Images are filtered by category='QCM' in the frontend, but database images may have different/null categories

-- STEP 1: Check current state
SELECT 
  id,
  name,
  category,
  file_path,
  created_at
FROM app_images
ORDER BY created_at DESC
LIMIT 10;

-- STEP 2: Count images by category
SELECT 
  category,
  COUNT(*) as count
FROM app_images
GROUP BY category
ORDER BY count DESC;

-- STEP 3: Update images that should be QCM (based on file_path or name patterns)
-- Update any images with QCM-related paths or that are missing categories
UPDATE app_images
SET 
  category = 'QCM',
  updated_at = NOW()
WHERE 
  category IS NULL 
  OR category = ''
  OR category != 'QCM'
  AND (
    file_path LIKE '%QCM%' 
    OR file_path LIKE '%qcm%'
    OR name LIKE '%QCM%'
    OR name LIKE '%qcm%'
    OR id IN (
      SELECT DISTINCT image_id 
      FROM questionnaire_questions 
      WHERE image_id IS NOT NULL
    )
  );

-- STEP 4: Verify fix
SELECT 
  COUNT(*) as total_qcm_images,
  COUNT(*) FILTER (WHERE file_path LIKE 'QCM/%') as with_correct_path,
  COUNT(*) FILTER (WHERE file_path NOT LIKE 'QCM/%') as needs_path_fix
FROM app_images
WHERE category = 'QCM';

-- STEP 5: Show sample of fixed images
SELECT 
  id,
  name,
  category,
  file_path,
  updated_at
FROM app_images
WHERE category = 'QCM'
ORDER BY updated_at DESC
LIMIT 5;
