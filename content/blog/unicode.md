---
title: "One emoji, four lengths"
description: >-
  A family emoji is one character to a person and 11 to JavaScript. A chart that
  counts any string four ways, and shows what a 20-character limit written with
  .slice() does to a name, a flag and a family.
date: '2027-01-15T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - javascript
  - unicode
series: "The browser and the machine"
chart: "unicode"
draft: false
---

A username field says "20 characters max" and turns away a name that is twenty letters long. A preview cuts a message off and leaves half an emoji at the end, a little box where a face used to be. A list sorted alphabetically puts two identical cafés in two different places.

They feel like three unrelated bugs. They are one bug. A string has four lengths, and `.length` gives you the one nobody means.

I drew it as a chart: [labs.sammii.dev/charts/unicode](https://labs.sammii.dev/charts/unicode/). Type anything into it and watch the four counts split apart.

## The family

Take the family emoji, the one with two parents and two children. To anyone looking at it, it is one thing. Underneath, it is:

- **1 grapheme**, what a person would count, and what backspace deletes
- **7 code points**, four people joined by three zero-width joiners (U+200D)
- **11 UTF-16 units**, because each person sits outside the Basic Multilingual Plane and takes two units, a surrogate pair
- **25 UTF-8 bytes**, what goes over the wire and into most databases

JavaScript strings are sequences of UTF-16 code units, so `.length`, `.slice`, `.charAt` and index access all count the third one. That is the number almost nobody is thinking about when they write a limit.

## What the chart does

There are eight samples along the top: A family, A flag, A skin tone, Café, two ways, A name, Devanagari, Right to left and Zalgo. Pick one, or type into the box, and four bars redraw: graphemes, code points, UTF-16 units and UTF-8 bytes, each with the line of code that produces it (`Intl.Segmenter`, `Array.from(s).length`, `s.length`, `new TextEncoder().encode(s).length`).

Below the bars, the string is broken into its graphemes, and each one is labelled with the code points inside it. This is the part I find myself staring at. The flag is two regional-indicator code points that render as one flag. The thumbs up with a skin tone is a base emoji plus a modifier, and `.length` says 4. The Devanagari greeting is six code points and three graphemes, because consonant clusters and vowel signs combine. The Zalgo text is six letters and dozens of combining marks.

Then there is a Limit slider, from 1 to 30, and the same limit applied three ways:

1. `s.slice(0, n)` counts UTF-16 units. It can split a surrogate pair and leave a broken half-character.
2. `Array.from(s).slice(0, n)` counts code points. It never splits a pair, but it still splits a family, a flag or an accent.
3. `Intl.Segmenter … slice(0, n)` counts graphemes. It cuts where a person would.

Drag the slider with the family selected and the first two cuts produce a broken half-character or part of the family. The third one always gives you the whole family.

## Why there are four

Each count answers a different question.

Code units are how the string is stored in memory. Code points are Unicode scalar values, what a `for…of` loop yields, and they fix surrogate pairs. But Unicode builds a lot of what we think of as characters out of sequences: a flag is two code points, a skin-toned thumb is two, a family can be seven. What a person calls a character is an extended grapheme cluster, defined by Unicode Standard Annex 29 and exposed in JavaScript as `Intl.Segmenter`, which is in every engine since 2024.

Bytes are a fourth question again: storage. The page notes have the one that catches people out in a schema review: a `VARCHAR(20)` in MySQL's utf8mb4 is 20 characters but up to 80 bytes.

## The two cafés

The café sample is about a different trap. There are two ways to write é: as one precomposed code point, or as a plain e followed by a combining accent. They look identical, compare unequal, and sort apart. Those are the normalisation forms NFC and NFD from Unicode Standard Annex 15.

The fix is short. Normalise before you compare, `a.normalize() === b.normalize()`, and let `Intl.Collator` do your sorting rather than comparing strings by hand.

## The 20-letter name

The name sample is Nguyễn Thị Minh Khai, a Vietnamese name that stacks two diacritics on one letter. It is twenty graphemes, spaces included. Whether a limit written as `s.length <= 20` accepts it depends on how those letters arrived: precomposed, or as base letters plus combining marks, which push the unit count past twenty while the name a person sees stays the same. A limit counted in graphemes gives the same answer either way, which is the point of counting in graphemes.

That is the rule I would take away. If a human is going to read the limit, count what a human counts: cut by grapheme, with `Intl.Segmenter`. If a database is going to store it, count bytes as well, separately. Use `.length` when you actually mean UTF-16 units, which is mostly never.

## How it is built

It is small. One React component, a `TextEncoder` for the bytes, `Array.from` for the code points, and `Intl.Segmenter` with grapheme granularity for the graphemes. If the engine has no `Intl.Segmenter`, the grapheme count falls back to code points rather than failing. Every number on the page is computed live from whatever is in the box.

## What it does not do

It does not show rendering. The chart counts the string, not the pixels. A sequence your system cannot draw as one glyph still counts as one grapheme here.

The Right to left sample is there as a warning rather than a demonstration. Mixed-direction text means the order in memory is not the order on screen, so cursor arithmetic by index goes wrong, but the chart does not draw the visual order or move a cursor through it.

The counts are your browser's counts. The grapheme bar is whatever your engine's `Intl.Segmenter` returns, so it is a measurement of your browser as much as of the string, and on an engine without it the bar quietly shows code points instead.

And it only cuts by character. It says nothing about truncating on a word boundary, which is usually what a preview actually wants.

Try it with your own name, or the last emoji you sent: [labs.sammii.dev/charts/unicode](https://labs.sammii.dev/charts/unicode/).

## Sources

- ECMAScript specification, String objects.
- Unicode Standard Annex 15 (Normalization).
- Unicode Standard Annex 29 (Text Segmentation).
- ECMA-402, Intl.Segmenter.
