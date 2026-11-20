import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import { getAllCaseStudySlugs, getCaseStudyBySlug } from '../../lib/case-studies';
import { projects } from '../../common/data/projects';
import { ArticleJsonLd } from '../../src/components/ArticleJsonLd';
import { SiteShell } from '../../src/components/site/SiteShell';
import { CaseStudyHero } from '../../src/components/case-study/CaseStudyHero';
import { caseStudyComponents } from '../../src/components/case-study/mdx-components';
import { CaseStudyBlocks, CaseStudyFacts } from '../../src/components/case-study/CaseStudyBlocks';
import { ArrowRight } from "lucide-react";

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

  const url = `https://sammii.dev/projects/${slug}/`;

  return {
    title: `${study.title} · sammii.dev`,
    description: study.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${study.title} · sammii.dev`,
      description: study.description,
      type: 'article',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${study.title} · sammii.dev`,
      description: study.description,
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  const url = `https://sammii.dev/projects/${slug}/`;
  const project = projects.find((p) => p.caseStudy === slug) ?? null;

  return (
    <SiteShell current="work" breadcrumbs={[{label:"Home",href:"/"},{label:"Work",href:"/work/"},{label:study.title}]}>
      <main id="main" className="case-study">
        <ArticleJsonLd
          title={study.title}
          description={study.description}
          date={study.structured ? new Date(study.structured.updated).toISOString() : new Date().toISOString()}
          url={url}
        />
        <CaseStudyHero
          title={study.title}
          description={study.description}
          techStack={study.techStack}
          readingTime={study.readingTime}
          project={project}
        />
        {study.structured ? (
          <>
            <CaseStudyFacts {...study.structured} />
            <article className="prose prose-neutral dark:prose-invert max-w-none case-body">
              <CaseStudyBlocks blocks={study.structured.blocks} />
            </article>
          </>
        ) : (
          <article className="prose prose-neutral dark:prose-invert max-w-none case-body">
            <MDXRemote source={study.content} options={mdxOptions} components={caseStudyComponents} />
          </article>
        )}
        <nav className="case-foot" aria-label="More">
          <a href="/work/">All work <ArrowRight size={14} className="icon-inline" aria-hidden="true" /></a>
          <a href="/">Front page</a>
        </nav>
      </main>
    </SiteShell>
  );
}
