// The slug API was request-time on Next 14. Keep it request-time while
// retaining the existing public CDN Cache-Control header below.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPostBySlug, REVALIDATE } from '../../../lib/blog';

/** GET /api/blog/{slug}/: one post with its full markdown body, for a GPT or any reader that needs the words. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = String(rawSlug ?? '').replace(/[^a-z0-9-]/gi, '');
  const post = slug ? await getPostBySlug(slug) : null;
  if (!post || post.draft) return NextResponse.json({ error: 'not found', slug }, { status: 404 });
  return NextResponse.json(
    { slug: post.slug, title: post.title, description: post.description, date: post.date, tags: post.tags, readingTime: post.readingTime, url: `https://sammii.dev/blog/${post.slug}/`, markdown: post.content },
    { headers: { 'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=86400` } },
  );
}
