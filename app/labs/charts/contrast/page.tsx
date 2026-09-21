import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { ContrastThreeWays } from "../../../src/components/charts/ContrastThreeWays";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Contrast, two ways that disagree",
  description: "The same text and background scored by WCAG 2 and APCA side by side, rendered at the sizes each cares about, plus the full grey ramp on white and on black to show exactly where the two methods part company.",
  alternates: { canonical: "https://labs.sammii.dev/charts/contrast/" },
  openGraph: { title: "Contrast, two ways that disagree", description: "WCAG 2 says orange on white fails. Your eyes say it's a fine heading. APCA explains.", url: "https://labs.sammii.dev/charts/contrast/", type: "article" },
};

export default function ContrastChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 14</p>
          <h1 className="chart-title">Contrast, two ways that disagree</h1>
          <p className="chart-lead">
            WCAG 2 contrast is a ratio of two luminances, and it has three problems a designer meets weekly: it is symmetric, so white on orange scores the same as orange on white; it over-rewards mid greys on black; and it fails colours that read perfectly well as headings. APCA, the candidate method for WCAG 3, is perceptual, cares which colour is the text, and gives a size and weight rather than a pass. Pick a pair and read both numbers next to the actual text.
          </p>
        </header>
        <ContrastThreeWays />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>WCAG 2 ratio: (L1 + 0.05) / (L2 + 0.05) with L the relative luminance from linearised sRGB, thresholds 4.5:1 (AA body), 3:1 (AA large, 18pt or 14pt bold), 7:1 (AAA). It is the legal standard in most jurisdictions and the one your audit will use. APCA Lc is computed here with the published APCA-W3 0.1.9 constants (soft black clamp 0.022, exponents 0.56/0.57 for dark-on-light and 0.65/0.62 for light-on-dark, scale 1.14, offset 0.027); the font-size guidance is the simplified lookup: Lc 90 for preferred body, 75 for minimum body, 60 for large or bold, 45 for headlines, 30 for non-text. APCA is still a candidate, not yet normative, and WCAG 3 remains a working draft as of 2026; the honest position is to ship to WCAG 2 and design with APCA.</p>
          <p>The grey ramps make the disagreement visible: on white the two thresholds land close together (#767676 is the last grey WCAG 2 passes, and APCA agrees it is marginal), on black WCAG 2 passes greys that APCA rates around Lc 40, which is why so many dark-mode interfaces with &ldquo;passing&rdquo; secondary text are hard to read. Sources: WCAG 2.2, Success Criterion 1.4.3; APCA-W3 documentation and the apca-w3 reference implementation, Myndex Research; Sommers, Andrew, Why APCA.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
