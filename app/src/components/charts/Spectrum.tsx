"use client";
import { useEffect, useState } from "react";
import { BANDS, CUTOFFS, FULL, HEAT, MARKERS, SEERS, VISIBLE, ZOOM, ZOOM_BANDS, type Seer } from "../../../labs/charts/spectrum/data";

/**
 * The electromagnetic spectrum to scale on a log wavelength axis, with the
 * band we see drawn at its true width; then the stretch around it, where
 * other animals see and sense, from the same sources; then the famous
 * "one ten-trillionth", worked out, because the answer depends entirely on
 * where you stop counting.
 */
const log = Math.log10;
type Ax = { lo: number; hi: number };
const pos = (m: number, ax: Ax) => ((log(m) - log(ax.lo)) / (log(ax.hi) - log(ax.lo))) * 100;
const nm = 1e-9;

function length(m: number): string {
  const units: [number, string][] = [[1e3, "km"], [1, "m"], [1e-2, "cm"], [1e-3, "mm"], [1e-6, "µm"], [1e-9, "nm"], [1e-12, "pm"], [1e-15, "fm"]];
  for (const [u, s] of units) if (m >= u * 0.999) { const v = m / u; return `${v >= 100 ? Math.round(v) : +v.toPrecision(2)} ${s}`; }
  return `${m.toExponential(0)} m`;
}

// approximate spectral hues for the gradient; a screen cannot show spectral colours exactly
const RAINBOW = "linear-gradient(90deg, #4b0082 0%, #6a0dad 6%, #3b3bff 18%, #00a3ff 30%, #00d27f 40%, #6ee000 50%, #f2e600 58%, #ff9a00 66%, #ff2a00 78%, #b30000 92%, #5a0000 100%)";

