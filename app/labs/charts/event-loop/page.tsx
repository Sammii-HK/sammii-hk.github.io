import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { EventLoop } from "../../../src/components/charts/EventLoop";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "The event loop, step by step",
  description: "Three real snippets run through a model of the browser's event loop: the call stack, the microtask queue, the task queue, rAF and the render step, one step at a time.",
  alternates: { canonical: "https://labs.sammii.dev/charts/event-loop/" },
  openGraph: { title: "The event loop, step by step", description: "Why 1, 4, 3, 2. Step through it.", url: "https://labs.sammii.dev/charts/event-loop/", type: "article" },
};

export default function EventLoopChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 08</p>
          <h1 className="chart-title">The event loop, step by step</h1>
          <p className="chart-lead">
            JavaScript runs one thing at a time, and the order it picks the next thing is the whole story: the microtask queue drains completely before the next task, rAF callbacks run in the render step, and rendering only happens between tasks. Three snippets, stepped through a model that follows those rules, with the console on the right.
          </p>
        </header>
        <EventLoop />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The model implements the HTML specification&rsquo;s processing model in miniature: run a task to completion, perform a microtask checkpoint, then, if there is a rendering opportunity, run animation frame callbacks and update the rendering, then take the next task. It treats a 0 ms timer as due before the next frame, which is what happens in practice (frames are about 16 ms apart and the timer clamp is 1 to 4 ms), and ignores task sources and priorities, which do not change these orderings. Sources: WHATWG HTML, section 8.1.7 Event loops; Jake Archibald, Tasks, microtasks, queues and schedules (2015) and In the loop (JSConf.Asia 2018); Philip Roberts, What the heck is the event loop anyway? (JSConf EU 2014).</p>
        </footer>
      </article>
    </LabsShell>
  );
}
