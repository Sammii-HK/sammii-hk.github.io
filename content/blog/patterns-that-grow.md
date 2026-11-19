---
title: "Patterns that grow"
slug: "patterns-that-grow"
description: "Paint a disturbance into a Gray-Scott reaction-diffusion model, change two rates, and watch spots, stripes and branching edges grow from the same pair of equations."
date: '2026-12-14T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - emergence
  - design-engineering
interactiveLab: "living-patterns"
---

# Patterns that grow

Draw a stroke across the field and press **Let it grow**. The mark need not simply fade or blur outwards. Depending on two rates, the same kind of disturbance can break into spots, stretch into stripes, or grow edges that branch like coral.

Nothing in the code describes a branch. There are two numbers per cell, two equations, and two rates you can change. *Patterns that grow* lets you paint into that system and watch what it does with the disturbance.

## Paint, then let it run

<InteractiveExploration slug="reaction-diffusion" />

[Open the full reaction-diffusion exploration](https://labs.sammii.dev/explorations/reaction-diffusion/).

*Interactive: press **Reset to seed**, draw a few strokes directly on the field, then press **Let it grow**. Pause with **Pause growth**, and try the same strokes again with **Spots** or **Stripes**.*

The view opens on the **Coral** preset, already developed and paused. Everything starts paused; growth only runs when you ask for it.

You can draw straight onto the field with a pointer or a finger. **Brush radius** sets the size of the stroke, from 2 to 10 cells, and **Erase brush** switches the brush to wiping instead. There is also a keyboard route: move the inspection point with the arrow keys while the field is focused, then press **Seed at inspection point**.

**Develop 500 steps** jumps the simulation forward in one go, which is useful when you want to see where something is heading without waiting. **Reset to seed** returns the current preset to its starting state at zero model time.

## Two fields that feed on each other

The model is the Gray-Scott system. Every cell holds two concentrations, `U` and `V`. They change according to:

**∂U/∂t = Dᵤ∇²U − UV² + F(1 − U)**

**∂V/∂t = Dᵥ∇²V + UV² − (F + k)V**

Each term has a plain reading. The `∇²` terms spread each chemical out to its neighbours; this is the diffusion. The `UV²` term converts `U` into `V`, and it needs `V` already present to happen, so `V` makes more of itself. `F` feeds fresh `U` into the system and drains both fields. `k` removes `V`, turning it into an inert product.

`V` diffuses more slowly than `U`: here `Dᵤ` is 0.16 and `Dᵥ` is 0.08. Self-reinforcing reaction, two different rates of spreading, and steady feed and removal are all the model contains. Everything you see grow comes from those few terms.

The field shown is `V`. Dark is zero, and the palette saturates at 0.42, labelled **0.42+ · bright**. Only the colours saturate. The solver itself never clips a concentration.

## Two rates, very different worlds

The two sliders are **Feed rate · F** and **Removal rate · k**. The presets are three points in that space:

- **Spots**: F = 0.035, k = 0.065.
- **Stripes**: F = 0.030, k = 0.058.
- **Coral**: F = 0.0545, k = 0.062.

Those are small differences: the removal rates differ by at most 0.007, the feed rates by at most 0.0245. The notes are careful about the names, though. They describe visual tendencies, checked by running the solver itself, not guarantees. The starting seed, the size of the domain and the elapsed time all affect how a pattern appears.

Changing a slider does not restart anything. The simulation continues from its current state with the new rates, so you can grow one pattern and then move the rates to see what happens to it. The help text warns that some settings settle into a nearly uniform field, and that feed and removal together can change whether patterns persist, split or disappear.

## What the clock means

The **Model time** readout starts at `t = 1600.0`, not zero. Choosing a preset develops it for 3,200 numerical steps of 0.5 before showing it, so you see a pattern rather than a starting seed. **Reset to seed** takes the clock back to zero and shows the seed itself: several small patches placed by a fixed, repeatable random sequence.

Time here is dimensionless model time, not seconds. A second readout, **Mean concentration · V**, gives the average value of `V` across the grid, and a third, **Boundary**, reads **Wraps at every edge**. The grid is periodic. Something growing off the right edge reappears on the left, and the hover probe says so when you move outside the square.

## How the browser runs it

The field is a 112 by 112 grid with a spacing of 1. Each step uses a five-point Laplacian (each cell compared with its four neighbours) and a forward-Euler update. The time step is 0.5 at most. The code reduces it when needed to keep every coefficient in the update non-negative, which is what keeps the concentrations positive without clipping them. In the normal presets it stays at 0.5.

Running, the browser advances about 600 steps per second of playback, capped per frame. The model tests check, among other things, that a uniform state stays uniform, that material crosses the periodic edges correctly, that concentrations stay positive, and that results converge as the time step shrinks.

## What this is not

The fields use dimensionless units and synthetic starting conditions, and the grid units differ from the spatial scaling in Pearson's published figures, so this is an original exploration of the model rather than a reproduction of them.

The colours are a display choice. The preset called **Coral** is named for how it looks. The model creates mathematical patterns. It does not claim to simulate real coral, animal markings or anything alive, and painting is a deliberate intervention, replacing a patch with `U = 0.5` and `V = 0.5`, rather than a claim about natural chemistry.

Try one comparison before you leave. Press **Reset to seed** on **Spots**, paint one stroke, and let it grow. Then do the same on **Stripes**. Same stroke, same equations, two different answers.

## Sources

- John E. Pearson, [*Complex Patterns in a Simple System*](https://arxiv.org/abs/patt-sol/9304003), *Science* 261 (1993), pages 189 to 192, for the dimensionless Gray-Scott equations, periodic boundaries and the range of pattern behaviour.
- Hal Abelson and collaborators, MIT CSAIL, [*Gray-Scott model*](https://groups.csail.mit.edu/mac/projects/amorphous/GrayScott/), for the model and its numerical methods.
