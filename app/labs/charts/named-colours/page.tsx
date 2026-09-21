import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { NamedColours } from "../../../src/components/charts/NamedColours";
import { NAMES } from "./data";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Every named CSS colour, in OKLCH",
  description: "The 148 named CSS colours placed by what they look like: OKLCH hue round the wheel, chroma outward, resolved by your own browser. darkgray is lighter than gray.",
  alternates: { canonical: "https://labs.sammii.dev/charts/named-colours/" },
  openGraph: { title: "Every named CSS colour, in OKLCH", description: "148 names on a wheel, by what they look like.", url: "https://labs.sammii.dev/charts/named-colours/", type: "article" },
};

export default function NamedColoursChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 10</p>
          <h1 className="chart-title">Every named CSS colour, in OKLCH</h1>
          <p className="chart-lead">
            CSS has {NAMES.length} colour names, most of them inherited from X11 in the 1980s, where they were chosen by people naming paint chips, not by anyone with a colour model. Put them where they actually sit, by OKLCH hue and chroma, and the set shows its shape: a dense band of mid-lightness reds and blues, a thin green quarter, a cluster of pale near-whites named after fabrics, and six greys with two spellings each. Your browser resolves every name; nothing here is typed in.
          </p>
        </header>
        <NamedColours />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Names are the named colours of CSS Color Module Level 4, section 6.1, which are the SVG 1.1 names, which are the X11 rgb.txt names with a handful of corrections (gray, green, maroon and purple keep HTML&rsquo;s darker values; rebeccapurple was added in 2014). Each name is resolved by setting it as a canvas fillStyle and reading the hex back, then converted to Oklab and OKLCH with the matrices from Ottosson (2020) and to WCAG relative luminance. The wheel is OKLCH hue against chroma; lightness is the dot size and the sortable list.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
