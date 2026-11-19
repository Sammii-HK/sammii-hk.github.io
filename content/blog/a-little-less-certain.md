---
title: "A little less certain"
slug: "a-little-less-certain"
description: "Squeeze a Gaussian wave packet, compare its position and momentum spreads on fixed axes, then release a free electron and see which distribution changes."
date: '2026-11-27T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - quantum-physics
  - design-engineering
interactiveLab: "uncertainty"
---

# A little less certain

Choose **Pinpoint** and the position curve becomes a narrow copper spike, with a spread of a quarter of a nanometre. The momentum curve beside it does the opposite. It flattens into a much broader lavender hill.

Now press **Release packet**. Ten femtoseconds later, the spike has spread to more than nine times its starting width. The momentum hill has not changed at all.

*A little less certain* is an interactive Gaussian wave packet for a free electron. It is built around two plots that describe the same state, and around one question: when the state changes with time, which of them moves?

## Prepare a narrow state

<InteractiveExploration slug="quantum-uncertainty" />

[Open the full quantum uncertainty exploration](https://labs.sammii.dev/explorations/quantum-uncertainty/).

*Interactive: choose **Pinpoint**, compare the two plots, then press **Release packet**. Pause with **Pause time**, or drag **Time after release** to scrub between 0 and 10 femtoseconds.*

The left plot is position, in nanometres. The right plot is momentum, in units of `ħ/nm`. Each has a bracket marked **±1σ** under it, showing one standard deviation either side of zero. On a narrow screen the two plots stack.

Both axes are fixed. When you change the preparation, the curves change shape but the scales do not quietly rescale to flatter them. That matters, because the comparison is the whole point. A narrow curve on a fixed axis really is narrow.

**Initial position spread** sets the width of the prepared state, from 0.20 to 2.00 nanometres. The three presets set it to 0.25 (**Pinpoint**), 0.70 (**Balanced**) and 1.70 (**Spread out**). Changing the spread creates a new state and resets the clock to zero. **Re-prepare** does the same without changing the width.

## The trade at preparation

Three readouts follow the state: **Position spread · σₓ**, **Momentum spread · σₚ** and **Uncertainty product**.

At the moment of preparation, the two spreads are tied together:

**σₚ = ħ / (2σₓ)**

So their product is always the same: **σₓσₚ = ħ/2**. The line under the canvas says exactly that, **Prepared Gaussian: σₓσₚ = ħ/2**, and the **Uncertainty product** readout shows `0.500 ħ` for every preparation.

Halve the position spread and the momentum spread doubles. **Balanced** gives `0.700 nm` and `0.714 ħ/nm`. **Pinpoint** gives `0.250 nm` and `2.000 ħ/nm`. The canvas puts it in one line: a tighter preparation needs a wider range of momenta.

This is a property of the Gaussian state itself: the caption calls it a minimum-uncertainty Gaussian state. [Richard Fitzpatrick's notes on uncertainty](https://farside.ph.utexas.edu/teaching/qmech/Quantum/node39.html) cover position and momentum uncertainty in Gaussian states.

## Release it

Press **Release packet** and the electron evolves freely, with no forces acting on it. The clock runs from 0 to 10 femtoseconds. A femtosecond is 10⁻¹⁵ seconds, and the help text is clear that playback is vastly slowed.

The position distribution spreads. The momentum distribution does not. The line under the canvas changes to say so: **Free evolution: σₚ stays fixed; σₓ grows**.

The spreading follows an exact formula for a free Gaussian packet. With initial spread `s` and electron mass `m`:

**τ = ħt / (2ms²)**

**σₓ(t) = s √(1 + τ²)**

The counterintuitive part is the `s²` in the denominator of `τ`. The narrower you prepare the packet, the faster it spreads. After the full 10 femtoseconds:

- **Pinpoint** grows from `0.250 nm` to `2.329 nm`.
- **Balanced** grows from `0.700 nm` to `1.083 nm`.
- **Spread out** barely moves, from `1.700 nm` to `1.734 nm`.

That connects back to the first plot. The preparation with the widest momentum spread is the one whose position distribution spreads fastest. [Barton Zwiebach's MIT notes on the free wave packet](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/6ca5bd79a2121967796f7c0b8f6f48c9_MIT8_04S16_LecNotes7.pdf) work through the same evolution.

## Why the product grows

Watch **Uncertainty product** during release. It climbs above `0.500 ħ`. For **Pinpoint** it reaches `4.658 ħ` by the end of the clock.

That does not mean the state is getting worse in some general sense. As the packet evolves freely, it develops a correlation between position and momentum. The model's source notes give the exact relation that still holds throughout:

**σₓ²σₚ² − Cov(x,p)² = ħ²/4**

The simple product grows because it ignores that correlation. The exploration's notes keep the bookkeeping honest rather than presenting a single number as the whole story.

## What the two plots are not

The plots describe distributions across many identical, separately repeated preparations. They are not a simultaneous measurement of one particle's exact position and exact momentum. Hovering over either curve gives a probability density at that point, not a reading from a detector.

The model also does not reduce uncertainty to measurement disturbance. Nothing here pokes the electron. The spreads belong to the prepared state before any measurement happens.

It is a free electron, so there are no external forces. The mean position and mean momentum are both zero, which is why everything stays centred. Position is in nanometres, time in femtoseconds, and momentum in `ħ/nm`.

Try one last comparison. Prepare **Spread out**, release it, and watch how little the position curve moves. Then prepare **Pinpoint** and do the same. The broader starting state is the one that keeps its shape.

## Sources

- Richard Fitzpatrick, University of Texas at Austin, *Quantum Mechanics*, [*Uncertainty*](https://farside.ph.utexas.edu/teaching/qmech/Quantum/node39.html), for position and momentum uncertainty in Gaussian states.
- Barton Zwiebach, MIT 8.04 *Quantum Physics I*, [Lecture 7: *Time evolution of a free wave packet*](https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/6ca5bd79a2121967796f7c0b8f6f48c9_MIT8_04S16_LecNotes7.pdf), for the free spreading of a Gaussian packet.
- Richard Fitzpatrick, University of Texas at Austin, [*Wave packets*](https://farside.ph.utexas.edu/teaching/qmech/Quantum/node25.html), for the Gaussian Fourier pair, named in the exploration's model notes.
- NIST, [*Fundamental physical constants*](https://physics.nist.gov/cuu/Constants/) (CODATA 2022), for the electron mass and Planck constant.
