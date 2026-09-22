"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * Why 16px is not 16px: the font-size is the em box, and every family
 * fills it differently. Each font here is loaded, then measured with the
 * canvas text API on your machine: x-height from the ascent of an x,
 * cap height from an H, ascender from a d, descender from a p, and the
 * line box from the font's own bounding box. Nothing is looked up.
 */
import { FAMILIES } from "../../../labs/charts/x-height/data";
const SYSTEM = ["Georgia", "Times New Roman", "Arial", "Verdana", "Helvetica"];
type M = { family: string; x: number; cap: number; asc: number; desc: number; boxAsc: number; boxDesc: number; width: number; ok: boolean };

function measure(family: string): M {
  const c = document.createElement("canvas").getContext("2d")!;
  const S = 100; c.font = `${S}px "${family}"`;
  const x = c.measureText("x").actualBoundingBoxAscent / S;
  const cap = c.measureText("H").actualBoundingBoxAscent / S;
  const asc = c.measureText("d").actualBoundingBoxAscent / S;
  const desc = c.measureText("p").actualBoundingBoxDescent / S;
  const m = c.measureText("Hxdp");
  const width = c.measureText("the quick brown fox jumps over the lazy dog").width / S;
  const ok = document.fonts.check(`${S}px "${family}"`) || SYSTEM.includes(family);
  return { family, x, cap, asc, desc, boxAsc: m.fontBoundingBoxAscent / S, boxDesc: m.fontBoundingBoxDescent / S, width, ok };
}

export function XHeight() {
  const [ms, setMs] = useState<M[]>([]);
  const [ref, setRef] = useState("Inter");
  const [size, setSize] = useState(24);
  const [adjust, setAdjust] = useState(true);
  const overlay = useRef<HTMLDivElement>(null); const strut = useRef<HTMLSpanElement>(null);
  const [baseline, setBaseline] = useState(0); // px from the top of the overlay to the shared baseline
  useLayoutEffect(() => {
    const go = () => { if (overlay.current && strut.current) setBaseline(strut.current.getBoundingClientRect().top - overlay.current.getBoundingClientRect().top); };
    go(); window.addEventListener("resize", go); return () => window.removeEventListener("resize", go);
  }, [size, ms]);
  useEffect(() => {
    let live = true;
    (async () => {
      await Promise.all([...FAMILIES, ...SYSTEM].map((f) => document.fonts.load(`100px "${f}"`).catch(() => null)));
      if (live) setMs([...FAMILIES, ...SYSTEM].map(measure).filter((m) => m.ok && m.x > 0));
    })();
    return () => { live = false; };
  }, []);
  const sorted = useMemo(() => ms.slice().sort((a, b) => b.x - a.x), [ms]);
  const refM = ms.find((m) => m.family === ref);
  const pick = ms.filter((m) => ["Inter", "Georgia", "Verdana", "EB Garamond", "Montserrat", "Oswald"].includes(m.family));

  return (
    <div className="xh">
      {ms.length === 0 && <p className="xh-loading">Loading and measuring {FAMILIES.length + SYSTEM.length} fonts on your machine…</p>}
      {ms.length > 0 && <>
        <div className="xh-overlay-wrap">
          <p className="cst-panel-kicker">Same font-size, six families, baselines aligned</p>
          <div className="xh-overlay" ref={overlay} style={{ fontSize: `${size * 2.6}px` }}>
            <span ref={strut} className="xh-strut" aria-hidden="true" />
            {pick.map((m) => <span key={m.family} style={{ fontFamily: `"${m.family}"` }} title={m.family}>Hxdp</span>)}
            {refM && baseline > 0 && <><i className="xh-line xh-line--x" style={{ top: `${baseline - refM.x * size * 2.6}px` }}><b>x-height, {ref}</b></i><i className="xh-line xh-line--cap" style={{ top: `${baseline - refM.cap * size * 2.6}px` }}><b>cap height</b></i><i className="xh-line xh-line--base" style={{ top: `${baseline}px` }}><b>baseline</b></i></>}
          </div>
          <p className="xh-legend">{pick.map((m) => m.family).join(" · ")}. Lines are the x-height and cap height of {ref}, the reference, so you can see every other family over- or undershooting them.</p>
        </div>

        <div className="xh-controls">
          <label className="cst-year"><span className="cst-year-label">Reference</span><select value={ref} onChange={(e) => setRef(e.target.value)} className="xh-select">{sorted.map((m) => <option key={m.family} value={m.family}>{m.family}</option>)}</select></label>
          <label className="cst-year"><span className="cst-year-label">font-size</span><input type="range" min={12} max={40} value={size} onChange={(e) => setSize(Number(e.target.value))} /><output className="cst-year-value">{size}px</output></label>
        </div>

        <div className="xh-table-wrap">
          <table className="xh-table">
            <thead><tr><th>Family</th><th>x-height</th><th>cap</th><th>ascender</th><th>descender</th><th>line box</th><th>to match {ref}&rsquo;s x-height at {size}px</th></tr></thead>
            <tbody>
              {sorted.map((m) => { const eq = refM ? (size * refM.x) / m.x : size; return (
                <tr key={m.family} className={m.family === ref ? "is-ref" : ""} onClick={() => setRef(m.family)}>
                  <th scope="row" style={{ fontFamily: `"${m.family}"` }}>{m.family}</th>
                  <td><span className="xh-bar"><i style={{ width: `${m.x * 100}%` }} /></span><b>{m.x.toFixed(3)}</b></td>
                  <td>{m.cap.toFixed(2)}</td><td>{m.asc.toFixed(2)}</td><td>{m.desc.toFixed(2)}</td>
                  <td>{(m.boxAsc + m.boxDesc).toFixed(2)}</td>
                  <td className="xh-eq">{eq.toFixed(1)}px</td>
                </tr>); })}
            </tbody>
          </table>
        </div>
        <p className="jd-note">All values are fractions of the em (the font-size). x-height is the ratio <code>font-size-adjust</code> takes: set <code>font-size-adjust: {refM?.x.toFixed(3)}</code> on a block and the browser scales any fallback family so its x-height matches {ref}&rsquo;s. The line box column is the font&rsquo;s own ascent plus descent, which is what <code>line-height: normal</code> uses, and why the same line-height looks different per family and why icons never centre next to text.</p>

        <h3 className="ct-h">font-size-adjust, live</h3>
        <div className="xh-adjust">
          <label className="sc-toggle"><input type="checkbox" checked={adjust} onChange={(e) => setAdjust(e.target.checked)} />apply <code>font-size-adjust: {refM?.x.toFixed(3)}</code> to the fallbacks</label>
          <div className="xh-adjust-row" style={{ fontSize: `${size}px` }}>
            {["Inter", "Georgia", "Verdana", "EB Garamond"].filter((f) => ms.some((m) => m.family === f)).map((f) => (
              <p key={f} style={{ fontFamily: `"${f}"`, fontSizeAdjust: adjust && refM ? refM.x : "none" }}><span className="xh-fam">{f}</span>Quick brown foxes jump over lazy dogs at {size}px.</p>
            ))}
          </div>
          <p className="jd-note">Same font-size in four families, with the adjustment off and on. On, the lowercase is the same height in all four, which is what makes a fallback font stop looking like a different size when the web font has not arrived, and stops the layout jumping when it does.</p>
        </div>
      </>}
    </div>
  );
}
