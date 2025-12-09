-- CLEANUP: Fix broken image references in QCM tables
-- Purpose: Remove or clean up invalid image_id references

-- 1. Find and log broken question images
SELECT 
  qq.id,
  qq.image_id,
  qq.image_name,
  'WILL_BE_SET_TO_NULL' as action
FROM questionnaire_questions qq
WHERE qq.image_id IS NOT NULL
  AND qq.image_id NOT IN (
    SELECT id FROM app_images WHERE id = qq.image_id
  );

-- 2. Find and log broken choice images  
SELECT 
  qc.id,
  qc.image_id,
  qc.image_name,
  'WILL_BE_SET_TO_NULL' as action
FROM questionnaire_choices qc
WHERE qc.image_id IS NOT NULL
  AND qc.image_id NOT IN (
    SELECT id FROM app_images WHERE id = qc.image_id
  );

-- 3. Clean up broken question images (set to NULL)
UPDATE questionnaire_questions qq
SET 
  image_id = NULL,
  image_name = NULL,
  updated_at = NOW()
WHERE qq.image_id IS NOT NULL
  AND qq.image_id NOT IN (
    SELECT id FROM app_images
  );

-- 4. Clean up broken choice images (set to NULL)
UPDATE questionnaire_choices qc
SET 
  image_id = NULL,
  image_name = NULL,
  updated_at = NOW()
WHERE qc.image_id IS NOT NULL
  AND qc.image_id NOT IN (
    SELECT id FROM app_images
  );

-- 5. Verify cleanup
SELECT 
  'questionnaire_questions' as table_name,
  COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_images,
  COUNT(*) FILTER (WHERE image_id IS NULL) as without_images
FROM questionnaire_questions

UNION ALL

SELECT 
  'questionnaire_choices' as table_name,
  COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_images,
  COUNT(*) FILTER (WHERE image_id IS NULL) as without_images
FROM questionnaire_choices;
