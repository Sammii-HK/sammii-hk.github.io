import { NextResponse } from 'next/server';
import { getPostBySlug, REVALIDATE } from '../../../lib/blog';

export const revalidate = REVALIDATE;

/** GET /api/blog/{slug}/: one post with its full markdown body, for a GPT or any reader that needs the words. */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const slug = String(params.slug ?? '').replace(/[^a-z0-9-]/gi, '');
  const post = slug ? await getPostBySlug(slug) : null;
  if (!post || post.draft) return NextResponse.json({ error: 'not found', slug }, { status: 404 });
  return NextResponse.json(
    { slug: post.slug, title: post.title, description: post.description, date: post.date, tags: post.tags, readingTime: post.readingTime, url: `https://sammii.dev/blog/${post.slug}/`, markdown: post.content },
    { headers: { 'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=86400` } },
  );
}
