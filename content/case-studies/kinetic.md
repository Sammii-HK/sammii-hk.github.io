---
title: "Kinetic"
description: "Twenty-five motion studies, with engineering work on elapsed time, keyboard interaction and responsive discovery."
techStack: "Next.js, TypeScript, Framer Motion, Tailwind CSS"
updated: "2026-11-20"
status: "Local product candidate d1333e9 after ee8b23b; selected interactions verified, release pending."
---

<!-- Kept in step with the canonical structured study in kinetic.json. -->

Local product candidate d1333e9 after ee8b23b; selected interactions verified, release pending.

## Make movement something to investigate

Kinetic collects twenty-five studies spanning springs, authored transitions, drag interactions, SVG morphing and scroll effects. The local gallery adds search, categories and permanent section links. Demonstrations initialise on first approach, rather than starting every animation on page load. Once visited, a demonstration stays mounted: this is an initial-load improvement, not a complete animation budget.

_Unreleased local gallery at d1333e9, showing real interactive studies._

_Unreleased local 390px gallery. Search and categories lead to the actual studies._

## A countdown must follow elapsed time

- **What happened:** The duration control changed the starting number, but the old ring always sprang its progress straight to zero. Its visual animation did not implement the chosen duration.
- **Why:** A spring can interpolate a displayed value without being a clock. Equating the two made the duration setting misleading.
- **Fix:** The local candidate records a monotonic start time and computes the remaining fraction from elapsed time. The displayed number and ring share that value. A real five-second browser run showed Running3 at 2.105 seconds and Stopped0 at 5.260 seconds; this samples one duration rather than proving every background-tab condition.

## Keep control when the pointer is absent

Spring studies support arrow-key pulls and Enter/Space release. Swipe cards have a dismiss action; reorder rows have bounded move controls. Flip cards expose pressed state and remove the hidden face from the accessibility tree. Tabs expose selection and move focus with arrows, Home and End. The actual phone pass caught focus loss after moving a row and clipping of a magnified dock item. The repaired candidate keeps focus on the moved row and scrolls the focused dock control inside its stage.

_Unreleased local keyboard check after the layout settled. The earlier mid-transition capture was withheld._

## What was checked, and what remains

Three control regressions cover selected duration, elapsed-time boundaries and immutable bounded reordering. Shared icon regressions, TypeScript, lint, production build and a zero-finding dependency audit pass. The tool owner checked the real countdown, keyboard flip, tabs, reorder and dock at 390px with no page overflow. The gallery follows system reduced-motion settings and offers further reduction; it does not promise that every timing or opacity effect stops. All twenty-five interaction combinations, long background sessions and a complete assistive-technology audit remain open.
