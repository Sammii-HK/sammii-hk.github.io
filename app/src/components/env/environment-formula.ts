// The cursor colour formula, verbatim from gradient-creator.ts, factored so it
// can be written to CSS custom properties instead of React state.
//
//   xPc: 0..100  (pointer X doubled across the viewport, clamped)
//   yPc: 0..100  (pointer Y)
//   t:   seconds (performance.now() / 1000)
//   r = f(xPc), g = f(yPc), b = 255 - r  — the relationship the logo, the
//   background and the follower all share.
//
// Parity rule for Phase 2B: every number here must match the pre-refactor
// output for the same inputs. Do not "improve" the colour model in this file.

const clamp100 = (n: number) => Math.max(0, Math.min(100, n));

/** Channel from a 0..100 value, floored, capped at 255. Same as gradient-creator's `c`. */
export const channel = (n: number) => Math.min(255, Math.floor((255 / 100) * clamp100(n)));

/** Logo channel: the original `colourCreator` (no lower clamp; callers pass 0..100). */
export const logoChannel = (n: number) => {
  const v = Math.floor((255 / 100) * n);
  return v < 255 ? v : 255;
};

export type EnvironmentVars = Record<`--env-${string}`, string>;

/** Ambient background: four drifting radial blobs. Mirrors backgroundGradientCreator. */
export function ambientVars(xPc: number, yPc: number, t: number): EnvironmentVars {
  const c = channel;
  const r1 = c(xPc + Math.sin(t * 0.41) * 20);
  const g1 = c(yPc + Math.cos(t * 0.33) * 18);
  const b1 = 255 - c(xPc);

  const r2 = 255 - c(xPc + Math.cos(t * 0.37) * 18);
  const g2 = c(yPc + Math.sin(t * 0.29) * 15);
  const b2 = c(xPc);

  const r3 = c(yPc + Math.sin(t * 0.43) * 20);
  const g3 = c(xPc + Math.cos(t * 0.31) * 16);
  const b3 = 255 - c(yPc);

  const r4 = c(100 - xPc + Math.sin(t * 0.22) * 25);
  const g4 = c(100 - yPc + Math.cos(t * 0.18) * 20);
  const b4 = c(xPc + Math.sin(t * 0.27) * 20);

  const x1 = (50 + Math.sin(t * 0.31) * 16).toFixed(1);
  const y1 = (0 + Math.abs(Math.sin(t * 0.23)) * 22).toFixed(1);
  const x2 = (8 + Math.cos(t * 0.41) * 12).toFixed(1);
  const y2 = (75 + Math.sin(t * 0.29) * 10).toFixed(1);
  const x3 = (92 + Math.sin(t * 0.37) * 12).toFixed(1);
  const y3 = (75 + Math.cos(t * 0.43) * 10).toFixed(1);
  const x4 = (50 + Math.cos(t * 0.19) * 32).toFixed(1);
  const y4 = (50 + Math.sin(t * 0.27) * 28).toFixed(1);

  return {
    "--env-c1": `${r1} ${g1} ${b1}`,
    "--env-c2": `${r2} ${g2} ${b2}`,
    "--env-c3": `${r3} ${g3} ${b3}`,
    "--env-c4": `${r4} ${g4} ${b4}`,
    "--env-p1": `${x1}% ${y1}%`,
    "--env-p2": `${x2}% ${y2}%`,
    "--env-p3": `${x3}% ${y3}%`,
    "--env-p4": `${x4}% ${y4}%`,
  };
}

/** Logo fill: three radials on lavender. Mirrors gradientCreator. */
export function logoVars(xPc: number, yPc: number): EnvironmentVars {
  const colour1 = logoChannel(xPc);
  const colour2 = logoChannel(yPc);
  const colour3 = 255 - logoChannel(xPc);
  return {
    "--env-logo-a": `${colour1} ${colour3} ${colour2}`,
    "--env-logo-b": `${colour3} ${colour2} ${colour1}`,
    "--env-logo-c": `${colour2} ${colour1} ${colour3}`,
  };
}

/** Everything the environment writes each frame. */
export function environmentVars(xPc: number, yPc: number, t: number): EnvironmentVars {
  return {
    "--env-x": xPc.toFixed(2),
    "--env-y": yPc.toFixed(2),
    "--env-t": t.toFixed(3),
    ...ambientVars(xPc, yPc, t),
    ...logoVars(xPc, yPc),
  };
}
