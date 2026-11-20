---
title: "Balloon Bonanza"
description: "A small rigid-body playground where a balloon’s character comes from its shape, constraints and tuned motion."
techStack: "React, TypeScript, Matter.js, Vite"
updated: "2026-11-20"
status: "Local actual-tool pass at 5b5b62e, unreleased. Desktop and phone interaction verified; no buoyancy or frame-rate claim."
---

<!-- Kept in step with the canonical structured study in balloon-bonanza.json. -->

Local actual-tool pass at 5b5b62e, unreleased. Desktop and phone interaction verified; no buoyancy or frame-rate claim.

![Balloon Bonanza local playground with a paused colourful balloon scene, Play, Start again and Night sky controls.](/assets/images/refresh-20261120/balloon-desktop-playground.jpg)

Actual unreleased desktop view: one hundred real Matter.js balloons, paused after switching to the light sky.

## Two bodies give the knot room to move

The local scene offers twenty-five, fifty or one hundred balloons. Each uses a circle and a triangular knot, connected by a zero-length pin constraint and two softer side constraints. The pin has stiffness 0.1; the side constraints use 0.01. Keeping the knot separate gives it relative motion instead of drawing it as a fixed decoration on the circle.

## Tune a feeling, not a fluid model

The source reduces world gravity to 0.11, uses air friction and high restitution, and adds random initial torque and sideways force. These are authored rigid-body conditions. They do not calculate displaced air, gas pressure or buoyant lift, and a low-density body alone is not a buoyancy solver.

## Let the pointer transfer momentum

A Matter mouse constraint with stiffness 0.05 provides grab-and-throw interaction. The world contains the balloon and knot bodies, three boundaries and three constraints per balloon. Source counts describe the scene setup; the previous sixty-frames-per-second claim has been removed because this review has no frame-time capture or named test device.

## Own the scene rather than rebuilding it for a theme

The local repair gives the Matter runner, render loop, observer, pointer handlers and world one cleanup boundary. Theme changes redraw existing bodies. A ResizeObserver updates the renderer and three boundaries, translating each knot with its balloon. Real pause, reset, count selection and a single-step control expose the simulation rather than hiding it behind a full-window canvas.

![Scrolled phone view of the paused twenty-five-balloon scene, pointer surface, density selector and keyboard-controls section.](/assets/images/refresh-20261120/balloon-phone-playground.jpg)

Actual 390px local tool after pointer and keyboard interaction. This scrolled view preserves the scene and controls; it is not a fabricated phone hero.

## Give a pointer playground a keyboard route

Left and Right choose a balloon; Up applies a lift, including one real physics step while paused. Browser checks showed the selected body move, a pointer fling transfer motion, reset retain one canvas and resize fit a 390px page. The open top remains part of the room, so strong flings can leave the visible area until they fall back or the scene is reset.

## Test the model separately from the presentation

Three real Matter.js cases check the body/constraint counts, resize relationships and a lift against an unlifted control. Together with eleven icon regressions, normal lint, types and a production build, these checks cover the local repair. Desktop and phone buttons measured at least 44px. No FPS, buoyancy, physical-touch, broad browser or assistive-technology result is claimed; reduced-motion and hidden-tab paths were reviewed in source.
