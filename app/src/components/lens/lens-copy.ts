import type { Lens } from "../../../common/data/projects";

// Production copy, as approved from the hero lab. Do not add variants here.
export const LENS_HEADLINE: Record<Lens, string> = {
  design: "I build interfaces that feel as considered as they are engineered.",
  ai: "I turn intelligent systems into products people can actually use.",
  product: "I take complicated ideas from prototype to production.",
};

export const LENS_PHRASE: Record<Lens, string> = {
  design: "design engineering",
  ai: "AI product engineering",
  product: "product engineering",
};

export const LENS_NAV_LABEL: Record<Lens, string> = {
  design: "Design engineering",
  ai: "AI product engineering",
  product: "Product engineering",
};

export const LENS_SHORT: Record<Lens, string> = {
  design: "Design",
  ai: "AI product",
  product: "Product",
};

/** The supporting sentence with the three phrases as live segments. "\n" = a line break after a comma. */
export const SUPPORT: (string | Lens)[] = [
  "My work spans ",
  "design",
  ",\n",
  "ai",
  " and ",
  "product",
  ",\nfrom the first interaction to production.",
];

export const LENS_ORDER: Lens[] = ["design", "ai", "product"];
