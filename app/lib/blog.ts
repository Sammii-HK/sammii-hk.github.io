import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

/**
 * Blog posts come from two places:
 *  - at build time, and as a fallback, the markdown in content/blog (bundled);
 *  - at request time on Vercel, the same folder on GitHub's master branch,
 *    cached for REVALIDATE seconds.
 * So a new post is a commit to content/blog: no deploy. The Vercel ignore
 * step (scripts/vercel-ignore-build.sh) skips builds for content-only
 * commits, and /api/revalidate refreshes the pages on demand.
 */
const CONTENT_DIR = path.join(process.cwd(), 'content/blog');
const REPO = 'Sammii-HK/sammii-hk.github.io';
const BRANCH = 'master';
export const REVALIDATE = 600;
const GH_HEADERS: Record<string, string> = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  draft: boolean;
  readingTime: string;
  content: string;
}

export interface BlogPostMeta extends Omit<BlogPost, 'content'> {}

function parse(slug: string, raw: string): BlogPost {
  const { data, content } = matter(raw);
  const stats = readingTime(content);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    tags: data.tags ?? [],
    draft: data.draft ?? false,
    readingTime: stats.text,
    content,
  };
}

// ── local (bundled) ──────────────────────────────────────────────────────────
function localSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
}
function localRaw(slug: string): string | null {
  const p = path.join(CONTENT_DIR, `${slug}.md`);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null;
}

// ── GitHub (live) ────────────────────────────────────────────────────────────
const live = () => !!process.env.VERCEL && process.env.NEXT_PHASE !== 'phase-production-build';

async function githubSlugs(): Promise<string[] | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/content/blog?ref=${BRANCH}`, {
      headers: { Accept: 'application/vnd.github+json', ...GH_HEADERS },
      next: { revalidate: REVALIDATE, tags: ['blog'] },
    });
    if (!res.ok) return null;
    const list = (await res.json()) as { name: string; type: string }[];
    return list.filter((f) => f.type === 'file' && f.name.endsWith('.md')).map((f) => f.name.replace(/\.md$/, ''));
  } catch {
    return null;
  }
}
async function githubRaw(slug: string): Promise<string | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/content/blog/${slug}.md`, {
      headers: GH_HEADERS,
      next: { revalidate: REVALIDATE, tags: ['blog', `blog:${slug}`] },
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

// ── public API ───────────────────────────────────────────────────────────────
export async function getAllSlugs(): Promise<string[]> {
  const gh = live() ? await githubSlugs() : null;
  // union so a post that exists in either place is served
  return Array.from(new Set([...(gh ?? []), ...localSlugs()])).sort();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const raw = (live() ? await githubRaw(slug) : null) ?? localRaw(slug);
  return raw ? parse(slug, raw) : null;
}

/** Every published post WITH its body, newest first: the feed, the API and llms-full.txt read this. */
export async function getAllPostsFull(includeDrafts = false): Promise<BlogPost[]> {
  const slugs = await getAllSlugs();
  const posts = await Promise.all(slugs.map((s) => getPostBySlug(s)));
  return posts
    .filter((p): p is BlogPost => !!p)
    .filter((p) => includeDrafts || !p.draft)
    .filter((p) => new Date(p.date) <= new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAllPosts(includeDrafts = false): Promise<BlogPostMeta[]> {
  return (await getAllPostsFull(includeDrafts)).map(({ content: _content, ...meta }) => meta);
}
