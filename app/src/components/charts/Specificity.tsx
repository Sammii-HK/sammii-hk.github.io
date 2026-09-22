"use client";
import { useMemo, useState } from "react";

/**
 * Specificity as three columns, computed by a small parser that follows
 * Selectors Level 4: ids; classes, attributes and pseudo-classes; types
 * and pseudo-elements. :is(), :not() and :has() take the most specific
 * argument, :where() takes nothing, :nth-child(… of S) adds S. Type a
 * selector and watch which of the rules on the button wins.
 */
export type Spec = [number, number, number];

function splitTop(s: string, sep: string): string[] {
  const out: string[] = []; let depth = 0, cur = "";
  for (const ch of s) { if (ch === "(" || ch === "[") depth++; if (ch === ")" || ch === "]") depth--; if (ch === sep && depth === 0) { out.push(cur); cur = ""; } else cur += ch; }
  out.push(cur); return out.map((x) => x.trim()).filter(Boolean);
}
const max = (a: Spec, b: Spec) => (a[0] !== b[0] ? (a[0] > b[0] ? a : b) : a[1] !== b[1] ? (a[1] > b[1] ? a : b) : a[2] >= b[2] ? a : b);
const ZERO: Spec = [0, 0, 0];

export function specificity(sel: string): Spec {
  // a selector list: the most specific wins (matters inside :is/:not/:has)
  const parts = splitTop(sel, ",");
  if (parts.length > 1) return parts.map(specificity).reduce(max, ZERO);
  let a = 0, b = 0, c = 0, i = 0; const s = sel.trim();
  const readName = () => { const m = /^-?[_a-zA-Z\\][-\w\\]*/.exec(s.slice(i)); if (!m) return ""; i += m[0].length; return m[0]; };
  const readParen = () => { let depth = 0, start = i; for (; i < s.length; i++) { if (s[i] === "(") depth++; if (s[i] === ")") { depth--; if (depth === 0) { i++; break; } } } return s.slice(start + 1, i - 1); };
  while (i < s.length) {
    const ch = s[i];
    if (ch === "#") { i++; readName(); a++; }
    else if (ch === ".") { i++; readName(); b++; }
    else if (ch === "[") { let d = 0; for (; i < s.length; i++) { if (s[i] === "[") d++; if (s[i] === "]") { d--; if (!d) { i++; break; } } } b++; }
    else if (ch === ":" && s[i + 1] === ":") { i += 2; readName(); c++; }
    else if (ch === ":") {
      i++; const name = readName().toLowerCase(); const hasArg = s[i] === "(";
      const arg = hasArg ? readParen() : "";
      if (name === "where") { /* nothing */ }
      else if (name === "is" || name === "not" || name === "has" || name === "matches") { const [x, y, z] = specificity(arg); a += x; b += y; c += z; }
      else if ((name === "nth-child" || name === "nth-last-child") && / of /.test(arg)) { b++; const [x, y, z] = specificity(arg.split(/ of /)[1]); a += x; b += y; c += z; }
      else if (name === "before" || name === "after" || name === "first-line" || name === "first-letter") c++; // legacy single-colon pseudo-elements
      else b++;
    }
    else if (ch === "*") { i++; }
    else if (/[a-zA-Z]/.test(ch)) { readName(); c++; }
    else i++; // combinators, whitespace, anything else
  }
  return [a, b, c];
}

const cmp = (x: Spec, y: Spec) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];

const STARTERS: { sel: string; note: string }[] = [
  { sel: ".btn", note: "The component's own rule." },
  { sel: ".card .btn", note: "An override from a parent: one more class, so it wins." },
  { sel: "#app .btn", note: "An id anywhere in the selector beats any number of classes." },
  { sel: ".btn.btn", note: "The doubling hack: the same class twice counts twice." },
  { sel: ":where(.card) .btn", note: "Wrapped in :where, the .card contributes nothing: this ties with .btn and later wins." },
  { sel: "button:not(.primary)", note: ":not takes the specificity of its argument: one class plus one type." },
  { sel: "li:nth-child(2n of .on)", note: "A pseudo-class plus whatever is after 'of'." },
  { sel: "a:hover::after", note: "Pseudo-class counts as a class, pseudo-element as a type." },
];

