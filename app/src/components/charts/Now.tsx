"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { HOPS, type Knobs } from "../../../labs/charts/keypress/data";
import { MARKS, type Mark } from "../../../labs/charts/now/data";
import { chartHref } from "../../../labs/charts/registry";

/**
 * How long "now" takes. A flash-lag demo first, because the lag is easier
 * to see than to read about; then the brain's timings and the machine's on
 * one linear millisecond axis, with the keypress pipeline computed from
 * the keypress chart's own hops; then your own reaction time, measured,
 * which carries your machine's latency inside it.
 */
type Refresh = Knobs["refreshHz"];
const REFRESH: Refresh[] = [60, 120, 144, 240];

export function Now() {
  const [refresh, setRefresh] = useState<Refresh>(60);
  const [yours, setYours] = useState<number | null>(null);
  return (
    <div className="nw">
      <h2 className="section-eyebrow nw-h">What it feels like</h2>
      <FlashLag />
      <h2 className="section-eyebrow nw-h">The timings, to scale</h2>
      <Timeline refresh={refresh} setRefresh={setRefresh} yours={yours} />
      <h2 className="section-eyebrow nw-h">Measure yours</h2>
      <Reaction onResult={setYours} />
    </div>
  );
}

/* ── flash-lag ─────────────────────────────────────────────────────────── */

const SPEEDS = { slow: 240, medium: 480, fast: 900 } as const; // CSS px per second
type Speed = keyof typeof SPEEDS;

function FlashLag() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>("medium");
  const [freeze, setFreeze] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const state = useRef({ x: 0, last: 0, w: 600, h: 150, flashAt: -1 });

  const draw = useCallback((x: number, flash: boolean) => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const { w, h } = state.current;
    const ink = getComputedStyle(c).color;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ink;
    const r = Math.max(7, Math.min(11, w / 60));
    ctx.beginPath(); ctx.arc(x, h / 2 + r * 1.6, r, 0, Math.PI * 2); ctx.fill();
    if (flash) { ctx.beginPath(); ctx.arc(x, h / 2 - r * 1.6, r, 0, Math.PI * 2); ctx.fill(); }
  }, []);

  useEffect(() => {
    const el = wrap.current, c = canvas.current; if (!el || !c) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width), h = 150, dpr = window.devicePixelRatio || 1;
      c.width = w * dpr; c.height = h * dpr; c.style.height = `${h}px`;
      c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.current.w = w; state.current.h = h;
      if (!state.current.x) state.current.x = w * 0.1;
      draw(state.current.x, frozen);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw, frozen]);

  useEffect(() => { if (new URLSearchParams(window.location.search).get("play") === "1") setPlaying(true); }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    state.current.last = 0;
    const step = (t: number) => {
      const s = state.current;
      const dt = s.last ? Math.min(50, t - s.last) / 1000 : 0;
      s.last = t;
      const lo = s.w * 0.08, hi = s.w * 0.92, mid = s.w / 2;
      const prev = s.x;
      let x = prev + SPEEDS[speed] * dt;
      if (x > hi) x = lo + (x - hi);
      s.x = x;
      // flash on the one frame in which the moving dot crosses the middle, drawn exactly above it
      const crossed = prev < mid && x >= mid;
      draw(x, crossed);
      if (crossed && freeze) { setPlaying(false); setFrozen(true); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, freeze, draw]);

  return (
    <section className="nw-demo" aria-labelledby="nw-flash-title">
      <h3 id="nw-flash-title" className="sr-only">The flash-lag effect</h3>
      <div className="nw-knobs">
        <button type="button" className="cst-btn" onClick={() => { setFrozen(false); setPlaying((p) => !p); }}>{playing ? "Pause" : frozen ? "Play again" : "Play"}</button>
        <Knob label="Speed" value={speed} options={["slow", "medium", "fast"] as const} fmt={(v) => v} onChange={(v) => { setSpeed(v); setFrozen(false); }} />
        <Knob label="On the flash" value={freeze ? "freeze" : "keep going"} options={["keep going", "freeze"] as const} fmt={(v) => v} onChange={(v) => { setFreeze(v === "freeze"); setFrozen(false); }} />
      </div>
      <div className="nw-stage" ref={wrap}>
        <canvas
          ref={canvas}
          className="nw-canvas"
          role="img"
          aria-label="A dot moves left to right along the lower track. Each time it passes the middle, a second dot flashes for a single frame directly above it. Most people see the flash trail behind the moving dot."
        />
        {frozen && <p className="nw-frozen" aria-live="polite">Frozen on the flash frame. The two were drawn in the same frame, one exactly above the other.</p>}
      </div>
      <p className="nw-steps">
        Press play and watch the space just above the moving dot. Once per pass a second dot flashes for a single frame, drawn exactly above the moving one. Most people see the flash a little behind, as if the moving dot had already travelled on, and the gap grows with speed. Switch to <em>freeze</em> and it stops on the flash frame: they were lined up. In Eagleman and Sejnowski&rsquo;s experiments, what people saw at the moment of the flash depended on what the moving object did in the 80 ms or so after it. Why the effect happens is still argued over; the notes have the main accounts.
      </p>
    </section>
  );
}

