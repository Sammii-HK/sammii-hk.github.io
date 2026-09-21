import { NextResponse } from 'next/server';
import { projects } from '../../common/data/projects';
import { getAllCaseStudySlugs, getCaseStudyBySlug } from '../../lib/case-studies';
import { CHARTS, chartHref } from '../../labs/charts/registry';
import { getAllPosts, REVALIDATE } from '../../lib/blog';

export const revalidate = REVALIDATE;

/**
 * GET /api/projects: everything a writer (or a GPT) needs to know about the
 * work, as one JSON document: every project with its case study text, the
 * charts, and the blog index. Public and read-only; the same facts the site
 * shows. Write from this, not from memory.
 */
export async function GET() {
  const studies = new Map(getAllCaseStudySlugs().map((s) => [s, getCaseStudyBySlug(s)]));
  const list = projects.map((p) => {
    const cs = p.caseStudy ? studies.get(p.caseStudy) : null;
    return {
      id: p.id,
      title: p.title,
      type: p.type,
      home: p.home,
      group: p.group,
      techStack: p.techStack,
      info: p.info,
      highlights: p.highlights ?? [],
      liveUrl: p.liveUrl ?? null,
      repoUrl: p.privateRepo || p.noRepo ? null : `https://github.com/sammii-hk/${p.id}`,
      caseStudyUrl: p.caseStudy ? `https://sammii.dev/projects/${p.caseStudy}/` : null,
      caseStudy: cs ? { description: cs.description, techStack: cs.techStack, markdown: cs.content } : null,
      labs: p.labs ?? null,
    };
  });
  const posts = (await getAllPosts()).map((b) => ({ slug: b.slug, title: b.title, description: b.description, date: b.date, tags: b.tags, url: `https://sammii.dev/blog/${b.slug}/` }));
  return NextResponse.json(
    {
      person: { name: 'Sammii Kellow', site: 'https://sammii.dev', labs: 'https://labs.sammii.dev', x: 'https://x.com/technicalyblond', github: 'https://github.com/sammii-hk', linkedin: 'https://www.linkedin.com/in/sammii' },
      rules: ['UK English', 'no em or en dashes', 'never state years of experience', 'every number must come from these facts', 'first person, build-in-public voice'],
      projects: list,
      charts: CHARTS.map((c) => ({ ...c, url: chartHref(c.slug) })),
      posts,
      generatedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=86400` } },
  );
}
