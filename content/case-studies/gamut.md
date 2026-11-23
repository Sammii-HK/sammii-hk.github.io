---
title: "Gamut"
description: "An OKLCH theme builder: colour scales from a base hex, chroma pulled back into sRGB by binary search, semantic tokens for light and dark, a live preview and exports that keep working when you rename things"
techStack: "Next.js, React, TypeScript, OKLCH, Tailwind CSS"
---

## The problem

Ask HSL for a yellow and a blue at "50% lightness" and you get two colours that do not look anywhere near as bright as each other. For a design system that is a real problem, because a scale is meant to be a promise: step 500 of one colour should sit at roughly the same visual weight as step 500 of another, so you can swap a brand colour without redesigning every surface. OKLCH makes that promise possible. Its L channel tracks perceived lightness, and C and H carry chroma and hue separately.

Gamut is the tool I built around that idea. You pick a base colour for each scale, give each scale a role (primary, secondary, accent, neutral or custom), and Gamut generates an eleven-step palette, checks every step's contrast, maps the scales onto semantic tokens for a light and a dark interface, previews those tokens on real components, and exports the lot as CSS, a Tailwind config, JSON or Style Dictionary tokens. Everything happens in the browser, and the whole theme lives in the address bar so you can share it.

It is live at [gamut.sammii.dev](https://gamut.sammii.dev), and the source is on [GitHub](https://github.com/Sammii-HK/gamut). I wrote about the colour science itself in [Why your design system needs OKLCH, not HSL](/blog/why-your-design-system-needs-oklch-not-hsl/).

## From hex to OKLCH and back, by hand

There is no colour library in Gamut. The conversions are written out in `colour.ts`, following Björn Ottosson's published OKLab matrices. Going from a hex value to OKLCH is four steps: undo the sRGB gamma curve to get linear light, multiply through one matrix to get cone-like responses, take cube roots, multiply through a second matrix to get OKLab, and finally turn OKLab's `a` and `b` into polar chroma and hue.

The way back is the same journey reversed, and this is the half that matters most, because every colour Gamut shows you has come through it:

```ts
const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

const l = l_ * l_ * l_;
const m = m_ * m_ * m_;
const s = s_ * s_ * s_;
```

Cubing undoes the cube root from the forward direction, and a second matrix turns those three values into linear red, green and blue. The interesting thing about the output is that nothing forces it to land between 0 and 1. OKLCH happily describes colours a screen cannot show, and when that happens one of the linear channels comes out negative or above one. That fact is the whole basis of the gamut check further down.

## The step table

The generator does not interpolate. It walks a fixed table of eleven steps, each with a target lightness and a chroma multiplier:

```ts
{ step: 50,  lightness: 0.97, chromaScale: 0.25 },
{ step: 100, lightness: 0.93, chromaScale: 0.35 },
// ...
{ step: 500, lightness: 0.55, chromaScale: 1.0 },
{ step: 600, lightness: 0.48, chromaScale: 0.95 },
// ...
{ step: 950, lightness: 0.16, chromaScale: 0.4 },
```

Every step keeps the base colour's hue exactly, takes its L from the table, and multiplies the base chroma by `chromaScale`. The chroma curve peaks at 500 and falls away towards both ends, because very light and very dark colours cannot hold much saturation anyway, and a 50 that is too chromatic reads as a highlighter rather than a tint.

This is a deliberate decision with a consequence worth being open about: the base colour supplies hue and chroma, not lightness. Step 500 always sits at L 0.55, whatever you picked. Feed it Tailwind's yellow, `#facc15`, which lives up at L 0.86, and its 500 comes out as `#896e00`, a deep olive. That is what consistency across scales costs. A yellow-500 that matches the blue-500 in visual weight cannot also be the bright yellow you started with, and I would rather the scale keep its promise than flatter one colour.

## Clamping chroma, not channels

Here is where the gamut problem bites. The default blue, `#3b82f6`, has a chroma of about 0.188. Step 50 asks for a quarter of that, about 0.047, at L 0.97. No sRGB screen can show a blue that saturated that close to white. The naive fix is to compute the RGB anyway and clamp each channel into range, but clipping channels independently changes the ratio between them, and the ratio is the hue. Light blues drift towards purple or cyan when you do that.

Gamut holds lightness and hue still and gives up chroma instead, with a bisection search:

```ts
export function gamutClamp(colour: OklchColour): OklchColour {
  if (isInGamut(colour)) return colour;
  let lo = 0;
  let hi = colour.c;
  let mid = colour.c;
  for (let i = 0; i < 20; i++) {
    mid = (lo + hi) / 2;
    if (isInGamut({ ...colour, c: mid })) lo = mid;
    else hi = mid;
  }
  return { ...colour, c: lo };
}
```

Bisection fits because of the shape of the question. At a fixed lightness and hue, zero chroma is a grey, which is always displayable, and as you push chroma outwards along that line you cross the edge of sRGB once and stay outside. So "is this chroma in gamut?" answers yes below some boundary and no above it, and the only job is to find the boundary. `lo` always holds a chroma known to be safe, `hi` one known to be unsafe, and every iteration halves the gap between them. After twenty halvings the gap is the starting chroma divided by 2²⁰, about a millionth of it. For chromas in Gamut's range that is far finer than an 8-bit hex channel can express, so twenty iterations is enough and more would change nothing you could see. Returning `lo` rather than `mid` matters too: it is the last value that actually passed.

The in-gamut test allows a tolerance of 0.001 on each linear channel, so floating-point noise right at the edge does not throw a colour out, and the final hex conversion clamps to the 0 to 1 range to absorb anything that small.

Running the default blue through it, step 50 lands at a chroma of about 0.014 rather than the 0.047 it asked for, as `#f0f6ff`. The yellow shows the other end of the scale: its 500 asked for 0.173 and kept about 0.114, because at L 0.55 that hue cannot be any more saturated on an sRGB screen.

## Contrast as a lookup

Every step is checked against white and against black, using the WCAG 2.1 definitions written out in full:

```ts
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r / 255) + 0.7152 * srgbToLinear(g / 255)
    + 0.0722 * srgbToLinear(b / 255);
}
```

The contrast ratio is `(lighter + 0.05) / (darker + 0.05)`, and each result is badged AAA at 7:1, AA at 4.5:1, or marked as failing. The default blue's 500 comes out at 4.97:1 against white, so it passes AA for body text and falls short of AAA. The table sits in a collapsible panel under the scale controls, because it is something you consult rather than something you need on screen all the time.

## Semantic tokens for two modes

A palette on its own is not a theme. Gamut maps thirteen semantic tokens onto the scales by role, and each token names one step for light mode and another for dark:

```ts
background:     { scale: neutral,   lightStep: 50,  darkStep: 950 },
textPrimary:    { scale: neutral,   lightStep: 900, darkStep: 50 },
primarySubtle:  { scale: primary,   lightStep: 100, darkStep: 900 },
secondarySolid: { scale: secondary, lightStep: 500, darkStep: 400 },
```

Most tokens mirror across the scale between modes. The secondary and accent solids step up from 500 to 400 in dark mode, so they keep their presence against a near-black background. The preview resolves every token for the chosen mode and sets them as CSS custom properties inline on the preview container, so the typography, buttons, inputs and cards inside read `var(--primary-solid)` and its siblings and redraw the moment anything changes.

## Names are labels, identity is something else

The most instructive bug in Gamut's history was about renaming. In the first version, scales carried an ID and the semantic tokens pointed at that ID, but the lookup table the preview and exports used was keyed by the scale's display name. As long as you never renamed anything, the two happened to match. Rename "primary" to "orchid" and the `primary-solid` token went looking for a scale called "primary", found nothing, and fell back to the placeholder grey, `#888888`. Your theme quietly turned grey.

The fix was to keep identity and naming apart all the way through. Palettes now carry their ID, and the map is built from it:

```ts
/** Semantic references always use identity, never the editable display name. */
export function buildPaletteMap(palettes: Palette[]) {
  return new Map(palettes.map((palette) => [
    palette.id,
    new Map(palette.steps.map((step) => [step.step, step.hex])),
  ]));
}
```

New scales get a `crypto.randomUUID()` in place of the old module-level counter. The first test in the suite renames primary and neutral and asserts that every resolved token, in both modes and in the CSS, JSON and Style Dictionary exports, is identical to before the rename, and that none of them is the fallback grey.

Names still matter for export, because they become CSS variable names and object keys. `paletteNames` turns each label into a safe slug, falls back to `scale-` plus the ID when a label is empty or starts with something other than a letter or underscore, and adds `-2`, `-3` and so on for duplicates. It also reserves a handful of keys up front: `semantic-light` and `semantic-dark`, which the Style Dictionary export uses for its own groups, and `__proto__`, `constructor` and `prototype`, which would do strange things as keys on a plain object. A test feeds it two identical labels, an empty one, one called `semantic-light` and one containing `x'; bad-code()`, then runs the generated Tailwind config inside a Node `vm` sandbox to prove it is still valid JavaScript.

## A share link that cannot be split

The whole theme is kept in the URL with `history.replaceState`, so the Share button only has to copy the address. The original format was compact and fragile: `name:hex:role`, joined with commas. A scale named "Brand: rose, summer" broke it in two places at once.

Version two sets `v=2` and stores the scales as JSON, so IDs, names, colours and roles each keep their own field and punctuation in a name is just punctuation. The decoder still reads both older formats, the comma list and the even older single-colour `?base=` link, so links shared before the change keep opening. Everything it reads is validated before it reaches the colour maths: at most 64 scales, IDs and names up to 100 characters, IDs unique, colours matching a six-digit hex pattern and roles from the known list. Anything that fails returns an empty result and the editor opens with its defaults, rather than a half-parsed theme feeding `NaN` into the conversions.

## Four exports from one palette

All four formats render from the same generated palettes and resolved tokens. CSS writes every scale step as a custom property, followed by the semantic tokens for the current preview mode. Tailwind writes the scales into `theme.extend.colors`. JSON carries `scales` and `tokens` together. The Style Dictionary format writes each value as `{ value, type: "color" }` and includes both a `semantic-light` and a `semantic-dark` group, so one file covers both modes. Every value is a plain hex, which every one of those tools accepts without configuration.

## Light and dark, twice over

Gamut has two separate ideas of light and dark, and keeping them apart was the point. The preview's mode belongs to your theme: it is a toggle in the preview header, it travels in the share link, and it decides which tokens the CSS and JSON exports resolve. The workshop around it follows your system setting instead.

The chrome is built from a small set of `--g-` variables. The dark values are the original workshop, kept value for value. The light values sit under a `prefers-color-scheme: light` query, and every one of them has zero chroma, from `oklch(98.2% 0 0)` for the canvas down to `oklch(20.5% 0 0)` for ink. That was the one rule I held to: a colour tool's own interface must not tint the colours you are judging, so the light theme is neutral paper. A custom Tailwind `light:` variant is defined as the same media query, which lets the contrast badges and error text pick darker shades in light mode, where the dark-mode pastels would wash out.

## What it taught me

OKLCH did the heavy lifting, but the parts that made Gamut usable were the smaller decisions around it. Giving up chroma rather than clipping channels is a one-line idea with a twenty-line implementation, and it keeps hue honest. A fixed lightness table is an opinion, and it is worth saying plainly that it will darken a yellow. And the bug I learnt most from had nothing to do with colour: once a value has both an identity and a label, every lookup has to agree on which one it is using, or the first rename will find out for you.
