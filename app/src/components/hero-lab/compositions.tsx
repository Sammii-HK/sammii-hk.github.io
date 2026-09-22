"use client";
import { useEffect, useRef } from "react";
import type { Lens } from "../../../common/data/projects";
import { Headline } from "./Headline";
import { Support, type LensProps } from "./Support";
import { LENSES, LENS_LABEL, PREVIEW } from "./copy";
import { ArrowDown } from "lucide-react";

export type PreviewTreatment = "full" | "partial";

type CompositionProps = LensProps & {
  headline: string;
  previewTreatment: PreviewTreatment;
  /** Once a lens has been clicked, the H1 stays locked to its statement. */
  locked: boolean;
};

/** H1 text: hover/focus previews a statement; a click locks the committed one in; otherwise the base headline. */
function h1For(headline: string, lens: LensProps & { locked: boolean }, treatment: PreviewTreatment) {
  if (treatment !== "full") return headline;
  if (lens.preview) return PREVIEW[lens.preview];
  if (lens.locked) return PREVIEW[lens.committed];
  return headline;
}

/** Partial treatment: the H1 stays, an interpretive line forms beneath the sentence. */
function Annotation({ preview, motion }: { preview: Lens | null; motion: Lens }) {
  return (
    <div className="lab-annotation-slot" aria-live="polite">
      {preview && <Headline as="p" text={PREVIEW[preview]} motion={motion} className="lab-annotation" />}
    </div>
  );
}

// ── A · Quiet editorial ──────────────────────────────────────────────────
export function CompositionA({ headline, previewTreatment, locked, ...lens }: CompositionProps) {
  return (
    <section className="lab-hero lab-hero-a" data-composition="a" data-preview={previewTreatment}>
      <p className="lab-eyebrow">Sammii Kellow</p>
      <Headline text={h1For(headline, { ...lens, locked }, previewTreatment)} motion={lens.motion} />
      <Support {...lens} />
      {previewTreatment === "partial" && <Annotation preview={lens.preview} motion={lens.motion} />}
      <a href="#work" className="lab-route">
        Selected work <ArrowDown size={13} className="icon-inline" aria-hidden="true" />
      </a>
    </section>
  );
}

// ── B · Graphic editorial ────────────────────────────────────────────────
// Asymmetric: a narrow left column carries the identification, a hairline
// and a typographic index of the three lenses; the headline and sentence sit
// right, off the same baseline. The index mirrors the sentence's phrases and
// lights up with them, so structure reflects the prose rather than duplicating
// it as controls.
export function CompositionB({ headline, previewTreatment, locked, ...lens }: CompositionProps) {
  return (
    <section className="lab-hero lab-hero-b" data-composition="b" data-preview={previewTreatment}>
      <div className="lab-b-aside">
        <p className="lab-eyebrow">Sammii Kellow</p>
        <hr className="lab-rule" />
        <ol className="lab-index" aria-hidden="true">
          {LENSES.map((l, i) => (
            <li
              key={l}
              className="lab-index-item"
              data-state={lens.preview === l ? "preview" : lens.committed === l ? "committed" : "idle"}
              data-motion={lens.motion}
            >
              <span className="lab-index-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="lab-index-label">{LENS_LABEL[l]}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="lab-b-main">
        <Headline text={h1For(headline, { ...lens, locked }, previewTreatment)} motion={lens.motion} />
        <hr className="lab-rule lab-rule-main" />
        <Support {...lens} />
        {previewTreatment === "partial" && <Annotation preview={lens.preview} motion={lens.motion} />}
        <a href="#work" className="lab-route">
          Selected work <ArrowDown size={13} className="icon-inline" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

// ── C · Responsive editorial ─────────────────────────────────────────────
// Same bones as A, plus two pointer relationships: the block drifts a few
// pixels against --env-x/--env-y (pure CSS off the provider's variables), and
// each phrase carries --near (0..1), written from pointer distance without
// React state, which opens its tracking and draws its underline as the
// pointer approaches. Stationary, it is Composition A.
export function CompositionC({ headline, previewTreatment, locked, ...lens }: CompositionProps) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(hover: none)").matches) return;
    let raf = 0;
    let px = -1e4, py = -1e4;
    const phrases = () => Array.from(el.querySelectorAll<HTMLElement>(".lab-phrase"));
    const write = () => {
      raf = 0;
      for (const p of phrases()) {
        const r = p.getBoundingClientRect();
        const cx = Math.max(r.left, Math.min(px, r.right));
        const cy = Math.max(r.top, Math.min(py, r.bottom));
        const d = Math.hypot(px - cx, py - cy);
        const near = Math.max(0, Math.min(1, 1 - d / 220));
        p.style.setProperty("--near", near.toFixed(3));
      }
    };
    const onMove = (e: PointerEvent) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(write); };
    const onLeave = () => { px = py = -1e4; if (!raf) raf = requestAnimationFrame(write); };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => { el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <section ref={root} className="lab-hero lab-hero-c" data-composition="c" data-preview={previewTreatment}>
      <div className="lab-c-drift">
        <p className="lab-eyebrow">Sammii Kellow</p>
        <Headline text={h1For(headline, { ...lens, locked }, previewTreatment)} motion={lens.motion} />
        <Support {...lens} />
        {previewTreatment === "partial" && <Annotation preview={lens.preview} motion={lens.motion} />}
        <a href="#work" className="lab-route">
          Selected work <ArrowDown size={13} className="icon-inline" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
