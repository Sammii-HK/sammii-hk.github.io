"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import DATA from "../../../labs/charts/grimoire-map/data.json";

/**
 * Lunary's grimoire, mapped by meaning: every article embedded with a local
 * model (qwen3-embedding:0.6b) and laid out in 2D with t-SNE by
 * scripts/labs/grimoire_map.py. Near on the map means similar in meaning,
 * roughly; the neighbours listed in the panel are the exact ones, computed
 * in the full 1,024 dimensions. One colour: what you pick is drawn in ink and
 * everything else steps back.
 */
type Pt = { i: number; slug: string; title: string; cat: number; x: number; y: number; body: boolean; near: number[] };
const PTS: Pt[] = (DATA.points as unknown as [string, string, number, number, number, number, number[]][]).map((p, i) => ({ i, slug: p[0], title: p[1], cat: p[2], x: p[3], y: p[4], body: p[5] === 1, near: p[6] }));
const CATS = DATA.categories;
const FOCUS = PTS.find((p) => p.slug === DATA.focus)!;
const COS = new Map(DATA.neighbours.map((n) => [n.slug, n.cosine]));
const W = Math.max(...PTS.map((p) => p.x)), H = Math.max(...PTS.map((p) => p.y));
const PAD = 24;
const CAT_LABEL: Record<string, string> = { horoscope: "monthly horoscopes", concept: "concepts", ritual: "spells and rituals", numerology: "numerology", glossary: "glossary", crystal: "crystals", tarot: "tarot" };
const nice = (c: string) => CAT_LABEL[c] ?? c.replace("-", " ");
const href = (slug: string) => `https://lunary.app/grimoire/${slug}`;

export function GrimoireMap() {
  const [sel, setSel] = useState<Pt>(FOCUS);
  const [hover, setHover] = useState<Pt | null>(null);
  const [cat, setCat] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("focus"); const p = f && PTS.find((x) => x.slug === f || x.slug.endsWith(`/${f}`)); if (p) setSel(p); }, []);

  const shown = hover ?? sel;
  const near = useMemo(() => (shown.i === FOCUS.i ? DATA.neighbours.map((n) => PTS.find((p) => p.slug === n.slug)!) : shown.near.map((j) => PTS[j])), [shown]);
  const matches = useMemo(() => { const t = q.trim().toLowerCase(); return t.length < 2 ? null : PTS.filter((p) => p.title.toLowerCase().includes(t)); }, [q]);
  const matchSet = useMemo(() => (matches ? new Set(matches.map((p) => p.i)) : null), [matches]);
  // region names only for the categories that form one compact island; the
  // sprawling ones (concepts, numerology) would be labelled in the wrong place
  const labels = useMemo(() => ["horoscope", "crystal", "tarot", "glossary"].map((c) => {
    const ps = PTS.filter((p) => CATS[p.cat] === c);
    const x = ps.reduce((a, p) => a + p.x, 0) / ps.length, y = ps.reduce((a, p) => a + p.y, 0) / ps.length;
    const sy = Math.sqrt(ps.reduce((a, p) => a + (p.y - y) ** 2, 0) / ps.length);
    return { c, x, y: y - 1.6 * sy - 14 };
  }), []);

  const lit = (p: Pt) => (matchSet ? matchSet.has(p.i) : cat !== null ? p.cat === cat : false);
  // nearest article to the pointer, within a generous radius, so a dot two pixels wide on a phone is still easy to hit
  const nearestAt = (e: React.PointerEvent<SVGSVGElement>): Pt | null => {
    const s = svg.current; const m = s?.getScreenCTM(); if (!s || !m) return null;
    const pt = s.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(m.inverse());
    let best: Pt | null = null, bd = 24 * 24;
    for (const p of PTS) { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = p; } }
    return best;
  };

  return (
    <div className="gm">
      <div className="gm-controls">
        <div className="kp-knob-opts" role="group" aria-label="Highlight a category">
          <button type="button" aria-pressed={cat === null && !matches} onClick={() => { setCat(null); setQ(""); }}>none</button>
          {CATS.map((c, ci) => <button key={c} type="button" aria-pressed={cat === ci && !matches} onClick={() => { setCat(cat === ci ? null : ci); setQ(""); }}>{nice(c)} <span className="gm-n">{PTS.filter((p) => p.cat === ci).length}</span></button>)}
        </div>
        <label className="gm-find"><span className="kp-knob-label">Find an article</span><input className="aq-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="moon, venus, amethyst…" spellCheck={false} autoComplete="off" /></label>
      </div>
      <div className="gm-body">
        <div className="gm-stage">
          <svg ref={svg} viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${H + PAD * 2}`} className={`gm-svg${cat !== null || matches ? " is-filtered" : ""}`} role="img" aria-label={`${PTS.length} grimoire articles placed by meaning; the selected article is ${sel.title}`} onPointerMove={(e) => e.pointerType === "mouse" && setHover(nearestAt(e))} onPointerLeave={() => setHover(null)} onPointerDown={(e) => { const p = nearestAt(e); if (p) { setSel(p); setHover(null); } }}>
            {labels.map((l) => <text key={l.c} x={Math.min(W - 90, Math.max(0, l.x))} y={l.y} textAnchor={l.x < 90 ? "start" : "middle"} className="gm-region">{nice(l.c)}</text>)}
            {PTS.map((p) => <circle key={p.i} cx={p.x} cy={p.y} className={`gm-dot${lit(p) ? " is-lit" : ""}`} />)}
            {near.map((p) => <line key={`l${p.i}`} x1={shown.x} y1={shown.y} x2={p.x} y2={p.y} className="gm-edge" />)}
            {near.map((p) => <circle key={`n${p.i}`} cx={p.x} cy={p.y} className="gm-near" />)}
            <circle cx={shown.x} cy={shown.y} className="gm-sel" />
            <text x={shown.x + (shown.x > W * 0.7 ? -18 : 18)} y={shown.y + 6} textAnchor={shown.x > W * 0.7 ? "end" : "start"} className="gm-label">{shown.title}</text>
          </svg>
        </div>
        <aside className="kp-panel gm-panel" aria-live="polite">
          <p className="cst-panel-kicker">{nice(CATS[shown.cat])}{shown.body ? "" : " · title and keywords only"}</p>
          <h2 className="cst-panel-title">{shown.title}</h2>
          <p className="gm-near-head">Nearest in meaning{shown.i === FOCUS.i ? ", by cosine similarity" : ""}</p>
          <ol className="gm-near-list">
            {near.map((p) => (
              <li key={p.i}>
                <button type="button" onClick={() => { setSel(p); setHover(null); }}>{p.title}</button>
                <span>{shown.i === FOCUS.i ? COS.get(p.slug)?.toFixed(2) : nice(CATS[p.cat])}</span>
              </li>
            ))}
          </ol>
          <a className="gm-link" href={href(shown.slug)} target="_blank" rel="noopener noreferrer">Read it on Lunary</a>
        </aside>
      </div>
      {matches && (
        <p className="jd-note" aria-live="polite">
          {matches.length === 0 ? "No titles match." : <>{matches.length} {matches.length === 1 ? "title matches" : "titles match"}: {matches.slice(0, 8).map((p, k) => <span key={p.i}>{k ? ", " : ""}<button type="button" className="gm-inline" onClick={() => setSel(p)}>{p.title}</button></span>)}{matches.length > 8 ? " and more, lit on the map." : "."}</>}
        </p>
      )}
    </div>
  );
}
