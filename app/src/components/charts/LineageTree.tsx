"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * A timeline family tree: x is the year (through a supplied scale so dense
 * centuries can be stretched), each lane a purpose or family, edges are
 * derivation (solid) or influence (dotted). Hover or focus lights the
 * lineage; the year scrub grows the tree; ?play=1 animates it; the SVG is
 * the poster. Generic: the colour-spaces and typography charts both use it.
 */
export type TreeNode = { id: string; name: string; year: number; lane: string; parents: string[]; influence?: string[]; swatch?: string };
export type TreeLane = { id: string; label: string };
export type TreeProps = {
  nodes: TreeNode[];
  lanes: TreeLane[];
  years: [number, number];
  /** position along the axis for a year, 0..1; default linear */
  scale?: (year: number) => number;
  ticks?: number[];
  title: string;
  desc: string;
  posterName: string;
  posterCss?: string;
  renderPanel: (node: TreeNode | null, fam: { up: TreeNode[]; down: TreeNode[] } | null) => ReactNode;
  laneHeight?: number;
  width?: number;
  padLeft?: number;
};

export function LineageTree({ nodes, lanes, years, scale, ticks, title, desc, posterName, posterCss = "", renderPanel, laneHeight = 136, width = 1700, padLeft = 250 }: TreeProps) {
  const [Y0, Y1] = years;
  const W = width, PAD_R = 120, PAD_T = 70, LANE_H = laneHeight, PAD_L = padLeft;
  const H = PAD_T + lanes.length * LANE_H + 60;
  const sc = scale ?? ((y: number) => (y - Y0) / (Y1 - Y0));
  const xOf = (y: number) => PAD_L + sc(Math.min(Y1, Math.max(Y0, y))) * (W - PAD_L - PAD_R);
  const laneIndex = useMemo(() => Object.fromEntries(lanes.map((l, i) => [l.id, i])) as Record<string, number>, [lanes]);

  const placed = useMemo(() => {
    const byLane: Record<string, TreeNode[]> = {};
    for (const n of nodes) (byLane[n.lane] ||= []).push(n);
    const out: (TreeNode & { x: number; y: number })[] = [];
    for (const [lane, list] of Object.entries(byLane)) {
      list.sort((a, b) => a.year - b.year);
      let slot = 0, lastX = -Infinity;
      for (const n of list) {
        const x = xOf(n.year);
        slot = x - lastX < 170 ? (slot + 1) % 3 : 0;
        lastX = x;
        out.push({ ...n, x, y: PAD_T + laneIndex[lane] * LANE_H + 34 + slot * 32 });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, laneIndex]);
  const byId = useMemo(() => Object.fromEntries(placed.map((n) => [n.id, n])), [placed]);
  const links = useMemo(() => nodes.flatMap((n) => [...n.parents.map((p) => ({ from: p, to: n.id, kind: "derived" as const })), ...(n.influence ?? []).map((p) => ({ from: p, to: n.id, kind: "influence" as const }))]), [nodes]);

  const [year, setYear] = useState(Y1);
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const shown = active ?? pinned;

  const fam = useMemo(() => {
    if (!shown) return null;
    const up = new Set<string>(), down = new Set<string>();
    // lineage follows descent only; influence lights its own edge but is not inherited
    const parents = (n: string) => links.filter((l) => l.to === n && l.kind === "derived").map((l) => l.from);
    const children = (n: string) => links.filter((l) => l.from === n && l.kind === "derived").map((l) => l.to);
    const walk = (n: string, get: (n: string) => string[], set: Set<string>) => { for (const m of get(n)) if (!set.has(m)) { set.add(m); walk(m, get, set); } };
    walk(shown, parents, up); walk(shown, children, down);
    return { up, down };
  }, [shown, links]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("play") === "1") {
      let y = Y0; setYear(y);
      const stepYears = Math.max(1, Math.round((Y1 - Y0) / 130));
      const t = window.setInterval(() => { y += stepYears; setYear(Math.min(Y1, y)); if (y >= Y1) window.clearInterval(t); }, 55);
      return () => window.clearInterval(t);
    }
    const y = Number(q.get("year")); if (y) setYear(Math.min(Y1, Math.max(Y0, y)));
    const f = q.get("focus"); if (f) setPinned(f);
  }, [Y0, Y1]);

  const visible = (n: TreeNode) => n.year <= year;
  const tone = (id: string) => (!fam ? "" : id === shown ? "is-self" : fam.up.has(id) ? "is-up" : fam.down.has(id) ? "is-down" : "is-dim");
  const download = () => {
    const svg = svgRef.current; if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const style = document.createElement("style"); style.textContent = BASE_POSTER_CSS + posterCss; clone.insertBefore(style, clone.firstChild);
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = posterName; a.click(); URL.revokeObjectURL(a.href);
  };
  const famNodes = fam ? { up: Array.from(fam.up).map((i) => byId[i]).filter(Boolean), down: Array.from(fam.down).map((i) => byId[i]).filter(Boolean) } : null;

  return (
    <div className="cst" data-focus={shown ? "" : undefined}>
      <div className="cst-controls">
        <label className="cst-year">
          <span className="cst-year-label">Year</span>
          <input type="range" min={Y0} max={Y1} value={year} onChange={(e) => setYear(Number(e.target.value))} aria-valuetext={String(year)} />
          <output className="cst-year-value">{year}</output>
        </label>
        <button type="button" className="cst-btn" onClick={download}>Download the poster (SVG)</button>
      </div>
      <div className="cst-stage">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="cst-svg" role="img" aria-labelledby="cst-title cst-desc">
          <title id="cst-title">{title}</title>
          <desc id="cst-desc">{desc}</desc>
          {(ticks ?? []).map((y) => (
            <g key={y} className="cst-decade">
              <line x1={xOf(y)} x2={xOf(y)} y1={PAD_T - 20} y2={H - 40} />
              <text x={xOf(y)} y={PAD_T - 28} textAnchor="middle">{y}</text>
            </g>
          ))}
          {lanes.map((l, i) => (
            <g key={l.id} className="cst-lane">
              <line x1={PAD_L - 10} x2={W - PAD_R} y1={PAD_T + i * LANE_H} y2={PAD_T + i * LANE_H} />
              <text x={PAD_L - 18} y={PAD_T + i * LANE_H + 40} textAnchor="end" className="cst-lane-label">{l.label}</text>
            </g>
          ))}
          <g className="cst-edges">
            {links.map((l) => {
              const a = byId[l.from], b = byId[l.to];
              if (!a || !b || !visible(b) || !visible(a)) return null;
              const dx = Math.max(40, (b.x - a.x) * 0.5);
              const d = `M${a.x} ${a.y} C${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
              const lit = fam && (l.from === shown || l.to === shown || (fam.up.has(l.to) && fam.up.has(l.from)) || (fam.down.has(l.from) && fam.down.has(l.to)));
              return <path key={`${l.from}-${l.to}`} d={d} className={`cst-edge is-${l.kind}${fam ? (lit ? " is-lit" : " is-dim") : ""}`} />;
            })}
          </g>
          {placed.map((n) => (
            <g key={n.id} className={`cst-node ${tone(n.id)}`} transform={`translate(${n.x} ${n.y})`} style={{ opacity: visible(n) ? 1 : 0, transition: "opacity 320ms ease" }} tabIndex={visible(n) ? 0 : -1} role="button" aria-label={`${n.name}, ${n.year}`}
              onMouseEnter={() => setActive(n.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(n.id)} onBlur={() => setActive(null)} onClick={() => setPinned((p) => (p === n.id ? null : n.id))}>
              <circle r={7} style={n.swatch ? { fill: n.swatch } : undefined} />
              <text x={12} y={4} className="cst-node-name">{n.name}</text>
              <text x={12} y={18} className="cst-node-year">{n.year}</text>
            </g>
          ))}
        </svg>
      </div>
      <aside className="cst-panel" aria-live="polite">{renderPanel(shown ? byId[shown] : null, famNodes)}</aside>
    </div>
  );
}

const BASE_POSTER_CSS = `
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
