"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import DATA from "../../../labs/charts/llm-latency/data.json";

/**
 * Where an LLM call spends its time, from real streamed calls to a small
 * model on my Mac mini (scripts/labs/llm_latency.py). The bar is one real
 * call, the median by time to first token, with every streamed chunk drawn
 * where it arrived; the table is the medians. The replay plays the same
 * call back at its recorded timings twice: once behind a spinner, once
 * streamed.
 */
type Phases = { connect: number; send: number; queue: number | null; load: number; prefill: number; ttft: number; stream: number; total: number; promptTokens: number; outputTokens: number; chunks: number; gap: number; tps: number };
type Cond = { n: number; median: Phases; min: { ttft: number; total: number }; max: { ttft: number; total: number }; example: { phases: Phases; chunks: [number, string][] } };
const C = DATA.conditions as unknown as Record<string, Cond>;

const CONDS = [
  { id: "short", label: "A short question", what: "A one-line question, about 50 prompt tokens." },
  { id: "long", label: "A long document", what: `One of my blog posts to summarise: ${C.long?.median.promptTokens.toLocaleString("en-GB")} prompt tokens.` },
  { id: "cached", label: "The same document again", what: "The identical long prompt, sent again, so the server can reuse the work it did reading it." },
  { id: "cold", label: "A cold start", what: "A call that found the model unloaded, because another job on the same machine had pushed it out of memory." },
].filter((c) => C[c.id]);

const PHASES = [
  { id: "connect", name: "Connect and send", note: "Opening the connection and sending the request. On the same machine it is under a millisecond; to a hosted API it is a DNS lookup, a TCP and a TLS handshake first, tens to hundreds of milliseconds." },
  { id: "queue", name: "Queue", note: "Time the server held the request without working on it: scheduling, and waiting behind another request for the same model. On a busy shared server this is the least predictable part of a call." },
  { id: "load", name: "Model load", note: "Reading the weights into memory. Zero when the model is already loaded; tens of seconds when it is not and the machine is short of memory." },
  { id: "prefill", name: "Prefill", note: "Reading the prompt. Every prompt token goes through the model before the first new one can be produced. It grows with the prompt: a short question takes a moment, a few thousand tokens take seconds, unless the server has the prompt cached." },
  { id: "stream", name: "Streaming", note: "One token at a time, each a full pass through the model. The rate barely changes with the prompt; the length of the answer decides how long this takes." },
] as const;

