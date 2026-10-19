#!/usr/bin/env node
/**
 * Chart 34, "What 900 videos taught me": turns the per-video TikTok table
 * from the studio-qa analysis into the aggregate JSON the chart reads.
 *
 *   node scripts/labs/video-engagement.mjs [path/to/videos.csv]
 *
 * Input: studio-qa/analysis/data/videos.csv (900 videos, six accounts, from
 * the TikTok analytics export pulled on 18 Oct 2026; built by
 * studio-qa/analysis/scripts/analyse.py). Output:
 * app/labs/charts/videos/data.json.
 *
 * Only numbers and category labels leave this script. Captions, on-screen
 * text, video ids, exact dates and topics are read past and never written:
 * the CSV stays on the Mac, the JSON is what the site commits.
 *
 * Definitions match the analysis (performance-deep-dive.md): engagement
 * rate (ER) is (likes + comments + shares) / views, as the CSV's `er`
 * column already holds it to four places; "pushed" is 500 views or more;
 * medians are the midpoint of the two middle values for an even count, as
 * Python's statistics.median does.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = process.argv[2] ?? resolve(homedir(), "development/studio-qa/analysis/data/videos.csv");
const OUT = resolve(ROOT, "app/labs/charts/videos/data.json");

/** RFC 4180: quoted fields may hold commas, doubled quotes and newlines. */
export function parseCsv(text) {
  const rows = []; let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(head.map((h, k) => [h, r[k]])));
}

export const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Spearman's rho with average ranks for ties, as in the analysis's stats.py. */
export function spearman(a, b) {
  const rank = (x) => {
    const o = x.map((_, i) => i).sort((i, j) => x[i] - x[j]); const r = new Array(x.length);
    for (let i = 0; i < o.length;) { let j = i; while (j + 1 < o.length && x[o[j + 1]] === x[o[i]]) j++; for (let k = i; k <= j; k++) r[o[k]] = (i + j) / 2; i = j + 1; }
    return r;
  };
  const ra = rank(a), rb = rank(b), n = a.length, ma = ra.reduce((s, v) => s + v, 0) / n, mb = rb.reduce((s, v) => s + v, 0) / n;
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) { cov += (ra[i] - ma) * (rb[i] - mb); va += (ra[i] - ma) ** 2; vb += (rb[i] - mb) ** 2; }
  return va && vb ? cov / Math.sqrt(va * vb) : 0;
}

const ACCOUNTS = [
  { id: "sparkle", handle: "sammiisparkle", label: "Sparkle", what: "My personal account." },
  { id: "technically-blonde", handle: "soloprenuer_sammii", label: "technically blonde", what: "Founder and job-search account. Every video a scripted talking head." },
  { id: "seer", handle: "seer_sammii", label: "Seer", what: "Tarot readings." },
  { id: "stardust", handle: "sammiistardust", label: "Stardust", what: "Astrology transits, as talking heads." },
  { id: "spellbound", handle: "sammii_spellbound", label: "Spellbound", what: "Moon timing. Eight videos, too few to read anything into." },
  { id: "lunary", handle: "lunary_app", label: "Lunary", what: "The app's own account, kept as a contrast: a brand, not a person." },
];
const ACCOUNT_BY_HANDLE = Object.fromEntries(ACCOUNTS.map((a) => [a.handle, a.id]));

const FORMATS = [
  { id: "silent-text", from: "silent clip + text overlay", label: "Silent clip, text on screen", rule: "12 s or shorter, with text on the cover frame." },
  { id: "short-clip", from: "short clip, no first-frame text", label: "Short clip, no text on the cover", rule: "12 s or shorter, no text found on the cover frame." },
  { id: "longer-text", from: "longer clip + text overlay", label: "Longer clip, text on screen", rule: "Over 12 s, with text on the cover frame." },
  { id: "music", from: "music / dance to camera", label: "Music or dance", rule: "The caption is about a tune, a remix or a dance." },
  { id: "scripted", from: "scripted talking head (seated, pipeline era)", label: "Scripted talking head", rule: "Seated, scripted, to camera: every technically blonde video, and Sparkle's June and July 2026 videos of 13 s or more." },
  { id: "unscripted", from: "unscripted talking / vlog (no overlay)", label: "Unscripted talking or vlog", rule: "Over 12 s, unscripted, no text on the cover frame." },
  { id: "no-duration", from: null, label: "No length recorded", rule: "The export gives these posts a duration of 0 s, so they have no place on a length axis." },
];
const FORMAT_BY_SOURCE = Object.fromEntries(FORMATS.filter((f) => f.from).map((f) => [f.from, f.id]));

