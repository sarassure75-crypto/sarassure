-- Migration: Create or verify questionnaire_attempts table structure
-- Purpose: Store learner attempts at questionnaires

CREATE TABLE IF NOT EXISTS public.questionnaire_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    percentage INTEGER NOT NULL DEFAULT 0,
    best_percentage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_task_id 
ON public.questionnaire_attempts(task_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_learner_id 
ON public.questionnaire_attempts(learner_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_task_learner 
ON public.questionnaire_attempts(task_id, learner_id);

-- Enable RLS
ALTER TABLE public.questionnaire_attempts ENABLE ROW LEVEL SECURITY;

-- Learners can only see their own attempts
CREATE POLICY "Learners can view their own attempts"
ON public.questionnaire_attempts
FOR SELECT
USING (learner_id = auth.uid());

-- Learners can insert their own attempts
CREATE POLICY "Learners can create their own attempts"
ON public.questionnaire_attempts
FOR INSERT
WITH CHECK (learner_id = auth.uid());

-- Learners can update their own attempts
CREATE POLICY "Learners can update their own attempts"
ON public.questionnaire_attempts
FOR UPDATE
USING (learner_id = auth.uid())
WITH CHECK (learner_id = auth.uid());

-- Admin can view all attempts
CREATE POLICY "Admin can view all attempts"
ON public.questionnaire_attempts
FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_questionnaire_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS questionnaire_attempts_updated_at ON public.questionnaire_attempts;
CREATE TRIGGER questionnaire_attempts_updated_at
BEFORE UPDATE ON public.questionnaire_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_questionnaire_attempts_updated_at();

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'questionnaire_attempts'
ORDER BY ordinal_position;
