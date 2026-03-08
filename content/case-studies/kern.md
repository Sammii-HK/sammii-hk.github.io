---
title: "Kern"
description: "Interactive typography explorer for variable fonts, optical sizing, and fluid type scales"
techStack: "Next.js, Tailwind CSS, Framer Motion, TypeScript"
---

## The problem

Variable fonts give designers control over weight, width, optical size, and custom axes, but most tools only let you toggle between static weights. I wanted an explorer where you could drag font axes in real time, see the effect immediately with spring animations, compare fonts side by side, and generate production-ready fluid type scales using CSS clamp().

## Architecture

### Variable font axis manipulation

Each font's available axes are read from the font metadata and rendered as interactive sliders. Moving a slider updates the corresponding CSS font-variation-settings value in real time. Framer Motion spring animations smooth the transitions so axis changes feel physical rather than instantaneous.

### Fluid type scale generator

The type scale system generates CSS clamp() declarations that interpolate font size between a minimum and maximum viewport width. Users set a base size, a scale ratio (e.g. 1.25 for major third), and viewport breakpoints. The generator outputs a complete scale from caption to display sizes, each with a clamp() value that scales fluidly.

### Font comparison

Side-by-side comparison renders two fonts with synchronised specimen text. Changing the text, size, or axis values on one side updates both panels, making it easy to compare how Inter and Fraunces handle the same paragraph at the same optical size.

### URL state persistence

Every config state (selected font, axis values, type scale settings, comparison pair) serialises to URL search parameters. Copying the URL gives someone else the exact same view, making it useful for sharing typographic decisions with a team.

## Challenges

**Font loading performance**: Variable fonts are large. Loading six variable fonts on page load caused a noticeable flash. The solution uses next/font to self-host the fonts with font-display: swap, preloads the initially visible font, and lazy-loads the rest on demand.

**Axis range normalisation**: Different fonts use different ranges for the same axis name. Weight might be 100-900 on one font and 300-700 on another. The slider system normalises ranges so the UI always feels consistent, while passing the actual values through to CSS.

**Clamp calculation precision**: Generating clamp() values that hit exact pixel sizes at exact viewport widths requires solving a linear equation for each step. Rounding errors compound across a full scale, so the calculator uses precise fraction arithmetic and only rounds at the final CSS output.

## Outcome

Kern makes variable fonts tangible. You can feel the difference between weight 420 and 450, see how optical sizing adjusts stroke contrast at small sizes, and generate a fluid type scale that works from mobile to desktop. The URL persistence means typographic decisions are shareable and reproducible.
