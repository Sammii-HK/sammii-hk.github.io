---
title: "Floating point, at the pixel"
description: >-
  The hairline between three tiles, the border that goes soft on a transform,
  and the basket that says 0.30000000000000004. One chart about where numbers
  that cannot be stored meet a grid that can only be whole.
date: '2026-12-04T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - css
  - javascript
series: "The browser and the machine"
chart: "floating-point"
draft: false
---

Three columns at 33.333% each, and a hairline of background shows between them. A card that slides in on a transform has a border that looks very slightly out of focus, as if your glasses need cleaning. A basket adds three items at £0.10 and shows £0.30000000000000004.

None of these is a bug in your code. They are what happens when numbers that cannot be represented meet a grid that can only be whole, and I wanted them on one page, measured rather than described: [labs.sammii.dev/charts/floating-point](https://labs.sammii.dev/charts/floating-point/).

## The seam

The first panel is a row of tiles. There are two sliders: Columns, from 2 to 7, and Container width, from 300 to 1200 pixels. It opens at three columns in a 1001px container, because that is the case that hurts.

Three columns at 33.333% of 1001px are 333.667px each. CSS pixels are real numbers, so the browser is happy to lay that out. The page notes give the precision: Chromium's layout runs in 1/64 px units, WebKit and Gecko in 1/60 px. But painting happens on the device-pixel grid, and you cannot light two thirds of a pixel. Every fractional edge has to be either snapped to the grid or blended across it.

Under the tiles, the chart reads every one of them back with `getBoundingClientRect`, adds the widths up, and tells you whether they come to the container width exactly, fall short (a seam) or run over (an overflow). It also lists where each edge lands and what your screen can actually paint, which is multiples of one over your device pixel ratio. I am not going to tell you what it says, because it depends on your browser and your screen. Drag the width a pixel at a time and watch the readout change.

## The fuzzy border

The second panel is the same 1px border three times: once with no transform, once moved with `translateX`, once moved with `margin-left`. A translateX slider runs from 0 to 1px in steps of 0.05, starting at 0.5.

At half a pixel, the transformed box looks soft and the margin box stays crisp. They have moved the same distance. The difference is when the move happens. Layout positions (widths, margins, left) are snapped to the pixel grid before painting. A transform is applied by the compositor after layout, at raster time, so it can sit between device pixels and gets anti-aliased across two of them.

That is the whole blurry-animation bug, and it is also why `will-change: transform` on text sometimes makes it go soft. The chart's advice is to look with your operating system's magnifier: on a 1× screen it is obvious at 0.5, on a 2× screen it is subtler because the grid is finer.

## The price

The third panel is a list of sums, evaluated by your browser as it renders the page: `0.1 + 0.2`, `0.1 + 0.7`, `3 × 0.1`, `(1.005).toFixed(2)`, `19.99 × 3`, the same sum done in cents, `100 / 3 × 3`, and `2⁵³ + 1`. Any result with a long tail of digits is flagged, and so are the `toFixed` and the `2⁵³ + 1` rows, which go wrong more quietly.

The reason is the same reason a third cannot be written down in decimal. A JavaScript number is an IEEE 754 double, with 53 bits of mantissa. That stores every integer up to 2⁵³ exactly, and almost no decimal fractions at all, because a tenth is a repeating fraction in binary.

My favourite is `1.005.toFixed(2)`, which gives `'1.00'`. It looks like a rounding bug. It is not: 1.005 cannot be stored, and the nearest double is 1.00499999999999989, so `toFixed` is honestly rounding it down. The browser is right and the number you typed was never there.

The rule that falls out of it is boring and absolute. Money goes in integer pence, or in a decimal type. Never in a float.

## The bits

The last panel is a box. Type any number and the chart writes it into a `DataView`, reads back the 64 bits, and lays them out as sign, exponent and mantissa: one bit, eleven bits, and 52 bits plus the implicit leading 1. Under that, the stored value to 20 significant figures, and either "Exact." or "Not the number you typed: the nearest double to it."

Type 0.1 and it is not 0.1. Type 0.5 and it is. That one panel explains the other three better than anything I could write.

## How it is built

One React component. The seam is real DOM measured with `getBoundingClientRect` after each change. The fuzzy border is three real boxes with real styles. The sums are plain JavaScript arithmetic, run in your browser. The bit view is a `DataView` over an eight-byte `ArrayBuffer`. Nothing on the page is a picture of the effect; each panel is the effect.

## What it does not do

It measures one browser on one screen: yours. The seam may not appear for you at 1001px, and the fuzzy border is much harder to see on a high-density display. That is the point of measuring, but it means the chart cannot promise you will see what I saw.

It does not explain which way a particular engine snaps an edge, or how it decides between snapping and blending. The notes give the layout unit sizes and the general rule; the details are engine internals the page does not reach into.

And the price panel is about why the numbers come out wrong, not about which decimal library to use. It tells you not to use a float for money and leaves the rest to you.

Drag the container width one pixel at a time, then type your own price into the bit box: [labs.sammii.dev/charts/floating-point](https://labs.sammii.dev/charts/floating-point/).

## Sources

- IEEE 754-2019.
- CSS Values and Units Level 4, section 6 (the px unit is a real number).
- Chromium LayoutUnit documentation.
- Goldberg, What Every Computer Scientist Should Know About Floating-Point Arithmetic (1991).
