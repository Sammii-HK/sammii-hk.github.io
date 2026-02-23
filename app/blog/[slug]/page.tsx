import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import { getAllSlugs, getPostBySlug } from '../../lib/blog';

const mdxOptions = {
  mdxOptions: {
    rehypePlugins: [
      [rehypePrettyCode, { theme: 'github-dark' }],
    ] as never,
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — sammii.dev`,
    description: post.description,
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.draft) notFound();

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/blog" className="text-sm text-neutral-400 hover:text-white mb-8 inline-block">
        ← All posts
      </Link>

      <header className="mb-10">
        <time className="text-sm text-neutral-500">
          {new Date(post.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
        <h1 className="text-3xl font-bold mt-2">{post.title}</h1>
        {post.description && (
          <p className="text-neutral-400 mt-2">{post.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3">
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
      </header>

      <article className="prose prose-invert prose-neutral max-w-none">
        <MDXRemote source={post.content} options={mdxOptions} />
      </article>
    </main>
  );
}
