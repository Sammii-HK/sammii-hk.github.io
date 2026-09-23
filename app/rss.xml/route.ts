import { getAllPostsFull, REVALIDATE } from '../lib/blog';
import { markdownToHtml } from '../lib/markdown-html';

export const revalidate = REVALIDATE;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * RSS 2.0 for the blog, regenerated with the posts. Each item carries the
 * full article in content:encoded, not just the summary: a feed of 64
 * headlines was why a GPT reading this feed could not see the writing.
 */
export async function GET() {
  const posts = await getAllPostsFull();
  const bodies = await Promise.all(posts.map((p) => markdownToHtml(p.content)));
  // CDATA cannot contain its own terminator
  const cdata = (html: string) => `<![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
  const site = 'https://sammii.dev';
  const items = posts
    .map(
      (p, i) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${site}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${site}/blog/${p.slug}/</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
      <content:encoded>${cdata(bodies[i])}</content:encoded>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
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
