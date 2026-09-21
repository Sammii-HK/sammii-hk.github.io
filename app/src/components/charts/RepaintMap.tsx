"use client";
import { useMemo, useState } from "react";
import { COSTS, PROPS, type Cost } from "../../../labs/charts/repaint/data";

/**
 * The pipeline as four boxes and every property as a chip in the column of
 * what it triggers. Pick a chip (or type a property) and the stages it
 * forces light up in order. The point of the chart is the shape: most of
 * the language lives in the expensive column and two properties live in
 * the cheap one.
 */
const STAGES = ["Style", "Layout", "Paint", "Composite"] as const;
const triggers = (c: Cost) => (c === "layout" ? ["Style", "Layout", "Paint", "Composite"] : c === "paint" ? ["Style", "Paint", "Composite"] : ["Style", "Composite"]);

export function RepaintMap() {
  const [pick, setPick] = useState<string | null>("top");
  const [q, setQ] = useState("");
  const sel = PROPS.find((p) => p.name === pick) ?? null;
  const lit = sel ? new Set(triggers(sel.cost)) : new Set<string>();
  const filtered = useMemo(() => PROPS.filter((p) => !q || p.name.includes(q.toLowerCase().trim())), [q]);
  const counts = COSTS.map((c) => PROPS.filter((p) => p.cost === c.id).length);

  return (
    <div className="rp">
      <ol className="rp-pipeline" aria-label="The rendering pipeline">
        {STAGES.map((s, i) => (
          <li key={s} className={`rp-stage${lit.has(s) ? " is-lit" : ""}`}>
            <span className="rp-stage-n">{i + 1}</span>
            <span className="rp-stage-name">{s}</span>
          </li>
        ))}
      </ol>
      <div className="rp-panel" aria-live="polite">
        {sel ? (
          <>
            <p className="cst-panel-kicker">{COSTS.find((c) => c.id === sel.cost)?.label} · {sel.group}</p>
            <h2 className="cst-panel-title"><code>{sel.name}</code></h2>
            <p className="cst-panel-what">{COSTS.find((c) => c.id === sel.cost)?.what}</p>
            {sel.note && <p className="cst-panel-why">{sel.note}</p>}
          </>
        ) : (
          <>
            <h2 className="cst-panel-title">Pick a property</h2>
            <p className="cst-panel-what">The stages it forces light up above.</p>
          </>
        )}
      </div>
      <label className="rp-search">
        <span className="rp-search-label">Find a property</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="transform, margin, box-shadow…" />
      </label>
      <div className="rp-columns">
        {COSTS.map((c, i) => (
          <section key={c.id} className={`rp-col is-${c.id}`} aria-labelledby={`rp-${c.id}`}>
            <h3 id={`rp-${c.id}`} className="rp-col-title">{c.label} <span className="rp-col-count">{counts[i]}</span></h3>
            <p className="rp-col-what">{triggers(c.id).join(" → ")}</p>
            <ul className="rp-chips">
              {filtered.filter((p) => p.cost === c.id).map((p) => (
                <li key={p.name}>
                  <button type="button" className={`rp-chip${pick === p.name ? " is-on" : ""}`} onClick={() => setPick(p.name)} onMouseEnter={() => setPick(p.name)}>{p.name}</button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
