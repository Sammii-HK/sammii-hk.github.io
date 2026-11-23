---
title: 'Liquidity: two ways to make type feel fluid'
description: 'Comparing an SVG wave with 2,500 Rapier particles, including the difference between a visual mask, a collision shape and an actual fluid model.'
draft: true
date: '2026-11-20'
tags: ["creative-coding", "typography", "animation", "canvas"]
lab_url: 'https://liquidity-ten.vercel.app'
---

I built the word **LIQUID** twice. In one version, a mathematical wave moves through the letters. In the other, thousands of little physical bodies are drawn through a text mask. The visual brief is similar, but the two implementations make very different promises.

[Liquidity](https://liquidity-ten.vercel.app) puts those approaches next to each other: an [SVG and GSAP experiment](https://liquidity-ten.vercel.app/gsap), and a [canvas and Rapier experiment](https://liquidity-ten.vercel.app/canvas). One lets you direct a surface. The other lets you disturb a population of objects and see what follows.

It is a useful comparison whenever an interface asks for something “organic”. That word describes an impression. It does not tell you whether the impression needs a wave function, a spring, a particle system or a fluid solver.

## First, decide what the liquid must do

In the SVG version, move your pointer across the lettering and then leave it alone. The surface responds to the pointer and returns to an idle animation. Its movement is generated from a sine function and animated between paths.

In the Rapier version, move through the text and click or touch the canvas. The particles receive impulses and interact with one another. They are also contained and pulled back towards the central region.

The difference is easiest to understand through a requirement. If a heading needs a gentle, controllable wave, the first approach gives you direct control over its amplitude, frequency and timing. If you want a poke to disturb many moving pieces, the second approach gives those pieces individual state.

More simulation does not automatically create a better heading. It creates more possible responses, which can be valuable when those responses are the point of the interaction.

## The SVG version is a moving shape inside a mask

The [GSAP page source](https://github.com/Sammii-HK/liquidity/blob/main/src/app/gsap/page.tsx) defines the lettering inside an SVG `clipPath`. A base-colour rectangle and a darker wave path both use that clip. The word stays legible because only the parts inside the letters are painted.

The wave is sampled from a sine function. Its horizontal position depends on the pointer; an idle timeline alternates between two generated paths. Every generated path uses the same sequence of commands, so GSAP can interpolate the corresponding numbers.

A minimal version of the path generator looks like this. It produces an SVG path string and can run independently of React or GSAP. The sampling is denser than the original experiment so the underlying construction is easier to inspect.

```js
function wavePath({ phase = 0, amplitude = 12 } = {}) {
  const width = 400;
  const height = 120;
  const baseline = 70;
  const wavelength = 300;
  const segments = 40;
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const x = width * i / segments;
    const y = baseline + amplitude * Math.sin(
      (2 * Math.PI * x) / wavelength + phase,
    );
    points.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
  }

  return `${points.join(' ')} L${width},${height} L0,${height} Z`;
}
```

Put the result in a path's `d` attribute and close the lower part of the shape, as this function does, to make a filled region. Change `phase` and the surface travels sideways. Change `amplitude` and the crests rise and fall. You can understand each decision without debugging a physics world.

The trade-off is that this wave has no independent physical memory. It does not know about pressure or droplets. Its behaviour comes from the mathematical shape and the animation rules you choose. For a decorative effect, that control can be exactly what you need.

There is also a practical limit to interpolation. Generating paths with a changing number or order of commands creates a different problem from changing the coordinates of one consistent path. Arbitrary letter-to-letter morphing needs more preparation than this wave example.

## A physics engine changes the unit of control

The [Rapier implementation](https://github.com/Sammii-HK/liquidity/blob/main/src/app/canvas/page.tsx) creates 2,500 dynamic rigid bodies, each with a small circular collider. It uses strong downward gravity, damping and low restitution. Pointer interactions apply impulses to nearby particles.

Rapier distinguishes the body, which carries motion, from the collider, which supplies the shape used for contacts. Its [rigid-body guide](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/) is a useful reference for that separation.

This is a particle-based visual experiment using rigid-body dynamics. It is not a simulation of incompressible fluid, viscosity and surface tension. A large number of colliding discs can suggest a material, but the presence of a physics engine does not establish which material equations are being solved.

That affects the creative controls. With the SVG wave, you directly choose the surface. With particles, you choose initial conditions, forces, damping, collisions and containment. The surface you perceive is an outcome of those choices and the rendering.

The current experiment also uses explicit containment rules, including pulling distant particles inward and repositioning particles outside a tight region. Those are art-direction choices. They keep activity near the word, rather than model an isolated physical system.

## A text mask is not a wall

This is the distinction I would put at the centre of the comparison. The canvas version paints the word to a small offscreen canvas, reads its pixels once, and caches the result. During rendering, it checks whether each particle's centre sits over an opaque text pixel. If it does, the particle is drawn.

The mask controls visibility. It does not give Rapier a collision boundary shaped like each letter. A particle can continue moving through a space that the renderer does not show.

Here is a simplified version of that drawing step. It expects a canvas context, an `ImageData` mask and particle positions in the same coordinate system. It illustrates the rendering idea without requiring Rapier.

```js
function drawMaskedParticles(ctx, mask, particles, radius = 1.2) {
  ctx.beginPath();

  for (const particle of particles) {
    const x = Math.floor(particle.x);
    const y = Math.floor(particle.y);

    if (x < 0 || y < 0 || x >= mask.width || y >= mask.height) {
      continue;
    }

    const alpha = mask.data[(y * mask.width + x) * 4 + 3];
    if (alpha <= 128) continue;

    ctx.moveTo(particle.x + radius, particle.y);
    ctx.arc(particle.x, particle.y, radius, 0, 2 * Math.PI);
  }

  ctx.fill();
}
```

Because this checks the centre, a circle near a letter's edge can still extend beyond it. Exact visual containment would need an additional clipping or compositing step. Physical containment would need geometry or forces that actually describe the letter boundaries. Those are separate enhancements with separate costs.

This separation is useful well beyond liquid lettering. A visual crop, an interaction hit area and a physics collider can all describe different regions. They only stay understandable if you choose those differences deliberately.

## Spend work where it changes the result

The canvas experiment makes two concrete choices worth carrying into other projects. It reads the static text mask once rather than calling `getImageData` for every particle on every frame. It also builds one drawing path and fills it once for the visible particles.

Caching is valid because the text mask is static in this version. Change the word, font or coordinate scale and the cache needs rebuilding. “Cache it” is only half the decision; the other half is knowing which changes invalidate it.

The physics still has a substantial workload. Batching drawing calls does not remove contact solving, body updates or pointer-force calculations. To investigate performance, measure the physics step separately from drawing, then vary the particle count. That tells you whether a different renderer would address the actual bottleneck.

The checked-in loop advances the world once per animation frame. A reusable simulation should make its time policy explicit: accumulate elapsed time, advance fixed steps within a sensible work limit, and decide how to handle a background tab resuming after a long gap. Otherwise the relationship between simulated time and display refresh can become accidental.

I would also avoid presenting a frame rate from one machine as a guarantee. A count of 2,500 particles describes the scene; it does not describe every reader's frame budget.

## The lifecycle is part of the effect

The source is an experiment, and turning it into a reusable component would require a lifecycle pass. The physics loop needs a retained animation-frame identifier, cancellation on unmount, event-listener removal and release of the Rapier world. Asynchronous initialisation needs to notice if the component has already gone away.

The GSAP side needs the same clarity about ownership. Idle timelines, pointer-created tweens and delayed callbacks should belong to the component that created them. GSAP's [`context`](https://gsap.com/docs/v3/GSAP/gsap.context()/) API provides a way to collect animations and revert them together; callbacks created later need to be included deliberately.

These details are easy to overlook because the effect can look correct on its first visit. Navigate away and back a few times, though, and unmanaged loops become a visible part of the interface. The right unit of completion is an effect that starts, responds and stops cleanly.

## Let the word survive the spectacle

If this effect carries a heading, the heading still needs readable text in the document. Canvas pixels are not a replacement for that content. A decorative canvas can sit beside or over a semantic heading, with duplicate visual content hidden appropriately from assistive technology.

A production treatment should also include a static reduced-motion version, a way to pause ongoing animation, and pointer behaviour that does not take over ordinary page scrolling. These are additions I would make when moving the experiment into a product; they are not claims about the current demo's completeness.

The decision between the two approaches comes back to the experience you need. A wave path is a compact way to direct a surface inside type. A population of bodies is a richer way to let a disturbance spread through moving pieces. Liquidity makes both available to inspect, including the parts where the convincing image depends on a useful cheat.

[Compare the two Liquidity experiments](https://liquidity-ten.vercel.app) · [Read the source](https://github.com/Sammii-HK/liquidity)

## Read this as a series

This article is part of **Motion: from a curve to something you can interrupt**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Try the live [easing and springs comparison](https://labs.sammii.dev/charts/springs/), then [Kinetic](https://kinetic.sammii.dev) and [Liquidity](https://liquidity-ten.vercel.app). They put different demands on motion: retargeting, physical constraints and a convincing visual surface.
