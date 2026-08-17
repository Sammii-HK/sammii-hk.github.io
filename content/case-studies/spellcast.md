---
title: "Spellcast"
description: "Self-hosted social media scheduling across 8+ platforms with AI-driven content automation"
techStack: "Next.js, Turborepo, Drizzle ORM, PostgreSQL, Docker, Postiz"
---

## The problem

Buffer and Hootsuite are expensive and limited in customisation. What they won't do is hand over the infrastructure underneath it: you're paying per seat, working inside someone else's feature set, and waiting on someone else's roadmap if you need something they haven't built. Running social for multiple brands across Instagram, X, LinkedIn, TikTok, Threads, Bluesky and more, with AI-driven content generation, A/B testing and cross-brand boosting layered on top, meant either accepting those limits or building the scheduling layer myself.

## How it's built

Spellcast runs entirely on a Hetzner VPS via Docker Compose: the Next.js app, a Node.js backend-for-frontend, PostgreSQL, and a self-hosted Postiz instance with Temporal handling job scheduling. Self-hosting was a deliberate choice: it removes per-seat pricing, keeps the data under my control, and means the scheduling engine can be extended whenever a new brand need shows up rather than filed as a feature request.

The codebase is a Turborepo monorepo split into three packages: the Next.js frontend, the BFF, and a shared types package. The BFF sits between the frontend and Postiz's scheduling engine and carries the logic Postiz doesn't: brand management, boost rules, analytics aggregation.

The core abstraction for managing several brands from one system is the "account set", which groups a brand's social accounts across platforms and gives them their own posting cadence, content queue, and analytics. Six account sets run through the system today, each publishing to multiple platforms at once.

On top of that sits the Spellcast MCP server, exposing over 100 tools for AI-driven scheduling and analytics. It's what the Orbit content pipeline talks to: AI agents create posts, schedule them at optimal times, check analytics, and adjust strategy, all through structured tool calls instead of clicking through a UI.

## What was hard

Postiz covers the actual platform API connections, but its surface stopped short of what I needed, so the BFF grew an adapter layer on top: thread posting, carousel building, article cross-publishing to Dev.to and Hashnode, and platform-specific formatting that Postiz doesn't handle natively.

Cadence was a harder problem than it looked. Every platform has different optimal posting times and frequency limits, and the first data model I wrote was flat, which meant it couldn't express something as basic as "post to X four times a day but LinkedIn only once." Getting the cadence config to represent per-platform schedules with their own preferred days and time slots took a few passes at the model before it held up.

Boost rules reshare content between brands after a configurable delay, so when Lunary publishes, Sammii's accounts can pick it up 30 minutes later. That delay has to survive a server restart mid-wait, so the timing logic runs as Temporal workflows to keep execution reliable.

## Where it landed

Spellcast now runs all social presence across six brands and eight platforms, processing hundreds of scheduled posts a week and handling article cross-publishing alongside it. It's also the execution layer under the Orbit AI content pipeline. Running it self-hosted keeps the whole thing under £10 a month in VPS costs, against the hundreds a commercial equivalent would charge.
