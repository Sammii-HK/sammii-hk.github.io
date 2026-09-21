import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { LayoutEras } from "../../../src/components/charts/LayoutEras";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Thirty years of CSS layout, the same page each way",
  description: "One page built seven times: tables, floats, inline-block, flexbox, grid, container queries and subgrid, in real CSS rendered by your browser. Drag the width and what each era could not do is visible, not described.",
  alternates: { canonical: "https://labs.sammii.dev/charts/layout/" },
  openGraph: { title: "Thirty years of CSS layout, the same page each way", description: "Tables to subgrid, same content, real CSS. Drag the width.", url: "https://labs.sammii.dev/charts/layout/", type: "article" },
};

export default function LayoutChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 17</p>
          <h1 className="chart-title">Thirty years of CSS layout, the same page each way</h1>
          <p className="chart-lead">
            A header, a sidebar, a main column with a card grid, a footer. Every generation of CSS could build it, and every generation had one thing it could not do that the next one was invented for. The page below is built seven times in the real CSS of each era, rendered by your browser, not drawn. Pick an era, drag the width, and look at the cards: their heights, their alignment, and what happens when the space gets narrow.
          </p>
        </header>
        <LayoutEras />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Dates are when each technique became usable in practice, not when it was first specified: tables for layout from Netscape 2 (1996); floats and positioning from CSS 2 (1998) once browsers caught up; inline-block usable across browsers around 2006 after IE7; flexbox in its final syntax across browsers by 2013; grid shipped in Chrome, Firefox, Safari and Edge within a few weeks of each other in 2017; container queries in Chrome 105 and Safari 16 in 2022, Firefox 110 in 2023; subgrid in all three engines by September 2023. The demo uses the modern syntax for each era rather than the vendor-prefixed versions people actually wrote at the time. In the container-query and subgrid eras, the card component is identical in the sidebar and the main column and lays itself out from the width of its own cell; drag the width to watch it switch. Sources: CSS Flexible Box Layout Module Level 1; CSS Grid Layout Module Level 2; CSS Containment Module Level 3; Can I Use.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
