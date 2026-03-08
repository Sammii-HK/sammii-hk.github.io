---
title: "Spellcast"
description: "Self-hosted social media scheduling across 8+ platforms with AI-driven content automation"
techStack: "Next.js, Turborepo, Drizzle ORM, PostgreSQL, Docker, Postiz"
---

## The problem

Managing social media for multiple brands across multiple platforms is painful. Commercial tools like Buffer and Hootsuite are expensive, limited in customisation, and give you no control over the underlying infrastructure. I needed a platform that could schedule content across Instagram, X, LinkedIn, TikTok, Threads, Bluesky, and more, while also supporting AI-driven content generation, A/B testing, and cross-brand boosting.

## Architecture

### Monorepo structure

Spellcast is a Turborepo monorepo with three main packages: a Next.js frontend, a Node.js backend-for-frontend (BFF), and shared type definitions. The BFF acts as a gateway between the frontend and the underlying Postiz scheduling engine, adding custom logic for brand management, boost rules, and analytics aggregation.

### Self-hosted infrastructure

The entire stack runs on a Hetzner VPS via Docker Compose. This includes the Next.js app, the BFF, PostgreSQL, and a self-hosted Postiz instance with Temporal for reliable job scheduling. Self-hosting was a deliberate choice: it eliminates per-seat pricing, gives full control over data, and allows me to extend the scheduling engine without waiting on a third-party roadmap.

### Multi-brand management

The core abstraction is the "account set", which groups social accounts across platforms under a single brand. Each account set has its own posting cadence, content queue, and analytics. The system manages six account sets, each publishing to multiple platforms simultaneously.

### MCP server

The Spellcast MCP server exposes over 100 tools for AI-driven scheduling and analytics. This powers the Orbit content pipeline, where AI agents can create posts, schedule them at optimal times, check analytics, and adjust strategy, all through structured tool calls rather than UI interaction.

## Challenges

**Postiz integration**: Postiz handles the actual platform API connections, but its API surface didn't cover everything I needed. I built a custom adapter layer in the BFF that extends Postiz's capabilities with thread posting, carousel building, article cross-publishing (to Dev.to, Hashnode), and platform-specific formatting.

**Cadence scheduling**: Each platform has different optimal posting times and frequency limits. The cadence system lets each account set define per-platform schedules with preferred days and time slots. Getting this right required iterating on the data model several times; the initial flat config couldn't express "post to X four times a day but LinkedIn only once".

**Cross-brand boosting**: Boost rules automatically reshare content between brands with configurable delays. For example, when Lunary publishes a post, Sammii's accounts can automatically share it 30 minutes later. The timing logic runs as Temporal workflows to ensure reliable execution even if the server restarts mid-delay.

## Outcome

Spellcast manages all social presence across six brands and eight platforms. It processes hundreds of scheduled posts per week, handles article cross-publishing, and serves as the execution layer for the Orbit AI content pipeline. The self-hosted approach keeps monthly costs under £10 for the VPS, compared to hundreds on commercial alternatives.
