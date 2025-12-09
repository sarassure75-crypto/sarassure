-- FIX_QCM_IMAGE_PATHS_FINAL.sql
-- Purpose: Fix QCM image file_path values to include QCM/ prefix and .jpg extension
-- Problem: Images were stored without proper path format, causing 400/422 errors

-- First, check what we have
SELECT 
  id,
  name,
  category,
  file_path,
  CASE 
    WHEN file_path IS NULL THEN 'NULL'
    WHEN file_path = '' THEN 'EMPTY'
    WHEN file_path LIKE 'QCM/%' THEN 'CORRECT_FORMAT'
    WHEN file_path LIKE '%/%' THEN 'HAS_SLASH'
    ELSE 'JUST_FILENAME'
  END as path_status
FROM app_images
WHERE category = 'QCM'
ORDER BY created_at DESC;

-- Fix: Prepend 'QCM/' to any filename that doesn't already have it
-- This handles:
-- - 'd05a8a1d-2989-46be-be35-e5a7f66fa4b4.jpg' → 'QCM/d05a8a1d-2989-46be-be35-e5a7f66fa4b4.jpg'
-- - 'qcm/filename.jpg' → 'QCM/filename.jpg'
-- - Already correct paths stay as-is
UPDATE app_images
SET 
  file_path = CASE
    -- Already has QCM/ prefix - keep as is
    WHEN file_path LIKE 'QCM/%' THEN file_path
    -- Has qcm/ (lowercase) - convert to QCM/
    WHEN file_path LIKE 'qcm/%' THEN 'QCM/' || SUBSTRING(file_path FROM 5)
    -- Just a filename - add QCM/ prefix
    WHEN file_path NOT LIKE '%/%' AND file_path IS NOT NULL AND file_path != '' 
      THEN 'QCM/' || file_path
    -- Has other slashes (public/, etc) - extract just filename and add QCM/
    WHEN file_path LIKE '%/%' THEN 'QCM/' || SUBSTRING(file_path FROM POSITION('/' IN file_path) + 1)
    -- NULL or empty - leave as is
    ELSE file_path
  END,
  updated_at = NOW()
WHERE category = 'QCM'
  AND (
    file_path NOT LIKE 'QCM/%'
    OR file_path LIKE 'qcm/%'
    OR file_path LIKE 'public/%'
  );

-- Verify the fix
SELECT 
  id,
  name,
  category,
  file_path,
  CASE 
    WHEN file_path IS NULL THEN '❌ NULL'
    WHEN file_path = '' THEN '❌ EMPTY'
    WHEN file_path LIKE 'QCM/%' THEN '✅ CORRECT'
    ELSE '⚠️ UNEXPECTED'
  END as status
FROM app_images
WHERE category = 'QCM'
ORDER BY name;

-- Count results
SELECT 
  COUNT(*) as total_qcm_images,
  COUNT(*) FILTER (WHERE file_path LIKE 'QCM/%') as with_correct_path,
  COUNT(*) FILTER (WHERE file_path IS NULL OR file_path = '') as missing_path
FROM app_images
WHERE category = 'QCM';
