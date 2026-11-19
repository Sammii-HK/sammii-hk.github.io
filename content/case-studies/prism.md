---
title: "Prism"
description: "A small design system where every component answers to attention, whether it comes from a cursor, a finger or the keyboard"
techStack: "Next.js, React, TypeScript, requestAnimationFrame springs, Web Audio"
---

## The problem

Most "animated" component libraries are a set of effects. Each component tracks the cursor in its own way, animates on its own timing and assumes a mouse. Put three of them on a page and their colours fight, and with a keyboard or a phone half of them do nothing at all.

[Prism](https://prism.sammii.dev) is the opposite approach: a small design system with one idea running through it. Every component reacts to where your attention is, and attention can come from a cursor, a finger or keyboard focus. The colour, the motion and the accessibility are shared layers underneath the components, not features of each one.

## The layers

### One colour function

Every colour in Prism comes from `pastelColour(x, y, t)`, which maps a point on the page to a soft RGB value, floored so nothing goes muddy. Borders, glows, fills, the tab indicator and even the tone picker in the Darkroom demo all sample it. That's what makes components built months apart look like one system: they can't disagree about colour, because there is only one source.

### One attention point

Originally every component bound its own `pointermove` listener. That was wasteful, and it meant nothing responded to the keyboard or to touch. I replaced it with a single shared attention source:

- **Cursor:** the point follows the mouse.
- **Touch:** the point follows a finger, then releases a moment after it lifts, so a tap glows and settles instead of leaving a hover state stuck on the screen.
- **Keyboard:** when focus moves by keyboard, the point jumps to the centre of the focused element. Tabbing through a page lights components up the way the cursor does. Mouse clicks that happen to move focus don't count.

Components subscribe to that one source. Every one of them gained touch and keyboard behaviour without any per-component input code.

### Motion that can be switched off properly

All motion runs on `requestAnimationFrame` springs, with stiffness and damping tuned by eye per component, never CSS transitions. A shared reduced-motion layer reads the user's setting every frame: springs snap to rest, ambient loops stop on their resting frame, and the colour stops drifting on its own but still follows you. Reduced motion means nothing moves, not that everything breaks.

### Real controls underneath

The visual layer sits on top of proper semantics. The select is a full ARIA combobox with arrow keys, Escape and type-ahead. The slider is a real slider with Page Up, Page Down, Home and End. The tabs are a roving-tabindex tab list. Tooltips open on focus and close on Escape. Small text meets WCAG AA contrast.

### Docs that can't drift

Each component page shows usage examples and a props table generated at build time from the component's own source: its JSDoc `@example` blocks, its props interface and its default values. Nothing is copied into a separate docs file, so the docs can't fall out of date with the code.

## Decisions

### Precision doesn't spring

Springs are for feedback: a toggle settling, a tab indicator arriving. They're never for a value you're setting. A curve point or a slider thumb goes exactly where you put it. A value that lags behind your hand feels lovely in a demo and is miserable in a tool.

### Cutting what didn't work

Prism started as an experiment: a component a day. Some of what came out of that was fun and unusable. A magnetic button that lunges at your cursor means you never click where you aimed. A tooltip that chases the pointer can't be read. A text shimmer that loops forever is a screensaver.

I moved those out to [chaos-components](https://github.com/Sammii-HK/chaos-components) and replaced the ones still in use with calm versions: an anchored tooltip, a ripple button. Prism keeps only what you can actually use. Knowing what to remove is part of the craft.

### Changing behaviour without touching the tuning

The attention and reduced-motion retrofit touched more than twenty components whose spring and colour values were tuned by eye. Before merging, every removed line was checked for numbers, and the only ones that disappeared were unit conversions that moved into the shared layer. The feel didn't change. Only who it works for did.

## Proven in products

Components only prove themselves in use, so Prism ships with three working [showcase](https://prism.sammii.dev/showcase) apps built only from its own parts:

- **Darkroom:** grades a black and white photograph for print and t-shirt, with a keyboard-first tone curve and split-toning picked from Prism's palette. It reuses the curve maths from [ScapeStudio](/projects/scapestudio/).
- **Release console:** a deploy pipeline with honest slow and failed states, streaming logs, rollback, feature flags and a command bar.
- **Synth:** an eight-voice Web Audio synthesiser with a filter pad whose glow is the colour of the sound.

## Outcome

Twenty-six components and three applications, every one of them usable with a mouse, a finger or a keyboard, and still with reduced motion on. Browse it at [prism.sammii.dev](https://prism.sammii.dev).
