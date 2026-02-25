---
title: "Cursor-Reactive Gradients: Making CSS Respond to Mouse Position"
description: How the colour-changing logo on my portfolio works — 15 lines of maths, a CSS mask, sine waves for scroll, and a lerp function. No library, no canvas, no WebGL.
date: 2026-02-25
tags: [css, javascript, react, webdev]
draft: false
---

The logo on my portfolio site changes colour as you move your mouse. Not with a library. Not with a pre-built animation. With about 15 lines of maths that convert cursor position into RGB values and generate a three-point radial gradient in real time.

And when you scroll, the same gradient system responds using sine and cosine wave functions.

Here's how the whole thing works.

## The core function: gradientCreator

The entire gradient system lives in one function that takes two numbers and returns a CSS background:

```typescript
export const gradientCreator = (xPc: number, yPc: number) => {
  const colourCreator = (number: number) => {
    const colour = Math.floor((255 / 100) * number);
    return colour < 255 ? Math.floor((255 / 100) * number) : 255;
  };

  const colour1 = colourCreator(xPc);
  const colour2 = colourCreator(yPc);
  const colour3 = 255 - colourCreator(xPc);

  return `radial-gradient(at 50% 0, rgb(${colour1}, ${colour3}, ${colour2}), transparent 50%),
    radial-gradient(at 6.7% 75%, rgb(${colour3}, ${colour2}, ${colour1}), transparent 50%),
    radial-gradient(at 93.3% 75%, rgb(${colour2}, ${colour1}, ${colour3}), transparent 50%),
    lavender`;
};
```

Two inputs: `xPc` (cursor X as a percentage of the viewport) and `yPc` (cursor Y as a percentage).

`colourCreator` maps 0-100% to 0-255 RGB range. Simple linear interpolation: `Math.floor((255 / 100) * number)`.

Three colours are derived from two inputs:
- `colour1` = colourCreator(xPc)
- `colour2` = colourCreator(yPc)
- `colour3` = 255 - colourCreator(xPc) — the inverse of colour1

## The channel rotation trick

Here's the part that makes it actually work. The three radial gradient points use the *same three values* but in *different order*:

| Gradient point | Position | RGB order |
|---|---|---|
| Top centre | 50% 0 | (c1, c3, c2) |
| Bottom left | 6.7% 75% | (c3, c2, c1) |
| Bottom right | 93.3% 75% | (c2, c1, c3) |

By rotating which channel gets which value at each point, moving in *any* direction produces a smooth colour shift. You get a full spectrum of transitions from just two input numbers.

The positions form an equilateral triangle on the viewport, which distributes the colour mixing evenly.

The fallback colour is `lavender` — so if all three gradients are transparent at any point, you still get something pleasant.

## CSS mask-image: gradient through text

The gradient doesn't paint a box. It paints through the shape of text:

```css
.logo {
  -webkit-mask-image: url('/sammii.png');
  mask-image: url('/sammii.png');
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-size: contain;
}
```

The PNG is a text shape — the word "sammii". The gradient is the element's background, but `mask-image` clips it to only show through the mask shape.

The result: the text itself becomes the gradient canvas. Move your cursor and the letters shift through colours.

## Scroll-driven: sine waves replacing cursor input

In the portfolio container, when the user scrolls, the same `gradientCreator` function responds — but instead of cursor position, it gets values driven by trigonometric wave functions:

```typescript
const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

const wave1 = Math.sin((scrollPercent / 100) * Math.PI * 6) * 50 + 50;
const wave2 = Math.cos((scrollPercent / 100) * Math.PI * 4) * 30;

const yValue = Math.max(0, Math.min(100, wave1 + wave2));
const xValue = Math.sin((scrollPercent / 100) * Math.PI * 2) * 25 + 50;
```

Breaking this down:

- `wave1`: a sine wave that oscillates 6 complete cycles over the full scroll distance, with an amplitude of 50 centred at 50 — so it swings between 0 and 100
- `wave2`: a cosine wave at a different frequency (4 cycles), with a smaller amplitude of 30 — this adds variation so the colour change isn't predictable
- The Y value is the sum of both waves, clamped to 0-100
- The X value gets its own separate sine wave at yet another frequency (2 cycles)

The different frequencies mean the X and Y inputs never repeat the same pattern at the same scroll position.

## Smoothing with lerp

Raw values from scroll events are choppy. The animation uses linear interpolation to smooth everything:

```typescript
const lerp = (current: number, target: number, factor: number) =>
  current + (target - current) * factor;

currentX.current = lerp(currentX.current, targetX.current, 0.2);
currentY.current = lerp(currentY.current, targetY.current, 0.2);
```

Each frame, the current value moves 20% of the remaining distance toward the target. This creates an ease-out effect — fast initial response that gradually settles.

The animation runs on `requestAnimationFrame`, so it's synced to the display refresh rate.

## Pointer vs scroll: conflict resolution

Both pointer movement and scroll drive the same gradient function. Without coordination, they'd fight:

```typescript
const isScrollingRef = useRef(false);
const lastScrollTimeRef = useRef(0);

// In scroll handler:
isScrollingRef.current = true;
lastScrollTimeRef.current = Date.now();

// In pointer handler:
if (isScrollingRef.current && Date.now() - lastScrollTimeRef.current < 500) {
  return;
}
isScrollingRef.current = false;
```

Scroll takes priority while active. Once scrolling stops for 500ms, mouse movement resumes control.

## The whole thing in context

Fifteen lines of colour maths. A CSS mask. Some trigonometry. A lerp function. That's the entire system.

No animation library. No canvas. No WebGL. Just the browser's native CSS gradient engine doing what it's good at — painting pixels fast — driven by a bit of arithmetic that maps human input to colour space.

The best part: because `gradientCreator` is a pure function (two numbers in, CSS string out), you could drive it with anything. Microphone volume. Accelerometer data. API response times. The abstraction doesn't care where the numbers come from.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
