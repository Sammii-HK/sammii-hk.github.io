import type { MetadataRoute } from 'next';
import { CHARTS, chartHref } from './charts/registry';
import { EXPLORATIONS, explorationHref } from './explorations/registry';

/** Canonical URLs for this host. Omit lastModified without an actual content revision date. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://labs.sammii.dev/' },
    { url: 'https://labs.sammii.dev/charts/' },
    ...CHARTS.map((chart) => ({ url: chartHref(chart.slug) })),
    { url: 'https://labs.sammii.dev/explorations/' },
    ...EXPLORATIONS.map((exploration) => ({ url: explorationHref(exploration.slug) })),
  ];
}
