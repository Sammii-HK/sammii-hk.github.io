---
title: "Pizzazz"
description: "A small DOM-effects package with configurable click and hover bursts, CSS motion and explicit listener cleanup."
techStack: "JavaScript, DOM, CSS transitions, Rollup, Jest"
updated: "2026-11-20"
status: "Legacy package; source reviewed at d265b1d. Current motion and icon-policy review remains open."
---

<!-- Kept in step with the canonical structured study in pizzazz.json. -->

Legacy package; source reviewed at d265b1d. Current motion and icon-policy review remains open.

## A narrow animation API

Pizzazz attaches a click or hover effect to a DOM target. Options control the number and size of effect elements, duration, spread, rotation and easing. The package is independent of a UI framework and its reviewed package definition has no runtime dependencies.

## Motion comes from CSS transitions

A trigger creates a positioned container and span elements around the event location. Randomised target offsets give each burst variation. Rotation adds a transform; the gravity option chooses a downward target. CSS handles transform and opacity transitions, while timers start the movement and remove the container. Easing presets named bounce and spring are cubic-bezier values rather than a physical spring simulation.

## Give attachment a cleanup path

A reusable effect must stop listening when its target no longer belongs to an interface.

- **Attach a permanent global listener:** Every mount would leave another listener unless a caller managed it independently.
- **Return an unsubscribe function (chosen):** addPizzazz returns a function that removes the event handler it installed. Hover events can also be throttled.

A framework component can attach the effect and call its cleanup during unmount. Timed container removal handles the short-lived visual output separately from listener ownership.

## The implementation defines the next polish pass

The current presets are glyph-based, with a custom character option. Their presentation needs review against the current Lucide-only policy for owned sites, alongside reduced-motion behaviour, accessibility and repeated-trigger cleanup. The reviewed code does not establish a particle pool, a shared animation loop, a custom render callback or measured mobile frame-rate and bundle-size results. Those claims have been removed from the portfolio.

## Keep the example proportionate

This is a focused package API and lifecycle example. Rollup distribution and existing DOM-oriented tests are part of its source. It should be demonstrated with an actual recorded interaction and measured output before it is used as evidence of high-performance motion engineering.
