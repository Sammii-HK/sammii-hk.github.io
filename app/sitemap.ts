import type { MetadataRoute } from 'next';
import { getAllPosts, REVALIDATE } from './lib/blog';
import { getAllCaseStudySlugs } from './lib/case-studies';
import { CHARTS, chartHref } from './labs/charts/registry';

export const revalidate = REVALIDATE;

/** Every public page, so search engines and AI crawlers find the writing and the work without following links. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = 'https://sammii.dev';
  const now = new Date();
  const posts = await getAllPosts();
  return [
    { url: `${site}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${site}/work/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${site}/blog/`, lastModified: posts[0] ? new Date(posts[0].date) : now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${site}/links/`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    ...posts.map((p) => ({ url: `${site}/blog/${p.slug}/`, lastModified: new Date(p.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...getAllCaseStudySlugs().map((s) => ({ url: `${site}/projects/${s}/`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: 'https://labs.sammii.dev/', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://labs.sammii.dev/charts/', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...CHARTS.map((c) => ({ url: chartHref(c.slug), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
