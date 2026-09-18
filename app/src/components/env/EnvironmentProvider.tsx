"use client";
import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import type { Lens } from "../../../common/data/projects";
import { environmentVars } from "./environment-formula";
import { LENS_ENVIRONMENT } from "./lens-environment";

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
 * `lens` (the COMMITTED lens, never the preview) is stamped as `data-lens`
 * and, since Phase 2F, selects the behaviour parameters in lens-environment.ts:
 * how the pointer is followed, how the blobs wander, whether they lean toward
 * the pointer, whether they rest on a lattice. The colour formula is the same
 * for every lens.
 *
 * Reduced motion (Phase 2F): the time drift is frozen, the scroll wave is off,
 * and the pointer response is immediate rather than eased, so colour still
 * answers the pointer without choreography.
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

const lerp = (current: number, target: number, factor: number) => current + (target - current) * factor;

export function EnvironmentProvider({
  children,
  className,
  lens = "design",
  scrollSelector = "document",
}: {
  children: ReactNode;
  className?: string;
  lens?: Lens;
  /**
   * What drives the scroll wave. "document" (default since Phase 2C) listens to
   * window scroll and reads the document scroller; a CSS selector targets an
   * internal scroll container (the pre-2C layout).
   */
  scrollSelector?: "document" | string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const isScrolling = useRef(false);
  const lastScrollTime = useRef(0);
  const velX = useRef(0);
  const velY = useRef(0);
  const energy = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lensRef = useRef<Lens>(lens);
  lensRef.current = lens;
  const reduced = useRef(false);
  const frozenT = useRef(0);

  // ── frame loop: follow, compute, write ────────────────────────────────
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => { reduced.current = mq.matches; frozenT.current = performance.now() / 1000; };
    syncReduced();
    mq.addEventListener("change", syncReduced);

    let raf = 0;
    const tick = () => {
      const env = LENS_ENVIRONMENT[lensRef.current];
      if (reduced.current) {
        // immediate, no easing, no drift, no energy
        currentX.current = targetX.current;
        currentY.current = targetY.current;
        energy.current = 0;
      } else if (env.lerp === null && env.spring) {
        // design: a light spring, so the follow has weight and a hint of overshoot
        const { stiffness, damping } = env.spring;
        velX.current = (velX.current + (targetX.current - currentX.current) * stiffness) * damping;
        velY.current = (velY.current + (targetY.current - currentY.current) * stiffness) * damping;
        currentX.current += velX.current;
        currentY.current += velY.current;
      } else {
        currentX.current = lerp(currentX.current, targetX.current, env.lerp ?? 0.2);
        currentY.current = lerp(currentY.current, targetY.current, env.lerp ?? 0.2);
      }
      // pointer energy: how fast the pointer is moving, smoothed, 0..1
      if (!reduced.current) {
        const dx = targetX.current - lastPointer.current.x;
        const dy = targetY.current - lastPointer.current.y;
        lastPointer.current = { x: targetX.current, y: targetY.current };
        const speed = Math.min(1, Math.hypot(dx, dy) / 6);
        energy.current = lerp(energy.current, speed, speed > energy.current ? 0.35 : 0.06);
      }
      const t = reduced.current ? frozenT.current : performance.now() / 1000;
      const pointer = { px: Math.max(0, Math.min(100, currentX.current / 2)), py: Math.max(0, Math.min(100, currentY.current)), energy: energy.current };
      const vars = environmentVars(currentX.current, currentY.current, t, env.params, pointer);
      for (const k in vars) root.style.setProperty(k, vars[k as keyof typeof vars]);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); mq.removeEventListener("change", syncReduced); };
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

    const isDocument = scrollSelector === "document";

    const findScrollable = (): HTMLElement | null => {
      if (isDocument) return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
      const el = root.querySelector(scrollSelector) as HTMLElement | null;
      if (!el) return null;
      const style = getComputedStyle(el);
      const scrolls = ["auto", "scroll"].includes(style.overflow) || ["auto", "scroll"].includes(style.overflowY);
      return scrolls && el.scrollHeight > el.clientHeight ? el : null;
    };

    // The wave itself is unchanged: Y and X follow sine waves of scroll %.
    // Only the source of the scroll position moved from the grid to the document.
    const handleScroll = () => {
      if (reduced.current) return; // no scroll-driven wave under reduced motion
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

    if (isDocument) {
      // Scroll events for the document scroller fire on window, not the element.
      attached = findScrollable();
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => {
        if (raf) cancelAnimationFrame(raf);
        if (scrollTimeout) clearTimeout(scrollTimeout);
        window.removeEventListener("scroll", handleScroll);
      };
    }

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
