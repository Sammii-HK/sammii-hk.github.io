"use client";
import type { Lens } from "../../../common/data/projects";

/**
 * The H1, split into words so the three motion languages can choreograph
 * a change. Remounting on text change (key) drives the enter animation in
 * CSS; the per-word --i index gives each language its own stagger order.
 *
 *   design  → words rise on a spring, left to right
 *   ai      → words assemble in an interleaved order (recomposition)
 *   product → words slide into their slot, linear, left to right
 */
export function Headline({
  text,
  motion,
  as: Tag = "h1",
  className = "",
}: {
  text: string;
  motion: Lens;
  as?: "h1" | "p";
  className?: string;
}) {
  const words = text.split(" ");
  const n = words.length;
  // AI: interleaved order so the line visibly recomposes rather than types.
  const order = (i: number) => (motion === "ai" ? (i * 5) % n : i);
  return (
    <Tag className={`lab-headline ${className}`} data-motion={motion} key={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="lab-word" style={{ ["--i" as string]: order(i), ["--n" as string]: n }}>
          {w}
          {i < n - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
