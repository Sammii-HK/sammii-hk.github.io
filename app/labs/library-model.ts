import { projects } from '../common/data/projects';
import { CHARTS, chartHref } from './charts/registry';
import { EXPLORATIONS, explorationHref } from './explorations/registry';
export type LibraryKind = 'Exploration' | 'Chart' | 'Interactive experiment' | 'Research and writing' | 'Lab project';
export type LibraryItem = { id: string; title: string; description: string; kind: LibraryKind; topic: string; tags: string[]; href: string | null; secondary?: { label: string; href: string } };
const research: Record<string, { topic: string; caseStudy: string }> = {
  'moth-drawings': { topic: 'AI and emergence', caseStudy: 'moth' },
  'why-this-take-won': { topic: 'Evaluation and scoring', caseStudy: 'why-this-take-won' },
  'teaching-a-computer-to-paint': { topic: 'Creative computation', caseStudy: 'teaching-a-computer-to-paint' },
};
const projectTopics: Record<string,string> = {
  kinetic:'Motion and interaction', spectra:'Colour and perception', refract:'Light and materials', grove:'Creative computation', isle:'AI and emergence',
  'beyond-light-vr':'Immersive experiences','celestial-map':'Skies','creative-coding':'Creative computation',liquidity:'Motion and interaction','day-lite':'Skies','tailwind-colour-creator':'Colour and perception','communication-infographic':'Information design',
};
export const LIBRARY: LibraryItem[] = [
  ...EXPLORATIONS.map(e => ({ id: `exploration:${e.id}`, title: e.title, description: e.description, kind: 'Exploration' as const, topic: e.category, tags: [e.topic, e.category], href: explorationHref(e.slug) })),
  ...projects.filter(p => p.home === 'labs').map(p => {const r = research[p.id]; const editorial = Boolean(r) || (p.labs?.kind === 'study' && Boolean(p.caseStudy));return {id:p.id,title:p.title,description:p.info,kind:(editorial?'Research and writing':p.labs?.kind==='lab-project'?'Lab project':'Interactive experiment') as LibraryKind,topic:r?.topic??projectTopics[p.id]??'Creative computation',tags:p.techStack.split(',').map(s=>s.trim()),href:editorial?`https://sammii.dev/projects/${r?.caseStudy??p.caseStudy}/`:p.liveUrl??(p.caseStudy?`https://sammii.dev/projects/${p.caseStudy}/`:null),secondary:editorial&&p.liveUrl?{label:p.id==='moth-drawings'?'Open the observatory':p.id==='why-this-take-won'?'Explore the scoring model':'Open the recorded experiment',href:p.liveUrl}:undefined};}),
  ...CHARTS.map(c => ({id:`chart:${c.slug}`,title:c.title,description:c.blurb,kind:'Chart' as const,topic:c.series,tags:[c.stack,c.series],href:chartHref(c.slug)})),
];
export const LIBRARY_KINDS: LibraryKind[] = ['Exploration','Chart','Interactive experiment','Research and writing','Lab project'];
export function filterLibrary(items: LibraryItem[], query: string, kind: string, topic: string) {
  const words=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter(item=>(kind==='all'||item.kind===kind)&&(topic==='all'||item.topic===topic)&&words.every(word=>[item.title,item.description,item.topic,...item.tags].join(' ').toLocaleLowerCase().includes(word)));
}
