import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { BigO } from "../../../src/components/charts/BigO";
import { AccidentalQuadratic } from "../../../src/components/charts/AccidentalQuadratic";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Big O, in the keystroke",
  description: "A filtered list that stops keeping up with your typing, measured per keystroke, and the one line that causes it. Then eight complexity classes to scale, log or linear, with the time each takes at a billion operations a second.",
  alternates: { canonical: "https://labs.sammii.dev/charts/big-o/" },
  openGraph: { title: "Big O, in the keystroke", description: "The search box that stops keeping up, and the one line behind it.", url: "https://labs.sammii.dev/charts/big-o/", type: "article" },
};

export default function BigOChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 09</p>
          <h1 className="chart-title">Big O, in the keystroke</h1>
          <p className="chart-lead">
            Big O is the shape of how work grows with input, and in an interface you meet it as the search box that starts lagging behind your fingers once the list gets long. Type into both fields below: they do the same job on the same list, and one of them has a single line that is quadratic. Then the classes themselves, to scale, and what each costs at a billion operations a second, which is the number that decides whether a feature ships.
          </p>
        </header>
        <h2 className="section-eyebrow">What it feels like</h2>
        <AccidentalQuadratic />
        <h2 className="section-eyebrow" style={{ marginTop: "2.5rem" }}>The classes, to scale</h2>
        <BigO />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The demo measures the real filter in the keystroke handler with performance.now(), on your machine, so the numbers are yours. Two budgets are drawn: 16.7 ms is one frame at 60 Hz, past which typing drops frames; 100 ms is the long-standing threshold for feeling instantaneous (Nielsen, Response Times: The 3 Important Limits, 1993). The quadratic line is the most common accidental one in interface code: <code>array.includes</code>, <code>indexOf</code> or <code>find</code> inside a loop over another array. The fix is a Set or a Map built once.</p>
          <p>Operations are the bare function of n with no constant factors, which is what Big O describes and also why it is not a benchmark: a fast O(n²) beats a slow O(n log n) for small n every day. A billion operations a second is a round figure for one core doing simple work; real code with cache misses and branches does far fewer. Sources: Cormen, Leiserson, Rivest and Stein, Introduction to Algorithms; the ECMAScript specification (Array.prototype.sort must be stable; engines use TimSort, O(n log n)).</p>
        </footer>
      </article>
    </LabsShell>
  );
}
