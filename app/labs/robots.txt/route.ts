/** Served at labs.sammii.dev/robots.txt by the host-specific Vercel route. */
export function GET() {
  return new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /ops/',
      'Disallow: /hero-lab/',
      'Disallow: /api/revalidate',
      '',
      'Sitemap: https://labs.sammii.dev/sitemap.xml',
      'Host: https://labs.sammii.dev',
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
