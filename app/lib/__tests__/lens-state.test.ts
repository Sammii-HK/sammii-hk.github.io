import { describe, it, expect } from "vitest";
import { lensFromSearch, urlForLens, displayLens, DEFAULT_LENS } from "../lens-state";

describe("lensFromSearch", () => {
  it("resolves the three lenses and falls back to design for everything else", () => {
    expect(lensFromSearch("")).toBe("design");
    expect(lensFromSearch("?")).toBe("design");
    expect(lensFromSearch("?focus=design")).toBe("design");
    expect(lensFromSearch("?focus=ai")).toBe("ai");
    expect(lensFromSearch("?focus=product")).toBe("product");
    expect(lensFromSearch("focus=product")).toBe("product");
    expect(lensFromSearch("?focus=AI")).toBe("ai");
    expect(lensFromSearch("?focus=marketing")).toBe("design");
    expect(lensFromSearch("?focus=")).toBe("design");
    expect(lensFromSearch("?utm_source=x")).toBe("design");
    expect(DEFAULT_LENS).toBe("design");
  });
});

describe("urlForLens", () => {
  const at = (search: string) => ({ pathname: "/", search });
  it("keeps design canonical and writes the others as ?focus=", () => {
    expect(urlForLens("design", at(""))).toBe("/");
    expect(urlForLens("ai", at(""))).toBe("/?focus=ai");
    expect(urlForLens("product", at("?focus=ai"))).toBe("/?focus=product");
    expect(urlForLens("design", at("?focus=ai"))).toBe("/");
  });
  it("preserves unrelated query parameters", () => {
    expect(urlForLens("ai", at("?utm_source=cv"))).toBe("/?focus=ai&utm_source=cv");
    expect(urlForLens("design", at("?focus=ai&utm_source=cv"))).toBe("/?utm_source=cv");
  });
  it("round-trips through lensFromSearch", () => {
    for (const lens of ["design", "ai", "product"] as const) {
      const url = urlForLens(lens, at("?focus=product"));
      expect(lensFromSearch(url.includes("?") ? url.slice(url.indexOf("?")) : "")).toBe(lens);
    }
  });
});

describe("displayLens", () => {
  it("is the preview while previewing, otherwise the committed lens", () => {
    expect(displayLens(null, "design")).toBe("design");
    expect(displayLens("ai", "design")).toBe("ai");
    expect(displayLens(null, "product")).toBe("product");
    expect(displayLens("design", "product")).toBe("design");
  });
});
