import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { GrimoireMap } from "../../../src/components/charts/GrimoireMap";
import DATA from "./data.json";
import "../colour-spaces/chart.css";
import "../keypress/chart.css";
import "../js-cost/chart.css";
import "../unicode/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Lunary's grimoire, mapped by meaning",
  description: "All 1,958 articles in Lunary's grimoire embedded with a local model and laid out by meaning with t-SNE. Obsidian highlighted, with its real nearest neighbours.",
  alternates: { canonical: "https://labs.sammii.dev/charts/grimoire-map/" },
  openGraph: { title: "Lunary's grimoire, mapped by meaning", description: "1,958 articles, placed by what they mean. Half of them are horoscopes.", url: "https://labs.sammii.dev/charts/grimoire-map/", type: "article" },
};

const cats = DATA.categories;
const count = (c: string) => DATA.points.filter((p) => p[2] === cats.indexOf(c)).length;
const near = DATA.neighbours.slice(0, 3).map((n) => n.title.toLowerCase());

export default function GrimoireMapChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 32</p>
          <h1 className="chart-title">Lunary&rsquo;s grimoire, mapped by meaning</h1>
          <p className="chart-lead">
            Lunary&rsquo;s grimoire is {DATA.n.toLocaleString("en-GB")} articles on crystals, spells, tarot, numbers and the sky. I turned each one into a list of 1,024 numbers with a small embedding model running on my Mac mini, so that articles about similar things get similar numbers, and then flattened them onto a page. Close together means close in meaning. The first thing it shows is the shape of the site: {count("horoscope")} of the articles are horoscopes, and they form a continent of their own. Obsidian is highlighted; its nearest neighbours by meaning are {near.join(", ")}.
          </p>
        </header>
        <GrimoireMap />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Generated on 19 October 2026 by scripts/labs/grimoire_map.py, from the Lunary repository and nothing else: no database, no API. The article list is the grimoire&rsquo;s own search index. Each article&rsquo;s text is its title, summary and keywords, plus its body fields where the repository holds them as data ({DATA.withBody} articles: crystals, spells, tarot cards, runes, angel numbers, life path numbers, chakras and correspondences). The other articles, the monthly horoscopes above all, are generated in code from the sign and the month when the page renders, so the map knows them only by title and keywords, which is part of why they cluster so tightly. Embeddings are {DATA.model} through Ollama on the Mac mini, all {DATA.n.toLocaleString("en-GB")} in about two minutes, {DATA.dims.toLocaleString("en-GB")} dimensions each, compared by cosine similarity. The neighbours listed in the panel are computed in all {DATA.dims.toLocaleString("en-GB")} dimensions; the map is only a picture of them.</p>
          <p>The layout is t-SNE: PCA down to 50 dimensions, then exact t-SNE with perplexity 30 for 1,000 iterations from a PCA start, implemented in NumPy for this chart. t-SNE keeps neighbourhoods and gives up on everything else, so trust what is next to what, not the size of a cluster or the distance between two of them. Sources: van der Maaten and Hinton, Visualizing Data using t-SNE (2008); Wattenberg, Vi&eacute;gas and Johnson, How to Use t-SNE Effectively (Distill, 2016); Belkina et al., Automated optimized parameters for t-SNE (2019); Zhang et al., Qwen3 Embedding (2025).</p>
        </footer>
      </article>
    </LabsShell>
  );
}
