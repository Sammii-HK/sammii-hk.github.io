import imageMapData from './image-map.json';

const imageMap = imageMapData as Record<string, string>;

export const getImagePath = (projectId: string): string => {
  // Handle nested project IDs like 'unicorn-poo/succulent' -> 'succulent'
  const projectBaseId = projectId.split('/').pop() || projectId;
  
  // Get extension from auto-generated map, default to jpg
  const extension = imageMap[projectBaseId] || 'jpg';
  
  return `/assets/images/${projectId}.${extension}`;
};
