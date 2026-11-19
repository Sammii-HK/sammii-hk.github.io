---
title: "One point, three inputs"
description: >-
  Most interactive UI answers to a mouse and goes quiet for everyone else. An
  interactive essay on building components that answer to attention instead,
  whether it comes from a cursor, a finger or the keyboard, with live demos
  you can try as you read.
date: '2026-11-17'
tags:
  - design-engineering
  - accessibility
  - motion
  - design-systems
---

Most interactive interfaces are built for a mouse. Hover states, cursor glows, things that lean towards the pointer: they're lovely when you have one. On a phone they do nothing, or worse, they get stuck "hovered" after a tap. With a keyboard they don't exist. And with reduced motion switched on, the usual fix is to turn the whole thing off, so the people who asked for less movement also get less of everything else.

While building [Prism](/projects/prism/), my component library, I ended up with a different rule: **components should answer to attention, not to the cursor.** Attention can come from three places, and the interface shouldn't care which one it is. This essay is that idea in four parts, and each part has something you can try.

## Attention, not the cursor

Here's the rule in its simplest form. Nine tiles, each glowing with how close the attention point is. Move a mouse over them. On a phone, tap. With a keyboard, click into the box and press Tab.

<AttentionField />

There's only one attention point, and three ways to move it:

- **Cursor:** the point follows the mouse.
- **Touch:** the point follows your finger, then lets go about 0.7 seconds after you lift it. A tap glows and settles, instead of leaving a hover state stuck on the screen.
- **Keyboard:** when focus moves by keyboard, the point jumps to the centre of the focused element, so tabbing through the page lights it up the way a cursor would. A mouse click that happens to move focus doesn't count, so clicking a button doesn't yank the glow away from your pointer.

The important part isn't the glow. It's that the components never see the input. They subscribe to one shared source and get `{ x, y, kind }`. Before this, every component in Prism bound its own `pointermove` listener and none of them worked with a keyboard. After it, more than twenty components gained touch and keyboard behaviour without a single line of per-component input code.

The colour works the same way. Every colour in Prism comes from one function that maps a point on the page to a soft pastel. The tiles above are sampling it right now. Because there's one source of attention and one source of colour, components built months apart can't disagree with each other.

## Springs are tuned, not configured

Everything that moves in Prism runs on a spring, not a CSS transition. The spring itself is three lines, run once per frame:

```ts
velocity += (target - position) * stiffness;
velocity *= damping;
position += velocity;
```

The interesting part is the two numbers. Try them:

<SpringLab />

A CSS ease arrives and stops. A spring arrives with momentum: a little overshoot, a settle. That's the difference between something that animates and something that feels like it has weight. It also means a spring can be interrupted mid-flight and simply head for the new target, which a transition can't do without snapping.

Most of Prism's springs overshoot by two or three pixels. Less feels dead; more feels like a toy. There's no formula for that number. Every component's stiffness and damping were tuned by eye, by moving the thing over and over until it felt right, and that tuning is the part of the work I'm most protective of.

## Precision doesn't spring

So should everything spring? No. Try setting both of these to exactly 42.

<PrecisionTest />

The springy slider is lovely to watch and miserable to use. The value lags your hand, overshoots, and lands wherever the thumb happens to be when you let go. That's the line I draw: **springs are for feedback, never for a value you're setting.** A toggle settling, a tab indicator arriving, a panel opening: spring. A slider thumb, a curve point in a photo editor, a colour picker: exactly where you put it, by pointer or by arrow key.

It's an easy rule to break, because springy controls demo beautifully. It's also the rule that decided what stayed in Prism. A magnetic button that lunges at your cursor means you never click where you aimed, so it's not in Prism any more. It lives in [chaos-components](https://github.com/Sammii-HK/chaos-components), with the tooltip that chased the pointer and the text shimmer that never stopped.

## Reduced motion means still, not broken

The last part is about people who ask the operating system for less movement. The common response is a media query that switches the animation off. Often that switches the feature off with it.

Prism reads the reduced-motion setting every frame, so it can change mid-animation, and it treats the setting as an instruction about motion only. Try it:

<ReducedMotionDemo />

With reduced motion on, the switch still switches, but it snaps instead of springing. The pulse stops. The glow still follows you, because responding to you isn't motion; drifting on its own is, so that stops too. Nothing is hidden and nothing is disabled. The interface is just still.

## What this adds up to

None of this is visible in a screenshot, which is sort of the point. A screenshot can't tell you whether a component works with a keyboard, whether a tap leaves it stuck, whether a slider lands where you meant, or what it does with motion off. Those are the details that separate a component that demos well from one that holds up in a product.

So Prism proves itself in products: a [photo darkroom](https://prism.sammii.dev/showcase/darkroom) with a keyboard-first tone curve, a [release console](https://prism.sammii.dev/showcase/console), and a [synthesiser](https://prism.sammii.dev/showcase/synth) whose filter pad glows the colour of the sound. All three are built only from these parts, and all three work with a mouse, a finger or a keyboard.

One point, three inputs. The rest is tuning.
