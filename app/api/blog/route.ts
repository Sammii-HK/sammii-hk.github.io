import { NextResponse } from 'next/server';
import { getAllPosts, REVALIDATE } from '../../lib/blog';

export const revalidate = REVALIDATE;

/** GET /api/blog/: every published post, newest first, without bodies. Fetch one by slug for the full text. */
export async function GET() {
  const posts = (await getAllPosts()).map((p) => ({
    slug: p.slug, title: p.title, description: p.description, date: p.date, tags: p.tags,
    readingTime: p.readingTime, url: `https://sammii.dev/blog/${p.slug}/`, api: `https://sammii.dev/api/blog/${p.slug}/`,
  }));
  return NextResponse.json({ count: posts.length, posts }, { headers: { 'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=86400` } });
}
