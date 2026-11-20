---
title: "Spellcast"
description: "The execution layer for a multi-brand content operation: account sets, scheduling adapters and AI assistance with explicit evidence limits."
techStack: "Next.js, Turborepo, Drizzle ORM, PostgreSQL, Postiz, Temporal"
updated: "2026-11-20"
status: "Production scheduling product; source reviewed at b4c6bdf with separate uncommitted local changes. Live scheduling was not exercised."
---

<!-- Kept in step with the canonical structured study in spellcast.json. -->

Production scheduling product; source reviewed at b4c6bdf with separate uncommitted local changes. Live scheduling was not exercised.

## One operation, distinct identities

Spellcast groups a brand’s accounts into an account set, with its own queue, schedule and analytics. The product problem is keeping identities and platform rules attached to the work as it passes through drafting, review and publishing.

## Extend the scheduling engine

The operation needs a product-specific interface, account sets, AI assistance and analytics without rebuilding every platform integration.

- **Rebuild the whole publishing stack:** Own every API connection, OAuth flow and queue from the beginning.
- **Build a product layer around Postiz (chosen):** Use Postiz for integration and publishing, with a Next.js interface and backend-for-frontend carrying the product-specific work.

The repository separates web, API and shared packages. Postiz and its Temporal infrastructure form the scheduling foundation. The product layer supplies identity, drafts, campaigns and platform-specific adapters.

## Claim the work before calling a publisher

Two schedule requests can arrive for the same draft while a publisher call is still in progress. A crashed request can also leave work stuck between states.

- **Treat each request as a new publication attempt:** Concurrent requests could send the same draft to a publisher more than once.
- **Use a conditional scheduling claim (chosen):** An update claims a draft as scheduling. Requests seeing an already scheduled record or a stored publisher identifier return the existing result. A scheduling record without a publisher identifier can be reclaimed after ten minutes.

The committed route contains explicit contention and recovery states rather than relying on a disabled button. The ten-minute timeout is an operational policy, not proof that an external publisher has done nothing; this does not establish exactly-once publication.

## Scheduled does not mean every destination succeeded

- **What happened:** A multi-platform request can reach one publisher successfully while another destination fails. Rolling the whole draft back would hide surviving external work.
- **Why:** The application database and external publishing services do not share one transaction.
- **Fix:** The committed scheduling route retains successful publisher identifiers, records failed integration identifiers and a partial-failure reason, and keeps the post scheduled when any leg succeeded. If no leg succeeds, the error path returns it to draft with the reason. These source paths are evidence of recovery intent; the current review has not replayed live partial failures or verified every retry path.

## AI has a route and a failure state

The local text helper tries the Brand API, then Ollama, with request timeouts. If neither returns usable text, it throws an error. That route is a concrete integration to inspect, not evidence that every AI feature uses the same provider or has the same reliability. Source: apps/api/src/lib/local-llm.ts.

## An A/B winner needs evidence

- **What happened:** The earlier portfolio described automatic A/B learning without explaining whether recorded winners had enough observations.
- **Why:** A winning label does not establish an experiment result. The handoff recorded zero-metric production winners; this audit did not query or change the production database.
- **Fix:** Remove outcome claims from the case study. The current local evaluator checks sample floors, a confidence threshold and lift, but its shared statistics file is still uncommitted and its assumptions need review before it is presented as validated learning.

## What is still to prove

The current helper discards response usage fields, so it does not establish per-run token or cost accounting. The A/B calculation sums engagement actions against impressions; repeat actions are not automatically a unique engaged audience. Shipping the local gate does not by itself validate that statistical model. A stronger recorded demo should show a draft, its identity and checks, the review decision, the scheduled result and the actual metric receipt.

> No A/B lift, weekly publishing volume, cost saving or autonomous business outcome is claimed here. Those need dated production evidence. The audit makes no changes to live schedules or publishing permissions.

## Explore Spellcast

- [Open Spellcast](https://spellcast.sammii.dev)
