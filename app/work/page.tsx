import type { Metadata } from "next";
import { getWorkIndex } from "../lib/lenses";
import { WorkIndexGrid } from "./WorkIndexGrid";
import { Navbar } from "../src/components/Navbar";
import { Footer } from "../src/components/Footer";

/**
 * /work (Phase 2H, TEMPORARY index). The homepage is the argument; this is
 * the evidence: every home and work project, grouped, using the existing
 * ProjectItem card as a migration step. The designed evidence index replaces
 * this once the homepage is stable (plan amendment 10). Labs-bound and
 * archived projects are not listed here.
 */
export const metadata: Metadata = {
  title: "Work: everything I have shipped",
  description: "Products, design and developer tools, AI systems and earlier work by Sammii Kellow.",
  alternates: { canonical: "https://sammii.dev/work/" },
};

export default function WorkPage() {
  const groups = getWorkIndex();
  return (
    <div className="relative bg-white dark:bg-black text-black dark:text-white min-h-[100dvh] flex flex-col">
      <Navbar />
      <main id="main" className="flex-1 work-index">
        <header className="work-index-head">
          <p className="section-eyebrow">Work</p>
          <h1 className="work-index-title">Everything I have shipped, by kind.</h1>
          <p className="work-index-lead">
            The homepage is the argument; this is the evidence. Products, tools, AI systems and earlier work, each with a case
            study or a live link. <a href="/">Back to the front page</a>.
          </p>
        </header>
        {groups.map((g) => (
          <section key={g.group} aria-labelledby={`work-${g.group}`} className="work-index-group">
            <h2 id={`work-${g.group}`} className="section-eyebrow">
              {g.label} <span className="work-index-count" aria-hidden="true">{g.projects.length}</span>
            </h2>
            <WorkIndexGrid label={g.label} projects={g.projects} />
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
