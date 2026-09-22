import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { Specificity } from "../../../src/components/charts/Specificity";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Specificity, three columns",
  description: "Type any selector and see its specificity as three bars, computed by a parser that follows Selectors Level 4 (:is, :where, :not, :has, nth-child of), with the rules on one button ranked and the cascade steps that beat specificity listed in order.",
  alternates: { canonical: "https://labs.sammii.dev/charts/specificity/" },
  openGraph: { title: "Specificity, three columns", description: "Why your override doesn't apply, as three bars.", url: "https://labs.sammii.dev/charts/specificity/", type: "article" },
};

export default function SpecificityChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 15</p>
          <h1 className="chart-title">Specificity, three columns</h1>
          <p className="chart-lead">
            Your override is there, it is later in the file, and the button still ignores it. Specificity is not a score, it is three separate counts compared left to right: ids, then classes and their kin, then types. One id outranks any number of classes; one class outranks any number of element names. Add the rules that target one button and see which one the browser will pick, and the seven things that get a say before specificity even comes up.
          </p>
        </header>
        <Specificity />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Computed by a small parser rather than a lookup: ids count in the first column; classes, attribute selectors and pseudo-classes in the second; type selectors and pseudo-elements in the third. The universal selector and combinators count nothing. <code>:is()</code>, <code>:not()</code> and <code>:has()</code> take the specificity of their most specific argument; <code>:where()</code> always contributes zero, which is the whole reason it exists; <code>:nth-child(An+B of S)</code> counts as one pseudo-class plus S. The legacy single-colon forms of <code>:before</code> and <code>:after</code> are treated as pseudo-elements, as browsers do. Cascade order is from CSS Cascading and Inheritance Level 5: transitions, then importance and origin, then layers, then the style attribute, then specificity, then order of appearance. Source: Selectors Level 4, section 17, Calculating a selector&rsquo;s specificity; CSS Cascade 5, section 6.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
