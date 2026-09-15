import type { Lens } from "../../../common/data/projects";

export type HeadlineKey = "candidate" | "alt1" | "alt2";

export const HEADLINES: Record<HeadlineKey, string> = {
  candidate: "I turn ambitious ideas into polished, working products.",
  alt1: "I design and build ambitious digital products.",
  alt2: "I turn ambiguous ideas into polished, working products.",
};

export const PREVIEW: Record<Lens, string> = {
  design: "I build interfaces that feel as considered as they are engineered.",
  ai: "I turn intelligent systems into products people can actually use.",
  product: "I take complicated ideas from prototype to production.",
};

export const LENS_LABEL: Record<Lens, string> = {
  design: "design engineering",
  ai: "AI product engineering",
  product: "product engineering",
};

export const LENS_SHORT: Record<Lens, string> = {
  design: "Design",
  ai: "AI product",
  product: "Product",
};

// The supporting sentence, as segments, so every composition renders the same
// prose with the same three interactive phrases inside it.
export const SUPPORT: (string | Lens)[] = [
  "My work spans ",
  "design",
  ", ",
  "ai",
  " and ",
  "product",
  ", from the first interaction to production.",
];

export const LENSES: Lens[] = ["design", "ai", "product"];
