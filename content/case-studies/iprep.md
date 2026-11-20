---
title: "iPrep"
description: "A practice product that connects spoken answers with worked engineering lessons, executable exercises and evidence of how much support a learner used."
techStack: "Next.js, TypeScript, Web Workers, React, SwiftUI, Prisma, PostgreSQL"
updated: "2026-11-20"
status: "Web source reviewed at 9e415de. This review did not access learner records, record audio or verify native delivery."
---

<!-- Kept in step with the canonical structured study in iprep.json. -->

Web source reviewed at 9e415de. This review did not access learner records, record audio or verify native delivery.

## Preparation needs a learning loop

iPrep began with spoken interview practice and now also teaches engineering through interactive lessons and feature construction. The product problem is broader than scoring an answer: a person needs to understand an unfamiliar idea, try a small action, see why it behaved that way and return to it later with less support.

## Teach before asking for a complete solution

A blank editor and a large assessment can leave a learner stuck before they have a useful model of the task.

- **Offer hints around the full assessment:** The complete task remains in front of the learner even when its first boundary is unfamiliar.
- **Build the idea in graduated steps (chosen):** Each construction lesson names a goal, a first action and a technical term, then shows a worked example using different data before the learner changes their own source.

The feature-construction path moves through local choice, a controlled input, a captured save and reply ownership. Worked examples explain the pattern without replacing the learner’s source. This teaching structure is represented in lib/playground/studio-build-teaching.ts.

## A real attempt deserves causal feedback

The studio worker compiles the learner’s model and React view, creates a DOM environment and handles explicit events and simulated replies. Checks can therefore inspect the changed source and the resulting behaviour. The teaching copy connects failed checks to a concrete boundary, such as keeping the saved value separate from a draft or accepting only the reply that owns a request. A generated explanation alone is not an executed exercise.

## Completion evidence has a contract

Guided construction validates the expected cumulative groups and check labels before recording a checkpoint. Receipts are tied to the source that was actually checked; changing that source can invalidate the checkpoint. Guided receipts are explicitly marked assisted. The broader completion contract also carries hints, misses and scaffold use, so independent practice and supported work can remain distinguishable. These rules live in studio-build-progress.ts, progress-contract.ts and the learning engine.

## Treat progress sync as an ownership boundary

A local completion can be retried or arrive through more than one client. A response from the wrong account must not silently acknowledge it.

- **Upload local counts as a total:** A retry could duplicate work, and a total would lose the evidence behind the completion.
- **Sync identifiable completion events (chosen):** The client submits events with natural session/lesson identities, checks the returned account and accepts only recognised created or duplicate receipts before removing queued work.

Conflicts, rejected receipts and an unexpected account leave work queued. A separate coaching reader replays canonical completion evidence through the existing learning functions. This is a concrete full-stack boundary in progress-client.ts and coaching-progress.ts, rather than a claim that every device has been verified in this review.

## Keep AI feedback connected to what was observed

The spoken-practice path records audio and uses transcription and feedback services alongside deterministic delivery calculations. Pace and filler counts describe an attempt. Confidence indicators are heuristics based on language and timing, not a measurement of a person’s inner state. The reviewed scoring instructions distinguish behavioural examples, where STAR structure is relevant, from factual questions, where it is not. That distinction keeps the scoring method connected to the kind of answer being practised.

## The public curriculum is separate from private preparation

The public coaching catalogue exposes lesson goals, worked teaching content and supported exercise information. Its execution text makes clear that discussing or revealing code in a chat does not establish an independent pass. Private question banks and interview material use separately scoped access. The portfolio can show the learning mechanism without turning someone’s preparation history into public evidence.

## What still needs a person in the loop

The next product review should observe hesitation, requested help and later independent recall, as well as verify browser and native continuity. Passing checks establishes particular behaviours, not enjoyment, retention or interview performance. This case study makes no claim of a human-calibrated scoring benchmark or measured improvement in candidate outcomes. Native features and live account flows need their own current delivery evidence.
