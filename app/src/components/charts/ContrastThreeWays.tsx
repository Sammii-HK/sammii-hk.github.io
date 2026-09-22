"use client";
import { useMemo, useState } from "react";
import { luminance, toHex, type RGB } from "../../../lib/colour";

/**
 * The same pair of colours scored by WCAG 2 and by APCA, side by side, with
 * the text rendered at the sizes each method cares about. The pairs where
 * they disagree are the ones worth learning: WCAG 2 is symmetric (swap
 * text and background, same ratio) and APCA is not, because dark text on
 * light reads differently from light text on dark.
 */
const hexToRgb = (h: string): RGB => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

export function wcagRatio(fg: RGB, bg: RGB): number { const a = luminance(fg) + 0.05, b = luminance(bg) + 0.05; return a > b ? a / b : b / a; }

/** APCA-W3 0.1.9 (the published constants), Lc for text on background. */
export function apcaLc(txt: RGB, bg: RGB): number {
  const y = ([r, g, b]: RGB) => 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
  const sc = (Y: number) => (Y > 0.022 ? Y : Y + (0.022 - Y) ** 1.414);
  const Yt = sc(y(txt)), Yb = sc(y(bg));
  if (Math.abs(Yb - Yt) < 0.0005) return 0;
  let out: number;
  if (Yb > Yt) { const s = (Yb ** 0.56 - Yt ** 0.57) * 1.14; out = s < 0.1 ? 0 : s - 0.027; }
  else { const s = (Yb ** 0.65 - Yt ** 0.62) * 1.14; out = s > -0.1 ? 0 : s + 0.027; }
  return out * 100;
}

const PAIRS: { name: string; fg: string; bg: string; why: string }[] = [
  { name: "Grey on white", fg: "#767676", bg: "#ffffff", why: "The famous edge case: exactly 4.54:1, the minimum grey WCAG 2 allows for body text." },
  { name: "Orange on white", fg: "#ff7a00", bg: "#ffffff", why: "Fails WCAG 2 (2.6:1) and reads fine as a large heading. APCA scores it about Lc 50, usable for large text." },
  { name: "White on orange", fg: "#ffffff", bg: "#ff7a00", why: "Same two colours swapped: WCAG 2 gives the identical 2.6:1. APCA gives 55 against 50 the other way round: it knows which colour is the text, and the two directions are not the same thing." },
  { name: "White on blue button", fg: "#ffffff", bg: "#1e90ff", why: "Passes WCAG 2 AA at 3.2:1 for large text only; APCA gives about Lc 64: fine for a bold button label, not for body copy." },
  { name: "Dark on light grey", fg: "#1f1f1f", bg: "#e6e6e6", why: "Comfortable body text: both methods agree it is strong." },
  { name: "Dark grey on black", fg: "#4a4a4a", bg: "#000000", why: "WCAG 2 says 2.3:1; APCA says nearly nothing (Lc under 15): near-black on black is invisible." },
  { name: "Light grey on black", fg: "#8a8a8a", bg: "#000000", why: "Passes WCAG 2 at 6.1:1. APCA says Lc 40, below even the headline threshold: WCAG 2 is too generous on dark backgrounds, where it over-rewards mid greys." },
  { name: "Mid blue on white", fg: "#3355ff", bg: "#ffffff", why: "Link blue. Both methods pass it for body text; APCA at Lc 76 wants it 15px or larger for body." },
];

