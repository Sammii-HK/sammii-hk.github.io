"use client";
import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import type { Lens } from "../../../common/data/projects";
import { environmentVars } from "./environment-formula";

/**
 * The environmental system: pointer, scroll and time, lerped and written to
 * CSS custom properties on the root element every animation frame.
 *
 * Nothing here is React state. Frame-frequency values live in refs and reach
 * the DOM through `style.setProperty`, so pointer movement never re-renders
 * the tree. Consumers read `--env-*` in CSS.
 *
 *   continuous environment → CSS custom properties (--env-x, --env-c1 …)
 *   discrete editorial state → data attributes (data-lens), React state
 *
 * `lens` is inert in Phase 2B: it is stamped as `data-lens` for later
 * lens-specific styling and nothing reads it yet.
 */

type EnvironmentContextValue = {
  root: RefObject<HTMLDivElement | null>;
};

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export function useEnvironment(): EnvironmentContextValue {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) throw new Error("useEnvironment must be used inside <EnvironmentProvider>");
  return ctx;
}

// Same smoothing as before: 0.2 per frame toward the target.
const LERP = 0.2;
const lerp = (current: number, target: number, factor: number) => current + (target - current) * factor;

export function EnvironmentProvider({
  children,
  className,
  lens = "design",
  scrollSelector = "#project-grid-scroll",
}: {
  children: ReactNode;
  className?: string;
  lens?: Lens;
  /** The element whose scroll drives the wave. Falls back to the document scroller once the page scrolls normally (Phase 2C). */
  scrollSelector?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const isScrolling = useRef(false);
  const lastScrollTime = useRef(0);

  // ── frame loop: lerp, compute, write ──────────────────────────────────
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    const tick = () => {
      currentX.current = lerp(currentX.current, targetX.current, LERP);
      currentY.current = lerp(currentY.current, targetY.current, LERP);
      const vars = environmentVars(currentX.current, currentY.current, performance.now() / 1000);
      for (const k in vars) root.style.setProperty(k, vars[k as keyof typeof vars]);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── pointer / touch → targets (unchanged rules, incl. the scroll guard) ──
  const updateTargets = (clientX: number, clientY: number) => {
    const viewportWidth = window.innerWidth;
    const timeSinceScroll = Date.now() - lastScrollTime.current;
    if (!isScrolling.current && timeSinceScroll > 500) {
      targetY.current = (clientY / window.innerHeight) * 100;
      targetX.current = ((clientX * 2) / viewportWidth) * 100;
    }
    if (!isScrolling.current || timeSinceScroll < 100) {
      targetX.current = ((clientX * 2) / viewportWidth) * 100;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => updateTargets(e.clientX, e.clientY);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) updateTargets(e.touches[0].clientX, e.touches[0].clientY);
  };

  // ── scroll wave: while the grid scrolls, Y and X follow sine waves of scroll % ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let attached: HTMLElement | null = null;
    let raf: number | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const findScrollable = (): HTMLElement | null => {
      const el = root.querySelector(scrollSelector) as HTMLElement | null;
      if (!el) return null;
      const style = getComputedStyle(el);
      const scrolls = ["auto", "scroll"].includes(style.overflow) || ["auto", "scroll"].includes(style.overflowY);
      return scrolls && el.scrollHeight > el.clientHeight ? el : null;
    };

    const handleScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        isScrolling.current = true;
        lastScrollTime.current = Date.now();
        const el = attached || findScrollable();
        if (el) {
          const maxScroll = el.scrollHeight - el.clientHeight;
          if (maxScroll > 0) {
            const scrollPercent = (el.scrollTop / maxScroll) * 100;
            const wave1 = Math.sin((scrollPercent / 100) * Math.PI * 6) * 50 + 50;
            const wave2 = Math.cos((scrollPercent / 100) * Math.PI * 4) * 30;
            targetY.current = Math.max(0, Math.min(100, wave1 + wave2));
            targetX.current = Math.sin((scrollPercent / 100) * Math.PI * 2) * 25 + 50;
          } else {
            targetY.current = 0;
          }
        }
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => { isScrolling.current = false; }, 500);
      });
    };

    const attach = () => {
      const el = findScrollable();
      if (el && el !== attached) {
        attached?.removeEventListener("scroll", handleScroll);
        attached = el;
        el.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
      }
    };
    const tryAttach = () => {
      attach();
      if (!attached) retry = setTimeout(tryAttach, 200);
    };
    retry = setTimeout(tryAttach, 100);
    const observer = new MutationObserver(() => { if (!attached) tryAttach(); });
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (retry) clearTimeout(retry);
      observer.disconnect();
      attached?.removeEventListener("scroll", handleScroll);
    };
  }, [scrollSelector]);

  return (
    <EnvironmentContext.Provider value={{ root: rootRef }}>
      <div
        ref={rootRef}
        data-env=""
        data-lens={lens}
        className={className}
        onPointerMove={handlePointerMove}
        onTouchMove={handleTouchMove}
      >
        {children}
      </div>
    </EnvironmentContext.Provider>
  );
}
