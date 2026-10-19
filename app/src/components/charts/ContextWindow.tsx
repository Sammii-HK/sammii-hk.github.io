"use client";
import { useEffect, useMemo, useState } from "react";
import DATA from "../../../labs/charts/context-window/data.json";

/**
 * A context window, to scale: five window sizes against things measured in
 * the same unit. The repos and the blog are counted with tiktoken's
 * o200k_base by scripts/labs/context_window.py; the page, the short story
 * and the novel are word counts by definition times the tokens per word
 * measured on my blog's prose. On the to-scale axis the small windows are
 * slivers, which is the point; the log axis makes them readable.
 */
const WINDOWS = [
  { id: "8k", tokens: 8192, label: "8k", who: "GPT-4 at launch, March 2023" },
  { id: "32k", tokens: 32768, label: "32k", who: "GPT-4-32k, 2023" },
  { id: "128k", tokens: 128000, label: "128k", who: "GPT-4 Turbo (November 2023) and GPT-4o" },
  { id: "200k", tokens: 200000, label: "200k", who: "Claude 2.1 (November 2023) and the Claude models since" },
  { id: "1m", tokens: 1000000, label: "1M", who: "Gemini 1.5 Pro (2024) and GPT-4.1 (2025)" },
];

type Row = { id: string; name: string; sub: string; tokens: number; code?: number; kind: "estimate" | "measured" | "repo"; note: string };

const tpw = DATA.blog.tokensPerWord;
const ROWS: Row[] = [
  { id: "page", name: "A page", sub: `${DATA.estimates.page.words} words, estimated`, tokens: DATA.estimates.page.tokens, kind: "estimate", note: `A double-spaced manuscript page, by the publishing rule of thumb of ${DATA.estimates.page.words} words, at the ${tpw} tokens per word measured on my own prose.` },
  { id: "story", name: "A short story", sub: `${DATA.estimates.short_story.words.toLocaleString("en-GB")} words, estimated`, tokens: DATA.estimates.short_story.tokens, kind: "estimate", note: `The longest a short story can be under the Nebula Awards rules (fewer than ${DATA.estimates.short_story.words.toLocaleString("en-GB")} words), at ${tpw} tokens per word.` },
  { id: "novel", name: "A novel", sub: `${DATA.estimates.novel.words.toLocaleString("en-GB")} words, estimated`, tokens: DATA.estimates.novel.tokens, kind: "estimate", note: `The shortest book the Nebula rules call a novel (${DATA.estimates.novel.words.toLocaleString("en-GB")} words). Most published novels are longer, so treat this as the floor.` },
  { id: "blog", name: "My blog", sub: `all ${DATA.blog.posts} posts, measured`, tokens: DATA.blog.o200k_base, kind: "measured", note: `Every published post on sammii.dev, Markdown and code blocks included. The median post is ${DATA.blog.medianPost.toLocaleString("en-GB")} tokens.` },
  ...[...DATA.repos].sort((a, b) => a.o200k_base.total - b.o200k_base.total).map((r) => ({ id: r.id, name: r.name, sub: `${r.files.toLocaleString("en-GB")} files, measured`, tokens: r.o200k_base.total, code: r.o200k_base.code, kind: "repo" as const, note: `${r.what}. ${r.o200k_base.code.toLocaleString("en-GB")} tokens of code in ${r.codeFiles.toLocaleString("en-GB")} files, and ${r.o200k_base.other.toLocaleString("en-GB")} of content, docs and data. ${(r.bytes / 1e6).toFixed(1)} MB of text.` })),
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ukDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `${Math.round(n / 1e3)}k` : n.toLocaleString("en-GB"));
const pageTokens = DATA.estimates.page.tokens;