/* ── the timeline ──────────────────────────────────────────────────────── */

const KIND_LABEL: Record<Mark["kind"], string> = { machine: "Machine", brain: "Brain", behaviour: "Person" };

function Timeline({ refresh, setRefresh, yours }: { refresh: Refresh; setRefresh: (r: Refresh) => void; yours: number | null }) {
  const knobs: Knobs = { pollHz: 125, refreshHz: refresh, work: "typical", panel: "typical" };
  const keypress = HOPS.reduce((a, h) => a + h.ms(knobs), 0);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("focus"); if (f && MARKS.some((m) => m.id === f)) setOpen(f); }, []);

  const mine: Mark[] = yours === null ? [] : [{ id: "yours", kind: "behaviour", name: "Your reaction time, measured below", ms: yours, what: "The median of your tries, from the frame the panel changed to your key or tap. It contains your machine's input and display latency as well as you.", src: "Measured on this page" }];
  const rows = [...MARKS, ...mine]
    .map((m) => ({ ...m, value: m.id === "frame" ? 1000 / refresh : m.id === "keypress" ? keypress : m.ms }))
    .sort((a, b) => a.value - b.value);
  const max = Math.max(300, ...rows.map((r) => (r.hi ?? r.value) * 1.05));
  const pct = (v: number) => `${(v / max) * 100}%`;
  const sel = rows.find((r) => r.id === open);
  const ticks = Array.from({ length: Math.floor(max / 50) + 1 }, (_, i) => i * 50);

  return (
    <section className="nw-timeline" aria-label="Brain and machine timings on one millisecond axis">
      <div className="nw-knobs">
        <Knob label="Display refresh" value={refresh} options={REFRESH} fmt={(v) => `${v} Hz`} onChange={setRefresh} />
        <p className="nw-key" aria-hidden="true"><span className="nw-sw is-machine" /> machine <span className="nw-sw is-brain" /> brain <span className="nw-sw is-behaviour" /> the whole person</p>
      </div>
      <p className="nw-total">
        One frame at {refresh} Hz is <strong>{(1000 / refresh).toFixed(1)} ms</strong>. A typical keypress reaches the glass in <strong>{keypress.toFixed(0)} ms</strong> (<a href={chartHref("keypress")}>the twelve hops</a>). The brain settles what happened over at least <strong>80 ms</strong>, by Eagleman&rsquo;s estimate, and probably more.
      </p>
      <div className="nw-axis" aria-hidden="true">
        {ticks.map((t) => <span key={t} style={{ left: pct(t) }}>{t} ms</span>)}
      </div>
      <ol className="nw-rows">
        {rows.map((r) => (
          <li key={r.id} className={`nw-row is-${r.kind}${open === r.id ? " is-open" : ""}`}>
            <button type="button" className="nw-row-head" aria-pressed={open === r.id} aria-controls="nw-detail" onClick={() => setOpen(r.id)} onMouseEnter={() => setOpen(r.id)} onFocus={() => setOpen(r.id)}>
              <span className="nw-row-kind">{KIND_LABEL[r.kind]}</span>
              <span className="nw-row-name">{r.name}</span>
              <span className="nw-row-ms">{r.lo !== undefined && r.hi !== undefined ? `${r.lo} to ${r.hi} ms` : `${r.id === "keypress" ? "about " : ""}${r.value < 10 || r.id === "frame" ? r.value.toFixed(1) : r.value.toFixed(0)} ms`}</span>
            </button>
            <span className="nw-track" aria-hidden="true">
              {ticks.map((t) => <i key={t} style={{ left: pct(t) }} />)}
              {!r.rangeOnly && <span className="nw-bar" style={{ width: pct(r.value) }} />}
              {r.rangeOnly && r.lo !== undefined && r.hi !== undefined && <span className="nw-span" style={{ left: pct(r.lo), width: pct(r.hi - r.lo) }} />}
              {!r.rangeOnly && r.lo !== undefined && r.hi !== undefined && <span className="nw-range" style={{ left: pct(r.lo), width: pct(r.hi - r.lo) }} />}
            </span>
          </li>
        ))}
      </ol>
      <div id="nw-detail" className="nw-panel" aria-live="polite">
        {sel ? (
          <>
            <p className="cst-panel-kicker">{KIND_LABEL[sel.kind]} · {sel.src}</p>
            <h3 className="cst-panel-title">{sel.name}</h3>
            <p className="cst-panel-what">{sel.what}</p>
            {sel.note && <p className="cst-panel-why">{sel.note}</p>}
          </>
        ) : (
          <>
            <h3 className="cst-panel-title">Hover or tap a row</h3>
            <p className="cst-panel-what">Machine timings are exact or typical; brain timings are averages from studies with wide spreads between people, tasks and methods. The bars share one axis so the proportions are honest.</p>
          </>
        )}
      </div>
    </section>
  );
}

