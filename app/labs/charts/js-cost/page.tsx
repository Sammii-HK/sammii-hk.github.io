import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { JsCost } from "../../../src/components/charts/JsCost";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "What a byte of JavaScript costs",
  description: "A bundle of the size you choose is generated, gzipped, parsed, compiled and executed in your browser and timed, then laid next to the same bytes arriving as a JPEG. Identical download, and only one of them stops the page.",
  alternates: { canonical: "https://labs.sammii.dev/charts/js-cost/" },
  openGraph: { title: "What a byte of JavaScript costs", description: "Same bytes as a JPEG. Not the same cost. Measured.", url: "https://labs.sammii.dev/charts/js-cost/", type: "article" },
};

export default function JsCostChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 21</p>
          <h1 className="chart-title">What a byte of JavaScript costs</h1>
          <p className="chart-lead">
            The same number of bytes as a JPEG and as a bundle arrive over the same wire in the same time, and only one of them then stops the page. An image is decoded off the main thread and painted. JavaScript has to be parsed, compiled and run, on the thread that also handles your tap, before anything it renders can appear. Pick a size, press measure, and the page builds that bundle and times every stage on your own machine.
          </p>
        </header>
        <JsCost />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The bundle is generated in the page: thousands of small functions with varied identifiers and literals so it gzips roughly like real code (real production bundles compress 3 to 4×; the measured ratio is shown). Transfer size comes from <code>CompressionStream(&quot;gzip&quot;)</code>. Parse and compile is timed around <code>new Function(source)</code>, which parses the whole text and compiles the top level while inner functions are pre-parsed and compiled lazily, as V8 does for a script; the first execution then compiles each function as it is called, which is why the execute stage is not small. Download is computed, not measured: one round trip plus the gzipped bytes at the chosen bandwidth, the same model as the URL chart, and the JPEG lane is given the identical transfer size so the download term cancels; its decode is estimated at 0.04 ms per KB, which is generous to JavaScript. A caveat in the honest direction: this synthetic bundle only defines and calls small functions, while a real bundle of the same size bootstraps a framework and hydrates a tree, so its execute stage is larger than the one measured here. Each measurement generates a fresh source text, because an identical string would hit the engine's compilation cache and report a parse time of nearly zero. The device factors are the usual working numbers for JavaScript on a mid-range and a low-end Android against a laptop; the real gap for your users is in your analytics. Sources: Osmani, The Cost of JavaScript (2018, updated); V8 blog, Blazingly fast parsing; Chrome DevTools performance documentation.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
