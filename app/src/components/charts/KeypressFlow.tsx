"use client";
import { useEffect, useMemo, useState } from "react";
import { HOPS, STAGES, type Knobs } from "../../../labs/charts/keypress/data";

/**
 * A flow of hops from finger to glass, each drawn to its share of the total
 * latency. The knobs change the hardware-dependent hops; the total is the
 * sum of the typical values, and the two frame-sized hops show why refresh
 * rate matters more than anything an app can do.
 */
export function KeypressFlow() {
  const [k, setK] = useState<Knobs>({ pollHz: 125, refreshHz: 60, work: "typical", panel: "typical" });
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("focus"); if (f && HOPS.some((h) => h.id === f)) setOpen(f); }, []);
  const rows = useMemo(() => HOPS.map((h) => ({ ...h, value: h.ms(k) })), [k]);
  const total = rows.reduce((a, r) => a + r.value, 0);
  const set = <K extends keyof Knobs>(key: K, v: Knobs[K]) => setK((s) => ({ ...s, [key]: v }));
  const sel = rows.find((r) => r.id === open);

  return (
    <div className="kp">
      <div className="kp-knobs">
        <Knob label="Keyboard polling" value={k.pollHz} options={[125, 250, 500, 1000]} fmt={(v) => `${v} Hz`} onChange={(v) => set("pollHz", v)} />
        <Knob label="Display refresh" value={k.refreshHz} options={[60, 120, 144, 240]} fmt={(v) => `${v} Hz`} onChange={(v) => set("refreshHz", v)} />
        <Knob label="Page work" value={k.work} options={["light", "typical", "heavy"] as const} fmt={(v) => v} onChange={(v) => set("work", v)} />
        <Knob label="Panel" value={k.panel} options={["fast", "typical", "slow"] as const} fmt={(v) => (v === "fast" ? "OLED" : v === "typical" ? "good IPS" : "old LCD")} onChange={(v) => set("panel", v)} />
      </div>
      <p className="kp-total">
        <strong>{total.toFixed(0)} ms</strong> from finger to glass with these settings. The display alone is <strong>{rows.filter((r) => r.stage === "display").reduce((a, r) => a + r.value, 0).toFixed(0)} ms</strong> of that.
      </p>
      <div className="kp-flow" role="list" aria-label="Hops from keypress to pixel, widths proportional to latency">
        {STAGES.map((s) => {
          const hs = rows.filter((r) => r.stage === s.id);
          const share = hs.reduce((a, r) => a + r.value, 0) / total;
          return (
            <div key={s.id} className="kp-stage" style={{ flexGrow: share, flexBasis: 0 }}>
              <div className="kp-stage-label">{s.label}</div>
              <div className="kp-hops">
                {hs.map((h) => (
                  <button key={h.id} type="button" role="listitem" className={`kp-hop${open === h.id ? " is-open" : ""}`} style={{ flexGrow: h.value, flexBasis: 0 }} onClick={() => setOpen(open === h.id ? null : h.id)} onMouseEnter={() => setOpen(h.id)} title={`${h.name}: ${h.value.toFixed(1)} ms`}>
                    <span className="kp-hop-ms">{h.value < 1 ? h.value.toFixed(1) : h.value.toFixed(0)}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="kp-panel" aria-live="polite">
        {sel ? (
          <>
            <p className="cst-panel-kicker">{STAGES.find((s) => s.id === sel.stage)?.label} · typically {sel.range}</p>
            <h2 className="cst-panel-title">{sel.name} · {sel.value.toFixed(1)} ms</h2>
            <p className="cst-panel-what">{sel.what}</p>
            {sel.note && <p className="cst-panel-why">{sel.note}</p>}
          </>
        ) : (
          <>
            <h2 className="cst-panel-title">Hover a hop</h2>
            <p className="cst-panel-what">Twelve hops, drawn to their share of the total. Change the knobs and watch which ones move. Notice that the code you write is two of the twelve, and the display is three.</p>
          </>
        )}
      </div>
      <ol className="kp-list">
        {rows.map((r, i) => (
          <li key={r.id}><span className="kp-list-n">{i + 1}</span> <span className="kp-list-name">{r.name}</span> <span className="kp-list-ms">{r.value.toFixed(1)} ms</span></li>
        ))}
      </ol>
    </div>
  );
}

function Knob<T extends string | number>({ label, value, options, fmt, onChange }: { label: string; value: T; options: readonly T[]; fmt: (v: T) => string; onChange: (v: T) => void }) {
  return (
    <div className="kp-knob" role="group" aria-label={label}>
      <span className="kp-knob-label">{label}</span>
      <div className="kp-knob-opts">
        {options.map((o) => (
          <button key={String(o)} type="button" aria-pressed={o === value} onClick={() => onChange(o)}>{fmt(o)}</button>
        ))}
      </div>
    </div>
  );
}
