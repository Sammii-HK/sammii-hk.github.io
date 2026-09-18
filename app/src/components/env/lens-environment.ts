import type { Lens } from "../../../common/data/projects";
import type { EnvParams } from "./environment-formula";

/**
 * How each committed lens shapes the environment's BEHAVIOUR (Phase 2F).
 * Colour relationships are untouched; only these parameters differ.
 *
 *   design   things react     elastic pointer follow (a light spring with a
 *                             hint of overshoot), slightly livelier drift, and
 *                             --env-energy breathes the ambient layer while
 *                             the pointer moves
 *   ai       things form      blobs lean toward the pointer while it moves and
 *                             relax back when it stops (relationships briefly
 *                             become perceptible); slower, smoother follow
 *   product  things find      rest positions eased toward a regular lattice,
 *            their place      drift reduced, a critically damped follow with
 *                             no overshoot: composed, not rigid
 */
export type LensEnvironment = {
  params: EnvParams;
  /** pointer follow: exponential lerp factor per frame (null = use spring) */
  lerp: number | null;
  /** spring for the pointer follow, if `lerp` is null */
  spring?: { stiffness: number; damping: number };
};

export const LENS_ENVIRONMENT: Record<Lens, LensEnvironment> = {
  design: { params: { drift: 1.15, rate: 1.1, converge: 0, lattice: 0 }, lerp: null, spring: { stiffness: 0.14, damping: 0.68 } },
  ai: { params: { drift: 1, rate: 0.85, converge: 0.28, lattice: 0 }, lerp: 0.11 },
  product: { params: { drift: 0.6, rate: 0.8, converge: 0, lattice: 0.7 }, lerp: 0.22 },
};
