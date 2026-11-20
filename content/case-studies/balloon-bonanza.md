---
title: "Balloon Bonanza"
description: "A small rigid-body playground where a balloon’s character comes from its shape, constraints and tuned motion."
techStack: "React, TypeScript, Matter.js, Vite"
updated: "2026-11-20"
status: "Earlier motion experiment; source reviewed at 4bb3edd, performance and device interaction not remeasured."
---

<!-- Kept in step with the canonical structured study in balloon-bonanza.json. -->

Earlier motion experiment; source reviewed at 4bb3edd, performance and device interaction not remeasured.

## Two bodies give the knot room to move

The scene creates one hundred balloons. Each uses a circle and a triangular knot, connected by a zero-length pin constraint and two softer side constraints. The pin has stiffness 0.1; the side constraints use 0.01. Keeping the knot separate gives it relative motion instead of drawing it as a fixed decoration on the circle.

## Tune a feeling, not a fluid model

The source reduces world gravity to 0.11, uses air friction and high restitution, and adds random initial torque and sideways force. These are authored rigid-body conditions. They do not calculate displaced air, gas pressure or buoyant lift, and a low-density body alone is not a buoyancy solver.

## Let the pointer transfer momentum

A Matter mouse constraint with stiffness 0.05 provides grab-and-throw interaction. The world contains the balloon and knot bodies, three boundaries and three constraints per balloon. Source counts describe the scene setup; the previous sixty-frames-per-second claim has been removed because this review has no frame-time capture or named test device.

## Keep the lifecycle visible

The component stops its runner and renderer and clears the world on unmount. A separate effect updates the canvas background when system colour preference or the manual theme changes, without rebuilding all bodies. The actual follow-up should test resizing, touch input, a keyboard alternative and reduced motion, then record frame timing and capture the result.
