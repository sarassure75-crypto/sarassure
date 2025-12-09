-- UPDATE_QCM_IMAGE_PATHS.sql
-- Purpose: Update file_path for QCM images to point to valid locations

-- Show current QCM images
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE category = 'QCM'
ORDER BY name;

-- Update QCM images to use realistic paths
UPDATE app_images
SET 
  file_path = CASE 
    WHEN name ILIKE '%Diagramme%' THEN 'qcm/diagram.png'
    WHEN name ILIKE '%Anatomique%' THEN 'qcm/anatomy.png'
    WHEN name ILIKE '%Statistiques%' THEN 'qcm/chart.png'
    WHEN name ILIKE '%Conceptuelle 1%' THEN 'qcm/concept-1.png'
    WHEN name ILIKE '%Conceptuelle 2%' THEN 'qcm/concept-2.png'
    ELSE file_path
  END,
  updated_at = NOW()
WHERE category = 'QCM'
  AND file_path NOT LIKE 'qcm/%';

-- Verify the update
SELECT 
  id,
  name,
  category,
  file_path
FROM app_images
WHERE category = 'QCM'
ORDER BY name;