/* ── reaction time ─────────────────────────────────────────────────────── */

type Phase = "idle" | "waiting" | "go" | "early";

function Reaction({ onResult }: { onResult: (ms: number) => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [tries, setTries] = useState<number[]>([]);
  const pad = useRef<HTMLDivElement>(null);
  const t0 = useRef(0);
  const timer = useRef<number>(0);
  const raf = useRef(0);

  useEffect(() => () => { window.clearTimeout(timer.current); cancelAnimationFrame(raf.current); }, []);

  const start = () => {
    setPhase("waiting");
    t0.current = 0;
    timer.current = window.setTimeout(() => {
      // change the pad in a frame callback, outside React, and start the clock on that frame
      raf.current = requestAnimationFrame((ts) => {
        pad.current?.classList.add("is-go");
        t0.current = ts;
        setPhase("go");
      });
    }, 1500 + Math.random() * 2000);
  };

  const hit = (stamp: number) => {
    if (phase === "idle" || phase === "early") { start(); return; }
    if (phase === "waiting") { window.clearTimeout(timer.current); cancelAnimationFrame(raf.current); setPhase("early"); return; }
    if (phase === "go" && t0.current) {
      const ms = stamp - t0.current;
      pad.current?.classList.remove("is-go");
      const next = [...tries, ms].slice(-5);
      setTries(next);
      const sorted = [...next].sort((a, b) => a - b);
      onResult(Math.round(sorted[Math.floor(sorted.length / 2)]));
      setPhase("idle");
    }
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) hit(e.timeStamp); } };
  const median = tries.length ? [...tries].sort((a, b) => a - b)[Math.floor(tries.length / 2)] : null;
  const label = { idle: tries.length ? "Again: press space, Enter or tap" : "Start: press space, Enter or tap", waiting: "Wait for it to turn dark…", go: "Now!", early: "Too soon. Press again to retry" }[phase];

  return (
    <section className="nw-react" aria-labelledby="nw-react-title">
      <h3 id="nw-react-title" className="sr-only">Reaction time test</h3>
      <div
        ref={pad}
        role="button"
        tabIndex={0}
        className={`nw-pad is-${phase}`}
        onPointerDown={(e) => { e.preventDefault(); hit(e.timeStamp); }}
        onKeyDown={onKey}
        aria-describedby="nw-react-help"
      >
        <span>{label}</span>
      </div>
      <p id="nw-react-help" className="nw-steps">
        Press to start, then press again the moment the panel turns dark. It waits a random one and a half to three and a half seconds so you cannot anticipate it. The timer starts on the frame the change is committed, so your number includes the rest of your machine&rsquo;s display latency and its input latency, not only you. That is the point: it lands on the chart above beside the parts it is made of.
      </p>
      <p className="nw-result" aria-live="polite">
        {tries.length ? <>Tries: {tries.map((t) => `${Math.round(t)} ms`).join(", ")}. Median <strong>{Math.round(median as number)} ms</strong>{tries.length < 5 ? ` (${5 - tries.length} more for five)` : ""}.</> : "No tries yet."}
      </p>
    </section>
  );
}

function Knob<T extends string | number>({ label, value, options, fmt, onChange }: { label: string; value: T; options: readonly T[]; fmt: (v: T) => string; onChange: (v: T) => void }) {
  return (
    <div className="kp-knob" role="group" aria-label={label}>
      <span className="kp-knob-label">{label}</span>
      <div className="kp-knob-opts">
        {options.map((o) => (
          <button key={String(o)} type="button" aria-pressed={o === value} onClick={() => onChange(o)}>{fmt(o)}</button>
        ))}
      </div>
    </div>
  );
}
