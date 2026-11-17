---
title: 'What gets rebuilt in a hundred merged changes'
description: 'I replayed the last hundred merged changes of a popular open-source product against its own components and tokens. What was rebuilt, what was bypassed, how I checked it, and why I am not naming the product.'
date: '2026-11-17T18:00:00+00:00'
tags:
  - design-systems
  - react
  - agents
draft: false
---

Every design system has a gap between what it offers and what gets written. You can argue about that gap in the abstract for a long time. I wanted to look at it in real code, change by change, so I took a popular open-source document-sharing product and replayed its last hundred merged changes against the components and tokens it has today.

This is what I found, how I checked it, and why the product stays anonymous.

## The method

The idea is simple. Take a repository's recent history and, for each merged change, ask one question: did this change add something the codebase already had?

For each change, the check looks only at the lines that change added, not the whole file it touched. It compares them with the components and design tokens the repository declares. Two kinds of finding count.

- Hand-built UI where a component already existed: a button element styled by hand where the codebase has `Button`, a pulsing grey block where it has a skeleton loader component.
- A raw value exactly equal to a token or scale step that already existed: a pixel size that is a step on the spacing scale, a colour that is the value of a declared colour token.

One rule matters more than the rest. A finding of hand-built UI is kept only if the component already existed when the change was made. Building a button by hand before anyone had written `Button` is not a mistake. It is how components start.

The replay runs on a temporary copy of each commit and never touches the working repository. Nothing is uploaded, and no AI model is involved in the check itself.

## What it found

Of the last hundred merged changes, all but a handful touched the product's UI source.

- 4 of them added hand-built UI where the codebase already had the component. The most common case by far was a hand-built loading placeholder where the skeleton loader component existed. Raw buttons and inputs, and a new toggle built from scratch where a `Toggle` component already existed, made up the rest.
- 9 of them wrote a raw value exactly equal to an existing token or scale step: white and near-black colours that were already tokens, pixel sizes that were already steps on the scale, z-index values that matched a declared layer.

The check also turned up values that matched nothing: widths, font sizes and radii that sat between two steps of the scale. Those are a different kind of finding. They are not a bypass, because there was no token to bypass. They are a question for the team: is this a new step, or a value that should round to an existing one?

There were contrast findings too, text colours on backgrounds below the WCAG contrast minimum. I am leaving those aside here. They are worth fixing, but they are not about reuse.

## How I checked it

A count like this is only worth publishing if each finding holds up. So every finding in this note was checked by hand against the source: the line the change added, the component or token it was compared with, and whether that component existed at the time.

It is the step I will not skip. A check that names a pattern can be wrong, and the cost of a wrong claim about someone else's code is much higher than the cost of a missing one.

I have replayed other products the same way. Their notes have not yet been read by hand, so I am not quoting their numbers. What I can say is that the results varied a lot between products, which is itself useful: this is not a fixed rate of sloppiness. It depends on how visible the components are and how a team works.

## Why the product is anonymous

The product is open source, the history is public, and anyone could run the same replay. I still will not name it, for three reasons.

- These findings describe how code gets written under time pressure, by people and, more and more, by coding agents. They are not a verdict on the team, and a name invites that reading.
- A wrong claim with a company's name on it is the real risk, to them and to me. Anonymising by default removes it.
- If a team wants to see the full note about their own code, the right way is to offer it through their public channels, and let them decide what happens next.

So I describe the findings in plain words and never paste their code.

## What it says about agents

None of these changes is labelled as written by an agent, and I make no claim that they were. What links them to agents is the shape of the mistake.

In an October benchmark of Saer, Codex hand-built UI the codebase already had a component for in 22 runs without access to the design system, and in 5 with it, out of the same number of runs on each side. The patterns were the same ones this replay found: loading placeholders, buttons, inputs and empty states built fresh beside the component that already existed.

An agent writes from what it can see. A person in a hurry does the same. As more changes are written with agents, the number of chances to rebuild something goes up, and so does the value of a check that asks the reuse question on every change.

## What I take from it

- Replay history before you argue about drift. A hundred real changes say more than any amount of opinion.
- Judge only the lines a change adds, and only against components that existed when it was made.
- Read every finding by hand before you publish a count.
- Keep values that match nothing apart from values that bypass a token.
- Describe the pattern, not the team.

The replay is part of Saer, the tool I am building to keep coding agents on the design system a codebase already has. You can request early access at saer.app.
