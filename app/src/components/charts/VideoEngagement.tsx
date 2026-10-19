"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import DATA from "../../../labs/charts/videos/data.json";

/**
 * Nine hundred videos as dots: length on a log axis, engagement rate up the
 * side, one account at a time, with the median of each length bucket drawn
 * across it as a step. Every number comes from data.json, which
 * scripts/labs/video-engagement.mjs builds from the analysis table; nothing
 * is computed here except the drawing.
 */
type Video = { a: string; s: number; er: number; v: number; f: string; t: string; e: string | null };
type Summary = { n: number; medianEr: number | null; medianViews: number | null; pushed: number };
const VIDEOS = DATA.videos as Video[];
const ACCOUNTS = DATA.accounts;
const FORMATS = DATA.formats;
const BUCKETS = DATA.buckets;
const BY_BUCKET = DATA.byBucket as Record<string, ({ bucket: string } & Summary)[]>;
const BY_FORMAT = DATA.byFormat as Record<string, ({ format: string } & Summary)[]>;
const SCOPES = [...ACCOUNTS.map((a) => ({ id: a.id, label: a.label })), { id: "all", label: `All ${VIDEOS.length}` }];
const fmtLabel = (id: string) => FORMATS.find((f) => f.id === id)?.label ?? id;
const eraLabel = (id: string | null) => DATA.eras.find((e) => e.id === id)?.label;
const pct = (x: number | null) => (x == null ? "none" : `${x.toFixed(1)}%`);
const month = (ym: string) => new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

const X_MIN = 1, X_MAX = 300, Y_MAX = 0.4;
const X_TICKS = [2, 5, 8, 20, 45, 100, 240], X_TICKS_NARROW = [2, 8, 20, 45, 240];
const SHORT_BUCKET: Record<string, string> = { le8: "8 or less", "9-20": "9 to 20", "21-45": "21 to 45", gt45: "over 45" };
const Y_TICKS = [0, 0.1, 0.2, 0.3, 0.4];
/** deterministic sideways jitter, so the many 5-second videos do not sit on one line */
const jitter = (i: number) => (((i * 2654435761) >>> 0) % 1000) / 1000 - 0.5;

