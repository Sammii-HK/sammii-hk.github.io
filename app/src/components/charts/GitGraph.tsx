"use client";
import { useMemo, useState } from "react";
import { STEPS } from "../../../labs/charts/git-graph/data";

/**
 * Git as what it is: immutable commit objects, and names that point at
 * one of them. Step the commands and watch the graph. Unreachable
 * commits stay drawn, because that is the truth about every command
 * here: nothing in this sequence deletes an object.
 */
const R = 11, GAP_X = 150, GAP_Y = 66, PAD = 52;
const short = (m: string) => (m.length > 22 ? m.slice(0, 21) + "…" : m);

export function GitGraph() {
  const [i, setI] = useState(0);
  const [showLost, setShowLost] = useState(true);
  const step = STEPS[i];
  const reachable = useMemo(() => {
    const byId = new Map(step.commits.map((c) => [c.id, c]));
    const seen = new Set<string>();
    const walk = (id: string) => { if (!id || seen.has(id)) return; seen.add(id); (byId.get(id)?.parents ?? []).forEach(walk); };
    Object.values(step.refs).forEach(walk);
    return seen;
  }, [step]);
  const order = useMemo(() => {
    // x by depth from the root, y by lane
    const byId = new Map(step.commits.map((c) => [c.id, c]));
    const depth = new Map<string, number>();
    const d = (id: string): number => { if (depth.has(id)) return depth.get(id)!; const c = byId.get(id); const v = !c || !c.parents.length ? 0 : 1 + Math.max(...c.parents.map(d)); depth.set(id, v); return v; };
    step.commits.forEach((c) => d(c.id));
    return step.commits.map((c) => ({ ...c, x: PAD + d(c.id) * GAP_X, y: PAD + c.lane * GAP_Y }));
  }, [step]);
  const pos = new Map(order.map((c) => [c.id, c]));
  const W = Math.max(...order.map((c) => c.x)) + 170, H = Math.max(...order.map((c) => c.y)) + 76;
  const refsAt = (id: string) => Object.entries(step.refs).filter(([, v]) => v === id).map(([k]) => k);
  const lost = new Set(step.lost ?? []);

  return (
    <div className="gg">
      <div className="gg-cmds" role="tablist" aria-label="Commands">
        {STEPS.map((s, n) => <button key={n} role="tab" type="button" aria-selected={n === i} className={`gg-cmd ${n === i ? "is-on" : ""} ${n < i ? "is-done" : ""}`} onClick={() => setI(n)}><span>{n + 1}</span><code>{s.cmd.split(" ").slice(0, 3).join(" ")}</code></button>)}
      </div>
      <div className="gg-bar">
        <code className="gg-full">{step.cmd}</code>
        <label className="sc-toggle"><input type="checkbox" checked={showLost} onChange={(e) => setShowLost(e.target.checked)} />show unreachable objects</label>
        <span className="gg-nav"><button type="button" className="cst-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>Back</button><button type="button" className="cst-btn" onClick={() => setI(Math.min(STEPS.length - 1, i + 1))} disabled={i === STEPS.length - 1}>Next</button></span>
      </div>

      <div className="gg-stage">
        <svg className="gg-svg" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: `${Math.min(W, 980)}px` }} role="img" aria-label={`Commit graph after ${step.cmd}`}>
          {order.flatMap((c) => c.parents.map((p) => { const a = pos.get(p); if (!a) return null; const dim = !reachable.has(c.id) || !reachable.has(p); if (dim && !showLost) return null; return (
            <path key={`${c.id}-${p}`} className={`gg-edge ${dim ? "is-lost" : ""}`} d={a.y === c.y ? `M${a.x + R} ${a.y} L${c.x - R} ${c.y}` : `M${a.x + R * 0.7} ${a.y + (c.y > a.y ? R * 0.7 : -R * 0.7)} C${a.x + GAP_X * 0.5} ${a.y + (c.y - a.y) * 0.1}, ${c.x - GAP_X * 0.5} ${c.y - (c.y - a.y) * 0.1}, ${c.x - R * 0.7} ${c.y - (c.y > a.y ? R * 0.7 : -R * 0.7)}`} />
          ); }))}
          {order.map((c) => { const dim = !reachable.has(c.id); if (dim && !showLost) return null; const rs = refsAt(c.id); return (
            <g key={c.id} className={`gg-node ${dim ? "is-lost" : ""} ${lost.has(c.id) ? "is-just-lost" : ""}`} transform={`translate(${c.x} ${c.y})`}>
              <circle r={R} />
              {c.parents.length > 1 && <circle r={R - 4} className="gg-merge-dot" />}
              <text className="gg-id" y={-R - 8}>{c.id}</text>
              <title>{c.msg}</title><text className="gg-msg" y={R + 16}>{short(c.msg)}</text>
              {rs.map((name, n) => (
                <g key={name} transform={`translate(${R + 10} ${-R - 2 + n * 18})`} className={`gg-ref ${step.head === name ? "is-head" : ""}`}>
                  <rect x={0} y={-11} width={name.length * 6.6 + 12} height={18} rx={9} />
                  <text x={6} y={2}>{name}</text>
                  {step.head === name && (
                    <g transform={`translate(${name.length * 6.6 + 16} 0)`} className="gg-head">
                      <rect x={0} y={-11} width={38} height={18} rx={9} />
                      <text x={6} y={2}>HEAD</text>
                    </g>
                  )}
                </g>
              ))}
            </g>
          ); })}
        </svg>
      </div>

      <div className="gg-info">
        <div>
          {step.feels && <p className="gg-feels">{step.feels}</p>}
          <p className="gg-what">{step.what}</p>
        </div>
        <div className="gg-reflog">
          <p className="cst-panel-kicker">git reflog</p>
          <pre><code>{step.reflog.join("\n")}</code></pre>
          {step.lost && showLost && <p className="gg-lost-note">{step.lost.length} commit{step.lost.length > 1 ? "s" : ""} unreachable and still in <code>.git/objects</code>: {step.lost.join(", ")}. <code>git gc</code> keeps unreachable objects for 90 days by default.</p>}
        </div>
      </div>
    </div>
  );
}
