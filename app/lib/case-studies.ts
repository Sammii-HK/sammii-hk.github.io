import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const CONTENT_DIR = path.join(process.cwd(), 'content/case-studies');

export interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  techStack: string;
  readingTime: string;
  content: string;
}

export interface CaseStudyMeta extends Omit<CaseStudy, 'content'> {}

function parseCaseStudy(slug: string): CaseStudy {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    techStack: data.techStack ?? '',
    readingTime: stats.text,
    content,
  };
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return parseCaseStudy(slug);
}

export function getAllCaseStudySlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}
