---
title: "Why 16px is not 16px"
description: >-
  font-size sets a box, not the size of the letters. A chart that loads twenty-two families and measures them in your own browser: x-height, cap height, ascender, descender and line box, the size each needs to match another, and font-size-adjust switched on live.
date: '2027-01-29T09:00:00+00:00'
tags:
  - charts
  - typography
  - css
  - fonts
series: "Typography"
chart: "x-height"
draft: false
---

Six families sit side by side at the top of [labs.sammii.dev/charts/x-height](https://labs.sammii.dev/charts/x-height/), each one writing Hxdp at exactly the same font-size, baselines lined up. They do not look the same size. EB Garamond's lowercase looks a size smaller than Verdana's. Dashed lines run across all of them at Inter's x-height and cap height, so you can see every other family over- or undershooting them.

This is the bug you have already met. The web font has not loaded yet, the fallback is showing, and the paragraph looks as if someone changed the font size. Then the real font arrives and everything shifts.

## font-size is a box

The one true thing underneath the whole chart: `font-size` does not set the size of the letters. It sets the em box, and nothing inside it is required to be any particular size. The designer of each family decides how much of the box the lowercase fills, how tall the capitals are, how far the descenders drop. Verdana's lowercase fills more than half of the box. Garamond's fills barely two fifths. Same `font-size`, very different text.

That one fact explains three everyday annoyances: why a fallback font looks the wrong size, why the same `line-height` looks tight in one family and loose in another, and why an icon next to text never quite centres.

## What the chart measures

Nothing on the page is looked up. When it loads it asks the browser for seventeen Google families (Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Work Sans, Raleway, Jost, Oswald, Playfair Display, EB Garamond, Merriweather, Lora, Libre Baskerville, Source Code Pro and Fira Code) plus five common system families (Georgia, Times New Roman, Arial, Verdana and Helvetica), waits for `document.fonts.load` to resolve for each, and then measures them with the canvas text API at 100px.

The rules are simple and they are in the footer:

- **x-height** is the `actualBoundingBoxAscent` of a lowercase x.
- **cap** height is the same for a capital H.
- **ascender** is a lowercase d.
- **descender** is the `actualBoundingBoxDescent` of a p.
- **line box** is `fontBoundingBoxAscent + fontBoundingBoxDescent`, which is the value the browser uses for `line-height: normal`.

Everything is shown as a fraction of the em, so 0.5 means half the font-size. The x is used rather than an o on purpose: round letters overshoot the line slightly (the [anatomy of a letter](/blog/letter) chart measures exactly that), so the flat x is the height the type designer actually specified.

## The controls

There is a **Reference** dropdown listing every family that measured successfully, sorted by x-height, tallest first, and a **font-size** slider from 12 to 40px that starts at 24. Clicking any row of the table makes that family the reference too.

The table has one row per family: x-height (with a bar), cap, ascender, descender, line box, and a last column headed "to match Inter's x-height at 24px", or whichever reference and size you have chosen. That column is the useful one. It is a single division: the reference's x-height at your size, divided by this family's x-height. It tells you what font-size each family would need for its lowercase to be the same height as the reference's.

Pick a family with a small x-height as the reference and most of that column drops below your font-size. Pick one with a large x-height and most of it climbs above.

## The fix nobody uses

Below the table is the part I most wanted people to try. A checkbox reads **apply font-size-adjust: 0.xxx to the fallbacks**, with the reference's own measured ratio filled in, and under it the same sentence is set at the same size in Inter, Georgia, Verdana and EB Garamond. It is on by default. Turn it off and the four lines go back to four different apparent sizes. Turn it on and the lowercase is the same height in all four.

`font-size-adjust` takes one number, the x-height as a fraction of the em, and scales any family so its lowercase matches. Put it on the block and a fallback font stops looking like a different size while the web font loads, and the layout stops jumping when it arrives. It has shipped in every engine since 2024, and almost nobody uses it. It also accepts `ex-height from-font` in place of the number.

## The line box

The line box column deserves its own paragraph. `line-height: normal` is not a number. It is the font's own ascent plus descent, and every family sets those differently. Set two families to `line-height: normal` and the lines will be different distances apart, even at the same font-size. Give them the same number instead and it still looks tight in one and loose in the other, because each family puts a different amount of letter inside the same box. And an icon centred on the line box is centred on the font's ascent and descent, not on the letters, which is why it never quite lines up.

## What it cannot tell you

Every number is measured on your machine, from the fonts as they render there. It is not a published table, and another browser or machine may give you slightly different values.

The description says twenty-two families, but that depends on you. A Google family that fails to load is left out rather than measured as its fallback. The five system families depend on what your machine has installed. The footer says they are measured only if your machine has them, but reading the code, the check that drops a missing Google family does not apply to the system five, so on a machine without one of them that row may be measuring whatever the browser substituted. Until that is fixed, treat a system row that looks suspiciously like another family with suspicion.

And `font-size-adjust` matches one thing, the x-height. The chart does not measure what it does to width or to the line box.

If you have read the Love Letters, a few of their faces are measurable here: [Helvetica](/blog/love-letter-to-helvetica), if your machine has it, and [Garamond](/blog/love-letter-to-garamond) and [Baskerville](/blog/love-letter-to-baskerville) by way of EB Garamond and Libre Baskerville.

Measure your own machine at [labs.sammii.dev/charts/x-height](https://labs.sammii.dev/charts/x-height/).

## Sources

- CSS Fonts Module Level 4, section 3.6
- HTML Standard, TextMetrics
- Bringhurst, The Elements of Typographic Style, on x-height and apparent size
