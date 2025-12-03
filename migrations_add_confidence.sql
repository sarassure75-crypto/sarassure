-- Migration: Add user_exercise_confidence table
-- Date: 2025-12-03
-- Description: Track learner confidence before and after exercices for progress feedback

-- Create table for confidence tracking
CREATE TABLE IF NOT EXISTS user_exercise_confidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES "versions"(id) ON DELETE CASCADE,
  confidence_before INT CHECK (confidence_before IN (1, 2, 3)), -- 1=😟 pas confiant, 2=🙂 un peu, 3=😄 confiant
  confidence_after INT CHECK (confidence_after IN (1, 2, 3)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, version_id) -- One confidence record per user/version
);

-- Create indexes for fast queries
CREATE INDEX idx_user_exercise_confidence_user_id ON user_exercise_confidence(user_id);
CREATE INDEX idx_user_exercise_confidence_version_id ON user_exercise_confidence(version_id);
CREATE INDEX idx_user_exercise_confidence_created_at ON user_exercise_confidence(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE user_exercise_confidence ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own confidence data
CREATE POLICY "users_can_view_own_confidence" ON user_exercise_confidence
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own confidence data
CREATE POLICY "users_can_insert_own_confidence" ON user_exercise_confidence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own confidence data
CREATE POLICY "users_can_update_own_confidence" ON user_exercise_confidence
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Trainers can view confidence data of their learners
CREATE POLICY "trainers_can_view_learner_confidence" ON user_exercise_confidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_exercise_confidence.user_id
      AND profiles.assigned_trainer_id = auth.uid()
    )
  );

-- RLS Policy: Admins can view all confidence data
CREATE POLICY "admins_can_view_all_confidence" ON user_exercise_confidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Comment on table and columns for documentation
COMMENT ON TABLE user_exercise_confidence IS 'Tracks learner confidence levels before and after completing exercises. Used for progress feedback and motivation.';
COMMENT ON COLUMN user_exercise_confidence.confidence_before IS '1=😟 Not confident, 2=🙂 Somewhat confident, 3=😄 Confident';
COMMENT ON COLUMN user_exercise_confidence.confidence_after IS '1=😟 Not confident, 2=🙂 Somewhat confident, 3=😄 Confident';
