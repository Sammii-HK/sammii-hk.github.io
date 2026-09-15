import { describe, it, expect } from "vitest";
import { projects, type Lens } from "../../common/data/projects";
import {
  parseLens,
  lensHref,
  getLensOrder,
  getWorkIndex,
  getLabsProjects,
  summaryFor,
  tierFor,
  resolveHashTarget,
  LENS_IDS,
} from "../lenses";

const LENSES: Lens[] = ["design", "ai", "product"];

describe("parseLens", () => {
  it("defaults to design for empty, unknown and explicit design", () => {
    expect(parseLens(null)).toBe("design");
    expect(parseLens(undefined)).toBe("design");
    expect(parseLens("")).toBe("design");
    expect(parseLens("design")).toBe("design");
    expect(parseLens("marketing")).toBe("design");
    expect(parseLens("../etc")).toBe("design");
  });
  it("accepts ai and product, case-insensitively", () => {
    expect(parseLens("ai")).toBe("ai");
    expect(parseLens("AI")).toBe("ai");
    expect(parseLens("product")).toBe("product");
  });
});

describe("lensHref", () => {
  it("keeps design canonical and writes the others as ?focus=", () => {
    expect(lensHref("design")).toBe("/");
    expect(lensHref("ai")).toBe("/?focus=ai");
    expect(lensHref("product")).toBe("/?focus=product");
  });
});

describe("getLensOrder", () => {
  it("matches the approved hierarchy", () => {
    const ids = (lens: Lens) => {
      const o = getLensOrder(lens);
      return { featured: o.featured.map((p) => p.id), supporting: o.supporting.map((p) => p.id) };
    };
    expect(ids("design")).toEqual({
      featured: ["strata", "kern", "gamut"],
      supporting: ["prism", "lunary", "lattiq"],
    });
    expect(ids("ai")).toEqual({
      featured: ["orbit", "lunary", "spellcast"],
      supporting: ["create-mcp-server", "lattiq"],
    });
    expect(ids("product")).toEqual({
      featured: ["lunary", "lattiq", "strata"],
      supporting: ["gamut", "orbit", "spellcast", "kern"],
    });
  });

  it("always has exactly three featured and 2 to 5 supporting", () => {
    for (const lens of LENSES) {
      const o = getLensOrder(lens);
      expect(o.featured).toHaveLength(3);
      expect(o.supporting.length).toBeGreaterThanOrEqual(2);
      expect(o.supporting.length).toBeLessThanOrEqual(5);
    }
  });

  it("never lists a project twice and only lists homepage projects", () => {
    for (const lens of LENSES) {
      const o = getLensOrder(lens);
      const ids = o.all.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const p of o.all) expect(p.home).toBe("home");
    }
  });

  it("is deterministic and rank-ordered within a tier", () => {
    for (const lens of LENSES) {
      const a = getLensOrder(lens).all.map((p) => p.id);
      const b = getLensOrder(lens).all.map((p) => p.id);
      expect(a).toEqual(b);
      const ranks = getLensOrder(lens).featured.map((p) => p.focus![lens]!.rank);
      expect(ranks).toEqual([...ranks].sort((x, y) => x - y));
    }
  });
});

describe("project data invariants", () => {
  const home = projects.filter((p) => p.home === "home");

  it("every homepage project defines all three lenses", () => {
    for (const p of home) for (const lens of LENS_IDS) expect(p.focus?.[lens], `${p.id}.${lens}`).toBeDefined();
  });

  it("no /work, labs or archive project claims a homepage tier", () => {
    for (const p of projects.filter((x) => x.home !== "home")) {
      expect(p.focus, p.id).toBeUndefined();
      for (const lens of LENS_IDS) expect(tierFor(p, lens)).toBe("work");
    }
  });

  it("every featured project has a case study and a lens summary", () => {
    for (const lens of LENSES) {
      for (const p of getLensOrder(lens).featured) {
        expect(p.caseStudy, `${p.id} case study`).toBeTruthy();
        expect(p.focus![lens]!.summary, `${p.id}.${lens} summary`).toBeTruthy();
      }
    }
  });

  it("lens summaries contain no em or en dashes", () => {
    for (const p of home) for (const lens of LENS_IDS) {
      const s = p.focus?.[lens]?.summary ?? "";
      expect(s, `${p.id}.${lens}`).not.toMatch(/[–—]/);
    }
  });

  it("labs and archive projects carry a labs kind; grove is archived, not promoted", () => {
    for (const p of projects.filter((x) => x.home === "labs")) expect(p.labs?.kind, p.id).toBeDefined();
    expect(projects.find((p) => p.id === "grove")?.home).toBe("archive");
    expect(projects.find((p) => p.id === "scapestudio")?.home).toBe("work");
  });

  it("only the Gamut fragment is expected in V1 (others are declared, not built)", () => {
    const declared = projects.filter((p) => p.fragment).map((p) => p.id).sort();
    expect(declared).toEqual(["gamut", "kern", "lattiq", "strata"]);
  });
});

describe("summaryFor", () => {
  it("falls back to base info when the lens has no summary", () => {
    const prism = projects.find((p) => p.id === "prism")!;
    expect(summaryFor(prism, "ai")).toBe(prism.info);
    expect(summaryFor(prism, "design")).not.toBe(prism.info);
  });
});

describe("getWorkIndex", () => {
  it("includes every home and work project exactly once and no labs/archive", () => {
    const groups = getWorkIndex();
    const ids = groups.flatMap((g) => g.projects.map((p) => p.id));
    const expected = projects.filter((p) => p.home === "home" || p.home === "work").map((p) => p.id);
    expect([...ids].sort()).toEqual([...expected].sort());
    expect(ids).toContain("scapestudio");
    expect(ids).not.toContain("kinetic");
    expect(ids).not.toContain("grove");
  });
});

describe("getLabsProjects", () => {
  it("lists labs projects with superseded work last", () => {
    const labs = getLabsProjects().map((p) => p.id);
    expect(labs).toContain("creative-coding");
    expect(labs.at(-1)).toBe("tailwind-colour-creator");
    expect(labs).not.toContain("grove");
  });
});

describe("resolveHashTarget", () => {
  it("sends legacy #slug links to the case study, or /work when there is none", () => {
    expect(resolveHashTarget("#gamut")).toBe("/projects/gamut/");
    expect(resolveHashTarget("#kinetic")).toBe("/work/#kinetic");
    expect(resolveHashTarget("#nope")).toBeNull();
  });
});
