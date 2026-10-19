"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CAUSES, RAIL_BROWSER_MS, RAIL_WORK_MS, REFRESH, SCENARIOS, STAGES, framesMissed, type StageId } from "../../../labs/charts/frame-budget/data";
import { chartHref } from "../../../labs/charts/registry";

/**
 * The frame budget, felt and then drawn. FrameMeter is real work: a ball
 * moved from requestAnimationFrame, with a busy loop of the length you pick
 * added to every frame, and every frame interval measured with the rAF
 * timestamp. FrameAnatomy then lays one frame's stages end to end against
 * the 16.7 ms and 8.3 ms deadlines.
 */
function block(ms: number) { const end = performance.now() + ms; let x = 0; while (performance.now() < end) x += Math.sqrt(x + 1); return x; }
const median = (xs: number[]) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const WINDOW = 90;

export function FrameMeter() {
  const [work, setWork] = useState(0);
  const [running, setRunning] = useState(true);
  const [snap, setSnap] = useState<{ gaps: number[]; refresh: number }>({ gaps: [], refresh: 0 });
  const workRef = useRef(0); workRef.current = work;
  const ball = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = root.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el); return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running || !visible) return;
    let raf = 0, last = 0, t0 = 0, refresh = 0;
    const gaps: number[] = [], idle: number[] = [];
    const step = (t: number) => {
      if (!t0) t0 = t;
      if (last) {
        const dt = t - last; gaps.push(dt); if (gaps.length > WINDOW) gaps.shift();
        // the refresh interval is measured only while no work is being added, so dropped frames cannot inflate it
        if (workRef.current === 0) { idle.push(dt); if (idle.length > 120) idle.shift(); if (idle.length >= 20) refresh = median(idle); }
      }
      last = t;
      const el = ball.current; if (el) el.style.transform = `translateX(${(((t - t0) / 2400) % 1) * 100}%)`;
      if (workRef.current > 0) block(workRef.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const id = window.setInterval(() => setSnap({ gaps: [...gaps], refresh }), 250);
    return () => { cancelAnimationFrame(raf); window.clearInterval(id); };
  }, [running, visible]);

  const { gaps, refresh } = snap;
  const hz = refresh ? 1000 / refresh : 0;
  const recent = gaps.slice(-60);
  const delivered = recent.length ? 1000 / (recent.reduce((a, b) => a + b, 0) / recent.length) : 0;
  const dropped = refresh ? recent.filter((g) => g > refresh * 1.5).length : 0;
  const scaleMax = Math.max(50, ...gaps.map((g) => Math.min(g, 120)));
  const hPc = (ms: number) => `${(Math.min(ms, scaleMax) / scaleMax) * 100}%`;

  return (
    <div className="fb-meter" ref={root}>
      <div className="fb-meter-head">
        <label className="cst-year">
          <span className="cst-year-label">Work added per frame</span>
          <input type="range" min={0} max={40} step={1} value={work} onChange={(e) => setWork(Number(e.target.value))} aria-valuetext={`${work} milliseconds`} />
          <output className="cst-year-value">{work} ms</output>
        </label>
        <div className="fb-presets" role="group" aria-label="Presets">
          {[0, 6, 12, 20, 34].map((v) => <button key={v} type="button" aria-pressed={work === v} onClick={() => setWork(v)}>{v} ms</button>)}
          <button type="button" className="fb-pause" onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Run"}</button>
        </div>
      </div>
      <div className="fb-lane" aria-hidden="true"><span className="fb-track"><span ref={ball} className="fb-ball" /></span></div>
      <p className="fb-read" aria-live="polite">
        {refresh ? <>Your display: <strong>{hz.toFixed(0)} Hz</strong>, a frame every <strong>{refresh.toFixed(1)} ms</strong>. </> : <>Measuring your display… </>}
        {recent.length > 10 && <>Delivering <strong>{delivered.toFixed(0)} frames a second</strong>{refresh ? <>, {dropped} of the last {recent.length} frames late</> : null}.</>}
      </p>
      <div className="fb-bars" role="img" aria-label={`The last ${gaps.length} frame intervals, measured. Lines at 8.3 and 16.7 milliseconds.`}>
        {gaps.map((g, i) => <i key={i} className={refresh && g > refresh * 1.5 ? "is-late" : ""} style={{ height: hPc(g) }} />)}
        {REFRESH.map((r) => <span key={r.hz} className="fb-budget" style={{ bottom: hPc(r.ms) }}><em>{r.ms.toFixed(1)} ms · {r.hz} Hz</em></span>)}
      </div>
      <p className="fb-note">Each bar is the time between two frames, measured with the timestamp <code>requestAnimationFrame</code> passes in; the newest is on the right. The ball is moved from JavaScript, one frame at a time, so it stutters exactly when a bar jumps. Add work and watch the bars leave the line: past your frame interval every frame takes two, then three. If you have a 120 Hz screen, frames start arriving late at about 8 ms of work, half what a 60 Hz screen tolerates.</p>
    </div>
  );
}

