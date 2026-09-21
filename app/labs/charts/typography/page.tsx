import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { TypographyGenome } from "../../../src/components/charts/TypographyGenome";
import { FONT_FAMILIES, NODES } from "./data";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "The typography genome",
  description: "A family tree of Latin type from Gutenberg's Textura to variable fonts: blackletter, serif, sans, monospace and the technology that carries them, every node shown in a live specimen.",
  alternates: { canonical: "https://labs.sammii.dev/charts/typography/" },
  openGraph: { title: "The typography genome", description: "From Textura to variable fonts, as a family tree with live specimens.", url: "https://labs.sammii.dev/charts/typography/", type: "article" },
};

const fontsHref = `https://fonts.googleapis.com/css2?${FONT_FAMILIES.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`).join("&")}&display=swap`;

export default function TypographyChart() {
  return (
    <LabsShell>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsHref} />
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 04</p>
          <h1 className="chart-title">The typography genome</h1>
          <p className="chart-lead">
            {NODES.length} families of Latin type from Gutenberg&rsquo;s Textura to variable fonts, dated to their first exemplar, in five lanes. Hover a node and the specimen sets itself in a live font of that style, so the difference between a Garalde and a Didone is something you see rather than read. Solid lines are descent, dotted lines are influence.
          </p>
        </header>
        <TypographyGenome />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Classification follows Vox-ATypI (1954) where it helps and ignores it where it does not: humanist, garalde, transitional, didone and slab for the serifs; grotesque, neo-grotesque, humanist and geometric for the sans. Dates are first exemplars: Jenson&rsquo;s roman 1470, Griffo&rsquo;s italic 1501, Baskerville 1757, Didot 1784, Figgins&rsquo;s Egyptian 1815, Caslon&rsquo;s sans 1816, Akzidenz-Grotesk 1898, Johnston 1916, Futura 1927, Helvetica and Univers 1957, OpenType 1.8 with variations 2016.</p>
          <p>The originals are not on Google Fonts, so each specimen names the stand-in it is set in. Sources: Robert Bringhurst, The Elements of Typographic Style; Stephen Coles, The Anatomy of Type; Monotype and Berthold specimen histories; the OpenType 1.8 specification (2016).</p>
          <p>Companion to the Love Letters series on the blog and to Kern, the variable-font explorer.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
