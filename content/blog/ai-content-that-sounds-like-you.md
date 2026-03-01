---
title: "Getting AI-Generated Content to Actually Sound Like You"
description: Generic AI content is obvious. Brand voice profiles change that. Here's how I built persona injection into Spellcast so every generated post sounds like the account it's posting from.
date: 2026-04-06
tags: [ai, content-marketing, indie-hacking, productivity]
draft: false
---

AI-generated social content has a recognisable texture. Overlong sentences. Unnecessary qualifiers. The phrase "in today's fast-paced world." You can spot it immediately.

The problem isn't the model. It's the prompt. Generic input produces generic output. The fix is giving the model enough context about voice, tone, and format that it can't default to generic.

Here's how I built brand voice profiles into Spellcast and what they actually contain.

## What a brand voice profile is

A brand voice profile is a structured document that describes how a particular account writes. Not "be professional and friendly" — that's useless. Something specific enough that a model with no other context could produce content that sounds like the account.

The Spellcast schema for a brand voice:

```typescript
interface BrandVoice {
  name: string;
  persona: string;        // Who is this account? In first person.
  tone: string;           // How does it write? Specific adjectives.
  writingRules: string[]; // Concrete rules. Dos and don'ts.
  examples: string[];     // Real example posts from this account.
  avoidPhrases: string[]; // Phrases that are off-brand.
  platform: string;       // Platform-specific adjustments.
}
```

For the sammii account (my personal founder account), the brand voice looks something like:

```typescript
{
  name: "Sammii - Founder Voice",
  persona: "I'm Sammii, a solo founder building Lunary (an astrology platform) and Spellcast (a social scheduling tool). I write about building products in public, shipping fast, and the technical decisions behind what I make.",
  tone: "Casual but technically confident. Direct. UK English. No motivational-speaker energy.",
  writingRules: [
    "Never use em dashes (—). Use commas or colons instead.",
    "Always sentence case. Never all-lowercase for stylistic effect.",
    "Lead with a specific number or claim, not a question.",
    "No links in the first tweet of a thread.",
    "Avoid filler words: genuinely, actually, incredibly, super.",
    "Write like you're talking to a developer who also ships products."
  ],
  examples: [
    "100 impressions/day to 12,300 in 3 months. No paid links. Here's what drove it.",
    "Streaks shouldn't punish you for not opening an app every day. Built a 'grace day' system instead."
  ],
  avoidPhrases: ["in today's world", "game changer", "as an AI language model", "I hope this helps"]
}
```

## Injecting it into the prompt

When generating content, the brand voice is injected as a system prompt block:

```typescript
function buildSystemPrompt(voice: BrandVoice, platform: string): string {
  return `You are writing social media content for the following persona.

PERSONA:
${voice.persona}

TONE:
${voice.tone}

WRITING RULES (follow these exactly):
${voice.writingRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

EXAMPLE POSTS (match this style):
${voice.examples.map((e) => `- "${e}"`).join('\n')}

AVOID THESE PHRASES:
${voice.avoidPhrases.join(', ')}

Platform: ${platform}. Adjust length and format accordingly.`;
}
```

The examples are the most important part. Prose descriptions of voice are ambiguous. Actual example posts are concrete — the model can pattern-match against them.

## Platform-specific variations

Different platforms need different formats. A LinkedIn post that works can't be directly repurposed for X. The brand voice handles the persona; the platform rules handle the format:

```typescript
const PLATFORM_RULES: Record<string, string> = {
  twitter: 'Max 280 chars per tweet. Threads should have 4-8 tweets. Each tweet should stand alone. No links in tweet 1.',
  linkedin: 'Up to 3,000 chars. Use line breaks for readability. Lead with the insight, not the story. Avoid hashtag spam.',
  threads: 'Conversational. Shorter than LinkedIn. No links in post body — algorithm penalises them.',
  bluesky: 'Similar to Twitter format. 300 char limit.',
};
```

These get appended to the system prompt. Combined with the brand voice, the model knows both who is speaking and how the platform expects content to be formatted.

## Multiple personas, one product

Spellcast manages six different account sets for me, each with its own brand voice:

- **sammii:** Founder/tech voice, build in public, UK English
- **Lunary:** Astrology brand, more mystical register, accessible to non-technical audience
- **sammii spellbound:** Witchy illustration brand, visual-first, pagan community
- **sammii sparkle:** Lifestyle, wellness, warmer tone
- **scape²:** Design studio, clean and minimal
- **Sammii Dev Blog:** Technical writing voice, developer audience

A post generated for the Lunary account sounds nothing like one for the sammii account, even though both are written by the same person running the same tool. The brand voice layer is what creates that distinction.

## The difference in practice

Without brand voice injection, asking a model to write a tweet about Lunary's SEO growth produces something like:

> "Excited to share that Lunary has seen incredible growth in Google impressions! From 100 to 12,300 per day in just 3 months! #SEO #IndieHacking"

With the sammii brand voice injected:

> "100 impressions/day to 12,300 in 3 months. No paid links, no agency. Here's exactly what drove it."

Same information. Completely different register. The second one doesn't read as AI-generated because it's following specific rules: specific numbers, no exclamation marks, no hashtags, lead with the claim.

## What to put in your examples

The examples field is where most people underinvest. Two or three examples isn't enough to establish a pattern. For each account, I collected 8-10 posts that performed well and that genuinely sound like the voice I want.

The selection criteria:
- Posts I'd be proud of regardless of performance
- Posts that show the voice under different content types (a data point, a lesson, a product update)
- Posts where the format choice (thread vs single, long vs short) was deliberate

The model doesn't need instructions to match the length or format if the examples consistently show it. Patterns in examples do more work than prose descriptions of patterns.

## The iteration loop

Brand voices aren't set once. If generated content consistently misses the mark in a particular direction — too formal, wrong platform length, wrong register — the examples get updated first, then the rules.

The fastest fix is usually adding a concrete negative example: "This is off-brand: [example]." Negative examples are often more useful than positive rules because they show the boundary precisely.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