const BUCKETS = [
  { id: "le8", label: "8 s or less", min: 1, max: 8 },
  { id: "9-20", label: "9 to 20 s", min: 9, max: 20 },
  { id: "21-45", label: "21 to 45 s", min: 21, max: 45 },
  { id: "gt45", label: "Over 45 s", min: 46, max: Infinity },
];
const bucketOf = (s) => BUCKETS.find((b) => s >= b.min && s <= b.max)?.id ?? null;

/** Sparkle's eras, with the boundaries the analysis's stats.py uses. */
const ERAS = [
  { id: "2023", label: "2023: music and vlogs", until: "2024-01-01" },
  { id: "2025-summer", label: "Aug to Sep 2025: short clips", until: "2025-09-30" },
  { id: "2025-oct", label: "30 Sep to 22 Oct 2025: mostly one silent template", until: "2025-10-23" },
  { id: "2025-26", label: "Late Oct 2025 to May 2026: mixed", until: "2026-06-01" },
  { id: "pipeline", label: "Jun to Jul 2026: scripted talking heads from the pipeline", until: "2026-08-01" },
  { id: "2026-vlog", label: "Aug to Sep 2026: unscripted vlogs", until: "9999" },
];
const eraOf = (date) => ERAS.find((e) => date < e.until).id;

const COVER = { "short hook": "short", "long block": "long", none: "none", "unknown (cover failed)": "unknown" };
const r1 = (x) => (x == null ? null : Math.round(x * 1000) / 10); // fraction to a percentage, 1 dp
const PUSH = 500;

