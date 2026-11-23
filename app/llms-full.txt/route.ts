// Preserve the public read-only route caching used before Next 15.
export const dynamic = 'force-static';

import { llmsFull } from '../lib/llms';
import { REVALIDATE } from '../lib/blog';

export const revalidate = 600;

export async function GET() {
  return new Response(await llmsFull(), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=86400` } });
}
