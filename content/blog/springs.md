---
title: "Easing versus springs: what happens when you interrupt"
description: >-
  A CSS transition and a spring look the same on one clean move. Click again
  before they land and only one of them keeps its momentum. A chart that
  records both from the screen, every frame.
date: '2027-01-12T09:00:00+00:00'
tags:
  - charts
  - motion and interaction
  - animation
  - css
series: "Motion and interaction"
chart: "springs"
draft: false
---

Open a drawer, change your mind halfway, close it again. In most interfaces there is a tiny hitch at the moment you change your mind: the thing stops, then sets off again in the other direction as if it had never been moving. On an iPhone, mostly, there is not. The drawer turns round the way a real object would.

That hitch is the difference between a transition and a spring, and it is invisible until you interrupt one. So the chart is built around interrupting: [labs.sammii.dev/charts/springs](https://labs.sammii.dev/charts/springs/).

## Two cards, one button

There are two cards on two tracks. The top one moves with a CSS transition. The bottom one moves with a spring. One button, "Move right" (then "Move left"), sends both to the other end at the same moment.

Click it once and let them land, and you will struggle to say which you prefer. Click it, then click it again before they arrive. The spring carries its velocity into the new journey and curves round. The transition starts a fresh curve from wherever it was, at zero velocity, and you feel the hitch.

Under the cards is a graph of the last 2.4 seconds: the transition's position, the spring's position, and a third line for where each card was told to go. Both lines are recorded from the screen every frame, not drawn from a formula. The spring's position is the one the page just painted; the transition's is read back from the element's computed transform matrix. So when you interrupt, the graph shows the interruption exactly as you saw it: a sharp corner on one line and a smooth one on the other.

## The controls

On the spring side there are six presets, Gentle, Default, Snappy, Bouncy, Wobbly and Heavy, and three sliders: Stiffness (20 to 800), Damping (1 to 80) and Mass (0.5 to 5). Under them, a readout gives the damping ratio, whether the spring is underdamped, critically damped or overdamped, the time it takes to settle, and the overshoot if there is one.

On the transition side there are five easings, `ease`, `ease-out`, `ease-in-out`, standard (Material) and back (overshoot), each shown as its `cubic-bezier()`, and a Duration slider from 100 to 1500 ms. It starts at 400. The readout under it says the honest thing about a transition: always 400 ms, whatever happens.

## A duration versus a force

A transition is a duration and a curve. It will arrive in exactly the time you gave it, wherever it started and however fast it was already going. That is what makes it predictable, and it is also why it cannot cope with being interrupted: the new transition has no idea the old one was moving.

A spring is a force. The chart's spring is a damped harmonic oscillator, F = −k(x − target) − cv: stiffness pulls it toward the target, damping bleeds off speed, and mass resists both. It arrives when the physics says so.

One number describes its character: the damping ratio, **ζ = c / (2√(km))**. Under 1, it overshoots. Over 1, it creeps in without crossing. Exactly 1 is the fastest arrival with no bounce. The classic react-spring default, stiffness 170 and damping 26, the chart's Default preset, works out at ζ ≈ 1.0. Bouncy and Wobbly sit well under 1, which is why they wobble.

## A spring has no duration

This is the fact I like most. A spring does not have a duration. It has a settle time: the moment it is within 0.1% of the target and nearly still. And that changes with how far it has to go and how fast it was already moving.

The settle time in the readout is measured from rest, so it is the spring's best case. Interrupt it and the real settle time is whatever the new starting velocity makes it. That is exactly what makes a spring feel physical, and exactly what makes it awkward in a design spec that wants a number of milliseconds.

## How it is built

Each animation frame, the page advances the spring with semi-implicit Euler in 1 ms substeps, so stiff settings stay stable even on a slow frame, and writes the result to the card as a `translateX`. The CSS card is an ordinary element with an ordinary `transition` on `transform`; the page only reads it. Both positions go into a rolling 2.4 second history that the SVG graph redraws every frame.

The settle time and overshoot in the readout come from a separate simulation of the same spring from rest, run with the same 1 ms step until it is within 0.1% of the target and nearly still.

## What it does not do

The presets are in the spirit of Framer Motion and react-spring defaults, and the chart's spring is my own integrator, not theirs, so do not expect it to match either library frame for frame.

The recorded lines depend on your frame rate. On a busy machine, or a 60 Hz screen against a 120 Hz one, the samples are further apart and the corners are coarser. That is the cost of recording what really happened rather than drawing the formula.

The readout's labels come straight from ζ, so some presets do not read the way their names suggest. Heavy is a heavy mass (stiffness 200, damping 30, mass 3), and that works out at ζ ≈ 0.61: underdamped, with a small overshoot. Watch the ζ readout rather than trusting the name.

And it cannot give you a spring in CSS. The page notes say CSS has no spring timing function as of 2026, though `linear()` with many stops can bake one. For the real thing you still need JavaScript, or a platform that has springs built in. Apple's UIKit has used springs by default since iOS 7, which the notes say is a large part of why iOS feels the way it does.

Click the button twice, quickly: [labs.sammii.dev/charts/springs](https://labs.sammii.dev/charts/springs/).

## Sources

- react-spring documentation.
- Framer Motion documentation.
- Apple WWDC 2023, Animate with springs.
- CSS Easing Functions Level 2.
