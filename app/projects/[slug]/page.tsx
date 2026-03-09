import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import { getAllCaseStudySlugs, getCaseStudyBySlug } from '../../lib/case-studies';
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
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return {};

  const url = `https://sammii.dev/projects/${slug}`;

  return {
    title: `${study.title} — sammii.dev`,
    description: study.description,
    openGraph: {
      title: `${study.title} — sammii.dev`,
      description: study.description,
      type: 'article',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${study.title} — sammii.dev`,
      description: study.description,
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  const url = `https://sammii.dev/projects/${slug}`;

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <ArticleJsonLd
        title={study.title}
        description={study.description}
        date={new Date().toISOString()}
        url={url}
      />
      <Breadcrumbs
        crumbs={[
          { label: 'sammii.dev', href: '/' },
          { label: 'Projects', href: '/' },
          { label: study.title },
        ]}
      />

      <header className="mb-10">
        <h1 className="text-3xl font-bold mt-2">{study.title}</h1>
        {study.description && (
          <p className="text-neutral-400 mt-2">{study.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs text-neutral-500">{study.readingTime}</span>
          <span className="text-xs text-neutral-500">{study.techStack}</span>
        </div>
      </header>

      <article className="prose prose-invert prose-neutral max-w-none">
        <MDXRemote source={study.content} options={mdxOptions} />
      </article>
    </main>
  );
}
