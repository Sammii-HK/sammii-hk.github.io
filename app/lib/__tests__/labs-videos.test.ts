import { describe, it, expect } from "vitest";
import DATA from "../../labs/charts/videos/data.json";
// the build script itself, so the tests exercise the same parser and median
import { parseCsv, median, spearman } from "../../../scripts/labs/video-engagement.mjs";

// Chart 34 publishes per-video numbers from a private analytics export. These
// tests hold the line on what may leave it (numbers and category ids only)
// and check that every aggregate on the page can be recomputed from the rows.

type V = { a: string; s: number; er: number; v: number; f: string; t: string; e: string | null };
const videos = DATA.videos as V[];
const r1 = (x: number) => Math.round(x * 1000) / 10;

describe("chart 34 data: what is published", () => {
  it("has 900 videos, each with only numeric fields and known ids", () => {
    expect(videos).toHaveLength(900);
    const accounts = new Set(DATA.accounts.map((a) => a.id)), formats = new Set(DATA.formats.map((f) => f.id)), eras = new Set(DATA.eras.map((e) => e.id));
    for (const v of videos) {
      expect(Object.keys(v).sort()).toEqual(["a", "e", "er", "f", "s", "t", "v"]);
      expect(accounts.has(v.a)).toBe(true);
      expect(formats.has(v.f)).toBe(true);
      expect(["short", "long", "none", "unknown"]).toContain(v.t);
      expect(v.e === null || eras.has(v.e)).toBe(true);
      expect(Number.isInteger(v.s) && Number.isInteger(v.v)).toBe(true);
      expect(v.er).toBeGreaterThanOrEqual(0);
      expect(v.er).toBeLessThan(1);
    }
  });

  it("contains no free text: every string in the file is a short label or a fixed note", () => {
    const strings: string[] = [];
    const walk = (x: unknown) => { if (typeof x === "string") strings.push(x); else if (x && typeof x === "object") Object.values(x).forEach(walk); };
    walk(DATA);
    // no ids (TikTok ids are 19 digits), no dates finer than a month, nothing long enough to be a caption
    for (const s of strings) {
      expect(s).not.toMatch(/\d{12,}/);
      expect(s).not.toMatch(/\b20\d\d-\d\d-\d\d\b/);
      expect(s.length).toBeLessThan(160);
    }
  });
});

describe("chart 34 data: every aggregate recomputes from the rows", () => {
  const scope = (id: string) => (id === "all" ? videos : videos.filter((v) => v.a === id));
  it("length buckets", () => {
    for (const [id, rows] of Object.entries(DATA.byBucket)) {
      for (const b of rows) {
        const spec = DATA.buckets.find((x) => x.id === b.bucket)!;
        const vs = scope(id).filter((v) => v.s >= spec.min && v.s <= (spec.max ?? Infinity));
        expect(b.n, `${id} ${b.bucket}`).toBe(vs.length);
        if (vs.length) expect(b.medianEr, `${id} ${b.bucket}`).toBe(r1(median(vs.map((v) => v.er))));
      }
    }
  });
  it("formats and eras", () => {
    for (const [id, rows] of Object.entries(DATA.byFormat)) for (const f of rows) expect(f.n).toBe(scope(id).filter((v) => v.f === f.format).length);
    for (const e of DATA.eras) {
      const vs = videos.filter((v) => v.e === e.id);
      expect(e.n).toBe(vs.length);
      expect(e.medianEr).toBe(r1(median(vs.map((v) => v.er))));
    }
  });
  it("matches the analysis's headline numbers", () => {
    const sp = Object.fromEntries(DATA.byBucket.sparkle.map((b) => [b.bucket, b]));
    expect([sp.le8.medianEr, sp["21-45"].medianEr, sp.gt45.medianEr]).toEqual([13.6, 1.9, 1.3]);
    // 72 in the analysis, which kept the three Sparkle posts with no recorded length in this bucket
    expect(sp.le8.n + DATA.noDuration.byAccount.sparkle).toBe(72);
    const pipeline = DATA.eras.find((e) => e.id === "pipeline")!;
    expect([pipeline.medianEr, pipeline.n]).toEqual([1.4, 28]);
    expect(DATA.cover.sparkle).toMatchObject({ withText: 89, n: 154 });
    expect(DATA.cover.pipeline).toMatchObject({ withText: 1, n: 28 });
    expect(DATA.reach).toMatchObject({ spearman: -0.33, overlap: 0 });
  });
});

describe("chart 34 script helpers", () => {
  it("parses quoted CSV fields with commas, quotes and newlines", () => {
    expect(parseCsv('a,b\n1,"x, ""y""\nz"\n2,w\n')).toEqual([{ a: "1", b: 'x, "y"\nz' }, { a: "2", b: "w" }]);
  });
  it("median and Spearman behave like Python's", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(spearman([1, 2, 3, 4], [10, 20, 30, 40])).toBeCloseTo(1);
    expect(spearman([1, 2, 3, 4], [4, 3, 2, 1])).toBeCloseTo(-1);
  });
});
