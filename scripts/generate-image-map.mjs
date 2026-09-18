import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';

const imagesDir = join(process.cwd(), 'public', 'assets', 'images');

// Prefer the WebP (regenerated from the PNG/JPG masters at 2000px wide,
// q82, roughly a tenth of the size); fall back to the master when there is
// no WebP yet. The masters stay in the folder so a WebP can always be remade.
const PREFERENCE = ['webp', 'png', 'jpg', 'jpeg'];

async function generateImageMap() {
  try {
    const files = await readdir(imagesDir);
    const imageMap = {};

    for (const file of files) {
      const m = file.match(/^(.+)\.(webp|png|jpe?g)$/i);
      if (!m) continue; // .DS_Store and friends
      const [, name, rawExt] = m;
      if (name === 'sammii') continue; // logo, used by the CSS mask, not the map
      const ext = rawExt.toLowerCase();
      const current = imageMap[name];
      if (!current || PREFERENCE.indexOf(ext) < PREFERENCE.indexOf(current)) imageMap[name] = ext;
    }

    const outputPath = join(process.cwd(), 'app', 'common', 'utils', 'image-map.json');
    await writeFile(outputPath, JSON.stringify(imageMap, null, 2) + '\n');
    console.log(`Image map generated: ${Object.keys(imageMap).length} images`);
  } catch (error) {
    console.error('Error generating image map:', error);
    process.exitCode = 1;
  }
}

generateImageMap();
