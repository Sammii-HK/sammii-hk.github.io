"use client";
import { useEffect, useState } from "react";
import { CARD_MM, FINDINGS, FINGERS, MM_PER_IN, SCREENS, TARGETS, cssOf, guessCssPerIn, mmOf } from "../../../labs/charts/touch-targets/data";

/**
 * Touch targets drawn at their physical size. Two numbers decide it: how
 * many CSS pixels the chosen device packs into an inch (from its specs),
 * which turns a guideline into millimetres, and how many this screen packs
 * in (guessed, or measured against a bank card), which turns millimetres
 * back into pixels you can hold a finger to.
 */
const KEY = "labs-touch-css-per-in";
const mm1 = (x: number) => `${x.toFixed(1)} mm`;

export function TouchTargets() {
  const [device, setDevice] = useState("this");
  const [here, setHere] = useState<{ cssPerIn: number; why: string; measured: boolean }>({ cssPerIn: 96, why: "the CSS inch, until the page has looked at this screen", measured: false });
  const [calibrating, setCalibrating] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const g = guessCssPerIn(matchMedia("(pointer: coarse)").matches, window.devicePixelRatio || 1);
    let saved = NaN;
    try { saved = Number(localStorage.getItem(KEY)); } catch { /* storage blocked: use the guess */ }
    setHere(saved > 40 && saved < 400 ? { cssPerIn: saved, why: "measured against a card on this screen", measured: true } : { ...g, measured: false });
    const f = new URLSearchParams(window.location.search).get("focus");
    if (f && SCREENS.some((s) => s.id === f)) setDevice(f);
  }, []);
  const save = (v: number) => { setHere({ cssPerIn: v, why: "measured against a card on this screen", measured: true }); try { localStorage.setItem(KEY, String(v)); } catch { /* not kept: fine */ } };

  const dev = SCREENS.find((s) => s.id === device);
  const devPerIn = dev ? dev.cssPerIn : here.cssPerIn;
  const pxPerMm = (here.cssPerIn / MM_PER_IN) * zoom; // how this screen draws a millimetre, times the zoom
  const drawTarget = (css: number) => mmOf(css, devPerIn) * pxPerMm;
  const contact = (FINGERS[0].mm[0] + FINGERS[0].mm[1]) / 2;
  const wcag = TARGETS[0];
  const rulerMm = zoom > 1 ? 20 : 30;
  const sel = TARGETS.find((t) => t.id === pick) ?? FINGERS.find((f) => f.id === pick);

  return (
    <div className="tt">
      <div className="tt-knob" role="group" aria-label="Show sizes as on">
        <span className="tt-label">Show sizes as on</span>
        <div className="tt-opts">
          <button type="button" aria-pressed={device === "this"} onClick={() => setDevice("this")}>This screen</button>
          {SCREENS.map((s) => <button key={s.id} type="button" aria-pressed={device === s.id} onClick={() => setDevice(s.id)}>{s.name}</button>)}
        </div>
      </div>
      <p className="tt-cal">
        This screen: about <b>{here.cssPerIn.toFixed(0)} CSS px per inch</b>, {here.why}. {here.measured ? "Everything below is drawn life-size." : "For true size, measure it."}{" "}
        <button type="button" className="tt-cal-btn" onClick={() => setCalibrating((c) => !c)} aria-expanded={calibrating}>{calibrating ? "Done" : "Calibrate with a card"}</button>
      </p>
      {calibrating && (
        <div className="tt-calibrate">
          <label className="cst-year">
            <span className="cst-year-label">Card size</span>
            <input type="range" min={60} max={220} step={0.5} value={here.cssPerIn} onChange={(e) => save(Number(e.target.value))} aria-valuetext={`${here.cssPerIn} CSS pixels per inch`} />
            <output className="cst-year-value">{here.cssPerIn.toFixed(1)}</output>
          </label>
          <p className="tt-note">Hold a bank card (any card of the standard 85.6 × 54 mm size) flat against the screen, top-left corner to the outline&rsquo;s, and drag until the outline matches its edges. Kept in this browser only.</p>
          <div className="tt-card-wrap"><div className="tt-card" style={{ width: (CARD_MM[1] * pxPerMm) / zoom, height: (CARD_MM[0] * pxPerMm) / zoom }}><span>54 × 85.6 mm</span></div></div>
        </div>
      )}

      <p className="tt-total">
        {dev ? `On ${dev.name}` : "On this screen"}, WCAG&rsquo;s 24 px minimum is <strong>{mm1(mmOf(wcag.css, devPerIn))}</strong> square. A fingertip lands on <strong>{FINGERS[0].mm[0]} to {FINGERS[0].mm[1]} mm</strong>.
      </p>

      <div className="tt-stage">
        <div className="tt-opts tt-zoom" role="group" aria-label="Scale">
          <button type="button" aria-pressed={zoom === 1} onClick={() => setZoom(1)}>Life-size</button>
          <button type="button" aria-pressed={zoom === 3} onClick={() => setZoom(3)}>3× for detail</button>
        </div>
        <div className="tt-ruler" style={{ width: rulerMm * pxPerMm }} aria-hidden="true">
          {Array.from({ length: rulerMm + 1 }, (_, i) => <i key={i} className={i % 5 === 0 ? "is-major" : ""} style={{ left: i * pxPerMm }}>{i % (zoom > 1 ? 5 : 10) === 0 ? <b>{i}</b> : null}</i>)}
          <em>mm</em>
        </div>
        <ul className="tt-targets" aria-label="Targets at physical size">
          {TARGETS.map((t) => {
            const side = drawTarget(t.css), ring = contact * pxPerMm;
            return (
              <li key={t.id}>
                <button type="button" className={`tt-tile${pick === t.id ? " is-on" : ""}`} style={{ width: Math.max(side, ring) + 16, height: Math.max(side, ring) + 16 }} onClick={() => setPick(pick === t.id ? null : t.id)} onMouseEnter={() => setPick(t.id)} aria-label={`${t.name}, ${t.unit}: ${mm1(mmOf(t.css, devPerIn))}`}>
                  <span className="tt-square" style={{ width: side, height: side }} />
                  <span className="tt-contact" style={{ width: ring, height: ring }} />
                </button>
                <p><b>{t.name}</b><span>{t.unit}</span><span className="tt-mm">{mm1(mmOf(t.css, devPerIn))}</span></p>
              </li>
            );
          })}
        </ul>
        <ul className="tt-fingers" aria-label="Fingers at physical size">
          {FINGERS.map((f) => (
            <li key={f.id}>
              <button type="button" className={`tt-finger${pick === f.id ? " is-on" : ""}`} style={{ width: f.mm[1] * pxPerMm, height: f.mm[1] * pxPerMm }} onClick={() => setPick(pick === f.id ? null : f.id)} onMouseEnter={() => setPick(f.id)} aria-label={`${f.name}: ${f.mm[0] === f.mm[1] ? f.mm[0] : `${f.mm[0]} to ${f.mm[1]}`} mm`}>
                {f.mm[0] !== f.mm[1] && <span style={{ width: f.mm[0] * pxPerMm, height: f.mm[0] * pxPerMm }} />}
              </button>
              <p><b>{f.name}</b><span className="tt-mm">{f.mm[0] === f.mm[1] ? `about ${f.mm[0]}` : `${f.mm[0]} to ${f.mm[1]}`} mm</span></p>
            </li>
          ))}
        </ul>
        <p className="tt-panel" aria-live="polite">
          {sel ? <><b>{sel.name}.</b> {"rule" in sel ? sel.rule : sel.what} <span className="tt-src">{sel.source}.</span></> : "Each square is a target drawn at the size it would be on the screen you picked; the dashed circle is a 9 mm fingertip contact centred on it. Below them, fingers at their measured widths. Hover or tap any of them for the rule or the source."}
        </p>
      </div>

      <div className="tt-table-wrap">
        <table className="tt-table">
          <caption className="tt-caption">Each target in millimetres, by screen</caption>
          <thead><tr><th scope="col">Target</th>{SCREENS.map((s) => <th key={s.id} scope="col" className={device === s.id ? "is-col" : ""}>{s.name}</th>)}</tr></thead>
          <tbody>
            {TARGETS.map((t) => <tr key={t.id}><th scope="row">{t.name}<span>{t.unit}</span></th>{SCREENS.map((s) => <td key={s.id} className={device === s.id ? "is-col" : ""}>{mmOf(t.css, s.cssPerIn).toFixed(1)}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <div className="tt-table-wrap">
        <table className="tt-table">
          <caption className="tt-caption">What the studies ask for, in CSS pixels, by screen</caption>
          <thead><tr><th scope="col">Finding</th>{SCREENS.map((s) => <th key={s.id} scope="col" className={device === s.id ? "is-col" : ""}>{s.name}</th>)}</tr></thead>
          <tbody>
            {FINDINGS.map((f) => <tr key={f.id} title={f.what}><th scope="row">{f.mm} mm<span>{f.source}</span></th>{SCREENS.map((s) => <td key={s.id} className={device === s.id ? "is-col" : ""}>{Math.round(cssOf(f.mm, s.cssPerIn))} px</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <p className="tt-note">Screens: {SCREENS.map((s) => `${s.name}, ${s.cssPerIn.toFixed(1)} CSS px per inch (${s.how})`).join("; ")}.</p>
    </div>
  );
}
