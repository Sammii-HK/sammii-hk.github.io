---
title: "One photograph, fifteen ways to draw with data"
description: "How my creative coding studies turn one image into particles, edges, sorted columns and growing regions, with the small algorithms that give each experiment its character."
date: '2026-11-20'
draft: true
tags: [creative-coding, javascript, canvas, p5js, visual-design]
lab_url: "https://creative-coding.sammii.dev"
---

A photograph is already a composition. It contains colours, edges, patches of brightness and relationships between neighbouring points. Treating it as data gives those decisions somewhere else to go.

My [Creative Coding studies](https://creative-coding.sammii.dev) use one photograph across fifteen browser experiments. The image becomes a field of particles, a set of glowing edges, columns sorted by colour, a surface broken into regions and several other systems. Each sketch asks a different question of the same source.

That constraint is useful. If both the input and the technique change, it is difficult to see which one produced the effect. Keeping the photograph fixed makes the algorithm's contribution much easier to notice. The source material provides a shared visual identity while the rules create very different kinds of movement.

## The image is a lookup table

The sketches load the same image, call `loadPixels()` and sample its RGBA array. They generally work on a 900 by 540 canvas with pixel density set to one. Those are implementation choices for these studies, not requirements of p5.js.

The simplest useful operation is to map a position back to a source pixel. Here is a reduced helper for normalised coordinates, assuming an image buffer with one RGBA quartet per pixel:

```javascript
function samplePixel(pixels, width, height, u, v) {
  const x = Math.max(0, Math.min(width - 1, Math.floor(u * width)));
  const y = Math.max(0, Math.min(height - 1, Math.floor(v * height)));
  const offset = 4 * (y * width + x);

  return {
    r: pixels[offset],
    g: pixels[offset + 1],
    b: pixels[offset + 2],
    a: pixels[offset + 3],
  };
}
```

The [p5.js pixel documentation](https://p5js.org/reference/p5/pixels/) describes this array layout and the effect of display pixel density. The real sketches add another transform to fit the photograph into the canvas. A point on the canvas first has to be translated and scaled into the fitted image's coordinates.

That transform is part of the artwork. Sampling outside the fitted image and clamping to its edge repeats edge colours. Skipping those positions creates empty margins. Cropping fills the frame but discards part of the original composition. None of those choices is invisible merely because it lives in a coordinate function.

## A particle can remember where it belongs

[Particle Burst](https://creative-coding.sammii.dev/experiment-06.html) samples positions across the photograph and gives each particle a home position and a colour. Clicking adds an impulse; a spring keeps pulling the particles back.

The configured target is 5,000 particles, but very dark samples are skipped, so it would be inaccurate to promise that every image creates exactly 5,000 visible particles. Brightness also affects each particle's starting size.

The essential motion rule is short. This is the source's update sequence with names expanded and constants inlined for clarity:

```javascript
particle.vx += (particle.homeX - particle.x) * 0.035;
particle.vy += (particle.homeY - particle.y) * 0.035;

particle.vx *= 0.88;
particle.vy *= 0.88;

particle.x += particle.vx;
particle.y += particle.vy;
```

The displacement creates a restoring force. Velocity stores the effect of previous frames. Damping removes energy so the particles eventually settle instead of oscillating forever. The photograph survives as a collection of destinations, even while the visible positions are scattered.

This is why the return is more interesting than simply fading the original image back in. You can see local pieces finding their places. The structure reappears through the motion of its parts.

The constants are tuned per frame. A version intended to behave consistently across refresh rates would need an explicit time step or a suitable time-based integrator. The sketch's visual result should not be mistaken for a physically calibrated spring simulation.

## An edge is a change, not a colour

[Edge Glow](https://creative-coding.sammii.dev/experiment-04.html) starts by reducing image samples to a brightness-like value. It then applies Sobel kernels to neighbouring cells, measuring horizontal and vertical change. Combining the two components gives an edge strength.

The kernel calculation can be shown independently of p5.js:

```javascript
function sobelStrength(grid, x, y) {
  const horizontal = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const vertical = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
  let gx = 0;
  let gy = 0;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const value = grid[y + row - 1][x + col - 1];
      gx += value * horizontal[row][col];
      gy += value * vertical[row][col];
    }
  }
  return Math.hypot(gx, gy);
}
```

This illustrative helper assumes an interior cell with all eight neighbours available. The actual sketch clamps neighbour coordinates at the grid boundary.

The source uses a weighted sum of the encoded RGB channels for its brightness approximation. That works as an artistic contrast signal; it is not the linear-light luminance calculation used for WCAG contrast. The purpose is to find visible changes that can become structure.

Once the strengths have been computed, an animated scan activates cells above a threshold. The edge calculation happens during setup; the moving glow does not need to rediscover the entire photograph on every frame. That separation between finding structure and revealing it is useful far beyond an art sketch.

## Sorting preserves colour while destroying location

[Pixel Sort](https://creative-coding.sammii.dev/experiment-09.html) reorganises each vertical column. Depending on the current mode, it sorts by a brightness approximation, red, blue or saturation. Transparent pixels receive special handling, and the result is written to a separate graphics buffer.

The interesting constraint is that a pixel can move within its column, but not into a neighbouring one. Colour distribution survives locally while vertical relationships are disrupted. The result has recognisable traces of the photograph without preserving the scene in the ordinary way.

The reveal is a separate state machine. It moves through revealing the sorted image, holding it, uncovering the original and holding again. The expensive sorting step happens when a new mode is prepared. The animation primarily changes how much of the precomputed buffer is visible.

That is a practical pattern for browser graphics: compute the transformation once, then animate the comparison. It makes the technique readable to the viewer and avoids recomputing an unchanged result just because the reveal line moved.

## A flow field borrows the image's colour

[Flow Field](https://creative-coding.sammii.dev/experiment-10.html) uses a different relationship. Its particles follow angles derived from noise and a mouse-controlled bias. The photograph supplies their colour as they travel, rather than prescribing their destination.

The [p5.js noise function](https://p5js.org/reference/p5/noise/) gives similar outputs for nearby inputs, which helps neighbouring particles move in related directions. Time advances through another dimension of the field. The motion can change continuously without choosing a completely unrelated direction every frame.

The sketch resamples the photograph as particles move and eases their existing colours towards the new sample. That small delay matters. An instant colour change would pin colour to location; gradual change lets a particle carry some of where it has been.

Particles also have staggered lifetimes. When one becomes too old or leaves the canvas, it is reset. That prevents the scene from gradually emptying and avoids replacing every particle at once. The picture is maintained by many small renewals.

## Growth is another way to reveal structure

[Crystal Growth](https://creative-coding.sammii.dev/experiment-12.html) begins with 32 seed attempts on a grid. Neighbouring cells enter a frontier and acquire an owner when reached. The sketch draws boundaries between cells owned by different seeds.

Although the catalogue describes a flood fill, the implementation selects randomly from a bounded front portion of the frontier. It is not strict first-in, first-out breadth-first search. That variation gives the growth an uneven outline while retaining the idea of expanding regions.

The visual identity comes from two inputs: ownership determines boundaries, while the underlying photograph supplies colour. A small algorithm becomes an image-making tool because those responsibilities are separated clearly.

## The rest of the collection asks related questions

The fifteen sketches form a set of variations rather than fifteen unrelated filters:

| Studies | What changes |
| --- | --- |
| Pixel Scanner, Codified Image, Pixel Rain | How samples are revealed through a scan, a code-like grid or falling columns |
| Edge Glow, Pixel Sort | Which local structures become prominent, or how pixels are reordered |
| Particle Burst, Particle Field, Flow Field | Whether sampled colours return home, respond to forces or travel through a field |
| Voronoi Drift, Crystal Growth | How the image is partitioned into regions |
| Waveform, Kaleidoscope, Chromatic Glitch | How position, symmetry and colour channels are transformed |
| Bokeh Field, Bubble Glass | How light-like discs and a moving lens reinterpret the image |

The [collection index](https://creative-coding.sammii.dev) links to each experiment, and the [repository](https://github.com/Sammii-HK/creative-coding) keeps them as separate HTML sketches. That structure makes an individual rule easier to inspect and change.

## Make an experiment understandable as well as visible

These are visual studies, not a claim of a complete accessible graphics toolkit. A useful next pass would give every sketch a pause control, keyboard equivalents for pointer actions and a static comparison. p5's [`describe()` API](https://p5js.org/reference/p5/describe/) can attach a screen-reader-accessible description of the canvas, alongside ordinary explanatory text.

Performance claims should also be attached to a measured device and scene. Precomputing edge strength, reusing sorted buffers and limiting the simulation grid all reduce particular kinds of work. They do not prove a universal frame rate.

To explore the collection, compare Particle Burst with Flow Field first. One uses the image as a place to return to; the other uses it as something to sample while passing through. That single change in relationship produces a remarkably different sense of the photograph. It is the reason I like working this way: a small rule can make familiar material behave like something new.

## Read this as a series

This article is part of **Light, image and sound**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Start with [the physical installation](https://sammii.dev/blog/beyond-the-visible-uv-acetate-and-the-installation-i-painted/), then compare [Beyond Light](https://beyond-light-vr.vercel.app), [Refract](https://refract.sammii.dev) and [Spectra](https://spectra.sammii.dev). These are connected questions about rendering and perception, with different mechanisms.
