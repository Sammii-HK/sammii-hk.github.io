---
title: "Moth has possibilities, not a plot"
description: "How beliefs, interests, practice and persistent creations let a small AI character change the world she lives in."
date: '2026-11-20'
tags:
  - ai
  - simulation
  - typescript
  - emergent-behaviour
draft: false
---
Moth is a kitten who lives in a little world I built. The interesting part is what I haven't decided for her.

There is no ending she is supposed to reach. There are things she can notice, places she can go, materials she can use and probabilities attached to what might happen. What she does leaves a history. That history changes what she might do next.

She can get something wrong and carry that assumption around. She can become interested in flowers, spend time with them, draw them, practise gardening and make a place where things grow. Or lose interest. Or start something, leave it for days and return with a different idea.

Those possibilities are implemented systems. The particular life that comes out of them is not a sequence of scenes I wrote.

## She can misunderstand the world

The world has an objective event record. Moth has beliefs. They are deliberately separate.

When something unusual happens, she has several conditions she might credit: what the weather was doing, where she was, what she tried, what else she noticed. Her belief can attach to the actual cause or a coincidence.

That is more interesting than generating a line that says she is confused. A belief changes what she favours doing. She can try to recreate the circumstances she thinks mattered. A later event can support that belief, shake it or leave it to fade.

The implementation is in `cat/beliefs.ts`. Confidence and supporting experience belong to the belief. They do not rewrite the event that caused it.

## Interests need a history

An interest is not a personality adjective in a prompt. It has to grow from something she did, found, read, heard or was given.

The interest system records why a topic gained strength. Topics can branch into related things. They also lose strength when she stops attending to them. Repeating the same action all day has a cap on how much credit it earns.

Those interests feed her choices: what she searches for, what she draws, what work appeals to her. The loop matters more than the label. An interest changes her behaviour, and her behaviour can deepen or redirect the interest.

## Practice changes what she attempts

Moth draws things that are on her mind. A drawing keeps its subject, why she chose it and what her abilities were when she made it.

That gives improvement something concrete to mean. There are marks she can manage and marks she struggles with. There can be a gap between what she meant and what appeared. What she notices can become something to practise next.

The broader skill system also counts gardening, making, building, music and finding things. Practice affects later attempts. It is not a skill number displayed beside an unchanged behaviour.

## She can leave the place different

This is the part I particularly care about: Moth can shape her world.

A larger work begins somewhere she chooses. It needs materials or labour. She can fetch what is missing and make progress over time. Weather and creatures can set it back. Something half made remains part of her history.

A finished den can make a place soft and hidden. A mobile can ring in the wind. A garden grows and needs tending. A ramp can open a route. These are possibilities in the works engine, not claims that every instance of the world has already produced each one.

They change the place she will inhabit tomorrow. That place then offers a different set of encounters and choices.

## A project can wander

There are two useful layers here. A concrete work has material stages. An open-ended project holds a subject and what drew her to it, then records the things she actually does around it.

The project does not need to prescribe a final object. It can change medium, rest, fail or finish as something its first idea did not name. The engine still defines the capabilities. It does not secretly know which story is supposed to happen.

Seeded randomness makes the simulation reproducible for inspection. It does not make her history a prewritten plot. The world owns what is possible; the model can help her choose and interpret within it.

That is the design problem I keep returning to: how much can I give her to work with before I start deciding her life for her?

[Meet Moth](https://moth.sammii.dev)
