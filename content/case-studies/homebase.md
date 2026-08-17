---
title: "Homebase"
description: "A COO-in-a-browser-tab for running several businesses from one screen"
techStack: "Next.js, WebAuthn, Push API, Service Workers"
---

## The problem

Running several products alone means the actual bottleneck isn't building features, it's staying oriented: which system needs attention right now, which numbers moved, which AI-proposed action is waiting on a human yes. That state was scattered across a dozen dashboards and cron logs. Homebase is the single screen that answers "what needs me right now."

## Architecture

### A live operations surface, not a static dashboard

Homebase polls health, revenue, social, SEO, and deploy status across every product every 15–60 seconds and renders them as one continuously-updating view, rather than a report you'd open once a day. It's a full PWA — installable, offline-capable, push-notified — because the whole point is that it should behave like a native ops console, not a webpage you remember to check.

### Approval, not autopilot

AI-proposed actions below a configured autonomy threshold sit in a queue for a human yes/no rather than executing unsupervised. Above that threshold, actions execute and log a "receipt" instead of waiting — the threshold itself is the actual design decision: how much do you trust the automation with, and where does a human have to be in the loop.

### An unusual status visualisation

Each business renders as a room in a custom-built pixel-art canvas — a spatial, at-a-glance way to represent business health that doesn't reduce every product to the same row in the same table. It's a genuinely bespoke rendering layer, not a component library default.

### Receipts, not a black box

The automation loops feeding Homebase (scheduling content, adjusting spend, running email lifecycle lanes) don't just act silently — every action posts a structured "receipt" to an audit trail. That's the same approval-threshold idea applied one layer down: even the actions that don't need a human yes/no still leave a record a human can review after the fact, so "autonomous" never means "unauditable."

## Challenges

**Passkey-first auth on a single-user ops tool**: WebAuthn is normally justified by scale (many users, high account-takeover risk). Here the justification was different — this dashboard can trigger real actions across real revenue-generating systems, so the auth needed to be stronger than the stakes of a typical side-project tool, not weaker just because there's only one user.

**Real-time without a dedicated backend**: polling half a dozen independent systems every 15–60 seconds without either hammering their APIs or showing stale data meant building a genuinely tiered refresh strategy — fast polling for anomaly-sensitive numbers, slow polling for things that rarely change, rather than one global interval.

## Outcome

Homebase is the thing I actually open first every day — not a portfolio piece built to be shown, but working infrastructure that happens to be worth showing. (For that reason it isn't linked live here: it surfaces real business and job-search data live, so this is deliberately a description rather than a demo.)
