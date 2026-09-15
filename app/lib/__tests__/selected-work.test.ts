import { describe, it, expect } from "vitest";
import { projects, type Lens } from "../../common/data/projects";
import { selectedWorkModel, projectHref } from "../selected-work";
import { displayLens } from "../lens-state";

const LENSES: Lens[] = ["design", "ai", "product"];
const ids = (xs: { project: { id: string } }[]) => xs.map((x) => x.project.id);

describe("Selected Work editorial contract", () => {
  it("renders the approved hierarchy for every lens", () => {
    const d = selectedWorkModel("design");
    expect(ids(d.chapters)).toEqual(["strata", "kern", "gamut"]);
    expect(ids(d.references)).toEqual(["prism", "lunary", "lattiq"]);
    const a = selectedWorkModel("ai");
    expect(ids(a.chapters)).toEqual(["orbit", "lunary", "spellcast"]);
    expect(ids(a.references)).toEqual(["create-mcp-server", "lattiq", "iprep"]);
    const p = selectedWorkModel("product");
    expect(ids(p.chapters)).toEqual(["lunary", "lattiq", "strata"]);
    expect(ids(p.references)).toEqual(["gamut", "orbit", "spellcast", "kern"]);
  });

  it("always has exactly three chapters, numbered 1..3, with the pacing layouts in order", () => {
    for (const lens of LENSES) {
      const m = selectedWorkModel(lens);
      expect(m.chapters).toHaveLength(3);
      expect(m.chapters.map((c) => c.index)).toEqual([1, 2, 3]);
      expect(m.chapters.map((c) => c.layout)).toEqual(["bleed", "split-right", "split-left"]);
      expect(m.references.map((r) => r.index)).toEqual(m.references.map((_, i) => i + 1));
    }
  });

  it("the committed lens decides the hierarchy; a preview lens never does", () => {
    // displayLens is what the hero shows; the work section must ignore it.
    expect(displayLens("ai", "design")).toBe("ai");
    expect(ids(selectedWorkModel("design").chapters)).toEqual(["strata", "kern", "gamut"]);
    // Simulate "hovering AI while Design is committed": the model is only ever built from committed.
    const committed: Lens = "design";
    const preview: Lens = "ai";
    void preview;
    expect(ids(selectedWorkModel(committed).chapters)).not.toEqual(ids(selectedWorkModel("ai").chapters));
  });

  it("never lists a project twice within a lens, and ordering is deterministic", () => {
    for (const lens of LENSES) {
      const a = selectedWorkModel(lens).order;
      const b = selectedWorkModel(lens).order;
      expect(new Set(a).size).toBe(a.length);
      expect(a).toEqual(b);
    }
  });

  it("resolves lens-specific summaries and emphasis, never the base copy for chapters", () => {
    for (const lens of LENSES) {
      for (const c of selectedWorkModel(lens).chapters) {
        expect(c.summary).not.toBe(c.project.info);
        expect(c.emphasis.length).toBeGreaterThan(0);
      }
    }
    const lunaryAI = selectedWorkModel("ai").chapters.find((c) => c.project.id === "lunary")!;
    const lunaryProduct = selectedWorkModel("product").chapters.find((c) => c.project.id === "lunary")!;
    const lunaryDesign = selectedWorkModel("design").references.find((r) => r.project.id === "lunary")!;
    expect(new Set([lunaryAI.summary, lunaryProduct.summary, lunaryDesign.summary]).size).toBe(3);
  });

  it("the Gamut fragment is eligible only when Gamut is a chapter", () => {
    expect(selectedWorkModel("design").chapters.find((c) => c.project.id === "gamut")?.fragment).toBe(true);
    expect(selectedWorkModel("product").chapters.some((c) => c.fragment)).toBe(false);
    expect(selectedWorkModel("ai").chapters.some((c) => c.fragment)).toBe(false);
    for (const lens of LENSES) for (const c of selectedWorkModel(lens).chapters) if (c.project.id !== "gamut") expect(c.fragment).toBe(false);
  });

  it("every rendered project links to an existing case study route", () => {
    for (const lens of LENSES) {
      const m = selectedWorkModel(lens);
      for (const x of [...m.chapters, ...m.references]) {
        expect(x.href, x.project.id).toMatch(/^\/projects\/[a-z0-9-]+\/$/);
        expect(x.project.caseStudy, x.project.id).toBeTruthy();
      }
    }
    expect(projectHref(projects.find((p) => p.id === "gamut")!)).toBe("/projects/gamut/");
    // Strata: case study is the destination, its preview-deployment live link is not surfaced
    expect(selectedWorkModel("design").chapters[0].liveUrl).toBeUndefined();
  });
});
