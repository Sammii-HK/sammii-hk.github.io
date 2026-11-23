---
title: "The triangle your screen lives in"
description: >-
  The CIE 1931 horseshoe of every colour a person can see, with sRGB, Display P3, Adobe RGB and Rec. 2020 drawn as triangles and filled per pixel. Display P3 and Adobe RGB are nearly the same size and cover different colours.
date: '2027-01-01T09:00:00+00:00'
tags:
  - charts
  - colour and perception
  - colour
  - css
series: "Colour and perception"
chart: "gamuts"
draft: false
---

There is a bright green near the top of the horseshoe that an sRGB display cannot reproduce. The chart computes its coordinates anyway, then clips the result into sRGB. That gap, between a chromaticity on the diagram and the colour the fill can render, is what this chart is about.

It is at [labs.sammii.dev/charts/gamuts](https://labs.sammii.dev/charts/gamuts/). The horseshoe is the CIE 1931 chromaticity diagram: every chromaticity a standard observer can see. Each triangle is what a display standard can reproduce, with its three primaries as the corners. sRGB, the default of the web and of every image without a profile, covers about a third of the horseshoe.

The launch post covered that much. This post is about the numbers on the buttons, the two triangles that look alike and are not, and what a chromaticity diagram leaves out.

## Reading the horseshoe

The curved edge is the pure spectral colours, one wavelength at a time, labelled every twenty nanometres from 460 to 620. The straight edge along the bottom is the line of purples, which no single wavelength produces. The dot marked D65 is the white point, and all four gamuts on the chart share it, at (0.3127, 0.329).

Anything inside a triangle is a mix of that standard's three primaries. Anything outside it, the standard cannot reproduce. The bigger the triangle, the more of what you can see it can show.

## The numbers on the buttons

Each gamut has a button above the chart, and each button carries a percentage: the triangle's area in xy space relative to sRGB's.

- **sRGB**: 100%
- **Display P3**: 136%
- **Adobe RGB**: 135%
- **Rec. 2020**: 189%

The surprise for me was the middle two. Display P3 and Adobe RGB are within a percentage point of each other by area. Hover each one and the side panel lists its primaries, and that is where they part company.

Adobe RGB keeps sRGB's red and blue exactly, (0.64, 0.33) and (0.15, 0.06), and moves only the green, out to (0.21, 0.71). It was made to cover the cyans and greens of CMYK print, so all of its extra area is up and to the left, towards the greens.

Display P3 keeps sRGB's blue but moves both of the others. Its red goes out to (0.68, 0.32), redder than sRGB can reach. Its green goes to (0.265, 0.69), less far than Adobe's. So P3 spends its extra area in two places, the reds and the greens, and Adobe RGB spends all of it on green.

Two triangles, almost the same size, describing different colours. Adobe RGB's green corner sits outside P3, and P3's red corner sits outside Adobe RGB. Neither contains the other, so "wider gamut" on its own does not tell you which colours you get.

## Rec. 2020's corners

Rec. 2020 is the outlier. Its primaries sit on the spectral locus itself: pure single wavelengths at 630, 532 and 467 nanometres. You can check it on the chart. Its red corner, (0.708, 0.292), lands on the curve almost exactly where the 630 nm point of the locus is.

Rec. 2020 defines a colour gamut used in UHD television systems. The triangle is a reference gamut, not evidence that a particular HDR display reproduces every point inside it. Gamut and dynamic range are different properties; this two-dimensional chart only shows chromaticity.

Turn it on and off with its button and watch how much of the horseshoe it takes with it. It is the only one of the four that reaches into the deep greens at the top.

## The screen check

Next to the buttons is a line that says **This screen reports** and then a gamut. The page asks the browser with the CSS `color-gamut` media query, widest first: Rec. 2020, then P3, then sRGB. Most phones and laptops since about 2016 report Display P3. Whatever it says, it adds "or wider", because the query only tells you the screen covers at least that much.

## How the fill works

The colours inside the horseshoe are not an image. They are computed on a canvas, one pixel at a time, from the coordinates.

For each pixel, the chart works out its x and y, checks whether that point is inside the locus, then treats it as a colour at unit luminance: x and y become XYZ, XYZ becomes linear sRGB through the standard matrix, and the result is scaled so its brightest channel is one. That last step matters: this is a diagram of chromaticity, not brightness. Then negative channels are clipped to zero and the result is companded to sRGB.

Inside the sRGB triangle, the calculation produces an sRGB representation of that chromaticity at the chosen normalisation. Outside it, channels can go negative and are clipped. This is channel clipping, not a search for the perceptually nearest in-gamut colour. The fill illustrates where sRGB runs out; it does not reproduce colours outside that gamut.

The triangles are drawn on an SVG on top of the canvas, largest first, so the smaller ones sit on top and take the hover. Adobe RGB starts switched off; sRGB, Display P3 and Rec. 2020 start on. `?focus=` with a gamut id, like [`?focus=rec2020`](https://labs.sammii.dev/charts/gamuts/?focus=rec2020), opens the chart with that triangle highlighted.

## What it does not show

The areas are the usual rough measure, and they are rough. They are triangle areas in xy space, and a comparison of volumes in CIELAB would give different numbers. The percentages on the buttons are good for ranking the gamuts, not for saying one has exactly a third more colours than another.

It is chromaticity only. The fill deliberately throws brightness away, so the diagram says nothing about how a gamut behaves as colours get darker or lighter. That is the third axis the CIELAB volume would include.

The fill is computed as sRGB. Even on a P3 screen, the colours outside the sRGB triangle are clipped to sRGB values, so the chart shows you the sRGB limit everywhere, not your own screen's limit.

The screen check is coarse. The media query answers in three buckets and says nothing about how accurate the panel is, how it is calibrated, or whether it reaches its own advertised gamut.

And the horseshoe itself is one observer: the CIE 1931 2° standard observer. It is a standard, not a measurement of your eyes.

The chart is at [labs.sammii.dev/charts/gamuts](https://labs.sammii.dev/charts/gamuts/).

## Sources

- CIE 1931 2° standard observer, spectral locus at 5 nm steps (the Wyszecki and Stiles tabulation)
- IEC 61966-2-1 (sRGB)
- SMPTE RP 431-2 and Apple (Display P3)
- Adobe RGB (1998)
- ITU-R BT.2020
- The CSS `color-gamut` media query
