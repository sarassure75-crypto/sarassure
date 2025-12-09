-- DIAGNOSTIC_QCM_IMAGES.sql
-- Check what's really in the database

-- 1. How many images exist in app_images?
SELECT 
  COUNT(*) as total_images,
  COUNT(*) FILTER (WHERE category = 'QCM') as qcm_images,
  COUNT(*) FILTER (WHERE category = 'wallpaper') as wallpaper_images,
  COUNT(*) FILTER (WHERE category IS NULL) as null_category
FROM app_images;

-- 2. Show all app_images with their categories
SELECT 
  id,
  name,
  category,
  file_path,
  created_at
FROM app_images
ORDER BY category, name;

-- 3. How many questionnaires exist?
SELECT 
  COUNT(*) as total_qcm,
  COUNT(*) FILTER (WHERE task_type = 'questionnaire') as questionnaire_type
FROM tasks;

-- 4. How many questions exist?
SELECT 
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_images,
  COUNT(*) FILTER (WHERE image_id IS NULL) as without_images
FROM questionnaire_questions;

-- 5. Show sample questions
SELECT 
  qq.id,
  qq.task_id,
  qq.instruction,
  qq.image_id,
  qq.image_name
FROM questionnaire_questions qq
LIMIT 5;

-- 6. Try the JOIN that should work
SELECT 
  qq.id,
  qq.instruction,
  qq.image_id,
  ai.name as image_name,
  ai.file_path
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id
LIMIT 5;
