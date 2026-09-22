"use client";
import { useEffect, useId, useRef, useState } from "react";

/**
 * The fix for the z-index chart: three ways to attach a menu to a button
 * inside a scrolling, transformed, clipped card. Absolute positioning is
 * trapped by the card. A popover in the top layer escapes every stacking
 * context but has to be positioned by hand in JavaScript, unless anchor
 * positioning does it in CSS. Feature support is detected, not assumed.
 */
type Mode = "absolute" | "popover" | "anchor";

export function AnchorPositioning() {
  const [mode, setMode] = useState<Mode>("absolute");
  const [open, setOpen] = useState(true);
  const [support, setSupport] = useState<{ anchor: boolean; popover: boolean } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [jsPos, setJsPos] = useState<{ top: number; left: number } | null>(null);
  const anchorName = `--btn-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    setSupport({
      anchor: typeof CSS !== "undefined" && CSS.supports("anchor-name: --a") && CSS.supports("position-area: bottom span-right"),
      popover: typeof HTMLElement !== "undefined" && "popover" in HTMLElement.prototype,
    });
  }, []);

  // the popover path has to do this itself, every frame that could move the button
  useEffect(() => {
    if (mode !== "popover" || !open) return;
    const place = () => { const r = btn.current?.getBoundingClientRect(); if (r) setJsPos({ top: r.bottom + 6, left: r.left }); };
    place();
    const el = pop.current; if (el && !el.matches(":popover-open")) { try { el.showPopover(); } catch { /* unsupported */ } }
    window.addEventListener("scroll", place, true); window.addEventListener("resize", place);
    return () => { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); };
  }, [mode, open]);
  useEffect(() => {
    const el = pop.current; if (!el) return;
    if (mode !== "absolute" && open) { try { if (!el.matches(":popover-open")) el.showPopover(); } catch { /* unsupported */ } }
    else { try { if (el.matches(":popover-open")) el.hidePopover(); } catch { /* unsupported */ } }
  }, [mode, open]);

  const menu = (
    <>
      <p className="ap-menu-title">Assign to</p>
      <ul><li>Priya</li><li>Sam</li><li>Wren</li><li>Unassigned</li></ul>
      <span className="ap-menu-tag">z-index: 9999</span>
    </>
  );

  return (
    <div className="ap">
      <div className="ap-controls">
        <div className="bo-toggle" role="group" aria-label="Positioning strategy">
          <button type="button" aria-pressed={mode === "absolute"} onClick={() => setMode("absolute")}>position: absolute</button>
          <button type="button" aria-pressed={mode === "popover"} onClick={() => setMode("popover")}>popover + JS</button>
          <button type="button" aria-pressed={mode === "anchor"} onClick={() => setMode("anchor")}>popover + anchor()</button>
        </div>
        <label className="sc-toggle"><input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} />menu open</label>
      </div>

      <div className="ap-scene">
        <div className="ap-card" aria-label="A card with overflow, a transform and its own stacking context">
          <div className="ap-card-head">Sprint board <span>overflow: auto · transform: translateZ(0)</span></div>
          <div className="ap-scroller">
            <div className="ap-task">Make the empty state legible</div>
            <div className="ap-task ap-task--target">
              <span>Fix the filter pills</span>
              <button ref={btn} type="button" className="sc-btn" style={mode === "anchor" ? ({ anchorName } as React.CSSProperties) : undefined} onClick={() => setOpen((o) => !o)} aria-expanded={open}>Assign ▾</button>
              {mode === "absolute" && open && <div className="ap-menu ap-menu--abs">{menu}</div>}
            </div>
            <div className="ap-task">Ship the chart index</div>
            <div className="ap-task">Write the release notes</div>
            <div className="ap-task">Rename the tokens</div>
          </div>
        </div>
        <div className="ap-next">Next section <span>position: relative; z-index: 1</span></div>
      </div>

      <div
        ref={pop}
        {...({ popover: "manual" } as Record<string, string>)}
        className={`ap-menu ap-menu--top ${mode === "anchor" ? "is-anchored" : ""}`}
        style={mode === "anchor" ? ({ positionAnchor: anchorName } as React.CSSProperties) : jsPos ? { top: `${jsPos.top}px`, left: `${jsPos.left}px` } : undefined}
      >{menu}</div>

      <div className="ap-read">
        {mode === "absolute" && <p><b>Trapped.</b> The menu is a child of the card, and the card scrolls, clips and has a transform, so it is clipped by the scroller and painted inside the card&rsquo;s stacking context. Scroll the list: the menu goes with it and gets cut off at the edge. The 9999 does nothing, for the reason in chart 13.</p>}
        {mode === "popover" && <p><b>Free, but hand-positioned.</b> <code>popover</code> puts the menu in the <b>top layer</b>, a separate layer above every stacking context and outside every <code>overflow</code>, so no ancestor can clip or cover it. The cost: the browser no longer knows where the button is, so a listener has to measure it with <code>getBoundingClientRect</code> on every scroll and resize. Scroll the card and watch the menu track it, one frame behind.</p>}
        {mode === "anchor" && <p><b>Free, and positioned in CSS.</b> The button declares <code>anchor-name</code>, the popover declares <code>position-anchor</code> and a <code>position-area</code>, and the browser keeps them together itself, in the compositor, with no JavaScript and no jitter. <code>position-try-fallbacks</code> flips it when it would go off screen. {support && !support.anchor && <em> Your browser does not support anchor positioning, so this panel is falling back to the hand-positioned path.</em>}</p>}
      </div>
      {support && <p className="jd-note">Support on this browser: <code>popover</code> {support.popover ? "yes" : "no"}, anchor positioning {support.anchor ? "yes" : "no"}. Both are detected with <code>CSS.supports</code> and a prototype check, not a user-agent string.</p>}
    </div>
  );
}
