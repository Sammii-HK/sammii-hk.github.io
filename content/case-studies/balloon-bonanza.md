---
title: "Balloon Bonanza"
description: "A physics playground of up to 100 balloons that drift, bounce, wobble at the knot and can be flung across the room"
techStack: "React, TypeScript, Matter.js, Vite"
---

## The problem

Matter.js is a 2D rigid-body engine built for things that fall, stack and collide. Out of the box, a balloon in it behaves like a rubber ball: it drops to the floor and sits there. I wanted a room of them that drift down slowly, bounce like something full of air, trail a knot that wobbles, and fly when you grab one and throw it. None of the "balloon" feeling is built in. All of it is tuning, plus a few structural decisions that make the tuning possible.

You can play with it at [balloon-bonanza.vercel.app](https://balloon-bonanza.vercel.app). The physics gets a full write-up, with the maths, in [Balloons without buoyancy](/blog/balloons-without-buoyancy/).

## Where it started

The first commit, in March 2025, carried four experiments alongside the version that shipped, in files numbered `page0` to `page4`. They are the clearest record of what I tried.

`page0` made each balloon a compound body, a circle and a triangle fused into one rigid shape:

```ts
const balloon = Body.create({
  parts: [balloonBody, knot],
  inertia: 5.0,
  friction: 0.05,
  angularDamping: 0.05, // Lower damping for more natural spin retention
  torque: initialSpin,
});
```

It had a restitution of 3.5, air friction of 0.5, and a `collisionStart` handler that caught balloons near the floor and set their vertical velocity by hand, multiplied by -1.5. I was writing the bounce myself instead of letting the engine do it. And a welded knot can never move on its own, which is exactly what made it look dead.

The other experiments split the knot into its own body with a single pin. `page2` used a pin stiffness of 0.7, restitution of 1, almost no air friction, and reached into the engine's internals so that almost every contact would be treated as a bounce rather than a resting contact:

```ts
Matter.Resolver._restingThresh = 0.000001;
```

`page3` tried a pin with stiffness 1 and damping 0.1, and is the first of them with gravity at 0.11. `page4` introduced the spawn nudges that are still in the code today, alongside a pin with a length of -2 and an option spelt `dampening: 0.5`. Matter's property is called `damping`, so that line did nothing at all. It is a useful reminder that a misspelt option in a plain-object API fails silently.

The version that shipped as the MVP put a hundred balloons on screen, each held by three constraints instead of one, with densities, restitution and air friction that have not changed since. The component was called `BalloonPop` and kept a `poppedBalloons` set that was created and cleared but never added to. Popping was an idea that never got built, and I am happy it stayed a playground.

There were palettes too. Three are still commented out in that first file: twelve named pinks, purples and turquoises, twenty pastel hex values, and twenty pale named colours, before I settled on twenty saturated ones from `deepskyblue` to `magenta`.

## Two bodies, three constraints

The balloon is a circle with a radius of 30, and the knot is a separate triangle with a radius of 5. Three constraints join them:

```ts
const constraints = [
  Constraint.create({ bodyA: body, bodyB: knot, pointA: { x: 0, y: 33 },
    pointB: { x: 0, y: -4 }, length: 0, stiffness: .1, render: { visible: false } }),
  ...[-10,10].map(x => Constraint.create({ bodyA: body, bodyB: knot,
    pointA: { x, y: 33 }, pointB: { x, y: -14 }, length: 10, stiffness: .01,
    render: { visible: false } })),
];
```

The zero-length pin holds the knot at the base of the balloon. On its own it would be a hinge, so the two side springs, 10 px either side and a tenth as stiff, keep the knot pointing down while still letting it swing. Because the knot is around a hundredth of the balloon's mass, it takes nearly all of every correction, so the balloon carries on and the knot trails. With 100 balloons the world holds 200 moving bodies and 300 constraints, and the test suite checks exactly that.

## The knot rendering

The knot is drawn by Matter's own renderer, in the same colour as its balloon, with all three constraints hidden. The shape comes from two numbers. A triangle from `Bodies.polygon(x, y + 33, 3, 5, ...)` is rotated by `angle: Math.PI + .523`, which leaves one corner pointing up into the balloon and a flat edge facing down. The pin anchor sits 33 px below the balloon's centre and 4 px above the knot's, so at rest the knot hangs 37 px down. It spawns at 33, and the first couple of steps pull it into place.

## Tuning the float

The float is three numbers working against each other:

```ts
engine.gravity.y = .11;
// per balloon
density: .02 + random() * .01, restitution: .95, frictionAir: .01
```

The old version of this page said low density made the balloons fall slowly. It does not. Matter adds gravity as a force proportional to mass, so mass cancels and every balloon falls at the same rate. What makes them float is gravity at 0.11 instead of the default 1, and an air friction that removes 1% of velocity each step. Those two balance at a terminal speed of about 3 px a step, which a falling balloon approaches gradually and never exceeds. Density decides something else: the heaviest balloons are half as heavy again as the lightest, so collisions between them are uneven.

Each balloon also spawns with `torque: 30 * (random() - .5)` and a sideways `force` of `3 * (random() - .5)`. Matter clears forces after every step, so these are a single kick, and the room is already drifting and spinning on the first frame.

## Restitution and the room

Every balloon and knot has a restitution of 0.95, close to perfectly elastic. Matter uses the higher of the two values in a collision, so even the side walls, which keep the default of 0, return a 0.95 bounce.

```ts
walls = [
  Matter.Bodies.rectangle(nextWidth / 2, nextHeight + 10, nextWidth + 40, 20,
    { isStatic: true, friction: .05, frictionStatic: .25, restitution: .95 }),
  Matter.Bodies.rectangle(-10, nextHeight / 2, 20, nextHeight * 3, { isStatic: true }),
  Matter.Bodies.rectangle(nextWidth + 10, nextHeight / 2, 20, nextHeight * 3, { isStatic: true }),
];
```

The floor's top edge sits exactly on the bottom of the canvas. The side walls are three scene heights tall, so they reach a full height above the top, and there is no ceiling. One honest note: static friction takes the higher value too, and balloons keep Matter's default of 0.5, so the floor's `frictionStatic: .25` never actually applies. It has been in the code since the first version.

## The grab and the throw

The mouse constraint runs at a stiffness of 0.05, half Matter's default:

```ts
const grab = MouseConstraint.create(world.engine, {
  mouse, constraint: { stiffness: .05, render: { visible: false } } });
```

A soft constraint means the balloon trails the pointer instead of snapping to it. That trailing builds up velocity, and when you let go the balloon keeps it, which is what turns a flick into a throw. Grabbing a balloon or its knot also selects it, through Matter's `startdrag` event, so mouse and keyboard play share one idea of which balloon is yours.

Matter's `Mouse` listens for the wheel and calls `preventDefault`, which would stop the page scrolling over the canvas. The playground does not use the wheel, so it hands scrolling back:

```ts
// Wheel input is not used by this playground; keep normal page scrolling.
render.canvas.removeEventListener('wheel', mouse.mousewheel);
```

## Keyboard play and the selected ring

The playground is focusable. Left and right choose a balloon, wrapping round at either end, up gives it a lift, and Space pauses. The same actions are buttons below, and an `aria-live` output reads "Balloon 01 of 100". The canvas itself is hidden from assistive technology; the focusable playground region carries the label and points to the keyboard instructions.

The lift is a real force, not an animation:

```ts
export function liftBalloon(balloon: Balloon) {
  Matter.Body.applyForce(balloon.body, balloon.body.position,
    { x: 0, y: -balloon.body.mass * .018 });
}
```

The selected balloon gets a dashed ring, drawn after Matter renders each frame:

```ts
context.setLineDash([4,4]);
context.beginPath();
context.arc(body.position.x, body.position.y, 36, 0, Math.PI * 2);
context.stroke();
```

The ring's colour changes with the theme, so it stays visible on both skies.

## Pause, one step and reduced motion

Pause is a real pause. It stops Matter's runner and renderer and draws one still frame. One step only works while paused, and advances the engine by exactly the interval the runner uses:

```ts
step() { if (!running) { Engine.update(world.engine, 1000 / 60); draw(); } },
```

A lift while paused also takes one step, so you can see it happen. The scene pauses when the tab is hidden and resumes when you come back. If you prefer reduced motion it starts paused, and if that preference switches on mid-visit it pauses then. That pause never ends by itself; only Play starts it again.

## Light and night sky

The theme follows `prefers-color-scheme` from the first render and keeps listening, so changing the system setting changes the sky live. Choosing a sky yourself sets a flag, and from then on your choice wins:

```ts
const onColor = (event: MediaQueryListEvent) => { if (!manualTheme.current) setDark(event.matches); };
```

The page colours are CSS custom properties switched by a `data-theme` attribute. The canvas cannot read CSS, so the scene gets a `theme` call that sets the renderer's background and the ring colour, then redraws once, which matters when the scene is paused.

## Resizing without rebuilding

The original version read `window.innerWidth` and `window.innerHeight` once and filled the window. If the window changed size, the walls stayed where they were. The released version sits in a page and watches its container with a `ResizeObserver`. A resize replaces the three walls, resizes the renderer, and clamps each balloon inside the new room:

```ts
const delta = { x: x - balloon.body.position.x, y: y - balloon.body.position.y };
Matter.Body.translate(balloon.body, delta);
Matter.Body.translate(balloon.knot, delta);
```

Moving the balloon and knot by the same amount means no constraint is stretched by a window change, and a test checks the knot's offset is identical before and after two resizes.

Choosing 25, 50 or 100 balloons is the one change that does rebuild. The count is part of the effect's dependencies, so React disposes the old scene and creates a new one. Disposal is careful: Matter's `Mouse.create` attaches its own DOM listeners, and clearing its event data does not remove them, so the scene removes each one by name before clearing the world.

## Two small engineering choices

The physics lives in its own file and takes a random function as a parameter, `random = Math.random`. The tests pass a fixed function instead, so they can check exact stiffness values, body counts and the effect of a lift on a real engine step.

The installed type declarations are for Matter 0.19, while the runtime is 0.20. Where the newer runtime has something the types do not, such as `Render.setSize`, the code says so in a comment and casts in that one place, instead of loosening the types everywhere.

## What I chose not to build

I did not model buoyancy. A real buoyant force is the weight of displaced air, `F = ρ_air · V · g`, minus the balloon's own weight. In still air that reduces to a smaller gravity for each body, which a global gravity of 0.11 already gives me, without inventing an air density in pixel units. What you feel in the playground is timing: how long a fall takes, how a bounce fades, how quickly a throw slows. Gravity, air friction and restitution control those directly. The page says so plainly: tuned rigid-body physics, not a buoyancy model.

## Outcome

Balloon Bonanza is a small thing with a lot of tuning underneath it: up to a hundred balloons that drift, jostle, wobble at the knot and can be flung around, in a room that resizes, pauses honestly and can be played from the keyboard. It started as an excuse to learn Matter.js properly. What it taught me is that most of the feel lives in a handful of numbers, and that it is worth reading the engine's source to find out what those numbers actually do: density does not slow a fall, the higher restitution wins, and a misspelt option is silently ignored.
