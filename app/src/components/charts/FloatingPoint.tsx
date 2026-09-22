"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Floating point where an interface actually meets it: the seam between
 * tiles at a third of the width, the border that goes fuzzy at half a
 * pixel, the price total that comes out at 0.30000000000000004. Every
 * number here is measured or computed live; the bit view decodes the
 * actual 64 bits of whatever you type.
 */
function bits(x: number) {
  const buf = new DataView(new ArrayBuffer(8)); buf.setFloat64(0, x);
  const hi = buf.getUint32(0), lo = buf.getUint32(4);
  const b = hi.toString(2).padStart(32, "0") + lo.toString(2).padStart(32, "0");
  return { sign: b[0], exp: b.slice(1, 12), mant: b.slice(12), expVal: parseInt(b.slice(1, 12), 2) - 1023 };
}
const SUMS: [string, () => number | string][] = [
  ["0.1 + 0.2", () => 0.1 + 0.2],
  ["0.1 + 0.7", () => 0.1 + 0.7],
  ["3 × 0.1", () => 3 * 0.1],
  ["(1.005).toFixed(2)", () => (1.005).toFixed(2)],
  ["19.99 × 3", () => 19.99 * 3],
  ["0.1 × 3 in cents", () => (10 * 3) / 100],
  ["100 / 3 × 3", () => (100 / 3) * 3],
  ["2⁵³ + 1", () => 2 ** 53 + 1],
];

export function FloatingPoint() {
  const [cols, setCols] = useState(3);
  const [width, setWidth] = useState(1001);
  const [shift, setShift] = useState(0.5);
  const [num, setNum] = useState("0.1");
  const row = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<{ w: number; left: number; right: number }[]>([]);
  useEffect(() => {
    const go = () => { if (!row.current) return; setMeasured(Array.from(row.current.children).map((el) => { const r = el.getBoundingClientRect(); const base = row.current!.getBoundingClientRect().left; return { w: r.width, left: r.left - base, right: r.right - base }; })); };
    go(); const id = requestAnimationFrame(go); return () => cancelAnimationFrame(id);
  }, [cols, width]);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const x = Number(num); const b = useMemo(() => (Number.isFinite(x) ? bits(x) : null), [x]);
  const totalMeasured = measured.reduce((a, m) => a + m.w, 0);

  return (
    <div className="fp">
      <section className="fp-block">
        <h3 className="el-box-title">1 · The seam</h3>
        <div className="fp-controls">
          <label className="cst-year"><span className="cst-year-label">Columns</span><input type="range" min={2} max={7} value={cols} onChange={(e) => setCols(Number(e.target.value))} /><output className="cst-year-value">{cols}</output></label>
          <label className="cst-year"><span className="cst-year-label">Container width</span><input type="range" min={300} max={1200} value={width} onChange={(e) => setWidth(Number(e.target.value))} /><output className="cst-year-value">{width}px</output></label>
        </div>
        <div className="fp-seam-wrap"><div ref={row} className="fp-row" style={{ width: `${width}px` }}>{Array.from({ length: cols }, (_, i) => <div key={i} className="fp-tile" style={{ width: `${100 / cols}%` }} />)}</div></div>
        <p className="fp-read">{cols} × {(100 / cols).toFixed(4)}% of {width}px = {(width / cols).toFixed(3)}px each. Measured: {measured.map((m) => m.w.toFixed(3)).join(" + ")} = {totalMeasured.toFixed(3)}px{Math.abs(totalMeasured - width) > 0.001 ? ` (${(totalMeasured - width).toFixed(3)}px ${totalMeasured < width ? "short: a seam" : "over: an overflow"})` : " (exact)"}. Edges land at {measured.map((m) => m.right.toFixed(2)).join(", ")}: on a {dpr}× screen the browser can only paint at multiples of {(1 / dpr).toFixed(2)}px, so each fractional edge is either snapped or blended.</p>
      </section>

      <section className="fp-block">
        <h3 className="el-box-title">2 · The fuzzy border</h3>
        <label className="cst-year"><span className="cst-year-label">translateX</span><input type="range" min={0} max={1} step={0.05} value={shift} onChange={(e) => setShift(Number(e.target.value))} /><output className="cst-year-value">{shift.toFixed(2)}px</output></label>
        <div className="fp-fuzz">
          <div className="fp-box"><span>transform: none</span></div>
          <div className="fp-box" style={{ transform: `translateX(${shift}px)` }}><span>translateX({shift.toFixed(2)}px)</span></div>
          <div className="fp-box fp-box--layout" style={{ marginLeft: `${shift}px` }}><span>margin-left: {shift.toFixed(2)}px</span></div>
        </div>
        <p className="fp-read">The same 1px border three times. A transform is applied at raster time and can sit between device pixels, so at {shift.toFixed(2)}px the edge is anti-aliased across two of them and reads as blurred. Layout positions (margin, left) are snapped to the pixel grid before painting, so the third box stays crisp. Zoom in with the OS magnifier to see it; on a 1× screen it is obvious at 0.5, on a 2× screen it is subtler because the grid is finer.</p>
      </section>

      <section className="fp-block">
        <h3 className="el-box-title">3 · The price</h3>
        <div className="fp-sums">
          {SUMS.map(([label, f]) => { const v = f(); const s = String(v); const bad = /\d{8,}/.test(s) || label.startsWith("(1.005") || label.startsWith("2⁵³"); return <div key={label} className={`fp-sum ${bad ? "is-bad" : ""}`}><code>{label}</code><b>{s}</b></div>; })}
        </div>
        <p className="fp-read">A double has 53 bits of mantissa: every integer up to 2⁵³ exactly, and almost no decimal fractions at all, because a tenth is a repeating fraction in binary the way a third is in decimal. 1.005 is stored as 1.00499999999999989…, so <code>toFixed(2)</code> honestly rounds it down. Money goes in integer minor units, or a decimal type; never in a float.</p>
      </section>

      <section className="fp-block">
        <h3 className="el-box-title">4 · The bits</h3>
        <input className="aq-input fp-input" value={num} onChange={(e) => setNum(e.target.value)} aria-label="A number to decode" spellCheck={false} autoComplete="off" />
        {b && Number.isFinite(x) && (
          <div className="fp-bits">
            <div className="fp-bitrow"><span className="fp-bitlabel">sign</span><code className="fp-bin fp-bin--sign">{b.sign}</code><span className="fp-bitnote">{b.sign === "1" ? "negative" : "positive"}</span></div>
            <div className="fp-bitrow"><span className="fp-bitlabel">exponent</span><code className="fp-bin fp-bin--exp">{b.exp}</code><span className="fp-bitnote">2^{b.expVal}</span></div>
            <div className="fp-bitrow"><span className="fp-bitlabel">mantissa</span><code className="fp-bin fp-bin--mant">{b.mant}</code><span className="fp-bitnote">52 bits, plus the implicit leading 1</span></div>
            <p className="fp-read">Stored value, to 20 significant figures: <b>{x.toPrecision(20)}</b>. {x.toPrecision(20).replace(/0+$/, "") !== String(x) && x !== 0 ? "Not the number you typed: the nearest double to it." : "Exact."}</p>
          </div>
        )}
      </section>
    </div>
  );
}
