-- AUTO_FIX_QCM_IMAGES.sql
-- Purpose: Automated diagnostic and fix for QCM image issues
-- Run this ONE script to fix everything automatically

-- ============================================
-- PHASE 1: DIAGNOSTIC (Read-only)
-- ============================================

-- Show current state
WITH image_status AS (
  SELECT 
    'questionnaire_questions' as table_name,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE image_id IS NULL) as no_image,
    COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_image,
    COUNT(*) FILTER (WHERE image_id IS NOT NULL AND image_id NOT IN (SELECT id FROM app_images)) as broken
  FROM questionnaire_questions
  
  UNION ALL
  
  SELECT 
    'questionnaire_choices' as table_name,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE image_id IS NULL) as no_image,
    COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_image,
    COUNT(*) FILTER (WHERE image_id IS NOT NULL AND image_id NOT IN (SELECT id FROM app_images)) as broken
  FROM questionnaire_choices
)
SELECT * FROM image_status;

-- ============================================
-- PHASE 2: ENSURE IMAGES EXIST
-- ============================================

-- Add QCM images if missing
INSERT INTO app_images (name, description, category, file_path)
VALUES
  ('Question avec Diagramme', 'Diagramme pour QCM', 'QCM', 'qcm/diagram.png'),
  ('Schéma Anatomique', 'Schéma anatomique pour QCM', 'QCM', 'qcm/anatomy.png'),
  ('Graphique Statistiques', 'Graphique pour QCM', 'QCM', 'qcm/chart.png'),
  ('Image Conceptuelle 1', 'Image conceptuelle pour QCM', 'QCM', 'qcm/concept-1.png'),
  ('Image Conceptuelle 2', 'Image conceptuelle pour QCM', 'QCM', 'qcm/concept-2.png')
ON CONFLICT (name) DO NOTHING;

-- Add wallpaper images if missing
INSERT INTO app_images (name, description, category, file_path)
VALUES
  ('Fond Bleu Dégradé', 'Fond d''écran bleu avec dégradé', 'wallpaper', 'wallpapers/png/blue-gradient.png'),
  ('Fond Gris Doux', 'Fond d''écran gris doux', 'wallpaper', 'wallpapers/png/soft-gray.png'),
  ('Fond Vert Forêt', 'Fond d''écran vert forêt', 'wallpaper', 'wallpapers/png/forest-green.png'),
  ('Fond Rose Pastel', 'Fond d''écran rose pastel', 'wallpaper', 'wallpapers/png/pink-pastel.png'),
  ('Fond Orange Sunset', 'Fond d''écran orange coucher de soleil', 'wallpaper', 'wallpapers/png/orange-sunset.png')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PHASE 3: CLEANUP BROKEN REFERENCES
-- ============================================

-- Clean broken question images
UPDATE questionnaire_questions qq
SET 
  image_id = NULL,
  image_name = NULL,
  updated_at = NOW()
WHERE qq.image_id IS NOT NULL
  AND qq.image_id NOT IN (
    SELECT id FROM app_images
  );

-- Clean broken choice images
UPDATE questionnaire_choices qc
SET 
  image_id = NULL,
  image_name = NULL,
  updated_at = NOW()
WHERE qc.image_id IS NOT NULL
  AND qc.image_id NOT IN (
    SELECT id FROM app_images
  );

-- ============================================
-- PHASE 4: VALIDATE FINAL STATE
-- ============================================

-- Check final status
WITH final_status AS (
  SELECT 
    'questionnaire_questions' as table_name,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE image_id IS NULL) as no_image,
    COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_image,
    COUNT(*) FILTER (WHERE image_id IS NOT NULL AND image_id NOT IN (SELECT id FROM app_images)) as broken
  FROM questionnaire_questions
  
  UNION ALL
  
  SELECT 
    'questionnaire_choices' as table_name,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE image_id IS NULL) as no_image,
    COUNT(*) FILTER (WHERE image_id IS NOT NULL) as with_image,
    COUNT(*) FILTER (WHERE image_id IS NOT NULL AND image_id NOT IN (SELECT id FROM app_images)) as broken
  FROM questionnaire_choices
)
SELECT * FROM final_status;

-- Show available images for selection
SELECT 
  id,
  name,
  category,
  file_path,
  created_at
FROM app_images
WHERE category IN ('QCM', 'wallpaper')
  AND file_path IS NOT NULL
ORDER BY category, name;

-- Verify a sample QCM can be loaded
SELECT 
  qq.id,
  qq.instruction,
  qq.image_id,
  ai.name as image_name,
  ai.file_path,
  ai.category,
  COUNT(qc.id) as choice_count,
  COUNT(CASE WHEN qc.image_id IS NOT NULL THEN 1 END) as choices_with_images
FROM questionnaire_questions qq
LEFT JOIN app_images ai ON qq.image_id = ai.id
LEFT JOIN questionnaire_choices qc ON qq.id = qc.question_id
GROUP BY qq.id, qq.instruction, qq.image_id, ai.name, ai.file_path, ai.category
LIMIT 5;

-- Final confirmation: 0 broken references
SELECT COUNT(*) as remaining_broken_references
FROM (
  SELECT 1
  FROM questionnaire_questions
  WHERE image_id IS NOT NULL
    AND image_id NOT IN (SELECT id FROM app_images)
  
  UNION ALL
  
  SELECT 1
  FROM questionnaire_choices
  WHERE image_id IS NOT NULL
    AND image_id NOT IN (SELECT id FROM app_images)
) as broken;
-- This should return 0
