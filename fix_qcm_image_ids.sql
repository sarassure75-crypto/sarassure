-- Migration: Fix QCM image storage - use image IDs instead of file paths
-- Date: 2025-12-08
-- Purpose: Correct image references in questionnaire_questions and questionnaire_choices

-- Clear invalid image references in questionnaire_questions
-- These contain file paths instead of image IDs
UPDATE questionnaire_questions
SET image_id = NULL,
    image_name = NULL
WHERE image_id IS NOT NULL 
  AND image_id NOT IN (SELECT id FROM app_images);

-- Clear invalid image references in questionnaire_choices
-- These contain file paths instead of image IDs  
UPDATE questionnaire_choices
SET image_id = NULL,
    image_name = NULL
WHERE image_id IS NOT NULL 
  AND image_id NOT IN (SELECT id FROM app_images);

-- Verify the cleanup
-- SELECT COUNT(*) as invalid_questions FROM questionnaire_questions WHERE image_id IS NOT NULL AND image_id NOT IN (SELECT id FROM app_images);
-- SELECT COUNT(*) as invalid_choices FROM questionnaire_choices WHERE image_id IS NOT NULL AND image_id NOT IN (SELECT id FROM app_images);
