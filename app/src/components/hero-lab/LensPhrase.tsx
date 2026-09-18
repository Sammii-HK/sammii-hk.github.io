"use client";
import type { Lens } from "../../../common/data/projects";
import { lensHref } from "../../../lib/lenses";

export type CommitTreatment = "underline" | "weight" | "marker" | "env";

/**
 * One interactive discipline phrase inside prose.
 *
 * Semantics under evaluation: a real link to the lens URL, with
 * aria-current="true" on the committed one. Links are native, focusable,
 * work inside a sentence, survive without JS (they navigate to ?focus=),
 * and the same element is reused verbatim in the condensed <nav>.
 * The playground prevents navigation and keeps state local.
 */
export function LensPhrase({
  lens,
  label,
  committed,
  preview,
  motion,
  commitTreatment,
  onCommit,
  onPreview,
  onPreviewEnd,
  index,
  className = "",
  children,
}: {
  lens: Lens;
  label: string;
  committed: Lens;
  preview: Lens | null;
  motion: Lens;
  commitTreatment: CommitTreatment;
  onCommit: (l: Lens) => void;
  onPreview: (l: Lens) => void;
  onPreviewEnd: () => void;
  index: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const isCommitted = committed === lens;
  const isPreview = preview === lens;
  const state = isPreview ? "preview" : isCommitted ? "committed" : "idle";
  return (
    <a
      href={lensHref(lens)}
      className={`lab-phrase ${className}`}
      data-lens={lens}
      data-state={state}
      data-motion={motion}
      data-commit={commitTreatment}
      data-index={String(index + 1).padStart(2, "0")}
      aria-current={isCommitted ? "true" : undefined}
      onClick={(e) => {
        e.preventDefault();
        onCommit(lens);
      }}
      onMouseEnter={() => onPreview(lens)}
      onMouseLeave={onPreviewEnd}
      onFocus={() => onPreview(lens)}
      onBlur={onPreviewEnd}
    >
      {children ?? label}
    </a>
  );
}
