"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Easing versus springs, drawn from what actually happened on screen.
 * Two cards move between the same two positions: one with a CSS
 * transition (a duration and a cubic-bezier), one with a spring
 * (stiffness, damping, mass, no duration). Both positions are sampled
 * every frame (the CSS one read back from its computed transform), so
 * the graph is a recording, not a formula, and an interruption mid-flight
 * shows on it exactly as you saw it.
 */
type Preset = { id: string; name: string; k: number; c: number; m: number };
const PRESETS: Preset[] = [
  { id: "gentle", name: "Gentle", k: 120, c: 14, m: 1 },
  { id: "default", name: "Default", k: 170, c: 26, m: 1 },
  { id: "snappy", name: "Snappy", k: 400, c: 30, m: 1 },
  { id: "bouncy", name: "Bouncy", k: 300, c: 10, m: 1 },
  { id: "wobbly", name: "Wobbly", k: 180, c: 6, m: 1 },
  { id: "heavy", name: "Heavy", k: 200, c: 30, m: 3 },
];
const EASINGS: { id: string; name: string; bez: [number, number, number, number] }[] = [
  { id: "ease", name: "ease", bez: [0.25, 0.1, 0.25, 1] },
  { id: "ease-out", name: "ease-out", bez: [0, 0, 0.58, 1] },
  { id: "ease-in-out", name: "ease-in-out", bez: [0.42, 0, 0.58, 1] },
  { id: "material", name: "standard (Material)", bez: [0.2, 0, 0, 1] },
  { id: "overshoot", name: "back (overshoot)", bez: [0.34, 1.56, 0.64, 1] },
];
const TRAVEL = 1; // normalised: 0 = left, 1 = right
const WINDOW = 2400; // ms of history shown

/** Settle time and overshoot from the closed-form-ish simulation of the spring from rest at 0 to 1. */
function simulate(k: number, c: number, m: number) {
  let x = 0, v = 0, t = 0, over = 0; const dt = 1 / 1000;
  for (let i = 0; i < 20000; i++) {
    const a = (-k * (x - 1) - c * v) / m; v += a * dt; x += v * dt; t += dt;
    over = Math.max(over, x - 1);
    if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) break;
  }
  return { settle: t * 1000, overshoot: over, zeta: c / (2 * Math.sqrt(k * m)) };
}

