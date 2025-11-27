const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, 'public', 'wallpapers');
const pngDir = path.join(__dirname, 'public', 'wallpapers', 'png');

// Créer le dossier PNG s'il n'existe pas
if (!fs.existsSync(pngDir)) {
  fs.mkdirSync(pngDir, { recursive: true });
}

const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));

console.log(`Converting ${svgFiles.length} SVG files to PNG...`);

Promise.all(
  svgFiles.map(async (file) => {
    const svgPath = path.join(svgDir, file);
    const pngPath = path.join(pngDir, file.replace('.svg', '.png'));
    
    try {
      await sharp(svgPath, { density: 300 })
        .resize(1080, 1920)
        .png({ quality: 90 })
        .toFile(pngPath);
      console.log(`✓ ${file} -> ${file.replace('.svg', '.png')}`);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  })
).then(() => {
  console.log('Conversion completed!');
}).catch(err => {
  console.error('Error:', err);
});
