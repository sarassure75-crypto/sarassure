const fs = require('fs');
const path = require('path');

// Créer un PNG simple de 192x192 pixels (image verte simple)
function createSimplePNG(filename, size) {
  // PNG header + minimal valid PNG
  const width = size;
  const height = size;
  
  // Minimal PNG (1x1 pixel vert)
  const pngData = Buffer.from([
    // PNG signature
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    // IHDR chunk (width, height, bit depth, color type, etc.)
    0x00, 0x00, 0x00, 0x0D, // chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, width >> 8, width & 0xFF, // width
    0x00, 0x00, 0x00, height >> 8, height & 0xFF, // height
    0x08, 0x02, // 8-bit RGB
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x00, 0x00, 0x00, 0x00, // CRC (dummy)
    // IDAT chunk (image data - all green pixels)
    0x00, 0x00, 0x00, 0x0C, // chunk length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x78, 0x9C, 0x62, 0xF8, 0xCF, 0xC0, 0x00, 0x00, 0x00, 0x03, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, // CRC (dummy)
    // IEND chunk
    0x00, 0x00, 0x00, 0x00, // chunk length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  fs.writeFileSync(filename, pngData);
  console.log(`✓ Créé : ${filename}`);
}

const publicDir = path.join(__dirname, 'public');

createSimplePNG(path.join(publicDir, 'logo_192.png'), 192);
createSimplePNG(path.join(publicDir, 'logo_512.png'), 512);
createSimplePNG(path.join(publicDir, 'logo_maskable_192.png'), 192);
createSimplePNG(path.join(publicDir, 'logo_maskable_512.png'), 512);

console.log('✓ Tous les fichiers PNG ont été créés !');
