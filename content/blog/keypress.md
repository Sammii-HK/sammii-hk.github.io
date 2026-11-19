---
title: "Most of a keypress is the screen"
description: >-
  Twelve hops between a finger and the glass, each drawn to its share of the time. With typical settings a keypress takes 44 ms to become a pixel, the display is 21 of that, and the code you write is two of the twelve hops.
date: '2026-12-15T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - performance
  - hardware
series: "The browser and the machine"
chart: "keypress"
draft: false
---

Type a letter. It appears. It feels like the same instant.

It is not. With the settings the chart opens on, 44 ms pass between your finger pressing the key and the letter appearing on the glass. In that time the press crosses twelve hops through hardware and software, and most of them have nothing to do with the code on the page.

The chart is at [labs.sammii.dev/charts/keypress](https://labs.sammii.dev/charts/keypress/). It lays out those twelve hops left to right, each one as wide as its share of the total.

## The twelve hops

They fall into five groups.

**Keyboard.** Switch travel and debounce: the key moves about 2 mm to its actuation point, then the controller waits for the contact to stop bouncing. The matrix scan: the controller loops over its rows and columns and notices the press on the next pass. USB polling: the computer asks the keyboard for a report at a fixed rate, and the press waits for the next poll.

**Operating system.** The HID stack turns the report into a key event and queues it for the focused window. Then the event crosses from the window server into the application.

**Browser.** Event dispatch: the browser process forwards the event to the renderer for that tab, and the main thread has to be free to receive it. Then the JavaScript handlers: keydown, keypress, input, your listeners, the framework reconciling.

**Rendering.** Style and layout for whatever changed. Then paint and composite: dirty layers rasterised, stacked into a frame, handed to the GPU.

**Display.** Waiting for the next frame. Scan-out, as the panel refreshes top to bottom. And pixel response, as the liquid crystal turns.

## The surprising part

Two of those twelve are the code you write: the handlers, and the style and layout they cause. With typical page work that is 8 ms of the 44.

The display is three of the twelve, and it is 21 ms.

On a 60 Hz screen a finished frame waits, on average, half a refresh for its turn, about 8.3 ms, and then the panel takes about another half a refresh to scan it out, so a pixel in the middle of the screen updates half a frame after the top. Together that is about 17 ms, more than every stage of the browser put together. The chart's note on that hop says it is the biggest single cost on most machines. Refresh rate is the biggest latency knob most people never touch.

## The four knobs

Above the flow there are four rows of buttons:

- **Keyboard polling**: 125, 250, 500 or 1000 Hz.
- **Display refresh**: 60, 120, 144 or 240 Hz.
- **Page work**: light, typical or heavy.
- **Panel**: OLED, good IPS or old LCD.

The line under them gives the total and the display's share. Hover or tap a hop and the panel names it, gives its typical range, and explains what is happening in it. A numbered list underneath gives every hop to a tenth of a millisecond.

Some things to try. Leave everything else alone and move polling from 125 Hz to 1000 Hz: the USB hop drops from 4 ms to half a millisecond, and the total from 44 to 40. 125 Hz is the common default, an 8 ms interval, so the press waits 4 ms on average before the computer even knows about it.

Put the refresh up to 120 Hz and the total drops to 35 ms; at 240 Hz, 31. Both display hops halve and halve again.

Then put the page work up to heavy, back at 60 Hz. The handlers go from 6 ms to 14, style and layout from 2 to 5, paint from 2 to 4, and the total climbs to 57 ms. That is the setting where your code really is the biggest bar. The note says what heavy means: a big list, a spreadsheet cell, an editor. Light is a native input. Typical is a framework re-render.

The whole range, every knob at its best (1000 Hz, 240 Hz, light, OLED), is 19 ms. Every knob at its worst (125 Hz, 60 Hz, heavy, old LCD) is 65.

## Where jank starts

The hop that matters most for interfaces is a small one: event dispatch, a millisecond. Its note says that if the main thread is busy running JavaScript, the event waits, and this is where jank starts.

The chart draws that hop at its typical size. It cannot show the case where a long task is already running when you press the key, because then the wait is however long that task has left. That is the [event loop chart](https://labs.sammii.dev/charts/event-loop/)'s territory, and [The 16.7ms frame budget](https://labs.sammii.dev/charts/frame-budget/) takes the rendering hops and asks how much of them fits before the next refresh.

## How it is built

Each hop in the data file is a name, a stage, a typical range and a function of the four knobs. Five return a constant. USB polling is half of 1000 divided by the polling rate. Both display waits are half of 1000 divided by the refresh rate. The page-work hops look up light, typical or heavy. The flow is flexbox: every stage and every hop gets a `flex-grow` proportional to its milliseconds, so the widths are the data.

## What it is not

These are typical figures for a modern laptop, not measurements of any one machine. The panel gives each hop a typical range as well as the single number the chart uses: debounce is 1 to 10 ms, the handlers 1 to 20, pixel response 0.1 to 15.

It is also lower than what has been measured end to end on modern machines. Dan Luu's Computer latency 1977 to 2017 measured 30 ms on an Apple IIe and 60 to 170 ms on modern machines, keyboard to screen. The chart's 44 ms is a sum of typical stage costs, and the chart does not try to account for the gap. Read it as the shape of where the time goes, not a promise about your laptop.

And it stops at the glass. How long the person at the keyboard takes to notice the letter is in [How long "now" takes](https://labs.sammii.dev/charts/now/), which puts this pipeline on one axis with the brain's own timings.

The chart is at [labs.sammii.dev/charts/keypress](https://labs.sammii.dev/charts/keypress/). `?focus=vsync`, `?focus=handler` and `?focus=usb` open it on one hop.

## Sources

- Dan Luu, Computer latency 1977 to 2017
- Chromium, Life of a Pixel
- Chromium, RenderingNG
- The USB HID specification
- Microsoft, Keyboard latency
- RTINGS input lag methodology
