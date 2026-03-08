---
title: "Conjure"
description: "AI-powered prompt builder for Midjourney, FLUX, and DALL-E"
techStack: "Next.js, Turborepo, Groq (Llama 3.3 70B), Prisma, Chrome Extension MV3"
---

## The problem

Writing effective prompts for image generation models is a skill that takes practice. Each platform (Midjourney, FLUX, DALL-E) has different syntax, parameter formats, and strengths. A prompt that works well on Midjourney needs restructuring for FLUX. I wanted a tool where you describe what you want in plain English and get three variations tuned for different risk levels, formatted correctly for each platform.

## Architecture

### Three-tier output

Every generation produces three prompt variations: safe (reliable, well-tested phrasing), creative (more expressive language, unusual combinations), and experimental (pushing the model's boundaries with abstract or conflicting descriptors). This gives users a spectrum from predictable to surprising without needing to understand prompt engineering.

### Groq-powered generation

Prompt generation uses Llama 3.3 70B via Groq's inference API. Groq was chosen for speed: responses arrive in under a second, making the tool feel interactive rather than batch-oriented. The system prompt encodes platform-specific knowledge (Midjourney's `--ar`, `--s`, `--c` parameters; FLUX's strength and guidance scales; DALL-E's natural language preferences).

### Per-platform formatting

Each generated prompt passes through a platform formatter that adds the correct parameter syntax. Midjourney prompts get aspect ratio, stylize, and chaos flags. FLUX prompts get strength and guidance values. DALL-E prompts are restructured as natural sentences. The formatter also validates parameter ranges.

### Chrome Extension

The MV3 Chrome extension injects Conjure's prompt builder into any page as a floating panel. This is useful when working directly in Discord (for Midjourney) or in an image generation UI. The extension communicates with the main app's API for generation but renders independently.

### Iterative refinement

After generating initial prompts, users can refine by describing what to change ("make it darker", "add more detail to the background"). The refinement step sends the original prompt plus the modification instruction, producing updated variations that preserve the core concept while incorporating the feedback.

## Challenges

**Platform parity**: Keeping the system prompt accurate across three platforms that update their syntax regularly required a versioned prompt template system. Each platform's rules are stored separately and can be updated without redeploying.

**Extension content security**: Chrome MV3 extensions have strict Content Security Policy rules. The floating panel needed to render in a shadow DOM to avoid style conflicts with host pages, and all API communication uses message passing through the extension's background service worker.

**Variation coherence**: The three output tiers needed to feel like variations of the same idea, not three unrelated prompts. The generation prompt explicitly chains the outputs, requiring each tier to share core subject matter while varying style, mood, and specificity.

## Outcome

Conjure turns a plain English description into three platform-formatted prompts in under a second. The Chrome extension makes it accessible from any workflow. The iterative refinement loop means users converge on their desired image faster than manual prompt editing.