const ms = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)} s` : v >= 10 ? `${Math.round(v)} ms` : `${v.toFixed(1)} ms`);
const seg = (p: Phases) => [
  { id: "connect", v: p.connect + p.send },
  { id: "queue", v: p.queue ?? 0 },
  { id: "load", v: p.load },
  { id: "prefill", v: p.prefill },
];

export function LlmLatency() {
  const [cid, setCid] = useState(CONDS[0].id);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("focus"); if (f && C[f]) setCid(f); else if (f && PHASES.some((p) => p.id === f)) setOpen(f); }, []);
  const cond = C[cid];
  const ex = cond.example.phases;
  const chunks = cond.example.chunks;
  const sel = PHASES.find((p) => p.id === open);
  const pre = seg(ex);
  const preTotal = pre.reduce((a, s) => a + s.v, 0);
  const pct = (v: number, of: number) => `${Math.max(0, (v / of) * 100)}%`;

  return (
    <div className="kp ll">
      <div className="kp-knobs">
        <div className="kp-knob" role="group" aria-label="Call">
          <span className="kp-knob-label">The call</span>
          <div className="kp-knob-opts">{CONDS.map((c) => <button key={c.id} type="button" aria-pressed={c.id === cid} onClick={() => setCid(c.id)}>{c.label}</button>)}</div>
        </div>
      </div>
      <p className="kp-total">
        First token after <strong>{ms(ex.ttft)}</strong>, the whole answer after <strong>{ms(ex.total)}</strong>. Behind a spinner, that is {ms(ex.total)} of nothing.
      </p>
      <p className="jd-note">{CONDS.find((c) => c.id === cid)?.what} {cond.n} calls; this is the median one by time to first token. {ex.outputTokens} tokens out at {ex.tps} a second.</p>

      <div className="ll-track-wrap">
        <span className="kp-knob-label">The whole call, {ms(ex.total)}</span>
        <div className="ll-track" role="img" aria-label={`Waiting ${ms(ex.ttft)} for the first token, then ${chunks.length} chunks over ${ms(ex.stream)}`}>
          {(() => { let at = 0; return pre.map((s) => { const el = <button key={s.id} type="button" className={`ll-seg is-${s.id}${open === s.id ? " is-open" : ""}`} style={{ left: pct(at, ex.total), width: pct(s.v, ex.total) }} onMouseEnter={() => setOpen(s.id)} onFocus={() => setOpen(s.id)} aria-label={`${s.id} ${ms(s.v)}`} />; at += s.v; return el; }); })()}
          <button type="button" className={`ll-seg is-stream${open === "stream" ? " is-open" : ""}`} style={{ left: pct(ex.ttft, ex.total), width: pct(ex.stream, ex.total) }} onMouseEnter={() => setOpen("stream")} onFocus={() => setOpen("stream")} aria-label={`streaming ${ms(ex.stream)}`}>
            {chunks.map((c, i) => <i key={i} style={{ left: pct(c[0] - ex.ttft, ex.stream) }} />)}
          </button>
          <span className="ll-mark" style={{ left: pct(ex.ttft, ex.total) }}><em>first token</em></span>
        </div>
        <span className="kp-knob-label">The wait before the first token, {ms(ex.ttft)}, zoomed</span>
        <div className="ll-track is-zoom">
          {(() => { let at = 0; return pre.map((s) => { const el = <button key={s.id} type="button" className={`ll-seg is-${s.id}${open === s.id ? " is-open" : ""}`} style={{ left: pct(at, preTotal), width: pct(s.v, preTotal) }} onMouseEnter={() => setOpen(s.id)} onFocus={() => setOpen(s.id)} aria-label={`${s.id} ${ms(s.v)}`}>{s.v / preTotal > 0.12 && <span>{PHASES.find((p) => p.id === s.id)?.name} {ms(s.v)}</span>}</button>; at += s.v; return el; }); })()}
        </div>
        <ul className="ll-legend">
          {PHASES.map((p) => <li key={p.id}><button type="button" className={open === p.id ? "is-on" : ""} onMouseEnter={() => setOpen(p.id)} onFocus={() => setOpen(p.id)} onClick={() => setOpen(p.id)}><span className={`ll-key is-${p.id}`} />{p.name} <b>{ms(p.id === "connect" ? ex.connect + ex.send : p.id === "stream" ? ex.stream : (ex[p.id] ?? 0))}</b></button></li>)}
        </ul>
      </div>

      <div className="kp-panel" aria-live="polite">
        {sel ? (<><p className="cst-panel-kicker">{CONDS.find((c) => c.id === cid)?.label}</p><h2 className="cst-panel-title">{sel.name}</h2><p className="cst-panel-what">{sel.note}</p></>) : (<><h2 className="cst-panel-title">Hover a phase</h2><p className="cst-panel-what">Everything before the marker is waiting; everything after it is the answer arriving, one tick per streamed chunk at the moment it reached the client. Switch to the long document and the wait grows, because the model has to read it all first. Send it again and the wait nearly disappears.</p></>)}
      </div>

      <Replay chunks={chunks} total={ex.total} label={CONDS.find((c) => c.id === cid)!.label.toLowerCase()} />

      <div className="ll-table-wrap">
        <table className="jc-table ll-table">
          <caption className="cw-caption">Medians per condition, milliseconds</caption>
          <thead><tr><th>Call</th><th>Calls</th><th>Prompt</th><th>Queue</th><th>Load</th><th>Prefill</th><th>First token</th><th>Streaming</th><th>Total</th><th>Tokens/s</th></tr></thead>
          <tbody>
            {CONDS.map((c) => { const m = C[c.id].median; return (
              <tr key={c.id} className={c.id === cid ? "is-on" : ""}><td>{c.label}</td><td>{C[c.id].n}</td><td>{Math.round(m.promptTokens).toLocaleString("en-GB")}</td><td>{Math.round(m.queue ?? 0)}</td><td>{Math.round(m.load).toLocaleString("en-GB")}</td><td>{Math.round(m.prefill).toLocaleString("en-GB")}</td><td>{Math.round(m.ttft).toLocaleString("en-GB")}</td><td>{Math.round(m.stream).toLocaleString("en-GB")}</td><td>{Math.round(m.total).toLocaleString("en-GB")}</td><td>{m.tps.toFixed(1)}</td></tr>
            ); })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** The same recorded call played back twice, at its real timings. */
function Replay({ chunks, total, label }: { chunks: [number, string][]; total: number; label: string }) {
  const [t, setT] = useState<number | null>(null);
  const [speed, setSpeed] = useState(1);
  const raf = useRef<number>();
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  useEffect(() => { if (raf.current) cancelAnimationFrame(raf.current); setT(null); }, [chunks]);
  const play = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const start = performance.now();
    const tick = () => {
      const now = (performance.now() - start) * speed;
      setT(Math.min(now, total));
      if (now < total) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const shown = useMemo(() => (t === null ? "" : chunks.filter((c) => c[0] <= t).map((c) => c[1]).join("")), [t, chunks]);
  const full = useMemo(() => chunks.map((c) => c[1]).join(""), [chunks]);
  const done = t !== null && t >= total;
  const first = chunks[0]?.[0] ?? 0;
  return (
    <div className="ll-replay">
      <div className="ll-replay-head">
        <button type="button" className="jd-btn" onClick={play}>{t === null ? `Replay ${label}` : done ? "Replay again" : "Restart"}</button>
        <div className="bo-toggle" role="group" aria-label="Replay speed">{[1, 4].map((s) => <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>{s === 1 ? "real time" : "×4"}</button>)}</div>
        <span className="ll-clock" aria-live="off">{t === null ? "0.0 s" : `${(t / 1000).toFixed(1)} s`}</span>
      </div>
      <div className="ll-panes">
        <section className="ll-pane" aria-label="Behind a spinner">
          <p className="kp-knob-label">Behind a spinner</p>
          <div className="ll-out">{t === null ? <span className="ll-hint">Press replay.</span> : done ? full : <span className="ll-wait"><span className="ll-spin" aria-hidden="true" />Waiting… {(t / 1000).toFixed(1)} s</span>}</div>
        </section>
        <section className="ll-pane" aria-label="Streamed">
          <p className="kp-knob-label">Streamed</p>
          <div className="ll-out">{t === null ? <span className="ll-hint">Press replay.</span> : t < first ? <span className="ll-wait"><span className="ll-caret" aria-hidden="true" />{(t / 1000).toFixed(1)} s</span> : <>{shown}{!done && <span className="ll-caret" aria-hidden="true" />}</>}</div>
        </section>
      </div>
    </div>
  );
}
