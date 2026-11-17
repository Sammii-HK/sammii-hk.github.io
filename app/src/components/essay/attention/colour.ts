/**
 * Prism's colour function: a point on the page (0–100 on each axis) to a
 * soft RGB value, floored at 140 so nothing goes muddy. `t` adds a slow drift.
 * Copied from Prism's primitives so the essay runs on the real system.
 */
export const pastelColour = (xPc: number, yPc: number, t: number = 0) => {
  const cv = (n: number) => 140 + Math.floor((115 / 100) * Math.max(0, Math.min(100, n)));
  const rPc = Math.max(0, Math.min(100, xPc + Math.sin(t * 1.1) * 28));
  const gPc = Math.max(0, Math.min(100, yPc + Math.cos(t * 0.7) * 22));
  const bPc = 100 - rPc;
  return { r: cv(rPc), g: cv(gPc), b: cv(bPc) };
};
