-- Migration: Fix app_images RLS policies for admin users
-- Reason: Admins should be able to update any image regardless of user_id
-- This allows the /admin/images panel to work correctly

BEGIN;

-- Drop the restrictive policy
DROP POLICY IF EXISTS "users_update_own_images" ON public.app_images;

-- Create a new policy that allows:
-- 1. Owners to update their own images
-- 2. Admins to update any image
CREATE POLICY "users_update_own_or_admin"
ON public.app_images FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  OR user_id IS NULL 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ADMIN'
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR user_id IS NULL 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ADMIN'
  )
);

-- Similarly update INSERT policy for admins
DROP POLICY IF EXISTS "users_insert_own_images" ON public.app_images;

CREATE POLICY "users_insert_own_or_admin"
ON public.app_images FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  OR user_id IS NULL 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ADMIN'
  )
);

-- Delete policy for admins
DROP POLICY IF EXISTS "users_delete_own_images" ON public.app_images;

CREATE POLICY "users_delete_own_or_admin"
ON public.app_images FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  OR user_id IS NULL 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ADMIN'
  )
);

COMMIT;