export function FrameAnatomy() {
  const [pick, setPick] = useState("typing");
  const [stage, setStage] = useState<StageId | null>(null);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("focus"); if (f && SCENARIOS.some((s) => s.id === f)) setPick(f); }, []);
  const sc = SCENARIOS.find((s) => s.id === pick)!;
  const total = STAGES.reduce((a, s) => a + sc.ms[s.id], 0);
  const scale = Math.max(total, REFRESH[0].ms) * 1.08;
  const pc = (ms: number) => `${(ms / scale) * 100}%`;
  const st = STAGES.find((s) => s.id === stage);
  // labels go inside a segment only when they fit at the width the rows are drawn
  const rows = useRef<HTMLDivElement>(null);
  const [px, setPx] = useState(900);
  useLayoutEffect(() => {
    const el = rows.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setPx(e.contentRect.width));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const fits = (ms: number, label: string) => (ms / scale) * px >= label.length * 6.5 + 8;

  return (
    <div className="fb-anat">
      <div className="fb-presets" role="group" aria-label="A frame">
        {SCENARIOS.map((s) => <button key={s.id} type="button" aria-pressed={pick === s.id} onClick={() => setPick(s.id)}>{s.name}</button>)}
      </div>
      <p className="fb-total"><strong>{total.toFixed(1)} ms</strong> of work in this frame. {sc.what}</p>
      <div className="fb-rows" ref={rows}>
        {REFRESH.map((r) => {
          const missed = framesMissed(total, r.ms);
          return (
            <div key={r.hz} className="fb-row">
              <p className="fb-row-head"><b>{r.hz} Hz</b> · {r.ms.toFixed(1)} ms per frame · <span className={missed ? "fb-miss" : "fb-fit"}>{missed ? `misses by ${(total - r.ms).toFixed(1)} ms, ready after ${missed + 1} refreshes: ${missed} frame${missed > 1 ? "s" : ""} dropped` : `fits, ${(r.ms - total).toFixed(1)} ms to spare`}</span></p>
              <div className="fb-frame" role="img" aria-label={`${r.hz} hertz: ${r.ms.toFixed(1)} millisecond budget against ${total.toFixed(1)} milliseconds of work`}>
                <span className="fb-window" style={{ width: pc(r.ms) }} />
                {Array.from({ length: Math.floor(scale / r.ms) }, (_, k) => <span key={k} className="fb-vsync" style={{ left: pc((k + 1) * r.ms) }} />)}
                {r.hz === 60 && <span className="fb-rail" style={{ left: pc(RAIL_WORK_MS) }} title={`RAIL: aim for ${RAIL_WORK_MS} ms of your own work`} />}
                <div className="fb-stack">
                  {STAGES.filter((s) => sc.ms[s.id] > 0).map((s) => (
                    <button key={s.id} type="button" className={`fb-seg fb-seg--${s.id}${stage === s.id ? " is-on" : ""}`} style={{ width: pc(sc.ms[s.id]) }} onClick={() => setStage(stage === s.id ? null : s.id)} onMouseEnter={() => setStage(s.id)} title={`${s.name}: ${sc.ms[s.id]} ms`} aria-label={`${s.name}, ${sc.ms[s.id]} milliseconds`}>
                      <span>{fits(sc.ms[s.id], s.name) ? s.name : ""}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ul className="fb-key" aria-label="Stages">
        {STAGES.map((s) => <li key={s.id}><button type="button" className={stage === s.id ? "is-on" : ""} onClick={() => setStage(stage === s.id ? null : s.id)}><i className={`fb-seg--${s.id}`} />{s.name} <b>{sc.ms[s.id]} ms</b></button></li>)}
      </ul>
      <div className="fb-panel" aria-live="polite">
        {st ? (
          <>
            <p className="cst-panel-kicker">{st.thread}</p>
            <h2 className="cst-panel-title">{st.name} · {sc.ms[st.id]} ms here</h2>
            <p className="cst-panel-what">{st.what}</p>
          </>
        ) : (
          <>
            <h2 className="cst-panel-title">Pick a stage</h2>
            <p className="cst-panel-what">The bar is one frame&rsquo;s work, the shaded box is the time a frame has, and the ticks are the screen refreshing. The dashed line in the 60 Hz row is web.dev&rsquo;s 10 ms: of a 16.7 ms frame, the browser needs about {RAIL_BROWSER_MS} for itself, so they tell you to keep yours to {RAIL_WORK_MS}. {sc.source ? `${sc.source}.` : "Stage costs are illustrative; the meter above measures yours."}</p>
          </>
        )}
      </div>
    </div>
  );
}

export function JankCauses() {
  return (
    <ol className="fb-causes">
      {CAUSES.map((c) => (
        <li key={c.id}>
          <h3>{c.name}</h3>
          <p>{c.what}</p>
          <p className="fb-cause-src">{c.source}{c.chart && <> · the chart: <a href={chartHref(c.chart.slug)}>{c.chart.title}</a></>}</p>
        </li>
      ))}
    </ol>
  );
}
