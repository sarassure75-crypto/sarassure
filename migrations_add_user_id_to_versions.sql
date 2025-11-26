-- Migration: Add user_id to versions table
-- This will help distinguish between admin and contributor versions

-- Add user_id column to versions table
ALTER TABLE versions 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_versions_user_id ON versions(user_id);

-- Update existing versions to set user_id based on their task owner
UPDATE versions 
SET user_id = tasks.owner_id 
FROM tasks 
WHERE versions.task_id = tasks.id 
AND tasks.owner_id IS NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN versions.user_id IS 'User who created this version (owner of the parent task)';