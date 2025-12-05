-- Enable contributor QCM creation via questionnaire_questions and questionnaire_choices tables
-- Contributors can now create QCMs using the dedicated questionnaire system instead of versions/steps

-- Allow contributors to insert questions into questionnaire_questions
-- They can only insert questions for tasks they own

CREATE POLICY "Contributors can insert questionnaire questions they own"
ON questionnaire_questions
FOR INSERT
TO authenticated
WITH CHECK (
  -- Verify the task_id exists and belongs to the current user
  EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = questionnaire_questions.task_id
    AND tasks.owner_id = auth.uid()
  )
);

-- Allow contributors to update questions for tasks they own
CREATE POLICY "Contributors can update questionnaire questions they own"
ON questionnaire_questions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = questionnaire_questions.task_id
    AND tasks.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = questionnaire_questions.task_id
    AND tasks.owner_id = auth.uid()
  )
);

-- Allow contributors to delete questions for tasks they own
CREATE POLICY "Contributors can delete questionnaire questions they own"
ON questionnaire_questions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = questionnaire_questions.task_id
    AND tasks.owner_id = auth.uid()
  )
);

-- Allow contributors to insert choices for questions in tasks they own
CREATE POLICY "Contributors can insert questionnaire choices for their questions"
ON questionnaire_choices
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM questionnaire_questions qn
    JOIN tasks t ON qn.task_id = t.id
    WHERE qn.id = questionnaire_choices.question_id
    AND t.owner_id = auth.uid()
  )
);

-- Allow contributors to update choices for questions in tasks they own
CREATE POLICY "Contributors can update questionnaire choices for their questions"
ON questionnaire_choices
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM questionnaire_questions qn
    JOIN tasks t ON qn.task_id = t.id
    WHERE qn.id = questionnaire_choices.question_id
    AND t.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM questionnaire_questions qn
    JOIN tasks t ON qn.task_id = t.id
    WHERE qn.id = questionnaire_choices.question_id
    AND t.owner_id = auth.uid()
  )
);

-- Allow contributors to delete choices for questions in tasks they own
CREATE POLICY "Contributors can delete questionnaire choices for their questions"
ON questionnaire_choices
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM questionnaire_questions qn
    JOIN tasks t ON qn.task_id = t.id
    WHERE qn.id = questionnaire_choices.question_id
    AND t.owner_id = auth.uid()
  )
);

-- Summary: Contributors can now create QCMs using questionnaire_questions and questionnaire_choices tables
-- The system maintains data integrity through RLS policies tied to task ownership
