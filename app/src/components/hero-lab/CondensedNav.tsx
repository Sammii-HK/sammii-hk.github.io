"use client";
import type { Lens } from "../../../common/data/projects";
import { lensHref } from "../../../lib/lenses";
import { LENSES, LENS_LABEL, LENS_SHORT } from "./copy";
import type { CommitTreatment } from "./LensPhrase";

/**
 * How the lens system compresses once the hero has scrolled away. Same links,
 * same aria-current, same selected-state language as the hero phrases; a
 * <nav> because that is what it is. Not sticky here: presentation only.
 * Below 640px the labels shorten and the row scrolls horizontally.
 */
export function CondensedNav({
  committed,
  preview,
  motion,
  commitTreatment,
  onCommit,
  onPreview,
  onPreviewEnd,
}: {
  committed: Lens;
  preview: Lens | null;
  motion: Lens;
  commitTreatment: CommitTreatment;
  onCommit: (l: Lens) => void;
  onPreview: (l: Lens) => void;
  onPreviewEnd: () => void;
}) {
  return (
    <nav className="lab-nav" aria-label="Lens" data-motion={motion}>
      <a href="/" className="lab-nav-wordmark" onClick={(e) => e.preventDefault()}>
        SAMMII
      </a>
      <div className="lab-nav-lenses">
        {LENSES.map((l, i) => {
          const state = preview === l ? "preview" : committed === l ? "committed" : "idle";
          return (
            <a
              key={l}
              href={lensHref(l)}
              className="lab-phrase lab-nav-phrase"
              data-lens={l}
              data-state={state}
              data-motion={motion}
              data-commit={commitTreatment}
              data-index={String(i + 1).padStart(2, "0")}
              aria-current={committed === l ? "true" : undefined}
              onClick={(e) => { e.preventDefault(); onCommit(l); }}
              onMouseEnter={() => onPreview(l)}
              onMouseLeave={onPreviewEnd}
              onFocus={() => onPreview(l)}
              onBlur={onPreviewEnd}
            >
              <span className="lab-long">{LENS_LABEL[l]}</span>
              <span className="lab-short" aria-hidden="true">{LENS_SHORT[l]}</span>
            </a>
          );
        })}
      </div>
      <a href="https://labs.sammii.dev" className="lab-nav-labs" onClick={(e) => e.preventDefault()}>
        Labs <span aria-hidden="true">↗</span>
      </a>
    </nav>
  );
}
