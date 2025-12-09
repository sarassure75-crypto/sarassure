-- Diagnostic: Check current state of QCM images
-- Purpose: Identify corrupted or missing image references

-- 1. Check questionnaire_questions with images
SELECT 
  qq.id as question_id,
  qq.task_id,
  qq.instruction,
  qq.image_id,
  qq.image_name,
  ai.id as app_image_id,
  ai.name as app_image_name,
  ai.file_path,
  ai.category,
  CASE 
    WHEN qq.image_id IS NULL THEN 'No image selected'
    WHEN ai.id IS NULL THEN 'Image ID not found in app_images (BROKEN)'
    WHEN ai.file_path IS NULL THEN 'File path missing (BROKEN)'
    ELSE 'Valid'
  END as status
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id
ORDER BY qq.task_id, qq.question_order;

-- 2. Check questionnaire_choices with images
SELECT 
  qc.id as choice_id,
  qc.question_id,
  qc.text,
  qc.image_id,
  qc.image_name,
  ai.id as app_image_id,
  ai.name as app_image_name,
  ai.file_path,
  ai.category,
  CASE 
    WHEN qc.image_id IS NULL THEN 'No image selected'
    WHEN ai.id IS NULL THEN 'Image ID not found in app_images (BROKEN)'
    WHEN ai.file_path IS NULL THEN 'File path missing (BROKEN)'
    ELSE 'Valid'
  END as status
FROM questionnaire_choices qc
LEFT JOIN app_images ai ON qc.image_id = ai.id
WHERE qc.image_id IS NOT NULL
ORDER BY qc.question_id, qc.choice_order;

-- 3. Summary: Count broken references
SELECT 
  'questionnaire_questions' as table_name,
  COUNT(*) as total_with_image,
  COUNT(*) FILTER (WHERE app_images.id IS NULL) as broken_count
FROM questionnaire_questions qq
LEFT JOIN app_images ON qq.image_id = app_images.id
WHERE qq.image_id IS NOT NULL

UNION ALL

SELECT 
  'questionnaire_choices' as table_name,
  COUNT(*) as total_with_image,
  COUNT(*) FILTER (WHERE app_images.id IS NULL) as broken_count
FROM questionnaire_choices qc
LEFT JOIN app_images ON qc.image_id = app_images.id
WHERE qc.image_id IS NOT NULL;

-- 4. Check app_images for QCM and wallpaper categories
SELECT 
  category,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE file_path IS NULL OR file_path = '') as missing_paths
FROM app_images
WHERE category IN ('QCM', 'wallpaper')
GROUP BY category;
