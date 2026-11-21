---
title: "Liquidity"
description: "Two moving-type studies with different models, explicit controls and owned animation lifecycles."
techStack: "Next.js, React, TypeScript, GSAP, SVG, Rapier2D, Canvas"
updated: "2026-11-21"
status: "Local actual-tool pass at 3e37c9e, unreleased. Real wave and particle interactions checked; no fluid-solver or frame-rate claim."
---

<!-- Kept in step with the canonical structured study in liquidity.json. -->

Local actual-tool pass at 3e37c9e, unreleased. Real wave and particle interactions checked; no fluid-solver or frame-rate claim.

## One word, two materials

The wave moves a sampled sine path inside an SVG text clip. The particle study moves rigid bodies with Rapier and draws their centres through a cached text mask. Keeping those methods distinct makes the interface more useful: change a curve or disturb a field of bodies, then see the difference. Neither model is presented as a fluid solver.

![Liquidity local overview with separate cards for the SVG wave and Rapier particle studies.](/assets/images/refresh-20261120/liquidity-overview-desktop.jpg)

Actual unreleased local overview. The method descriptions distinguish a geometric animation from a constrained rigid-body experiment.

## Make animation ownership explicit

The earlier wave could leave timelines and resume timers behind. The local controller owns one idle timeline, one interaction tween and one replaceable timer. Pause, pointer changes and disposal clear the appropriate work. Every instance has its own text-clip identifier, and manual shifts still update the actual curve while paused.

![Scrolled local wave study with the actual LIQUID text clip, wave height and speed sliders, manual shift and static SVG export controls.](/assets/images/refresh-20261120/liquidity-wave-desktop.jpg)

Actual scrolled desktop view. Export serialises the current static SVG shape and editable text; it does not export a running animation or outlined font. Real pasted clipboard bytes remain unverified.

## Allocate the engine only while its owner exists

Rapier initialisation is asynchronous. A component can disappear before its WASM promise resolves, and cleanup must not create or free a world twice.

- **Allocate after every resolved initialisation:** A late resolution can create resources after unmount, while unrelated event handlers and animation frames keep the old scene reachable.
- **Check ownership before allocation and centralise disposal (chosen):** The local scene validates Canvas first, checks disposal after initialisation and owns RAF, observers, listeners and the one world-free boundary.

Mocked lifecycle cases cover missing Canvas, late initialisation, engine failure, bounded steps and idempotent cleanup. The browser separately loaded the actual local WASM engine and exercised the controls.

## Map input into the model, not the display rectangle

Pointer coordinates now scale into logical scene units rather than assuming one CSS pixel is one simulation unit. Centre impulses remain finite and vertical click force uses the vertical delta. A native centre-pulse button gives the same operation a keyboard path and advances a real step while paused. Reset clears motion and respawns the chosen count; the lighter default remains labelled, with the original 2,500 bodies still selectable.

![Actual local Liquidity phone view showing a paused particle word, count choices, reset and a centre-pulse control.](/assets/images/refresh-20261120/liquidity-particles-phone.jpg)

Actual 390px Rapier view. Letter outlines guide the eye; the collision/containment boundary is the model box, not the shape of each letter.

## Measure the claim at the boundary tested

Thirteen motion, lifecycle, control and SVG cases plus eleven icon regressions pass, with lint, types and a production build. Desktop and phone checks exercised real pause, pulse, count, reset and wave keyboard controls; the phone had no horizontal overflow and observed controls were at least 44px. Full and production dependency audits report zero findings. The copy UI reported success but the browser clipboard read was empty, so actual pasted bytes are not certified. No FPS, physical-touch, broad browser or assistive-technology result is claimed.
