"use client";
import { useCallback, useState } from "react";
import type { Lens } from "../../../common/data/projects";

/**
 * Local lens state for the playground: a committed lens (click/tap/Enter)
 * and a transient preview (hover/focus). Preview never commits; leaving
 * restores the committed state. Production will add URL sync (Phase 2D).
 */
export function useLensLab(initial: Lens = "design") {
  const [committed, setCommitted] = useState<Lens>(initial);
  const [preview, setPreview] = useState<Lens | null>(null);
  const commit = useCallback((l: Lens) => setCommitted(l), []);
  const previewOn = useCallback((l: Lens) => setPreview(l), []);
  const previewOff = useCallback(() => setPreview(null), []);
  return { committed, preview, active: preview ?? committed, commit, previewOn, previewOff };
}
