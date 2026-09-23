"use client";
import { useEffect, useMemo, useState } from "react";
import { SPECIMENS, type Part } from "../../../labs/charts/letter/data";

/**
 * A specimen with measured metric lines and hand-placed anatomy names.
 * The horizontals (baseline, x-height, cap height, ascender, descender,
 * overshoot) come from measuring the live font in a canvas at 400px, so
 * they are this font's real values, not a diagram. The names are placed
 * by hand, because where a bowl sits is a fact about the drawing.
 */
type M = { x: number; cap: number; asc: number; desc: number; over: number; adv: number };
function metrics(font: string, glyph: string): M | null {
  try {
    const c = document.createElement("canvas").getContext("2d")!; const S = 400; c.font = `${S}px "${font}"`;
    const a = (t: string) => c.measureText(t).actualBoundingBoxAscent / S;
    const d = (t: string) => c.measureText(t).actualBoundingBoxDescent / S;
    return { x: a("x"), cap: a("H"), asc: a("h"), desc: d("p"), over: a("o") - a("x"), adv: c.measureText(glyph).width / S };
  } catch { return null; }
}

const SIZE = 340, PADL = 168, PADR = 230, PADT = 80, PADB = 120;

/**
 * Find each named part in the actual ink rather than trusting a typed-in
 * coordinate. The glyph is rasterised once at R px, then every rule is
 * answered from that bitmap, so a pointer lands on the thing it names in
 * whatever font is loaded.
 */
type Ink = { w: number; h: number; on: (x: number, y: number) => boolean; baseline: number; scale: number; left: number; top: number; bottom: number };
function raster(font: string, glyph: string): Ink | null {
  try {
    const R = 400, pad = R * 0.5;
    const c = document.createElement("canvas");
    c.width = Math.ceil(R * 2); c.height = Math.ceil(R * 2);
    const g = c.getContext("2d", { willReadFrequently: true })!;
    g.fillStyle = "#000"; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#fff"; g.font = `${R}px "${font}"`; g.textBaseline = "alphabetic";
    g.fillText(glyph, pad, pad + R);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const on = (x: number, y: number) => {
      const xi = Math.round(x), yi = Math.round(y);
      if (xi < 0 || yi < 0 || xi >= c.width || yi >= c.height) return false;
      return d[(yi * c.width + xi) * 4] > 128;
    };
    // the glyph's own ink box: bands are fractions of THIS, not of the em
    let top = c.height, bottom = -1;
    for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) {
      if (!on(x, y)) continue;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
    if (bottom < 0) return null;
    return { w: c.width, h: c.height, on, baseline: pad + R, scale: R, left: pad, top, bottom };
  } catch { return null; }
}

