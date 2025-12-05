-- Fix RLS policies for questionnaire tables to allow admin inserts
-- The issue: RLS policies were too restrictive and prevented admins from inserting

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow admin to manage questionnaire questions" ON public.questionnaire_questions;
DROP POLICY IF EXISTS "Allow admin to manage questionnaire choices" ON public.questionnaire_choices;

-- Create more permissive policies for authenticated users (admin)
CREATE POLICY "Allow authenticated users to manage questionnaire questions" 
ON public.questionnaire_questions 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage questionnaire choices" 
ON public.questionnaire_choices 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('questionnaire_questions', 'questionnaire_choices')
ORDER BY tablename, policyname;
