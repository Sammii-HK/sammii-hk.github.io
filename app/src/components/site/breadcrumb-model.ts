import { projects } from '../../../common/data/projects';
import { CHARTS } from '../../../labs/charts/registry';
import { EXPLORATIONS } from '../../../labs/explorations/registry';
import type { Crumb } from '../Breadcrumbs';

const title = (slug: string) => slug.split('-').map(word => word[0]?.toUpperCase() + word.slice(1)).join(' ');

export function routeBreadcrumbs(pathname: string, labs = false): Crumb[] {
  const parts = pathname.split('/').filter(Boolean).filter(part => part !== 'labs');
  const main = 'https://sammii.dev';
  const root = labs ? 'https://labs.sammii.dev' : main;
  const crumbs: Crumb[] = [{ label: 'Home', href: `${main}/` }];

  if (labs) {
    crumbs.push({ label: 'Labs', href: parts.length ? `${root}/` : undefined });
    let path = '';
    parts.forEach((part, index) => {
      path += `/${part}`;
      const item = parts[0] === 'charts' ? CHARTS.find(chart => chart.slug === part) : EXPLORATIONS.find(exploration => exploration.slug === part);
      crumbs.push({ label: item?.title ?? title(part), href: index < parts.length - 1 ? `${root}${path}/` : undefined });
    });
  } else if (parts[0] === 'projects') {
    crumbs.push({ label: 'Work', href: `${main}/work/` });
    crumbs.push({ label: projects.find(project => project.caseStudy === parts[1])?.title ?? title(parts[1] ?? 'Case study') });
  } else {
    let path = '';
    parts.forEach((part, index) => {
      path += `/${part}`;
      crumbs.push({ label: part === 'blog' ? 'Writing' : title(part), href: index < parts.length - 1 ? `${root}${path}/` : undefined });
    });
  }
  return crumbs.length > 1 ? crumbs : [];
}
