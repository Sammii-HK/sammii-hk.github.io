import { projects, type Lens, type Project, type Tier, type WorkGroup } from "../common/data/projects";
import { DEFAULT_LENS, LENSES, LENS_IDS } from "../common/data/lenses";

export { DEFAULT_LENS, LENSES, LENS_IDS };

/** `?focus=` → lens. Anything unknown, including "design", resolves to the default. */
export function parseLens(value: string | null | undefined): Lens {
  if (!value) return DEFAULT_LENS;
  const hit = LENSES.find((l) => l.query === value.toLowerCase());
  return hit ? hit.id : DEFAULT_LENS;
}

/** Path + query for a lens. Design is canonical: plain `/`. */
export function lensHref(lens: Lens, pathname = "/"): string {
  const def = LENSES.find((l) => l.id === lens);
  return def?.query ? `${pathname}?focus=${def.query}` : pathname;
}

export function isHomepageProject(p: Project): boolean {
  return p.home === "home";
}

export function tierFor(p: Project, lens: Lens): Tier {
  return p.focus?.[lens]?.tier ?? "work";
}

/** Order within the project's tier for this lens. Work tier is unranked. */
export function rankFor(p: Project, lens: Lens): number {
  const f = p.focus?.[lens];
  return f && f.tier !== "work" ? f.rank : Number.MAX_SAFE_INTEGER;
}

/** Lens-specific one-liner, falling back to the project's base copy. */
export function summaryFor(p: Project, lens: Lens): string {
  const f = p.focus?.[lens];
  return (f && f.tier !== "work" && f.summary) || p.info;
}

export function emphasisFor(p: Project, lens: Lens): string[] {
  const f = p.focus?.[lens];
  return (f && f.tier !== "work" && f.emphasis) || [];
}

export type LensOrder = {
  lens: Lens;
  featured: Project[];
  supporting: Project[];
  /** Everything on the homepage, in reading order, for keyed layout transitions. */
  all: Project[];
};

/**
 * The homepage for one lens. A project appears if its focus for this lens is
 * featured or supporting; `home: "home"` projects define every lens, while a
 * `home: "work"` project may opt into one lens's supporting tier (iPrep, AI).
 * Deterministic: sorted by rank within tier, then id.
 */
export function getLensOrder(lens: Lens, source: readonly Project[] = projects): LensOrder {
  const byRank = (a: Project, b: Project) => rankFor(a, lens) - rankFor(b, lens) || a.id.localeCompare(b.id);
  const eligible = source.filter((p) => p.home === "home" || p.home === "work");
  const featured = eligible.filter((p) => tierFor(p, lens) === "featured").sort(byRank);
  const supporting = eligible.filter((p) => tierFor(p, lens) === "supporting").sort(byRank);
  return { lens, featured, supporting, all: [...featured, ...supporting] };
}

export const WORK_GROUPS: readonly { id: WorkGroup; label: string }[] = [
  { id: "products", label: "Products" },
  { id: "tools", label: "Design and developer tools" },
  { id: "ai", label: "AI systems" },
  { id: "earlier", label: "Earlier work" },
];

/** /work index: everything that is not Labs-only or archived, grouped, stable order. */
export function getWorkIndex(source: readonly Project[] = projects): { group: WorkGroup; label: string; projects: Project[] }[] {
  const eligible = source.filter((p) => p.home === "home" || p.home === "work");
  return WORK_GROUPS.map(({ id, label }) => ({
    group: id,
    label,
    projects: eligible.filter((p) => p.group === id),
  })).filter((g) => g.projects.length > 0);
}

/** Projects that belong to labs.sammii.dev, superseded ones last. */
export function getLabsProjects(source: readonly Project[] = projects): Project[] {
  return source
    .filter((p) => p.home === "labs")
    .sort((a, b) => Number(!!a.labs?.superseded) - Number(!!b.labs?.superseded) || a.id.localeCompare(b.id));
}

/** Legacy `#slug` deep links: where should they land now? */
export function resolveHashTarget(hash: string, source: readonly Project[] = projects): string | null {
  const id = hash.replace(/^#/, "");
  const p = source.find((x) => x.id === id);
  if (!p) return null;
  return p.caseStudy ? `/projects/${p.caseStudy}/` : `/work/#${p.id}`;
}
