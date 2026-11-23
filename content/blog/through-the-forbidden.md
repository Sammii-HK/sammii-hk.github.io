---
title: "Through the forbidden"
slug: "through-the-forbidden"
description: "Send an electron at a rectangular barrier higher than its energy, then change the barrier and watch how much of its wave still arrives on the far side."
date: '2026-12-25T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - quantum-physics
  - design-engineering
interactiveLab: "tunnelling"
---

# Through the forbidden

An electron with 1.5 electronvolts of energy meets a barrier 2 electronvolts high. Its energy is below the top of the barrier, and yet the **Transmission** readout says 11.1%.

Widen the barrier from 0.45 to 0.90 nanometres and that figure drops to 0.441%. Widen it to the slider's limit of 1.20 nanometres and it falls to 0.050%. Small, and shrinking fast, but not zero.

*Through the forbidden* is an interactive rectangular barrier for a single electron. You set the electron's energy and the barrier's height and width; the page solves for the stationary wave on both sides and reports how much gets through.

## Start below the barrier

<InteractiveExploration slug="quantum-tunnelling" />

[Open the full quantum tunnelling exploration](https://labs.sammii.dev/explorations/quantum-tunnelling/).

*Interactive: choose **Below the barrier**, then drag **Barrier width** slowly to the right while watching **Transmission**. Switch on **Probability density** to see the same wave as a density.*

The upper half of the canvas is the energy profile. The lavender outline is the barrier, labelled with its height `V₀`. The dashed copper line is the electron's energy `E`, and it runs straight across the whole picture. That is deliberate: the electron has one energy, and it is the same on both sides of the barrier and inside it.

The lower half is the wave. By default it shows the real part of the wavefunction, `Re ψ`, scaled so the incoming wave has an amplitude of 1. **Probability density** switches to `|ψ|²`, measured relative to the incident density. Each view has its own labelled vertical scale, separate from the energy scale above it.

There are three readouts: **Transmission**, **Reflection** and **Energy regime**, which reads **Below barrier**, **At the barrier** or **Above barrier**. A line underneath restates the current values with the reminder `T + R = 1`.

## Three regions, one wave

Hover or tap the wave to inspect it. The probe tells you the position in nanometres, the density relative to the incident wave, and which region you are in.

On the left, the incoming wave and the reflected wave overlap, which is why the left-hand pattern can look uneven. Inside the barrier, when the energy is below the barrier height, the probe calls the region **evanescent**: the wave does not oscillate there, it decays. On the right, only the transmitted wave remains, with a smaller amplitude than the one that arrived.

The wavefunction and its slope are matched at both edges of the barrier. That is what turns three separate pieces into one continuous solution, and it fixes how much is reflected and how much carries on. The exploration's notes describe this matching, and [Richard Fitzpatrick's notes on the square potential barrier](https://farside.ph.utexas.edu/teaching/qmech/Quantum/node48.html) derive it.

For an energy below the barrier, the transmission probability is:

**T = 1 / [1 + V₀² sinh²(κa) / (4E(V₀ − E))]**

where `a` is the barrier width and `κ` sets how quickly the wave decays inside it. Because `sinh` grows exponentially with `κa`, widening the barrier suppresses transmission very quickly. That is the steep drop from 11.1% to 0.050% you saw a moment ago.

## Above the barrier is not a free pass

Now drag **Electron energy** above the barrier height. Set the energy to 2.50 electronvolts against the default 2-electronvolt barrier and transmission is 55.6%. Nearly half the wave is still reflected.

The control's own help text explains why: above-barrier reflection is possible because wave amplitudes interfere. Inside the barrier the wave now oscillates, and reflections from the two edges can reinforce or cancel each other.

Choose **A resonance** to see the cancellation complete. This preset sets the energy so that exactly half a wavelength fits inside the 0.45-nanometre barrier, at about 3.86 electronvolts. Reflections from the two edges cancel, and **Transmission** reads 100.0%.

**At the threshold** sets the energy equal to the barrier height, at 2 electronvolts. The general formulas have a zero divided by zero at this point, so the implementation uses the limiting form and treats the threshold continuously. With the default width, transmission there is 27.3%.

## Phase is not motion

**Animate phase** makes the wave appear to ripple, and **Wave phase** lets you scrub it from 0 to 360 degrees. Both change a global phase of the stationary solution. The real part changes as you move it; the probability density and transmission do not. The playback is slowed so you can see the change.

This is the part of the picture that is easiest to over-read. The animation is not an electron travelling through the barrier. A stationary state describes a single energy for all time. It does not contain a localised particle arriving, and so it cannot tell you how long tunnelling takes.

## What the model leaves out

The exploration is a nonrelativistic, one-dimensional, single-energy stationary state, with zero potential on both sides of a perfectly rectangular barrier. It does not calculate a wave packet's journey or a tunnelling time.

The notes also rule out one explanation on purpose: tunnelling does not require borrowing energy. In this model energy is conserved throughout, and the dashed energy line stays flat across all three regions. Nothing is borrowed.

The physical constants come from NIST's CODATA 2022 values: the electron mass and the exact SI values of the Planck constant and the electronvolt. Energies are in electronvolts and widths in nanometres throughout. For very thick barriers, the code switches to a logarithmic form so the numbers do not overflow, and any transmission below a thousandth of a percent is shown as **less than 0.001%** rather than rounded to a misleading zero.

Return to **Below the barrier** and nudge the width up a single step at a time. The electron's energy is still below the top of the barrier. The wave on the right is still there.

## Sources

- Richard Fitzpatrick, University of Texas at Austin, *Quantum Mechanics*, [*Square potential barrier*](https://farside.ph.utexas.edu/teaching/qmech/Quantum/node48.html), for the transmission formulas and boundary matching.
- NIST, [*Fundamental physical constants*](https://physics.nist.gov/cuu/Constants/) (CODATA 2022), for the electron mass, Planck constant and electronvolt conversion.
