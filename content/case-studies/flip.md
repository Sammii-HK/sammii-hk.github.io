---
title: "Flip"
description: "A feature-flag and experiment prototype with deterministic server assignment, an editable browser SDK and explicit tracking and statistical limitations."
techStack: "Next.js, Prisma, PostgreSQL, TypeScript, Zod"
updated: "2026-11-20"
status: "Prototype source reviewed at b696ada; database and browser workflows not exercised."
---

<!-- Kept in step with the canonical structured study in flip.json. -->

Prototype source reviewed at b696ada; database and browser workflows not exercised.

## Give one visitor a repeatable assignment

The decision endpoint hashes the visitor ID and experiment key with MurmurHash3, reduces the result to one of one hundred buckets and walks cumulative variant weights. Assignment happens on the server. The browser SDK awaits that endpoint, caches experiment choices in memory and stores a generated visitor ID in a one-year cookie. Deterministic hashing does not make this implementation cookie-free or synchronous in the browser.

## Expose the calculation without overstating it

The statistics module computes conversion rates, lift against the first variant, a pooled two-proportion z-test and Wilson intervals. The implementation labels a comparison significant at 95% and selects the first positive significant variant. It has no power calculation, minimum-sample gate, correction for repeated inspection or multiple comparisons. The API counts conversion events rather than deduplicated converted visitors and does not filter those counts by the experiment’s goal-event name. Those limits matter before interpreting a badge as a trustworthy experimental result.

## The transport and authentication must agree

The reviewed SDK sends one conversion event using sendBeacon when available. That request contains no Bearer header or body API key, while the tracking route authenticates only a Bearer header. The fetch fallback includes the header. Consequently the beacon path does not satisfy the route’s authentication contract. The SDK also attributes track calls to the last cached experiment rather than an explicit experiment argument. There is no verified reliable unload tracking or event batching here.

## An internal route is still a product boundary

The public decision and tracking routes validate input with Zod and use API-key checks. The reviewed internal experiment-management and statistics routes do not apply that authentication guard. Experiment weights are individually constrained but not required to sum to one hundred. These are tool follow-ups, alongside transport repair and explicit event attribution. No requests or database mutations were made in this review.

> The earlier claims of a sub-2KB measured SDK, WebSocket updates, underpowered-test protection and guaranteed delivery were removed because the reviewed source does not establish them. Flip is not being presented as a validated experimentation service. A repaired tool needs recorded authenticated SDK-to-route checks and a reviewed statistical contract.