/** Resolve a rule to a point in em units (x from the glyph's left, y from the baseline). */
function resolve(ink: Ink, part: Part): { x: number; y: number } {
  const { on, baseline, scale, left, w, top, bottom } = ink;
  const emOfY = (y: number) => (baseline - y) / scale;
  const emOfX = (x: number) => (x - left) / scale;
  const step = 2;
  const r = part.rule;
  // a band is a fraction of the ink box: 0 is the lowest ink, 1 the highest
  const bandY = (f: number) => bottom - f * (bottom - top);
  const rows = (from: number, to: number) => { const a = bandY(Math.max(from, to)), b = bandY(Math.min(from, to)); return [Math.min(a, b), Math.max(a, b)] as const; };
  // and x fractions are of the ink box too, not the advance
  const inkX = (() => { let lo = w, hi = -1; for (let y = top; y <= bottom; y += step) for (let x = 0; x < w; x += step) { if (!on(x, y)) continue; if (x < lo) lo = x; if (x > hi) hi = x; } return { lo, hi }; })();
  const bandX = (f: number) => inkX.lo + f * (inkX.hi - inkX.lo);

  if (r.kind === "rightmost" || r.kind === "leftmost") {
    const [y0, y1] = rows(r.from, r.to);
    let best: { x: number; y: number } | null = null;
    for (let y = y0; y <= y1; y += step) for (let x = 0; x < w; x += step) {
      if (!on(x, y)) continue;
      if (!best || (r.kind === "rightmost" ? x > best.x : x < best.x)) best = { x, y };
    }
    if (best) return { x: emOfX(best.x), y: emOfY(best.y) };
  }
  if (r.kind === "topmost" || r.kind === "bottommost") {
    const x0 = bandX(r.xFrom), x1 = bandX(r.xTo);
    let best: { x: number; y: number } | null = null;
    for (let y = 0; y < ink.h; y += step) for (let x = x0; x <= x1; x += step) {
      if (!on(x, y)) continue;
      if (!best || (r.kind === "topmost" ? y < best.y : y > best.y)) best = { x, y };
    }
    if (best) return { x: emOfX(best.x), y: emOfY(best.y) };
  }
  if (r.kind === "centroid") {
    const [y0, y1] = rows(r.from, r.to);
    const x0 = bandX(r.xFrom ?? 0), x1 = bandX(r.xTo ?? 1);
    let sx = 0, sy = 0, n = 0;
    for (let y = y0; y <= y1; y += step) for (let x = x0; x <= x1; x += step) if (on(x, y)) { sx += x; sy += y; n++; }
    if (n) return { x: emOfX(sx / n), y: emOfY(sy / n) };
  }
  if (r.kind === "hole") {
    // the widest run of white with ink on both sides, inside the band
    const [y0, y1] = rows(r.from, r.to);
    let best: { x: number; y: number; run: number } | null = null;
    for (let y = y0; y <= y1; y += step) {
      let runStart = -1, seenInk = false;
      for (let x = 0; x < w; x += step) {
        const ink0 = on(x, y);
        if (ink0) {
          if (runStart >= 0 && seenInk) { const run = x - runStart; if (!best || run > best.run) best = { x: runStart + run / 2, y, run }; }
          runStart = -1; seenInk = true;
        } else if (seenInk && runStart < 0) runStart = x;
      }
    }
    if (best) return { x: emOfX(best.x), y: emOfY(best.y) };
  }
  if (r.kind === "gap") {
    // the opening on the right: the rightmost ink per row, take the row where
    // it sits furthest left inside the band (the mouth of the aperture)
    const [y0, y1] = rows(r.from, r.to);
    let best: { x: number; y: number } | null = null;
    for (let y = y0; y <= y1; y += step) {
      let far = -1;
      for (let x = 0; x < w; x += step) if (on(x, y)) far = x;
      if (far > 0 && (!best || far < best.x)) best = { x: far, y };
    }
    if (best) return { x: emOfX(best.x) + 0.04, y: emOfY(best.y) };
  }
  return part.fallback;
}

/** Nearest ink pixel, so a pointer never sits in white (holes excepted). */
function snap(ink: Ink, pt: { x: number; y: number }): { x: number; y: number } {
  const px = ink.left + pt.x * ink.scale, py = ink.baseline - pt.y * ink.scale;
  if (ink.on(px, py)) return pt;
  for (let rad = 2; rad <= 40; rad += 2) {
    for (let a = 0; a < 32; a++) {
      const th = (a / 32) * Math.PI * 2;
      const x = px + Math.cos(th) * rad, y = py + Math.sin(th) * rad;
      if (ink.on(x, y)) return { x: (x - ink.left) / ink.scale, y: (ink.baseline - y) / ink.scale };
    }
  }
  return pt;
}

