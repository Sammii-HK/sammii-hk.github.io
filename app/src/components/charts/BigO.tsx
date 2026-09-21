"use client";
import { useEffect, useMemo, useState } from "react";

/**
 * Growth curves on one chart, drawn for the n you choose, with the time
 * each would take at a billion operations a second underneath. The log
 * toggle is the point: on a linear axis everything but the polynomials
 * vanishes; on a log axis the shape of each class is visible.
 */
type Cls = { id: string; name: string; f: (n: number) => number; eg: string; note: string; ops?: string };
const CLASSES: Cls[] = [
  { id: "1", name: "O(1)", f: () => 1, eg: "Array index, hash lookup, push to a stack", note: "Constant: the input size does not matter." },
  { id: "logn", name: "O(log n)", f: (n) => Math.log2(Math.max(2, n)), eg: "Binary search, balanced-tree lookup", note: "Halving the problem each step. A million items in twenty steps." },
  { id: "n", name: "O(n)", f: (n) => n, eg: "A single loop, a linear scan, rendering a list", note: "Linear: twice the data, twice the work." },
  { id: "nlogn", name: "O(n log n)", f: (n) => n * Math.log2(Math.max(2, n)), eg: "Merge sort, Array.prototype.sort, most good sorts", note: "The floor for comparison sorting. Close enough to linear to feel free until n is huge." },
  { id: "n2", name: "O(n²)", f: (n) => n * n, eg: "Nested loops, bubble sort, comparing every pair, naive layout of n items against n items", note: "Quadratic: ten times the data, a hundred times the work. Where most accidental slowness lives." },
  { id: "n3", name: "O(n³)", f: (n) => n ** 3, eg: "Triple loops, naive matrix multiplication", note: "Cubic. Rare on purpose, common by accident." },
  { id: "2n", name: "O(2ⁿ)", f: (n) => 2 ** n, eg: "Every subset, naive recursive Fibonacci, brute-force search", note: "Exponential: adding one item doubles the work. Fine to 30, impossible by 60." },
  { id: "nf", name: "O(n!)", f: (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }, eg: "Every ordering: the travelling salesman by brute force", note: "Factorial. Twenty items is already more operations than there have been seconds since the universe began." },
];
const RATE = 1e9; // operations per second

function human(sec: number): string {
  if (sec < 1e-6) return `${(sec * 1e9).toFixed(0)} ns`;
  if (sec < 1e-3) return `${(sec * 1e6).toFixed(0)} µs`;
  if (sec < 1) return `${(sec * 1e3).toFixed(1)} ms`;
  if (sec < 60) return `${sec.toFixed(1)} s`;
  if (sec < 3600) return `${(sec / 60).toFixed(1)} min`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)} h`;
  if (sec < 3.15e7) return `${(sec / 86400).toFixed(1)} days`;
  if (sec < 3.15e7 * 1e6) return `${(sec / 3.15e7).toLocaleString(undefined, { maximumFractionDigits: 0 })} years`;
  return `${(sec / 3.15e7).toExponential(1)} years`;
}

const W = 720, H = 420, PAD = 44;

export function BigO() {
  const [n, setN] = useState(32);
  const [logY, setLogY] = useState(true);
  const [hover, setHover] = useState<string | null>(null);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("focus"); if (f && CLASSES.some((c) => c.id === f)) setHover(f); }, []);
  const xs = useMemo(() => Array.from({ length: 121 }, (_, i) => 1 + ((n - 1) * i) / 120), [n]);
  const maxY = useMemo(() => Math.max(...CLASSES.map((c) => Math.min(c.f(n), 1e300))), [n]);
  const yOf = (v: number) => {
    const t = logY ? Math.log10(Math.max(1, v)) / Math.log10(Math.max(10, maxY)) : v / maxY;
    return H - PAD - Math.min(1, Math.max(0, t)) * (H - 2 * PAD);
  };
  const xOf = (v: number) => PAD + ((v - 1) / Math.max(1, n - 1)) * (W - 2 * PAD);
  const path = (c: Cls) => xs.map((x, i) => `${i ? "L" : "M"}${xOf(x).toFixed(1)} ${yOf(c.f(x)).toFixed(1)}`).join(" ");
  const ticks = logY ? Array.from({ length: Math.ceil(Math.log10(Math.max(10, maxY))) + 1 }, (_, i) => 10 ** i).filter((v) => v <= maxY * 1.01 || v === 1) : [0, 0.25, 0.5, 0.75, 1].map((k) => k * maxY);

  return (
    <div className="bo">
      <div className="bo-controls">
        <label className="cst-year">
          <span className="cst-year-label">n</span>
          <input type="range" min={2} max={64} value={n} onChange={(e) => setN(Number(e.target.value))} aria-valuetext={String(n)} />
          <output className="cst-year-value">{n}</output>
        </label>
        <div className="bo-toggle" role="group" aria-label="Vertical axis">
          <button type="button" aria-pressed={logY} onClick={() => setLogY(true)}>log axis</button>
          <button type="button" aria-pressed={!logY} onClick={() => setLogY(false)}>linear axis</button>
        </div>
      </div>
      <div className="bo-stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="bo-svg" role="img" aria-label={`Operations against n for eight complexity classes, n up to ${n}`}>
          {ticks.map((t) => (
            <g key={t} className="bo-tick"><line x1={PAD} x2={W - PAD} y1={yOf(t)} y2={yOf(t)} /><text x={PAD - 6} y={yOf(t) + 4} textAnchor="end">{t >= 1e6 ? t.toExponential(0).replace("e+", "e") : Math.round(t).toLocaleString()}</text></g>
          ))}
          <text x={W - PAD} y={H - PAD + 20} textAnchor="end" className="bo-axis">n = {n}</text>
          <text x={PAD} y={H - PAD + 20} className="bo-axis">operations, at n</text>
          {CLASSES.map((c) => (
            <path key={c.id} d={path(c)} className={`bo-line${hover === c.id ? " is-hover" : ""}${hover && hover !== c.id ? " is-dim" : ""}`} onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)} />
          ))}
          {CLASSES.map((c) => {
            const y = yOf(c.f(n));
            return <text key={c.id} x={W - PAD + 6} y={Math.max(PAD, y) + 4} className={`bo-label${hover && hover !== c.id ? " is-dim" : ""}`}>{c.name}</text>;
          })}
        </svg>
      </div>
      <table className="bo-table">
        <thead><tr><th>Class</th><th>Operations at n = {n}</th><th>At a billion a second</th><th>Typical of</th></tr></thead>
        <tbody>
          {CLASSES.map((c) => {
            const ops = c.f(n);
            return (
              <tr key={c.id} className={hover === c.id ? "is-hover" : ""} onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}>
                <th scope="row">{c.name}</th>
                <td>{ops >= 1e15 ? ops.toExponential(2) : Math.round(ops).toLocaleString()}</td>
                <td>{human(ops / RATE)}</td>
                <td>{c.eg}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="bo-note">{hover ? CLASSES.find((c) => c.id === hover)?.note : "Hover a line or a row. Drag n up and watch which classes leave the chart."}</p>
    </div>
  );
}
