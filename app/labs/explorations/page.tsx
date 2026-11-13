import type { Metadata } from "next";
import { LabsShell } from "../../src/components/labs/LabsShell";
import { COLLECTION, EXPLORATIONS, EXPLORATION_CATEGORIES, explorationHref, explorationImage } from "./registry";
import "./explorations.css";

export const metadata: Metadata = {
  title: { absolute: COLLECTION.seoTitle },
  description: COLLECTION.description,
  alternates: { canonical: "https://labs.sammii.dev/explorations/" },
  robots: { index: process.env.VERCEL_ENV !== "preview", follow: true, "max-image-preview": "large" },
  openGraph: { title: COLLECTION.seoTitle, description: COLLECTION.description, url: "https://labs.sammii.dev/explorations/", type: "website", images: [{ url: explorationImage("black-hole-light-paths"), width: 1600, height: 900, alt: "Where light can go: calculated light paths around a black hole" }] },
  twitter: { card: "summary_large_image", title: COLLECTION.seoTitle, description: COLLECTION.description, images: [explorationImage("black-hole-light-paths")] },
};

export default function ExplorationsIndex() {
  const feature = EXPLORATIONS.find((item) => item.id === "black-hole-light")!;
  const categories = [...EXPLORATION_CATEGORIES, ...EXPLORATIONS.map((item) => item.category).filter((category) => !EXPLORATION_CATEGORIES.includes(category))];
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Explorations by Sammii Kellow", description: COLLECTION.description, url: "https://labs.sammii.dev/explorations/", author: { "@type": "Person", ...COLLECTION.author }, mainEntity: { "@type": "ItemList", itemListElement: EXPLORATIONS.map((item, i) => ({ "@type": "ListItem", position: i + 1, url: explorationHref(item.slug), name: item.title })) } };
  return (
    <LabsShell>
      <div className="exploration-index">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
        <nav className="exploration-breadcrumbs" aria-label="Breadcrumb"><a href="../">Labs</a><span aria-hidden="true">/</span><span aria-current="page">Explorations</span></nav>
        <header className="exploration-index-head">
          <p className="section-eyebrow">{EXPLORATIONS.length} interactive explorations</p>
          <h1 className="exploration-title">Move something.<br />See what follows.</h1>
          <p className="exploration-lead">{COLLECTION.intro}</p>
          <p className="exploration-collection-intro">Light that bends, constellations that come apart, planets with unfamiliar days and patterns that grow from small disturbances. Each exploration is a place to try an idea, with the model and its limits alongside it.</p>
        </header>
        <a className="exploration-feature" href={`./${feature.slug}/`}>
          <img src={`/exploration-runtime/cards/${feature.slug}.png`} width={1600} height={900} alt="Calculated Schwarzschild light paths bending around a black hole" fetchPriority="high" />
          <div><span className="section-eyebrow">Start with light</span><h2>{feature.title}</h2><p>{feature.intro}</p><span className="exploration-card-arrow">Explore light around a black hole ↗</span></div>
        </a>
        {Array.from(new Set(categories)).map((category) => {
          const items = EXPLORATIONS.filter((item) => item.category === category);
          if (!items.length) return null;
          return <section className="exploration-index-group" aria-label={category} key={category}>
            <h2>{category}</h2>
            <ul className="exploration-cards">{items.map((item) => <li key={item.slug} className="exploration-card"><a href={`./${item.slug}/`}><p className="exploration-card-kicker">{item.topic}</p><h3>{item.title}</h3><p className="exploration-card-copy">{item.description}</p><span className="exploration-card-arrow">Open exploration ↗</span></a></li>)}</ul>
          </section>;
        })}
        <footer className="exploration-author"><p>{COLLECTION.authorCopy}</p><nav aria-label="More from Sammii"><a href="https://sammii.dev/work/">My work</a><a href="https://sammii.dev/blog/">Writing</a><a href="https://sammii.dev/#contact">Get in touch</a></nav></footer>
      </div>
    </LabsShell>
  );
}
