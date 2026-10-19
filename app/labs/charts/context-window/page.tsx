import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { ContextWindow } from "../../../src/components/charts/ContextWindow";
import DATA from "./data.json";
import "../colour-spaces/chart.css";
import "../keypress/chart.css";
import "../js-cost/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "A context window, to scale",
  description: "Five context windows, from 8k to a million tokens, against a page, a short story, a novel, my blog and four of my own codebases, each counted with a real tokeniser.",
  alternates: { canonical: "https://labs.sammii.dev/charts/context-window/" },
  openGraph: { title: "A context window, to scale", description: "A million tokens is a lot of pages and not much of a codebase.", url: "https://labs.sammii.dev/charts/context-window/", type: "article" },
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ukDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const lunary = DATA.repos.find((r) => r.id === "lunary")!;

export default function ContextWindowChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 30</p>
          <h1 className="chart-title">A context window, to scale</h1>
          <p className="chart-lead">
            A context window is how much a model can read at once, and it is measured in tokens, not pages. Windows grew from 8,192 tokens to a million in under a year, which sounds like infinity until you put something real in it. These are my own things, counted with a real tokeniser: everything I have published on this blog fits in one window with room to spare, and Lunary, at {(lunary.o200k_base.total / 1e6).toFixed(1)} million tokens, would need {Math.ceil(lunary.o200k_base.total / 1e6)} of the largest.
          </p>
        </header>
        <ContextWindow />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Counted on {ukDate(DATA.counted)} with OpenAI&rsquo;s tiktoken {DATA.tokenizer.split(" ")[1]}, encoding o200k_base (the tokeniser of GPT-4o, GPT-4.1, o3 and GPT-5) with cl100k_base (GPT-4) alongside; the two agree within 1% on all four codebases. Claude and Gemini use their own tokenisers, so the same files are a somewhat different number of tokens to them, but the order of magnitude does not change. Each codebase is every file git tracks at the tip of its default branch, minus dependency and build folders, lock files, generated files, minified bundles, binaries, images and fonts. Code is source in a programming language; everything else is content, documentation and data. Only totals leave the counting script; no file names or code are published.</p>
          <p>The page, short story and novel are estimates: a word count by definition times {DATA.blog.tokensPerWord} tokens per word, measured on the prose of my {DATA.blog.posts} blog posts with code blocks removed ({DATA.blog.proseWords.toLocaleString("en-GB")} words, {DATA.blog.proseTokens.toLocaleString("en-GB")} tokens), close to OpenAI&rsquo;s own rule of thumb of 100 tokens for 75 words. A page is the publishing industry&rsquo;s 250 words for a double-spaced manuscript page. The short story and novel are the boundaries in the SFWA Nebula Awards rules: a short story is under 7,500 words, a novel is 40,000 or more.</p>
          <p>Windows: GPT-4 launched with 8,192 tokens and a 32,768-token variant (OpenAI, GPT-4, March 2023); GPT-4 Turbo had 128,000 (OpenAI DevDay, November 2023); Claude 2.1 had 200,000 (Anthropic, November 2023); Gemini 1.5 Pro offered 1,000,000 (Google, February 2024), and GPT-4.1 1,047,576 (OpenAI, April 2025). A window holds the instructions, the conversation and the reply as well as whatever you paste, so the usable space is always less than the number. Scripts and method: scripts/labs in this site&rsquo;s repository.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
