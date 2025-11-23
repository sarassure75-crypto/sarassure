-- Migration: Add parent_category_id column to support subcategories for exercises
-- Date: 2025-11-23

-- Add parent_category_id column to task_categories if it doesn't exist
ALTER TABLE public.task_categories
ADD COLUMN IF NOT EXISTS parent_category_id integer REFERENCES public.task_categories(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_categories_parent ON public.task_categories(parent_category_id);
