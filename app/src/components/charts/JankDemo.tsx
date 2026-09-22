"use client";
import { useEffect, useRef, useState } from "react";

/**
 * The event loop as a design engineering problem: three live demos of what
 * blocking the main thread does to an interface. Real work, not simulated:
 * the button runs a synchronous loop for the chosen number of milliseconds.
 * The CSS animation keeps moving because the compositor draws it off the
 * main thread; the JavaScript one freezes; the "Loading…" label never
 * appears because paint happens after the task, not during it.
 */
function block(ms: number) { const end = performance.now() + ms; let x = 0; while (performance.now() < end) x += Math.sqrt(x + 1); return x; }

export function JankDemo() {
  const [ms, setMs] = useState(400);
  const [label, setLabel] = useState("Save");
  const [fixedLabel, setFixedLabel] = useState("Save");
  const jsBall = useRef<HTMLSpanElement>(null);
  const [dropped, setDropped] = useState<number | null>(null);
  const [frames, setFrames] = useState<number[]>([]);

  // a JavaScript-driven animation: one main-thread frame at a time
  useEffect(() => {
    let raf = 0, t0 = performance.now(), last = t0; const gaps: number[] = [];
    const step = (t: number) => {
      const el = jsBall.current; if (el) el.style.transform = `translateX(${((t - t0) / 1600 % 1) * 100}%)`;
      gaps.push(t - last); if (gaps.length > 90) gaps.shift(); last = t;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const id = window.setInterval(() => setFrames([...gaps]), 250);
    return () => { cancelAnimationFrame(raf); window.clearInterval(id); };
  }, []);

  const worst = frames.length ? Math.max(...frames) : 0;

  // the bug: set the label, then do the work in the same task. The label paints after the task.
  const naive = () => { setLabel("Saving…"); block(ms); setLabel("Saved"); setDropped(ms); setTimeout(() => { setLabel("Save"); setDropped(null); }, 1200); };
  // the fix: let the loop paint first (rAF for the frame, then a task for the work), then do the work.
  const fixed = () => { setFixedLabel("Saving…"); requestAnimationFrame(() => setTimeout(() => { block(ms); setFixedLabel("Saved"); setTimeout(() => setFixedLabel("Save"), 1200); }, 0)); };

  return (
    <div className="jd">
      <div className="jd-head">
        <label className="cst-year">
          <span className="cst-year-label">Main-thread work per click</span>
          <input type="range" min={50} max={1500} step={50} value={ms} onChange={(e) => setMs(Number(e.target.value))} aria-valuetext={`${ms} milliseconds`} />
          <output className="cst-year-value">{ms} ms</output>
        </label>
        <span className="jd-meter">longest frame gap in the last ~1.5 s: <strong>{worst.toFixed(0)} ms</strong> {worst > 34 ? "(dropped frames)" : "(smooth)"}</span>
      </div>
      <div className="jd-grid">
        <section className="jd-cell">
          <h3 className="el-box-title">1 · The label that never shows</h3>
          <button type="button" className="jd-btn" onClick={naive}>{label}</button>
          <p className="jd-note">Sets the text to &ldquo;Saving…&rdquo; then does {ms} ms of work in the same task. You never see &ldquo;Saving…&rdquo;: the browser paints after the task ends, by which time it says &ldquo;Saved&rdquo;. {dropped ? `The button just froze for ${dropped} ms.` : ""}</p>
        </section>
        <section className="jd-cell">
          <h3 className="el-box-title">2 · The fix: let it paint first</h3>
          <button type="button" className="jd-btn" onClick={fixed}>{fixedLabel}</button>
          <p className="jd-note">Same work, but after <code>requestAnimationFrame</code> then <code>setTimeout</code>, so a frame paints &ldquo;Saving…&rdquo; before the work starts. The loading state exists because the loop was given a turn.</p>
        </section>
        <section className="jd-cell jd-cell--wide">
          <h3 className="el-box-title">3 · Two animations while you click</h3>
          <div className="jd-lane"><span className="jd-lane-label">CSS transform animation</span><span className="jd-track"><span className="jd-ball jd-ball--css" /></span></div>
          <div className="jd-lane"><span className="jd-lane-label">JavaScript, one frame at a time</span><span className="jd-track"><span ref={jsBall} className="jd-ball" /></span></div>
          <p className="jd-note">Click either button above and watch: the CSS animation keeps moving, because the compositor runs it off the main thread; the JavaScript one stops dead until the task ends. Which is why <code>transform</code> and <code>opacity</code> animations survive a busy page and everything else does not.</p>
        </section>
      </div>
    </div>
  );
}
