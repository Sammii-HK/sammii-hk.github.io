---
title: "Gamut"
description: "Real-time theme builder powered by OKLCH colour science with perceptual palette generation"
techStack: "Next.js, TypeScript, OKLCH, Tailwind CSS"
---

## The problem

Ask an HSL-based palette generator for a green and a yellow both set to "50% lightness" and you'll get two colours that don't read as equally bright at all. That's a real problem for design systems, which need colour scales that are perceptually uniform across lightness steps, that hold up in both light and dark mode, and that export cleanly to CSS variables, Tailwind configs, or design tokens. OKLCH fixes the underlying maths: it separates perceptual lightness from chroma and hue, so a "50" step actually is a "50" step regardless of what colour it started from. Gamut is built entirely on that colour space, and handles the parts that make it usable in practice: gamut clamping, contrast checking, and export to the formats teams actually use.

## Architecture

### Working in OKLCH

All palette generation runs in OKLCH (Oklab Lightness, Chroma, Hue) rather than HSL or HSV. The generator takes a base colour, extracts its hue and chroma, then distributes 11 steps along a lightness curve running from near-white to near-black. Because OKLCH keeps lightness genuinely independent of hue and chroma, two colours at the same L value are actually equally bright, which is the property HSL fails to guarantee.

### Lightness curve

The 11-step scale (50 through 950) follows a custom bezier curve rather than linear interpolation, tuned to match the conventions of existing design systems like Tailwind and Radix, where the middle steps are more tightly spaced and the extremes compress faster. The curve shape is adjustable in the UI, with the palette updating in real time as it changes.

### Gamut clamping

OKLCH can describe colours that fall outside sRGB, the range a display can actually show. When a step lands outside the gamut, naively clipping the RGB channels causes a visible hue shift. Instead, the clamper reduces chroma while holding lightness and hue fixed, using a binary search along the chroma axis to find the maximum in-gamut chroma at each step. That keeps colours as saturated as the display allows without introducing the hue drift that naive clipping causes.

### Contrast checking

Every step in a palette is checked against both white and black backgrounds for WCAG AA (4.5:1) and AAA (7:1) contrast ratios, with the UI marking which steps clear each threshold. That turns picking an accessible foreground/background pairing into a lookup rather than a manual calculation.

## What made this hard

Matching an existing visual language meant reverse-engineering it. "Looking like Tailwind" isn't a formula, it's dozens of hand-tuned palettes with their own implicit lightness distribution, and turning that into a single piecewise bezier, with different tension above and below the midpoint, took a lot of side-by-side comparison before it stopped looking almost right and started looking right.

Export needed its own handling, too. Every downstream format has its own conventions: CSS custom properties want raw OKLCH values, Tailwind configs want hex or RGB, Style Dictionary tokens want structured JSON with metadata attached. The export system renders all of them from the same internal palette representation.

## Outcome

Gamut generates production-ready colour scales from any base colour in under a second. Because the whole pipeline runs in OKLCH, palettes stay consistent across hues in a way HSL-based generators can't manage, and the multi-format export removes the manual step of converting between tools that design systems otherwise require.
