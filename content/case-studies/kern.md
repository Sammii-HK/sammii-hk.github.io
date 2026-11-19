---
title: "Kern"
description: "Interactive typography explorer for variable fonts, optical sizing, and fluid type scales"
techStack: "Next.js, Tailwind CSS, Framer Motion, TypeScript"
---

## The problem

A variable font file typically encodes a continuous design space, weight, width, optical size, and custom axes, but almost none of the tools for browsing type let you feel that space. Most only let you toggle between static weights. Kern treats the axes themselves as the interface: drag a slider and the letterforms respond as you move. Alongside that sits a more practical need, once you've found a weight and optical size that work, turning that decision into a fluid type scale you can actually ship, using CSS clamp() rather than a fixed set of breakpoints.

## Architecture

### Axis manipulation

Each font's axes, with their ranges and defaults, are defined in Kern's font list, and the slider set is built from that. Moving a slider writes straight to the element's font-variation-settings, so the letterforms follow the drag, while a spring-animated readout tracks the exact value.

### Fluid type scale generation

The scale generator solves the other half of the workflow: turning a chosen weight and optical size into a usable set of CSS clamp() declarations. You set a base size, a scale ratio (1.25 for a major third, for instance), and the viewport range it should interpolate across, and the generator produces a full scale from caption text up to display sizes, each step expressed as a clamp() that scales smoothly instead of jumping at a breakpoint.

### Side-by-side comparison

Comparison mode renders two fonts side by side against the same specimen text, each with its own axis controls. It's the mode built to answer a specific question: how do two faces compare at the same optical size?

### URL state as the sharing mechanism

The playground's setup, the selected font, its axis values and size, serialises into the URL's search parameters. Copying the URL and sending it to someone reproduces the view, which turned out to be the simplest way to make a typographic decision reviewable by someone else.

## What made this hard

Variable fonts are large, and a type tool has to load several of them at once. next/font self-hosts each one with font-display: swap, so text paints straight away in a fallback instead of waiting on the download.

Axis ranges aren't standardised either. Weight might run 100 to 900 on one typeface and 300 to 700 on another, so every slider takes its range from that font's own definition rather than assuming a common one.

The third problem was arithmetic rather than interaction: getting clamp() values to land on exact pixel sizes at exact viewport widths means solving a linear equation for every step in the scale, and small rounding at each step adds up by the time you reach the top of a full scale.

## Outcome

Variable fonts stop being an abstract spec and start being something you can feel: the difference between weight 420 and 450 is visible as you drag, optical sizing visibly adjusts stroke contrast at small sizes, and the scale you land on generates directly into a clamp()-based CSS scale that works from mobile through desktop. Because a playground setup lives in the URL, a typographic decision made in Kern is something you can hand to someone else, not just describe to them.
