---
title: "From a palette generator to Gamut, and back again"
description: "The path from a small HSL palette tool to a broader colour system, and the OKLCH maths that travelled back. The commits reveal a useful feedback loop with different promises at each end."
date: '2026-11-20'
draft: true
series: "Colour and perception"
tags: [colour, design-systems, design-engineering, typescript, tools]
lab_url: "https://tailwind-colour-creator.vercel.app"
---

The most interesting part of my colour tools' history happened after Gamut existed. The newer tool's colour maths travelled back into Tailwind Colour Creator, the smaller generator that came before it. The earlier project gained a better engine while keeping a different answer to a basic question: what should happen to the colour someone gives you?

That is a useful way to look at a collection of experiments. An older tool can keep a narrow job, a newer one can explore a larger problem, and discoveries can move between them. Progress does not require every project to grow into the same application.

The repository history makes this relationship unusually clear:

| Recorded commit | What changed |
| --- | --- |
| 10 November 2025 | Tailwind Colour Creator generates eleven HSL swatches and CSS variables. |
| 8 March 2026 | Gamut adds OKLCH palettes, multiple scales, semantic tokens, previews and several export formats. |
| 7 April 2026 | The smaller generator first gains relative lightness in HSL, then receives OKLCH conversion and gamut handling from Gamut. |

## The first tool had a very small job

