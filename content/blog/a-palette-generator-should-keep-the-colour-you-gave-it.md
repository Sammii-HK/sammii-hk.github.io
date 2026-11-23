---
title: "A palette generator should keep the colour you gave it"
description: "Inside Tailwind Colour Creator: anchoring the 500 step, shaping an OKLCH scale, fitting it into sRGB and exporting the right contract for Tailwind v3 and v4."
date: '2026-11-20'
draft: true
tags: [design-systems, colour, typescript, tailwindcss, design-engineering]
lab_url: "https://tailwind-colour-creator.vercel.app"
---

A palette generator has a deceptively awkward promise to keep. You give it one colour, and it supplies a family of lighter and darker colours. Somewhere inside that family, the original colour should still exist.

If the input is a brand colour, quietly replacing it with the nearest point on somebody else's scale is not a neutral implementation detail. It changes the thing the user asked the tool to preserve.

My [Tailwind Colour Creator](https://tailwind-colour-creator.vercel.app) is an experiment around that contract. It generates eleven steps from 50 to 950 and anchors the input at 500. The [current source](https://github.com/Sammii-HK/tailwind-colour-creator/blob/main/src/TailwindColorGenerator.tsx) uses OKLCH maths ported from Gamut and offers three export shapes. It is worth reading as a small tool with explicit choices, even though the labs catalogue now points to Gamut as its successor.

I have already written about [why Gamut uses OKLCH](https://sammii.dev/blog/why-your-design-system-needs-oklch-not-hsl/). This article is about the decisions around the maths: what stays fixed, how steps are generated, and what an export actually promises the project receiving it.

## A scale can be relative to the input

One way to build a palette is to choose a universal table of lightness values. Every 500 has the same lightness, every 700 has the same lightness, and the input contributes hue and chroma. That produces consistency across families, but it may move the original colour.

This generator takes the other approach. Each step contains a lightness factor relative to the base. Positive factors move towards white; negative factors move towards black. At 500, the lightness factor is zero and the chroma multiplier is one.

The central calculation can be reduced to this:

```typescript
function stepLightness(baseL: number, factor: number): number {
  const value = factor >= 0
    ? baseL + factor * (1 - baseL)
    : baseL + factor * baseL;

  return Math.max(0, Math.min(1, value));
}

stepLightness(0.6, 0);      // 0.6, the base
stepLightness(0.6, 0.935);  // 0.974, a very light tint
stepLightness(0.6, -0.268); // 0.4392, a darker step
```

These numbers use an illustrative base lightness of 0.6 and factors from the implementation. They describe the calculation before gamut handling and conversion back to hex, not a claim about the perceived appearance of those three values on every display.

The consequence is easy to overlook: two colours at step 700 need not have the same lightness if their starting colours differ. The number expresses a position within a family. It does not promise that all families can be exchanged without checking their uses.

## Chroma is a curve as well

The light end of a useful interface palette usually needs gentle tints. Simply raising lightness while preserving the base chroma can ask for colours that are too intense, or outside the displayable range.

The source gives each step a chroma multiplier. At 50 it is 0.07; at 400 it is 0.97; at 500 it is one; at 950 it has tapered to 0.21. Lightness and chroma therefore follow different curves. Hue stays at the base hue during this part of the calculation.

Those values are authored design choices. The code comments describe them as calibrated from Tailwind palettes, but the implementation contains a fixed table, not a live download of Tailwind's colour definitions. It would be misleading to describe the generated scale as an exact reproduction of every official Tailwind family.

This distinction also makes the tool easier to maintain. A generator can produce a coherent custom family without claiming that its output is the official `blue` or `violet` palette. In this interface, choosing one of those names changes the export prefix. It does not magically substitute a canonical upstream palette.

## Keep the conversion stages visible

The generator accepts six-digit sRGB hex input. It decodes the RGB channels, linearises them, converts to Oklab, then expresses the two colour axes as chroma and hue. After constructing the steps, it performs the reverse conversion to output hex.

Separating these stages matters because the numbers mean different things at each point. A gamma-encoded channel is not a linear light value. Oklab's lightness coordinate is not an HSL percentage. Chroma and hue are a polar representation of Oklab's two colour axes. Björn Ottosson's [original Oklab explanation](https://bottosson.github.io/posts/oklab/) is the primary reference for the space and its conversion matrices.

At 500, an in-gamut input is intended to round-trip through those stages without being deliberately reshaped. That is a stronger and more useful requirement than “looks approximately like the original”. It can be checked by comparing the output hex with normalised input for a varied set of colours.

The edge cases deserve equal attention: black, white, nearly neutral colours, saturated primaries and partial text being typed into the input. They reveal different weaknesses. A good middle-blue example cannot stand in for all of them.

## Fit the colour into sRGB before exporting it

OKLCH can describe colours outside sRGB. The source checks a proposed step by converting it to linear RGB and testing the channels against the allowed range, with a small floating point tolerance.

When the step is outside that range, the generator reduces chroma while keeping the proposed lightness and hue fixed. It uses twenty iterations of binary search to find a value near the boundary, then converts to hex. This is the same general strategy explained in the Gamut article, so there is no need to pretend it is a second invention.

There are still precision choices. The implementation's gamut test allows a small epsilon, and the final RGB conversion clamps and rounds channels. “Preserve hue” describes the search direction in OKLCH, not an assurance that finite-precision hex conversion can never introduce any difference.

The cost is also bounded in a useful way. There are eleven steps and at most twenty gamut-search iterations for each out-of-gamut step. That is small enough to reason about directly. I would profile before adding a worker or a complicated cache; the inputs and outputs do not call for a background processing system by default.

## An export is an integration contract

The current package declares Tailwind 4 dependencies, and the component emits a v4 `@theme` block, ordinary CSS custom properties, and a v3 configuration fragment. Those formats serve different consumers.

For Tailwind v4, an illustrative subset looks like this:

```css
@theme {
  --color-brand-500: #3b82f6;
}

.status-label {
  color: var(--color-brand-500);
}
```

The example shows one anchored value, not the complete eleven-step output. Tailwind's [theme-variable documentation](https://tailwindcss.com/docs/theme) explains how the `--color-*` namespace participates in generating colour utilities. Defining a variable under ordinary `:root` makes it available to CSS, but that alone is not the same action as registering a Tailwind theme colour.

For v3, the exported object belongs inside the appropriate colours section of `tailwind.config`, commonly `theme.extend.colors` when retaining the defaults. The generator's fragment references CSS variables, so those variables also have to exist. The [v3 colour documentation](https://v3.tailwindcss.com/docs/customizing-colors) describes that configuration model.

This is a surprisingly common failure in code-generating interfaces: the snippet is valid-looking text but its required location or companion declaration is absent. An export should tell the user what it is, where it belongs and which version it targets.

## Input text is not yet a colour

There are two kinds of editing state here. A colour picker supplies a complete colour. A text field passes through incomplete values while someone types. The current parser checks length before conversion, but length alone does not establish that every character is hexadecimal.

A stricter boundary could begin with this illustrative validator:

```typescript
function normaliseHex(value: string): string | null {
  const text = value.trim();
  if (!/^#?[0-9a-fA-F]{6}$/.test(text)) return null;
  return `#${text.replace(/^#/, "").toLowerCase()}`;
}
```

Then the interface can retain the last valid palette while displaying the text being edited separately. That is a proposed improvement to the contract, not a claim that the current component already handles every invalid entry gracefully.

The variable prefix needs similar care. An arbitrary label containing whitespace or punctuation should not be inserted into generated CSS without validation. Naming controls may look cosmetic, but their output becomes code.

## A palette is not an accessibility certificate

Light and dark swatches are useful ingredients. Readability depends on the actual foreground and background pair, along with the role and size of the text. A 600 label carries no automatic contrast guarantee.

WCAG's [minimum text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) uses 4.5:1 for ordinary text and 3:1 for qualifying large text, with defined exceptions. That is a test of a pair, not a palette step. Choosing white or dark labels on the generator's swatches is also a separate interface decision from validating colours in the eventual product.

The original colour, the family around it and the semantic roles that use it are three distinct layers. A useful next step after generating a scale is to assign roles such as text, surface, border and accent, then test those actual combinations in both themes.

That is where the small generator hands over to the larger design-system problem. It can preserve a colour, produce a family and export a clear structure. The surrounding interface still needs decisions. Keeping that boundary explicit makes the generated code much easier to trust.

## Read this as a series

This article is part of **Colour: from coordinates to a useful tool**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Follow the colour decisions through [the Gamut article](https://sammii.dev/blog/why-your-design-system-needs-oklch-not-hsl/) and the live [colour-space family tree](https://labs.sammii.dev/charts/colour-spaces/). The palette is one application of the same questions about lightness, gamut and meaning.
