---
title: "What a byte of JavaScript costs"
description: >-
  The same bytes as a JPEG and as a bundle arrive in the same time, and only one of them stops the page. A chart that builds a bundle in your browser, times its parse, compile and first run, and lays it next to the image.
date: '2026-12-11T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - javascript
  - performance
series: "The browser and the machine"
chart: "js-cost"
draft: false
---

Two bars, one above the other. The top one is a JavaScript bundle. The bottom one is a JPEG with exactly the same number of bytes on the wire. Their download segments are identical, to the millisecond, because the chart makes them identical. Press measure and the top bar keeps going.

[labs.sammii.dev/charts/js-cost](https://labs.sammii.dev/charts/js-cost/) generates a bundle of the size you choose, gzips it, parses it, compiles it and runs it in your browser, times the parse, compile and first run, and lays the result next to its download on the network you pick and next to the same bytes as an image.

## The one true thing

The byte is not the cost. The thread is.

An image and a script of the same size arrive in the same time. The image is decoded off the main thread and painted. The JavaScript has to be parsed, compiled and run, on the same thread that also handles your tap, before anything it renders can appear. That is the difference between the two bars, and the chart is built so that it is the only difference.

## How the chart shows it

There is a **Bundle size (before gzip)** slider, from 50 KB to 3,000 KB in steps of 50, starting at 500 KB. Beside it are two rows of buttons:

- Network: **Fast Wi-Fi**, **4G**, **Slow 3G**
- Device: **This machine**, **Mid-range phone (×4)**, **Low-end phone (×8)**

And one button: **Measure on this machine**.

Before you press it, the JavaScript bar shows only the download, worked out from an assumed 3.5× gzip ratio. Press it and the page builds a fresh bundle, measures it, and fills in the parse and compile segment and the execute segment. The note under the bars says what was measured on your machine, in milliseconds, and what it was scaled by. A small table then breaks the total into Download, Parse + compile and Execute, each in milliseconds and per KB.

The chart opens with **Mid-range phone (×4)** selected, so the first numbers you see are your machine's times multiplied by four. Switch to **This machine** to see them unscaled.

I am deliberately not going to tell you what it measures. That depends on your machine, your browser and what else is running, and the point is that the numbers are yours.

## What gzip does and does not do

Gzip helps the download and does nothing for parse and compile. Those scale with the source you shipped, not the bytes on the wire. In the words of one of the chart's facts, 1 MB of JavaScript is still 1 MB to the parser after it arrives as 280 KB.

The chart measures the gzipped size with `CompressionStream("gzip")` and shows the size it got. The notes say real production bundles compress 3 to 4×. Change the size and measure again, and the download segment follows the gzipped bytes while the parse segment follows the source.

## The networks

The download is computed, not measured: one round trip plus the gzipped bytes at the chosen bandwidth. The three networks are:

- Fast Wi-Fi: 20 ms round trip, 100 Mbps
- 4G: 170 ms round trip, 9 Mbps
- Slow 3G: 400 ms round trip, 0.4 Mbps

It is the same model as the URL chart. For the default 500 KB at the assumed 3.5× ratio, that download is about 31 ms on Fast Wi-Fi, about 300 ms on 4G and about 3.3 seconds on Slow 3G. Whether the main-thread work is the bigger part of the bar depends on what your machine measures, so that comparison is yours to make.

## How it is measured

The bundle is generated in the page: thousands of small functions, each with varied identifiers and literals, so it gzips roughly like real code. Every press builds a new source text with a different seed. That matters: an identical string would hit the engine's compilation cache and report a parse time of nearly zero.

Parse and compile is timed with `performance.now()` around `new Function(source)`. That parses the whole text and compiles the top level, while the inner functions are pre-parsed and compiled lazily, as V8 does for a script. The bundle is then called once, and that first execution compiles each function as it is called and runs it. That is why the execute stage is not small, even though each function does very little.

The JPEG lane gets the identical transfer size, so its download is the same, and a decode estimated at 0.04 ms per KB. The notes call that generous to JavaScript.

## What it does not do

It does not measure a phone. The device buttons multiply your own machine's times by 4 or 8. The notes describe those as the usual working numbers for JavaScript on a mid-range and a low-end Android against a laptop, and they say plainly that the real gap for your users is in your analytics, not in this chart.

The bundle is synthetic, and that cuts in JavaScript's favour. It only defines and calls small functions. A real bundle of the same size bootstraps a framework and hydrates a tree, so its execute stage would be larger than the one measured here.

The download is a simple model: one round trip and a steady bandwidth, nothing else. The JPEG decode is an estimate, not a measurement, and it is scaled by the same device factor as the JavaScript. And one press is one sample: press **Measure again** a few times and expect the numbers to move.

Press measure at [labs.sammii.dev/charts/js-cost](https://labs.sammii.dev/charts/js-cost/) and see what your own machine says.

## Sources

- Osmani, The Cost of JavaScript (2018, updated)
- V8 blog, Blazingly fast parsing
- Chrome DevTools performance documentation
