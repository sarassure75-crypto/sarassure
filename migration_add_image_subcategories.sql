-- Migration: Add subcategory support to app_images table
-- Date: 2025-12-01
-- Description: Add subcategory field to organize images within categories

-- Add subcategory column to app_images
ALTER TABLE public.app_images
ADD COLUMN IF NOT EXISTS subcategory TEXT DEFAULT 'général';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_app_images_category_subcategory 
ON public.app_images(category, subcategory);

-- Insert default subcategories for "Capture d'écran" category
-- Note: These are virtual subcategories, not stored in a separate table
-- The subcategories are: "général", "parametres", "first acces"

-- Update existing images without subcategory to 'général'
UPDATE public.app_images
SET subcategory = 'général'
WHERE subcategory IS NULL OR subcategory = '';

-- Add comment to document the field
COMMENT ON COLUMN public.app_images.subcategory IS 'Sous-catégorie de l''image pour une meilleure organisation (ex: général, parametres, first acces)';

-- Create RPC function to get distinct subcategories for a given category
CREATE OR REPLACE FUNCTION public.get_distinct_image_subcategories(category_filter TEXT DEFAULT NULL)
RETURNS TABLE(subcategory TEXT) 
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT app_images.subcategory
  FROM public.app_images
  WHERE (category_filter IS NULL OR app_images.category = category_filter)
    AND app_images.subcategory IS NOT NULL
  ORDER BY app_images.subcategory;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_distinct_image_subcategories(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_distinct_image_subcategories(TEXT) TO anon;
