import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { FrameAnatomy, FrameMeter, JankCauses } from "../../../src/components/charts/FrameBudget";
import { chartHref } from "../registry";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "The 16.7ms frame budget",
  description: "What has to fit in one frame at 60 Hz (16.7 ms) and at 120 Hz (8.3 ms): input, JavaScript, style, layout, paint and composite, drawn to scale against the deadline, with a live meter that measures your own screen's frames as you add work.",
  alternates: { canonical: "https://labs.sammii.dev/charts/frame-budget/" },
  openGraph: { title: "The 16.7ms frame budget", description: "Six stages, one deadline, and a 120 Hz screen halves it.", url: "https://labs.sammii.dev/charts/frame-budget/", type: "article" },
};

export default function FrameBudgetChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 35</p>
          <h1 className="chart-title">The 16.7ms frame budget</h1>
          <p className="chart-lead">
            A 60 Hz screen asks for a new picture every 16.7 ms; a 120 Hz screen every 8.3. Inside that window the browser has to take the input, run your JavaScript, restyle, lay out, paint and composite, and when the sum runs over, the screen shows the old frame again. That repeated frame is jank. First feel it on your own screen, then see one frame laid out stage by stage against both deadlines.
          </p>
        </header>
        <h2 className="section-eyebrow">What it feels like</h2>
        <FrameMeter />
        <h2 className="section-eyebrow" style={{ marginTop: "2.5rem" }}>One frame, to scale</h2>
        <FrameAnatomy />
        <h2 className="section-eyebrow" style={{ marginTop: "2.5rem" }}>Where jank comes from</h2>
        <JankCauses />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The meter is measured, not modelled: a <code>requestAnimationFrame</code> loop moves the ball and records the gap between successive frame timestamps, and the slider adds a synchronous busy loop of that many milliseconds to every frame. Your refresh interval is the median gap while no work is added. A frame counts as late when its gap is more than one and a half refresh intervals. Browsers may throttle a background tab or a low-power device, and the loop pauses when it scrolls out of view.</p>
          <p>The budgets are arithmetic: 1000 ms / 60 = 16.7 ms, 1000 ms / 120 = 8.3 ms. The stage costs in the frames are illustrative figures for a mid-range laptop, chosen to match the typical page work in <a href={chartHref("keypress")}>How a keypress becomes a pixel</a>, except where a source is named: the 28 ms of layout is web.dev&rsquo;s worked example, and 50 ms is where the browser&rsquo;s long-task API starts counting. Which stages a CSS change triggers is in <a href={chartHref("repaint")}>What a CSS property costs</a>; this chart is about how much of them fits before the deadline. The browser does some of the composite and raster work on other threads, in parallel with the next frame&rsquo;s main-thread work, so the stages do not always queue end to end as drawn; the main thread&rsquo;s share still has to fit.</p>
          <p>Sources: Paul Lewis, Rendering performance, web.dev (the five-stage pixel pipeline, and 10 ms for your own work in a 16.66 ms frame); web.dev, Measure performance with the RAIL model (browsers need about 6 ms to render each frame; process input within 50 ms); Jeremy Wagner, Paul Lewis and Barry Pollard, Avoid large, complex layouts and layout thrashing, web.dev; Paul Lewis, Simplify paint complexity and reduce paint areas, web.dev; web.dev, Optimize long tasks and Interaction to Next Paint (INP of 200 ms or less is good); Mariko Kosaka, Inside look at modern web browser, part 3, and RenderingNG architecture, Chrome for Developers.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
