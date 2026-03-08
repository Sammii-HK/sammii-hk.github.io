---
title: "Glint"
description: "Custom analytics platform built on Edge Middleware with zero-latency tracking"
techStack: "Next.js, Vercel Edge Middleware, PostgreSQL, Recharts"
---

## The problem

Third-party analytics tools like Google Analytics add external scripts, slow down page loads, and are blocked by ad blockers. I wanted a self-owned analytics system that captures pageviews with zero additional latency (no extra network requests from the client), stores data in my own database, and presents it in a clean dashboard.

## Architecture

### Edge Middleware tracking

The core insight is that Next.js Edge Middleware runs on every request before the page is served. By capturing analytics data inside the middleware, tracking happens server-side with no client-side JavaScript required. The middleware extracts the URL path, referrer, user agent, country (from Vercel's geo headers), and timestamp, then writes an event to PostgreSQL via a lightweight insert.

### PostgreSQL persistence

Events are stored in a single events table with indexed columns for path, referrer, country, and timestamp. Dashboard queries use time-bucketed aggregations (hourly, daily, weekly) with PostgreSQL's date_trunc function. Indexes on timestamp and path keep query times under 50ms even with millions of rows.

### Recharts dashboard

The dashboard renders pageview trends, top pages, referrer sources, and geographic distribution using Recharts. Data is fetched via API routes that run aggregation queries against the events table. The dashboard auto-refreshes every 60 seconds in development and includes a date range picker for historical analysis.

### Self-populating demo

For demonstration purposes, a Cloudflare Worker cron job sends simulated traffic from global edge locations at regular intervals. This keeps the dashboard populated with realistic-looking data (varied paths, referrers, countries, and time patterns) even when the site has no real visitors.

## Challenges

**Middleware performance**: The middleware runs on every single request, so it must be fast. The PostgreSQL insert is fire-and-forget (the middleware does not await the response), ensuring zero added latency to page loads. A connection pool prevents opening new database connections per request.

**Bot filtering**: Raw middleware tracking captures everything, including search engine crawlers, health checks, and monitoring bots. The middleware filters known bot user agents and excludes internal paths (/_next, /api) from analytics events. This brings the data closer to actual human traffic.

**Data volume**: High-traffic sites generate millions of events. The schema uses partitioned tables by month, and a nightly cleanup job removes raw events older than 90 days while preserving daily aggregates indefinitely. This keeps the database size manageable without losing long-term trends.

## Outcome

Glint provides complete analytics with zero client-side overhead. Pages load exactly as fast as they would without analytics, ad blockers cannot interfere, and all data lives in a self-owned database. The dashboard shows everything needed for understanding traffic patterns without the privacy concerns of third-party tools.