The [first checked-in generator](https://github.com/Sammii-HK/tailwind-colour-creator/blob/7f9a1cc5bfb43a008dcc3c71869a6b201847aac3/src/TailwindColorGenerator.tsx) accepted a colour, produced steps from 50 to 950, and offered a block of CSS variables to copy. The interface could name the family, show the hex values and submit a new input. That was already a complete little workflow.

Its algorithm was correspondingly direct. It took the input's HSL hue and saturation, then supplied lightness from a fixed table. The following excerpt keeps the original calculation, with the surrounding loop omitted:

```typescript
const lchBase = base.toHsl();
const baseL = lchBase.l;
const baseH = lchBase.h;
const baseS = lchBase.s;

// Inside the loop, lVal comes from the fixed step table.
const color = tinycolor({ h: baseH, s: baseS, l: lVal });
```

The variable name says `lchBase`, but the method says `toHsl()`. The method is what matters. This version also calculates `baseL` without using it to generate the steps. At 500, the table supplies 0.5 regardless of the input's lightness.

That exposes two separate decisions. One is the colour space used to construct the family. The other is whether the family preserves the input's lightness. Changing the first does not automatically settle the second. The later history is easier to understand once those questions are separated.

## Gamut made the unit of work larger

The [Gamut feature commit](https://github.com/Sammii-HK/gamut/commit/3d05f4ca7ca7409ec99c4a7a4db4e998c50feed9) arrives in March. Its scope includes multiple colour scales, a contrast grid, component previews, light and dark modes, semantic token mapping and exports.

The important expansion is from a family of colours to a theme that uses several families together. An interface needs an accent, but also surfaces, text, borders and quieter states. Those roles have relationships that a row of eleven swatches cannot express on its own.

Gamut's [default token mappings](https://github.com/Sammii-HK/gamut/blob/3d05f4ca7ca7409ec99c4a7a4db4e998c50feed9/src/lib/tokens.ts) make this concrete. These are four entries from the source:

```typescript
background: { scale: neutral, lightStep: 50, darkStep: 950 },
surfaceRaised: { scale: neutral, lightStep: 100, darkStep: 800 },
textPrimary: { scale: neutral, lightStep: 900, darkStep: 50 },
border: { scale: neutral, lightStep: 200, darkStep: 800 },
```

A component can ask for its background without deciding which numbered swatch represents a background in each mode. The palette supplies possible colours; the token layer assigns jobs to them.

There are still decisions to check. These mappings are defaults, and a text/background pair needs evaluation in its actual use. A semantic name does not make a pair readable by itself. What the structure provides is a place to make and revise that decision once, instead of scattering it through components.

The numerical engine also moves to OKLCH. My [earlier Gamut article](/blog/why-your-design-system-needs-oklch-not-hsl/) explains the conversion and gamut search in detail. The relevant improvement here is a lightness coordinate designed to track perception more closely than HSL's channel arithmetic. [Oklab's original explanation](https://bottosson.github.io/posts/oklab/) describes that aim and the conversions. It does not make every palette policy interchangeable.

## April contains two different improvements

The smaller tool's April history is particularly revealing because the changes arrive in two commits.

The [first refactor](https://github.com/Sammii-HK/tailwind-colour-creator/commit/120235e46428806e000ce6a00a9a401dafe44c89) still uses HSL. It replaces fixed lightness targets with positions relative to the base colour, adds saturation multipliers and introduces small hue offsets. The centre of the scale is now organised around the input. At this intermediate stage, a lightness clamp still moves inputs near black or white.

The [next commit](https://github.com/Sammii-HK/tailwind-colour-creator/commit/6b17d432a4438f0935fdae37c10701a50557e965) explicitly ports the OKLCH conversion and gamut-clamping implementation from Gamut. It keeps the relative approach, changes the chroma curve, drops those deliberate hue offsets and allows the lightness calculation to reach the full zero-to-one range.

This schematic diff summarises the changes in policy:

```diff
- HSL hue and saturation + fixed lightness per step
+ HSL hue and saturation + lightness relative to the input

- HSL conversion + saturation multipliers + hue offsets
+ OKLCH conversion + chroma multipliers + chroma gamut search
```

The first change asks what the tool should preserve. The second changes the representation and the way colours fit into sRGB. Keeping those changes separate is useful even when they happen close together: you can identify which behaviour a regression belongs to.

The port carried colour operations and a search strategy back into the older tool, where they served its own scale policy.

## Shared maths, different meanings of 500

Gamut's [palette generator](https://github.com/Sammii-HK/gamut/blob/3d05f4ca7ca7409ec99c4a7a4db4e998c50feed9/src/lib/palette.ts) assigns 500 an OKLCH lightness of 0.55. The input supplies hue and chroma, but the lightness comes from the table. The smaller tool's [ported generator](https://github.com/Sammii-HK/tailwind-colour-creator/blob/6b17d432a4438f0935fdae37c10701a50557e965/src/TailwindColorGenerator.tsx) instead gives 500 a zero lightness offset and a chroma multiplier of one.

Running those pure functions from the pinned revisions gives a concrete comparison:

| Input | Tailwind Colour Creator 500 | Gamut 500 |
| --- | --- | --- |
| `#3b82f6` | `#3b82f6` | `#246bdd` |
| `#f97316` | `#f97316` | `#b54e00` |
| `#101010` | `#101010` | `#717171` |
| `#f0f0f0` | `#f0f0f0` | `#717171` |

Both greys reaching the same Gamut value is especially informative: its 500 is a shared target, while the smaller tool treats 500 as the supplied colour.

Each approach has a use. Fixed lightness targets give families common positions along the lightness axis. Anchoring lets a supplied brand colour remain an exact member of the generated scale. It also means equal step numbers across different anchored families do not imply equal lightness.

The distinction belongs in the product's explanation and its checks. A test that insists every Gamut 500 equals the input would enforce the smaller tool's promise on the wrong implementation.

## Reuse the operations, keep the choices visible

This history suggests a useful boundary for shared code. Conversion, colour representation and gamut handling are reusable operations. Step tables, anchoring rules, semantic defaults and export formats express what a particular tool is for.

The two repositories currently copy related maths rather than importing one shared package. That makes the relationship easy to inspect, but it creates maintenance work: a numerical correction may need to reach both places. Even their gamut searches finish slightly differently. Gamut returns the lower bound of its final chroma interval; the smaller port returns its midpoint. Calling them identical would hide that detail.

A future extraction could give those operations one home while leaving each tool's scale policy explicit. Useful checks would cover round trips, gamut boundaries and each product's own invariant. The extraction would earn its complexity when it makes corrections safer; the number of projects alone is not a reason to invent a framework.

There is a related thread in [Kern's font explorer](/blog/fluid-type-from-a-variable-font-explorer/): expose the decisions, preview their effect and produce something the next stage can use. That is a design connection, rather than evidence that the typography tool descended from this code.

The colour history leaves a more specific lesson. A successor can broaden the problem while an earlier tool remains useful for a smaller one. When the better maths travels back, both projects gain something, and their different promises become easier to name.

## Read this as a series

This article is part of **Colour: from coordinates to a useful tool**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Follow the colour decisions through [the Gamut article](https://sammii.dev/blog/why-your-design-system-needs-oklch-not-hsl/) and the live [colour-space family tree](https://labs.sammii.dev/charts/colour-spaces/). The palette is one application of the same questions about lightness, gamut and meaning.
