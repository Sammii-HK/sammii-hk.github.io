---
title: "Pizzazz"
description: "Published npm package for customisable click and hover particle effects"
techStack: "JavaScript, Rollup, Jest, npm"
---

## The problem

Adding playful click and hover effects to a website usually means pulling in a heavy animation library or writing bespoke canvas code. I wanted a zero-dependency package that could be dropped into any site with a single import, configured with a few options, and produce satisfying particle effects at under 1KB gzipped.

## Architecture

### Particle system

Each effect type (confetti, sparkle, burst, trail, etc.) is a particle emitter with configurable physics. On trigger (click or hover), the emitter spawns N particles at the event coordinates. Each particle has position, velocity, rotation, scale, opacity, and lifetime. A shared requestAnimationFrame loop updates all active particles and removes dead ones.

### Spring-based easing

Particle motion uses spring easing rather than linear or bezier curves. Particles launch with initial velocity, decelerate under configurable gravity, and can overshoot their rest position. This makes effects feel physical. A confetti burst decelerates and settles; a sparkle expands and fades with a slight bounce.

### 13 built-in effects

Each effect is a preset: a combination of particle shape (circle, square, star, line), spawn pattern (radial burst, directional spray, trail), and physics parameters. Users can use presets directly or override individual parameters. Custom shapes are supported via a render callback.

### Build and distribution

Rollup bundles the library as ESM and CJS with TypeScript declarations. Tree-shaking ensures unused effects are excluded from the final bundle. The published package is under 1KB gzipped for a single effect import.

## Challenges

**Performance at scale**: Spawning hundreds of particles per click on a low-end device causes frame drops. The particle pool pre-allocates a fixed number of particle objects and recycles them rather than creating and garbage-collecting on every trigger. The pool size auto-adjusts based on measured frame time.

**Framework agnosticism**: The library needed to work with React, Vue, Svelte, and plain HTML without framework-specific adapters. The API attaches to DOM elements via a simple `attach(element, options)` call. A React hook wrapper is provided as a separate export but is not required.

**Gravity and spread tuning**: Getting effects to look "right" required extensive parameter tuning. Too much gravity makes particles feel heavy; too little makes them float unnaturally. Each preset went through dozens of iterations, compared side-by-side at different screen sizes, before shipping.

## Outcome

Pizzazz is published on npm under `@unicorn-poo/pizzazz`. It adds particle effects to any website with a single line of code, runs at 60fps on mobile, and weighs under 1KB per effect. The spring-based physics give effects a tactile quality that CSS animations cannot replicate.
