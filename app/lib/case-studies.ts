import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { caseStudyToMarkdown, validateCaseStudy, type Block, type StructuredCaseStudy } from './case-study-schema';

const CONTENT_DIR = path.join(process.cwd(), 'content/case-studies');

export interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  techStack: string;
  readingTime: string;
  /** The study as Markdown. For structured studies this is derived from the blocks. */
  content: string;
  /** Present when the study is structured (content/case-studies/<slug>.json). */
  structured?: {
    blocks: Block[];
    role?: string;
    period?: string;
    status?: string;
    facts?: Array<{ label: string; value: string }>;
    updated: string;
  };
}

export interface CaseStudyMeta extends Omit<CaseStudy, 'content' | 'structured'> {}

const jsonPath = (slug: string) => path.join(CONTENT_DIR, `${slug}.json`);
const mdPath = (slug: string) => path.join(CONTENT_DIR, `${slug}.md`);

function parseStructured(slug: string): CaseStudy {
  const raw = JSON.parse(fs.readFileSync(jsonPath(slug), 'utf-8')) as unknown;
  const errors = validateCaseStudy(raw, slug);
  // A study that does not validate fails the build rather than shipping half-broken.
  if (errors.length) throw new Error(`Invalid case study "${slug}":\n  - ${errors.join('\n  - ')}`);
  const study = raw as StructuredCaseStudy;
  const content = caseStudyToMarkdown(study);
  return {
    slug,
    title: study.title,
    description: study.description,
    techStack: study.techStack,
    readingTime: readingTime(content).text,
    content,
    structured: {
      blocks: study.blocks,
      role: study.role,
      period: study.period,
      status: study.status,
      facts: study.facts,
      updated: study.updated,
    },
  };
}

function parseMarkdown(slug: string): CaseStudy {
  const raw = fs.readFileSync(mdPath(slug), 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    techStack: data.techStack ?? '',
    readingTime: readingTime(content).text,
    content,
  };
}

/** A structured study wins over Markdown with the same slug, so a study moves over by adding its JSON. */
export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  if (fs.existsSync(jsonPath(slug))) return parseStructured(slug);
  if (fs.existsSync(mdPath(slug))) return parseMarkdown(slug);
  return null;
}

export function getAllCaseStudySlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const slugs = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.json'))
    .map((f) => f.replace(/\.(md|json)$/, ''));
  return Array.from(new Set(slugs));
}
