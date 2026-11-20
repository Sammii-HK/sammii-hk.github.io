---
title: 'Making balloons feel light with Matter.js'
description: 'How Balloon Bonanza uses two bodies, three constraints and carefully chosen motion to turn a pile of circles into a tactile physics playground.'
draft: true
date: '2026-11-20'
tags: ["creative-coding", "physics", "react", "interaction-design"]
lab_url: 'https://balloon-bonanza.vercel.app'
---

A balloon can be a circle and still look wrong. Give it the wrong movement and it becomes a bowling ball with a cheerful colour. The silhouette helps, but the convincing part happens after you touch it: how readily it moves, how it rebounds, and what its little knot does when the body changes direction.

[Balloon Bonanza](https://balloon-bonanza.vercel.app) is my small experiment in that relationship. It puts 100 balloons into a Matter.js scene and lets you grab and throw them. Each balloon has a circular body, a triangular knot and three constraints connecting the two. React owns the page and its theme button; Matter owns the moving world. You can inspect the [complete implementation](https://github.com/Sammii-HK/balloon-bonanza/blob/main/src/App.tsx).

There is a useful amount of engineering hiding inside something this silly. You have to choose what to simulate, decide which parts can cheat, and keep the interaction responsive while hundreds of objects are negotiating where they can be.

## Start by watching the knot

Open the playground, catch a balloon near the top of the scene, and move it slowly from side to side. Then give it a quick shove and let go. Follow the triangle underneath rather than the circle.

The circle gives you the main motion. The knot gives you the follow-through. If both shapes were one rigid object, their relationship would never change. With a separate knot, the connection can lag, swing and settle. A tiny amount of movement in a secondary part makes the whole thing feel less like a sticker.

Try throwing one balloon into a group as well. A collision is more informative than an idle animation: the system has to respond to a condition that was not picked in advance. The result comes from the current positions, velocities, contacts and constraints.

That is the reason to use a physics engine here. A CSS loop could make a balloon bob beautifully. It would not, by itself, decide what happens when you push it through 99 other balloons.

## Two bodies, three connections

The current source creates a circle with radius 30 and a small triangular knot below it. A central constraint joins them, while two softer constraints help control their relative orientation. This is an assembly of connected bodies, rather than a single Matter compound body.

Matter's [constraint API](https://brm.io/matter-js/docs/classes/Constraint.html) describes connections through local attachment points, a target length and a stiffness. The attachment points matter as much as the stiffness: move them away from the centres and the connection can exert a turning influence.

A minimal version of the idea looks like this. This is a teaching example for a project with `matter-js` installed, with fixed parameters and no random initial forces; it is not a verbatim copy of the full scene.

```ts
import Matter from 'matter-js';

export function createBalloon(x: number, y: number) {
  const { Bodies, Constraint, Composite } = Matter;
  const colour = '#ff5ca8';

  const body = Bodies.circle(x, y, 30, {
    density: 0.025,
    restitution: 0.95,
    frictionAir: 0.01,
    render: { fillStyle: colour },
  });

  const knot = Bodies.polygon(x, y + 33, 3, 5, {
    density: 0.025,
    frictionAir: 0.014,
    angle: Math.PI + 0.523,
    render: { fillStyle: colour },
  });

  const attachments = [-10, 0, 10].map((offset) =>
    Constraint.create({
      bodyA: body,
      bodyB: knot,
      pointA: { x: offset, y: 33 },
      pointB: { x: offset, y: offset === 0 ? -4 : -14 },
      length: offset === 0 ? 0 : 10,
      stiffness: offset === 0 ? 0.1 : 0.01,
      render: { visible: false },
    }),
  );

  const assembly = Composite.create();
  Composite.add(assembly, [body, knot, ...attachments]);
  return { assembly, body, knot };
}
```

Add `assembly` to an engine's world and let its normal runner update it. Keeping the bodies together in a composite makes them easier to manage as one logical balloon, but it does not weld them into one rigid shape.

For an experiment, change only the two outer stiffness values. Very soft connections permit more lag. Stiffer ones pull the knot back more strongly. Change several properties together and it becomes surprisingly hard to identify which one improved the feel.

## Lightness is a set of choices

The scene is stylised. It does not calculate helium density, displaced air or buoyant force. In fact, the checked-in implementation uses weak positive vertical gravity, `0.11`, alongside bouncy collisions, air friction and initial variation. Calling it a helium simulation would promise a physical model it does not contain.

That distinction is useful when tuning it. If you want a convincing toy, you can work directly on the qualities the interaction needs. If you want an explanation of buoyancy, you need a different model and meaningful physical units.

Three controls deserve separate attention:

- **Restitution** changes how much a collision rebounds. The balloon bodies use `0.95`, which gives the scene its exaggerated bounce.
- **Air friction** slows motion through the scene. Too little leaves objects drifting for ages; too much makes a throw feel reluctant.
- **Density** contributes to mass and changes responses to forces and collisions. It does not, by itself, make gravity accelerate one otherwise equivalent object more slowly.

Those are different mechanisms, even when the final impression is simply “lighter”. Matter documents the individual properties in its [body reference](https://brm.io/matter-js/docs/classes/Body.html). The practical tuning question is which part of the movement looks wrong: departure, travel, impact or settling.

For example, a balloon that moves nicely when dragged but rockets away on release may need a softer grabbing constraint. A balloon that rebounds nicely but never calms down needs attention to energy loss. Reducing everything at once tends to produce a uniformly sluggish result.

## The pointer is another connection

The playground uses Matter's mouse constraint with a low stiffness, `0.05`. That makes the pointer's grip compliant. The body is being pulled towards an attachment point rather than having its position overwritten on every mouse event.

This small choice preserves a conversation between the user's movement and the simulation. Contacts still matter. The object can lag. A quick gesture introduces a different state from a slow one.

Directly assigning coordinates can be appropriate for a drawing tool or a kinematic controller. For this scene, it would remove part of the sensation I am trying to expose. The input should influence the world through a rule the world understands.

It also suggests a useful test: move the pointer quickly through a crowded region, pause, then reverse direction. Watch for instability, excessive stretching, or objects being pushed through boundaries. A leisurely drag across empty space will miss those problems.

## React should not be the physics clock

In the implementation, the engine and renderer live in refs, and the simulation starts inside an effect. The theme has ordinary React state. Changing the theme updates the existing canvas background without rebuilding the balloons.

That division is deliberate in shape, even in a small project. The application has occasional state changes that should render interface elements. The simulation has continuous state changes that should update its own world. Routing every body position through `setState` would create work that React does not need to do.

The reverse boundary matters too. When the component leaves, the effect stops the runner and renderer, clears the world and removes the canvas. A useful lifecycle check is to mount, unmount and mount again, then verify that only one simulation is advancing. React's [effect documentation](https://react.dev/reference/react/useEffect) explains why setup and cleanup need to mirror each other, including the extra development check under Strict Mode.

For a production version, I would also treat resizing, pointer listeners and pausing as explicit lifecycle responsibilities. A canvas occupying the viewport does not automatically mean its physics boundaries keep matching a resized viewport.

## A lively scene has a budget

The code creates 200 balloon bodies and 300 internal constraints, before adding the walls and pointer connection. Those counts are more useful than an unqualified frame-rate claim. The same scene can behave differently across a laptop, a phone, a high-refresh display and a busy browser tab.

The first performance question is where time goes: solving contacts, solving constraints, drawing, or doing unrelated page work. Reduce the number of balloons temporarily and compare. Then simplify the connections. That gives you evidence about which part scales badly instead of immediately replacing the renderer.

There is also a design trade-off. The knot is a small visual detail with a real simulation cost. If the scene needed thousands of balloons, a plausible alternative would be one physical body per balloon and a decorative knot whose rotation follows the body's motion. You would lose independent knot collisions, but preserve much of the visual cue.

That is the kind of approximation I find useful: identify the effect the detail contributes, then decide whether it needs a full physical representation.

## Keep the toy available to more people

A pointer-driven canvas needs more than a theme button to become an inclusive interaction. A useful next version would offer pause and reset controls, a simple keyboard-operated nudge, a short explanation of the scene, and a reduced-motion starting state. These are proposed improvements, not features I am claiming the current experiment already has.

For a physics playground, motion carries much of the information. That makes user control more valuable, not less. Someone should be able to inspect one balloon without committing to a full screen of continuous movement. W3C's guidance on [animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) is a good reference for making that distinction thoughtfully.

The part I would keep, even if the rest became much more elaborate, is the directness: pick something up and immediately feel the rules. A circle, a triangle and a few connections are enough to turn a physics engine into an object you understand with your hand.

[Play with Balloon Bonanza](https://balloon-bonanza.vercel.app) · [Read the source](https://github.com/Sammii-HK/balloon-bonanza)

## Read this as a series

This article is part of **Motion: from a curve to something you can interrupt**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Try the live [easing and springs comparison](https://labs.sammii.dev/charts/springs/), then [Kinetic](https://kinetic.sammii.dev) and [Liquidity](https://liquidity-ten.vercel.app). They put different demands on motion: retargeting, physical constraints and a convincing visual surface.
