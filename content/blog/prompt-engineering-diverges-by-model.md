---
title: "Prompt engineering for Midjourney, FLUX, and DALL-E: where they diverge"
description: >-
  Image models do not speak the same language. A prompt that makes Midjourney
  produce editorial photography makes DALL-E produce a poster of a clip-art
  flower. Conjure routes prompts per model. Here are the specific differences
  that matter.
date: '2026-07-08'
tags:
  - ai
  - prompt-engineering
  - image-generation
  - typescript
draft: false
---
I kept getting the same type of bug report from myself. Write a prompt in Midjourney, love the result, paste the exact same string into DALL-E, watch it produce something that looks like a stock illustration of the concept rather than the concept itself. Or paste it into FLUX and get a muddy, low-contrast version with the text on the sign spelled slightly wrong.

The models are not interchangeable. They have different training data, different internal prompt processors, and completely different parameter surfaces. Conjure is the prompt builder I made so I could describe an image once and get three platform-tuned outputs, each written in the idioms of its target model.

This is what actually differs between them, and how the adapter layer handles it.

---

## The same prompt, three outputs

Take a concrete brief: "anime face paint on a model, symmetrical, editorial beauty, high fashion magazine lighting."

Drop the literal string into Midjourney v6 and you get a photograph: a real-looking model, dramatic rim lighting, a bit of grain in the shadows, the kind of image that could sit in a beauty editorial. Midjourney defaults toward photorealism when a prompt is short and visual, and its style engine reads "editorial" as a real photographic brief.

Drop the same string into FLUX.1 dev and you get something more literal. The face paint is there, the symmetry is stronger, but the lighting is flatter and the styling feels closer to stock photography than high fashion. FLUX is extremely obedient to the words you give it, so "editorial" without specifics lands as a generic descriptor.

Drop it into DALL-E 3 and it reinterprets the brief entirely. DALL-E silently rewrites the prompt before generating, expanding it into a more verbose description that includes its own ideas about what "anime face paint" means. The output often looks like a digital illustration rather than a photograph, because DALL-E's rewrite tends to add style words that bias it toward illustration.

None of those outputs is wrong. They are just tuned for different model cultures. A good prompt for one is a bad prompt for the others.

## What Conjure does

A user writes a brief in plain English. Conjure passes it through Llama 3.3 70B on Groq, which expands the brief into three variations (safe, creative, experimental) written natively for the selected platform. Then a formatter layer appends the model-specific parameters. The shape in the code is a platform-aware system prompt plus a platform-aware parameter appender:

```typescript
function appendParams(
  prompt: string,
  platform: Platform,
  orientation: Orientation,
): string {
  const params = PLATFORM_PARAMS[platform]?.[orientation];
  if (!params) return prompt;

  if (platform === "dalle") {
    // DALL-E takes size as an API field, not a prompt suffix
    return prompt;
  }

  return `${prompt} ${params}`;
}
```

The parameter table looks like this:

```typescript
export const PLATFORM_PARAMS: Record<Platform, Record<Orientation, string>> = {
  midjourney: {
    portrait:  "--ar 9:16 --v 6.1 --stylize 750",
    square:    "--ar 1:1 --v 6.1 --stylize 750",
    landscape: "--ar 16:9 --v 6.1 --stylize 750",
  },
  flux: {
    portrait:  "--ar 9:16",
    square:    "--ar 1:1",
    landscape: "--ar 16:9",
  },
  dalle: {
    portrait:  "1024x1792",
    square:    "1024x1024",
    landscape: "1792x1024",
  },
};
```

That table is where most of the structural divergence lives. Midjourney has a rich inline parameter grammar you append to the prompt string. FLUX accepts an aspect ratio via provider wrappers (Replicate, fal) but the rest of its knobs live outside the text. DALL-E takes size as a dedicated API field and has essentially no inline parameter grammar at all.

## Midjourney idioms

Midjourney parses your prompt as comma-separated descriptors and pays attention to a handful of inline flags at the end:

- `--ar 9:16` sets aspect ratio. Supported ratios depend on the version.
- `--stylize 750` (or `--s 750`) is a 0 to 1000 dial for how aggressively Midjourney applies its aesthetic layer. Higher values drift further from your literal prompt toward Midjourney's native style. 750 is a safe editorial default; 100 gives you a more literal interpretation.
- `--chaos 20` (or `--c 20`) varies the four-image grid. Low values give four similar results; high values give four wildly different interpretations. Useful when you want to explore, destructive when you want consistency.
- `--v 6.1` pins the model version. Version pinning matters because v5, v6, and v6.1 have visibly different defaults.
- `::` is the weight separator. `cat::2 dog::0.5` tells Midjourney to emphasise cat and de-emphasise dog in the same prompt. Negative weights are valid (`ugly::-1`).

Camera grammar is the other Midjourney-specific lever. It reads camera and film references as strong style anchors. "Shot on Hasselblad X2D, 80mm, Kodak Portra 800, natural window light" will reliably produce editorial photography. Those same words in DALL-E produce a vaguely photo-style illustration and nothing more; DALL-E has not trained on the camera grammar the way Midjourney has.

