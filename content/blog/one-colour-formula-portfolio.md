---
title: 'One colour formula: how I made my developer portfolio feel alive'
description: >-
  How I built a cursor-reactive colour system that runs through every
  interactive element on my portfolio: logo, background, card borders, cursor
  follower, all from a single formula.
date: '2026-03-02'
tags:
  - portfolio
  - css
  - creative-coding
  - react
draft: false
---

A few weeks ago my portfolio was a clean dark grid. Nice enough, functional. But the projects I was building: audio-reactive shaders, WebXR installations, animated canvas experiments, were far more interesting than the site presenting them.

So I rebuilt the visual layer. Not with a design tool but in code, using one colour formula that runs through every interactive element on the page. Here's how it works.

## The formula

The whole thing comes down to mapping cursor position to RGB:

```ts
const cv = (n: number) => Math.min(255, Math.floor((255 / 100) * n));
const xPc = (e.clientX / window.innerWidth) * 100;
const yPc = (e.clientY / window.innerHeight) * 100;
const r = cv(xPc);
const g = cv(yPc);
const b = 255 - r;
```

Move left: blues dominate. Move right: reds and greens. Move down: green increases. The complement trick (`255 - r` for blue) keeps the palette from mudding into grey.

This same calculation runs in four places: the wordmark logo, the ambient background, the card borders, and the cursor follower bloom. Because they all share the formula, moving your mouse makes the whole page shift in unison.

## The logo

The logo is a CSS mask of a PNG wordmark, with a div behind it containing the gradient. The mask clips the gradient to the letter shapes:

```css
.logo {
  -webkit-mask-image: url('/assets/images/sammii.png');
  mask-image: url('/assets/images/sammii.png');
  mask-size: 175px;
  mask-repeat: no-repeat;
}
```

Behind it sits a radial gradient computed from the cursor position. The letters become windows into a shifting colour field.

## The ambient background

The background has four radial blobs. Their colours come from the cursor formula, but their positions drift using sin waves driven by time:

```ts
export const backgroundGradientCreator = (xPc: number, yPc: number, t: number = 0) => {
  const r1 = c(xPc + Math.sin(t * 0.41) * 20);
  const g1 = c(yPc + Math.cos(t * 0.33) * 18);
  const b1 = 255 - c(xPc);

  const x1 = (50 + Math.sin(t * 0.31) * 16).toFixed(1);
  const y1 = (0  + Math.abs(Math.sin(t * 0.23)) * 22).toFixed(1);

  return {
    background: `
      radial-gradient(ellipse at ${x1}% ${y1}%, rgb(${r1} ${g1} ${b1} / 15%), transparent 65%),
      ...
    `
  };
};
```

Four blobs at different sin frequencies drift at different rates. The colours also breathe: each channel has a small time-based oscillation layered on the cursor value. Even when the cursor is still, the background shifts.

To drive this continuously from React, the animation loop passes time as state:

```ts
const animate = () => {
  setYPc(currentYPcRef.current);
  setXPc(currentXPcRef.current);
  setTime(performance.now() / 1000);
  animationRef.current = requestAnimationFrame(animate);
};
```

## The card borders

Each project card has a chromatic border that responds to where your cursor is within that specific card, not the viewport. This makes every card feel individually alive.

```ts
onMouseMove={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  cardXPcRef.current = ((e.clientX - rect.left) / rect.width) * 100;
  cardYPcRef.current = ((e.clientY - rect.top) / rect.height) * 100;
}}
```

The colour is updated in a `requestAnimationFrame` loop that layers sin waves on top of the cursor position within the card:

```ts
const animate = () => {
  if (hoveredCardRef.current) {
    const t = performance.now() / 1000;
    const rPc = Math.max(0, Math.min(100, cardXPcRef.current + Math.sin(t * 1.1) * 28));
    const gPc = Math.max(0, Math.min(100, cardYPcRef.current + Math.cos(t * 0.7) * 22));
    const bPc = 100 - rPc;
    hoveredCardRef.current.style.borderColor = `rgb(${cv(rPc)} ${cv(gPc)} ${cv(bPc)} / 70%)`;
  }
  requestAnimationFrame(animate);
};
```

**Pastel, not neon.** The standard formula maps 0–100% to 0–255. To make it pastel, floor the minimum channel value at 140:

```ts
const cv = (n: number) => 140 + Math.floor((115 / 100) * Math.max(0, Math.min(100, n)));
```

No channel goes below 140, so colours stay light and washed, closer to soft chromatic hues than saturated primaries.

The fade in and out is just a CSS transition:

```css
.project-card {
  transition: border-color 0.5s ease;
}
```

The rAF loop writes the inline style every frame while hovered, and clears it on mouseleave. The transition handles the fade naturally without any extra JS.

## The cursor follower

A fixed div tracks the cursor with a lerp factor of 0.06, slower than the background's 0.2, so it trails behind:

```tsx
const animate = () => {
  xRef.current = lerp(xRef.current, targetXRef.current, 0.06);
  yRef.current = lerp(yRef.current, targetYRef.current, 0.06);

  const xPc = Math.min(100, (xRef.current * 2 / window.innerWidth) * 100);
  const yPc = Math.min(100, (yRef.current / window.innerHeight) * 100);
  const r = cv(xPc), g = cv(yPc), b = 255 - r;

  el.style.transform = `translate(${xRef.current}px, ${yRef.current}px)`;
  el.style.background = `radial-gradient(circle, rgb(${r} ${g} ${b} / 25%) 0%, transparent 70%)`;

  requestAnimationFrame(animate);
};
```

A 350x350px radial gradient, `filter: blur(35px)`, hidden on touch devices. Same colour formula as the logo, so wherever the bloom sits it matches the logo's current hue.

## Why one formula?

The technical choice to use the same colour derivation everywhere was intentional. It means the portfolio reads as a coherent system, not a collection of independent effects. When you move your mouse, you're not triggering five separate animations; you're changing one variable and watching everything respond.

That coherence is the difference between a portfolio that looks like it has effects bolted on and one that feels like a living document.

You can see it live at [sammii.dev](https://sammii.dev).

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
