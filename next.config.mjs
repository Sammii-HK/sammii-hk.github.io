/** @type {import('next').NextConfig} */
const nextConfig = {
  // No static export any more: the blog is served with ISR so a new post is a
  // commit, not a deploy (see app/lib/blog.ts). Everything else still
  // prerenders at build.
  trailingSlash: true,
  images: {
    // Vercel optimises /_next/image at the edge; locally keep plain <img>.
    unoptimized: !process.env.VERCEL,
  },
};

export default nextConfig;
