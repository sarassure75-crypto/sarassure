-- Fix image deletion RLS policy
-- The current policy silently fails deletion for admins if get_my_role() doesn't work correctly
-- This adds an explicit DELETE policy that checks both admin role and direct user_id ownership

-- Drop existing policies on app_images
DROP POLICY IF EXISTS "Allow public read and admins full access to app_images" ON public.app_images;
DROP POLICY IF EXISTS "Allow admins to manage all images" ON public.app_images;
DROP POLICY IF EXISTS "Allow users to manage their own images" ON public.app_images;

-- Recreate with proper separation of concerns
-- SELECT: Allow public read
CREATE POLICY "Allow public read app_images" ON public.app_images FOR SELECT USING (true);

-- DELETE: Allow admins (by role) OR owner (user_id = auth.uid())
CREATE POLICY "Allow delete app_images" ON public.app_images 
  FOR DELETE 
  USING (
    (get_my_role() = 'administrateur'::text) OR 
    (user_id = auth.uid())
  );

-- INSERT: Allow admins and owner
CREATE POLICY "Allow insert app_images" ON public.app_images 
  FOR INSERT 
  WITH CHECK (
    (get_my_role() = 'administrateur'::text) OR 
    (user_id = auth.uid())
  );

-- UPDATE: Allow admins and owner
CREATE POLICY "Allow update app_images" ON public.app_images 
  FOR UPDATE 
  USING (
    (get_my_role() = 'administrateur'::text) OR 
    (user_id = auth.uid())
  )
  WITH CHECK (
    (get_my_role() = 'administrateur'::text) OR 
    (user_id = auth.uid())
  );
