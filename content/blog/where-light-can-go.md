---
title: "Where light can go"
slug: "where-light-can-go"
description: "Aim a ray past a black hole, find the boundary between escape and capture, and see what a numerical path can actually tell us."
draft: true
status: "unpublished"
tags:
  - creative-coding
  - physics
  - design-engineering
interactiveLab: "black-hole-light"
---

# Where light can go

A line of light approaches a dark circle. At one setting it bends around the centre and leaves. Move its aim a little closer and it takes a much longer route. Move it closer again and the line ends at the circle's edge.

That transition is the subject of *Where light can go*, an interactive map of light paths around an isolated, non-rotating, uncharged black hole. There is one main variable to play with: where the incoming ray is aimed. The interesting part is how much can change while that number barely moves.

## Start with the long way round

<InteractiveExploration slug="black-hole-light-paths" />

[Open the full black-hole light-path exploration](https://labs.sammii.dev/explorations/black-hole-light-paths/).

*Interactive: choose **A long way round**, then **Trace light**. Use **Trace progress** to stop anywhere along the path. The animation reveals a computed curve; its progress is not a measure of travel time.*

The selected ray is copper. The fainter lines provide a few other approaches for comparison; **Show beam** switches them off when they get in the way. Three readouts describe the selected path: its outcome, its closest approach and, for an escaping ray, its deflection.

Try **Wide escape**, **A long way round** and **Captured** in that order. Each preset changes the aim, calculates a new path and pauses. The same centre produces a gentle turn, a substantial loop and a horizon crossing. Scrubbing lets you inspect the bend without having to catch a moving point at the right moment.

The main slider is labelled **Aim · impact parameter**. That second phrase matters. The impact parameter is the miss distance the ray would have if it continued in a straight line with no black hole present. Its actual closest approach is a different number, shown separately. [MIT's photon-orbit notes](https://ocw.mit.edu/courses/8-033-relativity-fall-2006/5dae4a0c2d69b367951ddea5e17a2cea_schwarzschild.pdf) give this definition and the relation between the two.

## Two circles, two different ideas

The solid circle marks the event horizon. Light arriving from outside can cross that boundary, but a future-directed light signal from inside cannot escape to a distant observer. The plotted path ends at the horizon because this view covers the exterior. [NASA's anatomy of a black hole](https://science.nasa.gov/universe/black-holes/anatomy/) explains the horizon and the surrounding structures that can emit the light astronomers observe.

The dashed circle is the photon sphere. In this Schwarzschild model, its radius is one and a half times the horizon radius. A circular light orbit is possible there, but it is unstable. The incoming critical ray approaches it asymptotically. [Perlick and Tsupko's analytical review](https://arxiv.org/abs/2105.07101) distinguishes this sphere from the critical impact parameter and the shadow seen by an observer.

Everything here is measured in Schwarzschild radii, written `rₛ`. The horizon is at `1 rₛ`. The capture threshold for incoming light is:

**b₍critical₎ = (3√3 / 2) rₛ ≈ 2.598076 rₛ**

This is an aiming distance, so it should not be confused with the photon sphere's radius of `1.5 rₛ`. The review derives the relationship between them.

Choose **The threshold** to supply that critical value directly. This preset is useful precisely because dragging a slider to a rounded number is not the same operation. The readout says **Critical approach**, and the visible curve is a finite section of that approach. A browser drawing cannot demonstrate an orbit lasting forever.

## What the drawing measures

This is a map in the ray's orbital plane, with a radius and an angle locating each point. It has equal horizontal and vertical display scales. The radial coordinate is the areal radius: a sphere at radius `r` has area `4πr²`. Distances measured across this flat drawing are not automatically proper distances in curved space. That coordinate choice follows the Schwarzschild geometry described in the [MIT notes](https://ocw.mit.edu/courses/8-033-relativity-fall-2006/5dae4a0c2d69b367951ddea5e17a2cea_schwarzschild.pdf).

The code plots the route itself. It does not collect rays at a camera, calculate an accretion disc's emission or render a telescope image. Its glow marks the selected line; it does not encode temperature, brightness or energy. Rotation, redshift and wave optics are outside this implementation.

Those boundaries let the display keep a clear job. You can ask where a ray goes and compare the answer with a nearby ray. You cannot read the copper curve as a photograph of what an astronaut would see.

## From an equation to a line

The solver works with inverse radius, `u = rₛ/r`, and advances around the orbital angle `φ`. Its equation is:

**d²u / dφ² = −u + (3/2)u²**

This is the Schwarzschild light-path equation in the units used here, obtained from the photon-orbit equations in the [MIT notes](https://ocw.mit.edu/courses/8-033-relativity-fall-2006/5dae4a0c2d69b367951ddea5e17a2cea_schwarzschild.pdf). The implementation advances it using fourth-order Runge–Kutta with an angular step of `0.0025` radians.

There are some unglamorous decisions behind the smooth curve. The numerical path starts at a finite distance, so the code accounts for the incoming segment from infinity. If the ray escapes, it also includes the omitted outer tail when calculating deflection. Otherwise the readout would depend on where the calculation happened to stop.

When a numerical step crosses the horizon, the endpoint is interpolated back to `rₛ`. The renderer never continues a captured path through the centre and out the other side. The integration also has a finite angular budget. If an ordinary path exceeds it, the result is labelled **Trace limit** instead of silently being assigned an outcome.

## Checking the part that looks convincing

A curve can be beautiful and wrong. The model tests therefore check properties that the styling cannot help it pass.

They put incoming rays on both sides of the analytic capture threshold. They check that a captured path terminates at the horizon. They compare a path computed at two step sizes and monitor the conserved quantity in the orbit equation. Mirrored input aims must produce mirrored curves. A ray passing very far away must approach the weak-deflection result.

These checks support the numerical model within the cases exercised. They do not make the display a complete simulation of an astrophysical black hole. The distinction stays visible in the controls: **Trace progress** is a drawing control, **Closest approach** is a model result, and the glow is a visual choice.

The preset worth returning to is **A long way round**. Let the copper line make its turn, then move the aim by a small amount and watch the route change. The equation, the number and the shape are all available at once. That is the part an interactive drawing can give you: enough control to make the next question your own.

## Sources

- Max Tegmark, MIT 8.033, [*Schwarzschild metric & black holes*](https://ocw.mit.edu/courses/8-033-relativity-fall-2006/5dae4a0c2d69b367951ddea5e17a2cea_schwarzschild.pdf), especially the coordinate definition and photon-orbit sections.
- Volker Perlick and Oleg Yu. Tsupko, [*Calculating black hole shadows: review of analytical studies*](https://arxiv.org/abs/2105.07101), *Physics Reports* 947 (2022), for photon spheres, critical impact parameters and the distinction between a path and an observed shadow.
- NASA Science, [*Anatomy of a Black Hole*](https://science.nasa.gov/universe/black-holes/anatomy/), for the event horizon and luminous surroundings.
