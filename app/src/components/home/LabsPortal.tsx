"use client";
import { useEffect, useRef } from "react";

const LABS_URL = "https://labs.sammii.dev";

/**
 * The boundary between the curated site and Labs (Phase 2F).
 *
 * One idea: the rule that closes Selected Work is a string. Near the pointer
 * it bends toward it; a tap or a click plucks it and it rings down; focusing
 * the link plucks it too. That is the whole portal: a line that stops being
 * obedient. The link is a plain anchor underneath and never depends on any
 * of it. Spring state lives in refs and a rAF loop that only runs while the
 * string is moving; reduced motion leaves the rule straight.
 */
export const LabsPortal = () => {
  const boundary = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const state = useRef({ cx: 500, cy: 80, tx: 500, ty: 80, vy: 0, raf: 0, reduced: false });

  useEffect(() => {
    const el = boundary.current;
    const p = path.current;
    if (!el || !p) return;
    const s = state.current;
    s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (s.reduced) return;

    const draw = () => p.setAttribute("d", `M0 80 Q ${s.cx.toFixed(1)} ${s.cy.toFixed(1)} 1000 80`);
    const step = () => {
      // x follows softly; y is a damped spring toward its target
      s.cx += (s.tx - s.cx) * 0.18;
      s.vy = (s.vy + (s.ty - s.cy) * 0.09) * 0.86;
      s.cy += s.vy;
      draw();
      const settled = Math.abs(s.vy) < 0.05 && Math.abs(s.ty - s.cy) < 0.2 && Math.abs(s.tx - s.cx) < 0.2;
      if (settled) { s.cx = s.tx; s.cy = s.ty; s.vy = 0; draw(); }
      s.raf = settled ? 0 : requestAnimationFrame(step);
    };
    const wake = () => { if (!s.raf) s.raf = requestAnimationFrame(step); };
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * 1000, y: ((e.clientY - r.top) / r.height) * 160 };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // touch plucks instead of bending
      const { x, y } = local(e);
      s.tx = Math.max(60, Math.min(940, x));
      s.ty = 80 + Math.max(-70, Math.min(70, (y - 80) * 1.6));
      wake();
    };
    const onLeave = () => { s.tx = 500; s.ty = 80; wake(); };
    const onDown = (e: PointerEvent) => {
      const { x, y } = local(e);
      s.tx = Math.max(60, Math.min(940, x)); s.cx = s.tx;
      s.ty = 80; s.vy = y < 80 ? -9 : 9; // pluck away from where it was hit
      wake();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    const link = el.parentElement?.querySelector<HTMLAnchorElement>(".labs-link");
    const onFocus = () => { s.tx = 500; s.cx = 500; s.ty = 80; s.vy = -7; wake(); };
    link?.addEventListener("focus", onFocus);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      link?.removeEventListener("focus", onFocus);
      if (s.raf) cancelAnimationFrame(s.raf);
    };
  }, []);

  return (
    <section id="labs" aria-labelledby="labs-heading" className="labs">
      <h2 id="labs-heading" className="labs-heading">
        Labs
      </h2>
      <p className="labs-line">Things that don&apos;t belong in case studies.</p>
      <div ref={boundary} className="labs-boundary" aria-hidden="true">
        <svg viewBox="0 0 1000 160" preserveAspectRatio="none" focusable="false">
          <path ref={path} d="M0 80 Q 500 80 1000 80" />
        </svg>
      </div>
      <p className="labs-route">
        <a className="labs-link" href={LABS_URL} rel="noopener">
          labs.sammii.dev <span aria-hidden="true">↗</span>
        </a>
        <span className="labs-status">Opening soon</span>
      </p>
    </section>
  );
};
