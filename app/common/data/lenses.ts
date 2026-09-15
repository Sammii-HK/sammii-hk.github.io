import type { Lens } from "./projects";

// The three editorial lenses. Copy here is WORKING copy (brief §9): it will be
// refined in Phase 2D. Motion tokens name a language, not an implementation.
export type LensDefinition = {
  id: Lens;
  /** Phrase as it appears inside the hero sentence. */
  phrase: string;
  /** Nav label. */
  label: string;
  /** Hero headline shown on preview/commit. */
  headline: string;
  /** Design → physical, AI → emergence/recomposition, Product → structural assembly. */
  motion: "physical" | "emergence" | "structural";
  /** Value used in ?focus=. Design is canonical and never written to the URL. */
  query: string | null;
};

export const DEFAULT_LENS: Lens = "design";

export const LENSES: readonly LensDefinition[] = [
  {
    id: "design",
    phrase: "design engineering",
    label: "Design engineering",
    headline: "I build interfaces that feel as considered as they are engineered.",
    motion: "physical",
    query: null,
  },
  {
    id: "ai",
    phrase: "AI product engineering",
    label: "AI product engineering",
    headline: "I turn intelligent systems into products people can actually use.",
    motion: "emergence",
    query: "ai",
  },
  {
    id: "product",
    phrase: "product engineering",
    label: "Product engineering",
    headline: "I take complicated ideas from prototype to production.",
    motion: "structural",
    query: "product",
  },
] as const;

export const LENS_IDS = LENSES.map((l) => l.id) as Lens[];
