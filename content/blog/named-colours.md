---
title: "darkgray is lighter than gray"
description: >-
  All 148 named CSS colours placed by what they look like, on an OKLCH hue and chroma wheel resolved by your own browser. The oddities in the set are not mistakes; they are two lineages that met in one standard.
date: '2027-01-11T09:00:00+00:00'
tags:
  - charts
  - colour and perception
  - css
  - colour
series: "Colour and perception"
chart: "named-colours"
draft: false
---

Write `color: darkgray` and you get a lighter grey than `color: gray`. Not a slightly different grey. A visibly lighter one, about three quarters of the way up the lightness scale where gray sits at six tenths.

I have known this for years and it still annoys me every time. So I put every named colour on a wheel to see what else the set was hiding. It is at [labs.sammii.dev/charts/named-colours](https://labs.sammii.dev/charts/named-colours/).

## Two lineages, one name

The explanation for darkgray is history, not maths.

CSS has 148 colour names. They are the named colours of CSS Color Module Level 4, section 6.1, which are the SVG 1.1 names, which are the X11 `rgb.txt` names from the 1980s with a handful of corrections. X11's names were chosen by people naming paint chips, not by anyone with a colour model.

Separately, HTML had its own sixteen colours, the VGA set. HTML's gray was `#808080`.

When CSS took the X11 names, it kept HTML's values for four of them: gray, green, maroon and purple. So gray stayed `#808080`. But darkgray came across from X11 untouched, at `#a9a9a9`. X11's own gray was `#bebebe`, and in that system darkgray really was darker than gray. CSS kept one half of each pair and the order flipped.

Green has the same story the other way round. Pure `#00ff00` is called **lime**, not green. HTML's green was `#008000`, and it kept the name. X11's brighter green had to become lime, and green ended up half as bright as you would guess.

The side panel says this before you hover anything: OKLCH lightness 0.73 for darkgray, 0.60 for gray, both read from your browser.

## The shape of the set

Put the names where they actually sit, by OKLCH hue round the wheel and chroma outward, and the set shows a shape nobody designed.

There is a dense band of mid-lightness reds and blues. There is a thin green quarter. There is a cluster of pale near-whites in the middle, most of them named after fabrics and foods: linen, oldlace, cornsilk, lemonchiffon, papayawhip. And the true greys collapse into the centre, because a grey has no chroma and so has nowhere else to go.

Seven of the names exist twice, once spelt gray and once spelt grey: darkgray, darkslategray, dimgray, gray, lightgray, lightslategray and slategray. CSS accepts both because SVG 1.1 did. The panel notes it when you hover a grey spelling.

And then there is **rebeccapurple**, `#663399`, added in 2014 in memory of Rebecca Meyer, Eric Meyer's daughter, who died at six. It is the only named colour with a story written into the standard, and it is the one I would least want to lose.

## Using the chart

Each name is a dot. The angle is its OKLCH hue, the distance from the centre is its chroma, and the dot's size is its lightness, so the pale names are the big ones. Hover, focus or click a dot and the rest dim, and the side panel shows its hex, its `rgb()`, its `oklch()` value and its WCAG relative luminance, with a line about what is notable: whether it is a true neutral, whether it is one of the off-whites with only a whisper of chroma, or which other names it is nearly indistinguishable from.

That last one is my favourite readout. In the crowded parts of the wheel it names up to four other colours sitting almost on top of the one you picked, which is a polite way of saying the set has more names than it has distinct colours.

Below the wheel is the full list, with **Sort by** buttons for hue, lightness, chroma and name. Sorting by lightness is the quickest way to see darkgray sitting above gray. Sorting by hue pushes the near-neutrals to the end, because a hue angle on a colour with almost no chroma is noise. Next to the buttons, a readout counts the true neutrals, the names with no measurable chroma at all, and lists them.

`?focus=` with any name, like [`?focus=darkgray`](https://labs.sammii.dev/charts/named-colours/?focus=darkgray) or [`?focus=rebeccapurple`](https://labs.sammii.dev/charts/named-colours/?focus=rebeccapurple), opens the chart with that colour picked.

## Nothing is typed in

Nothing on the wheel comes from a hex value I typed. The data file is just the 148 names; the only hex codes in the chart are in its explanatory notes.

When the page loads, it makes a canvas, sets each name as the `fillStyle`, and reads the colour back. Whatever your browser says the name means is what gets plotted. Then each colour is converted to Oklab and OKLCH with the matrices from Ottosson (2020), and to WCAG relative luminance, with the same hand-written colour maths as the other charts in the series.

I like this more than I expected. It means the oddities are not my claims about the spec. They are what your engine actually does when it reads the word darkgray.

## What it does not show

The chroma axis is relative. Each dot's distance from the centre is its chroma as a fraction of the most chromatic name in the set, so the outer ring is "as vivid as the most vivid named colour", not a fixed OKLCH value. That keeps the wheel readable, but it means you cannot measure an absolute chroma off it.

Lightness is only the dot size and the sorted list. On the wheel itself, a light and a dark colour at the same hue and chroma sit in the same place, and the dot size is the only clue.

"Nearly indistinguishable" is my threshold, not a standard. Two names are flagged when they are within 0.03 of each other in lightness and chroma and 12 degrees in hue. It is a useful hint, not a measurement of what any particular person can tell apart.

Every named colour is an sRGB colour. None of them reaches into Display P3, so the wheel is the sRGB slice of OKLCH and nothing outside it.

And it says nothing about how often the names are used. That is a different chart, and a different dataset.

The chart is at [labs.sammii.dev/charts/named-colours](https://labs.sammii.dev/charts/named-colours/).

## Sources

- CSS Color Module Level 4, section 6.1 (named colours)
- SVG 1.1 names
- X11 `rgb.txt`
- Oklab and OKLCH matrices from Ottosson (2020)
- WCAG relative luminance
