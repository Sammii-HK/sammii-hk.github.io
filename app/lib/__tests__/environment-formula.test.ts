import { describe, it, expect } from "vitest";
import { backgroundGradientCreator, gradientCreator } from "../../common/scripts/gradient-creator";
import { ambientVars, logoVars } from "../../src/components/env/environment-formula";

// Phase 2B parity gate: the CSS-variable formula must reproduce the original
// inline-style output exactly, for the same inputs, across the input space.

function composeAmbient(v: ReturnType<typeof ambientVars>) {
  return `
      radial-gradient(ellipse at ${v["--env-p1"]}, rgb(${v["--env-c1"]} / 15%), transparent 65%),
      radial-gradient(ellipse at ${v["--env-p2"]}, rgb(${v["--env-c2"]} / 15%), transparent 65%),
      radial-gradient(ellipse at ${v["--env-p3"]}, rgb(${v["--env-c3"]} / 15%), transparent 65%),
      radial-gradient(ellipse at ${v["--env-p4"]}, rgb(${v["--env-c4"]} / 11%), transparent 55%)
    `.trim();
}

function composeLogo(v: ReturnType<typeof logoVars>) {
  const ring = (c: string, at: string) => `radial-gradient(\n        circle at ${at},\n        rgb(${c} / 70%),\n        rgb(${c} / 0%) 70.71%\n      )`;
  return `${ring(v["--env-logo-a"], "50% 0")},\n      ${ring(v["--env-logo-b"], "6.7% 75%")},\n      ${ring(v["--env-logo-c"], "93.3% 75%")} lavender`;
}

const samples: [number, number, number][] = [];
for (const x of [0, 1, 12.5, 33.3, 50, 66.6, 87.5, 99, 100, 130]) // x can exceed 100 (pointer X is doubled) before clamping
  for (const y of [0, 0.4, 25, 50, 75, 99.9, 100])
    for (const t of [0, 0.016, 1, 12.34, 120, 3600.5]) samples.push([x, y, t]);

describe("environment formula parity", () => {
  it(`ambient background matches backgroundGradientCreator for ${samples.length} samples`, () => {
    for (const [x, y, t] of samples) {
      expect(composeAmbient(ambientVars(x, y, t)), `x=${x} y=${y} t=${t}`).toBe(backgroundGradientCreator(x, y, t).background);
    }
  });

  it("logo fill matches gradientCreator", () => {
    for (const [x, y] of samples) {
      if (x > 100) continue; // logo path only ever received 0..100
      expect(composeLogo(logoVars(x, y)), `x=${x} y=${y}`).toBe(gradientCreator(x, y).background);
    }
  });

  it("keeps the shared channel relationship r = f(x), g = f(y), b = 255 - r", () => {
    const v = ambientVars(40, 70, 0);
    const [r1, , b1] = v["--env-c1"].split(" ").map(Number);
    expect(b1).toBe(255 - Math.floor((255 / 100) * 40));
    expect(r1).toBe(Math.floor((255 / 100) * 40));
  });
});

// ── Phase 2F: lens behaviour parameters around the preserved formula ────────
import { environmentVars, IDENTITY_PARAMS } from "../../src/components/env/environment-formula";
import { LENS_ENVIRONMENT } from "../../src/components/env/lens-environment";

describe("lens environment parameters", () => {
  const still = { px: 50, py: 50, energy: 0 };
  it("identity params reproduce Phase 2B output exactly", () => {
    for (const [x, y, t] of samples.slice(0, 60)) {
      expect(ambientVars(x, y, t, IDENTITY_PARAMS, still)).toEqual(ambientVars(x, y, t));
    }
  });
  it("never touches the colour channels for any lens", () => {
    for (const lens of ["design", "ai", "product"] as const) {
      const base = ambientVars(40, 70, 12, IDENTITY_PARAMS, still);
      const withLens = ambientVars(40, 70, 12, { ...LENS_ENVIRONMENT[lens].params, rate: 1 }, { px: 10, py: 90, energy: 1 });
      for (const k of ["--env-c1", "--env-c2", "--env-c3", "--env-c4"] as const) expect(withLens[k]).toBe(base[k]);
    }
  });
  it("product eases rest positions toward a lattice and damps the drift", () => {
    const p = LENS_ENVIRONMENT.product.params;
    const v = ambientVars(0, 0, 0, { ...p, rate: 1 }, still);
    // blob 2 rests at x=8 originally; lattice 25 pulls it to 8 + (25-8)*0.7 = 19.9, plus the t=0 drift term cos(0)*12*0.6
    expect(v["--env-p2"].split(" ")[0]).toBe((8 + (25 - 8) * 0.7 + 12 * 0.6).toFixed(1) + "%");
    expect(p.drift).toBeLessThan(1);
  });
  it("ai leans blobs toward the pointer only while it moves", () => {
    const p = LENS_ENVIRONMENT.ai.params;
    const stillV = ambientVars(0, 0, 0, { ...p, rate: 1 }, { px: 0, py: 0, energy: 0 });
    const movingV = ambientVars(0, 0, 0, { ...p, rate: 1 }, { px: 0, py: 0, energy: 1 });
    const x = (k: string, v: Record<string, string>) => parseFloat(v[k]);
    expect(x("--env-p3", stillV)).toBe(92 + 0); // sin(0) = 0 drift
    expect(x("--env-p3", movingV)).toBeCloseTo(92 * (1 - p.converge), 1);
    expect(stillV).toEqual(ambientVars(0, 0, 0, IDENTITY_PARAMS, still)); // at rest ai equals parity
  });
  it("exposes pointer energy as a single custom property", () => {
    const v = environmentVars(0, 0, 0, IDENTITY_PARAMS, { px: 50, py: 50, energy: 0.42 });
    expect(v["--env-energy"]).toBe("0.420");
  });
});
