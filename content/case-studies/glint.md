---
title: "Glint"
description: "Tracing a server-side analytics prototype from request metadata through ingestion, PostgreSQL and a chart dashboard, with simulated data made explicit."
techStack: "Next.js, TypeScript, Vercel Edge Middleware, Prisma, PostgreSQL, Recharts, Cloudflare Workers"
updated: "2026-11-20"
status: "Local dashboard candidate 7e33b73; sample charts and responsive controls verified, release pending."
---

<!-- Kept in step with the canonical structured study in glint.json. -->

Local dashboard candidate 7e33b73; sample charts and responsive controls verified, release pending.

## Explore the measurement pipeline

Glint explores capturing request metadata on the server, storing it behind an API and presenting it in a dashboard. Its demonstration includes simulated traffic from a scheduled Cloudflare Worker. Session duration and network-speed values in the middleware are also randomly generated. Those values are not measurements of real visitor behaviour.

_Unreleased local dashboard at 7e33b73. Every displayed value is from the labelled synthetic example, not a real audience._

## Follow a request into a chart

1. **Request boundary:** Middleware reads request headers and starts four API posts for average, location, referral and traffic payloads. It excludes API, Next.js and favicon paths from its matcher. [Implementation](https://github.com/Sammii-HK/glint/blob/44bacf9/src/middleware.ts)
2. **Ingestion boundary:** The route checks the payload type and required location/referral/traffic fields, then calls the appropriate Prisma model. Middleware does not write directly to PostgreSQL. [Implementation](https://github.com/Sammii-HK/glint/blob/44bacf9/src/app/api/trackAnalytics/route.ts)
3. **Storage boundary:** Separate models store average, location, referral, traffic, session and device records. This is not a single partitioned events table. [Implementation](https://github.com/Sammii-HK/glint/blob/44bacf9/prisma/schema.prisma)
4. **Presentation boundary:** The average-metrics component loads an API snapshot, groups records by date in the browser and passes it to Recharts. The reviewed component fetches on mount. [Implementation](https://github.com/Sammii-HK/glint/blob/44bacf9/src/components/charts/AverageMetricsChart.tsx)

These links identify the unchanged collection baseline. The local 7e33b73 dashboard candidate adds the explicit data-source and request-state work below. No database or collection operation was verified.

## Keep demonstration data separate from evidence

A regularly populated dashboard makes the charting pipeline visible, but plausible-looking numbers can suggest a real audience.

- **Present generated values as audience metrics:** The chart would look active while obscuring the provenance of its values.
- **Describe the prototype and identify synthetic inputs (chosen):** The local dashboard starts from a fixed synthetic example with persistent provenance text. Stored snapshots are a separate explicit selection and never silently fall back to sample values.

The portfolio does not use the demonstration as evidence of customer volume, engagement or a measured performance gain.

## Delivery is a boundary still to strengthen

The middleware starts its posts without awaiting them. That avoids deliberately holding the response open for ingestion, but it does not establish zero latency or guarantee that a serverless runtime will finish those requests. Delivery lifetime and failure handling need explicit verification before this becomes production analytics.

## Make query scope legible

The local dashboard separates six independently scoped requests, uses no-store, aborts on view changes and times out after ten seconds. Empty, malformed, HTTP-failure and network-error states are distinct. Seven or fourteen captured dates are selected from a snapshot, not an arbitrary reporting range. Dates aggregate in UTC, and expandable value tables expose the displayed records. Random session/network fields are omitted from this presentation. Stored-data branches have mock coverage only.

## What the current source proves

The local product pass has nineteen tests, TypeScript, source lint and a production build passing, with zero findings in its full and production dependency audits. Final mounted desktop and 390px browser checks show a visible area plot, twenty-four hourly bars and labelled axes. Seven/fourteen captured-date selection and overflow checks passed. An earlier blank capture was withdrawn; the cause was not conclusively isolated. No stored-data or database operation was exercised, and sample-mode checks do not certify the unchanged collection backend.
