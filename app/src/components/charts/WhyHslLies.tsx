"use client";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { hslToRgb, lchToRgb, luminance, oklchToRgb, inGamut, clamp, toCss, toHex, type RGB } from "../../../lib/colour";

/**
 * Three ramps of the "same" lightness across the hue circle, one per space,
 * with the measured relative luminance under every swatch. HSL's lightness
 * is a formula over the channel max and min; LCH and OKLCH's is meant to be
 * what you see. The bars make the difference impossible to unsee.
 */
const HUES = Array.from({ length: 24 }, (_, i) => i * 15);

type Colour = { hue: number; rgb: RGB; spec: string; css: string; hex: string; Y: number; out: boolean };
type Row = { id: string; name: string; note: string; formula: string; colours: Colour[] };

// WCAG 2 contrast of a luminance against white (Y = 1) and black (Y = 0)
const onWhite = (Y: number) => 1.05 / (Y + 0.05);
const onBlack = (Y: number) => (Y + 0.05) / 0.05;

function rows(l: number): Row[] {
  const pct = Math.round(l * 100);
  const hsl = HUES.map((h) => ({ hue: h, rgb: hslToRgb(h, 0.9, l), spec: `hsl(${h} 90% ${pct}%)` }));
  // match the OKLCH/LCH lightness to the HSL grey of the same l, so the rows are comparable
  const greyY = luminance(hslToRgb(0, 0, l));
  const okL = Math.cbrt(greyY); // OKLab L of an achromatic colour is Y^(1/3)
  const labL = greyY > 0.008856 ? 116 * Math.cbrt(greyY) - 16 : 903.3 * greyY;
  const ok = HUES.map((h) => ({ hue: h, rgb: oklchToRgb(okL, 0.1, h), spec: `oklch(${okL.toFixed(2)} 0.10 ${h})` }));
  const lch = HUES.map((h) => ({ hue: h, rgb: lchToRgb(labL, 38, h), spec: `lch(${labL.toFixed(0)}% 38 ${h})` }));
  const mk = (id: string, name: string, note: string, formula: string, cs: { hue: number; rgb: RGB; spec: string }[]): Row => ({
    id, name, note, formula,
    // luminance of what is actually shown (clipped), so the bars match the chips
    colours: cs.map((c) => ({ ...c, css: toCss(c.rgb), hex: toHex(c.rgb), Y: luminance(clamp(c.rgb)), out: !inGamut(c.rgb) })),
  });
  return [
    mk("hsl", "HSL", `hsl(hue 90% ${pct}%)`, "L = (max + min) / 2 of the RGB channels. Blue and yellow at the same L differ by a factor of nine in luminance.", hsl),
    mk("lch", "CIELCH", `lch(${labL.toFixed(0)}% 38 hue)`, "L* from CIELAB, a cube root of luminance. Even, but hues drift as chroma changes and some swatches leave sRGB (hatched).", lch),
    mk("oklch", "OKLCH", `oklch(${okL.toFixed(2)} 0.10 hue)`, "L from Oklab: cone responses, cube root, a fitted matrix. Even lightness and hues that stay put. Gamut is built on it.", ok),
  ];
}

