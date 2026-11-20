---
title: "Beyond Light VR"
description: "A screen and WebXR interpretation of a 2017 light installation, with reading time and navigation treated as part of the work."
techStack: "Three.js, WebXR, GLSL, JavaScript, Vite"
updated: "2026-11-20"
status: "Local non-VR product pass at f3eaa32, unreleased. Actual desktop and phone controls checked; headset behaviour is not certified."
---

<!-- Kept in step with the canonical structured study in beyond-light-vr.json. -->

Local non-VR product pass at f3eaa32, unreleased. Actual desktop and phone controls checked; headset behaviour is not certified.

## Translate the installation without pretending the screen is the material

The original MA installation used UV-reactive ink on acetate walls. The web reconstruction moves through nine authored colour phases, reveals the wall text in its ultraviolet phase, and has a delayed desktop bloom finish. RGB colour and GLSL interpret those lighting conditions; a screen is not producing physical infrared or ultraviolet light.

![Beyond Light local ultraviolet room with a visible Poe wall text and readable Pause/Play, Next phase and Restart controls.](/assets/images/refresh-20261120/beyond-light-ultraviolet-desktop.jpg)

Actual unreleased non-VR rendering, paused in ultraviolet after keyboard look. This image shows the real shader and text, not a generated mock-up or headset capture.

## Give the reader control of the clock

The original journey left a finite reading window before the bloom finish. A hidden tab or a needed pause should not silently consume that time.

- **Use wall-clock elapsed time for everything:** Time away from the page can consume a reading window, and an uninterrupted journey gives readers no way to hold a moment.
- **Advance a virtual clock only while the journey is running and visible (chosen):** Pause and hidden-document time are excluded. Restart resets the journey while preserving pause choice, and reduced-motion preference starts paused.

The local repair separates audience control from the original artwork. While paused, Next settles directly into the following phase; during a running transition, repeated skips are blocked.

## Make the room reachable without a pointer

The scene can be focused and looked around with arrow keys, while preserving existing drag and touch handlers. Labelled Lucide controls and an About disclosure give the screen experience context. Desktop and phone tests verified the real UV reveal, keyboard framing, restart and all observed 44px buttons, without requesting an immersive session.

![Actual Beyond Light phone view with expanded installation context, a keyboard-framed wall text and paused ultraviolet transport controls.](/assets/images/refresh-20261120/beyond-light-phone.jpg)

Actual 390px non-VR view framed with the keyboard. The unsupported-VR state is preserved; no headset, permission or physical-touch result is implied.

## Preserve the work and test the new boundary

The seven original journey, room, quote and shader files are byte-identical to the reviewed baseline. Eleven icon cases and six clock/control cases pass, as do normal source lint and the production build. A peer review found that Pause during a transition could leave Next disabled; the shared advancement policy and actual browser regression now cover that sequence. Full and production dependency audits report zero findings.

## Name what the screen check cannot prove

The focused browser review did not certify a complete timed fifty-second reading and nine-second white-out, every wall text, headset bloom, controllers or immersive comfort. The existing VR path uses the plain renderer while the desktop uses post-processing. Clock mathematics is tested independently, and the renderer continues drawing while paused so camera interaction remains possible.