function wcagLevel(r: number) { return r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large only" : "fails"; }
function apcaLevel(lc: number) { const a = Math.abs(lc); return a >= 90 ? "preferred body" : a >= 75 ? "body text" : a >= 60 ? "large or bold" : a >= 45 ? "large headings" : a >= 30 ? "non-text only" : a >= 15 ? "invisible-ish" : "nothing"; }
/** APCA font lookup, simplified: smallest body size at 400 weight for this Lc. */
function apcaMinSize(lc: number): string { const a = Math.abs(lc); if (a >= 90) return "14px"; if (a >= 75) return "15px"; if (a >= 60) return "18px"; if (a >= 45) return "24px"; if (a >= 30) return "36px+"; return "not for text"; }

export function ContrastThreeWays() {
  const [fg, setFg] = useState("#767676"); const [bg, setBg] = useState("#ffffff");
  const f = useMemo(() => hexToRgb(fg), [fg]); const b = useMemo(() => hexToRgb(bg), [bg]);
  const ratio = wcagRatio(f, b); const lc = apcaLc(f, b); const lcSwap = apcaLc(b, f);
  const ramp = useMemo(() => Array.from({ length: 21 }, (_, i) => i / 20), []);

  return (
    <div className="ct">
      <div className="ct-pairs" role="group" aria-label="Example pairs">
        {PAIRS.map((p) => <button key={p.name} type="button" className={`ct-pair ${fg === p.fg && bg === p.bg ? "is-on" : ""}`} style={{ color: p.fg, background: p.bg }} onClick={() => { setFg(p.fg); setBg(p.bg); }}>{p.name}</button>)}
      </div>
      <div className="ct-grid">
        <div className="ct-sample" style={{ color: fg, background: bg }}>
          <p className="ct-sample-body">Body text at 16px regular. The quick brown fox jumps over the lazy dog, and the contrast is what lets you read it without effort.</p>
          <p className="ct-sample-small">Caption at 12px, where every method gets strict.</p>
          <p className="ct-sample-large">Heading at 28px bold</p>
          <div className="ct-inputs">
            <label>Text <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} /><code>{fg}</code></label>
            <label>Background <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} /><code>{bg}</code></label>
            <button type="button" className="ct-swap" onClick={() => { setFg(bg); setBg(fg); }}>Swap</button>
          </div>
        </div>
        <div className="ct-scores">
          <section className="ct-score">
            <p className="cst-panel-kicker">WCAG 2.x ratio</p>
            <p className="ct-big">{ratio.toFixed(2)}<span>:1</span></p>
            <p className="ct-level">{wcagLevel(ratio)}</p>
            <p className="ct-why">(L1 + 0.05) / (L2 + 0.05). Symmetric: swapping text and background gives the same number. AA needs 4.5:1 for body, 3:1 for large text; AAA 7:1.</p>
          </section>
          <section className="ct-score">
            <p className="cst-panel-kicker">APCA Lc</p>
            <p className="ct-big">{lc < 0 ? "−" : ""}{Math.abs(lc).toFixed(0)}<span> Lc</span></p>
            <p className="ct-level">{apcaLevel(lc)} · min body size {apcaMinSize(lc)}</p>
            <p className="ct-why">Perceptual, polarity-aware: swapped, this pair scores {Math.abs(lcSwap).toFixed(0)} Lc. Negative means light text on dark. Body text wants 75+, 90 preferred; 60 for large or bold; 45 for headings.</p>
          </section>
          <p className="ct-note">{PAIRS.find((p) => p.fg === fg && p.bg === bg)?.why ?? "Pick a pair above or your own colours."}</p>
        </div>
      </div>

      <h3 className="ct-h">Where they disagree: grey text across the whole range</h3>
      <div className="ct-ramps">
        {(["#ffffff", "#000000"] as const).map((base) => (
          <div key={base} className="ct-ramp">
            <p className="cst-panel-kicker">Grey text on {base === "#ffffff" ? "white" : "black"}</p>
            <div className="ct-ramp-row">
              {ramp.map((g) => { const c: RGB = [g, g, g]; const bb = hexToRgb(base); const r = wcagRatio(c, bb); const l = Math.abs(apcaLc(c, bb)); return (
                <div key={g} className="ct-cell" style={{ background: base, color: toHex(c) }} title={`${toHex(c)}: WCAG ${r.toFixed(1)}:1, APCA ${l.toFixed(0)}`}>
                  <span className="ct-cell-a">Aa</span>
                  <span className={`ct-cell-w ${r >= 4.5 ? "is-pass" : ""}`} style={{ color: base === "#ffffff" ? "#000" : "#fff" }}>{r.toFixed(1)}</span>
                  <span className={`ct-cell-l ${l >= 75 ? "is-pass" : ""}`} style={{ color: base === "#ffffff" ? "#000" : "#fff" }}>{l.toFixed(0)}</span>
                </div>); })}
            </div>
            <p className="ct-ramp-key">Top: WCAG ratio (bold when ≥ 4.5). Bottom: APCA Lc (bold when ≥ 75). Read where the two thresholds fall.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
