"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { LANES, LINKS, SPACES, type Space } from "../../../labs/charts/colour-spaces/data";

/**
 * The family tree of colour spaces, drawn as a timeline: x is the year, each
 * lane is a purpose. Hover or focus a node to light its ancestors and
 * descendants and read what it was for; drag the year to watch the tree grow
 * (that is the X clip). The SVG is the poster: Download gives the same file.
 */
const YEAR0 = 1900, YEAR1 = 2026;
const W = 1700, LANE_H = 136, PAD_L = 250, PAD_R = 120, PAD_T = 70;
const H = PAD_T + LANES.length * LANE_H + 60;
const xOf = (y: number) => PAD_L + ((y - YEAR0) / (YEAR1 - YEAR0)) * (W - PAD_L - PAD_R);
const laneIndex = Object.fromEntries(LANES.map((l, i) => [l.id, i])) as Record<string, number>;

type Placed = Space & { x: number; y: number };

function layout(): Placed[] {
  // nodes in the same lane and close in time are staggered so labels never overlap
  const byLane: Record<string, Space[]> = {};
  for (const s of SPACES) (byLane[s.lane] ||= []).push(s);
  const out: Placed[] = [];
  for (const [lane, list] of Object.entries(byLane)) {
    list.sort((a, b) => a.year - b.year);
    let slot = 0, lastX = -Infinity;
    for (const s of list) {
      const x = xOf(s.year);
      slot = x - lastX < 170 ? (slot + 1) % 3 : 0;
      lastX = x;
      out.push({ ...s, x, y: PAD_T + laneIndex[lane] * LANE_H + 34 + slot * 32 });
    }
  }
  return out;
}

const family = (id: string) => {
  const up = new Set<string>(), down = new Set<string>();
  const parents = (n: string) => LINKS.filter((l) => l.to === n).map((l) => l.from);
  const children = (n: string) => LINKS.filter((l) => l.from === n).map((l) => l.to);
  const walk = (n: string, get: (n: string) => string[], set: Set<string>) => { for (const m of get(n)) if (!set.has(m)) { set.add(m); walk(m, get, set); } };
  walk(id, parents, up); walk(id, children, down);
  return { up, down };
};

