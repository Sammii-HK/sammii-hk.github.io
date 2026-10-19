import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { Tokens } from "../../../src/components/charts/Tokens";
import "../colour-spaces/chart.css";
import "../keypress/chart.css";
import "../js-cost/chart.css";
import "../unicode/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "How text becomes tokens",
  description: "The same sentences through four real tokenisers, GPT-4's, GPT-4o's, Llama 3's and Gemma 3's, with every token drawn as a chip. Why a model cannot count the r's in strawberry.",
  alternates: { canonical: "https://labs.sammii.dev/charts/tokens/" },
  openGraph: { title: "How text becomes tokens", description: "strawberry is st, raw, berry. None of them is an r.", url: "https://labs.sammii.dev/charts/tokens/", type: "article" },
};

export default function TokensChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 33</p>
          <h1 className="chart-title">How text becomes tokens</h1>
          <p className="chart-lead">
            A language model never sees letters. Before your words reach it, a tokeniser cuts them into pieces from a fixed vocabulary and swaps each piece for a number, and the numbers are all the model gets. Common words are one piece, rare ones are several, and a character can be split across pieces. Here are the same sentences through four tokenisers in real use, every chip one token exactly as each returned it, and the reason the strawberry question trips models up.
          </p>
        </header>
        <Tokens />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Every token on this page was produced offline by scripts/labs/tokens.py on 19 October 2026; nothing is tokenised in the browser and nothing is approximated. cl100k_base and o200k_base are OpenAI&rsquo;s tiktoken 0.12.0, with the BPE files checked against the SHA-256 hashes pinned in tiktoken itself. Llama 3 is tiktoken running the 128,000 ordinary tokens read out of a Llama 3.1 8B model file (Hermes 3, through Ollama) with the split pattern from Meta&rsquo;s llama3 tokenizer. Gemma 3 is SentencePiece&rsquo;s BPE, score-ordered merges with byte fallback, over the 262,208-piece vocabulary in Ollama&rsquo;s gemma3:4b-it-qat. Both of those were checked against the models themselves: for ten test sentences, including the emoji, the Japanese and the whitespace, the number of prompt tokens Ollama reported was ours plus one start-of-text token, every time.</p>
          <p>Which models use which: o200k_base is GPT-4o, GPT-4.1, o1, o3, o4-mini and GPT-5, and cl100k_base is GPT-4 and GPT-3.5 Turbo, per the model table in tiktoken. Token ids count every id in the vocabulary, special tokens included. Byte-level tokenisers (the GPT ones and Llama 3) can always fall back to single bytes, which is why a Japanese character can arrive in three tokens that are not characters at all; SentencePiece does the same with its 256 byte pieces. The strawberry problem is the well-known failure of models to count letters: the letters are not in the input, only the ids of the pieces, so counting them means recalling how a piece is spelt. Sources: Sennrich, Haddow and Birch, Neural Machine Translation of Rare Words with Subword Units (2016); Kudo and Richardson, SentencePiece (2018); OpenAI, tiktoken; Meta, llama3 tokenizer.py.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
