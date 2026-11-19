---
title: "A faster screen halves your deadline"
description: >-
  The 16.7ms frame budget: input, JavaScript, style, layout, paint and composite laid end to end against a 60 Hz frame and a 120 Hz one, with a live meter that measures your own screen. A keystroke that fits at 60 drops a frame at 120.
date: '2026-12-07T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - performance
  - rendering
series: "The browser and the machine"
chart: "frame-budget"
draft: false
---

A ball slides across a track. It is smooth. You nudge a slider and add a few milliseconds of work to every frame, and it is still smooth. You add a few more, and suddenly it is not: it lurches, pauses, catches up.

Nothing broke at that moment. The work just stopped fitting.

The chart is at [labs.sammii.dev/charts/frame-budget](https://labs.sammii.dev/charts/frame-budget/). It is about the deadline every frame has to meet, and the thing it makes plain: buying a faster screen does not give your code more time. It gives it less.

## The arithmetic

A 60 Hz screen asks for a new picture every 16.7 ms. A 120 Hz screen asks every 8.3. That is all the budget is: 1000 divided by the refresh rate.

Inside that window the browser has to take the input, run your JavaScript, restyle, lay out, paint and composite. When the sum runs over, the screen shows the old frame again. That repeated frame is jank.

And the window is not all yours. web.dev's RAIL guidance says the browser needs about 6 ms of each frame to render, so keep your own work to 10.

## Feel it first

The top of the page is the meter. The control is **Work added per frame**, a slider from 0 to 40 ms, with preset buttons for 0, 6, 12, 20 and 34 ms and a **Pause** button.

The ball is moved from JavaScript, one `requestAnimationFrame` at a time, and the slider adds a synchronous busy loop of that many milliseconds to every frame. Each bar below it is the measured time between two frames, newest on the right, with lines at 8.3 ms and 16.7 ms.

The readout works out your display for you. It takes the median frame gap while no work is being added, and reports it as a refresh rate and a frame interval. Then it says how many frames a second you are actually getting, and how many of the last 60 frames were late, where late means a gap more than one and a half refresh intervals long.

I am not going to tell you what it will say, because it is measuring your screen. What the page predicts is this: add work and watch the bars leave the line. Past your frame interval, every frame takes two, then three. On a 120 Hz screen frames start arriving late at about 8 ms of work, half what a 60 Hz screen tolerates.

## One frame, to scale

The middle of the page takes one frame apart. Five buttons pick a frame:

- **A transform animation**: 1 ms, all of it composite. The main thread does nothing.
- **Animating top from JavaScript**: 8.5 ms. Every frame restyles, lays out and repaints.
- **A keystroke in a framework input**: 11 ms. It opens on this one.
- **Layout thrashing**: 36 ms, of which 28 is layout.
- **A 50 ms task on click**: 58 ms.

Each frame is drawn twice, once against the 60 Hz window and once against the 120 Hz one, as a stacked bar of the six stages over a shaded box for the time a frame has, with ticks where the screen refreshes. The 60 Hz row has a dashed line at RAIL's 10 ms. Each row says whether it fits and by how much, or how many refreshes it takes and how many frames are dropped.

Pick the keystroke. At 60 Hz it fits, with 5.7 ms to spare. At 120 Hz it misses by 2.7 ms, is ready after two refreshes, and drops a frame. Same code, same laptop, same keystroke. A faster screen does not make the page faster; it halves the deadline, and code that was smooth starts dropping every other frame.

Animating `top` is the near miss: 8.2 ms to spare at 60 Hz, and over the line by 0.2 at 120.

Layout thrashing is the frame with a named source. web.dev's worked example spends more than 28 ms in layout per frame, on a page of 1,618 elements. That is a whole 60 Hz frame and more than three 120 Hz frames before a single pixel is painted. In total the frame drops two frames at 60 Hz and four at 120.

The 50 ms task is where the browser starts calling a task long. It drops three frames at 60 Hz and six at 120, and while it runs the page cannot paint, scroll on the main thread or answer the next tap.

Pick a stage, from the bar or from the key below it, and the panel says what that stage does and which thread it runs on. Composite is the only one listed for the compositor thread and the GPU, which is why the transform frame is 1 ms and the `top` frame is not.

## Where jank comes from

The bottom of the page is a short list of six causes, each with its source and, where there is one, the chart that goes deeper: long tasks, slow handlers on input, animating layout properties, forced layout in a loop, expensive paint, and too much JavaScript to start. Interaction to Next Paint calls 200 ms or less good, but for typing the goal is a single frame.

This chart sits between two others in the series. [What a CSS property costs](https://labs.sammii.dev/charts/repaint/) says which stages a change triggers. [How a keypress becomes a pixel](https://labs.sammii.dev/charts/keypress/) is where the keystroke frame's figures come from. This one is about how much of them fits before the deadline.

## What it does not do

The meter is measured; the frames are not. The stage costs in the five frames are illustrative figures for a mid-range laptop, chosen to match the typical page work in the keypress chart, except where a source is named: the 28 ms of layout is web.dev's worked example, and 50 ms is the long-task threshold.

The frames are also drawn end to end, which is a simplification. The browser does some of the composite and raster work on other threads, in parallel with the next frame's main-thread work, so the stages do not always queue as drawn. The main thread's share still has to fit.

And the meter can be fooled. Browsers may throttle a background tab or a low-power device, and the loop pauses when it scrolls out of view, so if the numbers look strange, scroll it back into view and keep the tab in front.

The chart is at [labs.sammii.dev/charts/frame-budget](https://labs.sammii.dev/charts/frame-budget/). `?focus=typing`, `?focus=thrash` and `?focus=transform` open the frame anatomy on one of the frames.

## Sources

- Paul Lewis, Rendering performance, web.dev
- web.dev, Measure performance with the RAIL model
- Jeremy Wagner, Paul Lewis and Barry Pollard, Avoid large, complex layouts and layout thrashing, web.dev
- Paul Lewis, Simplify paint complexity and reduce paint areas, web.dev
- web.dev, Optimize long tasks
- web.dev, Interaction to Next Paint
- Mariko Kosaka, Inside look at modern web browser, part 3, Chrome for Developers
- RenderingNG architecture, Chrome for Developers
