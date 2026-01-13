-- Migration: Fix tasks RLS policies for admin users
-- Reason: Admins should be able to update/delete any task regardless of owner_id
-- This allows the /admin/dashboard to work correctly

BEGIN;

-- Drop the restrictive policies
DROP POLICY IF EXISTS "authenticated_update_tasks" ON public.tasks;
DROP POLICY IF EXISTS "authenticated_delete_tasks" ON public.tasks;

-- Create new policies that allow:
-- 1. Owners to update their own tasks
-- 2. Admins to update any task
CREATE POLICY "users_update_own_or_admin_tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (
  auth.uid() = owner_id 
  OR owner_id IS NULL 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ADMIN'
  )
)
WITH CHECK (
  auth.uid() = owner_id 
  OR owner_id IS NULL 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ADMIN'
  )
);

-- Delete policy for admins
CREATE POLICY "users_delete_own_or_admin_tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (
  auth.uid() = owner_id 
  OR owner_id IS NULL 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ADMIN'
  )
);

COMMIT;
