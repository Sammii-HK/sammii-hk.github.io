---
title: "Refract"
description: "A shader workshop where candidate source is compiled before it replaces the last valid preview, with hand-authored studies for a reproducible starting point."
techStack: "Next.js, TypeScript, Three.js, GLSL, WebGL, Groq"
updated: "2026-11-20"
status: "Local candidate 3d832e1; authored shaders and failure states verified, generation and release remain untested."
---

<!-- Kept in step with the canonical structured study in refract.json. -->

Local candidate 3d832e1; authored shaders and failure states verified, generation and release remain untested.

## Separate the brief, the source and the preview

Refract has a server-side description-to-GLSL route and a browser editor. Its local workshop starts with three explicitly hand-authored studies. Selecting a suggestion fills the brief; only Generate submits it to the configured provider. This lets the local shader workflow be exercised without turning a hand-authored example into supposed evidence of model output.

_Unreleased local 3d832e1. This is a hand-authored GPU study, not generated output or an AI demo._

## Preserve the types in shader source

- **What happened:** The earlier API normalisation rewrote integer-looking literals using a regular expression. An integer loop could acquire a floating-point initialiser and stop compiling.
- **Why:** A source-wide numeric replacement cannot infer the type required by a loop counter, array index or other GLSL expression.
- **Fix:** The local normaliser preserves numeric tokens and only removes a recognised whole-response source fence. Request handling validates the brief and separates unavailable configuration, provider failure, empty output and timeout. Tests inject generation; no live model was called.

## Keep the last valid scene through a failed edit

The text in an editor can become invalid while a useful shader is already running. Treating the draft as the only source of truth makes both the preview and export fragile.

- **Separate draft, candidate and active source (chosen):** A candidate is compiled and linked before becoming the active preview. A failed apply retains the valid image and its exportable source, while showing the complete compiler error.
- **Replace the current preview before validation:** A failed edit would remove the scene the user was building on and leave export tied to invalid source.

The actual browser pass applied Copper bands with its integer loop, rejected a deliberately invalid edit and retained the valid scene. Reapplying the invalid source kept the error visible. Saving produced the 397-byte valid fragment source, including the integer loop.

_Actual local 390px authored-study view. The generation path was not exercised._

_Local edit failure, not a model result. The filled brief has not been submitted._

## Own the work behind each frame

The renderer tracks its current animation request, stops when paused or hidden and resumes without adding hidden time. It caps frame frequency and pixel ratio, uses the drawing-buffer dimensions for resolution uniforms, and releases rejected or replaced materials and owned renderer resources. Ten request/resource regressions exercise these boundaries with injected operations. That is not a measurement of live GPU memory or a guarantee for arbitrary shader programs.

## What the current verification establishes

The local batch passes ten request/resource checks and eleven shared icon regressions, TypeScript, production build and a zero-finding dependency audit. Actual desktop and 390px browser checks compiled selected authored shaders, preserved integer loops, checked pause with identical captured previews, exercised compiler failure and downloaded the retained valid source. The current Three.js renderer uses WebGL 2 with the editor’s legacy GLSL-style fragment contract. Provider availability, model quality, billing, context loss and other GPU/browser combinations remain unverified.
