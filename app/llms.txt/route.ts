import { llmsIndex } from '../lib/llms';
import { REVALIDATE } from '../lib/blog';

export const revalidate = REVALIDATE;

export async function GET() {
  return new Response(await llmsIndex(), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=86400` } });
}
