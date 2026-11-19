---
title: "A million tokens is not much of a codebase"
description: >-
  Five context windows, from 8k to a million tokens, against a page, a short story, a novel, my whole blog and four of my own codebases, each counted with a real tokeniser. The blog fits in 128k. Lunary would need twelve of the biggest windows.
date: '2026-12-23T09:00:00+00:00'
tags:
  - charts
  - ai engineering
  - llms
  - tokens
series: "AI engineering"
chart: "context-window"
draft: false
---

A million tokens sounds like infinity. It is the number that gets quoted when someone says you can now just give the model everything. So I counted everything. Lunary, my astrology app, is 11.4 million tokens. Showing a model the whole codebase once would take twelve of the largest context windows, end to end.

That is the headline of [labs.sammii.dev/charts/context-window](https://labs.sammii.dev/charts/context-window/), and the reason I built it. A context window is how much a model can read at once, and it is measured in tokens, not pages. Windows grew from 8,192 tokens to a million in under a year. The chart puts that growth next to things I actually make, counted with a real tokeniser, so the units mean something.

## The other end of the scale

The surprise at the other end is how small my writing is. Everything I had published on this blog when I counted it, 66 posts, comes to 112,552 tokens. It fits in a 128k window with 15,448 tokens to spare, and in nothing smaller. The median post is 1,617 tokens.

So the whole blog is a rounding error next to one of the codebases. That is the gap the chart is drawn to show: a million tokens is a lot of pages and not much of a codebase.

## How to read it

There are two controls. **Context window** picks one of five sizes: 8k, 32k, 128k, 200k and 1M. A dashed line marks the window on every row, and the line above the chart updates with it. On 1M it reads: a 1M window is 1,000,000 tokens, about 3,030 pages, and Lunary would need 12 of them, end to end. On 8k it is about 25 pages, and Lunary would need 1,389.

**Axis** switches between **to scale** and **log**. To scale is the honest version, and it is brutal: anything under about 100k tokens is a sliver, so the page, the short story, the novel and the blog almost disappear next to Lunary. Log makes the small ones readable, with each step ten times the last.

Each row has a value and a verdict against the window you picked: how many times it fits (the blog fits 8× in a million), or how many windows it needs (Spellcast needs 1.1). Hover or tap a bar and the panel says what was counted. For the codebases the bar is split into code and everything else, because a repo is not only code.

The rows, smallest to largest:

- **A page**: 250 words, estimated at 330 tokens
- **A short story**: 7,500 words, estimated at 9,892 tokens
- **A novel**: 40,000 words, estimated at 52,760 tokens
- **My blog**: 66 posts, 112,552 tokens, measured
- **sammii.dev**: this site, Next.js, the blog and Labs. 430,231 tokens in 325 files
- **PostReady**: an iOS video app and its Mac companion, in Swift. 933,723 tokens in 330 files
- **Spellcast**: my content pipeline, a Next.js app, workers and MCP servers. 1,123,935 tokens in 824 files
- **Lunary**: Next.js, the grimoire, the iOS app. 11,377,436 tokens in 5,337 files

The middle of the list is where it gets interesting. This site alone does not fit in a 200k window. PostReady just squeezes into a million. Spellcast does not: it is 1.1 windows. And Lunary is 46.2 MB of text, 9,171,667 tokens of code in 4,881 files and 2,205,769 of content, docs and data.

## How it was counted

Everything was counted on 19 October 2026 with OpenAI's tiktoken 0.12.0, using the o200k_base encoding (the tokeniser of GPT-4o, GPT-4.1, o3 and GPT-5), with cl100k_base (GPT-4) alongside for comparison. The two agree within 1% on all four codebases, and the table under the chart gives both for every repo.

Each codebase is every file git tracks at the tip of its default branch, minus dependency and build folders, lock files, generated files, minified bundles, binaries, images and fonts. Code means source in a programming language; everything else counts as content, documentation and data. Only totals leave the counting script. No file names or code are published.

The page, the short story and the novel are not measured, and the chart marks them as estimates. Each is a word count by definition multiplied by 1.319 tokens per word, which I measured on the prose of my own 66 posts with the code blocks removed: 70,112 words, 92,473 tokens. That is close to OpenAI's own rule of thumb of 100 tokens for 75 words. A page is the publishing industry's 250 words for a double-spaced manuscript page. The short story and novel are the boundaries in the SFWA Nebula Awards rules: a short story is under 7,500 words, and a novel is 40,000 or more, so treat the novel row as a floor.

The windows come from the launches: GPT-4 with 8,192 tokens and a 32,768-token variant in March 2023, GPT-4 Turbo with 128,000 at OpenAI's DevDay in November 2023, Claude 2.1 with 200,000 the same month, Gemini 1.5 Pro with 1,000,000 in February 2024, and GPT-4.1 with 1,047,576 in April 2025.

The scripts are in `scripts/labs` in this site's repository.

## What it does not show

The counts are for OpenAI's tokenisers. Claude and Gemini use their own, so the same files are a somewhat different number of tokens to them. The order of magnitude does not change, and the order of magnitude is the point.

A window is never all yours. It holds the instructions, the conversation and the reply as well as whatever you paste, so the usable space is always less than the number on the button.

It also says nothing about whether a model reads a full window well, or what it costs to fill one. It is a chart of size, nothing more. Fitting in a window and being understood in a window are different questions, and this one only answers the first.

And it is my work, not yours. Four codebases and one blog are a sample of one person's habits. A Swift app, a content pipeline, this site and Lunary happen to span a useful range, but your own repo could land anywhere on the axis.

Pick a window and see what fits: [labs.sammii.dev/charts/context-window](https://labs.sammii.dev/charts/context-window/). It opens on the [128k window](https://labs.sammii.dev/charts/context-window/?focus=128k) if you want to see the blog just make it.

## Sources

- OpenAI, tiktoken 0.12.0 (o200k_base and cl100k_base encodings)
- OpenAI, GPT-4 (March 2023)
- OpenAI, DevDay: GPT-4 Turbo (November 2023)
- Anthropic, Claude 2.1 (November 2023)
- Google, Gemini 1.5 Pro (February 2024)
- OpenAI, GPT-4.1 (April 2025)
- OpenAI, rule of thumb of 100 tokens for 75 words
- SFWA, Nebula Awards rules (short story and novel word counts)
- Counting scripts and method: `scripts/labs` in the sammii.dev repository
