-- Migration: Move wallpapers from /public/wallpapers to app_images table
-- Date: 2025-12-05
-- Purpose: Centralize all images in the app_images table with category 'wallpaper'
-- After this migration, the /public/wallpapers directory can be safely removed

INSERT INTO app_images (name, category, file_path, description) VALUES
('Blue Gradient', 'wallpaper', 'wallpapers/blue-gradient.svg', 'Blue Gradient background pattern'),
('Forest Green', 'wallpaper', 'wallpapers/forest-green.svg', 'Forest green aesthetic background'),
('Geometric Shapes', 'wallpaper', 'wallpapers/geometric-shapes.svg', 'Abstract geometric shapes pattern'),
('Green Circles', 'wallpaper', 'wallpapers/green-circles.svg', 'Green circles pattern background'),
('Green Forest Trees', 'wallpaper', 'wallpapers/green-forest-trees.svg', 'Forest trees illustration'),
('Green Geometric Mesh', 'wallpaper', 'wallpapers/green-geometric-mesh.svg', 'Green geometric mesh pattern'),
('Green Hexagons', 'wallpaper', 'wallpapers/green-hexagons.svg', 'Green hexagons pattern'),
('Green Hills Landscape', 'wallpaper', 'wallpapers/green-hills-landscape.svg', 'Rolling green hills landscape'),
('Green Triangles', 'wallpaper', 'wallpapers/green-triangles.svg', 'Green triangles geometric pattern'),
('Green Waves Abstract', 'wallpaper', 'wallpapers/green-waves-abstract.svg', 'Abstract green waves pattern'),
('Lavender', 'wallpaper', 'wallpapers/lavender.svg', 'Lavender gradient background'),
('Mountain Sunrise', 'wallpaper', 'wallpapers/mountain-sunrise.svg', 'Mountain sunrise landscape'),
('Ocean Waves', 'wallpaper', 'wallpapers/ocean-waves.svg', 'Ocean waves pattern'),
('Soft Gray', 'wallpaper', 'wallpapers/soft-gray.svg', 'Soft gray background'),
('Starry Night', 'wallpaper', 'wallpapers/starry-night.svg', 'Starry night sky'),
('Sunset Sky', 'wallpaper', 'wallpapers/sunset-sky.svg', 'Beautiful sunset sky'),
('Blue Gradient', 'wallpaper', 'wallpapers/png/blue-gradient.png', 'Blue Gradient background pattern (PNG)'),
('Forest Green', 'wallpaper', 'wallpapers/png/forest-green.png', 'Forest green aesthetic background (PNG)'),
('Geometric Shapes', 'wallpaper', 'wallpapers/png/geometric-shapes.png', 'Abstract geometric shapes pattern (PNG)'),
('Green Circles', 'wallpaper', 'wallpapers/png/green-circles.png', 'Green circles pattern background (PNG)'),
('Green Forest Trees', 'wallpaper', 'wallpapers/png/green-forest-trees.png', 'Forest trees illustration (PNG)'),
('Green Geometric Mesh', 'wallpaper', 'wallpapers/png/green-geometric-mesh.png', 'Green geometric mesh pattern (PNG)'),
('Green Hexagons', 'wallpaper', 'wallpapers/png/green-hexagons.png', 'Green hexagons pattern (PNG)'),
('Green Hills Landscape', 'wallpaper', 'wallpapers/png/green-hills-landscape.png', 'Rolling green hills landscape (PNG)'),
('Green Triangles', 'wallpaper', 'wallpapers/png/green-triangles.png', 'Green triangles geometric pattern (PNG)'),
('Green Waves Abstract', 'wallpaper', 'wallpapers/png/green-waves-abstract.png', 'Abstract green waves pattern (PNG)'),
('Lavender', 'wallpaper', 'wallpapers/png/lavender.png', 'Lavender gradient background (PNG)'),
('Mountain Sunrise', 'wallpaper', 'wallpapers/png/mountain-sunrise.png', 'Mountain sunrise landscape (PNG)'),
('Ocean Waves', 'wallpaper', 'wallpapers/png/ocean-waves.png', 'Ocean waves pattern (PNG)'),
('Soft Gray', 'wallpaper', 'wallpapers/png/soft-gray.png', 'Soft gray background (PNG)'),
('Starry Night', 'wallpaper', 'wallpapers/png/starry-night.png', 'Starry night sky (PNG)'),
('Sunset Sky', 'wallpaper', 'wallpapers/png/sunset-sky.png', 'Beautiful sunset sky (PNG)');

-- Total: 32 wallpapers migrated (16 SVG + 16 PNG versions)
-- Next steps:
-- 1. Run this migration on production database
-- 2. Update any code references from /wallpapers to app_images with category='wallpaper'
-- 3. Remove the /public/wallpapers directory from version control
-- 4. Update .gitignore to exclude /public/wallpapers if needed
