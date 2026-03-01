---
title: "I Built a Podcast Generator That Costs £0.03 Per Episode"
description: Kokoro TTS, Claude, and ffmpeg. A simple prompt becomes a full audio episode with transcript, narration, and production for less than a coffee per month.
date: 2026-03-02
tags: [ai, productivity, indie-hacking, audio]
draft: false
---

I produce a podcast for Lunary. Full episodes: intro music, multi-segment narration, show notes, published automatically. The whole thing costs me about £0.03 per episode to generate.

No Spotify deal. No recording setup. No editor. Just a prompt and a pipeline.

Here's how it works.

## The problem with existing tools

NotebookLM's podcast feature is genuinely impressive. Two AI hosts discussing a document, synthesised audio, the works. But it's a closed system: you can't control the output format, can't automate it, can't run it on a schedule, and can't push the result anywhere without manual steps.

I needed something I owned. Something that could:
- Take a topic or set of source documents
- Generate a structured script
- Produce narrated audio
- Output to a file I could push wherever I wanted

And ideally, cost almost nothing.

## The architecture

Podify has three stages:

```
Topic/sources → Claude (script) → Kokoro TTS (audio) → ffmpeg (production)
```

Three tools, chained together.

### Stage 1: Script generation (Claude)

Claude handles everything editorial: outline, segment structure, narration copy, and show notes.

The prompt is fairly direct:

```typescript
const prompt = `You are writing a podcast episode script for ${podcastName}.

Topic: ${topic}
Format: ${segmentCount} segments, each 2-3 minutes of speech
Tone: ${tone}

Write a complete narration script. No stage directions. No [PAUSE] markers.
Just the words that will be spoken, segment by segment.

Output as JSON:
{
  "title": "Episode title",
  "segments": ["segment 1 text", "segment 2 text", ...],
  "showNotes": "markdown show notes"
}`;
```

The key constraint: no stage directions or markers in the output. Kokoro narrates exactly what it receives, so anything like "[thoughtful pause]" will be read aloud verbatim.

### Stage 2: Narration (Kokoro TTS)

[Kokoro](https://github.com/remsky/kokoro-fastapi) is an open-source text-to-speech model that runs locally via a FastAPI server. Quality is genuinely good: natural pacing, clear pronunciation, no robotic artifacts.

Each segment gets narrated separately:

```typescript
async function narrate(text: string, voice: string): Promise<Buffer> {
  const res = await fetch(`${KOKORO_URL}/audio/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'kokoro',
      input: text,
      voice,
      response_format: 'mp3',
      speed: 1.0,
    }),
  });
  return Buffer.from(await res.arrayBuffer());
}
```

Running Kokoro locally means the TTS itself costs nothing. The only inference cost in the pipeline is Claude.

### Stage 3: Production (ffmpeg)

Separate MP3 segments get stitched together with ffmpeg. Intro music fades in, segments play back-to-back with a short gap, outro fades out. For more control (fades, normalisation, chapter markers), ffmpeg filters handle it, but basic stitching is enough for a clean episode.

The key ffmpeg invocation (simplified):

```
ffmpeg -f concat -safe 0 -i segment-list.txt -c copy output.mp3
```

No re-encoding, so stitching is nearly instant even for long episodes.

## The cost breakdown

Per episode:
- Claude API (script generation, claude-haiku-4-5, ~3,000 tokens in + ~1,500 out): ~£0.02
- Kokoro TTS: £0.00 (runs locally)
- ffmpeg: £0.00 (runs locally)
- Storage (Cloudflare R2): ~£0.001 per GB

Total: **£0.02–0.03 per episode**. At one episode per week, that's under £2/year for a fully produced podcast.

## What I use it for

Podify generates a weekly Lunary astrology podcast. The source material is pulled from Lunary's grimoire: articles on the current moon phase, active transits, upcoming astrological events. Claude assembles them into a coherent episode, Kokoro narrates, and the result gets pushed to R2. The whole pipeline runs unattended.

## The constraint that makes it work

The key insight is that Kokoro being local changes the economics entirely. Cloud TTS APIs charge per character: at scale, that adds up fast. Running Kokoro on a VPS or your own machine makes the narration cost zero.

Claude is the only paid inference in the pipeline, and for a 2,000-word script, the cost is a rounding error.

If you want to experiment with a similar setup, the two things you need are:
1. A running Kokoro instance (Docker image available)
2. A Claude API key

The rest is just plumbing.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
