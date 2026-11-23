---
title: "Two clocks near a black hole"
slug: "two-clocks-near-a-black-hole"
description: "Hold a clock still just outside a black hole, compare it with a distant one, and see exactly what a single time-rate relation can and cannot tell us."
date: '2027-01-04T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - physics
  - design-engineering
interactiveLab: "black-hole"
---

# Two clocks near a black hole

Two clock faces start at zero. One hand sweeps a full minute. The other, in the same stretch, reaches a little past half of one.

Neither clock is broken. Someone standing beside either of them would see it tick normally. The difference only appears when you compare them, and that comparison is the whole subject of *Near a black hole*: one clock held still close to a non-rotating black hole, one far away as a reference, and a slider for the distance between the near clock and the centre.

## Start with the default

<InteractiveExploration slug="black-hole-time-dilation" />

[Open the full black-hole time-dilation exploration](https://labs.sammii.dev/explorations/black-hole-time-dilation/).

*Interactive: leave **Radius from centre** where it starts, watch the **Distant clock** and the **Hovering clock** for a while, then drag the slider towards **Near the horizon**.*

The view opens at `1.50 × horizon radius`. The readout under the hovering clock says **57.7% of the distant rate**, and the line beneath both clocks turns that into a sentence: **1 hour far away = 34.6 minutes here**. The clocks show minutes and seconds, and the footer says **10× playback**: the display runs at ten model seconds per real second, so the gap becomes visible without a long wait.

Drag towards **Further away** and the two clocks almost agree. Drag towards **Near the horizon** and the hovering clock falls further behind. The slider stops at `1.05` horizon radii. It never reaches the horizon itself.

There is one other control, **Pause**, which becomes **Play** once pressed. If your system asks for reduced motion, the clocks start paused.

## One relation

Everything on screen comes from a single expression, the time rate of a stationary clock in Schwarzschild geometry, taken from [Andrew Hamilton's notes at JILA](https://jila.colorado.edu/~ajsh/courses/bh/schwp.html):

**dτ / dt = √(1 − rₛ / r) = √(1 − 1/u)**

Here `τ` is the time kept by the hovering clock, `t` is the time kept by a reference clock at infinity, `rₛ` is the horizon radius and `u = r / rₛ` is the radius you choose with the slider. The code computes the rate as `Math.sqrt(1 - 1 / radius)` and multiplies the distant elapsed time by it to get the near one.

A few values from the model make the shape of that curve easier to feel:

- At `u = 20`, the rate is about `0.974679`. An hour far away is 58.5 minutes here.
- At `u = 2`, it is about `0.707107`. An hour far away is 42.4 minutes.
- At `u = 1.05`, the slider's lower limit, it is about `0.218218`. An hour far away is 13.1 minutes.

The change is gentle across most of the range and steep near the bottom. Between 20 and 2 horizon radii the rate drops by about a quarter. Between 2 and 1.05 it falls by more than two thirds of what is left. The square root goes to zero as `u` approaches 1, and the slider stops short of that, at `1.05`.

## Why moving the slider restarts both clocks

Changing the radius sets both elapsed times back to zero. That can feel like a reset you did not ask for, but it is deliberate. If the near clock kept its accumulated time and simply switched to a new rate, the display would imply that the clock had travelled instantly from one radius to another. The model has no such trip in it. Each position on the slider is a separate, idealised condition, so each gets a fresh comparison.

That also means the clocks are not on a journey. There is no approach, no orbit and no fall. The near clock is held stationary at its radius for as long as you watch.

## What "held stationary" hides

Holding a clock still just outside a black hole is not free. The model notes say so plainly: keeping the clock in place requires acceleration. The relation above describes the rate of a clock that is somehow kept there. It does not ask what would hold it or how hard that would be. Acceleration limits are outside the model.

It also omits rotation and charge: this is the simplest non-rotating, uncharged case. Freefall and orbits are different calculations that this model does not make, so its numbers do not describe an astronaut falling in or circling.

The comparison concerns how two clocks relate in this geometry. It is not a claim that time "feels slow" to anyone. Each local clock reads normally to its own observer, and the catalogue entry and the in-page notes both repeat that point because it is the one most easily lost.

## What the picture shows

The drawing is a schematic. A dark circle labelled **Event horizon** sits on one side, the **Hovering clock** sits on a line to its right, and the clock slides outwards as you raise the radius.

That slide is not to scale. The radial spacing is compressed: the code places the clock according to the logarithm of its radius, so moving from 1.05 to 2 covers a useful amount of screen and moving from 10 to 20 does not run off the edge. The rings and soft glow around the horizon are decoration. They are not a ray-traced view and they do not encode light, heat or matter.

If you want the light-path side of the same geometry, [Where light can go](https://labs.sammii.dev/explorations/black-hole-light-paths/) traces rays around a black hole of the same kind, also measured in horizon radii. The default radius here, `1.5`, is the radius of the photon sphere described there. This clock model says nothing about light at that radius. It is simply the same number in a different question.

## Limits, in one place

- The near clock is stationary. This is not an orbit, freefall or travel calculation.
- The black hole does not rotate and has no charge.
- The acceleration needed to hold the clock still, and its practical limits, are not modelled.
- The radius range is `1.05` to `20` horizon radii, and the far clock stands for one at infinity in the idealised spacetime.
- The picture compresses radial spacing and is not a view of what you would see.
- Playback is ten model seconds per real second, which is a viewing choice, not physics.

## Keep the sentence, not the spectacle

The most useful element on the page is the plainest one: **1 hour far away = … minutes here**. It turns a square root into something you can check against a clock you can see. Pick a radius, read the sentence, then watch the two hands until the difference stops being abstract. Then move the slider and let both clocks start again.

## Sources

- Andrew Hamilton, JILA, University of Colorado Boulder, [*Schwarzschild geometry*](https://jila.colorado.edu/~ajsh/courses/bh/schwp.html), for the stationary-clock time-rate relation used by the model.
