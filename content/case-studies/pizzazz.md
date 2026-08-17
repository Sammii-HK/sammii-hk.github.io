---
title: "Pizzazz"
description: "Published npm package for customisable click and hover particle effects"
techStack: "JavaScript, Rollup, Jest, npm"
---

## The problem

Most sites that want a bit of delight on click or hover end up choosing between two bad options: pull in a heavyweight animation library, or hand-roll canvas physics. Neither is proportionate to the problem. Pizzazz is the third option: a zero-dependency package that drops into any site with a single import, configures with a few options, and produces satisfying particle effects at under 1KB gzipped.

## Architecture

### Particle system

Each effect type (confetti, sparkle, burst, trail, etc.) is a particle emitter with configurable physics. On trigger, click or hover, the emitter spawns N particles at the event coordinates. Each particle carries position, velocity, rotation, scale, opacity, and lifetime. A single shared requestAnimationFrame loop updates every active particle and removes the dead ones.

### Spring-based easing

Particle motion uses spring easing rather than linear or bezier curves. Particles launch with initial velocity, decelerate under configurable gravity, and can overshoot their rest position before settling. That overshoot is what makes the effects read as physical rather than animated: a confetti burst decelerates and settles, a sparkle expands and fades with a slight bounce.

### Presets, not primitives

There are 13 built-in effects, and each one is a preset: a particle shape (circle, square, star, line), a spawn pattern (radial burst, directional spray, trail), and a set of physics parameters. Presets can be used directly or have their individual parameters overridden, and custom shapes are supported via a render callback for anyone who needs something the built-ins don't cover.

### Build and distribution

Rollup bundles the library as ESM and CJS with TypeScript declarations. Tree-shaking keeps unused effects out of the final bundle, so a project importing a single effect ships under 1KB gzipped rather than paying for all 13.

## The hard parts

Spawning hundreds of particles on a single click causes frame drops on a low-end device. The fix was a particle pool: a fixed number of particle objects pre-allocated up front and recycled between triggers instead of created and garbage-collected every time, with the pool size auto-adjusting based on measured frame time.

There was also a portability constraint running underneath all of it. The library needed to work in React, Vue, Svelte, and plain HTML without a different adapter for each. Rather than building framework-specific bindings, the API attaches to a DOM element directly through a plain `attach(element, options)` call. A React hook wrapper exists as a separate export for convenience, but nothing depends on it.

Getting an effect to look right meant tuning gravity and spread by feel: too much gravity and particles feel heavy, too little and they float unnaturally. Every preset went through dozens of iterations, compared side by side at different screen sizes, before it was allowed to ship.

## Outcome

Pizzazz is published on npm under `@unicorn-poo/pizzazz`. It adds particle effects to any website with a single line of code, runs at 60fps on mobile, and weighs under 1KB per effect. The spring-based physics give it a tactile quality that CSS animations can't replicate.
