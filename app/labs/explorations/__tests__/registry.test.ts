import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { EXPLORATIONS, explorationHref, explorationJsonLd, getRelatedExplorations } from "../registry";

const runtime = resolve(process.cwd(), "public/exploration-runtime");

describe("standalone explorations", () => {
  it("retains all 15 independently addressable models and valid related paths", () => {
    expect(EXPLORATIONS).toHaveLength(15);
    expect(new Set(EXPLORATIONS.map((item) => item.slug)).size).toBe(15);
    expect(new Set(EXPLORATIONS.map((item) => item.id)).size).toBe(15);
    for (const item of EXPLORATIONS) {
      expect(item.slug).toMatch(/^[a-z]+(?:-[a-z0-9]+)*$/);
      expect(getRelatedExplorations(item)).toHaveLength(item.relatedIds.length);
      expect(getRelatedExplorations(item).some((other) => other.id === item.id)).toBe(false);
    }
  });

  it("every route has explanatory HTML data, working-model wrapper and real large cover", () => {
    for (const item of EXPLORATIONS) {
      expect(item.intro.length).toBeGreaterThan(70);
      expect(item.instructions.length).toBeGreaterThanOrEqual(3);
      expect(item.explanation.length).toBeGreaterThan(90);
      expect(item.limitations.length).toBeGreaterThan(90);
      expect(item.readouts.length).toBeGreaterThan(0);
      expect(item.sources.length).toBeGreaterThan(0);
      expect(item.sources.every((source) => new URL(source.url).protocol === "https:")).toBe(true);
      const html = readFileSync(resolve(runtime, item.slug, "index.html"), "utf8");
      expect(html).toContain(`data-mode="${item.id}"`);
      expect(html).toContain(`data-family="${item.moduleFamily}"`);
      expect(html).toContain('content="noindex,follow"');
      expect(html).toContain(explorationHref(item.slug));
      expect(html).not.toMatch(/\/\*__(MODEL|APP|MODULE_[A-Z]+)__\*\//);
      const png = readFileSync(resolve(runtime, "cards", `${item.slug}.png`));
      expect(png.subarray(1, 4).toString()).toBe("PNG");
      expect(png.readUInt32BE(16)).toBe(1600);
      expect(png.readUInt32BE(20)).toBe(900);
    }
  });

  it("does not invent publication dates or article rich-result claims for model pages", () => {
    for (const item of EXPLORATIONS) {
      const schema = explorationJsonLd(item);
      expect(schema["@graph"][0]["@type"]).toBe("WebPage");
      expect(schema["@graph"][0].url).toBe(explorationHref(item.slug));
      const json = JSON.stringify(schema);
      expect(json).not.toMatch(/datePublished|dateModified|aggregateRating|reviewRating/);
      expect(json).toContain('"name":"Sammii Kellow"');
    }
  });

  it("ships the reviewed models byte-for-byte with their provenance and licences", () => {
    const manifest = JSON.parse(readFileSync(resolve(runtime, "source-manifest.json"), "utf8"));
    expect(manifest.files).toHaveLength(20);
    for (const entry of manifest.files) {
      const asset = resolve(runtime, entry.runtime);
      expect(existsSync(asset)).toBe(true);
      expect(createHash("sha256").update(readFileSync(asset)).digest("hex")).toBe(entry.sha256);
    }
    expect(readFileSync(resolve(runtime, "sources/D3-LICENSE.txt"), "utf8")).toContain("Redistribution");
  });
});
