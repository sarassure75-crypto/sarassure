-- COMPREHENSIVE_IMAGE_DIAGNOSIS.sql
-- Deep dive into what's ACTUALLY in the database

-- ============================================================================
-- STEP 1: Check the actual app_images table structure and data
-- ============================================================================

-- How many images total?
SELECT COUNT(*) as total_images FROM app_images;

-- What columns are in app_images?
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'app_images'
ORDER BY ordinal_position;

-- ============================================================================
-- STEP 2: Look at ALL image data - what do we actually have?
-- ============================================================================

SELECT 
  id,
  name,
  category,
  file_path,
  description,
  created_at,
  CASE 
    WHEN file_path IS NULL THEN '❌ NULL'
    WHEN file_path = '' THEN '❌ EMPTY'
    WHEN file_path LIKE '%QCM%' OR file_path LIKE '%qcm%' THEN '✅ QCM Path'
    WHEN file_path LIKE '%wallpaper%' THEN '✅ Wallpaper Path'
    WHEN file_path LIKE '%images%' THEN '✅ Has images prefix'
    WHEN file_path LIKE '%/%' THEN '✅ Has slash'
    ELSE '❓ Other format'
  END as file_path_status
FROM app_images
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- STEP 3: Categorize the problem
-- ============================================================================

-- How many images have NULL file_path?
SELECT 
  COUNT(*) as null_count,
  COUNT(*) FILTER (WHERE file_path IS NOT NULL) as valid_count
FROM app_images;

-- Break down by category
SELECT 
  category,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE file_path IS NOT NULL) as with_path,
  COUNT(*) FILTER (WHERE file_path IS NULL) as null_path,
  COUNT(*) FILTER (WHERE file_path = '') as empty_path
FROM app_images
GROUP BY category
ORDER BY count DESC;

-- ============================================================================
-- STEP 4: Look specifically at QCM images
-- ============================================================================

SELECT 
  id,
  name,
  category,
  file_path,
  created_at,
  LENGTH(file_path) as path_length
FROM app_images
WHERE category = 'QCM' OR file_path LIKE '%QCM%' OR file_path LIKE '%qcm%'
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 5: Check if images are referenced in questionnaire_questions
-- ============================================================================

-- Images actually used in QCMs
SELECT DISTINCT 
  qq.image_id,
  ai.id,
  ai.name,
  ai.file_path,
  ai.category
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id
WHERE qq.image_id IS NOT NULL
LIMIT 20;

-- Are there broken references?
SELECT 
  COUNT(*) as total_with_image_id,
  COUNT(*) FILTER (WHERE ai.id IS NOT NULL) as valid_refs,
  COUNT(*) FILTER (WHERE ai.id IS NULL) as broken_refs
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id
WHERE qq.image_id IS NOT NULL;

-- ============================================================================
-- STEP 6: Check images_metadata table (if it exists)
-- ============================================================================

-- Does images_metadata table exist?
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'images_metadata'
) as images_metadata_exists;

-- If exists, check its content
SELECT COUNT(*) as metadata_count FROM images_metadata;

SELECT 
  id,
  title,
  storage_path,
  public_url,
  category,
  created_at
FROM images_metadata
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- STEP 7: Check if the issue is file_path format
-- ============================================================================

-- Show exact file_path values (raw)
SELECT 
  id,
  name,
  file_path,
  '"' || file_path || '"' as quoted_path
FROM app_images
WHERE file_path IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- STEP 8: Summary of findings
-- ============================================================================

WITH image_stats AS (
  SELECT 
    COUNT(*) as total_images,
    COUNT(*) FILTER (WHERE file_path IS NOT NULL) as with_path,
    COUNT(*) FILTER (WHERE file_path IS NULL) as null_path,
    COUNT(*) FILTER (WHERE category = 'QCM') as qcm_count,
    COUNT(*) FILTER (WHERE category = 'wallpaper') as wallpaper_count
  FROM app_images
),
ref_stats AS (
  SELECT 
    COUNT(*) as total_refs,
    COUNT(*) FILTER (WHERE ai.id IS NOT NULL) as valid_refs
  FROM questionnaire_questions qq
  LEFT JOIN app_images ai ON qq.image_id = ai.id
  WHERE qq.image_id IS NOT NULL
)
SELECT 
  'Database Analysis' as analysis,
  json_build_object(
    'total_images', (SELECT total_images FROM image_stats),
    'images_with_path', (SELECT with_path FROM image_stats),
    'images_null_path', (SELECT null_path FROM image_stats),
    'qcm_images', (SELECT qcm_count FROM image_stats),
    'wallpaper_images', (SELECT wallpaper_count FROM image_stats),
    'qcm_references', (SELECT total_refs FROM ref_stats),
    'valid_references', (SELECT valid_refs FROM ref_stats)
  ) as data;
