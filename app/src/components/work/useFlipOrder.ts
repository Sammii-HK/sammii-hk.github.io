"use client";
import { useLayoutEffect, useRef, type RefObject } from "react";

/**
 * FLIP for the Selected Work list. Every project wrapper carries
 * data-flip="<id>". After each commit we measure; when the order key changes
 * and the element existed before, it is offset back to its old position and
 * released, so a project visibly travels to its new editorial slot. New
 * arrivals are marked data-enter for a CSS fade. Nothing is React state.
 * Skipped entirely under prefers-reduced-motion.
 */
export function useFlipOrder(container: RefObject<HTMLElement | null>, orderKey: string) {
  const prevRects = useRef<Map<string, { left: number; top: number }> | null>(null);
  const prevKey = useRef(orderKey);

  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;
    // nothing to do while the order is unchanged (hover previews re-render the parent)
    if (prevKey.current === orderKey && prevRects.current) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-flip]"));
    // Document coordinates, not viewport: the resting positions are measured at
    // load and the user may have scrolled a long way before switching lens.
    const measure = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return { left: r.left + window.scrollX, top: r.top + window.scrollY }; };
    const now = new Map(els.map((el) => [el.dataset.flip!, measure(el)]));
    const changed = prevKey.current !== orderKey;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (changed && prevRects.current && !reduced) {
      for (const el of els) {
        const id = el.dataset.flip!;
        const before = prevRects.current.get(id);
        const after = now.get(id)!;
        // content swapped (chapter ↔ reference): fade the new content in
        el.setAttribute("data-swap", "");
        el.addEventListener("animationend", () => el.removeAttribute("data-swap"), { once: true });
        if (!before) {
          el.setAttribute("data-enter", "");
          el.addEventListener("animationend", () => el.removeAttribute("data-enter"), { once: true });
          continue;
        }
        const dx = before.left - after.left;
        const dy = before.top - after.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
        // FLIP: put the element back where it was, force that frame to be laid
        // out, then let the transition carry it to its new slot. Without the
        // forced layout the browser can collapse both writes into one and the
        // element jumps instead of travelling.
        el.style.transition = "none";
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
        void el.offsetWidth;
        el.style.transition = "transform 520ms cubic-bezier(0.2, 0.7, 0.2, 1)";
        el.style.transform = "translate3d(0, 0, 0)";
        const done = (ev: TransitionEvent) => {
          if (ev.target !== el) return;
          el.style.transition = ""; el.style.transform = "";
          el.removeEventListener("transitionend", done);
        };
        el.addEventListener("transitionend", done);
      }
    }
    prevKey.current = orderKey;
    prevRects.current = now;
  });

  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;
    let t: number | null = null;
    const remeasure = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => {
        const els = Array.from(root.querySelectorAll<HTMLElement>("[data-flip]"));
        prevRects.current = new Map(els.map((el) => { const r = el.getBoundingClientRect(); return [el.dataset.flip!, { left: r.left + window.scrollX, top: r.top + window.scrollY }]; }));
      }, 150);
    };
    window.addEventListener("resize", remeasure);
    return () => { window.removeEventListener("resize", remeasure); if (t) window.clearTimeout(t); };
  }, [container]);
}
