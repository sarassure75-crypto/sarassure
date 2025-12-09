-- CLEANUP_CORRUPTED_IMAGE_DATA.sql
-- Purpose: Fix image_id and image_name that were saved incorrectly
-- Problem: image_name contains file_path like "public/d05a8a1d..." instead of image IDs

-- ============================================
-- STEP 1: FIND AND FIX CORRUPTED QUESTION IMAGES
-- ============================================

-- Show what we're fixing
SELECT 
  qq.id,
  qq.image_id,
  qq.image_name,
  ai.id as correct_id,
  ai.file_path
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON ai.file_path LIKE '%' || RIGHT(qq.image_name, 40) || '%'
WHERE qq.image_name IS NOT NULL 
  AND qq.image_name LIKE 'public/%'
LIMIT 20;

-- Fix: Update image_id using the file_path match
UPDATE questionnaire_questions qq
SET 
  image_id = ai.id,
  image_name = ai.name,  -- Also fix image_name to be the actual image name
  updated_at = NOW()
FROM app_images ai
WHERE qq.image_name IS NOT NULL 
  AND qq.image_name LIKE 'public/%'
  AND ai.file_path LIKE '%' || RIGHT(qq.image_name, 40) || '%';

-- ============================================
-- STEP 2: FIND AND FIX CORRUPTED CHOICE IMAGES
-- ============================================

-- Show what we're fixing
SELECT 
  qc.id,
  qc.image_id,
  qc.image_name,
  ai.id as correct_id,
  ai.file_path
FROM questionnaire_choices qc
LEFT JOIN app_images ai ON ai.file_path LIKE '%' || RIGHT(qc.image_name, 40) || '%'
WHERE qc.image_name IS NOT NULL 
  AND qc.image_name LIKE 'public/%'
LIMIT 20;

-- Fix: Update image_id using the file_path match
UPDATE questionnaire_choices qc
SET 
  image_id = ai.id,
  image_name = ai.name,  -- Also fix image_name to be the actual image name
  updated_at = NOW()
FROM app_images ai
WHERE qc.image_name IS NOT NULL 
  AND qc.image_name LIKE 'public/%'
  AND ai.file_path LIKE '%' || RIGHT(qc.image_name, 40) || '%';

-- ============================================
-- STEP 3: VERIFY THE FIX
-- ============================================

-- Check questionnaire_questions
SELECT 
  'questionnaire_questions' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE image_id IS NULL) as no_image,
  COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_valid_image,
  COUNT(*) FILTER (WHERE image_id IS NOT NULL AND image_id NOT IN (SELECT id FROM app_images)) as broken_refs
FROM questionnaire_questions;

-- Check questionnaire_choices
SELECT 
  'questionnaire_choices' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE image_id IS NULL) as no_image,
  COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_valid_image,
  COUNT(*) FILTER (WHERE image_id IS NOT NULL AND image_id NOT IN (SELECT id FROM app_images)) as broken_refs
FROM questionnaire_choices;

-- ============================================
-- STEP 4: SHOW FIXED DATA
-- ============================================

-- Show sample questions with correct image data
SELECT 
  qq.id,
  qq.task_id,
  qq.instruction,
  qq.image_id,
  qq.image_name,
  ai.id as app_image_id,
  ai.name as correct_image_name,
  ai.file_path
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id
WHERE qq.image_id IS NOT NULL
LIMIT 10;

-- Show sample choices with correct image data
SELECT 
  qc.id,
  qc.question_id,
  qc.text,
  qc.image_id,
  qc.image_name,
  ai.id as app_image_id,
  ai.name as correct_image_name,
  ai.file_path
FROM questionnaire_choices qc
LEFT JOIN app_images ai ON qc.image_id = ai.id
WHERE qc.image_id IS NOT NULL
LIMIT 10;

-- Final check: Any remaining corrupted data?
SELECT COUNT(*) as remaining_corrupted_refs
FROM (
  SELECT 1 FROM questionnaire_questions WHERE image_id IS NOT NULL AND image_id NOT IN (SELECT id FROM app_images)
  UNION ALL
  SELECT 1 FROM questionnaire_choices WHERE image_id IS NOT NULL AND image_id NOT IN (SELECT id FROM app_images)
) as corrupted;
-- This should return 0
