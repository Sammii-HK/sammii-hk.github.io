import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { LlmLatency } from "../../../src/components/charts/LlmLatency";
import DATA from "./data.json";
import "../colour-spaces/chart.css";
import "../keypress/chart.css";
import "../js-cost/chart.css";
import "../context-window/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Where an LLM call spends its time",
  description: "The anatomy of a streamed language-model call, measured: connect, queue, model load, prefill, the first token, then the answer a token at a time. Replayed behind a spinner and streamed.",
  alternates: { canonical: "https://labs.sammii.dev/charts/llm-latency/" },
  openGraph: { title: "Where an LLM call spends its time", description: "The first token in 165 ms, the last in 4.6 s. A spinner shows neither.", url: "https://labs.sammii.dev/charts/llm-latency/", type: "article" },
};

const s = DATA.conditions.short.median, l = DATA.conditions.long.median, c = DATA.conditions.cached.median;
const sec = (v: number) => `${(v / 1000).toFixed(1)} seconds`;
const n = Object.values(DATA.conditions).reduce((a, x) => a + x.n, 0) + 1;

export default function LlmLatencyChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 31</p>
          <h1 className="chart-title">Where an LLM call spends its time</h1>
          <p className="chart-lead">
            A call to a language model is two waits with different shapes. First nothing: the request arrives, waits its turn, and the model reads the whole prompt before it can produce a word. Then the answer, one token at a time. Measured on my own machine, a short question had its first token in {Math.round(s.ttft)} ms and its last after {sec(s.total)}. Behind a spinner the user waits the whole {sec(s.total)} and it looks broken; streamed, they are reading within a fifth of a second.
          </p>
        </header>
        <LlmLatency />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Measured on 19 October 2026 with scripts/labs/llm_latency.py: {n} streamed chat calls to {DATA.model} (Qwen 3.5, 2 billion parameters) through Ollama on a {DATA.machine.replace("Mac mini, ", "Mac mini with an ")}, client and server on the same machine, temperature 0. The client timestamps the connection, the request, and every streamed chunk as it arrives; Ollama&rsquo;s final message adds the server&rsquo;s own split into model load, prompt evaluation (prefill) and generation, and queue is what is left of the server&rsquo;s total after those three. Each short and long prompt began with a different request number so no call could reuse another&rsquo;s cached prompt; the cached condition sent one long prompt again on purpose, and its prefill fell from {sec(l.prefill)} to {Math.round(c.prefill)} ms. Medians are shown because the machine is shared: other jobs were using it during the run, decode speed varied from 18 to 39 tokens a second, and three calls found the model pushed out of memory, two of them waiting about 40 seconds for it to load back. That is where the cold start comes from. One streamed chunk is one token; the final end-of-answer token carries no text. The long document is my post on the 31 Vercel crons behind Lunary.</p>
          <p>A hosted API adds what this local setup leaves out: DNS, TCP and TLS before the request (see How a URL becomes a page), the network in both directions, and a queue shared with everyone else, so its first token is usually later and less predictable, and the case for streaming is stronger. The thresholds are Nielsen&rsquo;s: about 0.1 seconds feels instantaneous, about 1 second keeps a train of thought, and past about 10 seconds attention goes elsewhere (Nielsen, Usability Engineering, 1993; Response Times: The 3 Important Limits). Prefill reads the whole prompt in parallel and decoding makes one token per pass through the model, which is why the wait grows with the prompt and the stream grows with the answer (Pope et al., Efficiently Scaling Transformer Inference, 2022).</p>
        </footer>
      </article>
    </LabsShell>
  );
}
