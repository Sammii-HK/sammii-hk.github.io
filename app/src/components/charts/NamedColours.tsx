"use client";
import { useEffect, useMemo, useState } from "react";
import { NAMES } from "../../../labs/charts/named-colours/data";
import { rgbToOklch, luminance, type RGB } from "../../../lib/colour";

/**
 * The 148 named CSS colours placed by what they look like: hue round the
 * wheel, chroma outward, lightness as a sortable list. The browser resolves
 * each name to sRGB (a canvas fillStyle round-trip), so the data is whatever
 * the engine you are using says the names mean, and the oddities are real:
 * darkgray is lighter than gray; there is no dark yellow; six greys, two
 * spellings each.
 */
type Named = { name: string; hex: string; rgb: RGB; L: number; C: number; h: number; Y: number };

function resolve(): Named[] {
  const ctx = document.createElement("canvas").getContext("2d")!;
  return NAMES.map((name) => {
    ctx.fillStyle = "#000"; ctx.fillStyle = name;
    const hex = String(ctx.fillStyle);
    const rgb: RGB = [parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255];
    const [L, C, h] = rgbToOklch(rgb);
    return { name, hex, rgb, L, C, h, Y: luminance(rgb) };
  });
}

const R = 340, CX = 360, CY = 360;

export function NamedColours() {
  const [cols, setCols] = useState<Named[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"hue" | "lightness" | "chroma" | "name">("hue");
  useEffect(() => setCols(resolve()), []);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("focus"); if (f && NAMES.includes(f)) setPick(f); }, []);
  const sel = cols.find((c) => c.name === pick) ?? null;
  const maxC = useMemo(() => Math.max(0.01, ...cols.map((c) => c.C)), [cols]);
  const sorted = useMemo(() => [...cols].sort((a, b) => sortBy === "hue" ? (a.C < 0.02 ? 999 : a.h) - (b.C < 0.02 ? 999 : b.h) : sortBy === "lightness" ? b.L - a.L : sortBy === "chroma" ? b.C - a.C : a.name.localeCompare(b.name)), [cols, sortBy]);
  const greys = cols.filter((c) => c.C < 0.003).sort((a, b) => b.L - a.L); // true neutrals: chroma zero
  const darkgray = cols.find((c) => c.name === "darkgray"), gray = cols.find((c) => c.name === "gray");

  return (
    <div className="nc">
      <div className="nc-stage">
        <svg viewBox="0 0 720 720" className="nc-svg" role="img" aria-label="The named CSS colours on an OKLCH hue wheel, chroma outward">
          {[0.25, 0.5, 0.75, 1].map((k) => <circle key={k} cx={CX} cy={CY} r={R * k} className="nc-ring" />)}
          {[0, 60, 120, 180, 240, 300].map((deg) => { const a = (deg * Math.PI) / 180; return <line key={deg} x1={CX} y1={CY} x2={CX + R * Math.cos(a)} y2={CY - R * Math.sin(a)} className="nc-ring" />; })}
          {[0, 90, 180, 270].map((deg) => { const a = (deg * Math.PI) / 180; return <text key={deg} x={CX + (R + 16) * Math.cos(a)} y={CY - (R + 16) * Math.sin(a) + 4} textAnchor="middle" className="nc-axis">{deg}°</text>; })}
          {cols.map((c) => {
            const a = (c.h * Math.PI) / 180, rr = (c.C / maxC) * R;
            const x = CX + rr * Math.cos(a), y = CY - rr * Math.sin(a);
            return <circle key={c.name} cx={x} cy={y} r={pick === c.name ? 11 : 6 + c.L * 4} fill={c.hex} className={`nc-dot${pick && pick !== c.name ? " is-dim" : ""}`} tabIndex={0} role="button" aria-label={c.name} onMouseEnter={() => setPick(c.name)} onFocus={() => setPick(c.name)} onClick={() => setPick(c.name)} />;
          })}
        </svg>
      </div>
      <aside className="cst-panel" aria-live="polite">
        {sel ? (
          <>
            <p className="cst-panel-kicker">{sel.hex} · rgb({sel.rgb.map((v) => Math.round(v * 255)).join(" ")})</p>
            <h2 className="cst-panel-title"><span className="nc-swatch" style={{ background: sel.hex }} /> {sel.name}</h2>
            <p className="cst-panel-what">oklch({sel.L.toFixed(3)} {sel.C.toFixed(3)} {sel.h.toFixed(1)}) · luminance {(sel.Y * 100).toFixed(1)}%</p>
            <p className="cst-panel-why">{note(sel, cols)}</p>
          </>
        ) : (
          <>
            <h2 className="cst-panel-title">Hover a colour</h2>
            <p className="cst-panel-what">{cols.length} names, placed by OKLCH hue (angle) and chroma (distance from the centre). Dot size is lightness. The greys collapse into the middle.</p>
            {darkgray && gray && <p className="cst-panel-why">darkgray is oklch lightness {darkgray.L.toFixed(2)}; gray is {gray.L.toFixed(2)}. Yes, darkgray is the lighter one: gray (#808080) came from HTML&rsquo;s sixteen VGA colours, while darkgray (#a9a9a9) came from X11, whose own gray was #bebebe, lighter still.</p>}
          </>
        )}
      </aside>
      <div className="nc-list-head">
        <span className="cst-year-label">Sort by</span>
        {(["hue", "lightness", "chroma", "name"] as const).map((k) => <button key={k} type="button" className="nc-sort" aria-pressed={sortBy === k} onClick={() => setSortBy(k)}>{k}</button>)}
        <span className="nc-greys">{greys.length} true neutrals: {greys.map((g) => g.name).join(", ")}</span>
      </div>
      <ol className="nc-list" aria-label="Every named colour">
        {sorted.map((c) => (
          <li key={c.name} className={pick === c.name ? "is-on" : ""} onMouseEnter={() => setPick(c.name)}>
            <span className="nc-chip" style={{ background: c.hex }} /><span className="nc-name">{c.name}</span><span className="nc-meta">{c.hex}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function note(c: Named, all: Named[]): string {
  const near = all.filter((o) => o.name !== c.name && Math.abs(o.L - c.L) < 0.03 && Math.abs(o.h - c.h) < 12 && Math.abs(o.C - c.C) < 0.03).map((o) => o.name);
  const parts: string[] = [];
  if (c.C < 0.003) parts.push("A true neutral: no chroma at all."); else if (c.C < 0.02) parts.push("Almost neutral: a whisper of chroma, one of the X11 off-whites.");
  if (near.length) parts.push(`Nearly indistinguishable from ${near.slice(0, 4).join(", ")}.`);
  if (/grey$/.test(c.name)) parts.push("The British spelling; CSS accepts both because SVG 1.1 did.");
  if (c.name === "rebeccapurple") parts.push("Added in 2014 in memory of Rebecca Meyer, Eric Meyer's daughter, who died at six. The only named colour with a story attached to the standard.");
  if (c.name === "lime") parts.push("Pure #00ff00. The colour called green in HTML 3.2 became lime when CSS took the X11 names, and green became half as bright.");
  if (c.name === "green") parts.push("#008000, not pure green: when X11 names met HTML's 16, the HTML green kept the name and X11's went to lime.");
  if (!parts.length) parts.push(c.L > 0.85 ? "One of the pale near-whites: the X11 set has dozens, most named after fabrics and foods." : c.L < 0.35 ? "One of the darks." : "Mid-lightness, the part of the wheel where names are densest.");
  return parts.join(" ");
}
