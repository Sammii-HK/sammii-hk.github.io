import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { CommunicationTimeline } from "../../../src/components/charts/CommunicationTimeline";
import "./chart.css";

export const metadata: Metadata = {
  title: "Six centuries of communication and type",
  description: "From Gutenberg to ChatGPT on one spine: 65 inventions, typefaces and type styles, 1440 to 2024, with the two histories read against each other.",
  alternates: { canonical: "https://labs.sammii.dev/charts/communication/" },
  openGraph: { title: "Six centuries of communication and type", description: "Gutenberg to ChatGPT on one spine.", url: "https://labs.sammii.dev/charts/communication/", type: "article" },
};

export default function CommunicationChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 03</p>
          <h1 className="chart-title">Six centuries of communication and type</h1>
          <p className="chart-lead">
            Every leap in how we talk to each other changed how we set words on a page, and the other way round. Inventions on the left of the spine, typefaces and type styles on the right, 1440 to 2024. The telegraph arrives with the grotesques; the mobile phone with Bell Centennial; the web with a hundred new faces a week. Tap an entry to read it.
          </p>
        </header>
        <CommunicationTimeline />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>A rebuild of an infographic I made as a student, with the original writing kept and only typos corrected. Dates are the conventional ones: Gutenberg's press to 1440, the first sans serif to Caslon's 1816 specimen, the web to 1989. The gaps on the spine are to scale in years where they are long enough to matter.</p>
          <p>Part of a series of information-design pieces on the things design engineers work with. Companion to the eleven Love Letters to typefaces on the blog.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
