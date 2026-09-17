"use client";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Lens } from "../../../common/data/projects";
import { DEFAULT_LENS, displayLens, lensFromSearch, urlForLens } from "../../../lib/lens-state";
import { resolveHashTarget } from "../../../lib/lenses";

/**
 * One source of truth for the committed lens.
 *
 * Server HTML always renders the default (design). On mount the URL's
 * ?focus= is applied before first paint with `instant` set, so a deep link
 * shows its lens without an entrance animation. User selection pushes a new
 * history entry; back/forward restore the lens. Hover/focus is preview only.
 *
 * Phase 2E reads `committed` from this same context to order Selected Work.
 */
export type LensContextValue = {
  committed: Lens;
  preview: Lens | null;
  /** preview ?? committed: what the hero shows right now */
  display: Lens;
  /** true while a lens change should render without choreography (URL apply, popstate on load) */
  instant: boolean;
  commit: (lens: Lens) => void;
  previewOn: (lens: Lens) => void;
  previewOff: () => void;
};

const LensContext = createContext<LensContextValue | null>(null);

export function useLens(): LensContextValue {
  const ctx = useContext(LensContext);
  if (!ctx) throw new Error("useLens must be used inside <LensProvider>");
  return ctx;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function LensProvider({ children }: { children: ReactNode }) {
  const [committed, setCommitted] = useState<Lens>(DEFAULT_LENS);
  const committedRef = useRef<Lens>(DEFAULT_LENS);
  committedRef.current = committed;
  const [preview, setPreview] = useState<Lens | null>(null);
  const [instant, setInstant] = useState(false);
  const instantTimer = useRef<number | null>(null);

  // Apply a lens without choreography, releasing the flag after the next frame.
  const applyInstant = useCallback((lens: Lens) => {
    setInstant(true);
    setCommitted(lens);
    if (instantTimer.current) cancelAnimationFrame(instantTimer.current);
    instantTimer.current = requestAnimationFrame(() => {
      instantTimer.current = requestAnimationFrame(() => setInstant(false));
    });
  }, []);

  // Legacy "#gamut" deep links (old modal) → the case study, or /work.
  useEffect(() => {
    const target = window.location.hash ? resolveHashTarget(window.location.hash) : null;
    if (target) window.location.replace(target);
  }, []);

  // Initial URL → state, before paint, so no entrance animation fires.
  useIsoLayoutEffect(() => {
    const fromUrl = lensFromSearch(window.location.search);
    if (fromUrl !== DEFAULT_LENS) applyInstant(fromUrl);
  }, [applyInstant]);

  // Back/forward: restore the lens that URL carries.
  useEffect(() => {
    const onPop = () => setCommitted(lensFromSearch(window.location.search));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Side effect kept outside the state updater: StrictMode double-invokes
  // updaters in development and would push two history entries.
  const commit = useCallback((lens: Lens) => {
    if (committedRef.current === lens) return;
    const url = urlForLens(lens, { pathname: window.location.pathname, search: window.location.search });
    window.history.pushState({ lens }, "", url);
    setCommitted(lens);
  }, []);

  const previewOn = useCallback((lens: Lens) => setPreview(lens), []);
  const previewOff = useCallback(() => setPreview(null), []);

  const value: LensContextValue = {
    committed,
    preview,
    display: displayLens(preview, committed),
    instant,
    commit,
    previewOn,
    previewOff,
  };
  return <LensContext.Provider value={value}>{children}</LensContext.Provider>;
}