export function WhyHslLies() {
  const [l, setL] = useState(0.5);
  // The inspected hue. It starts on yellow, the brightest HSL swatch, so the
  // readout has something true to say before anyone touches the chart.
  const [hue, setHue] = useState(60);
  const [inspecting, setInspecting] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const f = Number(q.get("focus"));
    if (f >= 20 && f <= 80) setL(f / 100);
    const h = Number(q.get("hue"));
    if (q.has("hue") && HUES.includes(h)) setHue(h);
  }, []);
  const data = useMemo(() => rows(l), [l]);
  const maxY = Math.max(...data.flatMap((r) => r.colours.map((c) => c.Y)));
  const hueIndex = HUES.indexOf(hue);

  // Arrow keys walk the hue circle (left/right) and move between models (up/down).
  // One swatch per row is in the tab order: the inspected hue.
  function onKey(e: KeyboardEvent<HTMLLIElement>, rowIndex: number) {
    const step: Record<string, [number, number]> = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0], Home: [0, -hueIndex], End: [0, HUES.length - 1 - hueIndex] };
    const d = step[e.key];
    if (!d) return;
    e.preventDefault();
    const r = Math.min(data.length - 1, Math.max(0, rowIndex + d[0]));
    const next = HUES[(hueIndex + d[1] + HUES.length) % HUES.length];
    setHue(next);
    root.current?.querySelector<HTMLElement>(`[data-row="${r}"][data-hue="${next}"]`)?.focus();
  }

  return (
    <div
      ref={root}
      className={`whl${inspecting ? " is-inspecting" : ""}`}
      onPointerLeave={() => setInspecting(false)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInspecting(false); }}
    >
      <label className="whl-control">
        <span className="whl-control-label">Nominal lightness</span>
        <input type="range" min={0.2} max={0.8} step={0.01} value={l} onChange={(e) => setL(Number(e.target.value))} aria-valuetext={`${Math.round(l * 100)} percent`} />
        <output>{Math.round(l * 100)}%</output>
      </label>
      <section className="whl-inspect" aria-live="polite" aria-labelledby="whl-inspect-title">
        <header className="whl-inspect-head">
          <h2 id="whl-inspect-title" className="whl-inspect-title">Hue {hue}°</h2>
          <p className="whl-inspect-hint">Hover, tap or arrow through any chip to inspect that hue in all three models.</p>
        </header>
        <div className="whl-inspect-scroll">
          <table className="whl-inspect-table">
            <thead>
              <tr>
                <th scope="col">Model</th>
                <th scope="col">Value</th>
                <th scope="col">Shown as</th>
                <th scope="col">Relative luminance</th>
                <th scope="col">On white</th>
                <th scope="col">On black</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const c = r.colours[hueIndex];
                return (
                  <tr key={r.id}>
                    <th scope="row"><span className={`whl-inspect-chip${c.out ? " is-out" : ""}`} style={{ background: c.css }} aria-hidden="true" />{r.name}</th>
                    <td><code>{c.spec}</code></td>
                    <td><code>{c.hex}</code>{c.out ? <span className="whl-inspect-flag"> clipped</span> : null}</td>
                    <td>{c.Y.toFixed(3)}</td>
                    <td>{onWhite(c.Y).toFixed(1)}:1</td>
                    <td>{onBlack(c.Y).toFixed(1)}:1</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {data.map((r, ri) => {
        const ys = r.colours.map((c) => c.Y);
        const spread = Math.max(...ys) / Math.min(...ys);
        return (
          <section key={r.id} className="whl-row" aria-labelledby={`whl-${r.id}`}>
            <header className="whl-row-head">
              <h2 id={`whl-${r.id}`} className="whl-row-title">{r.name}</h2>
              <code className="whl-row-formula">{r.formula}</code>
              <p className="whl-row-note">{r.note}</p>
              <p className="whl-row-stat">
                Brightest swatch is <strong>{spread.toFixed(1)}×</strong> the luminance of the darkest.
              </p>
            </header>
            <div className="whl-plot">
              <p className="whl-axis" aria-hidden="true">Bars: measured relative luminance, %</p>
              <ol className="whl-swatches" aria-label={`${r.name} across 24 hues, bars show measured relative luminance`}>
                {r.colours.map((c) => (
                  <li
                    key={c.hue}
                    data-row={ri}
                    data-hue={c.hue}
                    tabIndex={c.hue === hue ? 0 : -1}
                    aria-label={`${r.name} hue ${c.hue} degrees, relative luminance ${c.Y.toFixed(3)}${c.out ? ", outside sRGB, clipped" : ""}`}
                    aria-current={c.hue === hue ? "true" : undefined}
                    className={`whl-swatch${c.out ? " is-out" : ""}${c.hue === hue ? " is-active" : ""}`}
                    onPointerEnter={() => { setHue(c.hue); setInspecting(true); }}
                    onFocus={() => { setHue(c.hue); setInspecting(true); }}
                    onClick={() => setHue(c.hue)}
                    onKeyDown={(e) => onKey(e, ri)}
                  >
                    <span className="whl-chip" style={{ background: c.css }} />
                    <span className="whl-bar" style={{ height: `${Math.round((c.Y / maxY) * 96)}px` }} />
                    <span className="whl-y">{Math.round(c.Y * 100)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      })}
      <p className="whl-legend">Chips are the colours; the bars beneath are their measured relative luminance (WCAG formula), on one scale across all three rows. Hatched chips fall outside sRGB and are shown clipped.</p>
    </div>
  );
}
