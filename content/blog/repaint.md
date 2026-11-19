---
title: "Fifty-five CSS properties, and the two safe to animate"
description: >-
  What a CSS property costs, as a map: 55 common properties sorted by whether changing them forces layout, paint or only a composite. Thirty-three force a layout. Six live in the cheap column, and two of those do the real work.
date: '2026-12-21T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - css
  - performance
  - animation
series: "The browser and the machine"
chart: "repaint"
draft: false
---

Two animations slide the same card in from the left. They look identical in the design file. On a quiet page they look identical in the browser too. Then the page gets busy, and one of them keeps gliding while the other starts to hitch.

The difference is a single property. One animates `top`. The other animates `transform: translate()`. Same motion, completely different cost.

The chart is at [labs.sammii.dev/charts/repaint](https://labs.sammii.dev/charts/repaint/). It is a map of what changing a CSS property makes the browser redo, for 55 common properties.

## The shape is the point

When the browser has to update the screen, it works through a pipeline: style, then layout, then paint, then composite. Change a property and you send it back to one of those stages, and it has to redo everything after it.

The chart sorts all 55 properties into three columns by how far back they send it:

- **Layout**: 33 properties. Geometry changes, so positions and sizes are worked out again, then everything is repainted and composited.
- **Paint**: 16 properties. Pixels change but the geometry does not, so the affected layers are rasterised again, then composited.
- **Composite only**: 6 properties. Nothing is laid out or repainted; the compositor moves or blends the layers it already has, on the GPU.

That is the whole chart in one glance. Most of the language lives in the expensive column. Width, height, padding, margin, every font property, every flex and grid property, `display`, `position`, `top`, `left`, `aspect-ratio`. Change any of those and the browser recomputes the geometry of at least part of the tree.

## Six cheap, but really two

The composite column holds `transform`, `opacity`, `filter`, `will-change`, `backdrop-filter` and `clip-path`. Click each one and the notes are honest about how conditional four of them are.

`filter` is composited when the element has its own layer, and is a paint otherwise. `clip-path` composites for simple shapes on a promoted layer and paints otherwise. `will-change` is not an effect at all, it is a hint to promote the element ahead of an animation, and the note warns that overuse costs memory. `backdrop-filter` is a GPU blur of what is behind the layer: cheap to move, expensive in area.

Which leaves `transform` and `opacity`. Move, scale, rotate and skew, plus fade. Those two are the reason smooth animation on the web exists at all. Everything else costs a paint or a layout.

## How to use it

Along the top are the four stages, numbered: Style, Layout, Paint, Composite. Below them, a panel. Below that, a search field labelled "Find a property", and then the three columns of chips with their counts.

Hover or click a chip and the stages it forces light up in order. The panel names its column and its group (Motion, Text, Box, Position, Flex and grid and so on), explains what that column means, and for some properties adds a note. The chart opens on `top`, so the first thing you see is all four stages lit. Click `transform` and only Style and Composite stay on.

A few of the notes are the reason I keep the chart open:

- `top`: "Animating top or left lays out every frame. Use transform: translate() instead."
- `font-weight`: different glyph widths, so text re-flows. A variable font animates weight beautifully, but it still lays out every frame.
- `font-size`: every line re-wraps.
- `display`: changes the box type, so the subtree is rebuilt.
- `box-shadow`: a blurred shadow is a large paint. Animate the opacity of a pseudo-element that carries the shadow instead.
- `border-radius`: rounded corners are paint, but on a composited layer they can force an expensive mask.

The `box-shadow` note is the most useful trick on the page: put the big shadow on a pseudo-element and animate its opacity, which lives in the cheap column, instead of animating the shadow itself.

Some of the sorting is less obvious than it looks. `visibility` is a paint, not a layout. `cursor` and `accent-color` are paints. `color` is a paint, but `letter-spacing`, `text-align` and `white-space` are all layouts.

## How it is built

The data is a plain list in the repository: each property has a name, a cost, a group, and sometimes a note. The component maps each cost to the stages it triggers (layout to all four, paint to three, composite to Style and Composite) and draws the columns from the same list. The counts on the page, including the "Only 6" in the chart's lead, are computed from that list rather than typed in.

## What it does not tell you

The categories are for Blink, the engine in Chromium, and they describe the typical case. Engines differ at the edges, and they keep moving properties down the list over time. The data follows Chromium's rendering documentation and the csstriggers.com data, which is a 2019 snapshot. It is a map of which work is triggered, not a measurement of it.

It also does not say how long any of this takes. A column is not a price: the frame-budget chart says paint is often the longest stage, and that anything with a blur, or a big repainted area, costs more than a flat fill. The chart tells you which stages run; how much of them fits in a frame is a different question, and it is the one [The 16.7ms frame budget](https://labs.sammii.dev/charts/frame-budget/) answers.

And layout implies paint and composite, and paint implies composite. So when a property sits in the paint column, that is not the end of its cost; it is the start of it.

The chart is at [labs.sammii.dev/charts/repaint](https://labs.sammii.dev/charts/repaint/). To open it on one property, add `?focus=transform`, `?focus=top` or `?focus=font-weight`.

## Sources

- Chromium, Life of a Pixel
- Chromium, RenderingNG
- Paul Lewis, Rendering performance (web.dev)
- The csstriggers.com data, Google, 2019 snapshot
- Jake Archibald, In the loop
