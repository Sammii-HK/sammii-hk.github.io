import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts } from '../lib/blog';

export const metadata: Metadata = {
  title: 'Blog — sammii.dev',
  description: 'Thoughts on engineering, design, and building things.',
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-neutral-400 mb-12">Thoughts on engineering, design, and building things.</p>

      {posts.length === 0 ? (
        <p className="text-neutral-500">No posts yet.</p>
      ) : (
        <ul className="space-y-10">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <time className="text-sm text-neutral-500">
                  {new Date(post.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
                <h2 className="text-xl font-semibold mt-1 group-hover:underline">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="text-neutral-400 mt-1 text-sm">{post.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-neutral-500">{post.readingTime}</span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
