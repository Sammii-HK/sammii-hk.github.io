/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    // Production is served by Vercel, which optimises /_next/image at the edge
    // even for a static export. Anywhere else (local dev, a plain static host)
    // the default loader is incompatible with `output: 'export'` and 500s, so
    // fall back to plain <img> there. Production output is unchanged.
    unoptimized: !process.env.VERCEL,
  },
};

export default nextConfig;
