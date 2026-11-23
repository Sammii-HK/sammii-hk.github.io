---
title: "Orange on white, scored twice"
description: >-
  The same text and background scored by WCAG 2 and by APCA, next to the rendered text. WCAG 2 says orange on white fails and white on orange scores the same; APCA disagrees with both, and the grey ramp on black shows where it matters most.
date: '2026-12-24T09:00:00+00:00'
tags:
  - charts
  - colour and perception
  - accessibility
  - css
series: "Colour and perception"
chart: "contrast"
draft: false
---

Orange `#ff7a00` on white fails WCAG 2. The ratio is 2.6:1, well under the 3:1 it would need even for large text. Look at it as a 28px bold heading, though, and it reads fine. Then swap the colours, white text on the orange, and WCAG 2 gives you exactly the same 2.6:1, as if the two were the same thing to read.

They are not, and that is the chart. It is at [labs.sammii.dev/charts/contrast](https://labs.sammii.dev/charts/contrast/): one pair of colours scored two ways, WCAG 2 and APCA, next to the text rendered at the sizes each method cares about.

(When I announced the series I called this one "contrast, three ways". It shipped with two, so this post is about the two that are in it.)

## Symmetric, and why that is wrong

The WCAG 2 contrast ratio is `(L1 + 0.05) / (L2 + 0.05)`, where L1 is the lighter colour's relative luminance and L2 the darker's. It only ever divides the bigger by the smaller. It has no idea which colour is the text.

APCA does. Its score, Lc, is computed with different exponents depending on polarity: 0.56 and 0.57 for dark text on a light background, 0.65 and 0.62 for light text on a dark one. Swap the colours and you change which formula runs. So orange on white scores about Lc 50, and white on orange scores about 55, written as −55 because a negative Lc means light text on dark. Same two colours, two different numbers, because reading dark on light and light on dark are not the same task.

## Where they disagree most: dark mode

The pair I would show anyone who builds dark themes is **Light grey on black**: `#8a8a8a` on `#000000`.

WCAG 2 passes it at 6.1:1. That is comfortably above 4.5, nearly AAA. APCA rates it Lc 40, below even the 45 it wants for a headline.

That gap is why so many dark-mode interfaces with "passing" secondary text are hard to read. WCAG 2 is generous on dark backgrounds: it over-rewards mid greys on black. You run the audit, everything passes, and the secondary text is still hard to read.

The bottom of the chart makes this visible across the whole range. Two rows of twenty-one grey cells, from black to white in equal steps, one row on white and one on black. Each cell shows "Aa" in that grey, with the WCAG ratio on top, in bold when it reaches 4.5, and the APCA Lc underneath, in bold when it reaches 75.

On white, the two thresholds land one step apart. WCAG 2's last passing cell is `#737373`; APCA's last cell at 75 or above is `#666666`, the one before it. They broadly agree.

On black, they do not. WCAG 2 starts passing at `#808080`. APCA does not reach 75 until `#cccccc`. Six cells in between pass one method and fall short of the other. That stretch, the mid greys on black, is where a lot of dark-mode secondary text lives.

## APCA gives you a size, not a pass

The other thing APCA changes is what the answer looks like. WCAG 2 gives you a level: AAA at 7:1, AA at 4.5:1, AA for large text only at 3:1, or fail.

APCA gives you a size. The chart uses the simplified lookup: Lc 90 for preferred body text, 75 for minimum body text, 60 for large or bold, 45 for headlines, 30 for non-text only. Under the Lc score it prints a label and a minimum body size for regular weight: 14px at 90, 15px at 75, 18px at 60, 24px at 45, 36px and up at 30, and "not for text" below that.

**Mid blue on white**, `#3355ff`, is a good example. Both methods pass it for body text. APCA's Lc 76 adds the condition: 15px or larger. Contrast and type size were always the same decision. One method admits it.

## Using the chart

Along the top are eight preset pairs, each drawn in its own colours: Grey on white, Orange on white, White on orange, White on blue button, Dark on light grey, Dark grey on black, Light grey on black, and Mid blue on white. Pick one and the sample fills with body text at 16px regular, a caption at 12px and a heading at 28px bold.

Under the sample are **Text** and **Background** colour pickers, so you can try your own, and a **Swap** button. Swap is the fastest way to see the symmetry problem: the WCAG card does not move, the APCA card does.

The two score cards sit side by side. **WCAG 2.x ratio** shows the ratio and its level. **APCA Lc** shows the score, its level, the minimum body size, and what the pair scores swapped. Under both is a line about the pair you picked. The default is **Grey on white**, `#767676`, the famous edge case: 4.54:1, the minimum grey WCAG 2 allows for body text, which APCA scores at about 72, just under its 75 for body text: marginal, but the two methods roughly agree.

## How it is built

Both methods are written out in the site's own code, with no library. WCAG 2 uses relative luminance from linearised sRGB. APCA uses the published APCA-W3 0.1.9 constants: a soft black clamp at 0.022, the four exponents above, a scale of 1.14 and an offset of 0.027. The ramp cells are computed the same way, live, so every score on the cards and in the ramps comes from the formula and not from a table. (The one-line notes under the cards are written by hand.)

## What it does not show

APCA is an additional contrast model, not a replacement conformance test for WCAG 2.2. [WCAG 3 remains an in-progress draft](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/). For a product targeting WCAG 2.2, check its published success criteria and use this comparison to investigate rendering choices. An APCA score does not establish WCAG conformance, and this chart makes no legal compliance determination.

The size guidance is the simplified lookup: one minimum body size, at weight 400, for each band. That is enough to make the point and not enough to set a type scale from.

Neither score, as computed here, knows your typeface. A thin face at 16px and a heavy one at 16px are scored the same, though the sample text will show you they are not.

And it only scores flat colour on flat colour. Text over images, gradients, transparency or anti-aliasing at small sizes is outside what either number describes.

The chart is at [labs.sammii.dev/charts/contrast](https://labs.sammii.dev/charts/contrast/).

## Sources

- WCAG 2.2, Success Criterion 1.4.3
- APCA-W3 documentation and the apca-w3 reference implementation, Myndex Research
- Sommers, Andrew, Why APCA
