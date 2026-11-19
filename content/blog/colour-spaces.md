---
title: "Twenty-five ways to write a colour down"
description: >-
  A family tree of colour spaces from Munsell in 1905 to CSS Color 4 in 2022, in six lanes by purpose. Hover OKLCH and the whole lineage lights up, back through a blog post, a 1998 paper and a 1931 experiment.
date: '2026-11-24T09:00:00+00:00'
tags:
  - charts
  - colour and perception
  - colour
  - css
series: "Colour and perception"
chart: "colour-spaces"
draft: false
---

Hover OKLCH on the chart and a long chain lights up behind it. Oklab and LCH, then CIE XYZ, CIELAB and Munsell, IPT and CAM16 as dotted influences, then CIECAM02, then CIE RGB in 1931. The colour space I write in every day turns out to be the youngest branch of a family that has been arguing about the same problem for ninety years.

The chart is at [labs.sammii.dev/charts/colour-spaces](https://labs.sammii.dev/charts/colour-spaces/). It holds twenty-five colour spaces, dated 1905 to 2022, laid out on a timeline in six lanes. The launch post gave it a paragraph. This is the longer version.

## The lanes are purposes, not maths

The tree is not sorted by how the spaces are computed. It is sorted by what each was for, because that turned out to explain the shapes better than the formulas did.

- **Perceptual**: spaces built to make equal steps look equal. Munsell, CIE XYZ, CIELAB, CIELUV, LCH, IPT, Jzazbz, Oklab, OKLCH.
- **Appearance models**: spaces that predict what a colour looks like in context. CIECAM02 and CAM16.
- **Display and device**: what a screen can show, as encoded RGB. CIE RGB, sRGB, Adobe RGB, DCI-P3 and Display P3, CSS Color 4.
- **Broadcast and video**: luma plus chroma, built for bandwidth. YIQ, YUV and YCbCr, Rec. 709, Rec. 2020, ICtCp.
- **Hue, saturation, lightness**: cheap coordinates for picking colour by hand. HSL and HSV, HSLuv, Okhsl and Okhsv.
- **Print and pigment**: CMYK, on its own.

Laid out like that, you can see the lanes borrowing from each other. Rec. 709 fixed the red, green and blue of HD television in 1990, and sRGB took those primaries in 1996 so the web and Windows could agree on what a colour number meant. A broadcast decision became the default colour space of everything.

The broadcast lane has my favourite reason for existing. YIQ, in 1953, split colour into luma and two chroma axes so colour television stayed compatible with black-and-white sets: the luma signal was the old picture. The YUV and YCbCr descendants still carry colour in every JPEG, every video codec and every HDMI link, subsampled because the eye resolves brightness better than colour.

## The blue problem

The line I keep tracing is the one through IPT.

CIELAB, from 1976, was the workhorse perceptual space for fifty years. It is why "delta E" means anything. It also has a blue problem: lower the chroma of a blue and it drifts purple. LCH is CIELAB in polar coordinates, so it inherits the drift.

IPT, from Ebner and Fairchild in 1998, fixed it by going through cone responses first: XYZ to LMS, a power curve, then intensity plus two opponent axes, with hue lines that stay straight. That idea is the backbone of ICtCp, Dolby's encoding for HDR video in Rec. 2100. It is also one of the two dotted lines into Oklab.

Oklab, in 2020, started as a blog post by Björn Ottosson. XYZ to LMS, a cube root, and a small matrix fitted so that CAM16 lightness and IPT hue both come out right. CSS adopted it within two years. A formula short enough to memorise beat a committee, and it did it by standing on a 1998 paper and a 2017 appearance model at once.

The appearance lane has its own quiet descendant. CAM16, from Li et al. in 2017, is CIECAM02 with its numerical instabilities fixed, plus a uniform colour space derived from it. It is the model under Google's HCT tonal palettes in Material You. So Material You's palettes, and through Oklab every OKLCH palette, are a few steps back built on colour appearance research rather than on RGB.

## How to read it

Solid lines are derivations: this space is defined in terms of that one. Dotted lines are influence: this space borrowed an idea. Munsell into CIELAB is dotted, because Munsell's spacing was used to check CIELAB rather than to define it. HSL into HSLuv and Okhsl is dotted, because both borrow HSL's shape rather than its maths.

Hover or focus a node and its ancestors and descendants light up, and the side panel says what the space is, why it mattered, and the full list it descends from and led to. Click a node to pin it. The **Year** slider runs from 1900 to 2026; drag it back and the tree un-grows, which is the clearest way I have found to show how young the right-hand side is.

Six of the spaces have a ramp in the panel: CIELAB, LCH, HSL and HSV, sRGB, Display P3 and OKLCH. These are drawn with the real CSS colour functions, so your browser is rendering them, not me. The HSL, LCH and OKLCH ramps are nine hues forty degrees apart at one nominal lightness, which makes them a direct comparison: if the brightness wobbles along the row, the space is lying about lightness. HSL's wobbles. OKLCH's does not, though a few of its swatches sit outside sRGB, so on an sRGB screen those are pulled in and the row is close rather than perfect. (The CIELAB ramp steps through lightness instead, and the sRGB and Display P3 ramps run from red to green, so those three are not the same test.)

## How it is built

The tree is one data file. Each space has a name, a year, a lane, who made it, what it is, why it mattered, and a list of parents. The edges are generated from the parents, with a handful marked as influence. The layout is a timeline: x is the year, each lane is a band, and nodes that are close in time within a lane are staggered across three rows so the labels never overlap.

The SVG on the page is the poster. **Download the poster (SVG)** clones it, adds a small stylesheet so it stands on its own, and saves it as a file. The page also takes `?year=` to open at a given year and `?play=1` to grow the tree from 1900, one year every 55 milliseconds, which is how the video clips are recorded.

## What it does not show

Dates are the year of the defining paper or standard, which is not always the year anyone used the thing. Display P3 is dated to DCI-P3 in 2007, though Apple shipped the Display variant in 2015. CSS Color 4 is dated to 2022, the year all three engines shipped `lab()`, `lch()`, `oklab()` and `oklch()`.

The lanes are a judgement. Rec. 2020 sits in broadcast and could argue for display. The split between derivation and influence is also mine: it is a reading of the papers, not a property of the maths.

Twenty-five is a selection. It is a family tree, not a census.

And the ramps depend on your screen and your browser. The ends of the Display P3 ramp ask for colours outside sRGB; on a screen that cannot show them, you are seeing the nearest it can do. The gamuts chart is about exactly that gap.

The chart is at [labs.sammii.dev/charts/colour-spaces](https://labs.sammii.dev/charts/colour-spaces/). [Gamut](https://gamut.sammii.dev) is the tool that made me want to draw it.

## Sources

- CIE publications 15:2004 and 159:2004
- Ottosson, A perceptual color space for image processing (2020)
- Ebner and Fairchild, Development and testing of a color space (IPT) (1998)
- Li et al., Comprehensive color solutions: CAM16, CAT16 and CAM16-UCS (2017)
- ITU-R BT.709, BT.2020, BT.2100
- IEC 61966-2-1 (sRGB)
- W3C CSS Color Module Level 4
