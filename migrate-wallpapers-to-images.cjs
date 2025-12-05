#!/usr/bin/env node

/**
 * Script to migrate wallpapers from /public/wallpapers to app_images table
 * Usage: node migrate-wallpapers-to-images.js
 */

const fs = require('fs');
const path = require('path');

const WALLPAPERS_DIR = path.join(__dirname, 'public', 'wallpapers');
const SVG_SUBDIR = path.join(WALLPAPERS_DIR, 'png');

// Function to convert filename to a nice description
function filenameToDescription(filename) {
  return filename
    .replace(/\.(svg|png)$/i, '')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get wallpapers from root directory (SVG files)
const svgFiles = fs.readdirSync(WALLPAPERS_DIR)
  .filter(file => file.endsWith('.svg'))
  .map(file => ({
    name: filenameToDescription(file),
    filename: file,
    category: 'wallpaper',
    file_path: `wallpapers/${file}`,
    type: 'svg'
  }));

// Get wallpapers from png subdirectory
const pngFiles = fs.readdirSync(SVG_SUBDIR)
  .filter(file => file.endsWith('.png'))
  .map(file => ({
    name: filenameToDescription(file),
    filename: file,
    category: 'wallpaper',
    file_path: `wallpapers/png/${file}`,
    type: 'png'
  }));

const allWallpapers = [...svgFiles, ...pngFiles];

console.log(`Found ${svgFiles.length} SVG files and ${pngFiles.length} PNG files`);
console.log('\n=== WALLPAPERS TO MIGRATE ===\n');

allWallpapers.forEach((wp, idx) => {
  console.log(`${idx + 1}. ${wp.name}`);
  console.log(`   File: ${wp.file_path}`);
  console.log(`   Category: ${wp.category}`);
});

// Generate SQL INSERT statements
console.log('\n\n=== SQL MIGRATION SCRIPT ===\n');

console.log(`-- Migrate wallpapers from /public/wallpapers to app_images table`);
console.log(`-- Category: 'wallpaper'\n`);
console.log(`INSERT INTO app_images (name, category, file_path, description) VALUES`);

const sqlValues = allWallpapers.map(wp => 
  `('${wp.name.replace(/'/g, "''")}', '${wp.category}', '${wp.file_path}', '${wp.name.replace(/'/g, "''")}')`
);

console.log(sqlValues.join(',\n') + ';');

console.log(`\n-- After migration, these wallpapers should be available in app_images table`);
console.log(`-- You can then remove the /public/wallpapers directory\n`);

// Export as JSON for reference
const outputJson = {
  migration_date: new Date().toISOString(),
  total_files: allWallpapers.length,
  wallpapers: allWallpapers
};

fs.writeFileSync(
  path.join(__dirname, 'wallpapers_migration.json'),
  JSON.stringify(outputJson, null, 2)
);

console.log(`✓ Migration data saved to wallpapers_migration.json`);
