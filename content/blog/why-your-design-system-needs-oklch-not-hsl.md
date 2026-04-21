---
title: "Why your design system needs OKLCH, not HSL"
description: >-
  HSL lies about lightness. A 50% yellow does not look like a 50% blue. OKLCH
  fixes this, and once you see it you cannot unsee it. Here is the colour space,
  the maths, and the one binary search that keeps palettes inside the sRGB
  gamut.
date: '2026-04-27'
tags:
  - typescript
  - css
  - design-systems
  - accessibility
  - colour
draft: false
---
Open any colour picker set to HSL. Pick yellow at 50% lightness. Pick blue at 50% lightness. They are not the same brightness. Yellow is glaringly light, blue is dim. If you build a design system on HSL, your "500" step in one hue will look nothing like your "500" step in another. Your whole palette is a lie the moment you change hue.

I built Gamut because I got tired of hand-tuning palettes every time I changed a brand colour. The fix is OKLCH, a colour space where the L value actually corresponds to perceptual lightness. Two colours at the same L genuinely look equally bright to the human eye, regardless of hue. That property is what makes automated palette generation possible.

---

## Why HSL is wrong

HSL was designed to be mathematically convenient, not perceptually accurate. Its L axis is the average of the max and min RGB components, which is a geometric midpoint, not a perceptual one. Human eyes are enormously more sensitive to green than to blue. The CIE Y luminance function, which approximates that sensitivity, weights green at 0.7152 and blue at 0.0722. HSL weights them equally. A pure yellow (255, 255, 0) and a pure blue (0, 0, 255) both have an HSL lightness of 50%, but their actual perceived brightness differs by roughly an order of magnitude.

This means a Tailwind-style 11-step palette built with HSL steps will look stepwise-uniform on one hue and visibly jagged on another. Designers tune by hand to fix this, which is why real design systems like Tailwind and Radix ship palettes with hue-specific lightness overrides. The human labour is covering for the broken colour space.

## What OKLCH actually is

OKLCH is the cylindrical form of OKLab, a colour space published by Björn Ottosson in 2020. It was designed specifically so that distances in the space correspond to perceived differences in colour. L is perceptual lightness, normalised 0 to 1. C is chroma, which is the perceptual distance from grey. H is hue, in degrees.

The conversion from OKLCH to sRGB goes through a few stages: OKLCH to OKLab (polar to cartesian), OKLab to linear RGB via a 3x3 matrix, linear RGB to sRGB via gamma encoding. Gamut's implementation lifts the matrix constants directly from Ottosson's paper:

```typescript
function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}
```

The cubing is not decorative. OKLab is built on the cone response of human vision, and the LMS cone responses are modelled as the cubic roots of a linear combination of RGB. The cubes invert that when going back.

## Step generation: a table, not a formula

The temptation with OKLCH is to generate 11 steps by linear interpolation across L, because L is finally perceptually uniform and you think the maths can do the work. It cannot. Perceptual uniformity gives you evenly spaced lightness, which is not what a design system wants. A design system wants tighter spacing in the middle (where your main text colours live) and wider spacing at the extremes.

Gamut hardcodes a table derived from comparing dozens of Tailwind and Radix palettes:

```typescript
const STEP_CONFIG = [
  { step: 50,  lightness: 0.97, chromaScale: 0.25 },
  { step: 100, lightness: 0.93, chromaScale: 0.35 },
  { step: 200, lightness: 0.87, chromaScale: 0.50 },
  { step: 300, lightness: 0.78, chromaScale: 0.70 },
  { step: 400, lightness: 0.68, chromaScale: 0.90 },
  { step: 500, lightness: 0.55, chromaScale: 1.00 },
  { step: 600, lightness: 0.48, chromaScale: 0.95 },
  { step: 700, lightness: 0.40, chromaScale: 0.85 },
  { step: 800, lightness: 0.32, chromaScale: 0.70 },
  { step: 900, lightness: 0.24, chromaScale: 0.55 },
  { step: 950, lightness: 0.16, chromaScale: 0.40 },
];
```

Two things are worth noting here. Lightness is not symmetrical around 500: the top half (50 to 500) covers 0.42 L, the bottom half (500 to 950) covers 0.39 L. That matches how designers actually use palettes. Background tints need more room at the top.

The chromaScale column is the second thing. Chroma does not scale linearly either. A dark colour at maximum chroma looks muddy, a very light colour at maximum chroma looks neon. Real palettes taper chroma at both ends of the scale, peaking in the middle. The chromaScale is applied as a multiplier against the base colour's chroma, so the peak at step 500 preserves whatever chroma the designer picked, and everything else adjusts proportionally.

## The gamut problem is where everything gets hard

OKLCH can describe colours that your screen cannot display. The sRGB gamut is a subset of the space. At high chroma values, especially at medium lightness, OKLCH coordinates fall outside sRGB and the naive conversion produces negative or out-of-range RGB values.

The wrong fix is to clip RGB channels. Clipping changes hue. A saturated red clipped to the sRGB boundary drifts orange. You get a palette where hue shifts visibly from step to step, which defeats the whole point.

The right fix is to reduce chroma along the L-H line until the colour falls back into the sRGB gamut. Lightness and hue stay constant, chroma does the compromising. Finding the maximum in-gamut chroma is a one-dimensional search, and binary search is the honest tool:

```typescript
export function gamutClamp(colour: OklchColour): OklchColour {
  if (isInGamut(colour)) return colour;

  let lo = 0;
  let hi = colour.c;
  let mid = colour.c;

  for (let i = 0; i < 20; i++) {
    mid = (lo + hi) / 2;
    if (isInGamut({ ...colour, c: mid })) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return { ...colour, c: lo };
}
```

Twenty iterations halves the interval twenty times, which gives you chroma precision to about one part in a million. In practice three iterations are enough for visually identical results, but binary search is cheap and this runs once per palette step, so there is no reason to cut it shorter.

The `isInGamut` check is a linear-RGB range test with a small epsilon to tolerate floating-point drift: `lr >= -0.001 && lr <= 1.001` on each channel.

## WCAG contrast falls out for free

Once you have sRGB hex values for every step, WCAG contrast is just luminance arithmetic. WCAG 2.1 relative luminance is a weighted sum of the linear RGB components using the same 0.2126 / 0.7152 / 0.0722 coefficients the CIE uses:

```typescript
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r / 255)
       + 0.7152 * srgbToLinear(g / 255)
       + 0.0722 * srgbToLinear(b / 255);
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
```

Every palette step gets tested against pure white and pure black, and tagged AA (4.5:1), AAA (7:1), or fail. The tool surfaces which steps are safe for body text on which backgrounds without the designer having to think about it. Accessibility moves from a last-minute audit to a property of the palette itself.

## What Gamut actually ships

Once the palette is generated, gamut-clamped, and contrast-checked, it exports to the four formats design systems actually consume: raw OKLCH as CSS custom properties, hex in a Tailwind config shape, RGB triples for design tokens, and Style Dictionary JSON with metadata. The export is deterministic: same base hex in, same palette out. Source controllable, reviewable, diffable.

The result is that I can pick a brand colour once and get a full design-system-grade palette that looks coherent across hues, stays inside sRGB, passes accessibility checks, and exports directly to whatever the codebase already uses. What used to be a three-day manual task is a paste-a-hex-and-copy moment.

OKLCH is now supported natively in all evergreen browsers. There is no reason to build a new palette in HSL in 2026. The maths is public, the conversions are thirty lines each, and the perceptual behaviour is measurably better. If your design system still ships HSL-derived steps, you are paying a tax in designer labour for a problem that the colour space itself solves.
