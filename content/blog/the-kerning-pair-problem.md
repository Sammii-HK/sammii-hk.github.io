---
title: "The kerning pair problem: why I built Kern"
description: >-
  Variable fonts, type scales, and the specific pain of tuning typography in a
  browser. Kern is a typography explorer at type.sammii.dev with real-time
  axis manipulation, side-by-side comparison, and shareable URL state. Here is
  how it works.
date: '2026-06-17'
tags:
  - typography
  - variable-fonts
  - css
  - tools
draft: false
---
The last time I tuned body type for a project, I had seven Chrome tabs open. One was a Google Fonts specimen page, one was a Figma frame I kept ignoring, one was DevTools with `font-variation-settings` typed into a style attribute so I could nudge `wght` and watch the paragraph reflow, one was a clamp() calculator, one was Stack Overflow because the clamp() calculator had stopped working, and the remaining two were just noise. Three hours in, I had a paragraph I quite liked and absolutely no way to show it to anyone else without screenshotting.

Kern is the tool I wanted those three hours back for. It lives at [type.sammii.dev](https://type.sammii.dev). Pick a variable font, drag the axes, generate a fluid type scale, copy the CSS, share the URL. The designer on the other end opens the link and sees your exact setup.

---

## The actual problem

Tuning typography in a browser is painful for three reasons that compound.

First, variable fonts have axes that most UI never exposes. The OpenType spec registers five: `wght`, `wdth`, `opsz`, `slnt`, `ital`. Every real variable font ships more than that. Recursive has `CASL`, `CRSV`, `MONO`. Roboto Flex has `GRAD`, `YOPQ`, `YTAS`. Fraunces has `SOFT` and `WONK`. These custom axes are where a font gets its actual personality, and Google Fonts' own picker barely acknowledges they exist. You end up hand-writing `font-variation-settings` strings in DevTools.

Second, responsive type wants `clamp(min, preferred, max)`, which is the right pattern, except nobody can write the preferred value from memory. It is a linear equation. You are solving for "what slope through viewport width hits my min size at 375px and my max size at 1440px." I have written it on whiteboards twice and both times forgotten the next day.

Third, none of this is shareable. You can screenshot a finished page. You cannot screenshot a slider position. If your designer wants to try `wght 480` instead of `wght 500`, they have to spin up the same tooling you did, from scratch. There is no URL for "here is what I see right now."

Kern fixes those three things, in that order.

## Variable fonts, properly

The current font set includes Inter, Fraunces, Recursive, Roboto Flex, Playfair Display, and Source Serif 4. Each one declares its axes explicitly, including custom ones, with real min/max/default values pulled from the font binary:

```typescript
{
  name: "Recursive",
  family: "var(--font-recursive)",
  variable: "--font-recursive",
  axes: [
    { tag: "wght", name: "Weight",    min: 300, max: 1000, default: 400, step: 1 },
    { tag: "CASL", name: "Casual",    min: 0,   max: 1,    default: 0,   step: 0.01 },
    { tag: "CRSV", name: "Cursive",   min: 0,   max: 1,    default: 0.5, step: 0.01 },
    { tag: "MONO", name: "Monospace", min: 0,   max: 1,    default: 0,   step: 0.01 },
    { tag: "slnt", name: "Slant",     min: -15, max: 0,    default: 0,   step: 0.5 },
  ],
},
```

The UI renders a slider per axis, no matter what the tag is. The component does not know or care that `CASL` is custom; it reads `min`, `max`, `step`, and hands the value back to a reducer. The reducer builds a `font-variation-settings` string on every change:

```typescript
export function buildFontVariationSettings(
  axes: FontAxis[],
  values: Record<string, number>
): string {
  return axes
    .map((axis) => `"${axis.tag}" ${values[axis.tag] ?? axis.default}`)
    .join(", ");
}
```

And because the preview element has a CSS transition on `font-variation-settings`, dragging the slider animates the glyph shapes smoothly instead of snapping. It sounds small. It is the difference between a tool that feels responsive and one that feels like a form.

The compare mode takes this further: two independent font/axis panels side by side, each with their own state. You can put Inter at `wght 500` next to Fraunces at `wght 400 opsz 72` and actually look at them at the same size, in the same paragraph, at the same time. This is the thing no specimen page does, and it is the thing you need constantly when picking a pairing.

## The clamp() generator

Fluid type is a type scale plus a viewport range. You pick a base size (usually 16px), a ratio (Perfect Fourth, Golden Ratio, whatever), a min viewport (usually phone, 375px), and a max viewport (usually desktop, 1440px). For each step in the scale, Kern computes three numbers: min size, max size, and the linear slope between them. It emits this:

```typescript
for (let i = 0; i < steps; i++) {
  const exponent = i - baseIndex;
  const size = baseSize * Math.pow(ratio, exponent);
  const minSize = baseSize * Math.pow(ratio, exponent * 0.75);
  const maxSize = size;

  // slope through (minVw, minSize) and (maxVw, maxSize)
  const slope = (maxSize - minSize) / (maxVw - minVw);
  const intercept = minSize - slope * minVw;
  const slopeVw = +(slope * 100).toFixed(4);
  const interceptRem = +(intercept / 16).toFixed(4);

  const clamp = `clamp(${(minSize / 16).toFixed(4)}rem, ${interceptRem}rem + ${slopeVw}vw, ${(maxSize / 16).toFixed(4)}rem)`;
  // ...
}
```

Two things worth calling out.

The exponent on `minSize` is multiplied by `0.75`. That is deliberate. If the ratio is a Perfect Fourth (1.333), a naive min-size scale will drop headings on mobile way too aggressively, because the ratio compounds at every step. A 4xl headline at the top of your scale becomes genuinely huge at max viewport and genuinely tiny at min. Dampening the min exponent pulls the small end back toward readable, so the mobile experience is less whiplash. It is a taste call. I lifted it from looking at what actual shipped sites do and reverse-engineering the slope.

The second thing is the units. The `rem` values give you accessibility; they scale with the user's base font size if they have changed it. The `vw` value gives you fluidity; it interpolates smoothly as the viewport resizes. Put together in a `clamp()`, you get a type scale that respects both the user's settings and the device they are on, without writing a single media query. The output for a whole scale comes out as CSS variables you can paste straight into `:root`:

```css
:root {
  --font-size-xs: clamp(0.7500rem, 0.5625rem + 0.5vw, 0.8333rem);
  --font-size-sm: clamp(0.8646rem, 0.7188rem + 0.3889vw, 0.9375rem);
  --font-size-base: clamp(1.0000rem, 0.8750rem + 0.3333vw, 1.0000rem);
  --font-size-lg: clamp(1.1547rem, 1.0547rem + 0.2667vw, 1.3333rem);
  /* ... */
}
```

That is the whole design-token layer for typography, generated from four numbers and a dropdown.

## URL state

Every piece of configuration in the playground lives in the query string: selected font, font size, every axis value, optional text and background colour. Each change calls `router.replace()` with the next set of params:

```typescript
const syncUrl = useCallback(
  (font: string, axes: Record<string, number>, size: number) => {
    const params = new URLSearchParams();
    params.set("font", font);
    params.set("size", String(size));
    for (const [tag, val] of Object.entries(axes)) {
      params.set(tag, String(val));
    }
    if (textColour) params.set("color", textColour);
    if (bgColour) params.set("bg", bgColour);
    router.replace(`/playground?${params.toString()}`, { scroll: false });
  },
  [router, textColour, bgColour],
);
```

On load, the state hydrates from the URL, falling back to sensible defaults if a param is missing. There is no backend, no database, no sign-in. The URL is the document.

This is the design-review loop I keep coming back to. I tune a paragraph in Kern until it reads the way I want. I copy the URL. I drop it in a Linear comment or a Slack DM. Whoever opens it sees the exact same setup, scrubbable, the axes already at the values I picked. They drag one slider, copy their URL back. That is the whole feedback loop, and there is no screenshot in it.

## Why I shipped it

This is what you build when you have spent too many hours writing `"wght" 450, "opsz" 18, "GRAD" -50` by hand into a style tag. The realisation is that the tuning itself is the product: the sliders, the live preview, the generated CSS, the URL you can send to anyone. Once the tool exists, the work becomes clicking through candidates, not typing syntax.

It also turned into a useful calibration exercise for me. Fraunces' `SOFT` axis is not something I would have explored if I had to keep swapping specimen pages. I found it because Kern put the slider in front of me and I dragged it. That is the whole argument for tool-first typography: the tool makes you try things you would not otherwise bother to try.

## What's next

There is a Pro tier planned with the things that turn Kern from a toy into a design system input: Style Dictionary token export, direct snippet generation for Tailwind config, saved presets with named versions. The free tier stays free forever. If you tune typography in a browser for a living and you want the Pro tier shape to match your actual workflow, the URL to tell me on is type.sammii.dev.

Until then, the playground is open. Pick a font, drag a slider, copy the URL.
