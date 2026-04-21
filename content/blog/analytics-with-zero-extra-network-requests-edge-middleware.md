---
title: "Analytics with zero extra network requests: tracking inside Edge Middleware"
description: >-
  Google Analytics ships a 45 KB script. Plausible and Fathom ship maybe 5. The
  problem with all of them is the same: a beacon request from the browser that
  costs latency, ad-blocker risk, and a consent banner. Glint tracks inside
  Next.js Edge Middleware instead, which means the analytics fire server-side
  on the request that is already happening.
date: '2026-05-20'
tags:
  - nextjs
  - edge-middleware
  - analytics
  - vercel
  - privacy
draft: false
---
Every third-party analytics tool has the same shape: a JavaScript snippet in the page, a beacon request back to a data collection endpoint, a dashboard that reads from their database. It works. It also adds a 20-50 KB script to every page, one extra network round trip, a tempting target for ad blockers, and a consent banner because the tool is now a third party processing user data.

None of that is necessary. Next.js Edge Middleware runs on every request, on Vercel's edge network, before the page is served. If you capture analytics there, you have:

- No client-side script (zero extra KB)
- No beacon request (zero latency)
- No third-party domain (no ad blocker, no banner, no privacy officer email)

Glint is what you get when you take this seriously. The middleware captures the analytics in the same edge function that routes the response, and writes the data to a Postgres table you own. The dashboard reads from the same Postgres. There is no separate analytics service, no SaaS bill, no cross-domain script.

---

## The whole thing is 87 lines

Next.js middleware is a single file at `src/middleware.ts`. It runs on every request that matches its `config.matcher` path. For a normal page load, that means it fires once, and it has full access to the request headers.

```typescript
export async function middleware(req: NextRequest) {
  if (process.env.DISABLE_ANALYTICS_TRACKING === 'true') {
    return NextResponse.next();
  }

  const geo = {
    city: req.headers.get('x-vercel-ip-city') || 'unknown',
    country: req.headers.get('x-vercel-ip-country') || 'unknown',
    region: req.headers.get('x-vercel-ip-region') || 'unknown',
  };

  const userAgent = req.headers.get('user-agent') || 'unknown';
  const connectionType = req.headers.get('sec-ch-ua-platform') || 'unknown';
  const timestamp = new Date();

  const commonData = {
    timestamp,
    hour: timestamp.getHours(),
    dayOfWeek: timestamp.getDay(),
    deviceType: /mobile/i.test(userAgent) ? 'mobile' : 'desktop',
    browser: userAgent.split(' ')[0],
    connectionType,
  };

  // Fire and forget, do not block the response
  Promise.all(
    payloads.map(data =>
      fetch(TRACK_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    )
  ).catch(() => {});

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next|api|favicon.ico).*)'
};
```

Every idea that matters about this is in the snippet above. Let me pull them out.

## Vercel gives you geo headers for free

You do not need MaxMind. You do not need a GeoIP database. Vercel's edge network runs an IP lookup against its own tables and injects the result into headers before your middleware sees the request. `x-vercel-ip-city`, `x-vercel-ip-country`, and `x-vercel-ip-region` are present on every edge request at zero cost and zero latency.

The equivalent lookup from a Node server would cost either a paid API call or a GeoIP database file shipped with your deployment. Vercel's inclusion of these headers is one of those platform features that you only notice when you stop using them.

The country header is the single most useful field in the data model. Country plus referrer is enough to answer almost every early-stage analytics question, and it costs a header read.

## Fire-and-forget is the whole performance story

The obvious risk of tracking in middleware is that any millisecond spent in middleware is a millisecond added to every page's time to first byte. So the tracking must not block the response.

The pattern is `Promise.all(...).catch(() => {})` without an `await`. The fetch requests are kicked off, their promises enter the event loop, and the middleware returns `NextResponse.next()` immediately. The page renders while the analytics request is still in flight.

On Vercel's edge runtime, background fetches persist for a bounded time after the response is returned. This gives the tracking request long enough to complete without blocking anything user-visible. If the analytics endpoint is slow or down, the page still serves in the normal time. The `.catch(() => {})` swallows any error so a failed analytics request cannot surface as a page error.

The trade-off is that in the rare case where the edge function is killed before the background fetch completes, you lose that one event. This is acceptable for analytics, which is inherently sampled. It would not be acceptable for a write that the user was waiting on.

## The matcher is load-bearing

```typescript
export const config = {
  matcher: '/((?!_next|api|favicon.ico).*)'
};
```

Middleware runs on every matched request. The matcher must exclude everything that is not an actual page view, or you get exponential noise:

- `_next/static/*` and `_next/image/*` are Next.js asset requests. A single page load fires dozens of these.
- `api/*` is your own API routes. Tracking them would double-count and corrupt referer chains.
- `favicon.ico` is fetched by every browser unconditionally. Tracking it logs a view for every closed tab.

The negative lookahead regex `/((?!_next|api|favicon.ico).*)` excludes these while still matching every real page. This is also the one file in a project where the regex matters: get it wrong and your analytics double or your database fills up with asset noise. There is no easy retry; the data is already dirty.

## Payload shape matters more than schema

Glint fires four payloads per request: an "average" record with the user agent data, a location record, a referral record, and a traffic record. Each one goes to the same `trackAnalytics` endpoint and lands in a different aggregation. This shape is load-bearing for the dashboard, because the queries it drives are grouped differently:

- **Average**: visits by hour of day, by day of week, by device, by browser. Aggregated across all users.
- **Location**: visits grouped by country, region, city. Heatmap-style.
- **Referral**: where traffic came from, per-URL.
- **Traffic**: same referral data but without the URL, for top-level referrer charts.

Splitting them on write means the read-side queries never have to group-by on columns that are cheap to pre-aggregate on insert. The dashboard loads in a few milliseconds because the queries are aggregating over pre-shaped rows, not filtering a firehose.

The events table is small. A text column for each major field, a timestamp, a B-tree index on `(timestamp, path)`. Aggregations use `date_trunc` for time bucketing. Postgres handles this fine into the millions of events; most queries finish in under 50 ms.

## What this architecture cannot do

Track single-page-app route changes. Next.js App Router handles soft navigations without a new request, which means the middleware never fires for a client-side route change. If you care about per-view tracking inside a SPA, you still need a small client-side beacon.

Track interaction events. Time on page, scroll depth, form abandonment, video completion: all of these are client-side. Edge middleware only sees the initial request.

Deduplicate by visitor identity. Without a cookie (set in middleware and read on subsequent requests), the same user on two page loads looks like two different visitors. Glint solves this with a first-party cookie set in the same middleware, but that is one line more code and a trade-off against the otherwise-privacy-friendly shape.

For most indie products, these limits are acceptable. The 80% use case is "how many people are hitting my site, from where, through what." Edge middleware nails that one, and it nails it without a third-party script, a beacon request, or a consent banner.

---

## Why this matters

The analytics industry has spent a decade training us to accept that tracking costs a script tag and a beacon. It does not. The capability was always on the server: every request already knows who is asking, from where, with what headers. The only reason we put analytics in the client was that we did not have a cheap server-side place to put it. We have one now.

The other thing this proves is that first-party analytics, owned by you, in a database you control, with a dashboard you built, is an order of magnitude simpler than the SaaS version. Glint is under 2000 lines of code. The dashboard charts are divs rendered with computed widths. The whole product would fit inside a weekend if you already had the middleware idea.

The third-party analytics market exists partly because nobody noticed edge middleware made the problem trivial.
