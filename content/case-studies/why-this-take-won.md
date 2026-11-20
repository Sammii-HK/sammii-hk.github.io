---
title: "Why this take won"
description: "Making a phrase-scoring rule inspectable, from its four inputs to a reviewable choice between takes."
techStack: "TypeScript, ES modules, scoring models, interface design"
updated: "2026-11-20"
status: "Interactive scoring explainer; invented examples, not recorded user sessions"
---

<!-- Kept in step with the canonical structured study in why-this-take-won.json. -->

Interactive scoring explainer; invented examples, not recorded user sessions

## A score should have an explanation

Post Ready combines words heard, filler penalties, pace and eye contact when comparing deliveries of a phrase. The explainer makes those parts visible. Three invented takes let a reader adjust the weights and see why the chosen take changes.

## Know what coverage counts

The rule compares sets of normalised expected and heard words. Repeating a script word does not give it extra weight, so saying one occurrence can cover that word even when another occurrence is missing. That makes the score inspectable, but it is not a count of every correctly delivered word. The port was checked against the original Swift function at 3fff237a, and four hand-worked cases were exercised offline in this review. No speech recording or gaze detector was invoked.

## Expose the parts of the decision

A single winning score hides what the rule rewards and what it cannot assess.

- **Show only the winning take:** A short result with little basis for questioning it.
- **Show each contribution and its weight (chosen):** Make the arithmetic inspectable and let the reader explore a different weighting.

The explainer shows how the scoring rule behaves. It does not establish that the winning take is the most convincing performance.

## What the model cannot decide

- **Gave up:** A small mechanical model cannot assess tone, delivery nuance or whether a joke landed.
- **Got:** Its inputs and weighting can be inspected directly, without presenting invented example takes as recorded evidence.

## Explore the scoring study

- [Open the interactive scoring explainer](https://sammii.dev/experiments/why-this-take-won/index.html)
