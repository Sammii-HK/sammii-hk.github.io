import { projects, type Lens, type Project } from "../common/data/projects";
import { getLensOrder, summaryFor, emphasisFor } from "./lenses";

/**
 * The Selected Work editorial contract. Pure, so it can be tested without a
 * browser and so the component is a thin renderer.
 *
 * The COMMITTED lens decides the hierarchy. Preview (hover/focus) never does.
 */

export type ChapterLayout = "bleed" | "split-right" | "split-left";

export type Chapter = {
  project: Project;
  index: number; // 1..3
  layout: ChapterLayout;
  summary: string;
  emphasis: string[];
  href: string;
  liveUrl?: string;
  /** Only Gamut, only while featured (V1 rule). */
  fragment: boolean;
};

export type Reference = {
  project: Project;
  index: number; // 1..n
  summary: string;
  emphasis: string[];
  href: string;
};

export type SelectedWorkModel = {
  lens: Lens;
  chapters: Chapter[];
  references: Reference[];
  /** Every rendered project id in reading order, for keyed continuity. */
  order: string[];
};

// Pacing: the chapter's position, not the project, decides the layout, so
// scrolling any lens reads bleed → split → split rather than card, card, card.
const LAYOUTS: ChapterLayout[] = ["bleed", "split-right", "split-left"];

/** Case study when there is one, otherwise the live product. */
export function projectHref(p: Project): string {
  if (p.caseStudy) return `/projects/${p.caseStudy}/`;
  return p.liveUrl ?? "#";
}

/** Strata now has a production domain (strata.sammii.dev), so every chapter may show its live link. */
function liveUrlFor(p: Project): string | undefined {
  return p.liveUrl;
}

export function selectedWorkModel(committed: Lens, source: readonly Project[] = projects): SelectedWorkModel {
  const { featured, supporting } = getLensOrder(committed, source);
  const chapters: Chapter[] = featured.map((project, i) => ({
    project,
    index: i + 1,
    layout: LAYOUTS[i] ?? "split-right",
    summary: summaryFor(project, committed),
    emphasis: emphasisFor(project, committed),
    href: projectHref(project),
    liveUrl: liveUrlFor(project),
    fragment: project.id === "gamut",
  }));
  const references: Reference[] = supporting.map((project, i) => ({
    project,
    index: i + 1,
    summary: summaryFor(project, committed),
    emphasis: emphasisFor(project, committed),
    href: projectHref(project),
  }));
  return { lens: committed, chapters, references, order: [...featured, ...supporting].map((p) => p.id) };
}
