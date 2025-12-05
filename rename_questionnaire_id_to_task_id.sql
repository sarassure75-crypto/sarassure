-- Migration: Fix questionnaire_attempts table - rename questionnaire_id to task_id
-- Purpose: Ensure the table uses task_id instead of questionnaire_id

-- Check current structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'questionnaire_attempts'
-- ORDER BY ordinal_position;

-- Rename questionnaire_id to task_id if it exists
ALTER TABLE public.questionnaire_attempts
RENAME COLUMN questionnaire_id TO task_id;

-- Ensure learner_id exists
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure percentage column exists
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS percentage INTEGER DEFAULT 0;

-- Ensure best_percentage column exists
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS best_percentage INTEGER DEFAULT 0;

-- Ensure status column exists
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- Ensure attempted_at column exists
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Ensure created_at column exists
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Ensure updated_at column exists
ALTER TABLE public.questionnaire_attempts
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Drop old constraint if it exists
ALTER TABLE public.questionnaire_attempts
DROP CONSTRAINT IF EXISTS questionnaire_attempts_questionnaire_id_fkey;

-- Add proper foreign key constraint for task_id
ALTER TABLE public.questionnaire_attempts
ADD CONSTRAINT questionnaire_attempts_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Create or recreate indexes
DROP INDEX IF EXISTS idx_questionnaire_attempts_questionnaire_id;
CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_task_id 
ON public.questionnaire_attempts(task_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_learner_id 
ON public.questionnaire_attempts(learner_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_task_learner 
ON public.questionnaire_attempts(task_id, learner_id);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'questionnaire_attempts'
ORDER BY ordinal_position;
