---
title: "Why z-index: 9999 does nothing"
description: >-
  A dropdown with z-index: 9999 vanishes under a section at z-index: 1. Nothing is broken: the card it lives in became a stacking context, and a new chart lets you watch it happen.
date: '2027-01-06T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - css
  - stacking contexts
series: "The browser and the machine"
chart: "stacking"
draft: false
---

You click Options on a card and the menu opens. Rename, Duplicate, Move to, Delete. Then it disappears behind the next section on the page, a plain block with `z-index: 1`. The menu has `z-index: 9999`. You add another nine. Nothing changes.

That moment is the whole of [labs.sammii.dev/charts/stacking](https://labs.sammii.dev/charts/stacking/). It is a real toolbar, a real card with a real dropdown, and a real section underneath, all ordinary DOM and CSS, painted by your browser. Nothing in the scene is a picture of the bug. It is the bug.

## The one true thing

z-index is not a global ranking. It only competes with siblings inside the same stacking context.

The menu at 9999 loses to a section at 1 because the card between them became a stacking context. Once that happens, the whole card paints as one unit at its own level, z 0, and the 9999 is only compared with the other things inside the card. The next section sits at z 1 in the root context, and 1 beats 0. Nothing inside the card, however large the number, can climb above a sibling of the card.

The part that makes this a bug rather than a rule you learn once is that nobody meant to make the card a context. Something on it did it quietly.

## How the chart shows it

On the left, under **On the card**, are six checkboxes, each one a property that turns the card into a stacking context:

- `transform: translateZ(0)`
- `opacity: 0.99`
- `filter: blur(0)`
- `will-change: transform`
- `isolation: isolate`
- `position: relative; z-index: 0`

The chart opens with the transform one ticked, so the menu starts out already buried. Untick it and the menu opens over the next section, as you expected it to all along. Tick any of the others and it vanishes again.

Each one comes with a note in the panel under **Why the card is a context**. Any transform other than none, the classic accidental one, added for a GPU hint or a hover lift. Any opacity below 1, including 0.999 from a fade-in that never quite finished. Any filter, including a no-op one, which is why glass panels create contexts. `will-change` for any property that would create a context creates it now, before anything changes. `isolation: isolate` is the honest one: it exists only to create a stacking context, on purpose. And a positioned element with any z-index other than auto, because zero is not auto.

The panel on the right is headed **Paint order, bottom to top**. It shows the root, then the card at z 0, the next section at z 1 and the toolbar at z 2. When the card is a context, the menu is drawn indented inside it, labelled "9999, inside the card only". When it is not, the menu sits at the root at z 9999 and wins.

## The two fixes

Under **The fix** there are three buttons: none, `z-index: 2 on the card`, and `portal the menu to body`.

Raising the card works. The menu opens over the next section. It also puts the card above the toolbar, because they now share z 2 and the card comes later. The chart's own words for this are that the next dropdown war starts, and that raising z-index is how pages end up at 99999.

The portal is the real fix: leave the context entirely. In the chart's words, the menu is rendered as the last child of body, outside every context, and positioned from a measured rect. The chart's notes name Radix, Headless UI and Floating UI as libraries that work this way. The newer answer is the top layer, through `popover` or `dialog.showModal()`, which sits above every stacking context by definition. That one gets its own chart: [Getting the menu out of the card](/blog/anchor), the sequel to this one.

## What makes a context

Six toggles is not the full list. The chart's notes give the rest, from the CSS Positioned Layout spec: the root element, a positioned element with a z-index other than auto, fixed and sticky positioning, flex and grid items with a z-index, any opacity below 1, any transform, filter, backdrop-filter, perspective, clip-path, mask, mix-blend-mode other than normal, `isolation: isolate`, `contain: layout` or `paint`, and `will-change` naming any of those.

It is a long list, and most of it is stuff you add for reasons that have nothing to do with layering: a blur, a mask, a fade, a performance hint. That is why the bug keeps coming back.

Within a single context the browser paints in a fixed order: backgrounds, then negative z-index, then blocks in flow, then floats, then inline content, then positioned elements at z-index auto and 0 in document order, then positive z-index from lowest to highest. A child context is slotted into that order as one unit. That is the sentence that explains the 9999.

## How it is built

The scene is a React component with plain CSS. The toolbar has `position: relative; z-index: 2`, the next section `position: relative; z-index: 1`, and the menu `position: absolute; z-index: 9999` inside the card. The checkboxes add the chosen properties to the card's inline style, and your browser does the rest. The paint-order panel is worked out by the component from the same rules and agrees with what you see.

## What it does not do

The paint-order panel is not read out of the browser. It is computed from the rules applied to this one small scene, not an inspector you can point at your own page.

The portal fix is a stand-in. In the demo the menu is moved out of the card and drawn after the next section, at a fixed offset, so you can see the effect of leaving the context. It is not actually mounted as a child of body and it does not measure the button. The real pattern does both, and has to keep doing it on every scroll, which is the problem the sequel picks up.

It also stays inside one tidy scene: one card, one menu, one sibling. Real pages nest contexts inside contexts, and the panel will not untangle yours. What it will give you is the question to ask first: which ancestor of this element quietly became a context?

Try it at [labs.sammii.dev/charts/stacking](https://labs.sammii.dev/charts/stacking/). Untick the transform, tick `opacity: 0.99` on its own, and watch a property nobody would call a layering decision bury the menu.

## Sources

- CSS Positioned Layout Module Level 3, Appendix A, Elaborate description of stacking contexts
- MDN, Stacking context
