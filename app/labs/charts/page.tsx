import type { Metadata } from "next";
import { LabsShell } from "../../src/components/labs/LabsShell";
import { CHARTS, chartHref } from "./registry";

export const metadata: Metadata = {
  title: "Charts: information design by Sammii Kellow",
  description: "Interactive information-design pieces about the things design engineers work with: colour, typography, the browser and the machine.",
  alternates: { canonical: "https://labs.sammii.dev/charts/" },
};

const SERIES = Array.from(new Set(CHARTS.map((c) => c.series)));

export default function ChartsIndex() {
  return (
    <LabsShell>
      <div className="labs-index">
        <header className="labs-index-head">
          <p className="section-eyebrow">Charts</p>
          <h1 className="labs-index-title">Information design, about the tools.</h1>
          <p className="labs-index-lead">
            Family trees, timelines and measured comparisons of the things a design engineer works with. Each one is interactive, sourced in its footer, and comes with a poster. Colour first, then typography, then the browser and the machine.
          </p>
        </header>
        {SERIES.map((series) => {
          const items = CHARTS.filter((c) => c.series === series);
          return (
            <section key={series} aria-labelledby={`charts-${series.replace(/\W+/g, "-")}`} className="labs-index-group">
              <h2 id={`charts-${series.replace(/\W+/g, "-")}`} className="section-eyebrow">
                {series} <span className="work-index-count" aria-hidden="true">{items.length}</span>
              </h2>
              <ol className="lab-grid" aria-label={series}>
                {items.map((c) => (
                  <li key={c.slug} className="lab-card">
                    <div className="lab-card-body">
                      <p className="lab-card-stack">{c.n} · {c.stack}</p>
                      <h3 className="lab-card-title">{c.title}</h3>
                      <p className="lab-card-info">{c.blurb}</p>
                      <div className="lab-card-links">
                        <a href={chartHref(c.slug)}>Open the chart</a>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </LabsShell>
  );
}
