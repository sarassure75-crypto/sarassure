-- VALIDATION: Ensure QCM image selection workflow is correct
-- Purpose: Verify that selected images can be loaded and displayed

-- 1. List all available images for QCM category
SELECT 
  id,
  name,
  file_path,
  category,
  created_at
FROM app_images
WHERE category = 'QCM'
ORDER BY created_at DESC;

-- 2. List all available images for wallpaper category
SELECT 
  id,
  name,
  file_path,
  category,
  created_at
FROM app_images
WHERE category = 'wallpaper'
ORDER BY created_at DESC;

-- 3. Test: Get a QCM with properly joined images
SELECT 
  qq.id,
  qq.instruction,
  qq.question_order,
  qq.image_id,
  ai.name as image_name,
  ai.file_path,
  ai.category,
  COUNT(qc.id) as choice_count,
  COUNT(CASE WHEN qc.image_id IS NOT NULL THEN 1 END) as choices_with_images
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id
LEFT JOIN questionnaire_choices qc ON qq.id = qc.question_id
GROUP BY qq.id, qq.instruction, qq.question_order, qq.image_id, ai.name, ai.file_path, ai.category
ORDER BY qq.question_order;

-- 4. Verify choice images load correctly
SELECT 
  qc.id,
  qc.text,
  qc.choice_order,
  qc.image_id,
  ai.name as image_name,
  ai.file_path,
  ai.category,
  qc.is_correct,
  qq.instruction as question_instruction
FROM questionnaire_choices qc
LEFT JOIN app_images ai ON qc.image_id = ai.id
LEFT JOIN questionnaire_questions qq ON qc.question_id = qq.id
WHERE qc.image_id IS NOT NULL
ORDER BY qq.id, qc.choice_order;

-- 5. Check for ANY remaining broken references after cleanup
SELECT 
  'BROKEN_QUESTION_IMAGES' as issue_type,
  COUNT(*) as count
FROM questionnaire_questions
WHERE image_id IS NOT NULL
  AND image_id NOT IN (SELECT id FROM app_images)

UNION ALL

SELECT 
  'BROKEN_CHOICE_IMAGES' as issue_type,
  COUNT(*) as count
FROM questionnaire_choices
WHERE image_id IS NOT NULL
  AND image_id NOT IN (SELECT id FROM app_images);
