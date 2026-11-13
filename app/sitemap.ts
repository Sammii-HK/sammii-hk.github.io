import type { MetadataRoute } from 'next';
import { getAllPosts, REVALIDATE } from './lib/blog';
import { getAllCaseStudySlugs } from './lib/case-studies';

export const revalidate = REVALIDATE;

/** Every public page, so search engines and AI crawlers find the writing and the work without following links. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = 'https://sammii.dev';
  const posts = await getAllPosts();
  return [
    { url: `${site}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${site}/work/`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${site}/blog/`, ...(posts[0] ? { lastModified: new Date(posts[0].date) } : {}), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${site}/speaking/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site}/links/`, changeFrequency: 'monthly', priority: 0.4 },
    ...posts.map((p) => ({ url: `${site}/blog/${p.slug}/`, lastModified: new Date(p.date), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...getAllCaseStudySlugs().map((s) => ({ url: `${site}/projects/${s}/`, changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
}