export function Specificity() {
  const [rules, setRules] = useState<string[]>([".btn", ".card .btn", "#app .btn", ".btn.btn", ":where(.card) .btn"]);
  const [draft, setDraft] = useState("");
  const scored = useMemo(() => rules.map((sel, order) => ({ sel, order, spec: specificity(sel) })), [rules]);
  const winner = useMemo(() => scored.slice().sort((x, y) => cmp(y.spec, x.spec) || y.order - x.order)[0], [scored]);
  const top = Math.max(1, ...scored.flatMap((r) => r.spec));
  const add = (sel: string) => { const s = sel.trim(); if (!s || rules.includes(s)) return; setRules((r) => [...r, s]); setDraft(""); };

  return (
    <div className="spc">
      <div className="spc-grid">
        <div className="spc-rules">
          <form className="spc-form" onSubmit={(e) => { e.preventDefault(); add(draft); }}>
            <input className="aq-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a selector, e.g. .card :is(.btn, button)" aria-label="Selector" spellCheck={false} autoComplete="off" />
            <button type="submit" className="cst-btn">Add rule</button>
          </form>
          <div className="spc-starters">{STARTERS.map((s) => <button key={s.sel} type="button" className="spc-starter" onClick={() => add(s.sel)} title={s.note}><code>{s.sel}</code></button>)}</div>
          <ol className="spc-list">
            {scored.map((r) => (
              <li key={r.sel} className={winner?.sel === r.sel ? "is-win" : ""}>
                <code className="spc-sel">{r.sel}</code>
                <span className="spc-bars" aria-label={`specificity ${r.spec.join(", ")}`}>
                  {r.spec.map((v, k) => <span key={k} className={`spc-bar spc-bar--${k}`}><i style={{ width: `${(v / top) * 100}%` }} /><b>{v}</b></span>)}
                </span>
                <span className="spc-tuple">({r.spec.join(",")})</span>
                <button type="button" className="spc-x" onClick={() => setRules((rs) => rs.filter((x) => x !== r.sel))} aria-label={`Remove ${r.sel}`}>×</button>
              </li>
            ))}
          </ol>
          <p className="jd-note"><span className="spc-key spc-key--0" /> ids · <span className="spc-key spc-key--1" /> classes, attributes, pseudo-classes · <span className="spc-key spc-key--2" /> types, pseudo-elements. Compared left to right; a single id beats a hundred classes. Ties go to the rule that comes last, so order in the list is source order.</p>
        </div>
        <aside className="cst-panel spc-panel">
          <p className="cst-panel-kicker">On the button, this wins</p>
          <p className="cst-panel-title"><code>{winner?.sel ?? "nothing"}</code></p>
          <p className="cst-panel-why">{STARTERS.find((s) => s.sel === winner?.sel)?.note ?? "Your own selector."}</p>
          <p className="cst-panel-kicker" style={{ marginTop: "1rem" }}>What beats specificity, in order</p>
          <ol className="spc-ladder">
            <li><b>Transition &amp; animation declarations</b> the browser is running</li>
            <li><b>!important</b>, with the origins reversed: user-agent !important beats author !important</li>
            <li><b>Origin</b>: author over user over user-agent</li>
            <li><b>Cascade layers</b>: later @layer beats earlier; unlayered beats every layer</li>
            <li><b>Inline style</b> attribute (with layers and !important accounted for first)</li>
            <li><b>Specificity</b>, the three columns here</li>
            <li><b>Source order</b>: last one wins</li>
          </ol>
          <p className="cst-panel-fam">Which is why a design system ships its defaults in a low @layer or wrapped in :where(): so that any plain selector in the product wins without an id or a doubled class.</p>
        </aside>
      </div>
    </div>
  );
}
