---
title: "Balloon Bonanza"
description: "A physics playground where 100 balloons float, bounce, and can be flung across the screen"
techStack: "React, TypeScript, Matter.js, Vite"
---

## The problem

Matter.js has no concept of "up". It's a 2D rigid-body engine built for things that fall, stack, and collide, and out of the box a balloon in it behaves like a rubber ball: it drops to the floor and sits there. Getting 100 of them to instead drift, settle slowly, bounce like something full of air, and fling convincingly when you grab and throw one meant fighting the engine's default instincts on every axis. None of the "balloon" feeling is built in. All of it is tuning.

## Faking buoyancy

Real buoyancy isn't a Matter.js primitive, so the float had to be assembled from three parameters pulling against each other. World gravity runs at 0.11 instead of the default 1.0, so balloons barely fall. Each balloon body gets a low density (around 0.02 to 0.03) and a small amount of air friction (frictionAir around 0.01), so instead of dropping and bouncing hard it drifts down slowly and settles. Balanced right, the combination reads as a thing that's lighter than air even though the engine has no idea what air is. Getting that balance to feel like a balloon rather than a slow rock, or a thing that never comes down at all, was the single fiddliest part of the whole build.

## The knot

A balloon isn't one shape, and modelling it as a single rigid circle looked dead. So each balloon is actually two bodies: a circle for the balloon and a small triangle for the knot, joined by three constraints. A firm pin constraint (stiffness 0.1) holds the knot to the base of the balloon, and two looser side springs (stiffness 0.01) keep it roughly straight while still letting it swing. The result is a knot that wobbles and trails as the balloon moves and gets knocked around, instead of a rigid lump welded to the bottom. With 100 balloons that's 200+ bodies and 300+ constraints all solving together at 60fps.

## Bounce and throw

Every body (balloons, knots, and the ground) runs a restitution of 0.95, close to perfectly elastic, so collisions stay lively and springy rather than damping out into a dead pile. The ground and walls carry their own friction tuning so balloons don't slide forever along the floor. Throwing is the other half of the feel: the mouse constraint deliberately runs a low stiffness (0.05) so grabbing a balloon and flicking it transfers real momentum, letting you properly yeet one across the screen and watch it ricochet off the others, rather than it snapping rigidly to the cursor. Each balloon also spawns with a touch of random torque and sideways force, so the scene has drift and spin from the first frame instead of a static grid.

## Outcome

Balloon Bonanza is a small thing with a lot of tuning underneath it: a hundred balloons that float, jostle, wobble at the knot, and can be flung around, holding 60fps across 200+ bodies and 300+ constraints. It also respects light and dark mode, swapping the sky colour to match the system preference with a manual override. It started as an excuse to learn Matter.js properly, and most of the work turned out to be in the parameters, the invisible half a percent of restitution here and hundredth of gravity there that decides whether a circle feels like a balloon or just a ball.
