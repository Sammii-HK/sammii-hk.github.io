import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { EventLoop } from "../../../src/components/charts/EventLoop";
import { JankDemo } from "../../../src/components/charts/JankDemo";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "The event loop, for interfaces",
  description: "Why a loading label never shows, why one animation survives a busy page and another freezes, and why 1, 4, 3, 2: the browser's event loop as a design engineering problem, with live demos and a stepper.",
  alternates: { canonical: "https://labs.sammii.dev/charts/event-loop/" },
  openGraph: { title: "The event loop, for interfaces", description: "Why the loading label never shows. Live demos and a stepper.", url: "https://labs.sammii.dev/charts/event-loop/", type: "article" },
};

export default function EventLoopChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 08</p>
          <h1 className="chart-title">The event loop, for interfaces</h1>
          <p className="chart-lead">
            Every stutter, every spinner that never appears, every click that seems to do nothing for a moment is the same thing: the browser runs one task at a time on the thread that also paints. Start with what that does to an interface, with real work and real frames. Then the rules underneath, stepped through: the microtask queue drains before the next task, rAF runs in the render step, and painting only happens between tasks.
          </p>
        </header>
        <h2 className="section-eyebrow">What it does to an interface</h2>
        <JankDemo />
        <h2 className="section-eyebrow" style={{ marginTop: "2.5rem" }}>The rules underneath, step by step</h2>
        <EventLoop />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The demos do real work: a synchronous loop for the chosen number of milliseconds on the main thread, and the frame meter measures the gaps between requestAnimationFrame callbacks, so a dropped frame is a measured one. The label demo shows the single most common loading-state bug in the wild: state set and heavy work in the same task, so the state is never painted. The fix is to give the loop a turn (a frame, then a task) before the work, or, better, move the work off the thread with a Worker or split it.</p>
          <p>The model implements the HTML specification&rsquo;s processing model in miniature: run a task to completion, perform a microtask checkpoint, then, if there is a rendering opportunity, run animation frame callbacks and update the rendering, then take the next task. It treats a 0 ms timer as due before the next frame, which is what happens in practice (frames are about 16 ms apart and the timer clamp is 1 to 4 ms), and ignores task sources and priorities, which do not change these orderings. Sources: WHATWG HTML, section 8.1.7 Event loops; Jake Archibald, Tasks, microtasks, queues and schedules (2015) and In the loop (JSConf.Asia 2018); Philip Roberts, What the heck is the event loop anyway? (JSConf EU 2014).</p>
        </footer>
      </article>
    </LabsShell>
  );
}
