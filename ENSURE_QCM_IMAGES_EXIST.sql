-- ENSURE_QCM_IMAGES_EXIST.sql
-- Purpose: Ensure that basic QCM and wallpaper images are available for selection

-- 1. Check current QCM images
SELECT COUNT(*) as qcm_image_count FROM app_images WHERE category = 'QCM';
SELECT COUNT(*) as wallpaper_count FROM app_images WHERE category = 'wallpaper';

-- 2. Insert sample QCM images if they don't exist
-- These serve as templates for admin to use when creating questionnaires

INSERT INTO app_images (name, category, file_path)
VALUES
  ('Question avec Diagramme', 'QCM', 'qcm/diagram.png'),
  ('Schéma Anatomique', 'QCM', 'qcm/anatomy.png'),
  ('Graphique Statistiques', 'QCM', 'qcm/chart.png'),
  ('Image Conceptuelle 1', 'QCM', 'qcm/concept-1.png'),
  ('Image Conceptuelle 2', 'QCM', 'qcm/concept-2.png')
ON CONFLICT (name) DO NOTHING;

-- 3. Ensure wallpaper images exist
INSERT INTO app_images (name, category, file_path)
VALUES
  ('Fond Bleu Dégradé', 'wallpaper', 'wallpapers/png/blue-gradient.png'),
  ('Fond Gris Doux', 'wallpaper', 'wallpapers/png/soft-gray.png'),
  ('Fond Vert Forêt', 'wallpaper', 'wallpapers/png/forest-green.png'),
  ('Fond Rose Pastel', 'wallpaper', 'wallpapers/png/pink-pastel.png'),
  ('Fond Orange Sunset', 'wallpaper', 'wallpapers/png/orange-sunset.png')
ON CONFLICT (name) DO NOTHING;

-- 4. Verify what we have
SELECT 
  category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE file_path IS NOT NULL) as with_path,
  COUNT(*) FILTER (WHERE file_path IS NULL) as missing_path
FROM app_images
WHERE category IN ('QCM', 'wallpaper')
GROUP BY category;

-- 5. List all available images for selection
SELECT 
  id,
  name,
  category,
  file_path,
  created_at
FROM app_images
WHERE category IN ('QCM', 'wallpaper')
ORDER BY category, name;
