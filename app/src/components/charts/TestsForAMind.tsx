"use client";
import { useEffect, useState } from "react";
import { COLUMNS, ENTRIES, type Entry, type Who } from "../../../labs/charts/tests-for-a-mind/data";

/**
 * Tests for a mind on one axis: from the behaviour end, where a test
 * inspects what something says and does, to the experience end, where it
 * tries to look for whether anyone is there. Each entry sits in the column
 * of the evidence it actually inspects. The filter asks who could sit each
 * one; that is the whole argument, and the chart leaves it to the reader.
 */
const WHO_LABEL: Record<Who, string> = { machine: "a machine", animal: "an animal", person: "a person", any: "any system, in principle" };
const KIND_LABEL: Record<Entry["kind"], string> = { test: "Test", argument: "Argument", fiction: "Fiction", measure: "Measure" };
const FILTERS = ["all", "machine", "animal", "person"] as const;
type Filter = (typeof FILTERS)[number];

export function TestsForAMind() {
  const [who, setWho] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const f = q.get("focus");
    if (f && ENTRIES.some((e) => e.id === f)) setOpen(f);
    const w = q.get("who");
    const hit = FILTERS.find((x) => x === w);
    if (hit) setWho(hit);
  }, []);
  const applies = (e: Entry) => who === "all" || e.who.includes(who) || e.who.includes("any");
  const count = ENTRIES.filter(applies).length;

  return (
    <div className="tm">
      <div className="tm-controls">
        <div className="kp-knob" role="group" aria-label="Who could take it">
          <span className="kp-knob-label">Who could take it</span>
          <div className="kp-knob-opts">
            {FILTERS.map((f) => (
              <button key={f} type="button" aria-pressed={who === f} onClick={() => setWho(f)}>{f === "all" ? "show all" : WHO_LABEL[f]}</button>
            ))}
          </div>
        </div>
        <p className="tm-count" aria-live="polite">{who === "all" ? `${ENTRIES.length} tests, measures and arguments, ${Math.min(...ENTRIES.map((e) => e.year))} to ${Math.max(...ENTRIES.map((e) => e.year))}.` : `${count} of ${ENTRIES.length} could be given to ${WHO_LABEL[who]}.`}</p>
      </div>

      <div className="tm-axis" aria-hidden="true">
        <span className="tm-axis-end">Behaviour<em>what something does</em></span>
        <span className="tm-axis-line" />
        <span className="tm-axis-end is-right">Experience<em>whether anyone is there</em></span>
      </div>

      <p className="tm-axis-mobile" aria-hidden="true">From behaviour, what something does, at the top, to experience, whether anyone is there, at the bottom.</p>
      <ol className="tm-cols" aria-label="Five kinds of evidence, from behaviour to experience">
        {COLUMNS.map((c, ci) => {
          const items = ENTRIES.filter((e) => e.col === c.id).sort((a, b) => a.year - b.year);
          return (
            <li key={c.id} className="tm-col">
              <h3 className="tm-col-head"><span className="tm-col-n">{ci + 1}</span>{c.label}<em>{c.sub}</em></h3>
              <ul className="tm-cards">
                {items.map((e) => {
                  const on = applies(e);
                  const isOpen = open === e.id;
                  return (
                    <li key={e.id} className={`tm-card is-${e.kind}${on ? "" : " is-dim"}${isOpen ? " is-open" : ""}`}>
                      <button type="button" className="tm-card-head" aria-expanded={isOpen} aria-controls={`tm-${e.id}`} onClick={() => setOpen(isOpen ? null : e.id)}>
                        <span className="tm-card-kicker">{e.year} · {KIND_LABEL[e.kind]}{e.caveat ? " · contested" : ""}</span>
                        <span className="tm-card-name">{e.name}</span>
                        <span className="tm-card-line">{e.line}</span>
                        <span className="tm-card-who">{e.who.length ? e.who.map((w) => <span key={w}>{WHO_LABEL[w]}</span>) : <span>nobody: an argument</span>}</span>
                        {!on && who !== "all" && <span className="sr-only">Not something that can be given to {WHO_LABEL[who]}.</span>}
                      </button>
                      <div id={`tm-${e.id}`} className="tm-card-body" hidden={!isOpen}>
                        <p><strong>What it is after:</strong> {e.after.charAt(0).toUpperCase() + e.after.slice(1)}</p>
                        <p>{e.detail}</p>
                        {e.caveat && <p className="tm-card-caveat">{e.caveat}</p>}
                        <p className="tm-card-src">{e.src}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
      <p className="tm-legend">Each entry sits in the column of the evidence it inspects, which is a fact about its method, not a verdict on it. Solid cards are tests or measures used on real subjects; dashed is an argument; the double rule is fiction. Tap any card for what it is after, how it works, and its source.</p>
    </div>
  );
}
