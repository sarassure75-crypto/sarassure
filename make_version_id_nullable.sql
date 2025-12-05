-- Migration: Make version_id nullable in questionnaire_attempts
-- Purpose: Allow questionnaires to be saved without a version_id

-- Make version_id column nullable
ALTER TABLE public.questionnaire_attempts
ALTER COLUMN version_id DROP NOT NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'questionnaire_attempts'
ORDER BY ordinal_position;
