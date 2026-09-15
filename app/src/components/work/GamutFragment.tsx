"use client";
import { useId, useRef } from "react";

/**
 * The one live fragment in V1. Gamut's real scale: eleven Tailwind-style
 * steps with fixed OKLCH lightness targets and a chroma multiplier per step
 * (copied from gamut/src/lib/palette.ts). The browser does the OKLCH → sRGB
 * mapping; Gamut itself clamps to the sRGB gamut before export.
 *
 * Resting state is the full palette at the default hue, server-rendered.
 * With `interactive`, two native range inputs (keyboard and touch for free)
 * write --g-h and --g-c onto the palette; the swatches are pure CSS off those
 * variables, so dragging never re-renders React.
 */
const STEPS: { step: number; l: number; c: number }[] = [
  { step: 50, l: 0.97, c: 0.25 },
  { step: 100, l: 0.93, c: 0.35 },
  { step: 200, l: 0.87, c: 0.5 },
  { step: 300, l: 0.78, c: 0.7 },
  { step: 400, l: 0.68, c: 0.9 },
  { step: 500, l: 0.55, c: 1.0 },
  { step: 600, l: 0.48, c: 0.95 },
  { step: 700, l: 0.4, c: 0.85 },
  { step: 800, l: 0.32, c: 0.7 },
  { step: 900, l: 0.24, c: 0.55 },
  { step: 950, l: 0.16, c: 0.4 },
];
const DEFAULT_H = 292;
const DEFAULT_C = 0.21;

export function GamutFragment({ interactive }: { interactive: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLOutputElement>(null);
  const id = useId();
  const h = useRef(DEFAULT_H);
  const c = useRef(DEFAULT_C);

  const write = () => {
    const el = root.current;
    if (!el) return;
    el.style.setProperty("--g-h", String(h.current));
    el.style.setProperty("--g-c", c.current.toFixed(3));
    if (readout.current) readout.current.textContent = `oklch(0.55 ${c.current.toFixed(2)} ${h.current})`;
  };

  return (
    <div ref={root} className="gamut" data-interactive={interactive ? "" : undefined} style={{ ["--g-h" as string]: DEFAULT_H, ["--g-c" as string]: DEFAULT_C }}>
      <ol className="gamut-scale" aria-label="An eleven-step colour scale generated in OKLCH">
        {STEPS.map((s) => (
          <li key={s.step} className="gamut-step" style={{ ["--l" as string]: s.l, ["--k" as string]: s.c }}>
            <span className="gamut-swatch" aria-hidden="true" />
            <span className="gamut-step-label">{s.step}</span>
            <span className="gamut-step-l" aria-hidden="true">L {s.l.toFixed(2)}</span>
          </li>
        ))}
      </ol>
      {interactive ? (
        <div className="gamut-controls">
          <label className="gamut-control" htmlFor={`${id}-h`}>
            <span>Hue</span>
            <input id={`${id}-h`} type="range" min={0} max={360} step={1} defaultValue={DEFAULT_H} onInput={(e) => { h.current = Number(e.currentTarget.value); write(); }} />
          </label>
          <label className="gamut-control" htmlFor={`${id}-c`}>
            <span>Chroma</span>
            <input id={`${id}-c`} type="range" min={0} max={0.3} step={0.005} defaultValue={DEFAULT_C} onInput={(e) => { c.current = Number(e.currentTarget.value); write(); }} />
          </label>
          <output ref={readout} className="gamut-readout" aria-live="polite">{`oklch(0.55 ${DEFAULT_C.toFixed(2)} ${DEFAULT_H})`}</output>
        </div>
      ) : (
        <p className="gamut-readout">{`oklch(0.55 ${DEFAULT_C.toFixed(2)} ${DEFAULT_H})`} · base for step 500</p>
      )}
    </div>
  );
}
