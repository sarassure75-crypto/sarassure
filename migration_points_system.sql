-- ============================================================================
-- MIGRATION: Points System for Contributors
-- ============================================================================
-- This migration implements the points-based revenue system where contributors
-- receive a share of 20% of total platform revenue proportionally to their points

-- Table to track contributor points
CREATE TABLE IF NOT EXISTS contributor_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_points DECIMAL(10, 1) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table to track individual point transactions
CREATE TABLE IF NOT EXISTS contributor_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points_change DECIMAL(10, 1) NOT NULL,
  contribution_type VARCHAR(20) NOT NULL, -- 'image', 'exercise', 'penalty'
  contribution_id UUID, -- Reference to images_metadata or tasks
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table to track revenue distributions
CREATE TABLE IF NOT EXISTS revenue_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  total_platform_revenue_cents INTEGER NOT NULL,
  distribution_pool_cents INTEGER NOT NULL, -- 20% of total revenue
  total_contributor_points DECIMAL(10, 1) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'distributed', 'paid'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table to track individual contributor distributions
CREATE TABLE IF NOT EXISTS contributor_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID NOT NULL REFERENCES revenue_distributions(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contributor_points DECIMAL(10, 1) NOT NULL,
  amount_cents INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid'
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Function to calculate and record a distribution
CREATE OR REPLACE FUNCTION calculate_and_distribute_revenue(
  p_total_revenue_cents INTEGER
)
RETURNS TABLE (
  distribution_id UUID,
  total_pool_cents INTEGER,
  distribution_count INTEGER
) AS $$
DECLARE
  v_distribution_id UUID;
  v_pool_cents INTEGER;
  v_total_points DECIMAL(10, 1);
  v_distribution_row RECORD;
BEGIN
  -- Calculate 20% pool
  v_pool_cents := ROUND(p_total_revenue_cents * 0.20);
  
  -- Get total points in system
  SELECT COALESCE(SUM(total_points), 0) INTO v_total_points
  FROM contributor_points;
  
  -- If no points in system, return early
  IF v_total_points = 0 THEN
    RETURN;
  END IF;
  
  -- Create distribution record
  INSERT INTO revenue_distributions (
    total_platform_revenue_cents,
    distribution_pool_cents,
    total_contributor_points,
    status
  )
  VALUES (p_total_revenue_cents, v_pool_cents, v_total_points, 'distributed')
  RETURNING id INTO v_distribution_id;
  
  -- Create individual contributor distributions
  INSERT INTO contributor_distributions (
    distribution_id,
    contributor_id,
    contributor_points,
    amount_cents
  )
  SELECT
    v_distribution_id,
    cp.contributor_id,
    cp.total_points,
    ROUND((cp.total_points / v_total_points) * v_pool_cents)::INTEGER
  FROM contributor_points cp
  WHERE cp.total_points > 0;
  
  -- Return summary
  RETURN QUERY
  SELECT
    v_distribution_id,
    v_pool_cents,
    (SELECT COUNT(*) FROM contributor_distributions WHERE distribution_id = v_distribution_id)::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add points to a contributor
CREATE OR REPLACE FUNCTION add_contributor_points(
  p_contributor_id UUID,
  p_points DECIMAL(10, 1),
  p_contribution_type VARCHAR(20),
  p_description TEXT DEFAULT NULL
)
RETURNS DECIMAL(10, 1) AS $$
DECLARE
  v_new_total DECIMAL(10, 1);
BEGIN
  -- Ensure contributor_points record exists
  INSERT INTO contributor_points (contributor_id, total_points)
  VALUES (p_contributor_id, 0)
  ON CONFLICT (contributor_id) DO NOTHING;
  
  -- Update total points
  UPDATE contributor_points
  SET total_points = total_points + p_points,
      last_updated = NOW()
  WHERE contributor_id = p_contributor_id
  RETURNING total_points INTO v_new_total;
  
  -- Record transaction
  INSERT INTO contributor_points_history (
    contributor_id,
    points_change,
    contribution_type,
    description
  )
  VALUES (p_contributor_id, p_points, p_contribution_type, p_description);
  
  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply penalties based on rejection reason
CREATE OR REPLACE FUNCTION apply_rejection_penalty(
  p_contributor_id UUID,
  p_version_id UUID,
  p_reason VARCHAR(50) DEFAULT 'generic'
)
RETURNS DECIMAL(10, 1) AS $$
DECLARE
  v_penalty DECIMAL(10, 1);
  v_description TEXT;
BEGIN
  -- Determine penalty based on reason
  v_penalty := -2; -- Default: simple rejection
  v_description := 'Rejet simple - ' || p_reason;
  
  IF p_reason ILIKE '%donnée personnelle%' OR p_reason ILIKE '%données personnelles%' OR p_reason ILIKE '%privacy%' OR p_reason ILIKE '%personnel%' THEN
    v_penalty := -5;
    v_description := 'Rejet: données personnelles détectées';
  ELSIF p_reason ILIKE '%répét%' OR p_reason ILIKE '%duplicate%' OR p_reason ILIKE '%plagiat%' THEN
    v_penalty := -10;
    v_description := 'Rejet: contenu répété/plagiat';
  ELSIF p_reason ILIKE '%erreur%' OR p_reason ILIKE '%error%' OR p_reason ILIKE '%bug%' THEN
    v_penalty := -3;
    v_description := 'Rejet: erreur détectée';
  END IF;
  
  -- Apply penalty using add_contributor_points
  RETURN add_contributor_points(p_contributor_id, v_penalty, 'penalty', v_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for contributor_points
ALTER TABLE contributor_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contributor_see_own_points"
ON contributor_points
FOR SELECT
USING (contributor_id = auth.uid());

CREATE POLICY "admin_see_all_points"
ON contributor_points
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'administrateur'
  )
);

-- RLS for contributor_distributions
ALTER TABLE contributor_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contributor_see_own_distributions"
ON contributor_distributions
FOR SELECT
USING (
  contributor_id = auth.uid()
);

CREATE POLICY "admin_see_all_distributions"
ON contributor_distributions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'administrateur'
  )
);

-- Indexes for performance
CREATE INDEX idx_contributor_points_contributor ON contributor_points(contributor_id);
CREATE INDEX idx_points_history_contributor ON contributor_points_history(contributor_id);
CREATE INDEX idx_points_history_created ON contributor_points_history(created_at);
CREATE INDEX idx_distributions_status ON revenue_distributions(status);
CREATE INDEX idx_contributor_dist_contributor ON contributor_distributions(contributor_id);
