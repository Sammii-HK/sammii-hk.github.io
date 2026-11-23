---
title: "Artify"
description: "A sketch-to-illustration studio and an astronomy-aware daily pipeline that turns one hand-drawn character into images, reels and scheduled posts"
techStack: "Next.js, TypeScript, FLUX.1 Kontext, DeepInfra, Llama 3.2 Vision, astronomy-engine, Remotion, fal.ai Kling, Sharp"
---

## The idea

Artify started with a single pencil sketch: a witch with long hair and a crescent moon pendant, drawn by hand. I wanted her in every post for a small witchcraft and astrology account, in different outfits, moods and settings, coloured in a consistent watercolour style, and I wanted the posts to follow the actual sky: a full moon post on the full moon, a sabbat altar in the days before a sabbat.

There are two halves. The web studio, live at [artify-roan.vercel.app](https://artify-roan.vercel.app), lets you take a sketch and turn it into a coloured illustration or a scene using FLUX.1 Kontext, an image-to-image model that edits a source picture according to a prompt. The pipeline, which runs as a scripted job rather than on the website, plans a day of content from astronomical data, generates the images, checks them, animates some of them, renders text slides and video, writes captions, and hands everything to a scheduler. I have written about how it fits with my other tools in [Running 5 projects solo](/blog/running-5-projects-solo-automation-stack/).

## The studio, and why visitors cannot generate

The studio has two modes. Colourise applies one of 35 colouring styles to the sketch, each a long prompt that fixes palette hex values, line quality and the character's features. Scenes places her into one of 72 scenes, or a custom direction you write yourself. You can use the project sketch, or upload your own JPG, PNG, WebP or HEIC file; HEIC is converted to JPEG in the browser with `heic2any`, and uploads over 20 MB are refused before anything is sent.

Every image is a paid call to a model provider, so the public site never makes one on a visitor's behalf. The route that calls DeepInfra checks a key first:

```ts
export function ownerAllowed(given: string | null | undefined, expected: string | undefined): boolean {
  if (!expected || !given) return false;
  // Hashing first gives equal-length buffers, so the comparison takes the same time whatever was sent.
  return timingSafeEqual(digest(given), digest(expected));
}
```

Two decisions sit in those lines. A missing environment variable switches generation off, never on, so a misconfigured deployment fails safe. And the comparison is constant-time. Node's `timingSafeEqual` throws if its two buffers differ in length, so both values are hashed with SHA-256 first, which always gives 32 bytes, and the time taken no longer depends on how much of the key was right. In my own browser the studio reads the key from local storage and sends it as an `x-artify-key` header; nobody else has one, and the route answers with a plain sentence explaining why.

When I do generate, the studio sends one request at a time and shows each result's own state, pending, loading, done or failed, rather than one spinner for the batch. Every result is labelled as needing visual review, and the page says plainly that the studio does not check hands. That check lives in the pipeline.

## Reading the sky

The pipeline starts each day with an astronomical context: moon phase and illumination, the zodiac season, whether a sabbat or eclipse is near, and whether Mercury is retrograde. The moon comes from `astronomy-engine`, which gives the phase as an angle:

```ts
const MOON_PHASES: { max: number; name: string; emoji: string }[] = [
  { max: 22.5,  name: "New Moon",        emoji: "\u{1F311}" },
  { max: 67.5,  name: "Waxing Crescent", emoji: "\u{1F312}" },
  // ...
  { max: 202.5, name: "Full Moon",       emoji: "\u{1F315}" },
```

`MoonPhase(date)` returns the difference between the moon's and the sun's ecliptic longitude, from 0 to 360 degrees: 0 is new, 90 is first quarter, 180 is full. The eight names are 45-degree windows centred on those points, so "Full Moon" covers 157.5 to 202.5 degrees, and anything above 337.5 wraps back round to new.

A full moon also gets its traditional monthly name, and it counts as a supermoon if the moon is closer than 360,000 km. The engine gives the moon's geocentric position as a vector in astronomical units, so the distance is the vector's length times 149,597,870.7 km. The other parts are deliberately simpler. The zodiac season is a table of fixed transition dates rather than the sun's true position, sabbats are fixed calendar days with a seven-day window either side, and the year's eclipses and Mercury retrogrades are hand-entered tables. For a posting schedule, a day's precision is what matters, and the tables are easy to read and check.

## One plan per date, always the same

Each day of the week has its own shape. Monday is a moon day with a guide carousel and moon-aware stories, Tuesday is tarot, Friday is spells with a reel, and so on. Within that shape, scenes are chosen at random, but the randomness is seeded from the date:

```ts
function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
```

This is a linear congruential generator with the classic Numerical Recipes constants, masked to 31 bits. The seed is a string hash of the ISO date. Because `s` stays below 2^31, `s * 1664525` stays below about 3.6 × 10^15, inside the range where JavaScript doubles are exact, so the sequence is identical on every machine. The same date always produces the same plan, which is what makes a dry run meaningful: `daily-generate:dry` prints exactly what a live run would make, and it never loads a credential, because the live generator is only imported on the live path.

Choosing is done by a small `pick` that skips anything already used that day, so two stories never share a scene. The moon story draws from a pool that depends on the phase: a new moon favours a new moon ritual, a waning crescent favours an evening wind-down.

The sky then modifies the plan. An eclipse within three days puts an eclipse ritual first in the feed and turns the last text story into an eclipse illustration. The first day of a Mercury retrograde adds a constellation post, and every retrograde day adds an extra tarot or rune story. Sabbats ramp up: a story seven to five days before, a feed post four to two days before, and a lead feed post on the day and the day after.

## Choosing the right base image

Kontext edits an existing picture, so the source image matters as much as the prompt. The pipeline keeps a set of pre-coloured versions of the sketch and picks the most specific one available: a sabbat base if a sabbat is near, a moon-phase base for moon and night scenes, a zodiac-season base otherwise, and a palette base as the fallback. Each later step only applies if that base actually exists on disk, so adding a new base is just adding a file.

## The trouble with hands

Image models are notoriously bad at hands, and an illustration with six fingers cannot be posted. The first version, in February 2026, sent each generated image to Llama 3.2 Vision with a narrow question: count the fingers on each visible hand, and reply PASS or FAIL. A failure got one retry.

That was not enough, and the history shows the next step was in the prompts, not the code. In March I rewrote more than 35 scenes to avoid hands altogether, with a shared directive appended to every scene. It opens by asking for bust portraits cropped above the chest, arms below the frame, or hands hidden behind objects, and then covers the cases where hands cannot be avoided:

```ts
"When hands MUST appear, wrap fingers tightly around the object they hold so individual fingers are obscured. " +
"Never show spread fingers, open palms, or outstretched hands. Prefer silhouetted, shadowed, or partially cropped hands. " +
```

Cropping and composition do more than any check can, because the best failed image is one that was never generated.

The check itself was then made strict about what counts as a pass. A validation has four states, passed, failed, skipped and error, and only `passed` sets `pass` to true. The model's reply has to start with PASS or FAIL; anything else is an error, not a guess. The generator turns those into four outcomes for the image: accepted, unchecked when validation was explicitly turned off, failed, or needs review when the check could not finish. A failed check gets one more attempt; two failures, an error, or a missing credential all end without an image. And nothing is written to disk until a candidate is accepted:

```ts
// Do not publish or overwrite an output until this candidate is accepted,
// or validation has been explicitly disabled. Rejected candidates never
// replace a previous file and no existing file is deleted.
runtime.writeImage(outputPath, candidate);
```

The pipeline takes its `fetch`, token and file access as an injected runtime, so the tests can play a failing provider, a malformed verdict or a failed retry without calling anything.

Captions went through the same lesson in April. When both caption sources failed, the old code returned a failure string in place of a caption, and that string could be scheduled. Now it returns `null`, and a post with no caption is skipped.

## Movement: Remotion and Kling

Some posts move. Remotion renders four compositions, all 1080 by 1920 at 30 frames per second: a 9-second Ken Burns reel, a 7-second Ken Burns story, a 6-second animated text slide, and a 15-second carousel recap. The Ken Burns motion is a few lines of interpolation:

```ts
const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.16], {
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.ease),
});
const panX = noise2D("pan-x", frame * 0.002, 0) * 1.8;
const panY = noise2D("pan-y", 0, frame * 0.0015) * 1.2;
```

The zoom eases out from 100% to 116%, so it starts moving and settles. The pan is not a straight line but a slow walk through 2D noise, at most 1.8% sideways and 1.2% vertically, which reads as drift rather than a camera move. A slow sine shifts warmth through a sepia filter, and 14-frame fades at each end let the clip loop. The same frames always come from the same inputs, which is the point of rendering video from React.

For Friday's reel, a generated still can become a "living illustration" through Kling 2.6 Pro on fal.ai. Each scene has a motion prompt, flickering candlelight for candle magic, light refracting through facets for crystals, and the client uploads the still, queues a five-second clip without audio and downloads the result. If the fal key is not configured, the day's plan swaps the reel for a Ken Burns reel of the same scene when it is built, rather than failing later. Animated stories always keep their static PNG as well, uploaded alongside as a fallback.

Text slides for carousels and stories are SVG documents rendered to PNG with Sharp, which keeps typography exact and costs nothing to run.

## Handing over to the scheduler

Finished media goes to Spellcast, my own scheduling tool, through three calls: upload the media, create a draft post, then schedule the draft. In February I tried going straight to Postiz, the publishing service underneath, and spent three commits on its public API's quirks, raw keys without a Bearer prefix, image objects that needed both an id and a path. Once the Spellcast proxy was fixed I reverted to the Spellcast flow. Keeping the pipeline on one interface I control means it does not need to know which networks a post goes to.

## Light and dark

The studio follows the visitor's system setting. Every surface colour is a custom property, `--studio-bg`, `--studio-panel`, `--studio-border` and the rest, and a single `prefers-color-scheme: dark` block swaps the whole set to warm dark stone tones, so components never carry their own dark styles.

## What it taught me

The biggest lesson was where to put the effort with generative models. The check for hands is useful, but rewriting the scenes so hands rarely appear did far more, and the most important part of the check is that "could not tell" never counts as yes. The rest was about making a daily job predictable: seed it from the date, plan before generating, never let a failure leave something behind that looks like a success, and make the paid parts impossible to trigger from the public page.
