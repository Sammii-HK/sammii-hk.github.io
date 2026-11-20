---
title: "Homebase"
description: "A private operations console that brings product signals, approvals and action state into one place."
techStack: "Next.js, WebAuthn, Push API, Service Workers"
updated: "2026-11-20"
status: "Private operations tool; committed source reviewed at 4a9c05a, with separate local changes left untouched."
---

<!-- Kept in step with the canonical structured study in homebase.json. -->

Private operations tool; committed source reviewed at 4a9c05a, with separate local changes left untouched.

## Turn signals into the next decision

Homebase’s current dashboard opens a command centre and separates social, money, queue and chat views. The committed dashboard refreshes its core data on a sixty-second interval and requests stats, heartbeat and alerts concurrently. The earlier pixel-room interface remains in source but is explicitly retired from the current navigation; it is part of the project’s progression rather than the present product claim.

## Give different actions different authority

The autonomy module distinguishes auto, notify, approve and escalate tiers. Rules can override a tier above a score threshold; unknown actions default to approval. That is a concrete policy interface, not a guarantee that every route or external worker consults it. The approval queue and the underlying execution paths need to be checked together before claiming universal enforcement.

## Remember work that is already being handled

Action acknowledgements are grouped by a canonical subject. Recent in-progress and completed acknowledgements suppress repeated surfacing for different windows, while the latest acknowledgement can be attached to a remaining action. This separates a newly detected issue from work already claimed or finished. The source exposes the state and time windows rather than relying only on a disappearing card.

## Keep installation, freshness and authority distinct

The source includes passkey registration and authentication, a signed session path, service-worker caching and push support. The current worker caches selected read endpoints and keeps mutations on the network path; that is narrower than an offline operations guarantee. The authentication helper skips checks when its secret is unconfigured for local development. This source review does not verify production configuration, offline mutation delivery or every action’s audit receipt.

> Homebase surfaces private business information and has no public live demonstration here. No private metrics, state files or approval items were copied into this study. A future walkthrough should use a labelled safe fixture and show a signal, its source time, the review decision and the resulting receipt. No live actions were invoked.
