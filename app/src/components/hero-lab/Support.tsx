"use client";
import type { Lens } from "../../../common/data/projects";
import { LENS_LABEL, SUPPORT } from "./copy";
import { LensPhrase, type CommitTreatment } from "./LensPhrase";

export type LensProps = {
  committed: Lens;
  preview: Lens | null;
  motion: Lens;
  commitTreatment: CommitTreatment;
  onCommit: (l: Lens) => void;
  onPreview: (l: Lens) => void;
  onPreviewEnd: () => void;
};

/** The supporting sentence with the three phrases as live links inside it. */
export function Support({ className = "", ...lensProps }: LensProps & { className?: string }) {
  let idx = 0;
  return (
    <p className={`lab-support ${className}`}>
      {SUPPORT.map((seg, i) =>
        seg === "design" || seg === "ai" || seg === "product" ? (
          <LensPhrase key={i} lens={seg} label={LENS_LABEL[seg]} index={idx++} {...lensProps} />
        ) : (
          <span key={i}>{seg}</span>
        ),
      )}
    </p>
  );
}