export function ContextWindow() {
  const [win, setWin] = useState(WINDOWS[4]);
  const [log, setLog] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("focus");
    const w = WINDOWS.find((x) => x.id === f);
    if (w) setWin(w);
    else if (f && ROWS.some((r) => r.id === f)) setOpen(f);
  }, []);
  const max = useMemo(() => Math.max(win.tokens, ...ROWS.map((r) => r.tokens)), [win]);
  const min = 100;
  const pos = (v: number) => (log ? (Math.log10(Math.max(min, v)) - Math.log10(min)) / (Math.log10(max) - Math.log10(min)) : v / max) * 100;
  const lunary = ROWS[ROWS.length - 1];
  const sel = ROWS.find((r) => r.id === open) ?? null;
  const fit = (r: Row) => (r.tokens <= win.tokens ? `fits ${Math.floor(win.tokens / r.tokens).toLocaleString("en-GB")}×` : `${(r.tokens / win.tokens).toFixed(1)} windows`);
  const ticks = log ? [100, 1e3, 1e4, 1e5, 1e6, 1e7].filter((t) => t <= max) : [0, 2.5e6, 5e6, 7.5e6, 1e7].filter((t) => t <= max);

  return (
    <div className="kp cw">
      <div className="kp-knobs">
        <div className="kp-knob" role="group" aria-label="Context window">
          <span className="kp-knob-label">Context window</span>
          <div className="kp-knob-opts">
            {WINDOWS.map((w) => <button key={w.id} type="button" aria-pressed={w.id === win.id} onClick={() => setWin(w)}>{w.label}</button>)}
          </div>
        </div>
        <div className="kp-knob" role="group" aria-label="Axis">
          <span className="kp-knob-label">Axis</span>
          <div className="kp-knob-opts">
            <button type="button" aria-pressed={!log} onClick={() => setLog(false)}>to scale</button>
            <button type="button" aria-pressed={log} onClick={() => setLog(true)}>log</button>
          </div>
        </div>
      </div>
      <p className="kp-total">
        A <strong>{win.label}</strong> window is {win.tokens.toLocaleString("en-GB")} tokens: about {Math.round(win.tokens / pageTokens).toLocaleString("en-GB")} pages. {lunary.tokens > win.tokens ? <>Lunary would need <strong>{Math.ceil(lunary.tokens / win.tokens).toLocaleString("en-GB")}</strong> of them, end to end.</> : null}
      </p>
      <div className="cw-chart" style={{ ["--win" as string]: `${pos(win.tokens)}%` }}>
        <div className="cw-axis" aria-hidden="true">
          <span className="cw-axis-track">
            {ticks.map((t) => <span key={t} className="cw-tick" style={{ left: `${pos(t)}%` }}>{t === 0 ? "0" : fmt(t)}</span>)}
            <span className={`cw-win-label${pos(win.tokens) < 15 ? " is-right" : ""}`}>{win.label} window</span>
          </span>
        </div>
        <ol className="cw-rows" aria-label={`Token counts against a ${win.label} window, ${log ? "log" : "linear"} axis`}>
          {ROWS.map((r) => (
            <li key={r.id} className={`cw-row is-${r.kind}${open === r.id ? " is-open" : ""}${r.tokens > win.tokens ? " is-over" : ""}`}>
              <span className="cw-name"><b>{r.name}</b><small>{r.sub}</small></span>
              <button type="button" className="cw-track" onMouseEnter={() => setOpen(r.id)} onFocus={() => setOpen(r.id)} onClick={() => setOpen(open === r.id ? null : r.id)} aria-label={`${r.name}: ${r.tokens.toLocaleString("en-GB")} tokens, ${fit(r)} in ${win.label}`}>
                <span className="cw-bar" style={{ width: `${Math.max(0.25, pos(r.tokens))}%` }}>
                  {r.code !== undefined && <span className="cw-code" style={{ width: `${(pos(r.code) / Math.max(0.25, pos(r.tokens))) * 100}%` }} />}
                </span>
              </button>
              <span className="cw-val"><b>{fmt(r.tokens)}</b><small>{fit(r)}</small></span>
            </li>
          ))}
        </ol>
      </div>
      <p className="jd-note"><span className="cw-key cw-key--code" /> code · <span className="cw-key" /> content, docs and data in the same repo · <span className="cw-key cw-key--est" /> estimated from a word count. The dashed line is the window. {log ? "On the log axis each step is ten times the last." : "On the to-scale axis, anything under about 100k tokens is a sliver: switch to log to read the small ones."}</p>
      <div className="kp-panel" aria-live="polite">
        {sel ? (
          <>
            <p className="cst-panel-kicker">{sel.kind === "estimate" ? "Estimated" : "Measured with o200k_base"} · {sel.tokens.toLocaleString("en-GB")} tokens</p>
            <h2 className="cst-panel-title">{sel.name} · {fit(sel)} in {win.label}</h2>
            <p className="cst-panel-what">{sel.note}</p>
          </>
        ) : (
          <>
            <p className="cst-panel-kicker">{win.label} · {win.tokens.toLocaleString("en-GB")} tokens</p>
            <h2 className="cst-panel-title">{win.who}</h2>
            <p className="cst-panel-what">Hover a bar for what was counted. The four codebases are mine, counted file by file with a real tokeniser; only the totals are published here.</p>
          </>
        )}
      </div>
      <div className="cw-table-wrap">
      <table className="jc-table cw-table">
        <caption className="cw-caption">Every count, o200k_base and cl100k_base, counted {ukDate(DATA.counted)}</caption>
        <thead><tr><th>What</th><th>Files</th><th>Code</th><th>Total</th><th>cl100k</th></tr></thead>
        <tbody>
          {DATA.repos.map((r) => (
            <tr key={r.id}><td>{r.name}</td><td>{r.files.toLocaleString("en-GB")}</td><td>{r.o200k_base.code.toLocaleString("en-GB")}</td><td>{r.o200k_base.total.toLocaleString("en-GB")}</td><td>{r.cl100k_base.total.toLocaleString("en-GB")}</td></tr>
          ))}
          <tr><td>My blog</td><td>{DATA.blog.posts}</td><td>n/a</td><td>{DATA.blog.o200k_base.toLocaleString("en-GB")}</td><td>{DATA.blog.cl100k_base.toLocaleString("en-GB")}</td></tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}
