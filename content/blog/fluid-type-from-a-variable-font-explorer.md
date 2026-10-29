---
title: 'Kern: exploring variable fonts and generating fluid type'
description: 'How Kern turns the axes of a variable font into sliders, compares two fonts side by side, and works out the clamp() values for a fluid type scale.'
date: '2026-10-29T09:00:00+00:00'
tags:
  - typography
  - css
  - design-engineering
draft: false
---

Kern is a typography explorer I built for variable fonts, with Next.js, TypeScript and Framer Motion. It has three views: a specimen sheet, a playground for moving the axes of a font and comparing two fonts, and a type scale generator that writes fluid `clamp()` values. This post covers the interface and the maths behind the generated scale.

## The axes are data

Every font in Kern is a small config: a name, a CSS family and a list of axes, each with a tag, a label, a minimum, a maximum, a default and a step. Roboto Flex has weight, width, optical size, grade and slant. Fraunces adds softness and a wonky axis to weight and optical size. Playfair Display has weight only.

The slider panel never special-cases any of them. It maps over the list and renders a range input per axis, using that axis's own minimum, maximum and step. A font with one axis gets one slider, and a font with five gets five. Adding a font means adding its config and loading the font file; the panel does not change.

The same list builds the CSS. One function writes each axis as a quoted tag followed by its current value, falling back to the default, joined with commas. That string goes straight into `font-variation-settings` on the preview.

## Making it feel tactile

A slider that updates a paragraph can still feel like a form. What helps is that both the letters and the numbers move continuously.

The preview has a short ease-out transition on its font variation settings, so the glyphs change shape smoothly rather than stepping. The readout beside each slider is driven by a Framer Motion spring, so the number eases towards its new value instead of jumping. The preview text is editable, so you can drag the weight axis on your own headline.

For fonts with an optical size axis, the playground shows the same word twice: at your current settings, and with optical size pinned to its minimum, which shows what that axis is doing.

## Comparing and sharing

Compare mode puts two panels side by side, each with its own font picker, axis values and reset, rendering the same sentence at the same size. Picking a new font on one side resets that side to the defaults of the new font, because two fonts rarely share the same axes or ranges.

The single-font playground writes its state into the URL. Each change to the font, the size or an axis replaces the query string with all three plus any custom colours, and the page reads them back on load, so a link reproduces the setup.

## The maths behind the generated clamp()

The type scale page takes a base size, a ratio, a number of steps, and a minimum and a maximum viewport width. The default ratio is a perfect fourth.

Steps are labelled from xs upwards, and the third step is the base. Each step gets an exponent, its distance from the base: zero for the base, positive above it and negative below it.

The large size, used at the widest viewport, is the base size times the ratio raised to that exponent: an ordinary modular scale. The small size, used at the narrowest viewport, uses three quarters of the exponent. That is the same as a gentler ratio on narrow screens, so headings still step up but less steeply.

Each step then needs a straight line between those two points:

- The slope is the large size minus the small size, divided by the maximum viewport minus the minimum viewport.
- The intercept is the small size minus the slope times the minimum viewport.

Both come out in pixels. A vw is a hundredth of the viewport width, so the slope becomes a vw value when it is multiplied by a hundred, and the intercept becomes rem when it is divided by 16, the default root size in browsers. Each step is written as a clamp() with the small size in rem as its minimum, the intercept plus the slope as its preferred value, and the large size in rem as its maximum.

At the minimum viewport the preferred value equals the small size, at the maximum it equals the large size, and outside that range clamp() holds it at the bound it has crossed. Every step is written as a custom property on `:root`, ready to paste.

## An edge case worth knowing

Below the base the exponent is negative, and three quarters of a negative number is closer to zero. So for the small steps, the narrow-screen size comes out larger than the wide-screen size. When the minimum of a clamp() is larger than its maximum, the minimum wins, so those steps render at one fixed size at every width.

Small text arguably should not shrink on a narrow screen, so the result is reasonable, but it comes from how clamp() settles the conflict rather than from the formula. The label beside each of those steps also shows a size you never see. A cleaner version would skip the damping below the base.

The viewport preview has a similar gap: its container can be resized, but vw follows the browser window, not the container, so dragging rewraps the text without changing the sizes. Container query units would fix that.

## What I take from it

- Describe font axes as data and render the controls from it, so the interface covers the whole design space without special cases.
- Animate both the glyphs and the numbers, so a drag feels continuous.
- Write fluid type maths as a slope and an intercept between two known points. It is easier to check that way.
- Test the edges of a generator, not just the middle.

More on Kern: [sammii.dev/projects/kern](https://sammii.dev/projects/kern/)
