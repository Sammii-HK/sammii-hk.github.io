"use client";
import { ArrowDown } from "lucide-react";
import { LensHeadline } from "../lens/LensHeadline";
import { LensPhrase } from "../lens/LensPhrase";
import { LENS_HEADLINE, LENS_PHRASE, SUPPORT } from "../lens/lens-copy";
import { useLens } from "../lens/LensProvider";

/**
 * The hero, promoted from hero-lab Composition A (quiet editorial):
 * eyebrow, the committed lens's headline, the supporting sentence with the
 * three disciplines as live phrases, and a quiet route to the work.
 * displayLens = preview ?? committed, so the resting headline always belongs
 * to the selected lens.
 */
export const Hero = () => {
  const { display, instant } = useLens();
  return (
    <section id="hero" aria-labelledby="hero-heading" className="hero">
      <p className="hero-eyebrow">Sammii Kellow</p>
      <div id="hero-heading">
        <LensHeadline text={LENS_HEADLINE[display]} motion={display} instant={instant} />
      </div>
      <p className="hero-support" id="hero-lenses">
        {SUPPORT.map((seg, i) =>
          seg === "design" || seg === "ai" || seg === "product" ? (
            <LensPhrase key={i} lens={seg}>
              {LENS_PHRASE[seg]}
            </LensPhrase>
          ) : (
            <span key={i}>
              {seg.split("\n").map((part, j, parts) => (
                <span key={j}>
                  {part}
                  {j < parts.length - 1 && <br />}
                </span>
              ))}
            </span>
          ),
        )}
      </p>
      <a href="#work" className="hero-route">
        Selected work <ArrowDown size={11} strokeWidth={2} aria-hidden="true" />
      </a>
    </section>
  );
};
