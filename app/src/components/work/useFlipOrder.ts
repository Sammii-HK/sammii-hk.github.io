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
  const prevRects = useRef<Map<string, DOMRect> | null>(null);
  const prevKey = useRef(orderKey);

  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-flip]"));
    const now = new Map(els.map((el) => [el.dataset.flip!, el.getBoundingClientRect()]));
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
        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.willChange = "transform";
        requestAnimationFrame(() => {
          el.style.transition = "transform 520ms cubic-bezier(0.2, 0.7, 0.2, 1)";
          el.style.transform = "";
          const done = () => { el.style.transition = ""; el.style.willChange = ""; el.removeEventListener("transitionend", done); };
          el.addEventListener("transitionend", done);
        });
      }
    }
    prevKey.current = orderKey;
    prevRects.current = now;
  });
}