export function ColourSpacesTree() {
  const nodes = useMemo(layout, []);
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const [year, setYear] = useState(YEAR1);
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const shown = active ?? pinned;
  const fam = useMemo(() => (shown ? family(shown) : null), [shown]);
  const sel = shown ? byId[shown] : null;

  // ?year= and ?play=1 let the video lane script the reveal
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("play") === "1") {
      let y = YEAR0; setYear(y);
      const t = window.setInterval(() => { y += 1; setYear(y); if (y >= YEAR1) window.clearInterval(t); }, 55);
      return () => window.clearInterval(t);
    }
    const y = Number(q.get("year")); if (y) setYear(Math.min(YEAR1, Math.max(YEAR0, y)));
  }, []);

  const visible = (n: Space) => n.year <= year;
  const tone = (id: string) => (!fam ? "" : id === shown ? "is-self" : fam.up.has(id) ? "is-up" : fam.down.has(id) ? "is-down" : "is-dim");

  const download = () => {
    const svg = svgRef.current; if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const style = document.createElement("style");
    style.textContent = POSTER_CSS;
    clone.insertBefore(style, clone.firstChild);
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "family-tree-of-colour-spaces.svg"; a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="cst" data-focus={shown ? "" : undefined}>
      <div className="cst-controls">
        <label className="cst-year">
          <span className="cst-year-label">Year</span>
          <input type="range" min={YEAR0} max={YEAR1} value={year} onChange={(e) => setYear(Number(e.target.value))} aria-valuetext={String(year)} />
          <output className="cst-year-value">{year}</output>
        </label>
        <button type="button" className="cst-btn" onClick={download}>Download the poster (SVG)</button>
      </div>
      <div className="cst-stage">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="cst-svg" role="img" aria-labelledby="cst-title cst-desc">
          <title id="cst-title">The family tree of colour spaces, 1900 to today</title>
          <desc id="cst-desc">A timeline of colour spaces grouped by purpose, with lines showing which spaces are derived from or influenced by which.</desc>
          {/* decades */}
          {Array.from({ length: 13 }, (_, i) => YEAR0 + i * 10).map((y) => (
            <g key={y} className="cst-decade">
              <line x1={xOf(y)} x2={xOf(y)} y1={PAD_T - 20} y2={H - 40} />
              <text x={xOf(y)} y={PAD_T - 28} textAnchor="middle">{y}</text>
            </g>
          ))}
          {/* lanes */}
          {LANES.map((l, i) => (
            <g key={l.id} className="cst-lane">
              <line x1={PAD_L - 10} x2={W - PAD_R} y1={PAD_T + i * LANE_H} y2={PAD_T + i * LANE_H} />
              <text x={PAD_L - 18} y={PAD_T + i * LANE_H + 40} textAnchor="end" className="cst-lane-label">{l.label}</text>
            </g>
          ))}
          {/* edges */}
          <g className="cst-edges">
            {LINKS.map((l) => {
              const a = byId[l.from], b = byId[l.to];
              if (!visible(b) || !visible(a)) return null;
              const dx = Math.max(40, (b.x - a.x) * 0.5);
              const d = `M${a.x} ${a.y} C${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
              const lit = fam && ((l.to === shown && fam.up.has(l.from)) || (l.from === shown && fam.down.has(l.to)) || (fam.up.has(l.to) && fam.up.has(l.from)) || (fam.down.has(l.from) && fam.down.has(l.to)) || (l.from === shown) || (l.to === shown));
              return <path key={`${l.from}-${l.to}`} d={d} className={`cst-edge is-${l.kind}${fam ? (lit ? " is-lit" : " is-dim") : ""}`} />;
            })}
          </g>
          {/* nodes */}
          {nodes.map((n) => (
            <g
              key={n.id}
              className={`cst-node ${tone(n.id)}`}
              transform={`translate(${n.x} ${n.y})`}
              style={{ opacity: visible(n) ? 1 : 0, transition: "opacity 320ms ease" }}
              tabIndex={visible(n) ? 0 : -1}
              role="button"
              aria-label={`${n.name}, ${n.year}, ${n.by}`}
              onMouseEnter={() => setActive(n.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
              onClick={() => setPinned((p) => (p === n.id ? null : n.id))}
            >
              <circle r={7} style={n.css ? { fill: n.css } : undefined} />
              <text x={12} y={4} className="cst-node-name">{n.name}</text>
              <text x={12} y={18} className="cst-node-year">{n.year}</text>
            </g>
          ))}
        </svg>
      </div>
      <aside className="cst-panel" aria-live="polite">
        {sel ? (
          <>
            <p className="cst-panel-kicker">{LANES[laneIndex[sel.lane]].label} · {sel.year} · {sel.by}</p>
            <h2 className="cst-panel-title">{sel.name}</h2>
            <p className="cst-panel-what">{sel.what}</p>
            <p className="cst-panel-why">{sel.why}</p>
            {sel.ramp && (
              <div className="cst-ramp" aria-label={`Nine equal steps in ${sel.name}`}>
                {sel.ramp.map((c, i) => <span key={i} style={{ background: c }} />)}
                <span className="cst-ramp-note">Nine equal-step hues at one nominal lightness in {sel.name}. If the brightness wobbles, the space is lying about lightness.</span>
              </div>
            )}
            {fam && (fam.up.size > 0 || fam.down.size > 0) && (
              <p className="cst-panel-fam">
                {fam.up.size > 0 && <>Descends from {Array.from(fam.up).map((i) => byId[i].name).join(", ")}. </>}
                {fam.down.size > 0 && <>Led to {Array.from(fam.down).map((i) => byId[i].name).join(", ")}.</>}
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="cst-panel-title">Hover a space</h2>
            <p className="cst-panel-what">Every colour space on this chart is a way of writing down a colour as numbers. The lines show which ones were built from which. Drag the year to watch the tree grow; click a node to pin it.</p>
            <p className="cst-panel-why">Two things to notice: almost everything descends from CIE XYZ (1931), and the spaces designers use today (OKLCH, CSS Color 4) are the youngest branch on the tree.</p>
          </>
        )}
      </aside>
    </div>
  );
}

const POSTER_CSS = `
  text { font-family: Inter, system-ui, sans-serif; }
  .cst-decade line { stroke: #888; stroke-opacity: .2; stroke-width: 1; }
  .cst-decade text { font-size: 12px; fill: #888; }
  .cst-lane line { stroke: #888; stroke-opacity: .25; }
  .cst-lane-label { font-size: 13px; font-weight: 600; fill: #555; letter-spacing: .04em; text-transform: uppercase; }
  .cst-edge { fill: none; stroke: #777; stroke-width: 1.4; stroke-opacity: .7; }
  .cst-edge.is-influence { stroke-dasharray: 4 5; stroke-opacity: .5; }
  .cst-node circle { fill: #333; stroke: #fff; stroke-width: 2; }
  .cst-node-name { font-size: 13px; font-weight: 600; fill: #111; }
  .cst-node-year { font-size: 11px; fill: #666; }
`;