export function Springs() {
  const [preset, setPreset] = useState<Preset>(PRESETS[1]);
  const [k, setK] = useState(preset.k); const [c, setC] = useState(preset.c); const [m, setM] = useState(preset.m);
  const [easing, setEasing] = useState(EASINGS[0]); const [dur, setDur] = useState(400);
  const [target, setTarget] = useState(0);
  const [, tick] = useState(0);
  const spring = useRef({ x: 0, v: 0 });
  const cssEl = useRef<HTMLDivElement>(null); const springEl = useRef<HTMLDivElement>(null); const trackW = useRef(1);
  const hist = useRef<{ t: number; css: number; spr: number; target: number }[]>([]);
  const targetRef = useRef(0); targetRef.current = target;
  const params = useRef({ k, c, m }); params.current = { k, c, m };
  const stats = useMemo(() => simulate(k, c, m), [k, c, m]);

  useEffect(() => {
    let raf = 0, last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000); last = now;
      // spring: semi-implicit Euler in 1 ms substeps so stiff settings stay stable
      const s = spring.current; const { k, c, m } = params.current; const sub = Math.max(1, Math.ceil(dt / 0.001)); const h = dt / sub;
      for (let i = 0; i < sub; i++) { const a = (-k * (s.x - targetRef.current) - c * s.v) / m; s.v += a * h; s.x += s.v * h; }
      const w = trackW.current;
      if (springEl.current) springEl.current.style.transform = `translateX(${(s.x * w).toFixed(2)}px)`;
      let cssX = targetRef.current;
      if (cssEl.current) { const mtx = new DOMMatrixReadOnly(getComputedStyle(cssEl.current).transform); cssX = mtx.m41 / w; }
      const hst = hist.current; hst.push({ t: now, css: cssX, spr: s.x, target: targetRef.current });
      while (hst.length && now - hst[0].t > WINDOW) hst.shift();
      tick((n) => (n + 1) % 1e6);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => {
    const measure = () => { const track = springEl.current?.parentElement; if (track && springEl.current) trackW.current = track.clientWidth - springEl.current.offsetWidth; };
    measure(); window.addEventListener("resize", measure); return () => window.removeEventListener("resize", measure);
  }, []);

  const pick = (p: Preset) => { setPreset(p); setK(p.k); setC(p.c); setM(p.m); };
  const go = () => setTarget((t) => (t ? 0 : 1));

  // graph
  const W = 720, H = 220, PADL = 36, PADR = 12, PADT = 14, PADB = 24;
  const now = hist.current.length ? hist.current[hist.current.length - 1].t : 0;
  const xOf = (t: number) => PADL + ((t - (now - WINDOW)) / WINDOW) * (W - PADL - PADR);
  const yOf = (v: number) => PADT + (1.25 - v) / 1.5 * (H - PADT - PADB); // -0.25 .. 1.25
  const line = (key: "css" | "spr" | "target") => hist.current.map((p, i) => `${i ? "L" : "M"}${xOf(p.t).toFixed(1)} ${yOf(p[key]).toFixed(1)}`).join(" ");

  return (
    <div className="sp">
      <div className="sp-controls">
        <div className="sp-col">
          <p className="cst-year-label">Spring</p>
          <div className="bo-toggle" role="group" aria-label="Spring preset">
            {PRESETS.map((p) => <button key={p.id} type="button" aria-pressed={preset.id === p.id && k === p.k && c === p.c && m === p.m} onClick={() => pick(p)}>{p.name}</button>)}
          </div>
          <label className="cst-year"><span className="cst-year-label">Stiffness</span><input type="range" min={20} max={800} value={k} onChange={(e) => setK(Number(e.target.value))} /><output className="cst-year-value">{k}</output></label>
          <label className="cst-year"><span className="cst-year-label">Damping</span><input type="range" min={1} max={80} value={c} onChange={(e) => setC(Number(e.target.value))} /><output className="cst-year-value">{c}</output></label>
          <label className="cst-year"><span className="cst-year-label">Mass</span><input type="range" min={0.5} max={5} step={0.5} value={m} onChange={(e) => setM(Number(e.target.value))} /><output className="cst-year-value">{m}</output></label>
          <p className="sp-read">ζ = {stats.zeta.toFixed(2)} ({Math.abs(stats.zeta - 1) < 0.03 ? "critically damped, fastest with no bounce" : stats.zeta < 1 ? "underdamped, it overshoots" : "overdamped, it creeps in"}) · settles in ~{Math.round(stats.settle)} ms{stats.overshoot > 0.005 ? ` · overshoots by ${(stats.overshoot * 100).toFixed(0)}%` : ""}</p>
        </div>
        <div className="sp-col">
          <p className="cst-year-label">CSS transition</p>
          <div className="bo-toggle" role="group" aria-label="Easing">
            {EASINGS.map((e) => <button key={e.id} type="button" aria-pressed={easing.id === e.id} onClick={() => setEasing(e)}>{e.name}</button>)}
          </div>
          <label className="cst-year"><span className="cst-year-label">Duration</span><input type="range" min={100} max={1500} step={50} value={dur} onChange={(e) => setDur(Number(e.target.value))} /><output className="cst-year-value">{dur} ms</output></label>
          <p className="sp-read"><code>cubic-bezier({easing.bez.join(", ")})</code> · always {dur} ms, whatever happens</p>
        </div>
      </div>

      <div className="sp-stage">
        <button type="button" className="jd-btn" onClick={go}>Move {target ? "left" : "right"}</button>
        <p className="sp-hint">Click again before it arrives. The spring carries its velocity into the new journey; the transition starts a fresh curve from wherever it was.</p>
        <div className="sp-lane"><span className="sp-lane-label">transition · {easing.name}</span><div className="sp-track"><div ref={cssEl} className="sp-card sp-card--css" style={{ transform: `translateX(${target * trackW.current}px)`, transition: `transform ${dur}ms cubic-bezier(${easing.bez.join(",")})` }} /></div></div>
        <div className="sp-lane"><span className="sp-lane-label">spring · {preset.name.toLowerCase()}</span><div className="sp-track"><div ref={springEl} className="sp-card" /></div></div>
      </div>

      <svg className="sp-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Position over the last 2.4 seconds for both cards">
        {[0, 1].map((v) => <g key={v} className="bo-tick"><line x1={PADL} x2={W - PADR} y1={yOf(v)} y2={yOf(v)} /><text x={PADL - 6} y={yOf(v) + 4} textAnchor="end">{v ? "right" : "left"}</text></g>)}
        <text x={W - PADR} y={H - 6} textAnchor="end" className="bo-tick">now</text>
        <text x={PADL} y={H - 6} className="bo-tick">−2.4 s</text>
        {hist.current.length > 1 && (<>
          <path className="sp-line sp-line--target" d={line("target")} />
          <path className="sp-line sp-line--css" d={line("css")} />
          <path className="sp-line sp-line--spr" d={line("spr")} />
        </>)}
      </svg>
      <p className="jd-note"><span className="sp-key sp-key--css" /> transition · <span className="sp-key sp-key--spr" /> spring · <span className="sp-key sp-key--target" /> where it was told to go. Both lines are sampled from the screen every frame, the transition&rsquo;s position read back from its computed transform.</p>
    </div>
  );
}