export function build(rows) {
  const videos = rows.map((r) => {
    const a = ACCOUNT_BY_HANDLE[r.account]; if (!a) throw new Error(`unknown account ${r.account}`);
    const s = Number(r.duration_s), f = s === 0 ? "no-duration" : FORMAT_BY_SOURCE[r.inferred_format];
    if (!f) throw new Error(`unknown format ${r.inferred_format}`);
    const t = COVER[r.onscreen_kind]; if (!t) throw new Error(`unknown cover kind ${r.onscreen_kind}`);
    return { a, s, er: Number(r.er), v: Number(r.views), f, t, e: a === "sparkle" ? eraOf(r.date) : null, month: r.date.slice(0, 7) };
  });
  const scopes = [...ACCOUNTS.map((a) => a.id), "all"];
  const inScope = (id) => (id === "all" ? videos : videos.filter((v) => v.a === id));
  const summary = (vs) => ({ n: vs.length, medianEr: r1(median(vs.map((v) => v.er))), medianViews: median(vs.map((v) => v.v)), pushed: vs.filter((v) => v.v >= PUSH).length });

  const accounts = ACCOUNTS.map(({ handle: _h, ...a }) => {
    const vs = inScope(a.id), months = vs.map((v) => v.month).sort();
    return { ...a, ...summary(vs), from: months[0], to: months[months.length - 1] };
  });
  const byBucket = Object.fromEntries(scopes.map((id) => [id, BUCKETS.map((b) => ({ bucket: b.id, ...summary(inScope(id).filter((v) => bucketOf(v.s) === b.id)) }))]));
  const byFormat = Object.fromEntries(scopes.map((id) => [id, FORMATS.map((f) => ({ format: f.id, ...summary(inScope(id).filter((v) => v.f === f.id)) })).filter((x) => x.n > 0)]));

  const sparkle = inScope("sparkle");
  const eras = ERAS.map(({ until: _u, ...e }) => {
    const vs = sparkle.filter((v) => v.e === e.id), timed = vs.filter((v) => v.s > 0), months = vs.map((v) => v.month).sort();
    return { ...e, ...summary(vs), from: months[0], to: months[months.length - 1], medianSeconds: median(timed.map((v) => v.s)), coverText: vs.filter((v) => v.t === "short" || v.t === "long").length, shortShare: Math.round((timed.filter((v) => v.s <= 8).length / timed.length) * 100) };
  });
  // Inside one era, short against longer: does length still matter when the era is held still?
  const withinEra = ERAS.map((e) => {
    const timed = sparkle.filter((v) => v.e === e.id && v.s > 0);
    const short = timed.filter((v) => v.s <= 8), long = timed.filter((v) => v.s > 8);
    return { era: e.id, short: { n: short.length, medianEr: r1(median(short.map((v) => v.er))) }, longer: { n: long.length, medianEr: r1(median(long.map((v) => v.er))) } };
  }).filter((x) => x.short.n >= 5 && x.longer.n >= 5);

  const covered = (vs) => ({ n: vs.length, withText: vs.filter((v) => v.t === "short" || v.t === "long").length, unknown: vs.filter((v) => v.t === "unknown").length });
  const cover = { sparkle: covered(sparkle), pipeline: covered(sparkle.filter((v) => v.e === "pipeline")), "technically-blonde": covered(inScope("technically-blonde")) };

  const top = Math.round(sparkle.length * 0.2);
  const topViews = new Set([...sparkle].sort((x, y) => y.v - x.v).slice(0, top));
  const topEr = [...sparkle].sort((x, y) => y.er - x.er).slice(0, top);
  const reach = { account: "sparkle", spearman: Math.round(spearman(sparkle.map((v) => v.v), sparkle.map((v) => v.er)) * 100) / 100, topN: top, overlap: topEr.filter((v) => topViews.has(v)).length };

  const zero = videos.filter((v) => v.s === 0);
  const noDuration = { n: zero.length, byAccount: Object.fromEntries(ACCOUNTS.map((a) => [a.id, zero.filter((v) => v.a === a.id).length]).filter(([, n]) => n > 0)) };

  return {
    about: "Aggregates and per-video numbers for labs.sammii.dev/charts/videos/. No captions, on-screen text, ids, topics or exact dates.",
    source: { export: "TikTok analytics export, pulled 18 Oct 2026", table: "studio-qa/analysis/data/videos.csv", analysis: "studio-qa/analysis/performance-deep-dive.md", rows: rows.length },
    generatedBy: "scripts/labs/video-engagement.mjs",
    definitions: { er: "(likes + comments + shares) / views", pushed: `${PUSH} views or more`, median: "midpoint of the two middle values for an even count", percentages: "medianEr is a percentage to one decimal place; per-video er is a fraction to four" },
    accounts, formats: FORMATS.map(({ from: _f, ...f }) => f), buckets: BUCKETS.map((b) => ({ ...b, max: Number.isFinite(b.max) ? b.max : null })), eras,
    byBucket, byFormat, withinEra, cover, reach, noDuration,
    fields: { a: "account id", s: "length in seconds (0: none recorded)", er: "engagement rate, fraction", v: "views", f: "format id", t: "text on the cover frame: short, long, none or unknown", e: "Sparkle era id, null elsewhere" },
    videos: videos.map(({ month: _m, ...v }) => v),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = build(parseCsv(readFileSync(SRC, "utf8")));
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 1).replace(/\{\n\s+"a": ([^}]*?)\n\s+\}/g, (m) => m.replace(/\n\s+/g, " ")) + "\n");
  const sp = data.byBucket.sparkle;
  console.log(`${data.videos.length} videos -> ${OUT.replace(ROOT + "/", "")}`);
  console.log(`Sparkle by length: ${sp.map((b) => `${b.bucket} ${b.medianEr}% (n=${b.n})`).join(", ")}`);
  console.log(`Pipeline era: ${data.eras.find((e) => e.id === "pipeline").medianEr}% (n=${data.cover.pipeline.n}); cover text ${data.cover.sparkle.withText}/${data.cover.sparkle.n} vs ${data.cover.pipeline.withText}/${data.cover.pipeline.n}`);
}
