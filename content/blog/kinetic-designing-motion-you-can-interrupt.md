---
title: 'Kinetic: designing motion you can interrupt'
description: 'What 25 interactive animation studies reveal about springs, gestures, identity, interruption and the work needed to turn a polished effect into a usable component.'
draft: true
date: '2026-11-20'
tags: ["design-engineering", "animation", "react", "interaction-design"]
lab_url: 'https://kinetic.sammii.dev'
---

An animation can look excellent in a recording and become annoying the moment someone uses it. The recording has one carefully chosen beginning and end. A person clicks twice, changes their mind halfway through, drags in the wrong direction, and expects the interface to keep up.

[Kinetic](https://kinetic.sammii.dev) is my collection of 25 interactive animation studies built with Next.js and Framer Motion. It includes springs, swiping cards, shared layouts, SVG shapes, a floating dock, notifications and scroll effects. Each study isolates a behaviour you can provoke rather than simply watch.

The interesting question across the collection is what survives interruption. Does an object still feel like the same object? Does it respond to the latest intent? Can you get the same outcome without performing a precise gesture? Those questions turn motion from decoration into interface design.

## Use the gallery badly on purpose

Start with **Spring Physics**. Drag the ball away from its centre and release it. Reduce damping and repeat. Then raise mass while leaving the other controls alone. The point is to feel how changing a parameter changes the response, rather than memorise a supposedly perfect set of values.

Next, press **Shuffle** repeatedly in **Layout Shuffle**. Pick one colour and follow it. Click a tile to expand it, then close the expansion. The [implementation gives each tile a stable identifier](https://github.com/Sammii-HK/kinetic/blob/main/app/components/LayoutShuffle.tsx), and uses that identity to connect the small tile with the expanded version.

Finally, compare two ways of dismissing a **Gesture Card**: a long, slow drag and a short, fast flick. Both can express the same intention, but they leave different measurements behind. An interaction that only watches distance misses the flick; one that only watches speed can make deliberate slow movement frustrating.

These small experiments reveal more than replaying an entrance animation. They expose the decisions made when the user's action does not match a tidy storyboard.

## A spring has a target, not a timetable

Kinetic's spring playground starts with stiffness `200`, damping `20` and mass `1`. It keeps pointer positions in motion values, then uses springs to follow them. On release, the target returns to the centre. The [source](https://github.com/Sammii-HK/kinetic/blob/main/app/components/SpringPlayground.tsx) makes the distinction between the target and the displayed position quite literal.

For the standard damped-spring model, stiffness controls the restoring force, damping opposes velocity, and mass changes the response to those forces. Their relationship matters. The damping ratio is `c / (2 * sqrt(k * m))`; increasing mass without changing damping also changes the kind of response you get.

You do not need to solve the differential equation every time you animate a panel. You do need to stop treating the three numbers as independent labels for “speed”, “bounce” and “weight”. A change to one can alter the effect of the others.

Motion's [`useSpring` documentation](https://motion.dev/docs/react-use-spring) describes a value that moves towards its latest target. That is useful for an interface because a new target can arrive before the old movement finishes. The current state becomes part of the next response.

Here is a minimal React example of the same idea. It uses the `framer-motion` package used by Kinetic, and provides buttons so the experiment can be operated without dragging. This is a teaching component, not a copied Kinetic demo.

```tsx
'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function InterruptibleMotion() {
  const [target, setTarget] = useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <section aria-label="Interruptible spring experiment">
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setTarget(0)}>Move left</button>
        <button onClick={() => setTarget(180)}>Move right</button>
      </div>
      <div style={{ height: 80, paddingTop: 20 }}>
        <motion.div
          aria-hidden="true"
          animate={{ x: target }}
          transition={reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 200, damping: 20, mass: 1 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#2563eb',
          }}
        />
      </div>
      <p>Target: {target === 0 ? 'left' : 'right'}</p>
    </section>
  );
}
```

Press the opposite button before the dot settles. Then enable reduced motion in your operating system and repeat. The target state remains understandable even when the travel is removed. That is a useful property to establish early.

## Identity does more work than an easing curve

The layout studies ask a different question. When a grid reorders, which new rectangle corresponds to which old rectangle?

Stable React keys preserve component identity. Motion's `layout` and `layoutId` features add visual continuity between measured layouts or related elements. In Kinetic's shuffle study, `tile-0` remains `tile-0` after the array order changes. It does not become whatever happened to occupy position zero.

This matters because an animation cannot communicate continuity if the application has discarded the relationship it is supposed to show. Index-based keys in a changing list can attach the wrong local state to a new position. A pleasing transition can make that error harder to spot rather than fix it.

The animated tabs study makes a smaller use of the same idea. Its active indicator shares a layout identity as the selected button changes, so the highlight appears to move between choices. The content panel has its own transition. The [source separates those two visual jobs](https://github.com/Sammii-HK/kinetic/blob/main/app/components/AnimatedTabs.tsx).

Motion's [layout animation guide](https://motion.dev/docs/react-layout-animations) is the useful reference here. In a product, the accompanying decisions still belong to you: where focus goes, whether an expanded element behaves as a dialog, and what happens if its underlying item disappears during the transition.

## A gesture is evidence of intent

Kinetic's swipe cards dismiss when the horizontal velocity exceeds 300 pixels per second **or** the total horizontal offset exceeds 120 pixels. That rule is visible in [GestureCards.tsx](https://github.com/Sammii-HK/kinetic/blob/main/app/components/GestureCards.tsx).

Reduced to a pure function, the decision is easy to inspect:

```js
function shouldDismiss(offsetX, velocityX) {
  return Math.abs(offsetX) > 120 || Math.abs(velocityX) > 300;
}

console.assert(shouldDismiss(130, 20));   // Long, slow drag.
console.assert(shouldDismiss(15, 450));   // Short, fast flick.
console.assert(!shouldDismiss(50, 100));  // Small adjustment.
```

Those numbers describe this demo, not a universal interaction standard. A narrow card on a phone, a large desktop panel and a sensitive destructive action should not inherit them unquestioned.

The more interesting design work begins at the boundaries. What if the user drags right, then flicks left just before release? Which measurement determines direction? What if the gesture begins as vertical scrolling? What if dismissal removes something valuable?

A product version should define those cases explicitly, give people a visible alternative action, and provide undo where the consequence warrants it. Physics can make a card move convincingly; it cannot decide what deleting the card should mean.

## A gallery is not a component library

The collection includes hover effects, drag interactions and clickable surfaces that are useful for studying movement. Shipping those studies as reusable product components needs another layer of work.

An animated tab row needs an appropriate keyboard and focus model. A reorder interaction needs an alternative to dragging. A card that expands on click needs a real control with a meaningful label. A toast needs readable content and a dismissal policy that does not disappear before someone can use it.

Reduced motion is part of that work. Motion offers `MotionConfig` and `useReducedMotion`, documented in its [accessibility guide](https://motion.dev/docs/react-accessibility). They help adapt movement, but do not replace semantic HTML or keyboard behaviour. The little component above removes travel while preserving the selected target; a parallax scene may need a different static composition altogether.

I would judge each effect by the information it contributes. The sliding tab indicator can explain a change of selection. A cursor trail mostly adds atmosphere. That distinction helps decide which movements deserve a reduced version and which can simply disappear.

## Measure the cost of the effect you actually built

Twenty-five studies also make an easy trap visible: “animated” is not one category of rendering work. Moving a transform, changing a blurred surface, updating a gradient and redrawing SVG paths ask different things of the browser.

A good investigation isolates one study at a time. Record a short interaction in browser performance tools, then compare it with the effect disabled. Look for long tasks, repeated layout, paint work and dropped frames. Use a slower device as well as the machine you built it on.

The useful unit is the whole interaction. A transition that looks smooth while idle may stutter when a real application is fetching data, updating text and processing input. Likewise, a page full of simultaneous demos is a harsher workload than one restrained effect inside a product.

There is no need to turn every experiment into an optimisation project. The purpose is to learn what the visual choice costs before making it a default across an interface.

## Keep the response, lose the ceremony

Kinetic is most useful when you stop admiring it and start interrupting it. Change the sliders mid-experiment. Shuffle before the last shuffle finishes. Flick a card barely any distance. Switch tabs rapidly and follow the indicator.

The motion that remains clear under those conditions is worth studying. It acknowledges the latest action, preserves identity where it matters and leaves the final state legible. That is the part I want to carry from a playful gallery into an actual product.

[Explore all 25 Kinetic studies](https://kinetic.sammii.dev) · [Read the source](https://github.com/Sammii-HK/kinetic) · [Compare easing and springs in the chart](https://labs.sammii.dev/charts/springs/)
