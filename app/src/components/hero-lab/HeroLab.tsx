"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Lens } from "../../../common/data/projects";
import { EnvironmentProvider } from "../env/EnvironmentProvider";
import { CursorFollower } from "../env/CursorFollower";
import { CompositionA, CompositionB, CompositionC, type PreviewTreatment } from "./compositions";
import { CondensedNav } from "./CondensedNav";
import { HEADLINES, type HeadlineKey } from "./copy";
import type { CommitTreatment } from "./LensPhrase";
import { useLensLab } from "./useLensLab";

type Comp = "a" | "b" | "c";
function pick<T extends string>(v: string | null, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(v ?? "") ? (v as T) : fallback;
}

/**
 * /hero-lab controller. Every control is also a query parameter so states
 * can be screenshotted: ?comp=a|b|c &h1=candidate|alt1|alt2 &preview=full|partial
 * &commit=underline|weight|marker|env &lens=design|ai|product &hover=design|ai|product
 * &reduced=1 &nav=1 (show the condensed nav prototype at the top) &locked=1 (H1 already locked to the lens).
 * Current defaults are Sammii's picks from the first review: A, "ambiguous → polished", full H1, env accent.
 */
export function HeroLab() {
  const q = useSearchParams();
  const [comp, setComp] = useState<Comp>(pick<Comp>(q.get("comp"), ["a", "b", "c"], "a"));
  const [h1, setH1] = useState<HeadlineKey>(pick<HeadlineKey>(q.get("h1"), ["candidate", "alt1", "alt2"], "alt2"));
  const [previewTreatment, setPreviewTreatment] = useState<PreviewTreatment>(pick<PreviewTreatment>(q.get("preview"), ["full", "partial"], "full"));
  const [commitTreatment, setCommitTreatment] = useState<CommitTreatment>(pick<CommitTreatment>(q.get("commit"), ["underline", "weight", "marker", "env"], "env"));
  const [reduced, setReduced] = useState(q.get("reduced") === "1");
  const [showNav, setShowNav] = useState(q.get("nav") === "1");
  const lab = useLensLab(pick<Lens>(q.get("lens"), ["design", "ai", "product"], "design"), q.get("locked") === "1");

  // Scripted hover state for screenshots (?hover=ai). Pointer/focus still override.
  const forcedHover = pick<Lens | "">(q.get("hover"), ["design", "ai", "product", ""], "");
  useEffect(() => { if (forcedHover) lab.previewOn(forcedHover); }, [forcedHover]); // eslint-disable-line react-hooks/exhaustive-deps

  const lensProps = {
    committed: lab.committed,
    preview: lab.preview,
    motion: lab.active,
    commitTreatment,
    onCommit: lab.commit,
    onPreview: lab.previewOn,
    onPreviewEnd: () => (forcedHover ? lab.previewOn(forcedHover) : lab.previewOff()),
  };
  const compProps = { ...lensProps, headline: HEADLINES[h1], previewTreatment, locked: lab.locked };
  const Composition = comp === "a" ? CompositionA : comp === "b" ? CompositionB : CompositionC;

  return (
    <EnvironmentProvider className="lab-root min-h-[100dvh] flex flex-col" lens={lab.committed}>
      <div aria-hidden="true" className="env-ambient" />
      <CursorFollower />
      <div className="lab-page" data-reduced={reduced ? "1" : undefined}>
        {showNav && <CondensedNav {...lensProps} />}
        <Composition {...compProps} />
        <div className="lab-below" aria-hidden="true">
          <div className="lab-below-label">Selected work would begin here</div>
        </div>
      </div>

      <form className="lab-controls" aria-label="Playground controls" onSubmit={(e) => e.preventDefault()}>
        <label>Composition
          <select value={comp} onChange={(e) => setComp(e.target.value as Comp)}>
            <option value="a">A · Quiet editorial</option>
            <option value="b">B · Graphic editorial</option>
            <option value="c">C · Responsive editorial</option>
          </select>
        </label>
        <label>Headline
          <select value={h1} onChange={(e) => setH1(e.target.value as HeadlineKey)}>
            <option value="candidate">ambitious → polished</option>
            <option value="alt1">design and build</option>
            <option value="alt2">ambiguous → polished</option>
          </select>
        </label>
        <label>Preview
          <select value={previewTreatment} onChange={(e) => setPreviewTreatment(e.target.value as PreviewTreatment)}>
            <option value="full">Full H1 transition</option>
            <option value="partial">Partial: H1 stays, line forms</option>
          </select>
        </label>
        <label>Committed
          <select value={commitTreatment} onChange={(e) => setCommitTreatment(e.target.value as CommitTreatment)}>
            <option value="underline">Underline</option>
            <option value="weight">Weight only</option>
            <option value="marker">Marker + index</option>
            <option value="env">Environmental accent</option>
          </select>
        </label>
        <label><input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} /> Emulate reduced motion</label>
        <label><input type="checkbox" checked={showNav} onChange={(e) => setShowNav(e.target.checked)} /> Condensed nav</label>
        <span className="lab-state">lens: {lab.committed}{lab.locked ? " (locked)" : ""}{lab.preview ? ` · preview: ${lab.preview}` : ""}</span>
      </form>
    </EnvironmentProvider>
  );
}
