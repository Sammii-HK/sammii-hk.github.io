---
title: "Charts: information design about the tools we use"
description: "A new series on labs.sammii.dev: interactive infographics about colour, typography, the browser and the machine, each one measured, sourced, and yours to download as a poster."
date: '2026-09-22'
tags:
  - charts
  - design engineering
  - information design
  - series
---

I have started a series of information-design pieces about the things a design engineer works with every day: colour spaces, typefaces, the rendering pipeline, the event loop, latency, complexity. They live at [labs.sammii.dev/charts](https://labs.sammii.dev/charts/). Each one is interactive, each one is drawn from real data or real maths in the page itself, each one names its sources, and each one gives you the poster as an SVG.

## Why

Most of what I know about these subjects I learned from a diagram someone else drew. The CIE horseshoe. The event loop as boxes and arrows. The chart of Big O curves in every algorithms book. The best of those diagrams did something a paragraph cannot: they made the shape of the thing visible, so the facts had somewhere to live.

Most of them are also wrong in small ways, or static, or drawn with illustrative numbers rather than measured ones. The Big O chart uses a linear axis, which flattens every class below quadratic into one line at the bottom. The colour-space diagrams show a triangle and a horseshoe but never ask your screen which one it actually has. The rendering pipeline gets redrawn by hand in every performance talk.

So the rule for this series is: the data is real, the maths runs in the page, and if the page says a number, you can check it.

## What is there so far

**The family tree of colour spaces.** Twenty-five ways of writing a colour down as numbers, from Munsell in 1905 and CIE XYZ in 1931 to OKLCH and CSS Color 4, in six lanes by purpose, with derivation and influence drawn as lines. Hover a space and its lineage lights up; the ramps in the side panel are drawn with the real CSS colour functions, so the difference between an HSL ramp and an OKLCH ramp is something you see.

**Why HSL lies.** Twenty-four hues at one nominal lightness in HSL, CIELCH and OKLCH, with the WCAG luminance measured under every swatch. At fifty percent lightness HSL's brightest hue has twelve times the luminance of its darkest. OKLCH's row is flat.

**The gamuts.** Every colour a human can see, the CIE 1931 horseshoe, filled per pixel from the coordinates, with sRGB, Display P3, Adobe RGB and Rec. 2020 as triangles. The page asks your screen which gamut it has.

**The typography genome.** Twenty-eight families of Latin type from Gutenberg's Textura to variable fonts as a family tree, every node shown in a live specimen. The serif lane is one unbroken line from Jenson in 1470.

**Six centuries of communication and type.** A rebuild of an infographic I made as a student, inventions on one side of the spine and typefaces on the other, so the two histories read against each other.

**How a keypress becomes a pixel.** Twelve hops between your finger and the glass, each drawn to its share of the latency, with knobs for polling rate, refresh rate, page work and panel type. The code you write is two of the twelve.

**What a CSS property costs.** Fifty-five properties sorted by what changing them forces the browser to redo. Six live in the cheap column, and two of those are the reason smooth animation exists.

**The event loop, step by step.** Three real snippets stepped through a model of the loop, with the call stack, the queues and the console drawn as they change. Why 1, 4, 3, 2.

**Big O, to scale.** Eight complexity classes on a log axis for the n you choose, with the wall-clock time at a billion operations a second. Factorial at thirty-two is longer than the universe.

## How they are built

Every chart is a React component in the same site as this blog, rendering SVG or a canvas from a data file or from maths written out in full: the sRGB companding curve, the Oklab matrices, the CIELAB cube root, the chromaticity coordinates of the spectral locus. There is no charting library. The family trees share one component; the year scrub and the download button come free with it.

Each page also takes a `?focus=` parameter that opens it on one node or one setting, and a `?present=1` mode that hides everything but the chart. Those two exist so the series can be filmed: the short clips on X come from a script on my Mac mini that reads the site's own list of charts and facts, opens each one in a headless browser, and records it.

## What is next

More on colour (contrast, three ways), more typography (the anatomy of a letter, the London letter), more of the machine (how a URL becomes a page, what a byte of JavaScript costs, git as a graph, floating point), and a few from the research behind my MA (the symbolism of seven, the visible spectrum to scale). One or two a week. If there is a diagram you have always wanted drawn properly, tell me.
