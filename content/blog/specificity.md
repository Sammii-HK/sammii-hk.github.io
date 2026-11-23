---
title: "Specificity is three columns, not a score"
description: >-
  Your override is later in the file and the button still ignores it. A chart that parses any selector into three counts, ranks the rules on one button, and lists the cascade steps that outrank specificity.
date: '2026-12-29T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - css
  - the cascade
series: "The browser and the machine"
chart: "specificity"
draft: false
---

Your override is there. It is later in the file than the rule it is meant to beat, it targets the right element, and the button still ignores it.

[labs.sammii.dev/charts/specificity](https://labs.sammii.dev/charts/specificity/) is about that moment. Type a selector, and it is drawn as three bars. Put several on one button, and the chart tells you which one wins and why.

## The one true thing

Specificity is not a score. It is three separate counts, compared left to right.

The first column counts ids. The second counts classes, attribute selectors and pseudo-classes. The third counts type selectors and pseudo-elements. The universal selector and combinators count nothing. To compare two selectors you look at the first column, and only if it is a tie do you look at the second, and only then the third.

So one id beats a hundred classes, and one class beats any number of element names. There is no carrying over, no point where enough classes add up to an id.

## How the chart shows it

The chart opens with five rules already on the button:

- `.btn`
- `.card .btn`
- `#app .btn`
- `.btn.btn`
- `:where(.card) .btn`

Each one has its three bars and its tuple beside it, like `(0,2,0)`. The panel on the right, **On the button, this wins**, names the winner: `#app .btn`, at `(1,1,0)`, because an id anywhere in the selector beats any number of classes. Remove it with its × and see what takes over.

What takes over is `.btn.btn`. It ties with `.card .btn` at `(0,2,0)`, and ties go to the rule that comes last. The order of the list is the source order. `.btn.btn` is the doubling hack: the same class written twice counts twice, which is legal and works and is a little bit embarrassing.

There is a text field to type your own, with an **Add rule** button, and a row of starters you can click: the five above plus `button:not(.primary)`, `li:nth-child(2n of .on)` and `a:hover::after`. Hover a starter for its note.

## The functions that change the maths

The parser follows Selectors Level 4, which is where the interesting cases are.

`:is()`, `:not()` and `:has()` take the specificity of their most specific argument. So `button:not(.primary)` is one class plus one type, `(0,1,1)`, and the `:not` itself counts for nothing.

`:nth-child(An+B of S)` counts as one pseudo-class plus whatever S is. `li:nth-child(2n of .on)` comes out at `(0,2,1)`.

`:where()` always contributes zero. That is the whole reason it exists. In the starter `:where(.card) .btn`, the `.card` adds nothing, so the rule ties with plain `.btn` and wins on order. A design system can wrap its defaults in `:where()` so that any plain selector in the product beats them, without an id, an `!important` or a doubled class. Cascade layers do the same job with a name.

The legacy single-colon `:before` and `:after` are treated as pseudo-elements, as browsers do, so `a:hover:after` and `a:hover::after` score the same.

## What gets a say before specificity

The panel includes a simplified ladder, but two distinctions need spelling out before using it on production CSS. Running transitions outrank important declarations; animation declarations do not. Important declarations outrank animations, while animations outrank ordinary author declarations.

Layer order also reverses for important declarations. Later layers beat earlier ones for normal declarations, and normal unlayered styles beat normal layered styles. For important declarations, earlier layers take priority and important layered styles beat important unlayered ones. Inline styles have their own precedence within the relevant origin and importance.

Specificity only compares declarations after the earlier cascade decisions are tied. Source order resolves a remaining tie; scoped rules can also introduce scoping proximity. The chart's tuple comparison deliberately leaves those other inputs out. Read the [CSS Cascade specification](https://www.w3.org/TR/css-cascade-5/#cascade-sorting) alongside it before treating a more specific selector as the answer to an override problem.

## How it is built

The specificity is computed by a small parser, not looked up. It walks the selector a character at a time, counting `#` as an id, `.` and `[` as the second column, `::` as a pseudo-element, a bare name as a type, and recursing into the arguments of `:is`, `:not`, `:has` and `:nth-child(… of …)`. A selector list takes the most specific of its parts, which is what matters inside those functions. The bars are scaled to the largest count on screen.

## What it does not do

The ranking assumes every rule is on the same rung of the ladder: same origin, same layer, no `!important`, no inline style. The ladder is listed beside the ranking, but it is not applied to it. If you add a rule, the chart does not know which layer you meant it to be in.

There is no real button being styled. "On the button, this wins" is computed from the tuples and the order, not read back from a rendered element.

It is a small parser, not the browser's. It handles the cases in the notes well. I would not trust it with namespaces, `:host()`, `::slotted()` or anything unusual in an attribute selector, and if it disagrees with DevTools, DevTools is right.

Try your own worst selector at [labs.sammii.dev/charts/specificity](https://labs.sammii.dev/charts/specificity/).

## Sources

- Selectors Level 4, section 17, Calculating a selector's specificity
- CSS Cascade 5, section 6
