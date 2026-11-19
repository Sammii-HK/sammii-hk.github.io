---
title: "Thirty years of CSS layout, one page seven ways"
description: >-
  The same header, sidebar, card grid and footer built in tables, floats, inline-block, flexbox, grid, container queries and subgrid, in the real CSS of each era, rendered live. Drag the width and each era's limit shows itself.
date: '2026-12-17T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - css
  - layout
series: "The browser and the machine"
chart: "layout"
draft: false
---

Five cards in a grid. Sunrise, short. A much longer title that wraps, with a body that runs to two or three lines. Noon, one line. Dusk. Night. Prices from £3 to £12. In one version of the page the prices are all over the place, each one wherever its card's text happened to end. In another, every price sits on the same line across the row, however long the title above it. Same content. Different decade.

[labs.sammii.dev/charts/layout](https://labs.sammii.dev/charts/layout/) builds one page seven times: a header, a sidebar, a main column with a card grid, and a footer. Every generation of CSS could build it. Every generation also had one thing it could not do, which the next one was invented for. The page is not drawn. It is built in the real CSS of each era and rendered by your browser.

## The one true thing

For most of the web's history, the tools we used for layout were not made for layout.

Floats were made for wrapping text round an image. For a decade they were how every page was laid out, which is why every codebase had a clearfix hack and why columns were never equal height. Flexbox, usable across browsers in its final syntax by 2013, was the first layout tool that was actually for layout.

## How the chart shows it

Across the top are seven tabs, each with a year and a name:

- **1996** Tables
- **1998** Floats and clearfix
- **2006** inline-block
- **2013** Flexbox
- **2017** Grid
- **2022** Container queries
- **2023** Subgrid

The chart opens on Grid. Under the tabs is a **Container width** slider, from 30% to 100%, which narrows the page inside its frame. Below the render are two panels, **What [year] could do** and **What it could not**, and beside them the CSS for that era.

The way to use it is to pick an era, drag the slider, and look at the cards: their heights, their alignment, and what happens when the space gets narrow.

## Era by era

**Tables.** Columns that line up, equal-height cells, a footer that spans. In the chart's words, the only tool that worked in every browser, so every site used it. Drag the width down and the columns squash rather than stack. The source order is the visual order for ever, and a screen reader announces a spreadsheet.

**Floats.** Real semantic markup at last, and the sidebar can come after the main content in the source. But the parent collapses without a clearfix, columns are never equal height, and the card grid breaks whenever one card is taller than its neighbour. The long-title card is there to make that happen.

**inline-block.** Cards wrap like words and there is nothing to clear. The whitespace between the tags becomes a gap, which is why, as the chart puts it, every inline-block grid has a 4px mystery and a comment saying `font-size: 0`. The code panel for that era shows it: `.grid { font-size: 0 } /* eat the whitespace */`.

**Flexbox.** Equal-height columns for free, alignment in both axes, space distributed rather than calculated. Layout stopped being arithmetic. But flexbox is one dimension at a time. A wrapped row of cards does not know about the row below it, so the last row stretches or leaves a gap, and nothing lines up across rows.

**Grid.** Two dimensions. Rows and columns know about each other, and `repeat(auto-fill, minmax())` adds and removes columns as the width changes with no media query. Drag the slider here and watch columns appear and disappear. What grid cannot do is let a card know how much space it has: the same card in the narrow sidebar has no way to know it is narrow.

**Container queries.** Every card cell is a container, with `container-type: inline-size`, and above 150px the card switches from stacked to a row with a thumbnail, title and price. The card component is identical in the sidebar and in the main column, and lays itself out from the width of its own cell. Drag the width and watch it switch. For most of the web's history, responsive meant the viewport. Here it stops meaning that.

**Subgrid.** The last gap: each card's title and price still sit wherever that card's content puts them. With subgrid, each cell spans four rows and takes `grid-template-rows: subgrid`, so its thumbnail, title, body and price join the parent grid's rows. Titles, bodies and prices line up across every card in the row, however long the text. That is the version from the opening paragraph.

What subgrid leaves undone, for this page, is very little. The chart names the one thing left as anchoring popovers to the thing they belong to, which is a different chart.

## The dates

The years on the tabs are when each technique became usable in practice, not when it was first specified. From the chart's notes: tables for layout from Netscape 2 in 1996; floats and positioning from CSS 2 in 1998, once browsers caught up; inline-block usable across browsers around 2006, after IE7; flexbox in its final syntax by 2013; grid shipped in Chrome, Firefox, Safari and Edge within a few weeks of each other in 2017; container queries in Chrome 105 and Safari 16 in 2022, and Firefox 110 in 2023; subgrid in all three engines by September 2023.

## How it is built

One React component holds the seven eras and the five cards. The tables era renders actual `<table>` markup. The other six render the same divs, and a class on the page wrapper switches the stylesheet: float widths of 30% and 70%, `inline-block` cells at 31%, a flex row with `flex: 0 0 30%` on the sidebar, a grid with named areas for head, side, main and foot. Container queries and subgrid build on the grid version.

## What it does not do

The CSS is modern. The chart uses current syntax for every era rather than the vendor-prefixed versions people actually wrote at the time, so the flexbox here is cleaner than the flexbox people were writing in 2013.

The code panel is a summary, not the full stylesheet. It shows the essential lines for each era, and in places it differs slightly from what renders: the grid snippet says `minmax(120px, 1fr)` where the demo's CSS uses 110px, and the flexbox and grid snippets use an 8px gap where the demo uses 6px.

It shows what each era could not do for this one page. It is not a history of every layout technique, only these seven. And because your browser renders every era, the old ones are drawn by a modern engine. That is the point, but it means you are seeing what the CSS of each era does today, not the bugs the browsers of the time added on top.

Drag the width at [labs.sammii.dev/charts/layout](https://labs.sammii.dev/charts/layout/). Start on Floats and watch what the long-title card does to its row, then jump to Subgrid.

## Sources

- CSS Flexible Box Layout Module Level 1
- CSS Grid Layout Module Level 2
- CSS Containment Module Level 3
- Can I Use
