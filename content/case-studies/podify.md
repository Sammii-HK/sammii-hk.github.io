---
title: "Podify"
description: "A text-to-audio product with explicit stages for source material, dialogue, speech synthesis, assembly and episode distribution."
techStack: "Next.js, TypeScript, Ollama, Voicebox, configurable TTS providers, ffmpeg, Vercel Blob, RSS"
updated: "2026-11-20"
status: "Architecture reviewed at 460c62a; local interface, device-job access and safe-diagnostics repairs at 7d46f43 remain unreleased. Audio generation and listening quality are not demonstrated."
---

<!-- Kept in step with the canonical structured study in podify.json. -->

Architecture reviewed at 460c62a; local interface, device-job access and safe-diagnostics repairs at 7d46f43 remain unreleased. Audio generation and listening quality are not demonstrated.

## Turn source material into something people can listen to

Podify accepts text, a URL or a supported content path and prepares a dialogue or narration. The engineering problem spans a long-running process and several formats: source text, structured speaker turns, individual audio clips, an assembled MP3 and episode metadata. The interface needs to keep that progress understandable while preserving the transcript alongside the sound.

## Design the brief before starting a long-running job

The local studio groups the source, conversation format, target length, tone and voice choice into one brief. Text and URL values survive switching source modes, voice choices support keyboard radio navigation, and validation focuses the field that needs attention. Reported progress uses labelled stages and transcript disclosure keeps reading alongside listening. The browser review used the actual client components with hand-written fixtures and disconnected services; it did not create an episode.

![Podify local studio with source tabs, a hand-written text brief and an explicit disconnected interface-review banner.](/assets/images/refresh-20261120/podify-studio-desktop.jpg)

Actual unreleased client at 1144px. Source text and records are illustrative; generation, playback, accounts and external services are disconnected.

![Full local Podify phone brief with source text, format, target length, tone, keyboard radio voice options and a Review this brief button.](/assets/images/refresh-20261120/podify-brief-phone.jpg)

Actual 390px offline form. Reviewing this brief sends no generation request; no generated audio or provider quality is shown.

## Treat a device key as a principal with owned work

A long-running episode needs an access boundary across generation, processing, status and job audio. Looking like a device key is not enough to establish ownership.

- **Trust a key prefix or a job identifier:** The shape of a credential or identifier cannot establish who may read or process a job.

- **Resolve the issued device record and check job ownership (chosen):** The local handlers assign ownership on the server and use the same access check for processing, status and job audio. Operators retain a separate route; legacy ownerless jobs stay operator-only.

Mocked actual-handler tests cover device isolation and indistinguishable missing/foreign-job responses. These local code checks do not certify deployment or historical storage confidentiality.

## Keep provider diagnostics out of the listening interface

A failed provider request can contain more than a useful error message. The local route boundary now reports fixed stage and failure messages to clients, with allowlisted failure codes, error types and stages for operators. Regression cases pass synthetic exception markers through the actual handlers and check that responses, new job writes and route logs omit them. Unchanged provider-internal logs and historical records remain outside that check.

## Separate interface proof from release readiness

The local batch passes 75 unit and handler checks plus 11 icon regressions, lint, types and a build guarded against provider, network and media execution. The disconnected desktop and phone review covers source switching, keyboard voice selection, local brief review, transcript disclosure and feed filtering. Public Blob/config storage, unrestricted manifest-slug audio and legacy media confidentiality still need a separate repair before release. No audio was generated or played, and no provider, account or private feed was contacted.

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
