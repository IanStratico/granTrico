import sharp from 'sharp';
import { mkdir } from 'fs/promises';

const input = 'public/logo.png';
const outDir = 'public/icons';

await mkdir(outDir, { recursive: true });

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
];

for (const { name, size } of sizes) {
  await sharp(input)
    .resize(size, size, { fit: 'contain', background: '#0d1f35' })
    .toFile(`${outDir}/${name}`);
  console.log(`✓ ${name}`);
}

// Maskable: 20% de padding para que el logo no se recorte en adaptive icons
for (const size of [192, 512]) {
  const pad = Math.round(size * 0.2);
  const inner = size - pad * 2;
  await sharp(input)
    .resize(inner, inner, { fit: 'contain', background: '#0d1f35' })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#0d1f35' })
    .toFile(`${outDir}/icon-${size}-maskable.png`);
  console.log(`✓ icon-${size}-maskable.png`);
}

console.log('Íconos generados en', outDir);
