---
title: "Getting the menu out of the card"
description: >-
  The sequel to z-index: 9999. The same dropdown three ways inside a scrolling, transformed card: clipped, escaped into the top layer and chased by JavaScript, then held to its button by CSS anchor positioning.
date: '2026-11-23T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - css
  - anchor positioning
series: "The browser and the machine"
chart: "anchor"
draft: false
---

The card is called Sprint board. It has five tasks in a list that scrolls, and the second one, Fix the filter pills, has an Assign button. Open it and a menu drops down: Priya, Sam, Wren, Unassigned. It is cut off at the bottom edge of the card. Scroll the list and the menu scrolls with it, sliding out of view behind the card's edge. It has `z-index: 9999`, and the number does nothing.

That is the opening state of [labs.sammii.dev/charts/anchor](https://labs.sammii.dev/charts/anchor/), and it is the follow-up to [Why z-index: 9999 does nothing](/blog/stacking). That chart showed why a number cannot rescue a menu from inside a stacking context. This one is the way out.

## The card is every card

The card in the demo is deliberately ordinary. Its header says what it carries: `overflow: auto · transform: translateZ(0)`. In the CSS it is also `position: relative; z-index: 0` with `overflow: hidden`, and the list inside it scrolls at a maximum height of 168 pixels. So it clips its content, it scrolls, and it is a stacking context. The chart calls it every ordinary card in every product, and that is not much of an exaggeration.

A menu that is a child of that card is trapped twice. The overflow clips it, and the stacking context caps it, so even if it were not clipped it would still sit under the next section, which has `position: relative; z-index: 1`.

## The one true thing

There is only one real escape from a clipping ancestor: the top layer.

The top layer is a separate layer the browser paints above the whole document, outside every stacking context and unaffected by any ancestor's `overflow`, `clip-path` or `filter`. Only three things can put an element there: `dialog.showModal()`, fullscreen, and the `popover` attribute. Nothing you set on the card can reach it.

## Three strategies, one menu

The chart has three buttons across the top and a **menu open** checkbox.

**`position: absolute`** is the trapped version. The menu is a child of the task row, positioned below the button with `z-index: 9999`. The panel under the demo calls it Trapped: clipped by the scroller, painted inside the card's stacking context, and carried off with the list when you scroll.

**`popover + JS`** moves the menu into the top layer. It is a real `popover` element, shown with `showPopover()`, and nothing in the card can clip or cover it any more. The cost is that the browser no longer knows where the button is. So the component listens for scroll and resize on the window, calls `getBoundingClientRect` on the button each time, and moves the menu to six pixels below it. Scroll the card and watch the menu follow the button, one frame behind. That listener is what Floating UI is for.

**`popover + anchor()`** keeps the top layer and drops the listener. The button gets an `anchor-name`, the popover gets `position-anchor` naming it and `position-area: bottom span-left`, and the browser keeps the two together itself while the anchor scrolls. `position-try-fallbacks: flip-block, flip-inline` tells it to flip the menu when it would overflow. No JavaScript positions it.

The middle option is the one worth lingering on. It works, it is the compatible path today, and it pays for that with a listener that runs on every scroll.

## Support, measured on your browser

Under the demo is a line that reads **Support on this browser**, with a yes or no for `popover` and for anchor positioning. These are detected, not assumed. Anchor positioning is checked with `CSS.supports`, for both `anchor-name` and `position-area`. Popover is checked by looking for `popover` on `HTMLElement.prototype`. No user-agent string is read.

According to the chart's notes, `popover` has been in all three engines since early 2024. Anchor positioning shipped in Chromium 125 in 2024 and, at the time the chart was written, is behind a flag or unimplemented elsewhere. That is why the JavaScript path is still the compatible one, and why Floating UI still exists. What your browser says in that line is the honest answer for you.

## The extras popover gives you

The notes point out something easy to miss: with `popover="auto"` you also get light-dismiss, Escape to close, and focus management for free. The demo uses `popover="manual"` instead, so the menu stays open while you read the panel and scroll. If you lift the pattern for a real menu, `auto` is probably the one you want.

## How it is built

One React component and a small stylesheet. There is a single popover element for both top-layer modes. In the JavaScript mode its `top` and `left` are set from the measured rect; in the anchor mode those are dropped and it gets `positionAnchor` instead, with the rest done in CSS. The button's anchor name is generated from React's `useId`, so it is unique on the page. The trapped menu is a separate element rendered inside the task row.

## What it does not do

It does not fall back gracefully on a browser without anchor positioning. The panel text says the anchor mode falls back to the hand-positioned path, but the component only runs the scroll listener in the `popover + JS` mode. On a browser that says no to anchor positioning, the anchor mode shows the menu in the top layer but not attached to the button. If your support line says no, use the middle button to see the escape working.

It shows one menu on one card. There is no nested scroller, no virtualised list and no focus trap. And the "one frame behind" in the JavaScript mode is described, not measured: the chart does not time the lag on your machine.

Try it at [labs.sammii.dev/charts/anchor](https://labs.sammii.dev/charts/anchor/), and if you have not seen the first half, start with [Why z-index: 9999 does nothing](/blog/stacking).

## Sources

- HTML Standard, the popover attribute and the top layer
- CSS Anchor Positioning Level 1
- MDN, Using CSS anchor positioning
