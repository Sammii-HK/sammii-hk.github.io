---
title: "The shape of a note"
slug: "the-shape-of-a-note"
description: "Blend two equal-frequency vibrations of a square membrane and find the still lines inside the pattern, which stay put while everything around them moves."
date: '2026-12-18T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - acoustics
  - design-engineering
interactiveLab: "sound-patterns"
---

# The shape of a note

Press **Vibrate** and a square of colour starts to breathe. Copper patches swell while lavender patches sink, then they swap. The whole surface passes through flat twice in every cycle. Through all of it, a set of thin bright lines stays exactly where it was.

Those lines are nodes: places on the membrane that do not move at all while this particular vibration is running. *The shape of a note* is about finding them, and about a quieter surprise. Drag **Blend angle** and the pattern of lines changes completely, while the **Frequency** readout does not change by a single hertz.

## Find the still lines

<InteractiveExploration slug="vibrating-membranes" />

[Open the full vibrating membranes exploration](https://labs.sammii.dev/explorations/vibrating-membranes/).

*Interactive: choose **Lattice**, then drag **Blend angle** slowly from 0° towards −45° and watch the bright lines. Keep an eye on **Frequency** while you do it.*

The square is an ideal membrane, 40 centimetres on each side, with its edges held fixed. Colour shows the displacement at a moment in time: copper for one direction, lavender for the other. The bright contours are the nodes, and the canvas labels them simply: **Bright = still**.

**Vibrate** plays the motion, and **Pause vibration** stops it. **Vibration phase** lets you step through a cycle by hand, and **Reset phase** returns to the start. The playback is slowed to 0.35 cycles per second, far below the frequency the readout gives, so the movement is something you can actually follow.

Hover or tap the square to inspect a point. The probe gives its position in centimetres, the mode amplitude there and the current displacement. Close to a nodal line it adds **near a node**.

## Two shapes, one pitch

Each pattern is built from a simple shape. For whole numbers `m` and `n`, a fixed-edge square membrane can vibrate as:

**Φₘₙ(x, y) = sin(mπx/L) sin(nπy/L)**

with a frequency of:

**f = c √(m² + n²) / (2L)**

where `L` is the side length and `c` is the wave speed. Here, `L` is 0.4 metres and `c` is 80 metres per second. Both are illustrative values, not measurements of any instrument.

Look at the frequency formula and swap `m` and `n`. Nothing changes. On a square, the mode `(m, n)` and the mode `(n, m)` always share a frequency, even though one is the other turned on its side. [Daniel Russell's rectangular-membrane notes](https://www.acs.psu.edu/drussell/Demos/rect-membrane/rect-mem.html) describe this degeneracy for the square case.

That is what **Degenerate mode pair** offers: nine pairs, from `(1,2) and (2,1)` up to `(6,7) and (7,6)`. The **Mode pair** readout shows the current one, written as `(3,5) + (5,3)` for the default.

Because both shapes have the same frequency, any mixture of them is also a valid way for the membrane to vibrate. **Blend angle** chooses the mixture:

**Φ = cos θ · Φₘₙ + sin θ · Φₙₘ**

At 0°, only the first shape is present. For **Lattice**, that is the single `(3,5)` mode, and its nodes form a grid of straight lines. As the angle moves, the second shape is mixed in, and the straight grid gives way to curved lines. Negative angles reverse the relative phase of the two, so −45° and 45° draw different patterns. Throughout, **Frequency** stays at 583.1 hertz.

## Presets worth comparing

- **Four petals** blends `(1,3)` and `(3,1)` at −45°, at 316.2 hertz.
- **Lattice** is `(3,5)` alone, at 0°.
- **Woven** blends `(3,5)` and `(5,3)` at −45°, the starting state.
- **Intricate** blends `(5,7)` and `(7,5)` at 45°, at 860.2 hertz.

Switching between **Lattice** and **Woven** is the clearest demonstration in the piece. Same pair, same pitch, very different still lines.

## A zero is not a node

There is a subtle trap in drawing nodes, and the implementation avoids it on purpose.

Twice a cycle, the whole membrane passes through zero displacement at once. If the code marked every point where the displacement happened to be zero, the entire square would light up as a node at those moments. Instead, the contours are calculated from the mode shape itself, before it is multiplied by the oscillation. Scrub **Vibration phase** to 90° and the colour drains out of the square, but the bright lines remain. They were never about the instant; they are a property of the shape.

The contour tracing uses a marching-squares method at a finite display resolution. Where nodal lines cross, small pixel-level ambiguities can remain.

## Listening is optional

**Listen** plays a quiet pure sine tone at the displayed frequency, and only when you choose it. It follows the frequency as you change the mode pair, and **Mute** stops it. If the browser blocks audio, the visual pattern and the readouts carry on as before.

The tone is synthetic. It is a single sine wave, not a recording of a membrane, and it does not reproduce the timbre of a real membrane or instrument.

## What this model is not

This is an ideal tensioned membrane with fixed edges. It is not a metal Chladni plate, and it does not simulate grains of sand: the notes say plainly that this is a membrane model, not a flexural metal-plate simulation.

The displacement is exaggerated and the colours are arbitrary. The visible vibration is slowed. The frequency is computed for the stated, illustrative parameters, which are not measurements of any instrument.

End on **Woven** with **Vibrate** running. Then pause on a moment where the square looks almost blank. The pattern is still there in the bright lines, waiting for the next half of the cycle.

## Sources

- Daniel A. Russell, Pennsylvania State University Graduate Program in Acoustics, [*Vibrational Modeshapes of a Rectangular Membrane*](https://www.acs.psu.edu/drussell/Demos/rect-membrane/rect-mem.html), for the fixed-edge mode shapes, their frequencies and square-membrane degeneracy.
