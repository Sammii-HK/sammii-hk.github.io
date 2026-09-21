"use client";
import { useState } from "react";

/**
 * Why z-index: 9999 does nothing. A real DOM, painted by the real browser:
 * a toolbar, a card with a dropdown menu, and a sibling section under it.
 * Toggle properties on the card and the menu either overlays the sibling
 * or vanishes under it, and the tree on the right shows the stacking
 * contexts the browser actually built and the order it painted them.
 */
type Trigger = { id: string; label: string; css: React.CSSProperties; note: string };
const TRIGGERS: Trigger[] = [
  { id: "transform", label: "transform: translateZ(0)", css: { transform: "translateZ(0)" }, note: "Any transform other than none. The classic accidental one: added for a GPU hint or a hover lift." },
  { id: "opacity", label: "opacity: 0.99", css: { opacity: 0.99 }, note: "Any opacity below 1, including 0.999 from a fade-in that never quite finished." },
  { id: "filter", label: "filter: blur(0)", css: { filter: "blur(0)" }, note: "Any filter or backdrop-filter, including a no-op one. Glass panels create contexts." },
  { id: "willchange", label: "will-change: transform", css: { willChange: "transform" }, note: "will-change for any property that would create a context creates it now, before anything changes." },
  { id: "isolation", label: "isolation: isolate", css: { isolation: "isolate" }, note: "The honest one: exists only to create a stacking context, on purpose." },
  { id: "zindex", label: "position: relative; z-index: 0", css: { position: "relative", zIndex: 0 }, note: "A positioned element with any z-index other than auto. z-index: 0 is not the same as auto." },
];
type Fix = "none" | "raise" | "portal";

export function StackingContexts() {
  const [on, setOn] = useState<Set<string>>(new Set(["transform"]));
  const [fix, setFix] = useState<Fix>("none");
  const [open, setOpen] = useState(true);
  const toggle = (id: string) => setOn((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const active = TRIGGERS.filter((t) => on.has(t.id));
  const isContext = active.length > 0 || fix === "raise";
  const cardStyle: React.CSSProperties = Object.assign({}, ...active.map((t) => t.css), fix === "raise" ? { position: "relative", zIndex: 2 } : {});
  const cardZ = fix === "raise" ? 2 : on.has("zindex") ? 0 : 0;
  const menuHidden = isContext && fix !== "raise" && fix !== "portal";

  // the paint order the browser will use for the root stacking context, bottom to top
  type Row = { name: string; z: string; depth: number; note?: string; hot?: boolean };
  const rows: Row[] = [{ name: "root (html)", z: "", depth: 0 }];
  const rootKids: { name: string; z: number; order: number; kids?: Row[]; hot?: boolean }[] = [
    { name: "toolbar", z: 2, order: 0 },
    { name: "next section", z: 1, order: 2 },
  ];
  if (isContext) rootKids.push({ name: "card (stacking context)", z: cardZ, order: 1, hot: true, kids: [{ name: "menu", z: "9999, inside the card only", depth: 2, hot: true }] });
  else { rootKids.push({ name: "card (no context)", z: 0, order: 1 }); if (fix !== "portal") rootKids.push({ name: "menu", z: 9999, order: 1.5, hot: true }); }
  if (fix === "portal") rootKids.push({ name: "menu (portalled to body)", z: 9999, order: 3, hot: true });
  rootKids.sort((a, b) => a.z - b.z || a.order - b.order);
  for (const k of rootKids) { rows.push({ name: k.name, z: `z ${k.z}`, depth: 1, hot: k.hot }); if (k.kids) rows.push(...k.kids); }

  return (
    <div className="sc">
      <div className="sc-controls">
        <div>
          <p className="cst-year-label">On the card</p>
          <div className="sc-toggles">
            {TRIGGERS.map((t) => <label key={t.id} className={`sc-toggle ${on.has(t.id) ? "is-on" : ""}`}><input type="checkbox" checked={on.has(t.id)} onChange={() => toggle(t.id)} /><code>{t.label}</code></label>)}
          </div>
        </div>
        <div>
          <p className="cst-year-label">The fix</p>
          <div className="bo-toggle" role="group" aria-label="Fix">
            <button type="button" aria-pressed={fix === "none"} onClick={() => setFix("none")}>none</button>
            <button type="button" aria-pressed={fix === "raise"} onClick={() => setFix("raise")}>z-index: 2 on the card</button>
            <button type="button" aria-pressed={fix === "portal"} onClick={() => setFix("portal")}>portal the menu to body</button>
          </div>
          <p className="sc-read">
            {fix === "raise" && "Works, and now the card sits above the toolbar too, so the next dropdown war starts. Raising z-index is how pages end up at 99999."}
            {fix === "portal" && "The menu is rendered as the last child of body, outside every context. Position it from a measured rect. This is what every serious menu, tooltip and modal library does."}
            {fix === "none" && (menuHidden ? "The menu's z-index: 9999 is only compared with its siblings inside the card. The card's whole context paints at z 0, under the next section at z 1." : isContext ? "" : "No stacking context on the card, so the menu competes at the root with z 9999 and wins.")}
          </p>
        </div>
      </div>

      <div className="sc-grid">
        <div className="sc-scene" aria-label="Live demo">
          <div className="sc-toolbar">Toolbar <span>z-index: 2</span></div>
          <div className="sc-card" style={cardStyle}>
            <div className="sc-card-row">
              <span>Card {isContext ? <em>stacking context · z {cardZ}</em> : <em>no stacking context</em>}</span>
              <button type="button" className="sc-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>Options ▾</button>
            </div>
            {open && fix !== "portal" && <ul className="sc-menu"><li>Rename</li><li>Duplicate</li><li>Move to…</li><li className="is-danger">Delete</li><li className="sc-menu-z">z-index: 9999</li></ul>}
          </div>
          <div className="sc-next">Next section <span>position: relative; z-index: 1</span><p>The thing the menu needs to open over. A sticky header, a table, the next card, a map.</p></div>
          {open && fix === "portal" && <ul className="sc-menu sc-menu--portal"><li>Rename</li><li>Duplicate</li><li>Move to…</li><li className="is-danger">Delete</li><li className="sc-menu-z">z-index: 9999 · child of body</li></ul>}
        </div>
        <aside className="cst-panel sc-panel">
          <p className="cst-panel-kicker">Paint order, bottom to top</p>
          <ol className="sc-tree">
            {rows.map((r, i) => <li key={i} style={{ paddingLeft: `${r.depth * 1.1}rem` }} className={r.hot ? "is-hot" : ""}><span>{r.name}</span>{r.z && <code>{r.z}</code>}</li>)}
          </ol>
          {active.length > 0 && <>
            <p className="cst-panel-kicker" style={{ marginTop: "0.8rem" }}>Why the card is a context</p>
            {active.map((t) => <p key={t.id} className="cst-panel-why"><code>{t.label}</code>. {t.note}</p>)}
          </>}
        </aside>
      </div>
    </div>
  );
}
