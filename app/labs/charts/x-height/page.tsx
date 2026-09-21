import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { XHeight } from "../../../src/components/charts/XHeight";
import { FAMILIES } from "./data";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Why 16px is not 16px",
  description: "Twenty-two families loaded and measured on your machine with the canvas text API: x-height, cap height, ascender, descender and line box as fractions of the em, the size each needs to match a reference, and font-size-adjust switched on live.",
  alternates: { canonical: "https://labs.sammii.dev/charts/x-height/" },
  openGraph: { title: "Why 16px is not 16px", description: "The font-size is a box. Every family fills it differently. Measured live.", url: "https://labs.sammii.dev/charts/x-height/", type: "article" },
};

const fontsHref = `https://fonts.googleapis.com/css2?${FAMILIES.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`).join("&")}&display=swap`;

export default function XHeightChart() {
  return (
    <LabsShell>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsHref} />
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 18</p>
          <h1 className="chart-title">Why 16px is not 16px</h1>
          <p className="chart-lead">
            font-size sets the em box, and nothing in the box is required to be any particular size. Verdana&rsquo;s lowercase fills more than half of it; Garamond&rsquo;s, barely two fifths. Which is why a fallback font looks the wrong size, why the same line-height looks tight in one family and loose in another, and why an icon next to text never quite centres. Every number below is measured in your browser, from the fonts as they render here.
          </p>
        </header>
        <XHeight />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Measured with <code>CanvasRenderingContext2D.measureText</code> at 100px after <code>document.fonts.load</code> resolves for every family: x-height is the <code>actualBoundingBoxAscent</code> of a lowercase x, cap height of an H, ascender of a d, descender the <code>actualBoundingBoxDescent</code> of a p; the line box is <code>fontBoundingBoxAscent + fontBoundingBoxDescent</code>, the values the browser uses for <code>line-height: normal</code>. Glyph overshoot means round letters measure slightly taller than flat ones, so the x-height here is the flat x, which is what the type designer specified. System families are measured only if your machine has them, and a Google family that fails to load is left out rather than measured as its fallback. <code>font-size-adjust</code> takes an x-height ratio (or <code>ex-height from-font</code>) and scales the fallback so its lowercase matches; it has shipped in every engine since 2024. Sources: CSS Fonts Module Level 4, section 3.6; HTML Standard, TextMetrics; Bringhurst, The Elements of Typographic Style, on x-height and apparent size.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
