---
title: "Balloons without buoyancy"
description: >-
  The physics under Balloon Bonanza: a circle and a knot joined by three constraints, gravity at 0.11, one per cent of air resistance a step, and why a tuned rigid-body simulation felt more like a balloon than a buoyancy model would have.
date: '2026-11-23'
tags:
  - creative-coding
  - design-engineering
  - physics
  - animation
  - typescript
draft: false
---
Balloon Bonanza is a room of balloons you can grab and throw. It lives at [balloon-bonanza.vercel.app](https://balloon-bonanza.vercel.app), and the story of building it is on the [project page](https://sammii.dev/projects/balloon-bonanza/). A note under the playground calls it "tuned rigid-body physics, rather than a buoyancy model". This post explains that sentence properly.

Every number here comes from the released source, or from the Matter.js 0.20 it runs on. Where I describe behaviour over a number of steps, I ran a balloon through `Engine.update` in Node and read the values back.

## Two bodies, three constraints

A balloon is not one shape. It is a circle with a radius of 30 and a small triangle for the knot, and they are separate bodies:

```ts
const body = Bodies.circle(x, y, 30, { density: .02 + random() * .01,
  restitution: .95, frictionAir: .01, friction: .12, /* … */ });
const knot = Bodies.polygon(x, y + 33, 3, 5, { restitution: .95,
  friction: .02, density: .02 + random() * .01, frictionAir: .014,
  angle: Math.PI + .523, /* … */ });
```

The angle turns the triangle so one corner points up into the balloon and a flat edge faces down. Then three constraints tie the two together:

```ts
Constraint.create({ bodyA: body, bodyB: knot, pointA: { x: 0, y: 33 },
  pointB: { x: 0, y: -4 }, length: 0, stiffness: .1 }),
...[-10,10].map(x => Constraint.create({ bodyA: body, bodyB: knot,
  pointA: { x, y: 33 }, pointB: { x, y: -14 }, length: 10, stiffness: .01 })),
```

The first is a pin: a point 33 px below the balloon's centre and a point 4 px above the knot's centre should be in the same place. A pin on its own is a hinge, so the knot would spin freely around it. The two side constraints sit 10 px either side, want to be 10 px long, and have a tenth of the stiffness. They are what keeps the knot pointing down, loosely.

## What a constraint actually does

A constraint in Matter is a rule about the distance between two points. Matter does not calculate a force for it. Every step, the engine measures how far the two points are from where the rule wants them and moves both bodies part of the way back. Stiffness is that fraction.

The correction is shared by inverse mass, so the lighter body moves more. Matter builds the circle as a 26-sided polygon with an area of about 2,800 square pixels, which at a density of 0.02 to 0.03 gives a mass of 56 to 84. The knot comes out at 0.65 to 0.97. So the knot takes about 98.9% of every correction, and the balloon barely notices it is attached to anything.

It is also iterative. Each constraint is solved in turn using positions the previous one has just changed, so one pass never lands exactly. Matter runs two passes by default, and it runs that pair twice in every step, once before collisions are resolved and once after. Four passes a step.

In numbers: with the pin at 0.1, each pass leaves 90% of the gap, so if nothing else were moving:

```
0.9 ^ 4 ≈ 0.66   the pin closes about a third of a gap each step
0.99 ^ 4 ≈ 0.96  the side springs close about 4%
```

## Why the knot lags and wobbles

The other half of the story is how Matter stores motion. It uses Verlet integration: a body's velocity is its current position minus its previous one. A constraint moves the position but leaves the previous position where it was, so every correction quietly becomes velocity on the next step.

That is a spring. The pin pulls the knot back, the knot arrives with speed, overshoots, and gets pulled back the other way. A stiffness of 0.1 means it takes several steps to catch up, which is the lag, and the soft side springs let the triangle twist while it happens, which is the wobble.

I measured it. I let one balloon settle, then set its velocity to 8 px a step sideways. Within two steps the knot was 6.7 px behind. By step five the triangle had turned about 1.65 radians, a little more than a right angle. It swung back past straight by step twelve and was back within about 0.13 radians by step thirty. For the rest of that first second it kept trailing by 2 to 3.5 px, because the knot's air friction of 0.014 slows it slightly more than the balloon's 0.01.

The knot also settles at the start: it spawns 33 px below the centre, but the pin and side springs agree on 37, so the first couple of steps pull it down.

## Gravity, air and floatiness

This is the update every body gets, simplified from Matter's `Body.update`:

```
velocity = previous velocity × (1 − frictionAir) + (force ÷ mass) × Δt²
```

Δt is 1000/60 ms, so Δt² is about 277.8. Gravity is added as a force of mass × 0.11 × 0.001, where 0.11 is the playground's setting and 0.001 is Matter's default scale. The mass cancels, which means density does not change how fast a balloon falls. Gravity adds the same 0.0306 px a step of speed, every step, to each of them.

Air friction takes 1% off each step. Put those together and speed stops growing when the two balance:

```
terminal speed = 0.0306 ÷ 0.01 ≈ 3.06 px per step
```

For a lone balloon circle my run measured 3.05 after 600 steps. Halfway there takes about 69 steps, because 0.99 to the power 69 is a half. In its first simulated second that circle falls 46 px. With Matter's default gravity of 1 and the same air friction, the same circle falls 421.

That is most of what floaty means: small acceleration, an early speed limit and a gentle curve towards it, so a balloon never looks as though it is trying hard to reach the floor. The same 1% applies to throws: 0.99 to the power 60 is about 0.55, so a flung balloon loses nearly half its speed each second from air alone.

So what does density do? It decides who wins a collision (the heaviest balloons are half as heavy again as the lightest), and how hard the spawn nudges land. Each balloon starts with `torque: 30 * (random() - .5)` and a sideways force of `3 * (random() - .5)`. Matter clears forces after every step, so these are a single kick. On the lightest balloons that is up to 7.4 px a step sideways and 0.042 radians a step of spin, and the room is moving from the first frame.

## Bounce, friction and the room

Restitution is how much closing speed comes back after a collision. When two bodies touch, Matter uses the higher of their two values. The side walls keep the default of 0, but every balloon has 0.95, so every bounce in the room is a 0.95 bounce. Matter treats contacts closing slower than 2 px a step as resting and solves them separately, and since the terminal speed is about 3, a balloon dropping at full speed still bounces properly.

Friction is combined the other way, using the lower value: 0.05 against the floor, 0.12 between two balloons. Static friction uses the higher value, and balloons keep Matter's default of 0.5, so the floor's own `frictionStatic: .25` never actually applies.

The room is three static rectangles. The floor's top edge sits on the bottom of the canvas. The side walls are just outside the edges and three scene heights tall, centred on the middle, so they reach a full scene height above the top. There is no ceiling.

## Grab and throw

The mouse constraint uses a stiffness of 0.05, half Matter's default of 0.1. It only has one body, so the balloon takes the whole correction: about 18.5% of the distance to the pointer each step. The balloon trails the cursor, and that trailing builds velocity, so when you let go it keeps going. Matter's default angular stiffness of 1 also zeroes the torque, so grabbing a balloon off-centre moves it without twisting it.

The keyboard lift is one step of upward force, mass × 0.018. Through the same formula that is 5 px a step of upward speed, about 164 steps' worth of gravity at once. In my run a balloon falling at 2.89 px a step was rising at 2.08 straight afterwards, and kept climbing for 51 steps.

## Why not real buoyancy

Real buoyancy is the weight of the air a balloon pushes out of the way. The upward force is `F = ρ_air · V · g`, and the net force is that minus the balloon's own weight. A helium balloon is lighter than the air it displaces, so the net force points up. A balloon you blow up yourself is slightly heavier, so it sinks, slowly. My balloons sink. They are the second kind.

In still, even air, buoyancy on a fully immersed body is a constant upward force. Net acceleration becomes `g · (1 − ρ_air / ρ_body)`: a smaller gravity, set per body. Gravity at 0.11 is that idea applied to the whole room at once. A proper model would let balloons of different densities fall at different speeds, or rise, but in a world measured in pixels I would be inventing the density of the air to get there. Real drag also grows with the square of speed and depends on shape. `frictionAir` is a flat percentage per step.

What you feel in the playground is timing: how long a fall takes, how a bounce dies away, how quickly a throw slows down. Gravity, air friction and restitution set those directly, with three numbers I can change and see. A buoyancy model would have produced the same three things indirectly, from quantities I would have had to make up.

## Pausing honestly

Pause stops Matter's runner and renderer and draws one frame. One step calls `Engine.update(world.engine, 1000 / 60)`, the same 1000/60 ms the runner uses, so a single step is a real step. A lift while paused also advances one step, so you can see it take effect. The scene pauses when the tab is hidden, starts paused if you prefer reduced motion, and pauses if that preference switches on mid-visit. A hidden-tab pause ends when you come back; a reduced-motion pause only ends when you press Play.

Resizing does not rebuild the scene. A `ResizeObserver` replaces the three walls, clamps each balloon inside the new room, and moves the balloon and its knot by the same amount, so no constraint gets stretched by a window change.

You can throw some balloons at [balloon-bonanza.vercel.app](https://balloon-bonanza.vercel.app).
