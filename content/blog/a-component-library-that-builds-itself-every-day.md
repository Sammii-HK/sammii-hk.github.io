---
title: A component library that builds itself every day
description: >-
  Prism is a design engineering component library with an autonomous daily
  pipeline. Scout, curate, build, publish, repeat.
date: '2026-03-07'
tags:
  - design
  - react
  - creative-coding
  - automation
  - webdev
draft: true
---
What if a component library didn't wait for you to have a free weekend? What if it woke up every morning, found something interesting on the internet, and built a new interactive component before you'd finished your coffee?

That's Prism. It's my design engineering component library, and it builds itself every day.

## The aesthetic

Before I talk about the pipeline, I need to talk about the look. Every component in Prism shares a visual language I'd describe as "quiet confidence". The background is near-black (#050505). Colours are luminous pastels that shift and respond to your cursor position. Nothing is loud. Nothing demands attention. But everything moves.

Spring physics drive every animation. Not CSS transitions, not cubic beziers; actual spring equations running in requestAnimationFrame. The result is motion that feels physical. A 2-3 pixel overshoot on a hover. A 2-3 degree tilt that settles naturally. Lerp factors between 0.06 and 0.12 so nothing ever snaps into place.

The cursor is the colour source. Move it to the top-left and you get cool blues. Bottom-right brings warm pinks. The RGB channels map directly to pointer position, passed through a pastel colour function that keeps everything soft. Every component inherits this, so the whole library feels like one coherent thing.

## Deep dive: MagneticButton

MagneticButton was the first component I built by hand, and it set the rules for everything that followed.

Hover near it and the button drifts toward your cursor, pulled by a spring force. The text inside shifts independently, creating a subtle parallax. A soft glow appears beneath it, tinted by the cursor-reactive colour system. Pull your cursor away and it settles back with a tiny overshoot.

The implementation is pure React and requestAnimationFrame. No animation libraries. The spring simulation runs on every frame, calculating displacement from the rest position and applying damping. The colour is derived from the cursor's viewport coordinates, mapped to HSL with high lightness to keep things pastel.

What makes it interesting isn't any single effect. It's how small each effect is. The displacement is maybe 8 pixels. The tilt is barely perceptible. The glow is so faint you might not consciously notice it. But stack them together and the button feels alive.

## Deep dive: SpotlightCard

SpotlightCard takes a different approach. Instead of moving toward your cursor, it reveals a radial gradient that follows it. Picture a dark card with a subtle border. Move your cursor over it and a soft pool of light follows, illuminating the surface like a torch beam across a dark table.

The gradient is positioned at the cursor's coordinates relative to the card, with a generous radius so it fades out naturally. The border picks up the same colour, creating a coherent glow effect. It's the kind of thing you'd use for feature cards, pricing tiers, or portfolio pieces; anywhere you want to reward exploration without overwhelming the layout.

## The autonomous pipeline

Here's where it gets interesting. Prism has a four-stage daily pipeline that runs without me:

**Scout** fires up a headless browser and trawls X for trending UI interaction patterns. It's looking for the kind of micro-interactions that get designers excited: novel hover effects, scroll-triggered animations, creative uses of WebGL. It collects references and descriptions of what it finds.

**Curator** takes the scout's findings and picks today's build. It considers what's already in the library, what would complement the existing components, and what's technically feasible as a single-file React component. It writes a detailed build brief with specifications for the animation, the interaction model, and how it should integrate with Prism's colour system.

**Builder** takes the brief and writes the component. Real TypeScript, real Framer Motion or raw requestAnimationFrame, real GLSL if shaders are involved. It creates the component file, a demo page, and registers it in the gallery. Then it runs the build to make sure everything compiles.

**Publisher** records a 12-second video of the component in action using Playwright with an organic cursor simulation, then posts it to X, Bluesky, and Mastodon via Spellcast.

The whole thing runs through a shell orchestrator that passes state between agents using simple files in a queue directory. Each stage writes its output, the next stage reads it. If any stage fails, the pipeline stops and I get a notification.

## The playground

Not everything needs to be a polished component. The playground is where experimental ideas live: colour-field (a full-viewport reactive colour wash), fluid-mesh (flowing gradient meshes), text-dissolve (characters that scatter on hover), gravity-wells (particles attracted to cursor position), and shader-marbling (GLSL-powered marble textures that respond to interaction).

Some of these will graduate to full components. Some won't. The point is having a space where the pipeline can deposit experiments that aren't ready for the gallery yet.

## Why build it this way?

I could just build components when I feel like it. Most people do. But I wanted to see what happens when you automate the creative process and let it compound. One component a day is 365 a year. Even if half of them are mediocre, that's still a substantial library of interactive, cursor-reactive components that all share the same visual DNA.

The pipeline also forces consistency. Every component goes through the same curator, which checks it against the existing library. Every component uses the same colour system. Every component gets tested, recorded, and published the same way. The result is a library that feels designed, even though the individual build decisions are made autonomously.

It's also a genuinely useful forcing function for the underlying infrastructure. Building the pipeline meant building a screen recorder, a video publishing system, a component registry, and a gallery with dynamic routes. All of that is reusable beyond Prism.

## What's next

The immediate goal is density. More components, more playground experiments, more coverage of interaction patterns. I want Prism to be the place I reach for when I need a button, a card, a modal, or a transition that feels considered.

Longer term, I'm interested in what happens when the pipeline gets feedback. Right now it publishes and moves on. What if the curator could see which posts got engagement and factor that into tomorrow's build decision? What if the most popular components influenced the direction of the library?

For now, it wakes up every morning and builds something new. That's enough.

-- Sammii