export function LetterAnatomy() {
  const [i, setI] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [m, setM] = useState<M | null>(null);
  const spec = SPECIMENS[i];
  useEffect(() => { let live = true; (async () => { await document.fonts.load(`400px "${spec.font}"`).catch(() => null); if (live) setM(metrics(spec.font, spec.glyph)); })(); return () => { live = false; }; }, [spec.font, spec.glyph]);
  const base = PADT + SIZE * 0.78; // baseline y inside the box
  const y = (v: number) => base - v * SIZE;
  const W = PADL + SIZE + PADR, H = PADT + SIZE + PADB;
  const lines = useMemo(() => m ? [
    { k: "ascender", v: m.asc, note: `${m.asc.toFixed(3)} em` },
    { k: "cap height", v: m.cap, note: `${m.cap.toFixed(3)} em` },
    { k: "overshoot", v: m.x + m.over, note: `+${(m.over * 1000).toFixed(0)}/1000 em: round letters are drawn taller than flat ones so they look the same height` },
    { k: "x-height", v: m.x, note: `${m.x.toFixed(3)} em` },
    { k: "baseline", v: 0, note: "0" },
    { k: "descender", v: -m.desc, note: `${(-m.desc).toFixed(3)} em` },
  ] : [], [m]);
  const part = spec.parts.find((p) => p.id === active) ?? null;
  const advPx = (m?.adv ?? 0.5) * SIZE;
  const [points, setPoints] = useState<Record<string, { x: number; y: number }>>({});
  useEffect(() => {
    let live = true;
    (async () => {
      await document.fonts.load(`400px "${spec.font}"`).catch(() => null);
      const ink = raster(spec.font, spec.glyph);
      if (!live) return;
      setPoints(Object.fromEntries(spec.parts.map((p) => {
        if (!ink) return [p.id, p.fallback];
        const pt = resolve(ink, p);
        // a counter, an eye and an aperture are white by definition
        return [p.id, p.rule.kind === "hole" || p.rule.kind === "gap" ? pt : snap(ink, pt)];
      })));
    })();
    return () => { live = false; };
  }, [spec]);
  const at = (p: Part) => points[p.id] ?? p.fallback;
  const px = (p: Part) => PADL + at(p).x * SIZE, py = (p: Part) => y(at(p).y);
  // one label column on the right, pushed apart so nothing overlaps
  const labelX = PADL + Math.max(advPx, SIZE * 0.42) + 56;
  const placed = useMemo(() => {
    const rows = spec.parts.map((p) => ({ p, y: py(p) })).sort((a, b) => a.y - b.y);
    for (let n = 1; n < rows.length; n++) if (rows[n].y - rows[n - 1].y < 24) rows[n].y = rows[n - 1].y + 24;
    return new Map(rows.map((r) => [r.p.id, r.y]));
  }, [spec.parts, m, points]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="la">
      <div className="la-picker" role="tablist" aria-label="Specimen">
        {SPECIMENS.map((s, n) => <button key={s.glyph} role="tab" type="button" aria-selected={n === i} className={`la-pick ${n === i ? "is-on" : ""}`} onClick={() => { setI(n); setActive(null); }} style={{ fontFamily: `"${s.font}", serif` }}>{s.glyph}</button>)}
      </div>
      <div className="la-grid">
        <div className="la-stage">
          <svg viewBox={`0 0 ${W} ${H}`} className="la-svg" role="img" aria-label={`The letter ${spec.glyph} with its metric lines and the names of its parts`}>
            {lines.map((l) => (
              <g key={l.k} className={`la-line ${l.k === "overshoot" ? "is-over" : ""} ${l.k === "baseline" ? "is-base" : ""}`}>
                <line x1={PADL - 84} x2={PADL + SIZE + 24} y1={y(l.v)} y2={y(l.v)} />
                {l.k === "overshoot"
                  ? <text x={PADL + SIZE + 30} y={y(l.v) + 4}>overshoot, +{(m ? m.over * 1000 : 0).toFixed(0)}/1000 em</text>
                  : <text x={PADL - 90} y={y(l.v) + 4} textAnchor="end">{l.k}</text>}
              </g>
            ))}
            <text className="la-glyph" x={PADL} y={base} style={{ fontFamily: `"${spec.font}", serif`, fontSize: `${SIZE}px` }}>{spec.glyph}</text>
            {spec.parts.map((p) => {
              const on = active === p.id; const ly = placed.get(p.id) ?? py(p);
              return (
                <g key={p.id} className={`la-part ${on ? "is-on" : ""}`} onMouseEnter={() => setActive(p.id)} onFocus={() => setActive(p.id)} tabIndex={0} role="button" aria-label={p.name}>
                  <path className="la-lead" d={`M${px(p)} ${py(p)} L${labelX - 30} ${ly} L${labelX - 6} ${ly}`} />
                  <circle className="la-dot" cx={px(p)} cy={py(p)} r={4} />
                  <text x={labelX} y={ly + 4}>{p.name}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <aside className="cst-panel la-panel">
          <p className="cst-panel-kicker">{spec.font}</p>
          <p className="cst-panel-title">{part ? part.name : `The letter ${spec.glyph}`}</p>
          <p className="cst-panel-what">{part ? part.what : spec.note}</p>
          {!part && <p className="cst-panel-why">Hover or tab through the labels. The horizontal lines are measured from this font in your browser; the pointers are found in the ink, not typed in.</p>}
          {m && (
            <ul className="la-metrics">
              {lines.map((l) => <li key={l.k}><b>{l.k}</b><span>{l.note}</span></li>)}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
