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

export function rankFor(p: Project, lens: Lens): number {
  return p.focus?.[lens]?.rank ?? Number.MAX_SAFE_INTEGER;
}

/** Lens-specific one-liner, falling back to the project's base copy. */
export function summaryFor(p: Project, lens: Lens): string {
  return p.focus?.[lens]?.summary ?? p.info;
}

export function emphasisFor(p: Project, lens: Lens): string[] {
  return p.focus?.[lens]?.emphasis ?? [];
}

export type LensOrder = {
  lens: Lens;
  featured: Project[];
  supporting: Project[];
  /** Everything on the homepage, in reading order, for keyed layout transitions. */
  all: Project[];
};

/**
 * The homepage for one lens. Deterministic: sorted by rank, then id, so two
 * projects can never swap places between renders.
 */
export function getLensOrder(lens: Lens, source: readonly Project[] = projects): LensOrder {
  const byRank = (a: Project, b: Project) => rankFor(a, lens) - rankFor(b, lens) || a.id.localeCompare(b.id);
  const home = source.filter(isHomepageProject);
  const featured = home.filter((p) => tierFor(p, lens) === "featured").sort(byRank);
  const supporting = home.filter((p) => tierFor(p, lens) === "supporting").sort(byRank);
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
