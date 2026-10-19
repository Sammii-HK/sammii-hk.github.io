"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BBC_WPM, FIXED_CARD, RULES, SAMPLES, SILENT_RANGE, SILENT_WPM, atWpm, cardBaseSeconds, noteSeconds, toLine } from "../../../labs/charts/text-on-screen/data";

/**
 * How long a line needs on screen. First a card that shows your line for
 * exactly as long as a rule allows and then takes it away, so the
 * difference is felt rather than read; then every rule as seconds against
 * words, with the line you typed marked on it and priced in a table.
 */
const fmt = (s: number) => `${s.toFixed(1)} s`;

export function TextOnScreen() {
  const [text, setText] = useState(SAMPLES[2]);
  const line = useMemo(() => toLine(text), [text]);
  const [play, setPlay] = useState<{ id: string; dur: number; t0: number } | null>(null);
  const [done, setDone] = useState<{ id: string; dur: number } | null>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("focus"); const n = Number(f); if (f && n >= 1 && n <= SAMPLES.length) setText(SAMPLES[n - 1]); }, []);

  useEffect(() => {
    if (!play) return;
    let raf = 0;
    const tick = () => {
      const p = (performance.now() - play.t0) / (play.dur * 1000);
      if (p >= 1) { setPlay(null); setDone({ id: play.id, dur: play.dur }); setProgress(0); return; }
      setProgress(p); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play]);

  const start = (id: string) => { const r = RULES.find((x) => x.id === id)!; setDone(null); setPlay({ id, dur: r.seconds(line), t0: performance.now() }); };
  const plays = ["fixed", "note", "bbc"].map((id) => RULES.find((r) => r.id === id)!);
  const ruleName = (id: string) => RULES.find((r) => r.id === id)?.name ?? id;

  return (
    <div className="ts">
      <div className="ts-feel">
        <div className="ts-phone" aria-live="polite">
          {play ? <p className="ts-line">{line.text}</p> : done ? <p className="ts-gone">Gone after {fmt(done.dur)}. Did you get to the end?</p> : <p className="ts-gone">Press play and read the line before it goes.</p>}
          <span className="ts-progress" style={{ transform: `scaleX(${play ? 1 - progress : 0})` }} />
        </div>
        <div className="ts-controls">
          <label className="ts-input">
            <span className="cst-year-label">The line</span>
            <textarea value={text} onChange={(e) => { setText(e.target.value.slice(0, 220)); setDone(null); }} rows={3} spellCheck={false} />
            <span className="ts-count">{line.words} words · {line.chars} characters</span>
          </label>
          <div className="ts-pills" role="group" aria-label="Sample lines">
            {SAMPLES.map((s) => { const l = toLine(s); return <button key={s} type="button" aria-pressed={text === s} onClick={() => { setText(s); setDone(null); }}>{l.words} words</button>; })}
          </div>
          <div className="ts-pills ts-play" role="group" aria-label="Play the line">
            {plays.map((r) => <button key={r.id} type="button" disabled={!line.words || !!play} onClick={() => start(r.id)}>Play: {r.id === "fixed" ? "a 2 s card" : r.id === "note" ? "my rule" : "subtitle speed"} · {fmt(r.seconds(line))}</button>)}
          </div>
          {done && <p className="ts-after">{ruleName(done.id)}: {fmt(done.dur)} for {line.words} words is {Math.round((line.words / done.dur) * 60)} words a minute. The average silent reader manages {SILENT_WPM} on a still page.</p>}
        </div>
      </div>
      <h2 className="section-eyebrow" style={{ marginTop: "2rem" }}>Every rule, to scale</h2>
      <ReadingRules text={text} setText={(t) => { setText(t); setDone(null); }} />
    </div>
  );
}

const MAX_W = 24, MAX_S = 9;

