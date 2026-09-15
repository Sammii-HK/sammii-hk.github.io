"use client";
import type { ReactNode } from "react";
import type { Lens } from "../../../common/data/projects";
import { lensHref } from "../../../lib/lenses";
import { useLens } from "./LensProvider";

/**
 * A discipline phrase that selects a lens. It is a real link to the lens URL
 * (works without JS, sits naturally in prose, reusable verbatim in the nav)
 * with aria-current on the committed one. Hover/focus previews; click/Enter/
 * tap commits. No ARIA roles beyond what a link already has.
 */
export function LensPhrase({ lens, className = "", children }: { lens: Lens; className?: string; children: ReactNode }) {
  const { committed, preview, display, commit, previewOn, previewOff } = useLens();
  const state = preview === lens ? "preview" : committed === lens ? "committed" : "idle";
  return (
    <a
      href={lensHref(lens)}
      className={`lens-phrase ${className}`}
      data-lens={lens}
      data-state={state}
      data-motion={display}
      aria-current={committed === lens ? "true" : undefined}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // let modified clicks open normally
        e.preventDefault();
        commit(lens);
      }}
      onMouseEnter={() => previewOn(lens)}
      onMouseLeave={previewOff}
      onFocus={() => previewOn(lens)}
      onBlur={previewOff}
    >
      {children}
    </a>
  );
}
