"use client";
import type { Lens } from "../../../common/data/projects";

/**
 * The lens headline, split into words so the motion languages can choreograph
 * a change. Remounting on text change (key) drives the CSS entrance; --i gives
 * each language its stagger order (ai interleaves so the line recomposes).
 * `instant` suppresses the choreography for URL-applied state.
 */
export function LensHeadline({ text, motion, instant }: { text: string; motion: Lens; instant: boolean }) {
  const words = text.split(" ");
  const n = words.length;
  const order = (i: number) => (motion === "ai" ? (i * 5) % n : i);
  return (
    <h1 className="hero-headline" data-motion={motion} data-instant={instant ? "" : undefined} key={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="hero-word" style={{ ["--i" as string]: order(i) }}>
          {w}
          {i < n - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  );
}
