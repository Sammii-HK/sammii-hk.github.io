---
title: I built a pixel forest with fireflies and a wandering Pikka
description: >-
  A look at Grove, a pixel-art forest simulation built with Canvas API and
  TypeScript, featuring dynamic lighting, particle-driven fireflies, and a
  sprite-based Pikka agent.
date: '2026-03-20'
tags:
  - creative-coding
  - canvas
  - typescript
  - gamedev
  - webdev
draft: false
---
Sometimes you just want to build something for the joy of it. No product roadmap, no user stories, no sprint planning. Just vibes. Grove is exactly that: a pixel-art forest simulation that lives in the browser, rendered entirely with the Canvas API.

It started as a question: what would it take to build a simple 2D scene engine from scratch? Not a game engine, not a framework, just enough structure to render a nighttime forest with trees, flowers, fireflies, and a little Pikka wandering around.

## The rendering engine

Grove runs on a custom 2D rendering engine built with TypeScript and the Canvas API. The core lives in an `engine/` directory with a handful of focused modules:

- **renderer.ts** handles the draw loop and canvas sizing
- **scene.ts** manages the scene graph, layering objects back-to-front
- **sprite.ts** deals with sprite sheets and animation frames
- **clearing.ts** carves out open spaces in the forest
- **particles.ts** drives the firefly particle system
- **pika-agent.ts** controls Pikka's wandering behaviour

The canvas is responsive, filling the entire viewport and redrawing on resize. Everything renders at a pixel-art scale, so the actual resolution is kept low and then scaled up with `imageSmoothingEnabled: false` to preserve those crisp edges.

The scene graph is deliberately simple. Each object has a position, a layer index, and a draw method. The renderer sorts by layer, then calls draw in order. No physics, no collision detection, no input handling beyond what Pikka needs. It is the bare minimum to get pixels on screen, and that is the point.

## Trees, moon, and the night sky

The forest is built from pine tree silhouettes, dark shapes against a deep blue-purple sky. The moon sits high in the scene, casting a soft glow that is just a radial gradient on a separate layer. Stars are scattered randomly, with a subtle twinkle achieved by oscillating their alpha over time.

Flowers dot the forest floor, adding small splashes of colour to the otherwise dark palette. The clearing system (`clearing.ts`) creates open spaces between the trees, giving the scene depth and preventing it from looking like a solid wall of pine.

## Fireflies and the particle engine

The fireflies are the part I am most pleased with. They use a lightweight particle engine that manages spawn rates, lifetimes, velocity, and glow effects.

Each firefly particle has a position, a drift vector, an age, and a maximum lifetime. On each frame, particles drift slowly with a bit of randomness applied to their movement, giving them that organic, meandering feel. When a particle reaches its lifetime, it fades out and gets recycled.

The glow effect is a radial gradient drawn at each particle's position, transitioning from a warm yellow centre to transparent. The key to making it look good is using `globalCompositeOperation: 'lighter'` on the canvas context, so overlapping glows add together rather than painting over each other. This creates those soft, luminous spots that make the scene feel alive.

Spawn rate and drift speed are tuned to keep things gentle. Too many fireflies and it looks like a rave. Too few and the forest feels dead. The sweet spot is somewhere around 20 to 30 active particles at any given time.

## The Pikka agent

Because why not? `pika-agent.ts` implements a simple autonomous agent that wanders through the forest. Pikka is drawn from a sprite sheet, with idle and walking animation frames.

The behaviour is basic: pick a random target position within the clearing, walk towards it, pause for a bit, then pick another. Direction changes flip the sprite horizontally. There is no pathfinding, no obstacle avoidance. Pikka just vibes in the forest, and honestly, that is all it needs to do.

## Tech choices

The whole thing is built with Next.js and TypeScript, mostly because that is what I already had set up. The canvas rendering is entirely client-side, wrapped in a React component with a `useEffect` that kicks off the render loop. No external rendering libraries, no WebGL, just the 2D canvas context.

TypeScript helps here more than you might expect for a creative project. Having typed interfaces for particles, sprites, and scene objects catches mistakes early, especially when tweaking the particle system where a wrong property name can silently break the glow effect.

## What I learned

Building a renderer from scratch, even a simple one, gives you a real appreciation for what engines like Phaser or PixiJS handle for you. Scene ordering, sprite animation timing, particle lifecycle management: each one is straightforward in isolation, but they compound quickly.

The biggest takeaway is that creative coding does not need to be complex to be satisfying. Grove is maybe 500 lines of actual engine code. It does not do much. But watching those fireflies drift through the trees while Pikka wanders around the clearing is genuinely calming.

Sometimes the best projects are the ones with no purpose at all.

Until next time, stay curious.

Sammii
