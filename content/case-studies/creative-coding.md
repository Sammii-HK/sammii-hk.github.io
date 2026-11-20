---
title: "Creative Coding"
description: "One photograph explored through fifteen p5.js studies, with a shared shell that makes the sketches discoverable and controllable."
techStack: "p5.js, JavaScript, HTML, CSS"
updated: "2026-11-20"
status: "Local product candidate 656c6e9; all fifteen initial views checked, release pending."
---

<!-- Kept in step with the canonical structured study in creative-coding.json. -->

Local product candidate 656c6e9; all fifteen initial views checked, release pending.

## Look at the same material fifteen ways

The collection starts from one cream-begonia photograph. Pixel sampling, particles, edge detection, flow fields, Voronoi partitions and mirrored segments produce different ways of reading that image. These are creative visual sketches. Their names and numerical readouts are not scientific validation or measured performance results.

_Unreleased local 656c6e9. The gallery is generated from the fifteen-study catalogue._

_Actual local photographic sketch, not a generated illustration. The canvas is paused after interaction._

## Give the sketchbook a shared way in

The local gallery has search, category controls, shareable query state and an empty-state recovery. Every study gets a consistent heading, neighbouring-study navigation, restart, one-frame action and explicit Play/Pause controls. Canvas dimensions remain in the sketch’s logical coordinate system while the display fits the available stage. The source photograph is unchanged.

## A paused interaction still needs visible feedback

- **What happened:** Pausing the draw loop exposed a mismatch: pointer actions changed a sketch’s state without repainting, while keyboard activation already requested a frame.
- **Why:** The old pointer callback assumed an animation loop would draw the next state. The new paused default removed that assumption.
- **Fix:** The shared wrapper preserves the original callback result and requests one redraw after an action while paused. Surrounding controls do not trigger the canvas action. The actual Kaleidoscope browser check changed the paused image with both a pointer click and Enter.

## Preserved source can still acquire the wrong binding

- **What happened:** Pixel Scanner defines its own saturation helper, but p5 also publishes a global function with that name. Runtime initialisation could replace the study’s calculation.
- **Why:** An unchanged script hash preserves bytes, not the global function bindings those bytes will call.
- **Fix:** The shell captures the study’s original helper before p5 initialises and restores it before the original setup. A regression runs the actual vendored binder, proves the overwrite and verifies the restored function’s identity and red/grey results. The fifteen inline sketch algorithms remain unchanged.

## Check the interface separately from the artwork

The local branch passes twenty-three tests, normal static build/lint, original algorithm hashes, generated-data and runtime/icon freshness checks, and zero-finding full/production dependency audits. All fifteen real pages rendered labelled paused canvases at 1144px and 390px without page overflow. Phone canvases fit 334px stages, toolbar buttons measure 46px and shared navigation 44px. Selected Burst and Kaleidoscope controls, gallery discovery, keyboard coordinates and navigation were exercised.

> The runtime is self-hosted p5 1.11.13. Preserved algorithm bytes do not establish pixel-identical historical output after a runtime update, or certify every pointer combination, physical touch, screen reader, GPU/browser or long session. Some studies reveal more as frames advance; their initial frame is not a finished artwork or benchmark.
