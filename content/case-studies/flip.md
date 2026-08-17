---
title: "Flip"
description: "Feature flag and A/B testing service with statistical significance engine"
techStack: "Next.js, Prisma, PostgreSQL, TypeScript, Zod"
---

## The problem

Feature flags and A/B testing are a standard need in product development, but hosted services like LaunchDarkly charge per seat and per flag evaluation. Flip is a self-hosted alternative: a dashboard, a drop-in SDK, and a significance engine that treats "significant" as an actual statistical claim rather than just "variant A got more clicks."

## Under the hood

### The significance engine

The core of Flip is a two-proportion z-test comparing conversion rates between variants, with Wilson confidence intervals providing bounded estimates of the true conversion rate that stay sensible even at small sample sizes. The dashboard surfaces lift as a percentage improvement alongside the p-value and confidence interval, and only shows a significance badge once there's enough data to draw a conclusion worth trusting.

### Deterministic variant assignment

Assignment itself uses MurmurHash3, hashed against a combination of user ID and experiment ID. That gets three properties for free: the same user always lands in the same variant, no cookie or client-side state is needed to remember which one, and the distribution across variants is even. The hash output maps onto variant weights, so unequal splits (90/10 for a gradual rollout, say) fall out of the same mechanism as a straight 50/50.

### A sub-2KB SDK

The client SDK is a single JavaScript file under 2KB. Variant assignment runs synchronously in the browser, since MurmurHash3 needs no network round trip to resolve. Conversion events go out via `navigator.sendBeacon`, which is built to survive page unload, so an event fired the instant before a user navigates away still lands.

### REST API with Zod validation

Every endpoint, experiment creation, flag evaluation, event ingestion, validates its input against a Zod schema and returns typed errors for anything malformed, sitting behind API key authentication. Flags are built as a cascading experiment model: a single flag can hold several experiments, each with its own percentage-based traffic allocation.

## Challenges

Show the significance badge too early and you get false positives dressed up as confidence, so the engine first calculates a minimum sample size per variant from the expected effect size and baseline conversion rate, and only runs the test once that threshold is met. The dashboard shows progress toward that minimum as a percentage bar rather than hiding the wait.

`sendBeacon` solved the unload-reliability problem but brought its own limits: it caps payload size and won't carry custom headers, which rules out a standard Authorization header for the API key. The SDK works around this by encoding the key in the request body instead, and keeps every payload under 64KB by batching events rather than sending them one at a time.

The dashboard also had to reconcile two different freshness needs. Conversion charts don't need to update every second, so they run on SWR with a 30-second revalidation interval, while live event counts do feel wrong if they lag, so those run over a WebSocket connection instead. Splitting the two rather than forcing everything onto one update strategy kept the database query load reasonable.

## Outcome

Flip ended up doing feature flags and A/B testing with proper statistical rigour: deterministic assignment means no cookies, the significance engine means no conclusions drawn from underpowered data, and a sub-2KB SDK means the whole thing barely registers on page performance. It runs self-hosted, with no per-seat pricing attached to any of it.
