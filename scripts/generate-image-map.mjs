import { readdir } from 'fs/promises';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const imagesDir = join(process.cwd(), 'public', 'assets', 'images');

async function generateImageMap() {
  try {
    const files = await readdir(imagesDir);
    const imageMap = {};
    
    files.forEach(file => {
      if (file === 'sammii.png') return; // Skip logo
      
      const name = file.replace(/\.(jpg|png)$/, '');
      const ext = file.endsWith('.png') ? 'png' : 'jpg';
      
      if (!imageMap[name]) {
        imageMap[name] = ext;
      }
    });
    
    const outputPath = join(process.cwd(), 'app', 'common', 'utils', 'image-map.json');
    await writeFile(outputPath, JSON.stringify(imageMap, null, 2));
    
    console.log('Image map generated successfully!');
  } catch (error) {
    console.error('Error generating image map:', error);
  }
}

generateImageMap();

