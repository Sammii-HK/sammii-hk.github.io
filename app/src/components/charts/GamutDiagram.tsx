"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { GAMUTS, LOCUS } from "../../../labs/charts/gamuts/data";
import { linearToSrgb } from "../../../lib/colour";

/**
 * The CIE 1931 chromaticity diagram, the horseshoe of every colour a
 * standard observer can see, with the display gamuts drawn as triangles.
 * The fill is computed per pixel on a canvas (xy -> XYZ -> linear sRGB,
 * companded, clipped) so the colours inside the triangles are honest and
 * the ones outside are the nearest the screen can do. The page also asks
 * the browser which gamut this screen actually has.
 */
const W = 760, H = 760, PAD = 60;
const X = (x: number) => PAD + x * (W - 2 * PAD) / 0.8;
const Y = (y: number) => H - PAD - y * (H - 2 * PAD) / 0.9;

function xyToRgb(x: number, y: number): [number, number, number] {
  if (y <= 0) return [0, 0, 0];
  const Yl = 1, Xl = (x * Yl) / y, Zl = ((1 - x - y) * Yl) / y;
  let r = 3.2404542 * Xl - 1.5371385 * Yl - 0.4985314 * Zl;
  let g = -0.969266 * Xl + 1.8760108 * Yl + 0.041556 * Zl;
  let b = 0.0556434 * Xl - 0.2040259 * Yl + 1.0572252 * Zl;
  // normalise so the brightest channel is 1: we draw chromaticity, not luminance
  const m = Math.max(r, g, b, 1e-6);
  r /= m; g /= m; b /= m;
  return [linearToSrgb(Math.max(0, r)), linearToSrgb(Math.max(0, g)), linearToSrgb(Math.max(0, b))];
}

function inside(x: number, y: number, poly: [number, number][]) {
  let ok = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
}

