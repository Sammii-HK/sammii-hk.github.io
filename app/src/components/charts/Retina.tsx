"use client";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { BLIND_SPOT, DISC, NASAL, TEMPORAL, TOTALS } from "../../../labs/charts/retina/data";

/**
 * What the retina actually samples: cone and rod density along the
 * horizontal meridian, from Curcio's own spreadsheet, with the optic disc
 * left empty because there is nothing there to count. Above it, the blind
 * spot found by hand, with the three things the brain fills it with.
 */
type Pt = { deg: number; mm: number; cones: number | null; rods: number | null };
type Key = "cones" | "rods";

// One signed axis: the temporal retina to the left (negative), the nasal retina, where the optic disc is, to the right.
const POINTS: Pt[] = [
  ...TEMPORAL.slice(1).reverse().map(([mm, deg, cones, rods]): Pt => ({ deg: -deg, mm: -mm, cones, rods })),
  ...NASAL.map(([mm, deg, cones, rods]): Pt => ({ deg, mm, cones, rods })),
];
const SERIES: Record<Key, Pt[]> = { cones: POINTS.filter((p) => p.cones !== null), rods: POINTS.filter((p) => p.rods !== null) };
const D0 = DISC.centreDeg - DISC.widthDeg / 2;
const D1 = DISC.centreDeg + DISC.widthDeg / 2;
const inDisc = (d: number) => d >= D0 && d <= D1;
const PEAK = POINTS.find((p) => p.deg === 0)?.cones ?? 196890;

function lerp(pts: Pt[], deg: number, get: (p: Pt) => number): number | null {
  if (!pts.length || deg < pts[0].deg || deg > pts[pts.length - 1].deg) return null;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (deg <= b.deg) { const t = (deg - a.deg) / (b.deg - a.deg || 1); return get(a) + t * (get(b) - get(a)); }
  }
  return null;
}
const density = (deg: number, key: Key) => (inDisc(deg) ? 0 : lerp(SERIES[key], deg, (p) => p[key] as number));
const mmAt = (deg: number) => lerp(POINTS, deg, (p) => p.mm) ?? 0;
const sampled = (deg: number) => POINTS.some((p) => Math.abs(p.deg - deg) < 0.005);

const VIEWS = {
  whole: { lo: -70, hi: 92, step: 0.5, ticks: [-60, -40, -20, 0, 20, 40, 60, 80], label: "Whole retina" },
  centre: { lo: -10, hi: 10, step: 0.05, ticks: [-10, -5, 0, 5, 10], label: "Central 20°" },
} as const;
type View = keyof typeof VIEWS;

const fmt = (n: number) => Math.round(n).toLocaleString("en-GB");
const round = (n: number) => (n >= 10000 ? Math.round(n / 100) * 100 : n >= 1000 ? Math.round(n / 10) * 10 : Math.round(n));
const side = (deg: number) => (Math.abs(deg) < 0.005 ? "at the centre of the fovea" : `${Math.abs(deg).toFixed(Math.abs(deg) < 10 ? 1 : 0)}° ${deg < 0 ? "temporal" : "nasal"}`);

export function Retina() {
  return (
    <div className="rt">
      <BlindSpotDemo />
      <h2 className="section-eyebrow rt-h">What the retina samples</h2>
      <DensityChart />
      <Counts />
    </div>
  );
}

