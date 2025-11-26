-- Migration: Add moderation_status to app_images for auto-validation of admin images
-- Purpose: Allow admin images to be visible to contributors by setting moderation_status to 'approved' automatically
-- Date: 2025-11-25

-- Add moderation_status column to app_images table if it doesn't exist
ALTER TABLE public.app_images 
ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved' NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.app_images.moderation_status IS 'Status of image moderation - admin images are auto-approved';

-- Update all existing app_images to have 'approved' status (they are admin images)
UPDATE public.app_images 
SET moderation_status = 'approved' 
WHERE moderation_status IS NULL OR moderation_status = '';

-- Create index for faster filtering by moderation_status
CREATE INDEX IF NOT EXISTS idx_app_images_moderation_status 
ON public.app_images(moderation_status);
