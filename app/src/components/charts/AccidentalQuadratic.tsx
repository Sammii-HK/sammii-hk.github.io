"use client";
import { useMemo, useRef, useState } from "react";

/**
 * Big O as something you feel: a filtered list where each keystroke
 * checks whether every matching item is selected. Doing that with
 * Array.includes against the selected array is O(n·m), the most common
 * accidental quadratic in interface code; with a Set it is O(n). Both
 * inputs do the real work synchronously in the keystroke handler, as a
 * real filtered list would, and the time per keystroke is measured.
 */
const WORDS = ["amber", "basil", "cedar", "delta", "ember", "fjord", "gale", "heath", "iris", "juniper", "kestrel", "larch", "moss", "nettle", "ochre", "pine", "quartz", "rowan", "sage", "thistle", "umber", "vale", "willow", "yarrow", "zinc"];
type Item = { id: number; name: string };
function makeItems(n: number): Item[] { return Array.from({ length: n }, (_, i) => ({ id: i, name: `${WORDS[i % WORDS.length]} ${WORDS[(i * 7) % WORDS.length]} ${i}` })); }

const FRAME = 16.7, INSTANT = 100;

function Meter({ samples, label }: { samples: number[]; label: string }) {
  const max = Math.max(INSTANT * 1.2, ...samples);
  return (
    <div className="aq-meter" aria-label={`${label}: milliseconds per keystroke`}>
      <div className="aq-bars">
        {samples.map((s, i) => <span key={i} className={`aq-bar ${s > INSTANT ? "is-slow" : s > FRAME ? "is-mid" : ""}`} style={{ height: `${Math.max(2, Math.round((s / max) * 100))}%` }} title={`${s.toFixed(1)} ms`} />)}
      </div>
      <span className="aq-budget aq-budget--frame" style={{ bottom: `${(FRAME / max) * 100}%` }}><em>16 ms, one frame</em></span>
      <span className="aq-budget aq-budget--instant" style={{ bottom: `${(INSTANT / max) * 100}%` }}><em>100 ms, feels instant</em></span>
    </div>
  );
}

function Box({ title, items, selected, mode, complexity }: { title: string; items: Item[]; selected: number[]; mode: "includes" | "set"; complexity: string }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<{ item: Item; on: boolean }[]>([]);
  const [samples, setSamples] = useState<number[]>([]);
  const last = useRef(0);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const onChange = (v: string) => {
    setQ(v);
    const t0 = performance.now();
    const needle = v.toLowerCase();
    const out: { item: Item; on: boolean }[] = [];
    for (const item of items) {
      if (needle && !item.name.includes(needle)) continue;
      // the line that matters: one membership test per matching item
      const on = mode === "includes" ? selected.includes(item.id) : selectedSet.has(item.id);
      out.push({ item, on });
    }
    const ms = performance.now() - t0;
    last.current = ms;
    setRows(out.slice(0, 8));
    setSamples((s) => [...s.slice(-23), ms]);
  };
  const ms = last.current;
  return (
    <section className="aq-box">
      <h3 className="el-box-title">{title} <code className="aq-cx">{complexity}</code></h3>
      <input className="aq-input" type="search" placeholder="Type to filter…" value={q} onChange={(e) => onChange(e.target.value)} aria-label={`${title} filter`} autoComplete="off" spellCheck={false} />
      <p className="aq-read"><strong>{samples.length ? `${ms.toFixed(1)} ms` : "type to measure"}</strong>{samples.length ? (ms > INSTANT ? " per keystroke: the field lags behind your fingers" : ms > FRAME ? " per keystroke: drops frames while you type" : " per keystroke: under one frame") : ""}</p>
      <Meter samples={samples} label={title} />
      <ul className="aq-list">
        {rows.map(({ item, on }) => <li key={item.id} className={on ? "is-on" : ""}>{item.name}</li>)}
      </ul>
    </section>
  );
}

export function AccidentalQuadratic() {
  const [n, setN] = useState(40000);
  const items = useMemo(() => makeItems(n), [n]);
  const selected = useMemo(() => items.filter((i) => i.id % 2 === 0).map((i) => i.id), [items]);
  return (
    <div className="aq">
      <label className="cst-year">
        <span className="cst-year-label">Items in the list (half selected)</span>
        <input type="range" min={1000} max={100000} step={1000} value={n} onChange={(e) => setN(Number(e.target.value))} aria-valuetext={`${n} items`} />
        <output className="cst-year-value">{n.toLocaleString()}</output>
      </label>
      <div className="aq-grid">
        <Box title="selected.includes(id)" complexity="O(n · m)" items={items} selected={selected} mode="includes" />
        <Box title="selectedSet.has(id)" complexity="O(n)" items={items} selected={selected} mode="set" />
      </div>
      <p className="jd-note">Same list, same query, same render. The only difference is one line: an array <code>includes</code> walks the selected list for every item (n items × m selected), a <code>Set</code> answers in one step. Clear the box to search everything again; the worst keystroke is the first one, when every item matches.</p>
    </div>
  );
}
