---
title: "Where an LLM call spends its time"
description: >-
  One streamed language-model call taken apart, measured on my Mac mini: connect, queue, model load, prefill, the first token, then the answer a token at a time. Replayed behind a spinner and streamed, so you can feel the difference.
date: '2027-01-08T09:00:00+00:00'
tags:
  - charts
  - ai engineering
  - llms
  - performance
  - ux
series: "AI engineering"
chart: "llm-latency"
draft: false
---

Press replay and two panes start at once. On the left, a spinner and a clock: "Waiting… 1.2 s", "Waiting… 3.0 s", "Waiting… 4.4 s". On the right, the same answer is already arriving, word by word, and by the time the left pane shows a single word, you have read the whole answer.

They are the same call. Same model, same prompt, same recorded timings. The only difference is whether the interface shows the tokens as they come.

That replay sits near the end of [labs.sammii.dev/charts/llm-latency](https://labs.sammii.dev/charts/llm-latency/), and it is the bit I would show anyone who builds an AI feature behind a loading state.

## Two waits with different shapes

A call to a language model is two waits. First nothing: the request arrives, waits its turn, and the model reads the whole prompt before it can produce a word. Then the answer, one token at a time.

Measured on my own machine, a short question had its first token in 165 ms and its last after 4.6 seconds (the medians of 11 calls). Behind a spinner, the user waits the whole 4.6 seconds and it looks broken. Streamed, they are reading within a fifth of a second.

Nielsen's old thresholds put that in perspective: about 0.1 seconds feels instantaneous, about 1 second keeps a train of thought, and past about 10 seconds attention goes elsewhere. Streamed, the first token lands well inside the second threshold. Behind the spinner, the answer lands well past it.

## How the chart takes a call apart

The control at the top is **The call**, with four options:

- **A short question**: a one-line question, about 50 prompt tokens.
- **A long document**: one of my blog posts to summarise, 3,297 prompt tokens. (It is my post on [the 31 Vercel crons behind Lunary](/blog/31-vercel-crons-solo-product).)
- **The same document again**: the identical long prompt, sent again, so the server can reuse the work it did reading it.
- **A cold start**: a call that found the model unloaded, because another job on the same machine had pushed it out of memory.

For each, the chart shows one real call, the median one by time to first token, as a bar. Everything before the first-token marker is waiting, split into **Connect and send**, **Queue**, **Model load** and **Prefill**. Everything after it is **Streaming**, with one tick for every chunk at the moment it reached the client. A second bar zooms into the wait before the first token, because on the short question it is too thin to see otherwise. Hover any phase and the panel explains it.

Under that is the replay, which plays the same recorded call back at its real timings, with a **real time** or **×4** speed toggle, and a table of medians for all four conditions.

## What the four calls show

**The short question** is the spinner case above: 165 ms to the first token, then about 4.4 seconds of streaming for 115 tokens of answer. The answer, as it happens, is the model explaining why a streamed reply feels faster.

**The long document** moves the wait. With 3,297 tokens in the prompt, the first token takes 3.5 seconds, and nearly all of that is prefill: 3.4 seconds of the model reading every prompt token before it can write one. The answer that follows is a similar length to the short one. The wait grows with the prompt; the stream grows with the answer.

**The same document again** is the biggest change in the table. Prefill falls from 3.4 seconds to 50 ms, and the first token arrives in 107 ms, faster than the short question's median. The server already has the work of reading that prompt, so it does not do it again.

**The cold start** is the one a spinner makes look broken. Three of the 28 calls found the model pushed out of memory, two of them waiting about 40 seconds for it to load back. The median cold call spent 39.5 seconds in model load and finished after 45 seconds. Streaming cannot help with that: there is nothing to stream until the model is back.

## The mechanism

Prefill reads the whole prompt in parallel; decoding makes one token per pass through the model (Pope et al., 2022). That is why the two waits behave so differently. A longer prompt means a longer silence before anything happens. A longer answer means a longer stream once it has started. Caching attacks the first wait; streaming changes how the second one feels.

Connect and send, on the same machine, is under a millisecond. Queue is what is left of the server's total once load, prefill and generation are accounted for.

## How it was measured

This is one setup, and I want to be specific about it. The calls were made on 19 October 2026 with `scripts/labs/llm_latency.py`: 28 streamed chat calls to `qwen3.5:2b` (Qwen 3.5, 2 billion parameters) through Ollama, on a Mac mini with an Apple M4 and 16 GB, client and server on the same machine, at temperature 0. The client timestamps the connection, the request, and every streamed chunk as it arrives. Ollama's final message adds the server's own split into model load, prompt evaluation (prefill) and generation.

Each short and long prompt began with a different request number, so no call could reuse another's cached prompt. The cached condition sent one long prompt again on purpose. One streamed chunk is one token, and the final end-of-answer token carries no text.

## What it does not show

These are timings from one small model on one machine, not a benchmark of language models in general. The Mac mini was shared: other jobs were using it during the run, decode speed varied from 18 to 39 tokens a second, and that is also where the cold starts came from. The chart shows medians for that reason, and the per-condition numbers should not be expected to match any other setup.

A hosted API adds everything this local setup leaves out: DNS, TCP and TLS before the request (the [How a URL becomes a page](https://labs.sammii.dev/charts/url/) chart draws those), the network in both directions, and a queue shared with everyone else. So its first token is usually later and less predictable than these, and the case for streaming is stronger, not weaker.

And it says nothing about price, or about how good the answers are. It is a chart of where the time goes.

Try the replay on the cold start if you want to feel what 45 seconds behind a spinner is like: [labs.sammii.dev/charts/llm-latency](https://labs.sammii.dev/charts/llm-latency/), or [?focus=cold](https://labs.sammii.dev/charts/llm-latency/?focus=cold) to open on it.

## Sources

- Nielsen, Usability Engineering (1993); Response Times: The 3 Important Limits
- Pope et al., Efficiently Scaling Transformer Inference (2022)
- Measured with `scripts/labs/llm_latency.py` in the sammii.dev repository, using Ollama and `qwen3.5:2b`
