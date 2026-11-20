---
title: "Spectra"
description: "An audio-reactive shader study with an explicit silent preview and microphone lifecycle."
techStack: "Next.js, TypeScript, Three.js, GLSL, Web Audio API"
updated: "2026-11-20"
status: "Local product candidate c9510cf; silent preview checked, release pending."
---

<!-- Kept in step with the canonical structured study in spectra.json. -->

Local product candidate c9510cf; silent preview checked, release pending.

## Give motion and audio separate boundaries

Spectra maps low, middle and high frequency bands to shader parameters. The local candidate opens with visuals paused and no microphone access. A silent preview lets someone explore the GLSL surface before deciding whether to provide audio input.

_Unreleased local c9510cf, silent preview. No microphone or recorded audio was used._

_Local 390px view. The microphone path was not exercised._

## Keep the renderer connected to the current session

- **What happened:** The renderer could retain a stale audio reference, and permission failures could leave an awkward overlay. Repeated activation and cleanup also needed explicit ownership.
- **Why:** An asynchronous audio session and a long-lived rendering loop have different lifetimes. A captured reference can outlive the state it is meant to describe.
- **Fix:** The local repair uses a live session getter, explicit stop/retry and cleanup, and controls which keep silent preview independent from microphone activation.

## What was actually checked

Seven offline audio-session regressions and eight icon checks pass, along with types, lint, production build and a zero-finding dependency audit. Actual desktop and 390px browser checks verified the WebGL surface, silent Play/Pause by pointer and Enter, correct status, 48px phone controls and no page overflow. Microphone permission, real input devices and frequency response were not tested. These checks establish the silent interface and mocked lifecycle, not live-audio correctness.
