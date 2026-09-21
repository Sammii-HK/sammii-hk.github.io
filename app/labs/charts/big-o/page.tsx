import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { BigO } from "../../../src/components/charts/BigO";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Big O, to scale",
  description: "Eight complexity classes on one chart for the n you choose, log or linear, with the time each would take at a billion operations a second.",
  alternates: { canonical: "https://labs.sammii.dev/charts/big-o/" },
  openGraph: { title: "Big O, to scale", description: "Constant to factorial, drawn honestly.", url: "https://labs.sammii.dev/charts/big-o/", type: "article" },
};

export default function BigOChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 09</p>
          <h1 className="chart-title">Big O, to scale</h1>
          <p className="chart-lead">
            Big O is the shape of how work grows with input. The textbook chart draws every class on one linear axis, which hides everything below quadratic in a flat line at the bottom. Switch the axis to log and the classes separate; drag n and watch the exponential and factorial curves leave the building. The table says what each would take on a machine doing a billion operations a second, which is the number that decides whether a feature ships.
          </p>
        </header>
        <BigO />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Operations are the bare function of n with no constant factors, which is what Big O describes and also why it is not a benchmark: a fast O(n²) beats a slow O(n log n) for small n every day. A billion operations a second is a round figure for one core doing simple work; real code with cache misses and branches does far fewer. Sources: Cormen, Leiserson, Rivest and Stein, Introduction to Algorithms; the ECMAScript specification (Array.prototype.sort must be stable; engines use TimSort, O(n log n)).</p>
        </footer>
      </article>
    </LabsShell>
  );
}
