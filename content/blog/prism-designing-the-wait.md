---
title: "Designing the wait in an AI interface"
description: "Prism's response component treats waiting, tools, interruption and failure as interface states, using recorded local-model runs."
date: '2026-11-20'
tags:
  - design-engineering
  - ai
  - react
  - state-machines
  - accessibility
draft: false
---
An AI response is rarely just a loading spinner followed by an answer.

It can start quickly, sit quietly, call a tool, receive a result, write part of an answer, stop making progress or fail halfway through. The user might stop it before any of that finishes.

I built Prism's AI response component around those states. The visual treatment comes after deciding what the interface actually knows.

## A fast response should not flash a loader

Prism shares timing rules between its waiting surfaces. There is a quiet window before anything new is drawn. If a response starts inside it, the interface avoids inserting a placeholder only to remove it immediately.

After a longer period without progress, the response says it is still working and offers a way out. A tool call is shown as a tool step. Its arguments are available to inspect rather than mixed into the answer as unexplained activity.

The async button and loading region use a shared latency state machine. Each surface takes the part of that machine it needs. The button does not pretend to offer every capability the response interface has.

## Interruption belongs in the design

Stop is a real state. What has arrived stays visible. A retry needs to make sense in the context of the partial answer rather than wiping away evidence that something happened.

The stream accepts an abort signal. The simpler latency machine also ignores late results once a request has settled. That matters when a response arrives after the user has already cancelled or started again.

These decisions are easy to miss in a polished recording where everything succeeds. They are the decisions the user meets when the system behaves imperfectly.

## Streaming should be readable

The response reveals text at an even pace rather than reproducing every burst of transport timing as a visual jump.

Screen readers hear the completed answer once instead of receiving an announcement for every token. Citations only become links when a corresponding source exists.

That last rule has a boundary: a source link is not a truth detector. The interface can make provenance inspectable. It cannot turn a model's mistaken use of a source into a correct answer.

## The demo replays real output

A public component demo needs to make failure reproducible. I do not want a different model bill and a different answer every time someone opens it.

Prism uses an event stream interface. The demo supplies recorded output from a local Ollama model, preserving its timing. No paid model call happens when a visitor presses play.

One run contains an injected tool timeout, labelled as such. Another keeps a wrong-source result instead of quietly replacing it with a better take. The first demonstrates a controlled failure path. The second is a real quality failure in the recorded output. They should not be described as the same kind of evidence.

## Generation needs boundaries too

Token Compose explores another part of the problem. It generates layouts from a closed vocabulary of spacing, radii, type sizes, layouts and colours. A validator can reject an off-token value and name the rule it broke.

It is a seeded generator, not a language model choosing a layout. Its validator checks membership, not whether the composition is beautiful or its contrast is sufficient. That boundary is part of the work, rather than a detail to conceal behind the word “generative”.

The implementation is in [Prism’s release PR](https://github.com/Sammii-HK/prism/pull/33). The recorded response, latency states and Token Compose are the pieces to explore as that release goes live.
