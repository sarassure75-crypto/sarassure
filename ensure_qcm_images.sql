-- Migration: Ensure QCM image category exists in app_images
-- Date: 2025-12-05
-- Purpose: Add common QCM template images for question editing

-- First, rename existing 'qcm' category to 'QCM' if it exists
UPDATE app_images 
SET category = 'QCM'
WHERE LOWER(category) = 'qcm';

-- Add some common QCM image templates if they don't exist
-- These are example/template images for questionnaire creation
INSERT INTO app_images (name, category, file_path, description)
SELECT 'Téléphone - Menu Principal', 'QCM', 'qcm/phone-menu-main.png', 'Écran de menu principal d''un téléphone' WHERE NOT EXISTS (SELECT 1 FROM app_images WHERE name = 'Téléphone - Menu Principal' AND category = 'QCM')
UNION ALL
SELECT 'Téléphone - Paramètres', 'QCM', 'qcm/phone-settings.png', 'Écran des paramètres d''un téléphone' WHERE NOT EXISTS (SELECT 1 FROM app_images WHERE name = 'Téléphone - Paramètres' AND category = 'QCM')
UNION ALL
SELECT 'Icône - WiFi', 'QCM', 'qcm/icon-wifi.png', 'Icône WiFi' WHERE NOT EXISTS (SELECT 1 FROM app_images WHERE name = 'Icône - WiFi' AND category = 'QCM')
UNION ALL
SELECT 'Icône - Bluetooth', 'QCM', 'qcm/icon-bluetooth.png', 'Icône Bluetooth' WHERE NOT EXISTS (SELECT 1 FROM app_images WHERE name = 'Icône - Bluetooth' AND category = 'QCM')
UNION ALL
SELECT 'Icône - Mode Avion', 'QCM', 'qcm/icon-airplane-mode.png', 'Icône Mode Avion' WHERE NOT EXISTS (SELECT 1 FROM app_images WHERE name = 'Icône - Mode Avion' AND category = 'QCM');

-- Verify the changes
-- SELECT name, category FROM app_images WHERE category = 'QCM' ORDER BY name;