export function GamutDiagram() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [shown, setShown] = useState<Set<string>>(new Set(["srgb", "p3", "rec2020"]));
  const [hover, setHover] = useState<string | null>(null);
  const [screen, setScreen] = useState<string>("unknown");
  const locus = useMemo(() => LOCUS.map(([, x, y]) => [x, y] as [number, number]), []);

  useEffect(() => {
    const q = (m: string) => window.matchMedia(m).matches;
    setScreen(q("(color-gamut: rec2020)") ? "rec2020" : q("(color-gamut: p3)") ? "p3" : q("(color-gamut: srgb)") ? "srgb" : "unknown");
  }, []);

  useEffect(() => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const img = ctx.createImageData(W, H);
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x = ((px - PAD) * 0.8) / (W - 2 * PAD), y = ((H - PAD - py) * 0.9) / (H - 2 * PAD);
        const i = (py * W + px) * 4;
        if (x < 0 || y < 0 || !inside(x, y, locus)) { img.data[i + 3] = 0; continue; }
        const [r, g, b] = xyToRgb(x, y);
        img.data[i] = r * 255; img.data[i + 1] = g * 255; img.data[i + 2] = b * 255; img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [locus]);

  const area = (g: (typeof GAMUTS)[number]) => Math.abs((g.r[0] * (g.g[1] - g.b[1]) + g.g[0] * (g.b[1] - g.r[1]) + g.b[0] * (g.r[1] - g.g[1])) / 2);
  const srgbArea = area(GAMUTS[0]);
  const toggle = (id: string) => setShown((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="gm">
      <div className="gm-controls" role="group" aria-label="Gamuts to draw">
        {GAMUTS.map((g) => (
          <button key={g.id} type="button" className="gm-pill" aria-pressed={shown.has(g.id)} onClick={() => toggle(g.id)} onMouseEnter={() => setHover(g.id)} onMouseLeave={() => setHover(null)}>
            {g.name} <span className="gm-pill-area">{(area(g) / srgbArea * 100).toFixed(0)}%</span>
          </button>
        ))}
        <span className="gm-screen">This screen reports <strong>{screen === "unknown" ? "no gamut" : GAMUTS.find((g) => g.id === screen)?.name}</strong>{screen !== "unknown" && " or wider"}.</span>
      </div>
      <div className="gm-stage">
        <canvas ref={canvas} width={W} height={H} className="gm-canvas" aria-hidden="true" />
        <svg viewBox={`0 0 ${W} ${H}`} className="gm-svg" role="img" aria-label="CIE 1931 chromaticity diagram with display gamut triangles">
          <path d={`M${locus.map(([x, y]) => `${X(x)} ${Y(y)}`).join(" L")} Z`} className="gm-locus" />
          {LOCUS.filter(([nm]) => nm % 20 === 0 && nm >= 460 && nm <= 620).map(([nm, x, y]) => (
            <text key={nm} x={X(x) + (x > 0.4 ? 8 : -8)} y={Y(y) + (y > 0.6 ? -6 : 12)} textAnchor={x > 0.4 ? "start" : "end"} className="gm-nm">{nm} nm</text>
          ))}
          {GAMUTS.filter((g) => shown.has(g.id)).map((g) => (
            <g key={g.id} className={`gm-gamut${hover === g.id ? " is-hover" : ""}${hover && hover !== g.id ? " is-dim" : ""}`}>
              <polygon points={`${X(g.r[0])},${Y(g.r[1])} ${X(g.g[0])},${Y(g.g[1])} ${X(g.b[0])},${Y(g.b[1])}`} />
              <text x={X(g.g[0])} y={Y(g.g[1]) - 10} textAnchor="middle" className="gm-label">{g.name}</text>
            </g>
          ))}
          <circle cx={X(0.3127)} cy={Y(0.329)} r={4} className="gm-white" />
          <text x={X(0.3127) + 8} y={Y(0.329) + 4} className="gm-nm">D65</text>
          {[0, 0.2, 0.4, 0.6, 0.8].map((v) => <text key={`x${v}`} x={X(v)} y={H - PAD + 22} textAnchor="middle" className="gm-axis">{v.toFixed(1)}</text>)}
          {[0, 0.2, 0.4, 0.6, 0.8].map((v) => <text key={`y${v}`} x={PAD - 10} y={Y(v) + 4} textAnchor="end" className="gm-axis">{v.toFixed(1)}</text>)}
          <text x={W / 2} y={H - 14} textAnchor="middle" className="gm-axis">x</text>
          <text x={16} y={H / 2} textAnchor="middle" className="gm-axis" transform={`rotate(-90 16 ${H / 2})`}>y</text>
        </svg>
      </div>
      <aside className="cst-panel">
        {hover ? (
          (() => { const g = GAMUTS.find((x) => x.id === hover)!; return (
            <>
              <p className="cst-panel-kicker">{g.year} · {(area(g) / srgbArea * 100).toFixed(0)}% of sRGB's area</p>
              <h2 className="cst-panel-title">{g.name}</h2>
              <p className="cst-panel-what">{g.note}</p>
              <p className="cst-panel-why">Primaries: red ({g.r.join(", ")}), green ({g.g.join(", ")}), blue ({g.b.join(", ")}). White D65 ({g.white.join(", ")}).</p>
            </>
          ); })()
        ) : (
          <>
            <h2 className="cst-panel-title">Hover a gamut</h2>
            <p className="cst-panel-what">The horseshoe is every chromaticity a standard observer can see; the curved edge is the pure spectral colours, labelled in nanometres, and the straight bottom edge is the purples, which no single wavelength produces. Each triangle is what a display standard can show: its three primaries are the corners.</p>
            <p className="cst-panel-why">The fill is computed per pixel from the xy coordinates. Inside the sRGB triangle it is exact; outside, it is the nearest colour this screen can make, which is the point.</p>
          </>
        )}
      </aside>
    </div>
  );
}
