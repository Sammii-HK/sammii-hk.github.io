import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import labsSitemap from '../../labs/sitemap';
import { GET as labsRobots } from '../../labs/robots.txt/route';
import sitemap from '../../sitemap';
import { EXPLORATIONS, explorationHref } from '../../labs/explorations/registry';
import { getAllPosts } from '../blog';

describe('exploration discovery integration', () => {
  it('lists every exploration once on the canonical Labs host without manufactured revision dates', async () => {
    const entries = labsSitemap();
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(entries.every((entry) => new URL(entry.url).host === 'labs.sammii.dev')).toBe(true);
    expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true);
    for (const item of EXPLORATIONS) expect(urls).toContain(explorationHref(item.slug));
    const robots = labsRobots();
    expect(robots.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(await robots.text()).toContain('Sitemap: https://labs.sammii.dev/sitemap.xml');
  });

  it('keeps the main sitemap on its own host and excludes unpublished drafts', async () => {
    const entries = await sitemap();
    expect(entries.every((entry) => new URL(entry.url).host === 'sammii.dev')).toBe(true);
    expect(entries.some((entry) => /where-light-can-go|one-arrival-at-a-time/.test(entry.url))).toBe(false);
  });

  it('routes canonical Labs URLs and host-specific crawler endpoints before filesystem handling', () => {
    const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'));
    const route = (url: string) => config.routes.find((entry: { src?: string; has?: { type: string; value: string }[] }) =>
      entry.src && new RegExp(entry.src).test(url) && entry.has?.some((condition) => condition.type === 'host' && condition.value === 'labs.sammii.dev'));
    expect(route('/explorations/').dest).toBe('/labs/explorations/');
    expect(route('/explorations/black-hole-light-paths/').dest).toBe('/labs/explorations/$1');
    expect(route('/sitemap.xml').dest).toBe('/labs/sitemap.xml');
    expect(route('/robots.txt').dest).toBe('/labs/robots.txt');
    expect(route('/exploration-runtime/black-hole-light-paths/index.html')).toBeUndefined();
  });

  it('keeps article copy unpublished while connecting both copies to the same runtime', async () => {
    const published = await getAllPosts();
    for (const [article, slug] of [['where-light-can-go', 'black-hole-light-paths'], ['one-arrival-at-a-time', 'double-slit-experiment']]) {
      const raw = fs.readFileSync(path.join(process.cwd(), 'content/blog', `${article}.md`), 'utf8');
      const { data, content } = matter(raw);
      expect(data.draft).toBe(true);
      expect(data.date).toBeUndefined();
      expect(content).toContain(`<InteractiveExploration slug="${slug}" />`);
      expect(content).toContain(explorationHref(slug));
      expect(content).not.toContain('$$');
      expect(published.some((post) => post.slug === article)).toBe(false);
    }
  });
});
