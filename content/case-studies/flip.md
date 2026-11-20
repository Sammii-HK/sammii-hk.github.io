---
title: "Flip"
description: "A feature-flag and experiment prototype with explicit management authority, authenticated event transport and exploratory statistical summaries."
techStack: "Next.js, Prisma, PostgreSQL, TypeScript, Zod"
updated: "2026-11-20"
status: "Local product candidate 02b9610 with dependency follow-up d312262; sample UI checked, configured infrastructure not exercised."
---

<!-- Kept in step with the canonical structured study in flip.json. -->

Local product candidate 02b9610 with dependency follow-up d312262; sample UI checked, configured infrastructure not exercised.

## Show a sample without exposing the operator’s data

The public dashboard now reads a fixed, labelled example instead of real database records or API keys. Overview, results, read-only flags and integration guidance can be inspected without creating a live experiment. Sample counts are illustrative. This is a deliberate product boundary, not a claim that the prototype has a production audience.

## Separate management authority from browser access

Actual management requires a server-only operator credential together with a tenant data-plane key. A browser SDK key cannot administer the system. Tenant-scoped reads and updates check ownership, and unconfigured management returns 503 before a tenant lookup. This is a single-operator boundary, not a multi-user identity system or security certification. No real keys or operator configuration were used in the review.

## Make a conversion name its assignment

The earlier beacon request omitted the credential required by the tracking route. The local SDK now names the experiment explicitly, requires a cached assignment, uses authenticated keepalive fetch and reports HTTP/network failure. Requests are bounded to 16 KiB; neither keepalive nor that bound guarantees unload delivery. The actual standalone script is built to /sdk/flip.js. Its visitor cookie remains explicit, and assignment is still server-side MurmurHash3 rather than synchronous browser evaluation.

## Count a visitor once, then state the inference limits

The revised outcome calculation deduplicates exposed visitors and counts at most one matching goal conversion after an exposure. Conflicting variant assignments are excluded. Operational guards require one hundred visitors, ten conversions and ten non-conversions per compared group; these are product guards, not a calibrated power calculation. Treatment-versus-control p-values receive Bonferroni adjustment, and Wilson intervals describe individual rates. Automatic winner selection has been removed. There is no sequential-monitoring correction, stopping rule or causal guarantee.

## Verify the visible boundary without inventing a live experiment

Twelve mocked/in-memory regressions exercise management denial and key separation, tenancy, event validation, deduplicated outcomes, known calculation values, SDK errors and bundle execution. TypeScript, build, lint and eight icon regressions pass. The actual local overview/results/settings and 390px layout were checked; the results table scrolls inside its own region. No live decision, conversion, database connection or credential setup occurred.

> The compatible dependency pass leaves three affected-package entries representing one remaining deepmerge-ts advisory propagated through Prisma configuration tooling; its breaking migration is open. Real configured management, stored event behaviour, large-event performance, assignment/configuration versioning, bot/spoofed-visitor protection, cross-origin integration and production statistical quality remain unverified. No SDK size, batching, npm release or guaranteed tracking claim is made.
