"use client";
import { useMemo, useRef } from "react";
import { selectedWorkModel } from "../../../lib/selected-work";
import { useLens } from "../lens/LensProvider";
import { Chapter } from "./Chapter";
import { Reference } from "./Reference";
import { useFlipOrder } from "./useFlipOrder";

/**
 * Selected Work: three chapters and a list of references, recomposed by the
 * COMMITTED lens (never the hover/focus preview). Each project is one keyed
 * wrapper for its whole life on the page, so a project changing tier is the
 * same DOM node travelling to its new slot (useFlipOrder) with its content
 * swapping from chapter to reference or back.
 */
export const SelectedWork = () => {
  const { committed } = useLens();
  const model = useMemo(() => selectedWorkModel(committed), [committed]);
  const listRef = useRef<HTMLDivElement>(null);
  useFlipOrder(listRef, model.order.join(","));

  return (
    <section id="work" aria-labelledby="work-heading" className="work" data-lens={committed}>
      <h2 id="work-heading" className="work-heading">
        Selected work
      </h2>
      <div ref={listRef} className="work-list">
        {model.chapters.map((c) => (
          <div key={c.project.id} data-flip={c.project.id} className="work-item" data-tier="featured">
            <Chapter key={`chapter-${c.project.id}`} chapter={c} lens={committed} />
          </div>
        ))}
        <ol className="references" aria-label="Supporting work">
          {model.references.map((r) => (
            <li key={r.project.id} data-flip={r.project.id} className="work-item" data-tier="supporting">
              <Reference key={`reference-${r.project.id}`} reference={r} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
