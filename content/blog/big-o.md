---
title: "The search box that stops keeping up"
description: >-
  Big O, in the keystroke: two filter fields on the same list, one of them with a single quadratic line, measured per keystroke in your own browser. Then eight complexity classes to scale, on a log axis or a linear one, at a billion operations a second.
date: '2026-11-26T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - javascript
  - performance
  - algorithms
series: "The browser and the machine"
chart: "big-o"
draft: false
---

You start typing into a filter and the letters stop arriving one at a time. They come in clumps. You type three letters and see nothing, then all three appear at once. The list is only a few tens of thousands of items. The machine is fine. The code looks fine.

It almost always is fine, except for one line.

That is where Big O lives in interface work. Not in a textbook chart of curves, but in a search box that falls behind your fingers once the list gets long. The chart at [labs.sammii.dev/charts/big-o](https://labs.sammii.dev/charts/big-o/) opens with exactly that, measured in your browser, and only then draws the classes to scale.

## The one line

The demo is a list of generated items, each a pair of words and a number: "amber amber 0", "basil heath 1" and so on. Half of them are selected. Each keystroke filters the list and, for every item that matches, checks whether it is selected, so the row can be drawn highlighted.

There are two fields side by side. They do the same job on the same list with the same render. The only difference is that membership test:

- `selected.includes(id)`, labelled **O(n · m)**
- `selectedSet.has(id)`, labelled **O(n)**

An array's `includes` walks the selected list for every item. A `Set` answers in one step. The notes call `includes`, `indexOf` or `find` inside a loop over another array the most common accidental quadratic in interface code, and the fix is a Set or a Map built once.

The slider above them is **Items in the list (half selected)**, from 1,000 to 100,000 in steps of 1,000. It starts at 40,000. At that size there are 20,000 selected ids, so when every item matches, the `includes` field can make up to 40,000 × 20,000 = 800 million comparisons in one keystroke. The `Set` field makes 40,000 lookups.

## What you will see

Each field measures the real filter in the keystroke handler with `performance.now()`, on your machine, and shows the time for the last keystroke with one of three verdicts: "under one frame", "drops frames while you type", or "the field lags behind your fingers". Under it, a small bar meter keeps your last two dozen keystrokes, with two lines drawn across it.

The lines are the two budgets that decide whether typing feels right. 16.7 ms is one frame at 60 Hz, past which typing drops frames. 100 ms is the long-standing threshold for feeling instantaneous, from Nielsen's Response Times: The 3 Important Limits, in 1993.

I am not going to quote you a number, because the whole point is that the number is yours. What I can tell you is where to look. Clear the box and type again: the worst keystroke is the one where every item matches. Then drag the slider and watch which field crosses which line first.

## The classes, to scale

The second half is the chart people expect: eight complexity classes as curves. O(1), O(log n), O(n), O(n log n), O(n²), O(n³), O(2ⁿ) and O(n!).

The controls are a slider for **n**, from 2 to 64, starting at 32, and a toggle between **log axis** and **linear axis**. Under the chart, a table gives each class's operations at that n, the time it would take at a billion operations a second, and what it is typical of. Hover a line or a row and the others dim, and a note for that class appears below.

The toggle is why I drew it. The textbook Big O chart uses a linear axis, which flattens everything below quadratic into one line along the bottom. On a log axis the classes separate, and you can see that n log n is barely above linear until n is enormous. Flip it to linear at n = 32 and the factorial is so large that every other class, the exponential included, is a flat line along the bottom.

The table at n = 32 is worth reading slowly:

- O(n log n): 160 operations, 160 nanoseconds.
- O(n²): 1,024 operations, about a microsecond.
- O(n³): 33 microseconds.
- O(2ⁿ): 4.3 seconds.
- O(n!): 8.4 × 10^18 years.

Adding one item to an exponential problem doubles the work. The chart's note for 2ⁿ says it is fine to 30 and impossible by 60, and the table agrees: 1.1 seconds at 30, 37 years at 60. The note for n! says twenty items is already more operations than there have been seconds since the universe began.

## How it is built

Both halves are plain React. The demo does the work synchronously in the change handler, as a real filtered list would, and stops the timer before anything is rendered (only the first eight matching rows are drawn), so the time on screen is the filter and the membership test, not the drawing. The curves are an SVG path per class, 121 points each, computed from the bare function of n.

## What it does not tell you

Operations here are the bare function of n, with no constant factors. That is what Big O describes, and also why it is not a benchmark. As the notes put it, a fast O(n²) beats a slow O(n log n) for small n every day.

A billion operations a second is a round figure for one core doing simple work. Real code with cache misses and branches does far fewer, so the times in the table are a floor, not a forecast.

The 800 million is an upper bound, too: every item against every selected id. A typed query that matches fewer items checks fewer of them. The shape is what matters: it is n items × m selected, and with half the list selected, double the list and the `includes` field does roughly four times the work, while the `Set` field does twice.

And the measured demo is one machine, one browser, one moment. If your laptop is quick, push the slider to 100,000 before you decide the quadratic is harmless.

The chart is at [labs.sammii.dev/charts/big-o](https://labs.sammii.dev/charts/big-o/). `?focus=2n` and `?focus=nlogn` open the curves with one class highlighted.

## Sources

- Nielsen, Response Times: The 3 Important Limits (1993)
- Cormen, Leiserson, Rivest and Stein, Introduction to Algorithms
- The ECMAScript specification (Array.prototype.sort must be stable; engines use TimSort, O(n log n))
