-- Migration: Rename QCM image category from 'qcm' to 'QCM'
-- Date: 2025-12-05
-- Purpose: Update category naming to match code and be more consistent

-- Update all images with category 'qcm' to 'QCM'
UPDATE app_images 
SET category = 'QCM'
WHERE category = 'qcm';

-- Verify the update
-- SELECT COUNT(*) FROM app_images WHERE category = 'QCM';
