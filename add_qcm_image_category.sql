-- Migration: Add 'qcm' image category
-- Purpose: Dedicate a separate image category for questionnaire (QCM) images
-- Date: 2025-12-04

-- Insert the 'qcm' category if it doesn't exist
INSERT INTO image_categories (name, description, created_at)
VALUES ('qcm', 'Images dédiées aux questionnaires (QCM)', NOW())
ON CONFLICT (name) DO NOTHING;

-- Verify the category was created
SELECT * FROM image_categories WHERE name = 'qcm';
