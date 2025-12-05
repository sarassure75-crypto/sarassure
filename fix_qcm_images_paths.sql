-- Migration: Add default QCM images that are actually available in Supabase Storage
-- Date: 2025-12-05
-- Purpose: Ensure QCM images reference files that actually exist

-- First, remove the placeholder images that don't exist
DELETE FROM app_images 
WHERE category = 'QCM' 
AND file_path LIKE 'qcm/%';

-- Add common QCM image templates with wallpaper images as placeholders
-- These reference images that should already exist from wallpapers migration
INSERT INTO app_images (name, category, file_path, description)
SELECT 'Capture Écran - Exemple 1', 'QCM', 'wallpapers/png/soft-gray.png', 'Exemple de capture d''écran (gris)' 
WHERE NOT EXISTS (SELECT 1 FROM app_images WHERE name = 'Capture Écran - Exemple 1' AND category = 'QCM')
UNION ALL
SELECT 'Capture Écran - Exemple 2', 'QCM', 'wallpapers/png/blue-gradient.png', 'Exemple de capture d''écran (bleu)'
WHERE NOT EXISTS (SELECT 1 FROM app_images WHERE name = 'Capture Écran - Exemple 2' AND category = 'QCM')
UNION ALL
SELECT 'Capture Écran - Exemple 3', 'QCM', 'wallpapers/png/forest-green.png', 'Exemple de capture d''écran (vert)'
WHERE NOT EXISTS (SELECT 1 FROM app_images WHERE name = 'Capture Écran - Exemple 3' AND category = 'QCM');

-- To add your own QCM images:
-- 1. Upload PNG/JPG files to Supabase Storage in the 'images' bucket
-- 2. Note the path (e.g., 'qcm/my-screenshot.png')
-- 3. Run: INSERT INTO app_images (name, category, file_path, description) 
--         VALUES ('My Screenshot', 'QCM', 'qcm/my-screenshot.png', 'Description');

-- Verify the images
-- SELECT name, category, file_path FROM app_images WHERE category = 'QCM' ORDER BY name;
