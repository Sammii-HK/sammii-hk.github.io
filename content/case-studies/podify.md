---
title: "Podify"
description: "A podcast studio that turns text, an article or a Grimoire page into a scripted, voiced and assembled episode, run as an async job with ownership checks and a public RSS feed"
techStack: "Next.js, TypeScript, Ollama, Kokoro (Voicebox), ffmpeg, Vercel Blob, RSS"
---

## What it is

Podify takes a piece of writing and turns it into a podcast episode. The source can be pasted text, an article URL or a page from Lunary's Grimoire. A language model writes a script for two hosts (or one narrator), a text-to-speech engine voices each line, ffmpeg stitches the lines into an MP3, and the episode is added to an RSS feed that podcast apps can subscribe to. It is how The Grimoire, Lunary's podcast, gets made.

The studio is at [podify-topaz.vercel.app](https://podify-topaz.vercel.app). It sits behind an operator sign-in, because every episode costs real compute, but the Grimoire feed is public. I wrote about the first version of the pipeline in [I Built a Podcast Generator](/blog/podify-podcast-generator-003-per-episode/).

The three-stage pipeline reads simply. Most of the engineering went into everything around it: keeping a five-minute job alive on serverless infrastructure, making a job belong to whoever started it, and making speech sound less like a list of sentences.

## The brief

A brief has a source, a format, a length, a tone and a pair of voices. There are four formats: a two-host conversation, an interview, solo narration and study notes. Length is a word target, not a timer:

```ts
export const DURATION_WORDS: Record<string, number> = {
  "5min": 750,
  "10min": 1500,
  "15min": 2250,
  "20min": 3000,
  "30min": 4500,
};
```

That is 150 words a minute, a comfortable speaking pace, and the target goes straight into the system prompt. The browser checks the brief before anything is sent: at least 50 characters of text, a complete http or https URL, or a Grimoire path starting `/grimoire/`. The server repeats the 50-character check, because a script written from a sentence is not an episode.

## Writing the script

By default the script comes from a local Ollama model, with hosted providers available as explicit choices. Each format has its own system prompt. The conversation format gives the hosts distinct jobs: one is the knowledgeable guide, the other the curious explorer who asks what the listener is thinking. The rules are written for speech rather than reading: contractions, turns of one to four sentences, a small allowance of "right" and "exactly", and never "great question". The model returns a JSON array of `{ speaker, text }` turns.

Two clean-up passes sit between the script and the voices. The first removes stage directions, because a TTS engine reads `[laughs]` out loud:

```ts
.replace(/\[laughs?\]/gi, "")
.replace(/\[pause\]/gi, "...")
.replace(/\[emphasis\]/gi, "")
.replace(/\[.*?\]/g, "")
```

A pause becomes an ellipsis, which most engines render as a short hesitation, and anything else in square brackets goes. Thinking-mode models sometimes leave `<think>` blocks in their output, so those are stripped before parsing as well.

The second pass is pronunciation. Kokoro does not know how to say much of the Grimoire's vocabulary, so a list of patterns respells words just before synthesis:

```ts
[/\bgrimoire\b/gi, "grim-wahr"],
[/\bgibbous\b/gi, "GIH-bus"],
[/\bsamhain\b/gi, "sow-in"],
```

The respelling only goes to the speech engine. The saved transcript keeps the real spelling. "Gibbous" took three attempts in the history: `gib-us`, then `gibbuss`, both trying to force a hard G, and finally `GIH-bus`, where the capitalised first syllable did it. The next day the scripted intro changed from "Hey, I'm" to "Hey! I'm", because Kokoro produced an artefact on the comma followed by a contraction, right at the start of every episode.

## Voicing every line

Each script line becomes its own clip. Clips are generated concurrently, but the episode must keep the script's order, so results are written into a slot for their index rather than pushed onto a list as they finish:

```ts
pending.add(task);
task.then(() => pending.delete(task));

// Wait when we hit the concurrency limit
if (pending.size >= CONCURRENCY) {
  await Promise.race(pending);
}
```

This is a small worker pool with no library: start a task, and once the set of running tasks is full, wait for whichever finishes first before starting the next. Hosted providers run six at a time. The local Voicebox server defaults to two, configurable, because it is one machine doing all the work. A clip that fails is left out rather than failing the episode, and a paid fallback for failed local clips only runs if it has been switched on explicitly.

Each clip also gets a slight change of pace:

```ts
const jitter = 0.95 + Math.random() * 0.10; // 0.95 to 1.05
const effectiveSpeed = (voiceSpeed ?? 1.0) * jitter;
```

Plus or minus five per cent is too small to notice on any one line, but across an episode it stops the delivery feeling metronomic.

The voices themselves were tuned by ear, and the commit history shows it. The second host was first a blend of two Kokoro voices at different weights, then the blend was strengthened and the speed raised, then a commit titled "Test: pure bf_emma" swapped in a single voice to check whether the voice parameter was arriving at all. The current default pair is `af_heart` at normal speed and `af_aoede` at 1.05, two clearly different women's voices, with the speed difference helping listeners tell them apart.

## The silence between people

Assembly converts every clip to 44.1kHz stereo WAV, places a silence between consecutive clips, concatenates the lot and encodes a 192kbps MP3. The gap is where most of the naturalness lives, and it took four versions to get here.

It started as 600ms between different speakers and 300ms within the same speaker. Then 1,200 and 400, to give the hosts more room. Then back down to 800 and 300, for more natural pacing. The released version stops using fixed numbers:

```ts
const switchingSpeaker = clips[i].speaker !== clips[i + 1].speaker;
const baseMs = switchingSpeaker ? 200 : 80;
const rangeMs = switchingSpeaker ? 300 : 170;
const gapMs = baseMs + Math.floor(Math.random() * rangeMs);
```

A change of speaker now waits between 200 and 499ms, and a host continuing their own thought waits between 80 and 249ms. Both ranges sit well below the old fixed values. A gap that is the same every time is easy to hear as a gap; one that varies a little reads more like people taking turns, so it can afford to be shorter. When the Orpheus engine is used no gaps are inserted at all, since it paces its own speech.

The silence itself had a bug. The gaps were first generated at 24kHz mono while the clips were 44.1kHz stereo, and the mismatch caused pops at the transitions. They are now generated with `anullsrc=r=44100:cl=stereo`, the same format as everything around them.

Background music is optional. It is looped with `-stream_loop -1`, turned down to 10% and mixed under the dialogue with `amix` using `duration=first`, so the music ends when the talking does. An intro and outro are added if those files exist.

## Keeping a long job alive

An episode takes minutes, and Podify runs on Vercel functions that stop when they send a response. The history of solving that is the most instructive part of the project, because each attempt was reasonable and each one failed in production.

The first version started generation without awaiting it and returned a job ID. On Vercel the function was frozen as soon as the response went out, and jobs sat at "Queued". The second used `waitUntil` from `@vercel/functions` to keep the invocation alive, which did not hold reliably inside the App Router. The third used Next.js's own `after()`, with the same result. The fourth had the generate route fire a `fetch` at a separate processing route, so the work would run in its own invocation, but that request was itself being cut off before it was sent.

What works is letting the browser hold the connection. The released flow has two requests. `POST /api/podcast/generate` with `async: true` saves the brief as a job and returns its ID. The browser then calls `POST /api/podcast/process/:id` and keeps that request open, which keeps the function alive for its full `maxDuration` of 300 seconds:

```ts
// Keep the process connection open independently from status observation.
requestProcessing(
  jobId,
  fetcher,
  AbortSignal.any([processController.signal, AbortSignal.timeout(330000)]),
)
```

While that request runs, the browser polls `/api/podcast/status/:id` once a second on a separate path. Progress is written to the job record as it goes: scripting covers 0 to 30%, audio 30 to 80% in proportion to clips finished, assembly 80 to 95%. If processing has already started, the process route answers 409 and the client treats that as "keep watching", never as a reason to start again. Programmatic callers can skip all of this and run generation in one long synchronous request.

The client is careful about what it claims. If the first request times out, it says the job may still have been created and to check the feed before trying again. Each status request has its own 15-second timeout, and polling stops after ten minutes with the job reference still on screen.

Jobs live in memory locally and in Vercel Blob when deployed. At most three can be active at once, and a job older than five minutes, the function's maximum, no longer counts towards that limit. Before that rule, one crashed job could hold a slot for good.

## Who a job belongs to

There are two kinds of caller. Operators sign in with a password, which sets an HMAC-signed session cookie, or present a static API key for the CLI. Devices, meaning installs of a mobile client, register once and receive a key of the form `dk_` plus 32 hex characters, sent as `x-device-key`.

The middleware only decides whether a route is public, signed-in or a device route, and a well-shaped device key gets past it. That shape is not trusted for anything else. Each route resolves the caller properly: the key must match an issued record, and the job stores a SHA-256 fingerprint of the key as its owner, never the key itself. Every job route then goes through one check:

```ts
if (!job || (principal.kind !== "operator" &&
    (job.owner?.kind !== "device" || job.owner.fingerprint !== principal.fingerprint))) {
  return { response: privateJson({ error: "Job not found" }, { status: 404 }) };
}
```

A job that does not exist and a job that belongs to someone else get the same 404, so a device cannot probe for other people's job IDs. Jobs created without an owner are visible to operators only. Every one of these responses carries `Cache-Control: private, no-store`.

## A monthly free tier

Device keys carry a quota. The default is one generation per UTC calendar month, set by an environment variable:

```ts
const currentMonth = currentUtcMonth();
if (record.usageMonth !== currentMonth) {
  record.usageMonth = currentMonth;
  record.usageThisMonth = [];
}
```

The month is stored as a `YYYY-MM` string, so rollover is a string comparison and needs no scheduled job: the first request in a new month resets the counter. The quota was originally three a day. When it changed to one a month, the fields were renamed from `usageToday` and `usageDay` to `usageThisMonth` and `usageMonth` rather than leaving daily names doing monthly accounting. Operator calls are not metered.

## Errors that say enough and no more

A provider failure can carry a lot of text: request details, stack traces, pieces of the source. None of it reaches the browser. A job that fails is stored with a fixed message and a small diagnostic built only from allowlisted values:

```ts
export interface JobDiagnostic {
  code: FailureCode;
  errorType: "Error" | "TypeError" | "RangeError" | "SyntaxError" | "AbortError" | "TimeoutError" | "Unknown";
  stage: JobStage;
}
```

An error's name is copied only if it is one of those six; anything else becomes "Unknown". Operators see the diagnostic. Devices see "Generation failed".

## The feed

Episodes are registered in a manifest and served as RSS with the iTunes namespace. Getting accepted by Apple, Spotify and Amazon produced a run of small fixes, and one is a nice piece of arithmetic. Durations were first formatted like this:

```ts
const m = Math.floor(seconds / 60);
const s = Math.round(seconds % 60);
```

For an episode 299.6 seconds long, `m` is 4 and `s` rounds up to 60, giving `4:60`. The fix rounds once, before splitting, so the parts can never overflow:

```ts
const total = Math.round(seconds);
const h = Math.floor(total / 3600);
const m = Math.floor((total % 3600) / 60);
const s = total % 60;
```

Other fixes followed: nested categories, a `/rss/grimoire` alias so Spotify would fetch the feed fresh rather than from its cache, and a CORS header. One was tried and undone: audio URLs ending in `.mp3` through a rewrite, which routed correctly but returned 401 behind deployment protection. The enclosure's `type="audio/mpeg"` is what podcast apps actually use, so the plain URL stayed.

## ffmpeg on serverless

Locally Podify uses `ffmpeg-static` or the system binary. On Vercel, bundling the binary pushed the function past the platform's size limit. The first step was dropping `ffprobe` and reading durations from ffmpeg's own output instead, matching `Duration: hh:mm:ss.xx` with a regular expression. The second was to stop bundling ffmpeg too: the released version downloads a gzipped static build to `/tmp` on first use, unzips it with `gunzipSync` and caches the path for the life of the instance. It checks `VERCEL` and `VERCEL_REGION` together, since a copied `.env.local` can set `VERCEL` on a laptop.

## Light and dark

The studio follows the system setting: colours live in custom properties on `:root`, the dark scheme is unchanged, and a warm paper light scheme sits under `prefers-color-scheme: light`, with its own notice and error tokens so their contrast holds. `theme-color` is set per scheme.

The same day as the theme work, I fixed a bug in the player. It decided between "Download MP3" and "Open MP3 file" by reading a variable called `external`, which had been declared inside an effect, out of scope. In the JSX the name still resolved, to `window.external`, an old browser object that is always truthy. Every episode offered to open in a new tab instead of downloading. The variable now lives where the JSX can see it.

## What it taught me

Podify taught me that the pipeline is the easy part of a generation product. The hard parts are time, ownership and honesty: keeping work alive longer than a request, being sure who a job belongs to, and saying exactly what is known when a request goes quiet. It also taught me to trust my ears over my first numbers. Every gap, speed and respelling is there because something sounded wrong.
