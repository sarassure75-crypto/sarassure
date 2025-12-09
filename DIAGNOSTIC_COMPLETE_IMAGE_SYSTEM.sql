-- DIAGNOSTIC_COMPLETE_IMAGE_SYSTEM.sql
-- This script diagnoses the ENTIRE image system status

-- ==============================================================================
-- SECTION 1: RAW DATABASE STATE
-- ==============================================================================

PRINT '=== SECTION 1: RAW DATABASE STATE ===';

-- Check if app_images table exists and has data
SELECT 
  'app_images table' as check_name,
  COUNT(*) as row_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ Has data' ELSE '❌ Empty' END as status
FROM app_images;

-- Show actual structure
SELECT 
  'Column Structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'app_images'
ORDER BY ordinal_position;

-- ==============================================================================
-- SECTION 2: IMAGE DATA INTEGRITY
-- ==============================================================================

PRINT '=== SECTION 2: IMAGE DATA INTEGRITY ===';

-- Every image row - check for NULL values
SELECT 
  id,
  name,
  category,
  file_path,
  description,
  created_at,
  CASE 
    WHEN file_path IS NULL THEN '❌ file_path IS NULL'
    WHEN file_path = '' THEN '❌ file_path IS EMPTY'
    WHEN LENGTH(file_path) < 5 THEN '⚠️ file_path TOO SHORT: "' || file_path || '"'
    ELSE '✅ OK'
  END as path_status,
  CASE
    WHEN name IS NULL THEN '❌ NULL'
    WHEN name = '' THEN '❌ EMPTY'
    ELSE '✅ OK'
  END as name_status
FROM app_images
ORDER BY created_at DESC
LIMIT 50;

-- Summary stats
SELECT 
  COUNT(*) as total_images,
  COUNT(*) FILTER (WHERE file_path IS NULL) as null_file_path,
  COUNT(*) FILTER (WHERE file_path = '') as empty_file_path,
  COUNT(*) FILTER (WHERE file_path IS NOT NULL AND file_path != '') as valid_file_path,
  COUNT(*) FILTER (WHERE category IS NULL) as null_category,
  COUNT(*) FILTER (WHERE category = '') as empty_category
FROM app_images;

-- ==============================================================================
-- SECTION 3: CATEGORY DISTRIBUTION
-- ==============================================================================

PRINT '=== SECTION 3: CATEGORY DISTRIBUTION ===';

SELECT 
  COALESCE(category, '(NULL)') as category,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE file_path IS NOT NULL AND file_path != '') as with_valid_path
FROM app_images
GROUP BY category
ORDER BY count DESC;

-- ==============================================================================
-- SECTION 4: FILE_PATH FORMAT ANALYSIS
-- ==============================================================================

PRINT '=== SECTION 4: FILE_PATH FORMAT ANALYSIS ===';

SELECT 
  CASE
    WHEN file_path LIKE 'QCM/%' THEN 'QCM/ prefix'
    WHEN file_path LIKE 'qcm/%' THEN 'qcm/ prefix (lowercase)'
    WHEN file_path LIKE 'wallpaper%' THEN 'wallpaper prefix'
    WHEN file_path LIKE 'public/%' THEN 'public/ prefix'
    WHEN file_path LIKE '%/%' THEN 'Has slash (other)'
    WHEN file_path IS NULL THEN 'NULL'
    WHEN file_path = '' THEN 'EMPTY'
    ELSE 'Just filename'
  END as path_format,
  COUNT(*) as count,
  GROUP_CONCAT(DISTINCT name, ', ') as example_names
FROM app_images
WHERE file_path IS NOT NULL OR file_path = ''
GROUP BY path_format
ORDER BY count DESC;

-- Show examples of each format
SELECT 
  'Sample file_paths' as info,
  name,
  file_path,
  category,
  SUBSTRING(file_path, 1, 50) as path_preview
FROM app_images
WHERE file_path IS NOT NULL
ORDER BY CASE
  WHEN file_path LIKE 'QCM/%' THEN 1
  WHEN file_path LIKE 'qcm/%' THEN 2
  WHEN file_path LIKE 'wallpaper%' THEN 3
  WHEN file_path LIKE 'public/%' THEN 4
  ELSE 5
END, name
LIMIT 20;

-- ==============================================================================
-- SECTION 5: QCM QUESTION REFERENCES
-- ==============================================================================

PRINT '=== SECTION 5: QCM QUESTION IMAGE REFERENCES ===';

-- Check questionnaire_questions
SELECT 
  'questionnaire_questions' as table_name,
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_image_ref,
  COUNT(*) FILTER (WHERE image_id IS NULL) as no_image_ref