function ReadingRules({ text, setText }: { text: string; setText: (t: string) => void }) {
  const line = useMemo(() => toLine(text), [text]);
  const [hover, setHover] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(720);
  useLayoutEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(300, Math.round(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const H = Math.round(Math.min(400, Math.max(280, W * 0.5))), L = 36, R = W < 560 ? 12 : 120, T = 14, B = 34;
  const x = (w: number) => Math.round((L + (w / MAX_W) * (W - L - R)) * 10) / 10;
  const y = (s: number) => Math.round((T + (1 - Math.min(s, MAX_S) / MAX_S) * (H - T - B)) * 10) / 10;
  const ws = Array.from({ length: MAX_W + 1 }, (_, i) => i);
  const path = (f: (w: number) => number, from = 1) => ws.filter((w) => w >= from).map((w, i) => `${i ? "L" : "M"}${x(w)} ${y(f(w))}`).join(" ");
  const band = (lo: (w: number) => number, hi: (w: number) => number) => `${path(lo, 0)} ${[...ws].reverse().map((w) => `L${x(w)} ${y(hi(w))}`).join(" ")} Z`;
  const series = [
    { id: "fixed", d: path(() => FIXED_CARD, 0), end: FIXED_CARD },
    { id: "note", d: path(noteSeconds), end: noteSeconds(MAX_W) },
    { id: "silent", d: path((w) => atWpm(w, SILENT_WPM)), end: atWpm(MAX_W, SILENT_WPM) },
    { id: "bbc", d: path((w) => atWpm(w, BBC_WPM[0])), end: atWpm(MAX_W, BBC_WPM[0]) },
    { id: "card", d: path(cardBaseSeconds), end: cardBaseSeconds(MAX_W) },
  ];
  const label = (id: string) => ({ fixed: "2 s card", note: "my note rule", silent: "238 wpm", bbc: "BBC, 160 wpm", card: "my card rule" } as Record<string, string>)[id];
  // end labels sorted by height and pushed apart so none overlap
  const ends = [...series].sort((a, b) => y(a.end) - y(b.end)).reduce<{ id: string; ly: number }[]>((acc, s) => { const want = y(s.end) + 4, prev = acc[acc.length - 1]; acc.push({ id: s.id, ly: prev ? Math.max(want, prev.ly + 13) : want }); return acc; }, []);
  const rows = RULES.map((r) => ({ ...r, s: r.seconds(line), band: r.band?.(line) })).sort((a, b) => a.s - b.s);
  const wm = Math.min(line.words, MAX_W);

  return (
    <div className="ts-rules">
      <div className="ts-pills" role="group" aria-label="Sample lines">
        <span className="ts-count">Your line: {line.words} words, {line.chars} characters. Edit it above, or try</span>
        {SAMPLES.map((smp) => <button key={smp} type="button" aria-pressed={text === smp} onClick={() => setText(smp)}>{toLine(smp).words} words</button>)}
      </div>
      <div className="ts-grid">
        <div className="ts-stage" ref={wrap}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="ts-svg" role="img" aria-label="Seconds on screen against words in the line for five rules: a fixed 2 second card, my note rule, silent reading at 238 words a minute, BBC subtitles at 160 to 180, and my card rule. The table beside it gives the numbers for your line.">
            {[0, 2, 4, 6, 8].map((s) => <g key={s} className="ts-tick"><line x1={L} x2={W - R} y1={y(s)} y2={y(s)} /><text x={L - 6} y={y(s) + 4} textAnchor="end">{s} s</text></g>)}
            {[1, 4, 8, 12, 16, 20, 24].map((w) => <text key={w} className="ts-tick-x" x={x(w)} y={H - B + 16} textAnchor="middle">{w}</text>)}
            <text className="ts-axis" x={W - R} y={H - 4} textAnchor="end">words on the line</text>
            <path className="ts-band" d={band((w) => atWpm(w, SILENT_RANGE[1]), (w) => atWpm(w, SILENT_RANGE[0]))} />
            <path className="ts-band ts-band--bbc" d={band((w) => atWpm(w, BBC_WPM[1]), (w) => atWpm(w, BBC_WPM[0]))} />
            {series.map((s) => <path key={s.id} d={s.d} className={`ts-line ts-line--${s.id}${hover && hover !== s.id ? " is-dim" : ""}${hover === s.id ? " is-on" : ""}`} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} />)}
            {W >= 560 && ends.map((s) => <text key={s.id} className={`ts-end${hover && hover !== s.id ? " is-dim" : ""}`} x={x(MAX_W) + 6} y={s.ly}>{label(s.id)}</text>)}
            {wm > 0 && <g className="ts-mark"><line x1={x(wm)} x2={x(wm)} y1={T} y2={H - B} /><text x={x(wm) + 4} y={T + 10}>your line, {line.words} words</text></g>}
            {wm > 0 && wm === line.words && series.filter((s) => s.id !== "fixed").map((s) => { const v = s.id === "note" ? noteSeconds(wm) : s.id === "silent" ? atWpm(wm, SILENT_WPM) : s.id === "bbc" ? atWpm(wm, BBC_WPM[0]) : cardBaseSeconds(wm); return <circle key={s.id} className="ts-dot" cx={x(wm)} cy={y(v)} r={3.5} />; })}
          </svg>
          {W < 560 && <ul className="ts-legend">{series.map((s) => <li key={s.id}><svg width="22" height="8" aria-hidden="true"><line x1="0" x2="22" y1="4" y2="4" className={`ts-line ts-line--${s.id}`} /></svg>{label(s.id)}</li>)}</ul>}
        </div>
        <div className="ts-table-wrap">
          <table className="ts-table">
            <caption className="ts-caption">Your line, {line.words} words, by each rule</caption>
            <thead><tr><th scope="col">Rule</th><th scope="col">Seconds</th><th scope="col">2 s gives</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.id === "fixed" ? "is-ref" : ""} onMouseEnter={() => setHover(r.id)} onMouseLeave={() => setHover(null)} title={r.who}>
                  <th scope="row">{r.name}</th>
                  <td><b>{r.s.toFixed(1)}</b>{r.band && r.band[1] - r.band[0] > 0.05 && <span className="ts-range"> {r.band[0].toFixed(1)} to {r.band[1].toFixed(1)}</span>}</td>
                  <td>{r.id === "fixed" ? "n/a" : `${Math.min(100, Math.round((FIXED_CARD / (r.band ? r.band[0] : r.s)) * 100))}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="ts-note">{hover ? RULES.find((r) => r.id === hover)?.who : "Hover a line or a row for where the rule comes from. The bands are the published ranges: 175 to 300 words a minute for most adult silent readers, 160 to 180 for BBC subtitles. The last column is how much of each rule a fixed 2 s card gives, measured against its most lenient end, so it is the kindest reading."}</p>
    </div>
  );
}
