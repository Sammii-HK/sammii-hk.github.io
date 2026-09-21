"use client";
import { useMemo, useState } from "react";
import { hslToRgb, lchToRgb, luminance, oklchToRgb, inGamut, clamp, toCss, type RGB } from "../../../lib/colour";

/**
 * Three ramps of the "same" lightness across the hue circle, one per space,
 * with the measured relative luminance under every swatch. HSL's lightness
 * is a formula over the channel max and min; LCH and OKLCH's is meant to be
 * what you see. The bars make the difference impossible to unsee.
 */
const HUES = Array.from({ length: 24 }, (_, i) => i * 15);

type Row = { id: string; name: string; note: string; formula: string; colours: { hue: number; rgb: RGB; css: string; Y: number; out: boolean }[] };

function rows(l: number): Row[] {
  const hsl = HUES.map((h) => ({ hue: h, rgb: hslToRgb(h, 0.9, l) }));
  // match the OKLCH/LCH lightness to the HSL grey of the same l, so the rows are comparable
  const greyY = luminance(hslToRgb(0, 0, l));
  const okL = Math.cbrt(greyY); // OKLab L of an achromatic colour is Y^(1/3)
  const labL = greyY > 0.008856 ? 116 * Math.cbrt(greyY) - 16 : 903.3 * greyY;
  const ok = HUES.map((h) => ({ hue: h, rgb: oklchToRgb(okL, 0.1, h) }));
  const lch = HUES.map((h) => ({ hue: h, rgb: lchToRgb(labL, 38, h) }));
  const mk = (id: string, name: string, note: string, formula: string, cs: { hue: number; rgb: RGB }[]): Row => ({
    id, name, note, formula,
    // luminance of what is actually shown (clipped), so the bars match the chips
    colours: cs.map((c) => ({ ...c, css: toCss(c.rgb), Y: luminance(clamp(c.rgb)), out: !inGamut(c.rgb) })),
  });
  return [
    mk("hsl", "HSL", `hsl(hue 90% ${Math.round(l * 100)}%)`, "L = (max + min) / 2 of the RGB channels. Blue and yellow at the same L differ by a factor of nine in luminance.", hsl),
    mk("lch", "CIELCH", `lch(${labL.toFixed(0)}% 38 hue)`, "L* from CIELAB, a cube root of luminance. Even, but hues drift as chroma changes and some swatches leave sRGB (hatched).", lch),
    mk("oklch", "OKLCH", `oklch(${okL.toFixed(2)} 0.10 hue)`, "L from Oklab: cone responses, cube root, a fitted matrix. Even lightness and hues that stay put. Gamut is built on it.", ok),
  ];
}

export function WhyHslLies() {
  const [l, setL] = useState(0.5);
  const data = useMemo(() => rows(l), [l]);
  const maxY = Math.max(...data.flatMap((r) => r.colours.map((c) => c.Y)));
  return (
    <div className="whl">
      <label className="whl-control">
        <span className="whl-control-label">Nominal lightness</span>
        <input type="range" min={0.2} max={0.8} step={0.01} value={l} onChange={(e) => setL(Number(e.target.value))} aria-valuetext={`${Math.round(l * 100)} percent`} />
        <output>{Math.round(l * 100)}%</output>
      </label>
      {data.map((r) => {
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
            <ol className="whl-swatches" aria-label={`${r.name} across 24 hues`}>
              {r.colours.map((c) => (
                <li key={c.hue} className={`whl-swatch${c.out ? " is-out" : ""}`} title={`${r.name} hue ${c.hue}: luminance ${(c.Y * 100).toFixed(1)}%${c.out ? " (outside sRGB, clipped)" : ""}`}>
                  <span className="whl-chip" style={{ background: c.css }} />
                  <span className="whl-bar" style={{ height: `${Math.round((c.Y / maxY) * 96)}px` }} />
                  <span className="whl-y">{Math.round(c.Y * 100)}</span>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
      <p className="whl-legend">Chips are the colours; the bars beneath are their measured relative luminance (WCAG formula), on one scale across all three rows. Hatched chips fall outside sRGB and are shown clipped.</p>
    </div>
  );
}