/** The classic blind-spot card, in three versions: a dot that vanishes, a broken line that mends, a hole that fills with stripes. */
function BlindSpotDemo() {
  const [eye, setEye] = useState<"right" | "left">("right");
  const [target, setTarget] = useState<"dot" | "line" | "stripes">("dot");
  const rad = Math.PI / 180;
  const near = 1 / Math.tan((BLIND_SPOT.centreDeg + DISC.widthDeg / 2) * rad);
  const mid = 1 / Math.tan(BLIND_SPOT.centreDeg * rad);
  const far = 1 / Math.tan((BLIND_SPOT.centreDeg - DISC.widthDeg / 2) * rad);
  const other = eye === "right" ? "left" : "right";
  const what = { dot: "the dot", line: "the gap in the line", stripes: "the hole in the stripes" }[target];
  const result = {
    dot: "the dot lands on your blind spot and disappears. The card looks blank where it was.",
    line: "the gap lands on your blind spot and the line looks unbroken. There is no line there; your brain draws one.",
    stripes: "the hole lands on your blind spot and fills with stripes. There are no stripes there; your brain carries them across.",
  }[target];
  return (
    <section className="rt-demo-wrap" aria-labelledby="rt-demo-title">
      <h2 id="rt-demo-title" className="section-eyebrow rt-h">Find your blind spot</h2>
      <div className="rt-knobs">
        <Knob label="Eye" value={eye} options={["right", "left"] as const} fmt={(v) => `${v} eye`} onChange={setEye} />
        <Knob label="Target" value={target} options={["dot", "line", "stripes"] as const} fmt={(v) => v} onChange={setTarget} />
      </div>
      <figure className="rt-demo-figure">
        <div
          className={`rt-demo is-${eye} is-${target}`}
          role="img"
          aria-label={`A cross on the ${eye === "right" ? "left" : "right"} and ${what} on the ${eye === "right" ? "right" : "left"}, for finding the blind spot of your ${eye} eye.`}
        >
          <span className="rt-cross" aria-hidden="true">+</span>
          {target === "line" && <span className="rt-line" aria-hidden="true" />}
          <span className="rt-target" aria-hidden="true" />
        </div>
        <figcaption className="rt-demo-steps">
          Close your {other} eye and look at the cross with your {eye} eye. Keep looking at the cross, not at {what}, and bring your face slowly towards the screen. When your eye is about <strong>{mid.toFixed(1)} times</strong> as far from the screen as {what} is from the cross (anywhere between {near.toFixed(1)} and {far.toFixed(1)}), {result}
        </figcaption>
      </figure>
      <p className="rt-note">Why that distance: the centre of the blind spot sits {BLIND_SPOT.centreDeg}° out from where you are looking, so {what} has to be seen at that angle, and 1 / tan {BLIND_SPOT.centreDeg}° is {mid.toFixed(2)}. The blind spot is about {DISC.widthDeg.toFixed(1)}° wide, which is why there is a range rather than a single point.</p>
    </section>
  );
}