FROM questionnaire_questions;

-- Show questions that reference images - are the references valid?
SELECT 
  qq.id as question_id,
  qq.instruction as question_text,
  qq.image_id,
  qq.image_name,
  ai.name as actual_image_name,
  ai.file_path,
  ai.category,
  CASE 
    WHEN ai.id IS NULL THEN '❌ IMAGE NOT FOUND - BROKEN REF'
    WHEN ai.file_path IS NULL THEN '⚠️ IMAGE EXISTS BUT NO FILE_PATH'
    WHEN ai.file_path = '' THEN '⚠️ IMAGE EXISTS BUT EMPTY FILE_PATH'
    ELSE '✅ Valid reference'
  END as reference_status
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id
WHERE qq.image_id IS NOT NULL
LIMIT 50;

-- ==============================================================================
-- SECTION 6: QUESTIONNAIRE_CHOICES IMAGE REFERENCES
-- ==============================================================================

PRINT '=== SECTION 6: QUESTIONNAIRE_CHOICES IMAGE REFERENCES ===';

-- Check choice images
SELECT 
  'questionnaire_choices' as table_name,
  COUNT(*) as total_choices,
  COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_image,
  COUNT(*) FILTER (WHERE image_id IS NULL) as without_image
FROM questionnaire_choices;

-- Show choice images and their status
SELECT 
  qc.id as choice_id,
  qc.text as choice_text,
  qc.image_id,
  qc.image_name,
  ai.name as actual_image_name,
  ai.file_path,
  CASE 
    WHEN ai.id IS NULL THEN '❌ BROKEN REF'
    WHEN ai.file_path IS NULL THEN '⚠️ NO FILE_PATH'
    ELSE '✅ OK'
  END as status
FROM questionnaire_choices qc
LEFT JOIN app_images ai ON qc.image_id = ai.id
WHERE qc.image_id IS NOT NULL
LIMIT 30;

-- ==============================================================================
-- SECTION 7: SPECIFIC IMAGES BY NAME
-- ==============================================================================

PRINT '=== SECTION 7: SEARCH FOR SPECIFIC IMAGES BY NAME ===';

-- Search for images the user mentioned
SELECT 
  id,
  name,
  category,
  file_path,
  created_at
FROM app_images
WHERE 
  name LIKE '%31511%'
  OR name LIKE '%google-chrome%'
  OR name LIKE '%png%'
  OR name LIKE '%tacterry%';

-- ==============================================================================
-- SECTION 8: FINAL DIAGNOSIS
-- ==============================================================================

PRINT '=== SECTION 8: DIAGNOSTIC SUMMARY ===';

-- Create a summary report
WITH stats AS (
  SELECT 
    COUNT(*) as total_imgs,
    COUNT(*) FILTER (WHERE file_path IS NULL) as null_paths,
    COUNT(*) FILTER (WHERE file_path != '' AND file_path IS NOT NULL) as valid_paths,
    COUNT(*) FILTER (WHERE category = 'QCM') as qcm_count
  FROM app_images
),
refs AS (
  SELECT
    COUNT(*) as total_refs,
    COUNT(*) FILTER (WHERE ai.id IS NOT NULL) as valid_refs,
    COUNT(*) FILTER (WHERE ai.id IS NULL) as broken_refs
  FROM questionnaire_questions qq
  LEFT JOIN app_images ai ON qq.image_id = ai.id
  WHERE qq.image_id IS NOT NULL
)
SELECT 
  'DIAGNOSTIC REPORT' as report,
  json_build_object(
    'total_images', (SELECT total_imgs FROM stats),
    'images_with_null_file_path', (SELECT null_paths FROM stats),
    'images_with_valid_file_path', (SELECT valid_paths FROM stats),
    'qcm_category_images', (SELECT qcm_count FROM stats),
    'total_image_references', (SELECT total_refs FROM refs),
    'valid_references', (SELECT valid_refs FROM refs),
    'broken_references', (SELECT broken_refs FROM refs),
    'likely_issues', CASE
      WHEN (SELECT null_paths FROM stats) > 0 THEN 'file_path NULL VALUES DETECTED - PRIMARY ISSUE'
      WHEN (SELECT qcm_count FROM stats) = 0 THEN 'NO QCM CATEGORY IMAGES - SECONDARY ISSUE'
      WHEN (SELECT broken_refs FROM refs) > 0 THEN 'BROKEN REFERENCES - DATA ISSUE'
      ELSE 'NO OBVIOUS ISSUES'
    END
  ) as diagnosis;
