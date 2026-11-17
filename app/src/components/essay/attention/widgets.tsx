"use client";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { subscribeAttention, type AttentionKind } from "./attention";
import { motionTime, reducedMotionNow, useReducedMotion } from "./reduced-motion";
import { pastelColour } from "./colour";

const rgb = (c: { r: number; g: number; b: number }, a = 1) => `rgb(${c.r} ${c.g} ${c.b} / ${a})`;

/** Shared frame for every widget: a bordered stage plus a caption. */
function Widget({ label, caption, children }: { label: string; caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="essay-widget" aria-label={label}>
      <div className="essay-widget-stage">{children}</div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------------ */
/* 1. Attention field                                                        */
/* ------------------------------------------------------------------------ */

const TILES = ["Inbox", "Today", "Notes", "Search", "Files", "People", "Photos", "Music", "Settings"];
const KIND_TEXT: Record<AttentionKind, string> = {
  mouse: "cursor",
  touch: "finger",
  keyboard: "keyboard focus",
  none: "nothing yet",
};

/**
 * Nine tiles that glow by distance from the attention point. The point comes
 * from one shared source, so the same code serves mouse, touch and keyboard.
 */
export function AttentionField() {
  const boxRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [kind, setKind] = useState<AttentionKind>("none");

  useEffect(() => {
    let x = -1e5;
    let y = -1e5;
    const glow = TILES.map(() => 0);
    const unsubscribe = subscribeAttention((a) => {
      x = a.x;
      y = a.y;
      setKind(a.kind);
    });
    let raf = 0;
    const tick = () => {
      const box = boxRef.current?.getBoundingClientRect();
      tileRefs.current.forEach((el, i) => {
        if (!el || !box) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(x - cx, y - cy);
        const target = Math.max(0, 1 - d / 180);
        // Ease the glow in and out; under reduced motion, jump straight there.
        glow[i] = reducedMotionNow() ? target : glow[i] + (target - glow[i]) * 0.18;
        const c = pastelColour(((cx - box.left) / box.width) * 100, ((cy - box.top) / box.height) * 100, motionTime());
        const g = glow[i];
        el.style.borderColor = g > 0.02 ? rgb(c, 0.25 + g * 0.6) : "";
        el.style.boxShadow = g > 0.02 ? `0 0 ${24 * g}px ${rgb(c, g * 0.55)}, inset 0 0 0 1px ${rgb(c, g * 0.35)}` : "";
        el.style.backgroundColor = g > 0.02 ? rgb(c, g * 0.14) : "";
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <Widget
      label="Attention field"
      caption={
        <>
          Move a mouse over it, tap it, or click into it and press Tab. Responding to:{" "}
          <strong aria-live="polite">{KIND_TEXT[kind]}</strong>.
        </>
      }
    >
      <div ref={boxRef} className="essay-tiles">
        {TILES.map((t, i) => (
          <button
            key={t}
            type="button"
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
            className="essay-tile"
          >
            {t}
          </button>
        ))}
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------------ */
/* 2. Spring lab                                                             */
/* ------------------------------------------------------------------------ */

/** Prism's discrete spring: per frame, v += (target − x)·k, v *= damping, x += v. */
const simulate = (k: number, damping: number, frames = 90) => {
  let x = 0;
  let v = 0;
  const out: number[] = [];
  for (let i = 0; i < frames; i++) {
    v += (1 - x) * k;
    v *= damping;
    x += v;
    out.push(x);
  }
  return out;
};

const settleFrame = (path: number[]) => {
  for (let i = path.length - 1; i >= 0; i--) if (Math.abs(path[i] - 1) > 0.01) return i + 1;
  return 0;
};

/**
 * Two pucks make the same move: one on a spring you can tune, one on a CSS
 * ease. The plot shows the spring's response for the current settings.
 */
export function SpringLab() {
  const id = useId();
  const [k, setK] = useState(0.12);
  const [damping, setDamping] = useState(0.74);
  const [side, setSide] = useState(0);
  const springRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const state = useRef({ x: 0, v: 0 });
  const params = useRef({ k, damping });
  params.current = { k, damping };

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const s = state.current;
      if (reducedMotionNow()) {
        s.x = side;
        s.v = 0;
      } else {
        s.v += (side - s.x) * params.current.k;
        s.v *= params.current.damping;
        s.x += s.v;
      }
      if (springRef.current) springRef.current.style.setProperty("--x", String(s.x));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [side]);

  const path = useMemo(() => simulate(k, damping), [k, damping]);
  const peak = Math.max(...path);
  const overshoot = Math.max(0, (peak - 1) * 100);
  const settleMs = Math.round((settleFrame(path) / 60) * 1000);
  const d = path.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (path.length - 1)) * 300} ${100 - p * 70}`).join("");

  return (
    <Widget
      label="Spring lab"
      caption="Drag the sliders, then press Move. The top puck is a spring; the bottom one is a CSS ease, which arrives but never overshoots or settles."
    >
      <div className="essay-spring">
        <div className="essay-track" aria-hidden="true">
          <div ref={springRef} className="essay-puck essay-puck-spring" />
        </div>
        <div className="essay-track" aria-hidden="true">
          <div
            className="essay-puck"
            style={{ ["--x" as string]: String(side), transition: reduced ? "none" : "transform 420ms ease" }}
          />
        </div>
        <div className="essay-spring-controls">
          <button type="button" className="essay-button" onClick={() => setSide((s) => (s ? 0 : 1))}>
            Move
          </button>
          <label htmlFor={`${id}-k`}>
            Stiffness <output>{k.toFixed(2)}</output>
          </label>
          <input id={`${id}-k`} type="range" min={0.02} max={0.3} step={0.01} value={k} onChange={(e) => setK(Number(e.target.value))} />
          <label htmlFor={`${id}-d`}>
            Damping <output>{damping.toFixed(2)}</output>
          </label>
          <input id={`${id}-d`} type="range" min={0.5} max={0.95} step={0.01} value={damping} onChange={(e) => setDamping(Number(e.target.value))} />
        </div>
        <svg viewBox="0 0 300 110" className="essay-plot" role="img" aria-label={`Spring response: ${overshoot.toFixed(1)}% overshoot, settles in about ${settleMs} milliseconds`}>
          <line x1="0" y1="30" x2="300" y2="30" className="essay-plot-target" />
          <path d={d} className="essay-plot-line" />
        </svg>
        <p className="essay-readout">
          Overshoot <strong>{overshoot.toFixed(1)}%</strong> · settles in about <strong>{settleMs} ms</strong>
        </p>
        {reduced && <p className="essay-note">Reduced motion is on, so both pucks jump straight to the end.</p>}
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------------ */
/* 3. Precision test                                                         */
/* ------------------------------------------------------------------------ */

const TARGET = 42;

/** A slider whose committed value is either the input itself or a spring chasing it. */
function TestSlider({ label, springy }: { label: string; springy: boolean }) {
  const id = useId();
  const [raw, setRaw] = useState(10);
  const [landed, setLanded] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const spring = useRef({ x: 10, v: 0 });
  const rawRef = useRef(raw);
  rawRef.current = raw;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const s = spring.current;
      if (!springy || reducedMotionNow()) {
        s.x = rawRef.current;
        s.v = 0;
      } else {
        s.v += (rawRef.current - s.x) * 0.06;
        s.v *= 0.86;
        s.x += s.v;
      }
      if (thumbRef.current) thumbRef.current.style.left = `${s.x}%`;
      if (valueRef.current) valueRef.current.textContent = String(Math.round(s.x));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [springy]);

  // The value you get is wherever the thumb is when you let go.
  const commit = () => {
    setLanded(Math.round(spring.current.x));
    setAttempts((a) => a + 1);
  };

  return (
    <div className="essay-test">
      <div className="essay-test-head">
        <label htmlFor={id}>{label}</label>
        <span className="essay-test-value">
          <span ref={valueRef}>{raw}</span>
        </span>
      </div>
      <div className="essay-test-track">
        <span className="essay-test-target" style={{ left: `${TARGET}%` }} aria-hidden="true" />
        <span ref={thumbRef} className="essay-test-thumb" aria-hidden="true" />
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={raw}
          onChange={(e) => setRaw(Number(e.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
          aria-valuetext={`${raw}`}
        />
      </div>
      <p className="essay-test-result" aria-live="polite">
        {landed === null ? "Not tried yet" : landed === TARGET ? `Landed on ${landed}. Got it in ${attempts}.` : `Landed on ${landed} (attempt ${attempts})`}
      </p>
    </div>
  );
}

export function PrecisionTest() {
  return (
    <Widget
      label="Precision test"
      caption="Set each slider to exactly 42, marked on the track. The value is wherever the thumb is when you let go."
    >
      <div className="essay-tests">
        <TestSlider label="On a spring" springy />
        <TestSlider label="Direct" springy={false} />
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------------ */
/* 4. Reduced motion                                                         */
/* ------------------------------------------------------------------------ */

/**
 * A toggle, a pulse and a glow, with a switch to simulate reduced motion.
 * Reduced means still, not broken: the toggle still toggles and the colour
 * still follows you, but nothing springs, pulses or drifts.
 */
export function ReducedMotionDemo() {
  const id = useId();
  const system = useReducedMotion();
  const [simulated, setSimulated] = useState(false);
  const reduced = system || simulated;
  const [on, setOn] = useState(true);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const onRef = useRef(on);
  onRef.current = on;

  useEffect(() => {
    let px = -1e5;
    let py = -1e5;
    const unsubscribe = subscribeAttention((a) => {
      if (a.kind === "none") return;
      px = a.x;
      py = a.y;
    });
    const s = { x: on ? 1 : 0, v: 0 };
    let raf = 0;
    const tick = () => {
      const r = reducedRef.current;
      const target = onRef.current ? 1 : 0;
      if (r) {
        s.x = target;
        s.v = 0;
      } else {
        s.v += (target - s.x) * 0.16;
        s.v *= 0.72;
        s.x += s.v;
      }
      if (thumbRef.current) thumbRef.current.style.transform = `translateX(${s.x * 20}px)`;
      const t = r ? 0 : performance.now() / 1000;
      if (dotRef.current) {
        const pulse = r ? 0 : (Math.sin(t * 2.4) + 1) / 2;
        dotRef.current.style.boxShadow = `0 0 0 ${pulse * 7}px rgb(47 158 107 / ${0.35 * (1 - pulse)})`;
      }
      const box = cardRef.current?.getBoundingClientRect();
      if (box && cardRef.current) {
        const c = pastelColour(((px - box.left) / box.width) * 100, ((py - box.top) / box.height) * 100, t);
        cardRef.current.style.borderColor = rgb(c, 0.7);
        cardRef.current.style.boxShadow = `0 0 28px ${rgb(c, 0.25)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
    };
    // The loop reads live values through refs; it only needs to start once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Widget
      label="Reduced motion"
      caption={
        system
          ? "Your system already asks for reduced motion, so this is what you see everywhere on the site."
          : "Switch on reduced motion and keep using it. Everything still works and still answers to you; it just stops moving on its own."
      }
    >
      <div className="essay-reduced">
        <label className="essay-check" htmlFor={`${id}-sim`}>
          <input id={`${id}-sim`} type="checkbox" checked={reduced} disabled={system} onChange={(e) => setSimulated(e.target.checked)} />
          Reduced motion
        </label>
        <div ref={cardRef} className="essay-reduced-card">
          <span ref={dotRef} className="essay-dot" aria-hidden="true" />
          <span className="essay-reduced-label" id={`${id}-n`}>
            Notifications
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-labelledby={`${id}-n`}
            className="essay-switch"
            data-on={on}
            onClick={() => setOn((v) => !v)}
          >
            <span ref={thumbRef} className="essay-switch-thumb" />
          </button>
        </div>
      </div>
    </Widget>
  );
}
