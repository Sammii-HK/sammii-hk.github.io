import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { Springs } from "../../../src/components/charts/Springs";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Easing versus springs",
  description: "A CSS transition and a spring moving the same card, recorded from the screen every frame. Interrupt them mid-flight and the difference is on the graph: the spring keeps its velocity, the transition starts again.",
  alternates: { canonical: "https://labs.sammii.dev/charts/springs/" },
  openGraph: { title: "Easing versus springs", description: "Interrupt it mid-flight. One of them keeps its momentum.", url: "https://labs.sammii.dev/charts/springs/", type: "article" },
};

export default function SpringsChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 12</p>
          <h1 className="chart-title">Easing versus springs</h1>
          <p className="chart-lead">
            A transition is a duration and a curve: it will arrive in exactly 400 ms whatever you do. A spring is a force: stiffness pulls it toward the target, damping bleeds off speed, and it arrives when the physics says so. The difference is invisible on a single clean move and obvious the moment you interrupt one. Click the button, then click it again before the cards land. Both lines on the graph are recorded from the screen, not drawn from the formula.
          </p>
        </header>
        <Springs />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The spring is a damped harmonic oscillator, F = −k(x − target) − cv, integrated with semi-implicit Euler in 1 ms substeps on every animation frame. The damping ratio ζ = c / (2√(km)) says the shape: under 1 it overshoots (Bouncy, Wobbly), over 1 it creeps in without crossing (Heavy), exactly 1 is the fastest arrival with no overshoot. Settle time is when the card is within 0.1% of the target and nearly still, from rest; it is the number a spring has instead of a duration. The transition&rsquo;s position is read back each frame from the element&rsquo;s computed transform matrix, which is why an interruption shows the fresh curve starting from the mid-flight position with zero velocity, the small hitch you feel in most transition-driven interfaces.</p>
          <p>Presets are in the spirit of Framer Motion and react-spring defaults (stiffness 170, damping 26 is the classic react-spring default). CSS has no spring timing function as of 2026, though <code>linear()</code> with many stops can bake one; Apple&rsquo;s UIKit has used springs by default since iOS 7, which is a large part of why iOS feels the way it does. Sources: react-spring and Framer Motion documentation; Apple WWDC 2023, Animate with springs; CSS Easing Functions Level 2.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
