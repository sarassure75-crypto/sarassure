-- Migration: Allow multiple attempts for questionnaires
-- Purpose: Remove UNIQUE constraint to allow learners to retry QCM multiple times
-- Date: 2025-12-05

-- Drop the unique constraint that prevents multiple attempts
ALTER TABLE public.questionnaire_attempts 
  DROP CONSTRAINT IF EXISTS questionnaire_attempts_learner_id_questionnaire_id_version_id_key;

-- Add an index to optimize queries for attempt history
CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_learner_version 
  ON public.questionnaire_attempts(learner_id, version_id, completed_at DESC);

-- Add an index for finding best scores
CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_scores 
  ON public.questionnaire_attempts(learner_id, version_id, percentage DESC);

COMMENT ON TABLE public.questionnaire_attempts IS 'Stores all questionnaire attempts by learners. Learners can retry multiple times.';
