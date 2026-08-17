---
title: "Conjure"
description: "AI-powered prompt builder for Midjourney, FLUX, and DALL-E"
techStack: "Next.js, Turborepo, Groq (Llama 3.3 70B), Prisma, Chrome Extension MV3"
---

## The problem

Midjourney, FLUX, and DALL-E do not read prompts the same way. Midjourney uses `--ar`, `--s`, and `--c` parameter flags. FLUX works with separate strength and guidance values. DALL-E has a preference for natural-language sentences. A prompt tuned for one platform needs restructuring for another. Conjure takes a single plain English description and turns it into three platform-formatted variations tuned for different risk levels, so moving between tools doesn't mean re-learning a syntax each time.

## Architecture

### Three output tiers, not one

Every generation produces three variations rather than a single result: safe (reliable, well-tested phrasing), creative (more expressive language, unusual combinations), and experimental (pushing toward abstract or conflicting descriptors). The idea is to give people a spectrum from predictable to surprising without requiring them to understand prompt engineering themselves.

### Why Groq

Generation runs on Llama 3.3 70B via Groq's inference API, chosen specifically for latency: responses come back in under a second, which is the difference between the tool feeling interactive and feeling like a batch job. The system prompt carries the platform-specific knowledge itself — Midjourney's `--ar`, `--s`, `--c` parameters, FLUX's strength and guidance scales, DALL-E's preference for natural language over flags.

### Formatting per platform

Once a prompt is generated, it passes through a platform formatter that adds the correct parameter syntax: aspect ratio, stylize, and chaos flags for Midjourney; strength and guidance values for FLUX; a restructured natural sentence for DALL-E. The formatter also validates that parameter values sit within range before handing the prompt back.

### Refining without starting over

Users can refine a generated prompt by describing what to change — "make it darker", "add more detail to the background". The refinement step sends the original prompt alongside the modification instruction and produces updated variations that keep the core concept intact while folding in the feedback, rather than making people rewrite from scratch.

### A Chrome extension for wherever the work happens

Conjure also ships as a Chrome MV3 extension that injects the prompt builder into any page as a floating panel — useful when working directly in Discord (for Midjourney) or in an image generation UI. It calls the main app's API to generate prompts but otherwise renders independently of whatever page it's sitting on top of.

## Challenges

Consistency was needed along two separate axes. Each platform revises its prompt syntax on its own schedule, so the platform-specific knowledge in the system prompt couldn't be baked in as a static block of text — it needed to live as data. Each platform's rules are now stored separately and can be updated without redeploying the app. At the same time, the three output tiers had to read as variations of one idea rather than three unrelated prompts, which meant the generation prompt has to explicitly chain the outputs: hold the core subject matter constant while deliberately varying style, mood, and specificity across the tiers.

The extension raised a different problem entirely. Chrome MV3 extensions have strict Content Security Policy rules. Separately, the floating panel renders inside a shadow DOM to stop its styles leaking into, or being overridden by, whatever page it's embedded in. All communication with the API goes through message passing via the extension's background service worker rather than direct calls from the injected content itself.

## Outcome

What ships is a tool that turns a plain English description into three platform-formatted prompts in under a second, works from inside whatever workflow someone is already generating images in via the extension, and lets people converge on the image they actually want through iterative refinement instead of rewriting prompts by hand each time.
