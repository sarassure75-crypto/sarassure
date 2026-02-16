-- 2026-02-16_fix_profiles_rls.sql
-- Fix RLS policies on `profiles` to rely on the database-stored role
-- Use public.current_user_role() which reads the role from the profiles table
-- This avoids relying on a JWT claim that may be missing or inconsistently formatted.

-- DROP + RECREATE: Admins can read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ( public.current_user_role() = 'administrateur' );

-- DROP + RECREATE: Admins can insert profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ( public.current_user_role() = 'administrateur' );

-- Optional: allow admins to UPDATE any profile (preserve users_update_own separately)
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ( public.current_user_role() = 'administrateur' )
  WITH CHECK ( public.current_user_role() = 'administrateur' );

COMMENT ON POLICY "Admins can read all profiles" ON public.profiles IS 'Allow full read for users whose profile.role = administrateur (uses current_user_role())';
COMMENT ON POLICY "Admins can insert profiles" ON public.profiles IS 'Allow admins (profile.role = administrateur) to insert profiles';
COMMENT ON POLICY "Admins can update profiles" ON public.profiles IS 'Allow admins (profile.role = administrateur) to update any profile';
