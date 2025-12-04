-- Migration: Create questionnaire tracking tables
-- Purpose: Track learner attempts, scores, and answers to questionnaires (QCM)
-- Date: 2025-12-04

-- Table pour les tentatives de QCM par apprenant
CREATE TABLE IF NOT EXISTS questionnaire_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
  score INT DEFAULT 0,
  max_score INT DEFAULT 0,
  percentage INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  attempted_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Index for fast queries
  UNIQUE(learner_id, questionnaire_id, version_id)
);

CREATE INDEX idx_questionnaire_attempts_learner_id ON questionnaire_attempts(learner_id);
CREATE INDEX idx_questionnaire_attempts_questionnaire_id ON questionnaire_attempts(questionnaire_id);
CREATE INDEX idx_questionnaire_attempts_status ON questionnaire_attempts(status);

-- Table pour les réponses individuelles à chaque question du QCM
CREATE TABLE IF NOT EXISTS questionnaire_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES questionnaire_attempts(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  selected_choice_ids UUID[] DEFAULT '{}',  -- Array of selected choice IDs
  is_correct BOOLEAN DEFAULT FALSE,
  feedback_text TEXT,
  answered_at TIMESTAMP DEFAULT NOW(),
  
  -- Index for fast queries
  UNIQUE(attempt_id, step_id)
);

CREATE INDEX idx_questionnaire_answers_attempt_id ON questionnaire_answers(attempt_id);
CREATE INDEX idx_questionnaire_answers_step_id ON questionnaire_answers(step_id);

-- Add RLS policies for questionnaire_attempts
ALTER TABLE questionnaire_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners can view their own attempts"
  ON questionnaire_attempts FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Learners can insert their own attempts"
  ON questionnaire_attempts FOR INSERT
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Learners can update their own attempts"
  ON questionnaire_attempts FOR UPDATE
  USING (learner_id = auth.uid());

-- Add RLS policies for questionnaire_answers
ALTER TABLE questionnaire_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners can view their own answers"
  ON questionnaire_answers FOR SELECT
  USING (
    attempt_id IN (
      SELECT id FROM questionnaire_attempts WHERE learner_id = auth.uid()
    )
  );

CREATE POLICY "Learners can insert their own answers"
  ON questionnaire_answers FOR INSERT
  WITH CHECK (
    attempt_id IN (
      SELECT id FROM questionnaire_attempts WHERE learner_id = auth.uid()
    )
  );

CREATE POLICY "Learners can update their own answers"
  ON questionnaire_answers FOR UPDATE
  USING (
    attempt_id IN (
      SELECT id FROM questionnaire_attempts WHERE learner_id = auth.uid()
    )
  );
