import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import { getAllSlugs, getPostBySlug } from '../../lib/blog';
import { Breadcrumbs } from '../../src/components/Breadcrumbs';
import { ArticleJsonLd } from '../../src/components/ArticleJsonLd';

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

  const url = `https://sammii.dev/blog/${slug}`;

  return {
    title: `${post.title} — sammii.dev`,
    description: post.description,
    openGraph: {
      title: `${post.title} — sammii.dev`,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: ['Sammii'],
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — sammii.dev`,
      description: post.description,
      images: [`/blog/${slug}/opengraph-image`],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.draft) notFound();
  const isFuture = new Date(post.date) > new Date();
  if (isFuture) notFound();

  const url = `https://sammii.dev/blog/${slug}`;

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        date={post.date}
        url={url}
        tags={post.tags}
      />

      <Breadcrumbs
        crumbs={[
          { label: 'sammii.dev', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]}
      />

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
