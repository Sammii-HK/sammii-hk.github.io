import { getAllPosts, REVALIDATE } from '../lib/blog';

export const revalidate = REVALIDATE;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** RSS 2.0 for the blog, regenerated with the posts. */
export async function GET() {
  const posts = await getAllPosts();
  const site = 'https://sammii.dev';
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${site}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${site}/blog/${p.slug}/</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sammii Kellow: blog</title>
    <link>${site}/blog/</link>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Design engineering, AI product engineering, typography, and the things I build.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date(posts[0]?.date ?? Date.now()).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=86400` } });
}