export function VideoEngagement() {
  const [scope, setScope] = useState("sparkle");
  const [fmt, setFmt] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("focus");
    if (f && SCOPES.some((s) => s.id === f)) setScope(f);
    else if (f && FORMATS.some((x) => x.id === f)) setFmt(f);
  }, []);

  const wrap = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(720);
  useLayoutEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(300, Math.round(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const H = Math.round(Math.min(420, Math.max(300, W * 0.56)));
  const narrow = W < 560, L = 40, R = 14, T = narrow ? 36 : 26, B = 34;
  // rounded to a tenth so the server render and the browser agree to the digit
  const xOf = (s: number) => Math.round((L + (Math.log10(Math.max(X_MIN, s)) / Math.log10(X_MAX)) * (W - L - R)) * 10) / 10;
  const yOf = (er: number) => Math.round((T + (1 - Math.min(er, Y_MAX) / Y_MAX) * (H - T - B)) * 10) / 10;

  const rows = useMemo(() => VIDEOS.map((v, i) => ({ ...v, i })).filter((v) => (scope === "all" || v.a === scope) && v.s > 0), [scope]);
  const untimed = useMemo(() => VIDEOS.filter((v) => (scope === "all" || v.a === scope) && v.s === 0).length, [scope]);
  const buckets = BY_BUCKET[scope];
  const formats = BY_FORMAT[scope];
  const acc = ACCOUNTS.find((a) => a.id === scope);
  const sel = hover != null ? VIDEOS[hover] : null;
  const first = buckets.find((b) => b.n > 0), last = [...buckets].reverse().find((b) => b.n > 0);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = ((e.clientX - r.left) / r.width) * W, py = ((e.clientY - r.top) / r.height) * H;
    let best: number | null = null, bd = 16 * 16;
    for (const v of rows) {
      if (fmt && v.f !== fmt) continue;
      const dx = xOf(v.s + jitter(v.i) * 0.6) - px, dy = yOf(v.er) - py, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = v.i; }
    }
    setHover(best);
  };

  return (
    <div className="ve">
      <div className="ve-knob" role="group" aria-label="Account">
        <span className="ve-label">Account</span>
        <div className="ve-opts">
          {SCOPES.map((s) => <button key={s.id} type="button" aria-pressed={scope === s.id} onClick={() => { setScope(s.id); setHover(null); }}>{s.label}</button>)}
        </div>
      </div>

      {first && last && first.bucket !== last.bucket ? (
        <p className="ve-total">
          {acc ? acc.label : "Across all six accounts"}, {BUCKETS.find((b) => b.id === first.bucket)?.label.toLowerCase()}: <strong>{pct(first.medianEr)}</strong> median engagement ({first.n} videos). {BUCKETS.find((b) => b.id === last.bucket)?.label}: <strong>{pct(last.medianEr)}</strong> ({last.n}).
        </p>
      ) : (
        <p className="ve-total">{acc?.label}: every timed video falls in one length bucket, so length says nothing here. Median engagement <strong>{pct(acc?.medianEr ?? null)}</strong>.</p>
      )}

      <div className="ve-grid">
        <div className="ve-stage" ref={wrap}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="ve-svg" role="img" aria-label={`Engagement rate against video length for ${acc?.label ?? "all accounts"}, ${rows.length} videos with a recorded length, one dot each, with the median of each length bucket drawn as a step. The tables below carry the same numbers.`} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}>
            {Y_TICKS.map((t) => <g key={t} className="ve-tick"><line x1={L} x2={W - R} y1={yOf(t)} y2={yOf(t)} /><text x={L - 6} y={yOf(t) + 4} textAnchor="end">{t * 100}%</text></g>)}
            {(narrow ? X_TICKS_NARROW : X_TICKS).map((t) => <text key={t} className="ve-tick-x" x={xOf(t)} y={H - B + 16} textAnchor="middle">{t} s</text>)}
            {BUCKETS.slice(1).map((b) => <line key={b.id} className="ve-split" x1={xOf(b.min - 0.5)} x2={xOf(b.min - 0.5)} y1={T - (narrow ? 32 : 18)} y2={H - B} />)}
            {BUCKETS.map((b) => { const x0 = xOf(Math.max(X_MIN, b.min - 0.5)), x1 = xOf(Math.min(X_MAX, (b.max ?? X_MAX) + 0.5)); return <text key={b.id} className="ve-bucket" x={(x0 + x1) / 2} y={narrow && BUCKETS.indexOf(b) % 2 ? T - 20 : T - 8} textAnchor="middle">{narrow ? SHORT_BUCKET[b.id] : b.label}</text>; })}
            <text className="ve-axis" x={W - R} y={H - 4} textAnchor="end">length, log scale</text>
            <g className={`ve-dots${fmt ? " has-pick" : ""}`}>
              {rows.map((v) => <circle key={v.i} cx={xOf(v.s + jitter(v.i) * 0.6)} cy={yOf(v.er)} r={hover === v.i ? 5 : 3} className={`${fmt === v.f ? "is-on" : ""}${hover === v.i ? " is-hover" : ""}${v.er > Y_MAX ? " is-clipped" : ""}`} />)}
            </g>
            {buckets.filter((b) => b.n >= 3 && b.medianEr != null).map((b) => {
              const spec = BUCKETS.find((x) => x.id === b.bucket)!, x0 = xOf(Math.max(X_MIN, spec.min - 0.5)), x1 = xOf(Math.min(X_MAX, (spec.max ?? X_MAX) + 0.5)), y = yOf(b.medianEr! / 100);
              return <g key={b.bucket} className="ve-median"><line x1={x0 + 3} x2={x1 - 3} y1={y} y2={y} /><text x={(x0 + x1) / 2} y={y - 6} textAnchor="middle">{pct(b.medianEr)}</text></g>;
            })}
          </svg>
        </div>
        <aside className="cst-panel ve-panel" aria-live="polite">
          {sel ? (
            <>
              <p className="cst-panel-kicker">{ACCOUNTS.find((a) => a.id === sel.a)?.label} · one video</p>
              <h2 className="cst-panel-title">{(sel.er * 100).toFixed(1)}% · {sel.s} s</h2>
              <p className="cst-panel-what">{sel.v.toLocaleString("en-GB")} views. {fmtLabel(sel.f)}.</p>
              {sel.e && <p className="cst-panel-why">{eraLabel(sel.e)}.</p>}
            </>
          ) : (
            <>
              <p className="cst-panel-kicker">{acc ? `${acc.label} · ${month(acc.from)} to ${month(acc.to)}` : "Six accounts"}</p>
              <h2 className="cst-panel-title">{acc ? acc.n : VIDEOS.length} videos, median {pct(acc ? acc.medianEr : null)}</h2>
              <p className="cst-panel-what">{acc ? acc.what : "Lunary is 615 of the 900, so the pooled view is mostly the app's account. Pick one account to read anything into the shape."}</p>
              <p className="cst-panel-why">{rows.length} dots. {untimed > 0 && `${untimed} more posts have no recorded length and are left off the axis. `}Engagement over 40% would be pinned to the top edge. Hover or tap a dot for its numbers.</p>
            </>
          )}
        </aside>
      </div>

      <div className="ve-formats" role="group" aria-label="Highlight a format">
        <span className="ve-label">Format · {acc?.label ?? "all accounts"}, median engagement</span>
        <ul>
          {formats.map((f) => (
            <li key={f.format}>
              <button type="button" aria-pressed={fmt === f.format} onClick={() => setFmt(fmt === f.format ? null : f.format)} title={FORMATS.find((x) => x.id === f.format)?.rule}>
                <span className="ve-fmt-name">{fmtLabel(f.format)}</span> <span className="ve-fmt-n">{f.n}</span> <b>{pct(f.medianEr)}</b>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="ve-table-wrap">
        <table className="ve-table">
          <caption className="ve-caption">{acc?.label ?? "All six accounts"}, by length</caption>
          <thead><tr><th scope="col">Length</th><th scope="col">Videos</th><th scope="col">Median engagement</th><th scope="col">Pushed (500+ views)</th></tr></thead>
          <tbody>
            {buckets.map((b) => (
              <tr key={b.bucket}>
                <th scope="row">{BUCKETS.find((x) => x.id === b.bucket)?.label}</th>
                <td>{b.n}</td>
                <td><span className="ve-bar"><i style={{ width: `${Math.min(100, ((b.medianEr ?? 0) / 16) * 100)}%` }} /></span><b>{pct(b.medianEr)}</b></td>
                <td>{b.n ? `${b.pushed} of ${b.n}` : "none"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** The cover frame: one square per video, filled where text was found on it. */
export function CoverHooks() {
  const groups = [
    { id: "sparkle", label: "Sparkle, every video", ...DATA.cover.sparkle },
    { id: "pipeline", label: "Sparkle, Jun to Jul 2026 pipeline", ...DATA.cover.pipeline },
    { id: "technically-blonde", label: "technically blonde, every video", ...DATA.cover["technically-blonde"] },
  ];
  return (
    <div className="ve-covers">
      {groups.map((g) => (
        <figure key={g.id} className="ve-cover">
          <figcaption><b>{g.withText} of {g.n}</b> {g.label}</figcaption>
          <div className="ve-units" role="img" aria-label={`${g.withText} of ${g.n} covers carry on-screen text${g.unknown ? `; ${g.unknown} covers could not be read` : ""}`}>
            {Array.from({ length: g.n }, (_, i) => <i key={i} className={i < g.withText ? "is-text" : i >= g.n - g.unknown ? "is-unknown" : ""} />)}
          </div>
        </figure>
      ))}
    </div>
  );
}

/** Sparkle's eras: the confound, as a table. Length, format and era moved together. */
export function EraTable() {
  return (
    <div className="ve-table-wrap">
      <table className="ve-table ve-eras">
        <caption className="ve-caption">Sparkle, era by era</caption>
        <thead><tr><th scope="col">Era</th><th scope="col">Videos</th><th scope="col">Median length</th><th scope="col">8 s or less</th><th scope="col">Text on the cover</th><th scope="col">Median engagement</th><th scope="col">Pushed</th></tr></thead>
        <tbody>
          {DATA.eras.map((e) => (
            <tr key={e.id} className={e.id === "pipeline" ? "is-ref" : ""}>
              <th scope="row">{e.label}</th>
              <td>{e.n}</td>
              <td>{e.medianSeconds} s</td>
              <td>{e.shortShare}%</td>
              <td>{e.coverText} of {e.n}</td>
              <td><b>{pct(e.medianEr)}</b></td>
              <td>{e.pushed} of {e.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
