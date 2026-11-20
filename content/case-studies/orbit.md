---
title: "Orbit"
description: "Connecting evidence, specialist jobs, drafting and review in a content operation, with an inspectable boundary between preparing work and publishing it."
techStack: "Shell, Python, Node.js, JSON job definitions, Local models"
updated: "2026-11-20"
status: "Public showcase replacement prepared locally; deployment pending"
---

<!-- Kept in step with the canonical structured study in orbit.json. -->

Public showcase replacement prepared locally; deployment pending

## The operation is the product

Orbit coordinates jobs with different responsibilities: planning, analytics, research, optimisation, writing and review. The difficult part is keeping evidence, account identity and the state of the work attached as it passes between them. A collection of prompts does not establish that a useful result reached the end.

## The old demo showed the wrong evidence

- **What happened:** The public control room generated its own activity, tool calls, publication totals and estimated spend. It could look like a functioning operation without showing any real execution evidence.
- **Why:** It illustrated a tidy pipeline rather than the current implementation. The scheduler is a script, and the lean content path is review-only. A fixed fleet count and animated publishing board obscured those distinctions.
- **Fix:** The replacement is an interactive source walkthrough with full, lean-content and research modes. Stage details show inputs, outputs, boundaries and retained source excerpts. It is labelled as a dated implementation snapshot, not a live run.

## Separate the modes

Research, drafting and a full orchestration cycle do not need the same chain of work.

- **One pipeline for every task:** A simple explanation that hides differences in responsibility and cost.
- **Show the distinct code paths (chosen):** The full path coordinates planning and enrichment. Lean content writes and reviews. Research updates context without running the writing stages.

The walkthrough reflects the selected orchestration paths without claiming every job runs on every cycle. Model-backed jobs and deterministic scripts are distinct.

## A passing score is not publishing authority

The editor’s current instruction is human review only and prohibits creating, scheduling or publishing posts through the connected service. The scheduler source defaults to review-only unless explicitly enabled. Dedicated account pipelines own publishing. Those source boundaries do not prove the current production configuration, which the public walkthrough does not read.

## Keep a place for failed work

The full pipeline records completed and failed jobs in a checkpoint. Resume can skip completed work. Job tiers influence failure handling, so the case study does not claim that every failed dependency always stops downstream work. A later recorded execution should preserve the holds and failures as well as the successful outputs.

## An explanation you can verify

- **Gave up:** A constantly moving board with impressive-looking numbers.
- **Got:** A finite, inspectable source snapshot with no model request on a visitor’s click. Runtime claims need a separate reviewed execution record.

## What this audit used

The replacement was checked against the local orchestrator.sh, scheduler configuration and scripts, and research-contract implementation on 20 November 2026. That working tree contains unreleased changes. The public demo replacement is prepared separately from the production runtime; no schedules, agents or publishing permissions were changed.

## Enforce the interface policy without running the operation

Local bdf3de9 adds normal scoped lint and test commands for showcase/dashboard source. A contextual stage-button arrow now uses the existing Lucide renderer; dashboard navigation uses named official Lucide nodes. The pipeline topology connector, sparklines and Orbit brand initial remain reviewed diagram/data/brand content. Sixteen source/syntax/mock-DOM checks include the eleven canonical regressions, with audit zero. Pure dashboard navigation was tested in isolation; no dashboard service, private state, credentials, job trigger or operational API was opened. This does not certify runtime behaviour or replace a recorded execution.

## Explore Orbit

- [Public Orbit page](https://orbit-live.sammii.dev)
