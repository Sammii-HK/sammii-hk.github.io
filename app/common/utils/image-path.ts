import imageMapData from './image-map.json';
import screenshotOverrides from './screenshot-overrides.json';

const imageMap = imageMapData as Record<string, string>;
const currentScreenshots = screenshotOverrides as Record<string, string>;

export const getImagePath = (projectId: string): string => {
  // Handle nested project IDs like 'unicorn-poo/succulent' -> 'succulent'
  // Images are stored with just the base ID, not the full path
  const projectBaseId = projectId.split('/').pop() || projectId;
  if (currentScreenshots[projectBaseId]) return currentScreenshots[projectBaseId];
  
  // Get extension from auto-generated map, default to jpg
  const extension = imageMap[projectBaseId] || 'jpg';
  
  return `/assets/images/${projectBaseId}.${extension}`;
};
