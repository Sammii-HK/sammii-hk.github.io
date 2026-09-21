import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { StackingContexts } from "../../../src/components/charts/StackingContexts";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Why z-index: 9999 does nothing",
  description: "A real dropdown on a real card, painted by your browser. Toggle transform, opacity, filter or will-change on the card and watch the menu vanish under the next section, with the stacking-context tree and paint order alongside.",
  alternates: { canonical: "https://labs.sammii.dev/charts/stacking/" },
  openGraph: { title: "Why z-index: 9999 does nothing", description: "Stacking contexts, live, with the paint order the browser actually used.", url: "https://labs.sammii.dev/charts/stacking/", type: "article" },
};

export default function StackingChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 13</p>
          <h1 className="chart-title">Why z-index: 9999 does nothing</h1>
          <p className="chart-lead">
            The menu has z-index: 9999 and it is still under the section below it. Nothing is broken: z-index only competes with siblings inside the same stacking context, and something on the card quietly created one. Six properties that do it are on the left; toggle them and the browser repaints the scene, while the panel shows the tree it built and the order it painted. Two fixes on the right, one of which is the start of the next war.
          </p>
        </header>
        <StackingContexts />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>A stacking context is created by the root element, by a positioned element with a z-index other than auto, by fixed and sticky positioning, by flex and grid items with a z-index, by any opacity below 1, any transform, filter, backdrop-filter, perspective, clip-path, mask, mix-blend-mode other than normal, isolation: isolate, contain: layout or paint, and by will-change naming any of those. Within a context the browser paints backgrounds, then negative z-index, then blocks in flow, then floats, then inline content, then z-index auto and 0 positioned elements in document order, then positive z-index ascending. A child context is painted as one unit at its own z-index: nothing inside it, however large the number, can escape above a sibling of its parent.</p>
          <p>The demo is not a picture of the rule: the scene is ordinary DOM and CSS and the browser paints it. The paint order panel is computed from the same rules and agrees with what you see. The portal fix places the menu as a child of body and positions it from a measured rect, the pattern used by Radix, Headless UI, Floating UI and every native-feeling menu library; the newer answer is the top layer via <code>popover</code> and <code>dialog.showModal()</code>, which sits above every stacking context by definition. Source: CSS Positioned Layout Module Level 3, Appendix A, Elaborate description of stacking contexts; MDN, Stacking context.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
