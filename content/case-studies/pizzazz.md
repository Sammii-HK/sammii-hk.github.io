---
title: "Pizzazz"
description: "A small npm package that bursts emoji particles from a click or hover, with presets, gravity, spin, spread and easing, a cleanup function, and a playground that writes the code for you"
techStack: "JavaScript, DOM, CSS transitions, Rollup, Jest, npm"
---

## What it is

Pizzazz is a little library for adding a burst of something to a website: hearts on click, sparkles on hover, bats in October. You call one function on an element, or on the whole document, and every click sends a handful of emoji flying out from the pointer and fading away. It has no runtime dependencies and no framework bindings, because it only needs the DOM.

It is published on npm as [@unicorn-poo/pizzazz](https://www.npmjs.com/package/@unicorn-poo/pizzazz), and there is a [playground](https://pizzazz-demo.vercel.app) where you can try every preset and option and copy the code it generates.

```js
import { addPizzazz } from '@unicorn-poo/pizzazz';

const cleanup = addPizzazz(document, { effectType: 'stars', gravity: true });
```

The current npm release is 1.2.0. Everything in it is described below, and so are the newer changes that are in the repository and not yet published: reduced-motion suppression, keyboard centring, a working default export, a server-rendering fix and a rendering fix for dark backgrounds. I've said which is which as I go.

It started as a weekend project in February 2025, built and published in a day, and the npm version history tells that story plainly: versions 1.0.0 to 1.0.13 went out in under forty hours. Most of those were me learning, in public, what a package has to do to work inside other people's frameworks.

## Thirteen presets and a character

The presets are a map from a name to a single emoji:

```js
const effects = {
  valentines: '❤️',
  celebration: '🎉',
  stars: '✨',
  // ... snow, fire, confetti, bubbles, ghost, balloon, bat, pumpkin, egg, bunny
};
```

It began with seven. The ghost arrived the next day, and the balloon, bat, pumpkin, egg and bunny a day after that, for birthdays, Halloween and Easter. The `character` option came later as a pull request from a contributor, and it overrides the preset with any text you like. An unknown preset name falls back to a sparkle rather than an empty burst.

Particles are written with `textContent`. The first versions used `innerHTML`, which was harmless while every symbol came from my own map, but once `character` accepted any string it meant the option could carry markup into the page. Version 1.2.0 switched to `textContent`, so a custom character is always just text.

## How a burst works

There is no animation loop and no canvas. Each burst is a positioned `div` with a few `span`s inside it, and the browser's own CSS transitions do the motion. For each particle the code picks a destination, sets the transition, and then, after a 10ms timeout, sets the destination transform and an opacity of zero:

```js
setTimeout(() => {
  const rotateStr = rotate ? ` rotate(${rotation}deg)` : '';
  effectElement.style.transform = `translate(${x}px, ${y}px) scale(${scale})${rotateStr}`;
  effectElement.style.opacity = '0';
}, 10);
```

The timeout is there so the browser has painted the starting state before the end state is applied. Set both in the same tick and there is nothing to transition from. When the duration is up, the whole container is removed in one go.

The destination is a little bit of trigonometry:

```js
const angle = Math.random() * 2 * Math.PI;
const minSpread = spread * 0.25;
const radius = Math.random() * (spread - minSpread) + minSpread;
const x = Math.cos(angle) * radius;
let y = Math.sin(angle) * radius;
```

Each particle travels in a random direction, by a distance somewhere between a quarter of `spread` and the full `spread`. The quarter is the important part. With a radius that could be zero, some particles would barely move and the burst would look clotted in the middle. A minimum radius leaves a clear ring around the click.

Gravity changes only the vertical part:

```js
if (gravity) {
  y = Math.abs(y) + spread * 0.5;
}
```

In CSS, positive `y` is down the screen. Taking the absolute value folds every upward particle into a downward one, and adding half the spread pushes the whole burst lower, so with a spread of 40 every particle lands between 20 and 60 pixels below the click. It is not a simulation of gravity, there is no acceleration, but it reads as things falling, which is what the option is for. Rotation picks a spin between -360 and 360 degrees, and every particle shrinks to between 0.2 and 0.6 of its size as it fades.

## Easing that overshoots

The five easings are CSS timing functions. Three are keywords or gentle curves, and two are built to overshoot:

```js
'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
```

A cubic Bézier timing function maps time to progress, and its two middle control points pull the curve around. When a control point's second value is above 1, the curve rises above 1 before settling back to it, which means the particle travels past its destination and comes back. Evaluating the curves, `bounce` peaks at about 1.098 of the distance and `spring` at about 1.087, so a particle overshoots by roughly 10% and 9% respectively. It is a small number, but it is the difference between a burst that stops and one that lands. These are curves, not physics, and the playground describes spring that way.

## Attaching, hovering and cleaning up

`addPizzazz` listens for `click`, or for `mousemove` when the trigger is `'hover'`. Hover needs a throttle, because `mousemove` fires constantly, so it allows at most one burst every 200ms by default:

```js
const handler = (event) => {
  const now = Date.now();
  if (now - lastTrigger < throttleMs) return;
  lastTrigger = now;
  createClickEffect(event, effectOptions);
};
targetElement.addEventListener(eventType, handler);
return () => targetElement.removeEventListener(eventType, handler);
```

`lastTrigger` starts at `-Infinity` so the very first movement always fires. The function returns a cleanup that removes exactly the listener it added, which matters in React, where an effect has to undo itself on unmount. Before that, the listener was an anonymous arrow function, and there was no way to remove it at all. Hover, cleanup, gravity, rotation, spread and easing are all in the published 1.2.0.

## Where the burst appears

The first version placed bursts at `event.clientX` and `event.clientY`. Those are viewport coordinates, and the container is positioned absolutely in the document, so on any scrolled page the burst appeared too high, by exactly the scroll distance. Switching to `pageX` and `pageY` fixed that two days in.

The repository goes one step further. A keyboard user pressing Enter on a button fires a `click` too, but with no pointer: `detail` is 0 and the coordinates are 0, which would put the burst in the top-left corner of the page. The repository code, not yet on npm, recognises that case and centres the burst on the element:

```js
const bounds = event.detail === 0 && event.clientX === 0 && event.clientY === 0
  ? (event.currentTarget?.getBoundingClientRect?.() ?? event.target?.getBoundingClientRect?.())
  : null;
```

It also falls back to client coordinates plus the scroll offset when a caller passes an object without `pageX`, so a hand-built event still lands somewhere sensible instead of at `undefinedpx`.

## Server rendering, twice

On 12 February 2025 a commit called "fixing SSR bug" added a check for `document`, and the next day another added a check for `window` as well, because Next.js renders components on the server, where neither exists. That made `addPizzazz` safe to import and call during a server render. Or it nearly did.

The published signature was `addPizzazz(target = document, options = {})`. A default parameter is evaluated while the arguments are being bound, before the first line of the function body runs. So calling `addPizzazz()` with no target on the server reads `document` and throws, and the guard inside the function never gets its turn. The repository fixes it by resolving the default after the check:

```js
export function addPizzazz(target, options = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};
  const { trigger = 'click', ...effectOptions } = options;
  const targetElement = target || document;
```

A test runs in Jest's Node environment, where `document` does not exist, and calls `addPizzazz()` with no arguments, checking it returns a cleanup that can be called safely.

## The default export that was only in the types

A run of commits over the same two days went back and forth on a default export: added to the type declarations, made the main declaration, moved, moved back, and added to the package's `exports` map and then removed again, while I tried to make Next.js's dynamic imports happy. The type file ended up declaring `export default addPizzazz`. The JavaScript never had one. TypeScript users could write `import addPizzazz from '@unicorn-poo/pizzazz'`, get no error, and then receive `undefined` at runtime.

The repository now exports it for real, so the declaration and the code agree:

```js
// Matches the existing TypeScript declaration, alongside both named exports.
export default addPizzazz;
```

The CommonJS build sets `exports: 'named'` so both the named functions and the default survive in that format too. This is not in 1.2.0 yet.

## Quieter for people who ask for it

In the repository, `createClickEffect` checks for reduced motion before it creates anything:

```js
if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
```

If someone has asked their system to reduce motion, there are no particles and no removal timers at all, rather than a shorter or softer burst. The effects are decoration, so leaving them out takes nothing away. Each burst container is also marked `aria-hidden="true"`, so a screen reader does not announce a row of hearts after every click. Both changes are unpublished.

## The playground

The playground started as a page with its own inline copy of the library, added so the demo would deploy. Inline copies drift: change the library and the demo still shows the old behaviour. Rollup now builds two things from the same config, the package and `demo/bundle.js`, and the demo imports straight from `src/index.js`. What you see in the playground is the code in the repo.

The playground generates the snippet for whatever you have configured, and only includes options that differ from the defaults, so the code you copy is as short as it can be. Values are written with `JSON.stringify`, which means a custom character containing quotes, backslashes or a line break still produces valid JavaScript. The two size sliders cannot cross:

```js
export function updateSizeRange(range, index, value) {
  const next = [...range];
  next[index] = value;
  if (next[0] > next[1]) next[1 - index] = value;
  return next;
}
```

Drag the minimum past the maximum and the maximum moves with it, so the snippet never contains a range that runs backwards. Copying waits for the clipboard promise and reports honestly if it fails.

## Light and dark

The playground follows the visitor's system setting, with a dark scheme described in the stylesheet as "the same studio after hours": the same tokens, redefined under `prefers-color-scheme: dark`. Dark backgrounds also exposed a rendering problem in the library itself. The compositing layer behind each particle could show through as a faint background behind the emoji. The repository sets `background: transparent` and `line-height: 1` on every particle span so there is nothing to show through. That fix came just after 1.2.0 was published, so it is in the repo and not yet on npm.

## What it taught me

Pizzazz is about a hundred and forty lines, and it taught me more about publishing than any big project. A package lives inside code I will never see: server renders, scrolled pages, keyboards, TypeScript projects that trust my declarations. Every fix here came from one of those places. It also taught me that CSS already has a good animation engine, and a burst that feels alive can be nothing more than a random angle, a minimum radius and a curve that goes ten per cent too far.
