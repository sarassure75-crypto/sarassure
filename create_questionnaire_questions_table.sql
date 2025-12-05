-- Migration: Create dedicated tables for QCM questions and responses
-- Purpose: Store questionnaire questions and their choices separately from exercise steps
-- Date: 2025-12-05

-- Create questionnaire_questions table
CREATE TABLE IF NOT EXISTS public.questionnaire_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    instruction TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    question_type TEXT DEFAULT 'image_choice',
    image_id UUID REFERENCES public.app_images(id),
    image_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(task_id, question_order)
);

-- Create questionnaire_choices table (responses/answers)
CREATE TABLE IF NOT EXISTS public.questionnaire_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    choice_order INTEGER NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    image_id UUID REFERENCES public.app_images(id),
    image_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(question_id, choice_order)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questionnaire_questions_task_id 
ON public.questionnaire_questions(task_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_choices_question_id 
ON public.questionnaire_choices(question_id);

-- Add RLS policies if needed
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_choices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view questions
CREATE POLICY "Allow viewing questionnaire questions" 
ON public.questionnaire_questions 
FOR SELECT 
USING (true);

-- Allow admin to manage questions
CREATE POLICY "Allow admin to manage questionnaire questions" 
ON public.questionnaire_questions 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Allow viewing choices
CREATE POLICY "Allow viewing questionnaire choices" 
ON public.questionnaire_choices 
FOR SELECT 
USING (true);

-- Allow admin to manage choices
CREATE POLICY "Allow admin to manage questionnaire choices" 
ON public.questionnaire_choices 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Add created_at and updated_at triggers if they don't exist
CREATE OR REPLACE FUNCTION public.update_questionnaire_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS questionnaire_questions_updated_at ON public.questionnaire_questions;
CREATE TRIGGER questionnaire_questions_updated_at
BEFORE UPDATE ON public.questionnaire_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_questionnaire_questions_updated_at();

CREATE OR REPLACE FUNCTION public.update_questionnaire_choices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS questionnaire_choices_updated_at ON public.questionnaire_choices;
CREATE TRIGGER questionnaire_choices_updated_at
BEFORE UPDATE ON public.questionnaire_choices
FOR EACH ROW
EXECUTE FUNCTION public.update_questionnaire_choices_updated_at();
