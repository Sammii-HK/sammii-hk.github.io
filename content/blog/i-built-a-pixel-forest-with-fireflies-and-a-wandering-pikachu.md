---
title: I built a pixel forest with fireflies and a wandering Pikka
description: >-
  Grove is a live AI agent dashboard disguised as a pixel-art forest. Each Claude
  session spawns a Pikka that moves to its project clearing, carrying a flower
  coloured by what it is doing. Built with Canvas API and TypeScript.
date: '2026-03-20'
tags:
  - creative-coding
  - canvas
  - typescript
  - ai
  - webdev
draft: false
---
Most agent dashboards are tables and status badges. I wanted mine to be a forest.

Grove is a pixel-art scene that runs in the browser, rendered entirely with the Canvas API. It monitors my Claude AI sessions in real time. Each active session spawns a Pikka sprite that moves to the project clearing it belongs to, carrying a small flower coloured by its current state. At a glance I can see which projects are busy, what each agent is doing, and how active things are, without reading a single log line.

## Five clearings, five projects

The forest has five project clearings, each with its own familiar creature and animated workstation:

- **Lunary** has a moon moth and a celestial orrery, glowing purple
- **Spellcast** has a raven and a messenger web, glowing orange
- **Content Creator** has a lantern wisp and a moonlit pool, glowing cyan
- **Dev** (the homebase for Grove itself and general work) has a Pikka familiar and a runic forge, glowing yellow
- **Orbit** has a crystal guardian and a summoning circle, glowing blue

When a Claude session starts, the API parses its project path and maps it to the matching clearing. A Lunary session spawns its Pikka at the Lunary clearing. A Spellcast session heads to the raven's web. If the project does not match any clearing, the Pikka wanders the general Dev area.

## How sessions become Pikkas

The data flow starts with Claude's session files. Each active session writes to a `.jsonl` file in `~/.claude/projects/`. Grove's API route reads the last entry in each file, extracts the most recent tool used, and maps it to one of six agent states:

- **Idle** (white): no recent activity
- **Working** (yellow): editing files
- **Running** (green): executing commands
- **Searching** (blue): reading, grepping, fetching
- **Thinking** (purple): internal reasoning
- **Summoning** (orange): spawning sub-agents

The frontend polls this API every five seconds. New sessions get a Pikka. Existing Pikkas update their state and colour. Sessions inactive for more than 30 minutes fade out.

Each Pikka carries a four-petal flower at its mouth, coloured by its current state. It is a small detail but it makes the forest immediately readable. A cluster of yellow flowers means lots of editing. A purple flower drifting alone means something is thinking.

## The rendering engine

The core lives in an `engine/` directory with a handful of focused modules:

- **renderer.ts** handles the draw loop, canvas sizing, and the full layer stack
- **scene.ts** defines the five clearings with their sprites, colours, and path matching rules
- **sprite.ts** deals with pixel-art sprite rendering using character-to-colour lookup maps
- **clearing.ts** defines the type interfaces for agent states, sessions, and clearing configs
- **particles.ts** drives fireflies, workstation sparks, and summoning magic dust
- **pika-agent.ts** controls each Pikka's wandering behaviour and animation

The canvas renders at a low pixel-art resolution and scales up with `imageSmoothingEnabled: false` for crisp edges. The scene graph sorts everything by layer: sky and aurora at the back, foreground tree silhouettes at the front, with clearings, workstations, familiars, Pikkas, and particles layered in between.

## Fireflies and the particle engine

The fireflies use a lightweight particle engine that manages spawn rates, lifetimes, velocity, and glow effects. 65 persistent fireflies drift across the forest with damped physics and gentle random movement.

The glow effect is a radial gradient drawn at each particle's position, transitioning from a warm yellow centre to transparent. The key to making it look good is using `globalCompositeOperation: 'lighter'` on the canvas context, so overlapping glows add together rather than painting over each other.

Beyond fireflies, the particle system handles two more types:

- **Sparks** erupt from workstations when agents in that clearing are working or running. They follow projectile motion with gravity, fading as they fall.
- **Magic dust** appears during summoning events (when an agent spawns sub-agents). Slow upward float with pulsing colour.

## Workstations and familiars

Each clearing has a stationary familiar creature and an animated workstation. The familiar reflects the project's personality. The workstation reflects its nature:

- The **runic forge** glows and throws sparks when Dev agents are editing
- The **celestial orrery** spins when Lunary sessions are active
- The **messenger web** pulses when Spellcast is scheduling posts
- The **moonlit pool** shimmers when Content Creator is generating
- The **summoning circle** lights up when Orbit is orchestrating agents

Workstations have two animation frames (dim and active) and throw 3 sparks every 0.25 seconds when any session in their clearing is busy.

## Interaction

Click on any Pikka to see its session details: which project it belongs to, what it is currently doing, the last tool it used, and when it was last active. It turns an abstract `.jsonl` log into something you can point at and say "that one is editing the synastry engine right now."

## Tech choices

The whole thing is built with Next.js and TypeScript. The canvas rendering is entirely client-side, wrapped in a React component with a `useEffect` that kicks off the render loop. No external rendering libraries, no WebGL, just the 2D canvas context. All sprites are defined as character arrays with colour lookup maps, hand-drawn at pixel scale.

TypeScript helps here more than you might expect for a creative project. Having typed interfaces for particles, sprites, agent states, and clearing configs catches mistakes early, especially when tweaking the particle system where a wrong property name can silently break the glow effect.

## What I learned

Building a renderer from scratch, even a simple one, gives you a real appreciation for what engines like Phaser or PixiJS handle for you. Scene ordering, sprite animation timing, particle lifecycle management: each one is straightforward in isolation, but they compound quickly.

The bigger lesson is about making the invisible visible. I run multiple Claude sessions across five projects simultaneously. Before Grove, knowing what was happening meant checking terminal tabs. Now I glance at the forest. If the Lunary clearing is full of yellow-flowered Pikkas, I know a lot of editing is happening. If Orbit's summoning circle is lit up, agents are being orchestrated.

It is about 500 lines of engine code. It is also my favourite thing I have built this year.

Until next time, stay curious.

Sammii
