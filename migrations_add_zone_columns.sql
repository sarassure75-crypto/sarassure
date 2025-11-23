-- Migration: Add start_area and end_area columns for swipe/drag actions
-- This migration adds support for defining swipe and drag action zones

ALTER TABLE public.steps 
ADD COLUMN IF NOT EXISTS start_area jsonb,
ADD COLUMN IF NOT EXISTS end_area jsonb;

-- Add comment to help understand the schema
COMMENT ON COLUMN public.steps.start_area IS 'JSON object containing start position and size for swipe/drag actions: {x_percent, y_percent, width_percent, height_percent}';
COMMENT ON COLUMN public.steps.end_area IS 'JSON object containing end position and size for swipe/drag actions: {x_percent, y_percent, width_percent, height_percent}';
