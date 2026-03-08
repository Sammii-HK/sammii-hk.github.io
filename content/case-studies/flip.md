---
title: "Flip"
description: "Feature flag and A/B testing service with statistical significance engine"
techStack: "Next.js, Prisma, PostgreSQL, TypeScript, Zod"
---

## The problem

Feature flags and A/B testing are table stakes for modern product development, but hosted services like LaunchDarkly charge per seat and per flag evaluation. I wanted a self-hosted service with a clean dashboard, a drop-in SDK, and a real statistical significance engine, not just "variant A got more clicks".

## Architecture

### Deterministic variant assignment

Users are assigned to experiment variants using MurmurHash3 hashed against a combination of user ID and experiment ID. This is deterministic (the same user always sees the same variant), cookie-free (no client-side state needed), and evenly distributed. The hash output is mapped to variant weights, supporting unequal splits like 90/10 for gradual rollouts.

### Statistical significance engine

The significance engine runs two-proportion z-tests comparing conversion rates between variants. Wilson confidence intervals provide bounded estimates of the true conversion rate, accounting for small sample sizes. The dashboard shows lift (percentage improvement), p-value, confidence intervals, and a significance badge that only appears when there is enough data to draw a reliable conclusion.

### Sub-2KB SDK

The client SDK is a single JavaScript file under 2KB that handles variant assignment and conversion tracking. Variant assignment happens synchronously (MurmurHash3 runs client-side with no network request). Conversion events are sent via `navigator.sendBeacon`, which fires reliably even during page unload, ensuring events are not lost when users navigate away immediately after converting.

### REST API with Zod validation

The API layer uses Zod schemas for request validation on every endpoint. Experiment creation, flag evaluation, and event ingestion all validate input shapes, return typed errors for invalid requests, and use API key authentication. The cascading experiment model lets flags contain multiple experiments with percentage-based traffic allocation.

## Challenges

**Sample size requirements**: Showing significance badges too early leads to false positives. The engine requires a minimum sample size per variant (calculated from the expected effect size and baseline conversion rate) before running the z-test. The dashboard shows progress toward the minimum sample size as a percentage bar.

**sendBeacon reliability**: While `sendBeacon` is more reliable than fetch for page-unload events, it has payload size limits and does not support custom headers. The SDK encodes the API key in the request body rather than an Authorization header, and keeps payloads under 64KB by batching events.

**Dashboard real-time updates**: Conversion data changes continuously as events arrive. The dashboard uses SWR with a 30-second revalidation interval for conversion charts and a WebSocket connection for live event counts. This balances real-time feel with reasonable database query load.

## Outcome

Flip provides feature flags and A/B testing with proper statistical rigour. The deterministic assignment means no cookies, the significance engine means no false conclusions, and the sub-2KB SDK means negligible impact on page performance. The entire service is self-hosted with no per-seat pricing.
