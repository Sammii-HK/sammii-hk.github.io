import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { caseStudyToMarkdown, validateCaseStudy } from '../case-study-schema';
import { getAllCaseStudySlugs, getCaseStudyBySlug } from '../case-studies';

const base = { title: 'T', description: 'D', techStack: 'S', updated: '2026-11-19' };

describe('validateCaseStudy', () => {
  it('accepts a minimal study', () => {
    expect(validateCaseStudy({ ...base, blocks: [{ type: 'prose', body: 'Hi' }] }, 'x')).toEqual([]);
  });

  it('reports every problem at once', () => {
    const errors = validateCaseStudy({ title: 'T', blocks: [{ type: 'nope' }, { type: 'prose' }] }, 'x');
    expect(errors).toContain('x.description: required');
    expect(errors).toContain('x.blocks[0].type: unknown block type "nope"');
    expect(errors).toContain('x.blocks[1].body: required for prose');
  });

  it('needs a source on every number', () => {
    const errors = validateCaseStudy({ ...base, blocks: [{ type: 'metrics', items: [{ label: 'Users', value: '10k' }] }] }, 'x');
    expect(errors).toEqual(['x.blocks[0].items[0].source: every number names where it came from']);
  });

  it('needs exactly one chosen option in a decision', () => {
    const decision = { type: 'decision', heading: 'H', context: 'C', outcome: 'O', options: [{ label: 'A', detail: 'a' }, { label: 'B', detail: 'b' }] };
    expect(validateCaseStudy({ ...base, blocks: [decision] }, 'x')).toEqual(['x.blocks[0].options: mark exactly one as chosen']);
  });

  it('needs alt text on media', () => {
    const errors = validateCaseStudy({ ...base, blocks: [{ type: 'media', items: [{ src: '/a.png' }] }] }, 'x');
    expect(errors[0]).toMatch(/alt: required/);
  });
});

describe('case studies on disk', () => {
  const dir = path.join(process.cwd(), 'content/case-studies');
  const jsonSlugs = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));

  it.each(jsonSlugs)('%s validates and flattens to Markdown', (slug) => {
    const study = getCaseStudyBySlug(slug);
    expect(study?.structured).toBeDefined();
    expect(study!.content.length).toBeGreaterThan(200);
    expect(caseStudyToMarkdown({ ...base, blocks: study!.structured!.blocks })).toContain('##');
  });

  it('lists each slug once even when both formats exist', () => {
    const slugs = getAllCaseStudySlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
