"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { lensHref } from "../../../lib/lenses";
import { LENS_NAV_LABEL, LENS_ORDER, LENS_SHORT } from "./lens-copy";
import { useLens } from "./LensProvider";

/**
 * The condensed lens navigation. Shares LensProvider state with the hero, so
 * selection here is the same selection. Fixed to the top and revealed once
 * the hero's sentence (`#hero-lenses`) has left the viewport; hidden copies
 * are made inert with visibility so they are never phantom tab stops.
 * Always one line: below 640px the lens labels shorten and the lens group
 * scrolls horizontally inside the line.
 */
export function LensNav() {
  const { committed, preview, display, commit, previewOn, previewOff } = useLens();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const target = document.getElementById("hero-lenses");
    if (!target || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0), {
      rootMargin: "0px 0px 0px 0px",
      threshold: 0,
    });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <nav className="lens-nav" aria-label="Lens" data-shown={shown ? "" : undefined} data-motion={display}>
      <a href="/" className="lens-nav-wordmark">
        SAMMII
      </a>
      <div className="lens-nav-lenses">
        {LENS_ORDER.map((lens) => {
          const state = preview === lens ? "preview" : committed === lens ? "committed" : "idle";
          return (
            <a
              key={lens}
              href={lensHref(lens)}
              className="lens-phrase lens-nav-phrase"
              data-lens={lens}
              data-state={state}
              data-motion={display}
              aria-current={committed === lens ? "true" : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                commit(lens);
              }}
              onMouseEnter={() => previewOn(lens)}
              onMouseLeave={previewOff}
              onFocus={() => previewOn(lens)}
              onBlur={previewOff}
            >
              <span className="lens-long">{LENS_NAV_LABEL[lens]}</span>
              <span className="lens-short" aria-hidden="true">{LENS_SHORT[lens]}</span>
            </a>
          );
        })}
      </div>
      <a href="https://labs.sammii.dev" className="lens-nav-labs">
        Labs <ArrowUpRight size={12} strokeWidth={2} aria-hidden="true" />
      </a>
    </nav>
  );
}
