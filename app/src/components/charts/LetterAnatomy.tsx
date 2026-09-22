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
  const px = (p: Part) => PADL + p.x * advPx, py = (p: Part) => y(p.y);
  // one label column on the right, pushed apart so nothing overlaps
  const labelX = PADL + Math.max(advPx, SIZE * 0.42) + 56;
  const placed = useMemo(() => {
    const rows = spec.parts.map((p) => ({ p, y: py(p) })).sort((a, b) => a.y - b.y);
    for (let n = 1; n < rows.length; n++) if (rows[n].y - rows[n - 1].y < 24) rows[n].y = rows[n - 1].y + 24;
    return new Map(rows.map((r) => [r.p.id, r.y]));
  }, [spec.parts, m]); // eslint-disable-line react-hooks/exhaustive-deps

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
          {!part && <p className="cst-panel-why">Hover or tab through the labels. The horizontal lines are measured from this font in your browser; the names are placed by hand on the drawing.</p>}
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
