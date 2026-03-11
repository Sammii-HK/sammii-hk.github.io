---
title: >-
  I made a VS Code extension that turns my AI agents into Animal Crossing
  villagers
description: >-
  Isle is a VS Code extension that visualises Claude Code agent sessions as
  pixel-art characters in an Animal Crossing-style village, complete with
  dynamic lighting, seasons, and real-time status tracking.
date: '2026-03-26'
tags:
  - vscode
  - creative-coding
  - ai
  - pixel-art
  - developer-tools
draft: false
---
I run a lot of Claude Code agents. Sometimes five or six at once, each working on different parts of a codebase. The problem is that terminal sessions are boring. They scroll text, they sit there silently while the model thinks, and there is no ambient sense of "what is everyone up to right now?" So I built Isle, a VS Code extension that renders all my active agents as pixel-art characters living in a tiny village.

## Why make agents visible?

When you have multiple agents running in parallel, context-switching between terminals to check status is tedious. You end up asking "is that one still going?" or accidentally interrupting something mid-flow. I wanted a passive, always-visible display that answers one question at a glance: what is every agent doing right now?

The answer turned out to be a 2D pixel-art scene. Each agent gets a character. Each character's behaviour and colour changes based on the agent's real-time status. You open the Isle panel, and you can see your whole fleet of agents without reading a single line of terminal output.

It also just makes the work feel alive. There is something oddly satisfying about watching a little pixel character sit down at a desk, start glowing yellow while it writes code, then get up and wander outside when it finishes. It turns an invisible process into something tangible.

## The rendering engine

Isle uses a custom 2D sprite engine built on the Canvas API, rendered inside a VS Code webview panel. Everything is tile-based, with a 16x16 pixel tile size and configurable zoom levels from 1.5x to 4x.

The world is split into two areas: an office and an outdoor space. The office has desks, bookshelves, a whiteboard, a water cooler, and a breakout sofa. The outdoor area has a pond, trees, flowers, and benches. Characters pathfind between locations using a simple tile-based algorithm, choosing where to go based on their current state.

An idle agent might wander outside and sit on a bench by the pond. A working agent sits at its desk. A waiting agent stands by the water cooler. Each state maps to a location and a behaviour, so the scene naturally reflects what is actually happening across your sessions.

### Sprites and states

Every agent state has a distinct visual treatment:

- **Working** (yellow): sat at desk, actively writing code
- **Running** (green): executing commands or tools
- **Searching** (blue): grepping, globbing, reading files
- **Thinking** (purple): model is reasoning
- **Summoning** (cyan): spawning a sub-agent
- **Waiting** (orange): blocked on user input
- **Idle** (grey): session quiet, character wanders freely

The colour appears as a subtle glow around the character sprite, so you can scan the scene and immediately read the overall status. A room full of yellow glows means everyone is heads-down writing. A flash of orange means someone needs your attention.

### Dynamic lighting and seasons

I used Astronomy Engine (the same library I use in Lunary for celestial calculations) to drive a real-time lighting system. The scene transitions through dawn, morning, afternoon, dusk, and night based on actual solar position for your location. The colour palette shifts accordingly: warm golden tones in the afternoon, deep blues at night, soft pinks at dawn.

Seasons change based on the real date. In spring, the trees have blossoms and the flower beds are full. In winter, there is snow on the ground and the trees are bare. It is purely cosmetic, but it makes the world feel like a place rather than a static dashboard.

The lighting is handled as a post-processing pass over the canvas. After all tiles and sprites are rendered, a semi-transparent overlay applies the time-of-day tint. This keeps the rendering pipeline simple: draw the world, draw the characters, apply the atmosphere.

## Real-time agent integration

The extension watches for active Claude Code sessions through the VS Code extension API. When a new agent session starts, a character spawns in the village. When it ends, the character leaves. Status updates come through by monitoring the session state, and the character's behaviour updates within a frame or two.

The whole thing is written in TypeScript. The extension side handles session detection and state management. The webview side runs the rendering loop and sprite engine. Communication between them uses VS Code's standard webview messaging API, posting state updates from the extension host to the webview, which then updates character behaviours on the next render tick.

## What I learned

Building a 2D engine inside a VS Code webview is surprisingly viable. The Canvas API performs well enough for a scene this size, and the webview sandbox does not get in the way much. The main constraint is that you cannot use WebGL in VS Code webviews (at least not reliably across platforms), so everything is software-rendered. For a pixel-art scene with a handful of sprites, that is more than sufficient.

The tile-based approach keeps everything simple. Each tile is a 16x16 region with a terrain type, and the pathfinding just needs to know which tiles are walkable. Characters move tile-by-tile with a short interpolation for smooth animation. No physics engine, no complex collision detection, just grid movement.

The hardest part was getting the lighting to feel right. Too strong and it washes out the sprites. Too subtle and you cannot tell what time of day it is. I ended up hand-tuning the overlay opacity and colour values for each time period until it felt natural.

## Try it

Isle is available as a VS Code extension. If you run Claude Code sessions and want a more visual way to keep track of what your agents are doing, give it a go. It is entirely local, lightweight, and does not interfere with your agent sessions in any way.

Or just enjoy watching tiny pixel characters pretend to work. That is a valid use case too.

Until next time, Sammii
