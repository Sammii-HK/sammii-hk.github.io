import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHARTS, chartHref } from '../../labs/charts/registry';
import { FACTS } from '../../labs/charts/facts';
import latency from '../../labs/charts/llm-latency/data.json';
import tokenData from '../../labs/charts/tokens/data.json';
import grimoire from '../../labs/charts/grimoire-map/data.json';
import labsSitemap from '../../labs/sitemap';

// These establish the shipped data and route chain, not browser usability or
// the validity of a scientific model. No models, providers or corpora are run.
describe('Labs source receipts', () => {
  it('connects all 37 chart entries to real source, canonical routes, notes and sitemap entries', () => {
    expect(CHARTS).toHaveLength(37);
    expect(new Set(CHARTS.map(c => c.slug)).size).toBe(37);
    expect(new Set(CHARTS.map(c => c.n)).size).toBe(37);
    const sitemap = new Set(labsSitemap().map(entry => entry.url));
    for (const chart of CHARTS) {
      const page = resolve('app/labs/charts', chart.slug, 'page.tsx');
      const source = readFileSync(page, 'utf8');
      expect(source).toContain(chartHref(chart.slug));
      expect(source).toContain('chart-foot');
      expect(sitemap.has(chartHref(chart.slug))).toBe(true);
      const imports = Array.from(source.matchAll(/from ["']([^"']*components\/charts\/[^"']+)["']/g));
      expect(imports.length).toBeGreaterThan(0);
      for (const match of imports) {
        expect(existsSync(resolve(dirname(page), `${match[1]}.tsx`))).toBe(true);
      }
      expect(FACTS[chart.slug]?.length).toBeGreaterThan(0);
    }
    expect(Object.keys(FACTS).sort()).toEqual(CHARTS.map(c => c.slug).sort());
  });

  it('reconciles recorded latency comparisons with raw calls and the separate priming call', () => {
    const records = readFileSync(resolve('scripts/labs/llm-runs-2026-10-19.jsonl'), 'utf8')
      .trim().split('\n').map(line => JSON.parse(line));
    expect(records[0].model).toBe(latency.model);
    const successful = records.slice(1).filter(r => r.chunks?.length);
    const priming = successful.filter(r => r.condition === 'prime');
    expect(successful).toHaveLength(28);
    expect(priming).toHaveLength(1);
    for (const [id, condition] of Object.entries(latency.conditions)) {
      const calls = successful.filter(r => {
        const actual = ['short', 'long', 'cached'].includes(r.condition)
          && (r.server?.load_duration ?? 0) > 300e6 ? 'cold' : r.condition;
        return actual === id;
      });
      expect(calls).toHaveLength(condition.n);
      const representative = calls.sort((a, b) => a.chunks[0][0] - b.chunks[0][0])[Math.floor(calls.length / 2)];
      expect(representative.chunks).toEqual(condition.example.chunks);
      expect(representative.end).toBe(condition.example.phases.total);
    }
    expect(Object.values(latency.conditions).reduce((n, c) => n + c.n, 0)).toBe(27);
  });

  it('reconstructs every recorded token sample byte for byte, including byte fallback', () => {
    type Token = [number, string | null, string?];
    for (const sample of [...tokenData.samples, ...tokenData.strawberry]) {
      for (const tokenizer of tokenData.tokenizers) {
        const tokens = (sample.tokens as unknown as Record<string, Token[]>)[tokenizer.id];
        const bytes = tokens.map(t => t[1] === null
          ? Buffer.from(t[2]!.replace(/\s/g, ''), 'hex') : Buffer.from(t[1], 'utf8'));
        expect(Buffer.concat(bytes)).toEqual(Buffer.from(sample.text, 'utf8'));
        for (const token of tokens) expect(token[0]).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('keeps every grimoire point and neighbour index inside the recorded dataset', () => {
    expect(grimoire.points).toHaveLength(grimoire.n);
    // Preserve the recorded layout, while exposing its seven duplicate destinations.
    expect(new Set(grimoire.points.map(p => p[0])).size).toBe(1951);
    const duplicates = grimoire.points.filter((p, i, all) => all.findIndex(other => other[0] === p[0]) !== i);
    expect(duplicates).toHaveLength(7);
    expect(duplicates.every(p => (p[0] as string).startsWith('correspondences/days/'))).toBe(true);
    expect(grimoire.points.filter(p => p[5] === 1)).toHaveLength(grimoire.withBody);
    for (const point of grimoire.points) {
      expect(Number.isFinite(point[3])).toBe(true);
      expect(Number.isFinite(point[4])).toBe(true);
      for (const index of point[6] as number[]) {
        expect(Number.isInteger(index)).toBe(true);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(grimoire.n);
      }
    }
    const slugs = new Set(grimoire.points.map(p => p[0]));
    for (const neighbour of grimoire.neighbours) expect(slugs.has(neighbour.slug)).toBe(true);
  });
});
