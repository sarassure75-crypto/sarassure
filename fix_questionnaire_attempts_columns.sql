-- Migration: Fix questionnaire_attempts table structure
-- Purpose: Add missing task_id column and ensure proper structure

-- First, check the current structure by describing the table
-- Then add missing columns if they don't exist

-- Add task_id column if it doesn't exist
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Add learner_id column if it doesn't exist
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add percentage column if it doesn't exist
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS percentage INTEGER DEFAULT 0;

-- Add best_percentage column if it doesn't exist
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS best_percentage INTEGER DEFAULT 0;

-- Add status column if it doesn't exist
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed'));

-- Add attempted_at column if it doesn't exist
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add created_at column if it doesn't exist
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add updated_at column if it doesn't exist
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create or recreate indexes
CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_task_id 
ON public.questionnaire_attempts(task_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_learner_id 
ON public.questionnaire_attempts(learner_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_task_learner 
ON public.questionnaire_attempts(task_id, learner_id);

-- Ensure RLS is enabled
ALTER TABLE public.questionnaire_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Learners can view their own attempts" ON public.questionnaire_attempts;
DROP POLICY IF EXISTS "Learners can create their own attempts" ON public.questionnaire_attempts;
DROP POLICY IF EXISTS "Learners can update their own attempts" ON public.questionnaire_attempts;
DROP POLICY IF EXISTS "Admin can view all attempts" ON public.questionnaire_attempts;

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

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'questionnaire_attempts'
ORDER BY ordinal_position;
