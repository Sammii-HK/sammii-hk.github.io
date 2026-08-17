---
title: "Prism"
description: "Design engineering component library with an autonomous daily build pipeline"
techStack: "Next.js, Framer Motion, Spring Physics, GLSL, TypeScript"
---

## The problem

Prism is a living component library that grows autonomously. It publishes a new component every day, researched, built, screen-recorded and posted to social media, with no human reviewing the code before it goes out. The bar for each component was also higher than "it works": spring physics instead of CSS transitions, a GPU shader here and there, and colour that actually tracks the cursor, aiming for something distinctly handcrafted rather than the generic aesthetic of typical component libraries.

## How it's built

### Component system

Each component lives in a single file under `app/lib/components/`, exported as a named React component with a typed props interface. Demos live separately, under `app/demos/`, and a central registry maps slugs to metadata. Dynamic routes render any component by slug, and a gallery page lists everything the pipeline has produced.

### Visual primitives

A small set of shared primitives is what keeps components built on different days feeling like one system rather than a pile of unrelated ideas. `pastelColour` maps cursor position to soft RGB values, floored at 140 so nothing drifts too dark. `colourField` generates a four-blob CSS gradient that follows the pointer. `usePointer` supplies lerp-smoothed cursor coordinates. New components compose these rather than reimplementing cursor tracking from scratch.

### Spring physics

Nothing in the library animates on a CSS transition. All motion runs on requestAnimationFrame driving spring equations, with configurable stiffness, damping and mass. That's what lets a component overshoot and settle instead of just easing to a stop. A button mid-animation can also be redirected without snapping to a new position.

### The autonomous pipeline

Four agents run in sequence each day. A scout browses design inspiration via Chrome automation. A curator picks the day's component and writes a build brief. A builder implements the component, its demo, and its registry entry, then verifies the build actually compiles. A publisher records a 12-second screen capture and schedules it to X via Spellcast.

### Screen recording

A Playwright script opens the component demo in a headless browser at 1080x1080, square for social, and simulates cursor movement along bezier curves while capturing frames. ffmpeg converts the frame sequence to an mp4.

## Where the autonomy got hard

Getting a builder agent to ship code that nobody checks is the crux of the whole thing. Build verification runs `tsc --noEmit` and checks for runtime errors, and a failed build sends the agent back in with the error attached for another attempt. Pushing the success rate above 90% required careful prompt engineering in the build brief.

A second problem only showed up once several components landed on the same page: each one tracks the cursor independently, so left alone their colours could clash. Routing every component through the same `pastelColour` function fixed that at the source, a card border and a button glow in the same viewport now always land on harmonious colours.

The screen recordings had their own tell. A cursor moving in straight lines at constant speed reads as obviously scripted, so the recorder is built around cubic bezier curves with randomised control points, variable speed that slows down near interaction targets, and small pauses, enough to resemble someone actually exploring the component rather than a script clicking through it.

## Outcome

Prism ships a new component every day without manual work. The library now includes magnetic buttons, spotlight cards, ripple effects, gradient text, and shader-driven experiments. Every component is a single file with no external UI dependencies, so any of them can be copied straight into another project.
