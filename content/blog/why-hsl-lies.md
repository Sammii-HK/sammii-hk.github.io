---
title: "Fifty percent of what? Why HSL lies about lightness"
description: >-
  Twenty-four hues at the same nominal lightness in HSL, CIELCH and OKLCH, with the measured luminance under every swatch. At fifty percent, HSL's yellow and blue are twelve times apart; one passes AAA on white and the other barely registers.
date: '2027-01-20T09:00:00+00:00'
tags:
  - charts
  - colour and perception
  - colour
  - accessibility
  - css
series: "Colour and perception"
chart: "why-hsl-lies"
draft: false
---

Ask HSL for twenty-four hues at fifty percent lightness and you get a yellow you can barely look at next to a blue that is nearly navy. Both of them say `50%`. Put white text on them and one is unreadable while the other passes AAA.

The chart is at [labs.sammii.dev/charts/why-hsl-lies](https://labs.sammii.dev/charts/why-hsl-lies/). It is three rows of twenty-four swatches, one row each for HSL, CIELCH and OKLCH, all asked for the "same" lightness, with the luminance of every swatch measured and drawn as a bar underneath. HSL's bars are a skyline. OKLCH's are a flat line.

The launch post gave it a paragraph. This is the numbers, how the rows are made fair, and where the comparison stops working.

## The number on the page

Open the chart at fifty percent and click the yellow chip (hue 60) in the HSL row. The inspector table above the rows fills in: `hsl(60 90% 50%)`, relative luminance 0.826, 1.2:1 against white, 17.5:1 against black.

Now arrow right along the row to hue 240, the blue. Same `50%`. Relative luminance 0.068. Against white, 8.9:1. Against black, 2.4:1.

That is the whole problem in two rows of a table. HSL says these two colours have the same lightness. WCAG contrast, which is computed from luminance, says one of them is a fine text colour on white and the other fails on white completely. If you built a palette by holding HSL's L still and turning the hue dial, your yellow and your blue would need entirely different text colours, and the number you held still would give you no warning.

Each row also carries a readout under its name: the brightest swatch as a multiple of the darkest. At fifty percent, HSL's reads **12.2×**. OKLCH's reads **1.1×**.

## Why HSL does this

HSL's lightness is not a measurement. It is the mean of the largest and smallest RGB channels: `L = (max + min) / 2`. It is arithmetic on the channels, and it knows nothing about the eye.

A saturated yellow has two channels high, red and green. A saturated blue has one. Both can have the same max and the same min, so they get the same L. But luminance does not treat the channels equally: the WCAG formula weights linear red, green and blue by 0.2126, 0.7152 and 0.0722. Green carries most of the light. Blue carries almost none. HSL averages the channels as if they were equal; luminance knows they are not.

CIELAB and Oklab both take a cube root of a luminance-like quantity, which is why their lightness tracks what you see and their rows sit flat. Oklab goes through cone responses first and uses a fitted matrix, and its hues stay put where CIELAB's drift as chroma changes.

## Making the rows fair

The hard part of building this was not the conversions. It was making sure the three rows were asking for the same thing.

HSL at fifty percent, CIELCH at fifty percent and OKLCH at 0.5 are not the same request, because the three spaces scale lightness differently. So the chart does not use the same number in each row. It takes the HSL grey at the chosen lightness (zero saturation, so there is no hue to argue about), measures its luminance, and works out what lightness that grey would have in the other two spaces. For an achromatic colour, Oklab's L is the cube root of the luminance; CIELAB's L* is 116 times the cube root, minus 16. At fifty percent, that gives `oklch(0.60 0.10 hue)` and `lch(53% 38 hue)`.

So the three rows share a grey. Each one then turns the hue dial around that grey: HSL at 90% saturation, CIELCH at chroma 38, OKLCH at chroma 0.10. If lightness meant the same thing in all three, the three rows would have the same bars. They do not, and the difference is the chart.

## The controls

The **Nominal lightness** slider runs from 20% to 80%. Everything recomputes as you drag: the rows, the bars, the spread readouts, the table.

Hover, tap or arrow through any chip to inspect that hue in all three models. The table shows the model, the value as you would write it in CSS, the hex it is shown as, its relative luminance, and its WCAG contrast on white and on black. Left and right walk the hue circle; up and down move between models; Home and End jump to the ends. The inspected hue starts on yellow, the brightest HSL swatch, so the table has something true to say before you touch anything.

The slider is worth moving. At 80%, HSL's spread drops to about 2.4×, because near white there is less room for the channels to disagree. At 20%, it is back up at about 11×. OKLCH stays between about 1.1× and 1.4× across the whole range, and the top of that range is at 20%, where clipping sets in (more on that below).

## How it is built

There is no colour library. The conversions are written out in the site's own colour file: sRGB companding, Oklab with Ottosson's matrices, CIELAB with the D65 white point, HSL from the max and min, and WCAG relative luminance. They are the same functions the other colour charts use, so every number is checkable against the formula beside it.

Each bar is the luminance of what is actually on screen. If a colour falls outside sRGB, each channel is clipped into sRGB's range, the result is measured after clipping, and the chip is hatched. That way the bar always matches the chip you are looking at, rather than a colour your screen is not showing you.

## What it does not show

The clipping is the honest limit. CIELCH at chroma 38 leaves sRGB for several hues even at fifty percent: five of its twenty-four chips are hatched there. At 20% lightness, more than half the CIELCH and OKLCH chips are hatched, and their spread readouts climb because what you see is no longer what was asked for. The chart clips rather than gamut-maps on purpose, so the flat line gets less flat at the extremes, and I would rather show that than hide it.

It compares one saturation per space, chosen by me. A different HSL saturation or a different OKLCH chroma would give different bars. The lesson does not change, but the exact multiples do.

It measures luminance, not perceived lightness. Luminance is what WCAG contrast is built on, which is why it is the useful number for a design system, but it is not the same thing as how light a colour looks, and the chart does not claim it is.

And it is only lightness. HSL's hue and saturation have their own problems; this chart does not try to show them.

The chart is at [labs.sammii.dev/charts/why-hsl-lies](https://labs.sammii.dev/charts/why-hsl-lies/), and [`?focus=50`](https://labs.sammii.dev/charts/why-hsl-lies/?focus=50) opens it at fifty percent.

## Sources

- WCAG 2 relative luminance (0.2126 R + 0.7152 G + 0.0722 B on linear sRGB)
- Oklab (Ottosson 2020)
- CIELAB with the D65 white point
