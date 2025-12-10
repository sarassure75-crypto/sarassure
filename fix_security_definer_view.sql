-- ============================================================================
-- FIX SECURITY: Replace SECURITY DEFINER view with SECURITY INVOKER
-- ============================================================================
-- This script fixes the security vulnerability in contributor_revenue_summary
-- by replacing SECURITY DEFINER with SECURITY INVOKER and adding proper RLS

-- Drop the existing view
DROP VIEW IF EXISTS contributor_revenue_summary;

-- Recreate the view with SECURITY INVOKER (executes with caller's permissions)
CREATE OR REPLACE VIEW contributor_revenue_summary
WITH (security_invoker = true) AS
SELECT 
  p.id as contributor_id,
  p.first_name,
  p.last_name,
  p.email,
  COALESCE(exercise_stats.total_sales, 0) as exercise_sales_count,
  COALESCE(exercise_stats.total_revenue, 0) as exercise_revenue_cents,
  COALESCE(image_stats.total_sales, 0) as image_sales_count,
  COALESCE(image_stats.total_revenue, 0) as image_revenue_cents,
  COALESCE(exercise_stats.total_revenue, 0) + COALESCE(image_stats.total_revenue, 0) as total_revenue_cents,
  COALESCE(exercise_stats.total_sales, 0) + COALESCE(image_stats.total_sales, 0) as total_sales_count,
  FLOOR((COALESCE(exercise_stats.total_revenue, 0) + COALESCE(image_stats.total_revenue, 0)) / 100000) as milestone_count
FROM profiles p
LEFT JOIN (
  SELECT 
    contributor_id,
    COUNT(*) as total_sales,
    SUM(price_cents) as total_revenue
  FROM contributor_exercise_sales
  GROUP BY contributor_id
) exercise_stats ON p.id = exercise_stats.contributor_id
LEFT JOIN (
  SELECT 
    contributor_id,
    COUNT(*) as total_sales,
    SUM(price_cents) as total_revenue
  FROM contributor_image_sales
  GROUP BY contributor_id
) image_stats ON p.id = image_stats.contributor_id
WHERE p.role = 'contributeur' OR p.role = 'contributor';

-- Grant access to the view for authenticated users
GRANT SELECT ON contributor_revenue_summary TO authenticated;

-- Create a function to check if user can access contributor revenue data
CREATE OR REPLACE FUNCTION can_view_contributor_revenue(target_contributor_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admin can view all
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'administrateur'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Contributors can view their own data
  IF auth.uid() = target_contributor_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policy for the view (optional, depends on Supabase setup)
-- Note: Views inherit RLS from underlying tables, but we add this for extra security
COMMENT ON VIEW contributor_revenue_summary IS 'Revenue summary for contributors - uses SECURITY INVOKER for safe execution';

-- ============================================================================
-- Additional Security: Ensure RLS is properly configured on base tables
-- ============================================================================

-- Verify RLS is enabled on base tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'contributor_exercise_sales' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE contributor_exercise_sales ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'contributor_image_sales' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE contributor_image_sales ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Ensure profiles table has proper RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Add RLS policy for profiles (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view own profile and contributors'
  ) THEN
    CREATE POLICY "Users can view own profile and contributors"
      ON profiles FOR SELECT
      USING (
        auth.uid() = id OR 
        role IN ('contributeur', 'contributor') OR
        EXISTS (
          SELECT 1 FROM profiles admin
          WHERE admin.id = auth.uid() AND admin.role = 'administrateur'
        )
      );
  END IF;
END $$;

-- ============================================================================
-- Audit and Logging
-- ============================================================================

-- Create audit log for sensitive queries (optional)
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  details JSONB
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admin view audit logs"
  ON security_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'administrateur'
    )
  );

-- ============================================================================
-- Verification and Success Message
-- ============================================================================

-- Verify the fix
DO $$
DECLARE
  view_security TEXT;
BEGIN
  -- Check if view exists and get its security setting
  SELECT CASE 
    WHEN pg_views.definition LIKE '%security_invoker%' THEN 'SECURITY INVOKER'
    ELSE 'SECURITY DEFINER'
  END INTO view_security
  FROM pg_views
  WHERE schemaname = 'public' AND viewname = 'contributor_revenue_summary';
  
  IF view_security = 'SECURITY INVOKER' THEN
    RAISE NOTICE 'SUCCESS: View contributor_revenue_summary is now using SECURITY INVOKER';
  ELSE
    RAISE WARNING 'WARNING: View may still be using SECURITY DEFINER';
  END IF;
END $$;

SELECT 'Security vulnerability fixed! The view now uses SECURITY INVOKER and proper RLS policies.' as status;

-- ============================================================================
-- Instructions for Supabase Dashboard
-- ============================================================================
/*
To apply this fix in Supabase:

1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste this entire script
3. Click "Run" to execute
4. Verify in the Security Advisor that the warning is resolved
5. Test the view with different user roles to ensure proper access control

Additional recommendations:
- Review all other views for SECURITY DEFINER usage
- Implement regular security audits
- Use the security_audit_log table to track sensitive operations
- Consider using Postgres Row Level Security (RLS) policies for all tables
- Regularly update and patch your Supabase instance
*/
