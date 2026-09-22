import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { LetterAnatomy } from "../../../src/components/charts/LetterAnatomy";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "The anatomy of a letter",
  description: "Four specimens with their parts named and their metric lines measured from the live font in the browser: x-height, cap height, ascender, descender and the overshoot that makes a round letter look the same height as a flat one.",
  alternates: { canonical: "https://labs.sammii.dev/charts/letter/" },
  openGraph: { title: "The anatomy of a letter", description: "Bowl, counter, ear, aperture, and the overshoot you were never told about.", url: "https://labs.sammii.dev/charts/letter/", type: "article" },
};

const fontsHref = "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&display=swap";

export default function LetterChart() {
  return (
    <LabsShell>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsHref} />
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 24</p>
          <h1 className="chart-title">The anatomy of a letter</h1>
          <p className="chart-lead">
            Every argument about a typeface is really an argument about four or five small decisions: how open the counter is, how wide the aperture is, whether the crossbar is level, what the leg of the R does. Once the parts have names the argument gets shorter. Four specimens, their parts labelled, and their horizontal lines measured from the real font rather than drawn from a textbook.
          </p>
        </header>
        <LetterAnatomy />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The metric lines are measured in your browser with <code>measureText</code> at 400px after the font loads: x-height from a lowercase x, cap height from an H, ascender from an h, descender from a p, and the overshoot as the difference between a round o and a flat x. Overshoot is the one that surprises people: a circle that stops exactly at the x-height line looks short, so type designers draw round letters a few thousandths of an em taller, and the measured value here is that font&rsquo;s actual choice. The part names are placed by hand on each drawing, because where a bowl or an ear sits is a property of the glyph outline, not a metric the font exposes; every name used is standard (Bringhurst; Cheng; the <em>Type Nomenclature</em> ISO draft). The classification cue on the e is real and useful: a slanted crossbar marks a Venetian or humanist roman, a level one a Garalde or later, which is chart 04&rsquo;s first branch. Sources: Bringhurst, The Elements of Typographic Style; Cheng, Designing Type; Unger, Theory of Type Design.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
