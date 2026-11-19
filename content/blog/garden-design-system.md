---
title: "Starting a design system with nobody to hand it to"
description: >-
  How I started Garden Computing's design system from nothing at a one-founder
  company, and the three decisions that shaped it: tokens before components,
  the button first on one site, and Radix underneath.
date: '2026-11-24'
tags:
  - design-systems
  - design-engineering
  - react
---

## The situation

Garden Computing was a founder-led company with no design system and no team to build one. I owned the component architecture alongside the brand and the event marketing, work that would usually be split across several hires. New sites and demos kept being needed, each one built slightly differently, and the gaps between them were starting to show.

The job was to give everything one foundation without stopping the work that was already in flight. There was no budget for a big migration and nobody to hand a system to once it existed, so whatever I built had to be adopted one piece at a time by the same small group who were shipping.

This story has no headline number, because nothing was measured. What it has are decisions, and why I made them.

## Decision 1: tokens before components

Before writing a single component, I separated the design intent into two layers of tokens:

- **Primitive tokens:** the raw palette, spacing and type sizes. What colours exist.
- **Semantic tokens:** primary, secondary, error, success, warning, plus a typography scale. What colours mean.

Components only ever use the semantic layer. That means a brand change, or a new site with a different accent, happens in one mapping instead of in every component. It also gave the founder and me a shared vocabulary: we stopped arguing about hex values and started talking about what something was for.

## Decision 2: the button first, on one site

The first component was the button. It's the least glamorous choice, which is why it was the right one: it has more variants, states and edge cases than almost anything else (sizes, icons, loading, disabled, destructive, links that look like buttons). If the token structure and component API could survive the button, they could survive most things.

Then I piloted it on a single site before going wider.

> The trade-off was a slower rollout in exchange for lower integration risk and much more useful feedback.

A pilot on one real surface surfaced the problems a design file never would, while they were still cheap to fix.

## Decision 3: Radix underneath, bespoke on top

For behaviour I used Radix primitives where they fit: focus management, keyboard support and ARIA come from a well-tested headless layer instead of being rebuilt by hand. On top of that, everything was styled to Garden's own design language, and I built the components Radix didn't cover myself.

The trade-off: an accessible, composable base costs some control over markup and structure, but fully bespoke controls cost far more in accessibility bugs that nobody on a small team has time to find. I also started a Shadcn-style primitive layer, so components could be copied into internal and external projects and owned there, rather than versioned as a black-box package.

## Rolling it out

Adoption was incremental: tokens first, then the widely used button, then broader components, each folded into products as they were touched rather than in one migration. Documentation went alongside every step, because on a small team undocumented components drift within weeks.

Shared component tests meant each product no longer re-tested the same baseline behaviour. Each team still checked the integration, since a correct button in the wrong place is still wrong.

## What it changed

The outcomes were real but qualitative. Sites and demos built on the system looked like one product, and new surfaces started from shared foundations instead of a blank file. I don't have an adoption percentage or a delivery-speed measurement, and I'd rather say that than invent one.

If I did it again, I'd instrument it from the first pilot: how many surfaces used the system, and how long new pages took before and after. A design system's value is hard to argue for without the numbers, and that's the main lesson I took into everything since. It's why [Prism](/projects/prism/) has docs generated from source and why [Lunary's activation fix](/blog/lunary-signup-dead-end) starts from a measured funnel.
