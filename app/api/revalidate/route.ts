import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/revalidate?secret=…[&slug=…]
 * Called by whatever publishes a post (after it pushes content/blog/<slug>.md)
 * so the new post shows up at once instead of at the next revalidate window.
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const slug = req.nextUrl.searchParams.get('slug');
  revalidateTag('blog');
  revalidatePath('/blog');
  revalidatePath('/rss.xml');
  if (slug && /^[a-z0-9-]+$/.test(slug)) {
    revalidateTag(`blog:${slug}`);
    revalidatePath(`/blog/${slug}`);
  }
  return NextResponse.json({ ok: true, slug: slug ?? null, at: new Date().toISOString() });
}
