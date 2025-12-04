-- Migration: Add task_type column to distinguish questionnaires from exercises
-- Date: 2025-12-04

ALTER TABLE tasks 
ADD COLUMN task_type VARCHAR(50) DEFAULT 'exercise' 
CHECK (task_type IN ('exercise', 'questionnaire'));

-- Create index for faster filtering
CREATE INDEX idx_tasks_task_type ON tasks(task_type);

-- Optionally add a comment
COMMENT ON COLUMN tasks.task_type IS 'Type of task: exercise or questionnaire';
