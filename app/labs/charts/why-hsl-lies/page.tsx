import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { WhyHslLies } from "../../../src/components/charts/WhyHslLies";
import "./chart.css";

export const metadata: Metadata = {
  title: "Why HSL lies",
  description: "The same nominal lightness across 24 hues in HSL, CIELCH and OKLCH, with the measured luminance under every swatch.",
  alternates: { canonical: "https://labs.sammii.dev/charts/why-hsl-lies/" },
  openGraph: { title: "Why HSL lies", description: "Same lightness, 24 hues, three colour spaces, measured.", url: "https://labs.sammii.dev/charts/why-hsl-lies/", type: "article" },
};

export default function WhyHslLiesChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 02</p>
          <h1 className="chart-title">Why HSL lies</h1>
          <p className="chart-lead">
            Ask HSL for twenty-four hues at fifty percent lightness and you get a yellow you can barely look at next to a blue that is nearly navy. The number is the same; the light reaching your eye is not. CIELCH and OKLCH define lightness by how bright a colour looks, so the same request gives an even row. Every luminance here is computed from the swatch you are looking at.
          </p>
        </header>
        <WhyHslLies />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>HSL lightness is the mean of the largest and smallest RGB channels, so a saturated yellow (two channels high) and a saturated blue (one channel high) get the same L while differing by about nine to one in luminance. CIELAB and Oklab both take a cube root of a luminance-like quantity, which is why their rows are flat. The LCH and OKLCH rows are matched to the HSL row through the luminance of the same grey, so the three are comparing like with like.</p>
          <p>Relative luminance is the WCAG 2 definition (0.2126 R + 0.7152 G + 0.0722 B on linear sRGB). Conversions are implemented from first principles in the page, no library: sRGB companding, Oklab (Ottosson 2020), CIELAB with the D65 white point. Swatches outside sRGB are clipped and hatched rather than gamut-mapped, so what you see is honest about what the screen can do.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
