import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { FloatingPoint } from "../../../src/components/charts/FloatingPoint";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Floating point, at the pixel",
  description: "The seam between tiles at a third of the width, the border that goes fuzzy at half a pixel, the price that comes out at 0.30000000000000004, and the 64 bits of any number you type. All measured or computed live.",
  alternates: { canonical: "https://labs.sammii.dev/charts/floating-point/" },
  openGraph: { title: "Floating point, at the pixel", description: "Why there is a seam, why the border is fuzzy, why 0.1 + 0.2.", url: "https://labs.sammii.dev/charts/floating-point/", type: "article" },
};

export default function FloatingPointChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 20</p>
          <h1 className="chart-title">Floating point, at the pixel</h1>
          <p className="chart-lead">
            Three columns at 33.333% leave a hairline of background showing. A card that animates in on a transform has a border that looks slightly out of focus. A basket adds three items at &pound;0.10 and shows &pound;0.30000000000000004. None of these is a bug in your code; they are what happens when numbers that cannot be represented meet a grid that can only be whole. Drag the widths and watch the browser measure itself.
          </p>
        </header>
        <FloatingPoint />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Tile widths are measured with <code>getBoundingClientRect</code>, which returns the layout engine&rsquo;s fractional values (CSS pixels are real numbers; layout in Chromium runs in 1/64 px units, in WebKit and Gecko in 1/60 px). Painting then happens on the device-pixel grid, so a fractional edge is either snapped (layout properties: widths, margins, positions) or rasterised with anti-aliasing (transforms, which are applied by the compositor after layout). That is why a translated element can look blurred and a positioned one cannot, and why <code>will-change: transform</code> on text sometimes makes it soft. Sums are IEEE 754 doubles as JavaScript evaluates them; the bit view decodes the actual stored word with a DataView, and the 20-significant-figure readout is what the double really holds. Sources: IEEE 754-2019; CSS Values and Units Level 4, section 6 (the px unit is a real number); Chromium LayoutUnit documentation; Goldberg, What Every Computer Scientist Should Know About Floating-Point Arithmetic (1991).</p>
        </footer>
      </article>
    </LabsShell>
  );
}