export function Spectrum() {
  const [open, setOpen] = useState<string | null>(null);
  const [cut, setCut] = useState(CUTOFFS[CUTOFFS.length - 1].id);
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("focus");
    if (f && SEERS.some((s) => s.id === f)) setOpen(f);
    if (f && CUTOFFS.some((c) => c.id === f)) setCut(f);
  }, []);
  const visPct = pos(VISIBLE.hi, FULL) - pos(VISIBLE.lo, FULL);
  const decades = log(FULL.hi) - log(FULL.lo);
  const sel = SEERS.find((s) => s.id === open);

  // linear frequency: the visible band's share of everything from 0 Hz up to the chosen photon energy
  const C = 299792458, H_EV = 4.135667696e-15;
  const visWidthHz = C / VISIBLE.lo - C / VISIBLE.hi;
  const chosen = CUTOFFS.find((c) => c.id === cut) ?? CUTOFFS[0];
  const topHz = chosen.eV / H_EV;
  const share = visWidthHz / topHz;

  return (
    <div className="sp">
      <section className="sp-full" aria-labelledby="sp-full-title">
        <h2 id="sp-full-title" className="section-eyebrow sp-h">The whole spectrum, to scale</h2>
        <p className="sp-total"><strong>{visPct.toFixed(1)}%</strong> of this axis is light you can see. It runs from {length(FULL.lo)} to {length(FULL.hi)}, {decades.toFixed(0)} powers of ten, and the visible band is the {length(VISIBLE.lo)} to {length(VISIBLE.hi)} sliver in colour.</p>
        <div className="sp-strip" role="img" aria-label={`The electromagnetic spectrum on a log wavelength axis from ${length(FULL.lo)} to ${length(FULL.hi)}: ${BANDS.map((b) => `${b.name} ${length(b.lo)} to ${length(b.hi)}`).join("; ")}. Visible light is ${visPct.toFixed(1)} percent of the width.`}>
          {BANDS.map((b) => {
            const l = Math.max(0, pos(b.lo, FULL)), r = Math.min(100, pos(b.hi, FULL));
            return (
              <span key={b.id} className={`sp-band is-${b.id}`} style={{ left: `${l}%`, width: `${r - l}%`, background: b.id === "visible" ? RAINBOW : undefined }}>
                {b.id !== "visible" && <span className="sp-band-name">{b.name}</span>}
              </span>
            );
          })}
          <span className="sp-callout" style={{ left: `${(pos(VISIBLE.lo, FULL) + pos(VISIBLE.hi, FULL)) / 2}%` }}><span>visible</span></span>
        </div>
        <Axis ax={FULL} every={3} />
        <ul className="sp-bands" aria-label="Bands, shortest wavelength first">
          {BANDS.filter((b) => b.id !== "visible").concat(BANDS.filter((b) => b.id === "visible")).sort((a, b) => a.lo - b.lo).map((b) => (
            <li key={b.id} className={b.id === "visible" ? "is-visible" : undefined}><b>{b.name}</b> {b.id === "gamma" ? `shorter than ${length(b.hi)}` : b.id === "radio" ? `longer than ${length(b.lo)}` : `${length(b.lo)} to ${length(b.hi)}`}</li>
          ))}
        </ul>
        <p className="sp-note">Band edges are conventions, not physics: X-rays and gamma rays overlap and are told apart by where they come from, and the microwave and radio boundaries differ between standards. Gamma rays carry on past the left edge: the most energetic photons yet recorded are around 10⁻²¹ m.</p>
      </section>

      <section className="sp-zoom" aria-labelledby="sp-zoom-title">
        <h2 id="sp-zoom-title" className="section-eyebrow sp-h">Closer, and who sees what</h2>
        <div className="sp-zoom-grid">
          <div className="sp-zoom-plot">
            <p className="sp-plot-title">Light, 250 nm to 1 µm: eyes</p>
            <Plot ax={ZOOM} kind="eye" open={open} setOpen={setOpen} />
            <p className="sp-plot-title">Heat, 1 to 30 µm: a different sense</p>
            <Plot ax={HEAT} kind="heat" open={open} setOpen={setOpen} />
          </div>
          <div id="sp-panel" className="sp-panel" aria-live="polite">
            {sel ? (
              <>
                <p className="cst-panel-kicker">{sel.how}</p>
                <h3 className="cst-panel-title">{sel.name}</h3>
                <p className="sp-panel-range">{sel.approx ? "About " : ""}{length(sel.lo * nm)} to {length(sel.hi * nm)}{sel.peaks ? `, peaks at ${sel.peaks.join(", ")} nm` : ""}</p>
                <p className="cst-panel-what">{sel.what}</p>
                {sel.note && <p className="cst-panel-why">{sel.note}</p>}
                <p className="cst-panel-fam">{sel.src}</p>
              </>
            ) : (
              <>
                <h3 className="cst-panel-title">Tap a row</h3>
                <p className="cst-panel-what">Each bar is the range a species&rsquo; eyes or sense organs respond to, from the source in the panel. Ticks inside a bar are the peak sensitivities of its receptor types. Bars with a soft edge are ranges the sources give only roughly; the hatched bar is a heat sense, not an eye.</p>
                {MARKERS.map((m) => <p key={m.id} className="cst-panel-fam"><b>{m.short}:</b> {m.text}</p>)}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="sp-frac" aria-labelledby="sp-frac-title">
        <h2 id="sp-frac-title" className="section-eyebrow sp-h">&ldquo;Less than one ten-trillionth&rdquo;, checked</h2>
        <p className="sp-p">&ldquo;What we see is less than a ten-trillionth of what&rsquo;s out there,&rdquo; David Eagleman told a TED audience in 2015. On the log axis above it is {visPct.toFixed(1)}%. Both can be right, because the spectrum has no top: the fraction depends on where you stop counting, and on whether you count in wavelength or in frequency. Counted in frequency, from zero up to a photon of your choosing:</p>
        <div className="kp-knob" role="group" aria-label="Stop counting at">
          <span className="kp-knob-label">Stop counting at</span>
          <div className="kp-knob-opts">
            {CUTOFFS.map((c) => <button key={c.id} type="button" aria-pressed={cut === c.id} onClick={() => setCut(c.id)}>{c.name}</button>)}
          </div>
        </div>
        <p className="sp-frac-out" aria-live="polite">
          Visible light, {(visWidthHz / 1e12).toFixed(0)} THz wide, is <strong>{fraction(share)}</strong> of the frequencies up to {chosen.label}.
          {share < 1e-13 ? " Less than one ten-trillionth." : ` Not yet one ten-trillionth: that needs the count to reach photons of about ${(visWidthHz * 1e13 * H_EV / 1e12).toFixed(0)} TeV.`}
        </p>
        <p className="sp-note">{chosen.src}</p>
      </section>
    </div>
  );
}

function fraction(x: number): string {
  const one = 1 / x;
  const words: [number, string][] = [[1e15, "quadrillion"], [1e12, "trillion"], [1e9, "billion"], [1e6, "million"], [1e3, "thousand"]];
  for (const [n, w] of words) if (one >= n) return `about one part in ${+(one / n).toPrecision(2)} ${w}`;
  return `about one part in ${Math.round(one)}`;
}

function Plot({ ax, kind, open, setOpen }: { ax: Ax; kind: Seer["kind"]; open: string | null; setOpen: (id: string | null) => void }) {
  const marks = MARKERS.filter((m) => m.at * nm > ax.lo && m.at * nm < ax.hi);
  return (
    <div className="sp-plot">
      <div className="sp-row sp-row-bands" aria-hidden="true">
        <span className="sp-row-label" />
        <span className="sp-track">
          {ZOOM_BANDS.filter((b) => b.hi > ax.lo && b.lo < ax.hi).map((b) => {
            const l = Math.max(0, pos(b.lo, ax)), r = Math.min(100, pos(b.hi, ax));
            return <span key={b.id} className={`sp-zband is-${b.id}`} style={{ left: `${l}%`, width: `${r - l}%`, background: b.id === "visible" ? RAINBOW : undefined }}><span>{b.name}</span></span>;
          })}
        </span>
      </div>
      <ol className="sp-rows">
        {SEERS.filter((s) => s.kind === kind).map((s) => <SeerRow key={s.id} s={s} ax={ax} marks={marks.map((m) => pos(m.at * nm, ax))} open={open === s.id} onOpen={() => setOpen(s.id)} />)}
      </ol>
      {marks.length > 0 && (
        <div className="sp-row sp-row-marks" aria-hidden="true">
          <span className="sp-row-label" />
          <span className="sp-track">{marks.map((m) => <span key={m.id} className={`sp-mark is-${m.id}`} style={{ left: `${pos(m.at * nm, ax)}%` }}><span>{m.short}</span></span>)}</span>
        </div>
      )}
      <div className="sp-row" aria-hidden="true"><span className="sp-row-label" /><Axis ax={ax} every={1} minor /></div>
    </div>
  );
}

function SeerRow({ s, ax, marks, open, onOpen }: { s: Seer; ax: Ax; marks: number[]; open: boolean; onOpen: () => void }) {
  const l = pos(s.lo * nm, ax), r = pos(s.hi * nm, ax);
  return (
    <li className={`sp-row is-${s.kind}${open ? " is-open" : ""}`}>
      <button type="button" className="sp-row-label" aria-pressed={open} aria-controls="sp-panel" onClick={onOpen} onMouseEnter={onOpen} onFocus={onOpen}>
        <span className="sp-row-name">{s.name}</span>
        <span className="sp-row-range">{s.approx ? "about " : ""}{length(s.lo * nm)} to {length(s.hi * nm)}</span>
      </button>
      <span className="sp-track" aria-hidden="true">
        {marks.map((m) => <b key={m} className="sp-guide" style={{ left: `${m}%` }} />)}
        <span className={`sp-bar${s.approx ? " is-approx" : ""}`} style={{ left: `${l}%`, width: `${r - l}%` }} />
        {(s.peaks ?? []).map((p) => <i key={p} className="sp-peak" style={{ left: `${pos(p * nm, ax)}%` }} />)}
      </span>
    </li>
  );
}

function Axis({ ax, every, minor }: { ax: Ax; every: number; minor?: boolean }) {
  const ticks: number[] = [];
  for (let e = Math.ceil(log(ax.lo)); e <= Math.floor(log(ax.hi)); e++) ticks.push(e);
  const sub: number[] = [];
  const ks = log(ax.hi) - log(ax.lo) < 1.5 ? [2, 3, 4, 5, 7] : [2, 3, 5];
  if (minor) for (let e = Math.floor(log(ax.lo)); e <= Math.floor(log(ax.hi)); e++) for (const k of ks) { const v = k * 10 ** e; if (v > ax.lo * 1.01 && v < ax.hi * 0.99) sub.push(v); }
  return (
    <div className={`sp-axis${log(ax.hi) - log(ax.lo) < 1.5 ? " is-short" : ""}`} aria-hidden="true">
      {ticks.map((e) => (
        <span key={e} className={`sp-tick${(e - Math.ceil(log(ax.lo))) % every === 0 ? " is-label" : ""}`} style={{ left: `${pos(10 ** e, ax)}%` }}>
          {(e - Math.ceil(log(ax.lo))) % every === 0 && <em>{length(10 ** e)}</em>}
        </span>
      ))}
      {sub.map((v) => <span key={v} className="sp-tick is-minor" style={{ left: `${pos(v, ax)}%` }}><em>{length(v)}</em></span>)}
    </div>
  );
}