Midjourney also supports image prompts by URL. Prefix a prompt with one or more image URLs and they influence the generation as style references. Conjure does not generate those because the user has to host the reference somewhere reachable, but the adapter preserves them if they are in the input.

## FLUX idioms

FLUX.1 (dev and pro) behaves more like a diffusion model talking to a language model than a tag-soup parser. Long, descriptive natural language prompts outperform comma-separated descriptor lists. Where Midjourney wants "cinematic, golden hour, volumetric light, 35mm film," FLUX prefers "a woman sitting at a cafe table, afternoon sun falling through the window, the light softens as it catches her hair, shot on 35mm film."

Two things FLUX does better than both Midjourney and DALL-E:

- **Typography.** FLUX renders real legible text inside images. "A magazine cover with the headline 'BECOMING' in a bold sans-serif" will produce actual letterforms that spell BECOMING, not the hallucinated approximations you get elsewhere. This alone is a reason to route typography-heavy briefs to FLUX.
- **LoRA support on third-party providers.** fal, Replicate, and RunPod let you stack LoRAs on top of the base FLUX model, which means a brand or character consistency layer is achievable without fine-tuning the full model. Midjourney's style reference is closed and opaque by comparison.

FLUX's inline parameter surface is small. Aspect ratio, guidance scale, and number of steps are handled by the provider, not the prompt text. Putting Midjourney-style `--chaos 20` into a FLUX prompt just makes it try to render the literal string "chaos 20" somewhere in the image. The adapter strips Midjourney flags before sending.

## DALL-E 3 idioms

DALL-E 3 does something the other two do not: it runs your prompt through a rewriter before generation. OpenAI calls this prompt expansion. The API accepts your literal text, silently rewrites it into a much longer, more descriptive version, then generates from the rewritten version. You can ask the API to return the rewritten prompt, and it is usually two to four times longer than the input.

Practical implications:

- **Terse prompts get reinterpreted heavily.** "Anime face paint, symmetrical" becomes a paragraph about symmetry, colour, studio lighting, and probably a style descriptor that was not in the original. The safer move with DALL-E is to write a longer, more specific prompt upfront so the rewriter has less room to improvise.
- **Compositional instructions land well.** "A red circle on the left, a blue square on the right, a yellow triangle above both, white background" works in DALL-E in a way it does not in Midjourney. DALL-E was trained with more spatial grounding signal and the rewriter preserves left/right/above/below cues.
- **The safety filter is aggressive.** Prompts DALL-E considers unsafe fail silently or return a rewritten prompt with the "unsafe" parts scrubbed. This is why prompts that work for artistic nudity on FLUX or Midjourney reject on DALL-E even when they describe the same thing in less loaded language.
- **No inline parameter grammar.** DALL-E takes size, quality, and style as API fields. Conjure handles this by not appending anything to the prompt string for DALL-E and carrying the size through the request body instead.

## The shared abstraction

The model-neutral shape Conjure's generator targets is a short structured description with six facets: subject, style, composition, lighting, camera or medium, and modifiers. Each platform adapter flattens those facets differently. Midjourney gets comma-separated descriptors with camera grammar and inline flags. FLUX gets a natural-language paragraph with typography specifics preserved. DALL-E gets a longer natural-language prompt front-loaded enough that the rewriter has less room to drift.

The system prompt for each platform encodes the flattening rules in plain language, which is why Groq's Llama 3.3 70B can do this reliably without needing three separate fine-tuned models. It is not translating English to English; it is writing in the house style of whichever platform is selected.

## The Groq layer

I picked Groq over OpenAI or Anthropic for this specifically because of latency. Llama 3.3 70B on Groq returns the structured output in around 400 to 700 milliseconds end to end. That is fast enough for the tool to feel interactive rather than batch. If I had put this on a slower provider, the user experience would collapse, because the whole premise of Conjure is that you iterate by regenerating, not by editing.

The tradeoff is that Llama occasionally refuses to return valid JSON even when the system prompt is explicit. The route handler guards against this by stripping markdown fences and running a regex fallback for JSON extraction before giving up. This is cheaper in practice than a stricter structured-output model, because the failure rate is low enough that retry-on-parse covers it.

## Why not just pick one model

The reason I built this instead of picking Midjourney and moving on is that the same concept renders visibly differently in each model, and the "best" one depends on the specific image, not the platform. Portraits and editorial photography belong in Midjourney. Anything with legible text belongs in FLUX. Anything with strict spatial composition or specific object counts belongs in DALL-E. A product page mockup could need all three.

Writing a prompt three times by hand, each time in a different idiom, is the kind of tax that disappears the moment you build the adapter. Once it exists, you stop thinking about which model you are targeting and start thinking about what you want the image to be. The routing is a detail the tool handles, not a decision you have to make every time.

The three outputs land in front of you in under a second. You pick the one that looks right, refine if needed, and move on.
