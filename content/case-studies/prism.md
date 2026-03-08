---
title: "Prism"
description: "Design engineering component library with an autonomous daily build pipeline"
techStack: "Next.js, Framer Motion, Spring Physics, GLSL, TypeScript"
---

## The problem

I wanted a living component library that grows autonomously: every day, a new cursor-reactive component is researched, built, screen-recorded, and published to social media without manual intervention. The components themselves needed to feel distinctly handcrafted, with spring physics, GPU shaders, and cursor-mapped colour, not the generic aesthetic of typical component libraries.

## Architecture

### Component system

Each component lives in a single file under `app/lib/components/`. Every component exports a named React component with a typed props interface. Demos live separately under `app/demos/`, and a central registry maps slugs to metadata. Dynamic routes render any component by slug, and a gallery page lists everything.

### Visual primitives

The library shares a set of visual primitives that give all components a cohesive feel. `pastelColour` maps cursor position to soft RGB values (floor at 140 so colours stay light). `colourField` generates a 4-blob CSS gradient that follows the pointer. `usePointer` provides lerp-smoothed cursor coordinates. Components compose these primitives rather than reimplementing cursor tracking.

### Spring physics

All motion uses requestAnimationFrame with spring equations, never CSS transitions. Springs have configurable stiffness, damping, and mass. This means components overshoot, settle, and respond to interruption naturally. A button mid-animation can be redirected without snapping.

### Autonomous pipeline

The pipeline runs four agents in sequence. A scout agent browses design inspiration via Chrome automation. A curator agent picks the day's component and writes a detailed build brief. A builder agent implements the component, demo, registry entry, and verifies the build compiles. A publisher agent records a 12-second screen capture and schedules it to X via Spellcast.

### Screen recording

A Playwright script opens the component demo in a headless browser at 1080x1080 (square for social), simulates organic cursor movement using bezier curves, and captures frames. ffmpeg converts the frame sequence to an mp4.

## Challenges

**Autonomous build reliability**: The builder agent needs to produce components that compile and look good without human review. The build verification step runs `tsc --noEmit` and checks for runtime errors. If the build fails, the agent retries with error context. Getting the success rate above 90% required careful prompt engineering in the build brief.

**Cursor colour consistency**: With multiple components on screen, each tracking the cursor independently, colours could conflict. The shared `pastelColour` primitive ensures all components derive colour from the same function, so a card border and a button glow in the same viewport always use harmonious colours.

**Recording organic motion**: Robotic cursor paths make screen recordings look artificial. The recorder uses cubic bezier curves with randomised control points, variable speed (slower near interaction targets), and small pauses to simulate a human exploring the component.

## Outcome

Prism ships a new component every day without manual work. The library has grown to include magnetic buttons, spotlight cards, ripple effects, gradient text, and shader-driven experiments. Each component is a single file with no external UI dependencies, making them easy to copy into any project.