function DensityChart() {
  const [view, setView] = useState<View>("whole");
  const [logY, setLogY] = useState(false);
  const [sel, setSel] = useState(0);
  const [w, setW] = useState(760);
  const stage = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("focus");
    if (f === "fovea") { setView("centre"); setSel(0); }
    if (f === "blindspot") { setView("whole"); setSel(DISC.centreDeg); document.getElementById("rt-demo-title")?.scrollIntoView(); }
    if (f === "rods") { setView("whole"); setSel(21.43); }
    if (f === "log") { setView("whole"); setLogY(true); setSel(-40); }
  }, []);
  useEffect(() => {
    const el = stage.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const v = VIEWS[view];
  const narrow = w < 560;
  const W = Math.max(300, w), H = narrow ? 300 : 380;
  const L = narrow ? 44 : 60, R = 14, T = 18, B = 44;
  const x = (d: number) => L + ((d - v.lo) / (v.hi - v.lo)) * (W - L - R);
  const Y_MAX = 200000, LOG_LO = 10, LOG_HI = 300000;
  const y = (n: number) => {
    const t = logY ? (Math.log10(Math.max(LOG_LO, n)) - Math.log10(LOG_LO)) / (Math.log10(LOG_HI) - Math.log10(LOG_LO)) : n / Y_MAX;
    return H - B - Math.min(1, Math.max(0, t)) * (H - T - B);
  };
  const yTicks = logY ? [10, 100, 1000, 10000, 100000] : [0, 50000, 100000, 150000, 200000];
  const tickLabel = (n: number) => (n >= 1000 ? `${n / 1000}k` : String(n));

  // Draw each series as runs between gaps (no value, or the disc), so the line never crosses the disc.
  const paths: Record<Key, string> = { cones: "", rods: "" };
  (["cones", "rods"] as Key[]).forEach((k) => {
    let pen = false;
    POINTS.forEach((p) => {
      const val = p[k];
      if (val === null || inDisc(p.deg)) { pen = false; return; }
      paths[k] += `${pen ? "L" : "M"}${x(p.deg).toFixed(1)} ${y(val).toFixed(1)} `;
      pen = true;
    });
  });

  const clampSel = (d: number) => Math.min(v.hi, Math.max(v.lo, d));
  useEffect(() => { setSel((s) => Math.min(VIEWS[view].hi, Math.max(VIEWS[view].lo, s))); }, [view]);
  const onPointer = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const d = v.lo + ((px - L) / (W - L - R)) * (v.hi - v.lo);
    setSel(Math.round(clampSel(d) / v.step) * v.step);
  };

  const c = density(sel, "cones"), r = density(sel, "rods");
  const show = (n: number) => fmt(sampled(sel) ? n : round(n));
  const disc = inDisc(sel);
  const exact = sampled(sel);
  const valueText = disc ? `${side(sel)}: the optic disc, no photoreceptors` : `${side(sel)}: ${c === null ? "no cone data" : `${show(c)} cones`}, ${r === null ? "no rod data" : `${show(r)} rods`} per square millimetre`;

  return (
    <div className="rt-chart">
      <div className="rt-knobs">
        <Knob label="Range" value={view} options={["whole", "centre"] as const} fmt={(k) => VIEWS[k].label} onChange={setView} />
        <Knob label="Density axis" value={logY ? "log" : "linear"} options={["linear", "log"] as const} fmt={(k) => k} onChange={(k) => setLogY(k === "log")} />
        <p className="rt-key" aria-hidden="true">
          <span><svg width="28" height="10"><line x1="0" x2="28" y1="5" y2="5" className="rt-line-cones" /></svg> Cones: detail and colour</span>
          <span><svg width="28" height="10"><line x1="0" x2="28" y1="5" y2="5" className="rt-line-rods" /></svg> Rods: dim light, no colour</span>
        </p>
      </div>
      <div className="rt-stage" ref={stage}>
        <svg
          className="rt-svg"
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          role="img"
          aria-label={`Photoreceptor density along the horizontal meridian of the human retina, ${v.label.toLowerCase()}, ${logY ? "log" : "linear"} density axis. Cones peak at ${fmt(PEAK)} per square millimetre at the centre of the fovea and fall below 10,000 within about 10 degrees. Rods are absent at the centre, peak near 145,000 about 20 degrees out, and decline towards the edge. On the nasal side, about 11 to 17 degrees out, the optic disc has neither. The data table below lists every value.`}
          onPointerMove={onPointer}
          onPointerDown={onPointer}
        >
          <defs>
            <clipPath id={`${uid}-plot`}><rect x={L} y={T - 4} width={W - L - R} height={H - T - B + 8} /></clipPath>
            <pattern id={`${uid}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" className="rt-hatch-line" /></pattern>
          </defs>
          {yTicks.map((t) => (
            <g key={t} className="rt-tick"><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} /><text x={L - 6} y={y(t) + 4} textAnchor="end">{tickLabel(t)}</text></g>
          ))}
          {v.ticks.map((t) => (
            <g key={t} className="rt-tick rt-tick-x"><line x1={x(t)} x2={x(t)} y1={T} y2={H - B} /><text x={x(t)} y={H - B + 16} textAnchor="middle">{t === 0 ? "0°" : `${Math.abs(t)}°`}</text></g>
          ))}
          <text x={L} y={H - 8} className="rt-axis">← temporal retina</text>
          <text x={W - R} y={H - 8} textAnchor="end" className="rt-axis">nasal retina →</text>
          <text x={L + 4} y={T + 10} className="rt-axis">{logY ? "per mm², log scale; zero sits on the floor" : "per mm²"}</text>
          <g clipPath={`url(#${uid}-plot)`}>
            {view === "whole" && (
              <g className="rt-disc">
                <rect x={x(D0)} y={T} width={x(D1) - x(D0)} height={H - T - B} fill={`url(#${uid}-hatch)`} />
                <text transform={`translate(${x(DISC.centreDeg) + 4} ${T + (H - T - B) * 0.62}) rotate(-90)`} textAnchor="middle">optic disc: no receptors</text>
              </g>
            )}
            {view === "centre" && (
              <g className="rt-disc">
                <rect x={x(-TOTALS.rodFreeDeg / 2)} y={T} width={x(TOTALS.rodFreeDeg / 2) - x(-TOTALS.rodFreeDeg / 2)} height={H - T - B} className="rt-rodfree" />
                <text x={x(TOTALS.rodFreeDeg / 2) + 6} y={T + 26}>no rods ({TOTALS.rodFreeDeg}°)</text>
              </g>
            )}
            <path d={paths.rods} className="rt-line-rods" />
            <path d={paths.cones} className="rt-line-cones" />
            {POINTS.map((p) => (
              <g key={p.deg} aria-hidden="true">
                {p.rods !== null && !inDisc(p.deg) && <circle cx={x(p.deg)} cy={y(p.rods)} r={2} className="rt-dot-rods" />}
                {p.cones !== null && !inDisc(p.deg) && <circle cx={x(p.deg)} cy={y(p.cones)} r={2} className="rt-dot-cones" />}
              </g>
            ))}
            <g className="rt-cursor" aria-hidden="true">
              <line x1={x(sel)} x2={x(sel)} y1={T} y2={H - B} />
              {r !== null && !disc && <circle cx={x(sel)} cy={y(r)} r={5} className="rt-cursor-rods" />}
              {c !== null && !disc && <circle cx={x(sel)} cy={y(c)} r={5} className="rt-cursor-cones" />}
            </g>
          </g>
        </svg>
      </div>
      <label className="cst-year rt-slider">
        <span className="cst-year-label">From the centre</span>
        <input type="range" min={v.lo} max={v.hi} step={v.step} value={sel} onChange={(e) => setSel(Number(e.target.value))} aria-valuetext={valueText} />
        <output className="cst-year-value rt-out">{Math.abs(sel) < 0.005 ? "0°" : `${Math.abs(sel).toFixed(view === "centre" ? 2 : 1)}° ${sel < 0 ? "temporal" : "nasal"}`}</output>
      </label>
      <div className="rt-readout" aria-live="polite">
        <p className="cst-panel-kicker">{Math.abs(sel) < 0.005 ? "The centre of the fovea" : `${side(sel)} · ${Math.abs(mmAt(sel)).toFixed(2)} mm from the centre`}{exact || disc ? "" : " · between measured points"}</p>
        {disc ? (
          <>
            <h3 className="cst-panel-title">The optic disc: no rods, no cones</h3>
            <p className="cst-panel-what">This is where the optic nerve and the blood vessels leave the eye, about {DISC.widthMm} mm across. Light that lands here is not detected at all. Because the lens flips the image, this patch of nasal retina looks out at the temporal side of your visual field: the blind spot you found above.</p>
          </>
        ) : (
          <>
            <h3 className="cst-panel-title">
              {c === null ? "No cone data" : `${show(c)} cones`} · {r === null ? "no rod data" : `${show(r)} rods`} <span className="rt-unit">per mm²</span>
            </h3>
            <p className="cst-panel-what">
              {r === 0 || (r !== null && r < 1) ? "Only cones. The very centre of your gaze has no rods at all, which is why a faint star can vanish when you look straight at it."
                : c !== null && r !== null ? `One cone for every ${(r / c).toFixed(r / c < 10 ? 1 : 0)} rods. Cone density here is ${((c / PEAK) * 100).toFixed(c / PEAK < 0.1 ? 1 : 0)}% of its peak at the centre of the fovea.`
                : "The composite has no value this far out on this side."}
            </p>
          </>
        )}
      </div>
      <details className="rt-data">
        <summary>The data: every measured point on the horizontal meridian</summary>
        <div className="rt-data-scroll">
          <table className="rt-table">
            <caption className="sr-only">Cone and rod density along the horizontal meridian, Curcio et al. 1990</caption>
            <thead><tr><th scope="col">Side</th><th scope="col">mm</th><th scope="col">Degrees</th><th scope="col">Cones per mm²</th><th scope="col">Rods per mm²</th></tr></thead>
            <tbody>
              {POINTS.map((p) => (
                <tr key={p.deg}>
                  <th scope="row">{p.deg === 0 ? "Centre" : p.deg < 0 ? "Temporal" : "Nasal"}</th>
                  <td>{Math.abs(p.mm).toFixed(2)}</td>
                  <td>{Math.abs(p.deg).toFixed(1)}</td>
                  <td>{p.cones === null ? (p.deg > 0 && inDisc(p.deg) ? "optic disc" : "no value") : fmt(p.cones)}</td>
                  <td>{p.rods === null ? (p.deg > 0 && inDisc(p.deg) ? "optic disc" : "no value") : fmt(p.rods)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function Counts() {
  const items: { n: string; what: string; src: string }[] = [
    { n: fmt(TOTALS.peakCones), what: `cones per square millimetre at the centre of the fovea, on average across the eyes counted. Between individuals it ranged from ${TOTALS.peakConesRange}, a threefold spread in the sharpest part of human vision`, src: "Curcio et al., 1990" },
    { n: `${TOTALS.rodFreeDeg}°`, what: `the rod-free zone at the centre, ${TOTALS.rodFreeMm} mm across. Where you look hardest there are no rods at all`, src: "Curcio et al., 1990" },
    { n: "92 million", what: `rods in an average retina (${TOTALS.rodsRange}), against 4.6 million cones (${TOTALS.conesRange}). Twenty rods for every cone, and almost none of them where you are looking`, src: "Curcio et al., 1990" },
    { n: `${BLIND_SPOT.centreDeg}°`, what: `from where you are looking, the centre of the blind spot, and ${BLIND_SPOT.belowDeg}° below it, give or take ${BLIND_SPOT.sdDeg}° between people`, src: "Rohrschneider, 2004" },
    { n: `${DISC.widthDeg.toFixed(1)}° × ${DISC.heightDeg.toFixed(0)}°`, what: `of visual field with nothing in it, in every eye: the average optic disc, ${DISC.widthMm} mm across and ${DISC.heightMm} mm tall`, src: "Jonas, Gusek and Naumann, 1988" },
  ];
  return (
    <>
      <h2 className="section-eyebrow rt-h">Counted</h2>
      <ul className="rt-counts">
        {items.map((c) => <li key={c.n}><b>{c.n}</b><span>{c.what}. <em>{c.src}</em></span></li>)}
      </ul>
      <h2 className="section-eyebrow rt-h">Why you never see the hole</h2>
      <div className="rt-prose">
        <p>With both eyes open, each eye&rsquo;s blind spot falls on a part of the scene the other eye can see. Your eyes are also never still for long, so nothing stays in the gap. But even with one eye closed and held steady, as in the card above, you do not see a hole. You see whatever surrounds it: the blank card, the line carried straight across, the stripes continued. This is perceptual filling-in, and recordings show that neurons in early visual cortex take part in it (Komatsu, 2006).</p>
        <p>What that means is still argued over. Dennett (1991) said the brain simply ignores an absence it has no reason to notice; Pessoa, Thompson and No&euml; (1998) reviewed evidence that some completion is active, with neural signals that spread into the missing region. Either way, the picture you experience as even and complete is not what the retina sends. It is sharp only in a pit a few degrees across, coarse and almost all rods towards the edge, with a hole in each eye, and it reaches you finished.</p>
      </div>
    </>
  );
}

function Knob<T extends string>({ label, value, options, fmt, onChange }: { label: string; value: T; options: readonly T[]; fmt: (v: T) => string; onChange: (v: T) => void }) {
  return (
    <div className="kp-knob" role="group" aria-label={label}>
      <span className="kp-knob-label">{label}</span>
      <div className="kp-knob-opts">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={o === value} onClick={() => onChange(o)}>{fmt(o)}</button>
        ))}
      </div>
    </div>
  );
}
