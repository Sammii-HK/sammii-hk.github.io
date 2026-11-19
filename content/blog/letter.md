---
title: "The anatomy of a letter, and the overshoot nobody mentions"
description: >-
  Four letters in EB Garamond with their parts named and their metric lines measured from the live font: bowl, counter, ear, aperture, leg, and the few thousandths of an em that make a round letter look as tall as a flat one.
date: '2027-01-07T09:00:00+00:00'
tags:
  - charts
  - typography
  - type design
  - fonts
series: "Typography"
chart: "letter"
draft: false
---

Open [labs.sammii.dev/charts/letter](https://labs.sammii.dev/charts/letter/) and look at the horizontal lines behind the letter. Baseline, x-height, cap height, ascender, descender: the usual set, labelled down the left. But there is one more, just above the x-height, labelled on the right: **overshoot**, with a small number next to it in thousandths of an em.

That line is where the top of a lowercase o actually stops. Not at the x-height. A little above it.

## The thing you were never told

A circle that stops exactly at the x-height line looks too short next to a flat-topped x. So type designers draw round letters a few thousandths of an em taller than flat ones, so that they look the same height. It is an optical correction, and once you know about it you see it in every face you use.

The number on the chart is not from a textbook. It is measured from the font in your browser: the height of an o minus the height of an x, at 400px, after the font has loaded. Whatever value you see is that font's actual choice.

## Four letters, their parts named

The chart has four specimens, picked from a row of tabs at the top: **g**, **a**, **R** and **e**, all set in EB Garamond. Each one has its parts labelled with pointers into the letter, and hovering a label, or tabbing to it, puts its definition in the side panel. With nothing selected, the panel gives a note on the letter, and under it every measured line in em.

The **g** is a double-storey g, with five parts: **Ear**, **Bowl**, **Counter**, **Link** and **Loop**. The ear is the small stroke off the top right of the bowl, and the panel calls it the single most identifying mark in the alphabet. The double-storey g itself, the specimen note says, is the shape most geometric sans faces threw away.

The **a** is double-storey too: **Stem**, **Bowl**, **Counter**, **Terminal** and **Tail**. Its note is about the aperture at the bottom right, which is where a face decides how legible it is at 11px.

The **R** gets **Stem**, **Bowl**, **Counter**, **Leg** and **Serif**. The leg is the one typographers argue about: straight, splayed, or curved with a flick, and that choice is most of a face's character. The serif here is bracketed, joined to the stem by a curve.

The **e** gets **Crossbar**, **Eye**, **Aperture** and **Terminal**, and it is the letter that classifies a serif face. A slanted crossbar marks a Venetian or humanist roman. A level one marks a Garalde or later. That one angle is the difference between Jenson and Garamond, and it is the first branch of the [typography genome](/blog/typography). EB Garamond is the genome's stand-in for the Garaldes, so its crossbar should be level.

The counter gets a line of its own in the panel that I think about a lot: its size, not the stroke weight, is what makes a face feel open or tight at small sizes.

## The pointers are found, not placed

Here is the part that changed most while I built it, and it started with a bug. In the first version the pointers were hand-placed coordinates, and the ear pointer did not land on the ear.

So now nothing is typed in. The glyph is drawn once, white on black, onto a canvas at 400px, and every part is a rule that finds it in the ink. The ear is the rightmost ink in the top band of the letter. A counter is the middle of the widest enclosed run of white. The leg of the R is the lowest ink on the right. The aperture of the e is the row where the right-hand edge of the ink sits furthest left, the mouth of the opening.

The bands are fractions of that glyph's own ink box (0 is its lowest ink, 1 its highest), not fractions of the em. That was the second bug. The first attempt at rules used em heights, and searched for the ear in a band above where any ink existed, which is how it ended up floating in white space. Measured against the glyph's own box, the same rule holds whatever the font does.

Finally every resolved point is snapped onto the nearest ink, so a pointer cannot sit in the gap. The exceptions are the counters, the eye and the aperture, which are white by definition.

The metric lines are measured, not drawn, too. x-height is measured from a lowercase x, cap height from an H, ascender from an h, descender from a p, and the overshoot from the o against the x, all with `measureText` on the loaded font.

## What it does not do

All four specimens are in one face. The chart measures EB Garamond's overshoot and EB Garamond's x-height, and you cannot switch it to another family to compare. If you want to see how differently families fill the em, that is the [x-height chart](/blog/x-height), which measures up to twenty-two of them. If you want to see a Garalde next to a Didone next to a grotesque, that is the genome.

The rules that find the parts were written for these four glyphs. They are expressed so they should hold in other fonts, but I have not tested them across many, and a very different letter (a single-storey g, say) has different parts.

The names are the standard ones, from Bringhurst, Cheng and the Type Nomenclature ISO draft. But it is four letters and nineteen labelled parts, and the alphabet has plenty of named parts that none of these four happen to have.

Garamond has its own [love letter](/blog/love-letter-to-garamond), if you want the person behind the letters on this page.

Find the overshoot yourself at [labs.sammii.dev/charts/letter](https://labs.sammii.dev/charts/letter/).

## Sources

- Bringhurst, The Elements of Typographic Style
- Cheng, Designing Type
- Unger, Theory of Type Design
