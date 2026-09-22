import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { AnchorPositioning } from "../../../src/components/charts/AnchorPositioning";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Getting the menu out of the card",
  description: "The same dropdown three ways inside a scrolling, transformed card: absolute and trapped, a popover in the top layer positioned by hand in JavaScript, and a popover positioned in CSS with anchor(). Support detected live.",
  alternates: { canonical: "https://labs.sammii.dev/charts/anchor/" },
  openGraph: { title: "Getting the menu out of the card", description: "The top layer, and the two ways to aim it.", url: "https://labs.sammii.dev/charts/anchor/", type: "article" },
};

export default function AnchorChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 23</p>
          <h1 className="chart-title">Getting the menu out of the card</h1>
          <p className="chart-lead">
            Chart 13 showed why <code>z-index: 9999</code> cannot rescue a menu from inside a stacking context. This is the way out. The card below scrolls, has a transform and clips its content, which is every ordinary card in every product. Open the menu and switch strategy: watch it get clipped, then escape into the top layer, then stay attached to its button without a single line of JavaScript.
          </p>
        </header>
        <AnchorPositioning />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The top layer is a real, separate layer the browser paints above the whole document, outside every stacking context and unaffected by any ancestor&rsquo;s <code>overflow</code>, <code>clip-path</code> or <code>filter</code>. Only three things can put an element there: <code>dialog.showModal()</code>, fullscreen, and the <code>popover</code> attribute, which also gives you light-dismiss, Escape to close, and focus management for free with <code>popover=&quot;auto&quot;</code> (this demo uses <code>manual</code> so the panel stays put while you read). <code>popover</code> has been in all three engines since early 2024. Anchor positioning is the missing half: <code>anchor-name</code> on the button, <code>position-anchor</code> and <code>position-area</code> on the popover, and the browser keeps them together itself, including while the anchor scrolls, with <code>position-try-fallbacks</code> for the flip when it would overflow the viewport. It shipped in Chromium 125 (2024) and is behind a flag or unimplemented elsewhere at the time of writing, which is why the JavaScript path is still the compatible one and Floating UI still exists. The support line under the demo is measured with <code>CSS.supports</code> on this browser. Sources: HTML Standard, the popover attribute and the top layer; CSS Anchor Positioning Level 1; MDN, Using CSS anchor positioning.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
