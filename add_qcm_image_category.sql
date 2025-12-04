-- Migration: Support for 'qcm' image category
-- Purpose: Add QCM image category support to existing app_images table
-- Date: 2025-12-04

-- Note: The 'qcm' category is now available as an option when uploading images.
-- Images with category='qcm' will be used for QCM questions only.

-- Verification: Check that app_images table exists and has the category column
SELECT COUNT(*) as image_count FROM app_images;

-- This category will be selected in the UI when uploading images for QCM
-- No database changes needed - the category column already supports any text value
