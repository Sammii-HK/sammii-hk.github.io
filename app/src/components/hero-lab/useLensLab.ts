"use client";
import { useCallback, useState } from "react";
import type { Lens } from "../../../common/data/projects";

/**
 * Local lens state for the playground: a committed lens (click/tap/Enter)
 * and a transient preview (hover/focus). Preview never commits; leaving
 * restores the committed state. Production will add URL sync (Phase 2D).
 */
export function useLensLab(initial: Lens = "design", initiallyLocked = false) {
  const [committed, setCommitted] = useState<Lens>(initial);
  const [preview, setPreview] = useState<Lens | null>(null);
  // A click locks the headline to that lens's statement. Until the visitor has
  // clicked, the base headline stands (design is the default lens, but the
  // identity line is the identity).
  const [locked, setLocked] = useState(initiallyLocked);
  const commit = useCallback((l: Lens) => { setCommitted(l); setLocked(true); }, []);
  const previewOn = useCallback((l: Lens) => setPreview(l), []);
  const previewOff = useCallback(() => setPreview(null), []);
  return { committed, preview, locked, active: preview ?? committed, commit, previewOn, previewOff };
}
