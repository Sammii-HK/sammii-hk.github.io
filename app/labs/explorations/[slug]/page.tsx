import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { ExplorationStage } from "../ExplorationStage";
import { ExplorationSignals } from "../ExplorationSignals";
import { COLLECTION, EXPLORATIONS, explorationHref, explorationImage, explorationJsonLd, getExploration, getRelatedExplorations } from "../registry";
import "../explorations.css";

export const dynamicParams = false;
export function generateStaticParams() { return EXPLORATIONS.map(({ slug }) => ({ slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const item = getExploration(params.slug);
  if (!item) return { title: "Exploration not found", robots: { index: false } };
  return {
    title: { absolute: item.seoTitle },
    description: item.description,
    alternates: { canonical: explorationHref(item.slug) },
    robots: { index: process.env.VERCEL_ENV !== "preview", follow: true, "max-image-preview": "large" },
    openGraph: { title: item.seoTitle, description: item.description, url: explorationHref(item.slug), siteName: "Sammii Kellow · Labs", type: "website", locale: "en_GB", images: [{ url: explorationImage(item.slug), width: 1600, height: 900, alt: `${item.title}, an interactive exploration by Sammii Kellow` }] },
    twitter: { card: "summary_large_image", title: item.seoTitle, description: item.description, images: [explorationImage(item.slug)] },
  };
}

export default function ExplorationPage({ params }: { params: { slug: string } }) {
  const item = getExploration(params.slug);
  if (!item) notFound();
  const related = getRelatedExplorations(item);
  return (
    <LabsShell>
      <article className="exploration-page">
        <ExplorationSignals slug={item.slug} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(explorationJsonLd(item)).replace(/</g, "\\u003c") }} />
        <nav className="exploration-breadcrumbs" aria-label="Breadcrumb">
          <a href="../../">Labs</a><span aria-hidden="true">/</span><a href="../">Explorations</a><span aria-hidden="true">/</span><span aria-current="page">{item.topic}</span>
        </nav>
        <header className="exploration-head">
          <p className="section-eyebrow">Explorations · {item.category}</p>
          <h1 className="exploration-title">{item.title}</h1>
          <p className="exploration-lead">{item.intro}</p>
          <p className="exploration-byline">Designed and built by <a href={COLLECTION.author.url}>{COLLECTION.author.name}</a></p>
        </header>
        <ExplorationStage slug={item.slug} />
        <div className="exploration-body">
          <section id="exploration-instructions">
            <h2>How to explore</h2>
            <ol>{item.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol>
          </section>
          <section>
            <h2>What you are seeing</h2>
            <p>{item.explanation}</p>
            {item.readouts.length > 0 && <ul>{item.readouts.map((readout) => <li key={readout}>{readout}</li>)}</ul>}
          </section>
          <section className="exploration-scope">
            <h2>The model and its limits</h2>
            <p>{item.limitations}</p>
            <p>You can inspect the controls and the changing numerical readouts alongside the drawing. The source notes distinguish catalogue measurements, calculated model results and illustrative choices.</p>
          </section>
          <section className="exploration-scope exploration-sources">
            <h2>Sources and further reading</h2>
            <ul>{item.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul>
          </section>
        </div>
        {related.length > 0 && <section className="exploration-related" aria-labelledby="related-explorations">
          <h2 id="related-explorations">Follow the next question</h2>
          <ul className="exploration-cards">{related.map((other) => <li className="exploration-card" key={other.slug}>
            <a href={`../${other.slug}/`}><p className="exploration-card-kicker">{other.category}</p><h3>{other.title}</h3><p className="exploration-card-copy">{other.description}</p><span className="exploration-card-arrow">Explore {other.topic.toLowerCase()} ↗</span></a>
          </li>)}</ul>
        </section>}
        <footer className="exploration-author">
          <p>{COLLECTION.authorCopy} These experiments are part of an ongoing collection of things you can understand by changing them.</p>
          <nav aria-label="More from Sammii"><a href="https://sammii.dev/work/">My work</a><a href="https://sammii.dev/blog/">Writing</a><a href="https://sammii.dev/#contact">Get in touch</a></nav>
        </footer>
      </article>
    </LabsShell>
  );
}
