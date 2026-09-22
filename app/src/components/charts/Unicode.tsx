"use client";
import { useMemo, useState } from "react";

/**
 * Why "family".length lies: a string has four lengths, and JavaScript
 * gives you the wrong one by default. Type anything and watch the four
 * counts diverge, then see what a "20 character limit" written with
 * .slice() actually does to a name, a flag and a family.
 */
const SAMPLES: { name: string; text: string; why: string }[] = [
  { name: "A family", text: "👨‍👩‍👧‍👦", why: "One grapheme, four people joined by zero-width joiners: 7 code points, 11 UTF-16 units, 25 bytes." },
  { name: "A flag", text: "🇬🇧", why: "Two regional-indicator code points that render as one flag. Cut it in half and you get two letters in boxes." },
  { name: "A skin tone", text: "👍🏽", why: "A base emoji plus a modifier. .length says 4." },
  { name: "Café, two ways", text: "café café", why: "The first é is one precomposed code point, the second is e plus a combining accent. They look identical, compare unequal, and sort apart until you normalise." },
  { name: "A name", text: "Nguyễn Thị Minh Khai", why: "Vietnamese stacks two diacritics on one letter. A 20-character limit counted in UTF-16 units rejects a 20-letter name." },
  { name: "Devanagari", text: "नमस्ते", why: "Six code points, three graphemes: consonant clusters and vowel signs combine. Backspace deletes by grapheme, .length counts by unit." },
  { name: "Right to left", text: "hello עולם 123", why: "Mixed direction: the logical order in memory is not the visual order on screen. Cursor arithmetic by index is wrong here." },
  { name: "Zalgo", text: "s̸̡̛̪͔̈́̇̕a̶̙̯̤̒m̷̧̗̼̉̄̈́m̴̳̖̈͒̕i̵̳͇̇̆̀̚i̸͙͑̆", why: "Six letters. Dozens of combining marks. Any limit counted in code points is trivially exceeded while the visible text stays short." },
];

const enc = new TextEncoder();
function counts(s: string) {
  const units = s.length;
  const points = Array.from(s).length;
  const bytes = enc.encode(s).length;
  let graphemes = points;
  try { const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" }); graphemes = Array.from(seg.segment(s)).length; } catch { /* old engine: fall back to code points */ }
  return { units, points, bytes, graphemes };
}
function segments(s: string): string[] {
  try { const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" }); return Array.from(seg.segment(s), (x) => x.segment); } catch { return Array.from(s); }
}
const hex = (cp: number) => "U+" + cp.toString(16).toUpperCase().padStart(4, "0");

export function Unicode() {
  const [text, setText] = useState(SAMPLES[0].text);
  const [limit, setLimit] = useState(5);
  const c = useMemo(() => counts(text), [text]);
  const segs = useMemo(() => segments(text), [text]);
  const naive = text.slice(0, limit);
  const byPoints = Array.from(text).slice(0, limit).join("");
  const byGraphemes = segs.slice(0, limit).join("");
  const max = Math.max(1, c.bytes);
  const rows: { k: string; n: number; how: string; note: string }[] = [
    { k: "graphemes", n: c.graphemes, how: "Intl.Segmenter", note: "what a person would count, and what backspace deletes" },
    { k: "code points", n: c.points, how: "Array.from(s).length", note: "Unicode scalar values, what a for…of loop yields" },
    { k: "UTF-16 units", n: c.units, how: "s.length", note: "what .length, .slice and .charAt actually count" },
    { k: "UTF-8 bytes", n: c.bytes, how: "new TextEncoder().encode(s).length", note: "what goes over the wire and into most databases" },
  ];
  const sample = SAMPLES.find((s) => s.text === text);

  return (
    <div className="un">
      <div className="un-samples" role="group" aria-label="Samples">
        {SAMPLES.map((s) => <button key={s.name} type="button" className={`bo-toggle-btn ${text === s.text ? "is-on" : ""}`} onClick={() => setText(s.text)}>{s.name}</button>)}
      </div>
      <input className="aq-input un-input" value={text} onChange={(e) => setText(e.target.value)} aria-label="Text to measure" spellCheck={false} autoComplete="off" />
      {sample && <p className="jd-note">{sample.why}</p>}

      <div className="un-counts">
        {rows.map((r) => (
          <div key={r.k} className="un-row">
            <span className="un-k">{r.k}</span>
            <span className="un-bar"><i style={{ width: `${(r.n / max) * 100}%` }} /><b>{r.n}</b></span>
            <code className="un-how">{r.how}</code>
            <span className="un-note">{r.note}</span>
          </div>
        ))}
      </div>

      <div className="un-segs" aria-label="Graphemes and their code points">
        {segs.map((g, i) => (
          <span key={i} className="un-seg">
            <b>{g}</b>
            <small>{Array.from(g).map((ch) => hex(ch.codePointAt(0) ?? 0)).join(" ")}</small>
          </span>
        ))}
      </div>

      <h3 className="ct-h">The &ldquo;{limit} character limit&rdquo;, three ways</h3>
      <label className="cst-year"><span className="cst-year-label">Limit</span><input type="range" min={1} max={30} value={limit} onChange={(e) => setLimit(Number(e.target.value))} /><output className="cst-year-value">{limit}</output></label>
      <div className="un-cuts">
        <div className="un-cut"><code>s.slice(0, {limit})</code><p className="un-cut-out">{naive}<span className="un-cursor" /></p><span className="un-cut-note">UTF-16 units. Can split a surrogate pair and leave a broken half-character.</span></div>
        <div className="un-cut"><code>Array.from(s).slice(0, {limit})</code><p className="un-cut-out">{byPoints}<span className="un-cursor" /></p><span className="un-cut-note">Code points. Never splits a pair, still splits a family, a flag or an accent.</span></div>
        <div className="un-cut"><code>Intl.Segmenter … slice(0, {limit})</code><p className="un-cut-out">{byGraphemes}<span className="un-cursor" /></p><span className="un-cut-note">Graphemes. Cuts where a person would. This is the one to use for a limit.</span></div>
      </div>
    </div>
  );
}
