import fs from 'fs';
import path from 'path';

export function getOgFont(weight: 400 | 700 = 700): Buffer {
  const file = weight === 700 ? 'inter-bold.woff' : 'inter-regular.woff';
  return fs.readFileSync(path.join(process.cwd(), 'public/fonts', file));
}

export function getJostFont(weight: 500 | 600 | 700 = 500): Buffer {
  const file = weight === 700 ? 'jost-bold.woff' : weight === 600 ? 'jost-semibold.woff' : 'jost-medium.woff';
  return fs.readFileSync(path.join(process.cwd(), 'public/fonts', file));
}
