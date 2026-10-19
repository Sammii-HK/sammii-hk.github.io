import { describe, it, expect } from "vitest";
import { SCREENS, TARGETS, cssOf, guessCssPerIn, mmOf } from "../../labs/charts/touch-targets/data";

// Chart 37 quotes physical sizes in its copy and facts; these are the sums.
const at = (id: string) => SCREENS.find((s) => s.id === id)!.cssPerIn;

describe("touch targets in millimetres", () => {
  it("converts CSS pixels through each screen's density", () => {
    expect(at("iphone")).toBeCloseTo(153.33, 2); // 460 ppi at 3x
    expect(at("pixel")).toBeCloseTo(163.05, 2); // 428 ppi at 2.625
    expect(at("macbook")).toBeCloseTo(128.63, 2); // 224 ppi shown at 1470 wide
    expect(at("monitor")).toBeCloseTo(91.79, 2); // 1920 x 1080 over 24 inches
    expect(mmOf(96, 96)).toBeCloseTo(25.4);
  });
  it("matches the figures the page quotes", () => {
    expect(mmOf(24, at("iphone")).toFixed(1)).toBe("4.0");
    expect(mmOf(44, at("iphone")).toFixed(1)).toBe("7.3");
    expect(mmOf(44, at("monitor")).toFixed(1)).toBe("12.2");
    expect(mmOf(48, 160).toFixed(1)).toBe("7.6");
    expect(mmOf(48, at("pixel")).toFixed(1)).toBe("7.5");
    expect(Math.round(cssOf(9.2, at("iphone")))).toBe(56);
    expect(Math.round(cssOf(9.6, at("iphone")))).toBe(58);
  });
  it("uses the guideline sizes", () => {
    expect(TARGETS.map((t) => t.css)).toEqual([24, 44, 44, 48]);
  });
  it("guesses a density before calibration", () => {
    expect(guessCssPerIn(true, 3).cssPerIn).toBe(160);
    expect(guessCssPerIn(false, 2).cssPerIn).toBe(128);
    expect(guessCssPerIn(false, 1).cssPerIn).toBe(96);
  });
});
