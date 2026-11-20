---
title: "Podify"
description: "A text-to-audio product with explicit stages for source material, dialogue, speech synthesis, assembly and episode distribution."
techStack: "Next.js, TypeScript, Ollama, Voicebox, configurable TTS providers, ffmpeg, Vercel Blob, RSS"
updated: "2026-11-20"
status: "Source reviewed at 460c62a. Generation performance, cost and listening quality were not benchmarked in this review."
---

<!-- Kept in step with the canonical structured study in podify.json. -->

Source reviewed at 460c62a. Generation performance, cost and listening quality were not benchmarked in this review.

## Turn source material into something people can listen to

Podify accepts text, a URL or a supported content path and prepares a dialogue or narration. The engineering problem spans a long-running process and several formats: source text, structured speaker turns, individual audio clips, an assembled MP3 and episode metadata. The interface needs to keep that progress understandable while preserving the transcript alongside the sound.

## Follow an episode through the system

1. **Request and capacity:** The generation route resolves source content, selects a voice configuration, checks capacity and creates a job. The reviewed web defaults are Ollama for scripting and Voicebox for speech. [Implementation](https://github.com/Sammii-HK/podify/blob/460c62a/app/api/podcast/generate/route.ts)
2. **Script and speech:** The shared pipeline saves machine-readable and readable transcripts, then asks the selected speech adapter for each speaker turn. [Implementation](https://github.com/Sammii-HK/podify/blob/460c62a/lib/pipeline.ts)
3. **Assembly:** ffmpeg converts clips into a consistent audio format, concatenates them with configured pauses and can add available intro, outro and background music. [Implementation](https://github.com/Sammii-HK/podify/blob/460c62a/lib/assemble-podcast.ts)
4. **Distribution:** The pipeline can upload an MP3 to Blob and register its metadata. The feed route constructs RSS enclosures from recorded audio locations. [Implementation](https://github.com/Sammii-HK/podify/blob/460c62a/app/api/podcast/feed/route.ts)

Source reviewed at 460c62a on 20 November 2026. This review did not invoke generation or publishing services.

## Track work outside a component’s loading flag

An episode can outlive a short UI interaction. A person needs to distinguish writing, synthesis, assembly, completion and failure.

- **Keep progress only in the generating page:** A refresh or another request would lose the current view of the process.
- **Give generation a job record (chosen):** Job state lives in memory locally or in Blob when configured, and the browser polls a status endpoint.

The UI displays the stage, reported progress and elapsed time. These are operational signals, not a measured estimate of how much time remains.

## The audio adapter is a product boundary

Speech providers have different voice identifiers, latency and failure behaviour. The current path supports Voicebox and several hosted alternatives. Voicebox paid fallback is explicitly gated by configuration. Clip generation preserves source order while processing tasks concurrently. The selected host voices and missing-voice fallback affect how the final conversation sounds and should be visible during review.

## Assembly should describe the processing it performs

The reviewed assembler converts and concatenates clips, uses randomised gaps that depend on whether the speaker changes, and skips those inserted gaps for the Orpheus provider. Optional music is mixed when the requested file exists. This is concrete audio processing; it does not establish content-aware silence trimming, segment crossfades or a loudness/compression pass.

## Cost is an estimate until reconciled

The pipeline estimates speech cost from character count and configured provider rates, then adds a fixed estimate for some script-provider paths. The result is useful metadata for comparing runs, but it is not a reconciled provider invoice. The portfolio does not present a universal per-episode price or a fixed generation time.

## What still needs listening and interaction evidence

The next review should follow a real source through generation, inspect the saved transcript, listen to the complete output and confirm the episode’s intended feed visibility. Model factuality, naturalness and podcast-platform acceptance need evidence from those actual outputs. This review did not generate audio, invoke a provider, publish an episode or infer listener reactions. AI demonstrations should use recorded, verified results.
