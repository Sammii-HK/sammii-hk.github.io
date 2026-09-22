import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { RepaintMap } from "../../../src/components/charts/RepaintMap";
import { PROPS } from "./data";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "What a CSS property costs",
  description: "Every common CSS property sorted by what changing it forces the browser to do: layout, paint, or composite only. Pick one and the pipeline lights up.",
  alternates: { canonical: "https://labs.sammii.dev/charts/repaint/" },
  openGraph: { title: "What a CSS property costs", description: "Layout, paint or composite: the rendering pipeline as a map of the language.", url: "https://labs.sammii.dev/charts/repaint/", type: "article" },
};

export default function RepaintChart() {
  const composite = PROPS.filter((p) => p.cost === "composite").length;
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 07</p>
          <h1 className="chart-title">What a CSS property costs</h1>
          <p className="chart-lead">
            Change a property and the browser has to redo some of its pipeline: style, then maybe layout, then maybe paint, then composite. {PROPS.length} common properties, sorted into the three columns by how far back they send it. Only {composite} live in the cheap column, and two of those, <code>transform</code> and <code>opacity</code>, are the whole reason smooth animation is possible.
          </p>
        </header>
        <RepaintMap />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Categories are for Blink (Chromium) and describe the typical case; engines differ at the edges and keep moving properties down the list (filter and clip-path composite on promoted layers, for instance). Layout also implies paint and composite; paint implies composite. Sources: Chromium, Life of a Pixel and RenderingNG; Paul Lewis, Rendering performance (web.dev); the csstriggers.com data, Google, 2019 snapshot; Jake Archibald, In the loop.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
