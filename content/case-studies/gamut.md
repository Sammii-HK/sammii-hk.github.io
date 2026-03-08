---
title: "Gamut"
description: "Real-time theme builder powered by OKLCH colour science with perceptual palette generation"
techStack: "Next.js, TypeScript, OKLCH, Tailwind CSS"
---

## The problem

Design systems need colour palettes that look perceptually uniform across lightness steps, work in both light and dark modes, and export cleanly to CSS variables, Tailwind configs, or design tokens. Most palette generators use HSL, which produces uneven lightness distributions. A "50% lightness" green looks nothing like a "50% lightness" yellow in HSL. I wanted a tool that generates palettes in OKLCH, where lightness is actually perceptually uniform, and handles the hard parts: gamut clamping, contrast checking, and multi-format export.

## Architecture

### OKLCH colour space

All palette generation runs in OKLCH (Oklab Lightness, Chroma, Hue). Unlike HSL or HSV, OKLCH separates perceptual lightness from chroma and hue, meaning two colours at the same L value genuinely appear equally bright. The generator takes a base colour, extracts its hue and chroma, then distributes 11 steps along a lightness curve from near-white to near-black.

### Lightness curve tuning

The 11-step scale (50 through 950) follows a custom bezier curve rather than linear interpolation. The curve is tuned to match the conventions of existing design systems like Tailwind and Radix, where the middle steps have tighter spacing and the extremes are more compressed. Users can adjust the curve shape interactively and see the palette update in real time.

### sRGB gamut clamping

OKLCH can describe colours outside the sRGB gamut (the range displays can actually show). When a generated step falls outside sRGB, the clamper reduces chroma while preserving lightness and hue until the colour fits. This avoids the jarring hue shifts that happen when naively clipping RGB channels.

### WCAG contrast checking

Every palette step is checked against both white and black backgrounds for WCAG AA (4.5:1) and AAA (7:1) contrast ratios. The UI marks which steps pass each threshold, making it easy to pick accessible foreground/background combinations without manual calculation.

## Challenges

**Curve matching**: Getting the lightness curve to produce palettes that "feel" like Tailwind's hand-tuned scales required comparing dozens of existing palettes and reverse-engineering their lightness distributions. The final curve uses a piecewise bezier with different tensions above and below the midpoint.

**Chroma preservation**: Clamping to sRGB while preserving perceived vibrancy is tricky. Reducing chroma too aggressively makes colours look washed out. The clamper uses binary search along the chroma axis to find the maximum in-gamut chroma for each step, preserving as much saturation as the display allows.

**Multi-format export**: Each export format has different conventions. CSS custom properties use raw OKLCH values, Tailwind configs need hex or RGB, and Style Dictionary tokens need structured JSON with metadata. The export system renders each format from the same internal palette representation.

## Outcome

Gamut generates production-ready colour scales from any base colour in under a second. The OKLCH foundation means palettes look consistent across hues, something impossible with HSL generators. The tool exports directly to the formats design systems actually use, eliminating the manual step of converting between tools.
