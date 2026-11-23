---
title: "Spectra: turning sound into a shader without animating every pixel in JavaScript"
description: "The audio graph, frequency bands, smoothing and domain-warped noise behind Spectra, with a closer look at where visual response and audio measurement differ."
date: '2026-11-20'
draft: true
tags: [web-audio, glsl, design-engineering, creative-coding, performance]
lab_url: "https://spectra.sammii.dev"
---

An audio visualiser needs a relationship you can feel. If every frequency changes every property at once, the picture may be busy but it becomes difficult to tell what the sound is doing. The interesting question is which parts of the sound should affect which parts of the image.

[Spectra](https://spectra.sammii.dev) explores that through a fullscreen shader. Broad low, middle and high frequency measures feed different visual behaviours: distortion, colour movement and fine shimmer. JavaScript samples and reduces the audio. The GPU produces the image.

The [source](https://github.com/Sammii-HK/spectra) is small enough to follow the complete path from microphone permission to fragment colour. It also exposes some instructive differences between a visual instrument and a measurement tool, and between the intended flow of data and the way React actually delivers it.

## Start with an audio graph

The audio hook asks for a microphone stream after the start interaction. It creates an `AudioContext`, turns the stream into a source node and connects that source to an `AnalyserNode`. There is no connection to the audio destination in this path, so the code is analysing the microphone rather than deliberately playing it back through the speakers.

The analyser uses an FFT size of 512. Its frequency data therefore contains 256 bins. `getByteFrequencyData()` copies those values into an existing `Uint8Array`, so the loop can reuse a buffer rather than allocate a new one every time. The [API documentation](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData) describes these values as a byte-scaled representation of decibel data, with frequency bins spread linearly up to half the sample rate.

That last sentence matters. A byte value of 200 is not 200 hertz, a calibrated sound-pressure level, or “twice as loud” as 100. It is a useful control signal once you understand how it has been encoded.

The hook processes this audio locally. Its path is microphone, browser analyser, numbers passed to the shader; it does not upload a recording.

## The band names describe a visual choice

Spectra splits the array by index. The first eighth becomes `bass`, the next portion through halfway becomes `mid`, and the remaining half becomes `high`. It averages each group and divides by a different gain value: 200, 180 and 160, before clamping each result to one.

Those are deliberately simple controls. They are not conventional musical band boundaries. With a 48 kHz sample rate and a 512-point FFT, the spacing is 93.75 Hz per bin. A first group of 32 bins reaches to roughly 3 kHz, much higher than what an audio engineer would usually call bass.

That does not make the picture useless. It does mean the labels should not be mistaken for a spectral-analysis promise. The bands divide the available activity into three useful streams, rather than identify kick drums, voices and cymbals reliably.

If I wanted boundaries specified in hertz, I would use a helper like this. This is an illustrative alternative, not the grouping currently in Spectra:

```typescript
function averageBand(
  bins: Uint8Array,
  sampleRate: number,
  fftSize: number,
  lowHz: number,
  highHz: number,
): number {
  const hzPerBin = sampleRate / fftSize;
  const first = Math.max(0, Math.ceil(lowHz / hzPerBin));
  const end = Math.min(bins.length, Math.ceil(highHz / hzPerBin));
  if (end <= first) return 0;

  let sum = 0;
  for (let i = first; i < end; i++) sum += bins[i];
  return sum / (end - first) / 255;
}
```

Even then, the small FFT limits how precisely narrow low-frequency bands can be represented. Increasing the window gives finer frequency spacing but also changes the temporal behaviour of the analysis. Choosing those numbers is part of deciding what kind of instrument this should be.

## Smooth the attack and release separately

The analyser's `smoothingTimeConstant` is 0.8, and Spectra adds another layer in the rendering loop. A rising value moves 18% of the remaining distance each frame. A falling value moves 5%. The result responds faster to an increase and relaxes more slowly afterwards.

This is a visual envelope. It lets an event feel immediate without making the whole field flicker as aggressively as the raw signal. A drum hit and its decay need not have the same response curve.

There is a subtle timing issue: percentages per frame depend on refresh rate. Eighteen percent applied 120 times a second settles faster than the same rule applied 60 times. For a consistent time-based envelope, the interpolation coefficient can be derived from elapsed time:

```typescript
function followLevel(current: number, target: number, dt: number): number {
  const seconds = target > current ? 0.08 : 0.3;
  const alpha = 1 - Math.exp(-Math.max(0, dt) / seconds);
  return current + (target - current) * alpha;
}
```

Those time constants are illustrative choices. The useful property is that the response is defined in seconds. The current source uses the simpler per-frame form, which is perfectly understandable as an experiment but should not be described as independent of display refresh.

## Distort the coordinates, then colour the result

Spectra draws a plane with an orthographic camera and a `ShaderMaterial`. The fragment shader builds fractal noise by combining five octaves, doubling frequency and halving amplitude at each octave. It uses noise to shift the coordinates at which further noise is sampled.

That is domain warping. Instead of drawing a field and moving its finished pixels afterwards, the shader distorts the space from which it asks for values. A smooth coordinate displacement can turn an otherwise familiar noise texture into folds and currents.

The audio inputs enter at distinct points in that calculation. The source sets warp strength to `0.8 + uBass * 2.4`, leaving some ambient distortion even at zero input. The middle measure shifts the palette position. The high measure adds a faster, smaller-scale noise overlay. The low measure also raises overall brightness.

Here are the relevant relationships, abridged from the [fragment shader](https://github.com/Sammii-HK/spectra/blob/main/apps/web/src/shaders/fragment.glsl.ts):

```glsl
float warpStrength = 0.8 + uBass * 2.4;
vec3 warp = domainWarp(uv * 1.8, t, warpStrength);
float n = warp.x * 0.5 + 0.5;
vec3 col = palette(n, uMid * 0.35);

col *= 1.0 + uBass * 0.6;
float shimmer = snoise(vec3(uv * 12.0, uTime * 3.0));
shimmer = smoothstep(0.3, 0.9, shimmer);
col += uHigh * shimmer * vec3(0.6, 0.8, 1.0) * 0.8;
```

This excerpt depends on the surrounding noise and palette functions. It explains the mapping, not a complete shader you can paste into an empty file.

Separating these channels gives a viewer a chance to learn the image's behaviour. Large movement, palette movement and surface detail have different causes, even when they occur together.

## React should show the controls, not own the frame clock

The shader loop writes uniform values directly. It does not set React state for every fragment or reconstruct the scene on every audio sample. The visible level meters update every sixth rendered frame, reducing the rate at which the surrounding interface needs to rerender. At 60 frames per second that would be about ten updates per second; it is not a fixed ten-hertz timer.

There is a useful caveat in the current hook. Internally it stores the latest sample in a ref, but its returned `audioData` is the ref's current object at render time. The consumer then copies that snapshot into another ref. Meter updates cause further renders and refresh that snapshot, so the shader does not receive a direct handle to every analyser update.

A clearer contract would return the stable ref itself, or a getter that is actually used by the renderer. A ref only avoids stale snapshots when the consumer can read the changing value through it. Merely placing a value in a ref somewhere does not make the rest of the data path live.

## Permission, stopping and rendering cost are interface decisions

Microphone access needs a secure context and the user's permission, as documented by [`getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia). The source asks after interaction and stops stream tracks when the hook unmounts. A fuller interface would also expose an explicit stop action, close its audio context, and keep permission failures visible without dismissing the start surface.

The renderer caps pixel ratio at two, which puts an upper bound on one source of extra fragment work. It still has a substantial noise calculation per pixel. Two device pixels in each direction mean four fragments for each CSS-pixel-sized area; a small React tree does not imply a cheap image.

A pause control, a quieter motion setting and a static preview would broaden who can use the experiment. The current shader remains animated even without audio and does not provide reduced-motion handling. These are concrete next design decisions.

When exploring Spectra, try a few different kinds of sound and watch which part of the image responds. The code reveals why a visualiser can feel connected to sound without measuring musical meaning. It is a deliberately designed translation: a signal is reduced, shaped in time, then given a visual role.

## Read this as a series

This article is part of **Light, image and sound**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Start with [the physical installation](https://sammii.dev/blog/beyond-the-visible-uv-acetate-and-the-installation-i-painted/), then compare [Beyond Light](https://beyond-light-vr.vercel.app), [Refract](https://refract.sammii.dev) and [Spectra](https://spectra.sammii.dev). These are connected questions about rendering and perception, with different mechanisms.
