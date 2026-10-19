import { describe, it, expect } from "vitest";
import { REFRESH, SCENARIOS, STAGES, framesMissed } from "../../labs/charts/frame-budget/data";

// Chart 35's copy and facts quote these sums, so they are pinned here.
const total = (id: string) => { const s = SCENARIOS.find((x) => x.id === id)!; return STAGES.reduce((a, st) => a + s.ms[st.id], 0); };
const [f60, f120] = REFRESH.map((r) => r.ms);

describe("frame budget", () => {
  it("has the two deadlines", () => {
    expect(f60.toFixed(1)).toBe("16.7");
    expect(f120.toFixed(1)).toBe("8.3");
  });
  it("counts the frames a slow frame costs", () => {
    expect(framesMissed(16, f60)).toBe(0);
    expect(framesMissed(17, f60)).toBe(1);
    expect(framesMissed(36, f60)).toBe(2);
    expect(framesMissed(57, f120)).toBe(6);
  });
  it("keeps the scenarios on the side of the line the copy says", () => {
    expect(total("typing")).toBe(11); // fits 60 with 5.7 to spare, misses 120 by 2.7
    expect((f60 - total("typing")).toFixed(1)).toBe("5.7");
    expect((total("typing") - f120).toFixed(1)).toBe("2.7");
    expect(total("top")).toBeGreaterThan(f120); // "just over the line at 120"
    expect(total("top")).toBeLessThan(f120 + 0.5);
    expect(framesMissed(total("transform"), f120)).toBe(0);
    expect(SCENARIOS.find((s) => s.id === "thrash")!.ms.layout).toBe(28); // web.dev's worked example
    expect(framesMissed(total("thrash"), f60)).toBeGreaterThan(0);
  });
});
