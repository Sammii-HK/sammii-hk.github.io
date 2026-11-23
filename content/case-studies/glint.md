---
title: "Glint"
description: "An analytics prototype that collects in Next.js middleware, stores through one ingestion route into Postgres, runs on simulated traffic from a Cloudflare Worker and reads stored data first, with a labelled demo dataset as the fallback"
techStack: "Next.js, TypeScript, Prisma, PostgreSQL, Recharts, Cloudflare Workers"
---

## The idea

Most analytics tools start with a script in the browser that phones home on every page view. I wanted to see what analytics looks like when the browser does nothing at all: when the server that is already handling the request notes what it can see in the headers, writes it to a Postgres table I own, and a dashboard reads it back from the same database.

Glint is that experiment, end to end. Next.js middleware reads each page request's headers and posts the details to an ingestion route. The route validates them and writes them with Prisma. A set of small API routes read the tables back in shapes the charts can use, and a dashboard draws them with Recharts.

One thing to say plainly before anything else: the traffic on the live dashboard is simulated. Glint is a prototype with no real audience, so a Cloudflare Worker sends made-up visits on a schedule to keep the charts populated, and the dashboard says so on the page. Nothing you see there describes real people.

You can open it at [glint-dun.vercel.app](https://glint-dun.vercel.app), and the source is on [GitHub](https://github.com/Sammii-HK/glint). I wrote about the collection idea in more depth in [Analytics with zero extra network requests](/blog/analytics-with-zero-extra-network-requests-edge-middleware/).

## Collecting in middleware

The whole collector is one middleware function. It reads what Vercel and the browser already put on the request, builds four payloads and sends them to the ingestion route:

```ts
const geo = {
  city: req.headers.get('x-vercel-ip-city') || 'unknown',
  country: req.headers.get('x-vercel-ip-country') || 'unknown',
  region: req.headers.get('x-vercel-ip-region') || 'unknown'
};
const userAgent = req.headers.get('user-agent') || 'unknown';
```

Location comes from Vercel's geolocation headers, device type from a `mobile` test on the user agent, the browser from the first token of the user agent, the platform from `sec-ch-ua-platform`, and the source from `referer`, defaulting to `direct`. There is no cookie and no client script, which means no per-person identity at all: every request is a separate visit.

Two fields on the visit record are not measurements, and I want to be straightforward about them. A server cannot know how long someone will stay on a page or how fast their connection is from a single request, so the middleware fills `averageSessionDuration` and `averageNetworkSpeed` with random numbers. They exist so the record matches the schema the charts were designed around, not because they mean anything.

The sends are deliberately not awaited:

```ts
// Fire and forget - don't block response on analytics
Promise.all(
  payloads.map(data =>
    fetch(TRACK_ANALYTICS_ENDPOINT, { method: 'POST', /* ... */ })
      .catch(err => { /* log in development only */ })
  )
).catch(() => {});

return NextResponse.next();
```

The first version did the opposite. It `await`ed a single POST before letting the request through, which meant every page view waited on a database write before the page could start rendering. Analytics should never be the reason a page is slow, so the posts now start and the response carries on without them. The trade is that a send can be lost if the runtime stops before it completes, which is an acceptable loss for page-view counts and would not be for anything that mattered more.

The matcher is the other quiet but important line:

```ts
export const config = { matcher: '/((?!_next|api|favicon.ico).*)' };
```

Excluding `api` is not just tidiness. The middleware posts to `/api/trackAnalytics`; if it also ran on that path, each analytics post would trigger another round of analytics posts.

## What I tried first

The git history keeps a good record of the dead ends, because for a while they lived in the middleware file as commented-out blocks. One attempt imported `PrismaClient` directly into the middleware and wrote to the database from there. Middleware runs in a restricted runtime that a normal database client cannot run in, which is why the shape settled on middleware posting to an API route, and the route doing the writing.

Another attempt posted to six separate endpoints, one per table, including session and device tables. A third tried to read network quality from the `downlink` and `ect` client hint headers, which browsers only send when the server has asked for them. The very first version also captured the visitor's IP address from `x-forwarded-for`. That went in the same tidy-up, and Glint does not store addresses: country, region and city are all it keeps.

## One route, four tables

Every write goes through `/api/trackAnalytics`, which takes `{ type, payload }`, checks the type against a list of four, checks the fields each type needs, and writes to the matching Prisma model:

```ts
switch (type) {
  case 'average':
    result = await prisma.averageMetrics.create({ data: payload as AverageMetricsInput });
    break;
  case 'location':
    // country and city are required
    result = await prisma.locationMetrics.create({ data: locationPayload });
    break;
  // referral needs source, traffic needs sourceName
}
```

The schema is a table per question rather than one events table: visits with their hour, device and browser; locations; referrals; traffic sources; and separate session and device tables. Each panel's question then becomes a plain read of one table, which kept the read routes short. Errors are split usefully: a missing field is a 400 naming what is missing, a unique-constraint clash is a 409, and in production a 500 says "Internal server error" without echoing the database message back to whoever sent the request.

## The simulated traffic

A Cloudflare Worker named `glint-analytics-pump` runs on a cron trigger every ten minutes. Each run sends a batch of three made-up visits, each one a location, a referral and a traffic event, with countries, cities and referrers picked at random from fixed lists. The Worker only sends those three types; the visit records come from the middleware, and the session and device tables are filled by a separate historical-data script that also generates backdated records across every table.

The most useful thing the Worker taught me was about concurrency. Its first version sent each visit's three events with `Promise.all`. On Workers that produced deadlock warnings, and the fix that stuck had two parts: send the events one after another, and always read the response body, even though nothing uses it.

```ts
// Read response body to prevent deadlock warning
// We don't need the content, but must consume the body
await response.text();
```

Workers limit how many outgoing connections can be open at once, and a response whose body is never read keeps its connection busy. Consuming the body releases it.

The Worker also watches itself. After any batch with at least one successful send, it stores the time in Workers KV. At the start of each run it checks that timestamp, and if more than an hour has passed it sends a high-priority Pushover notification. Before that check, it deletes any timestamp more than two hours old, so the alert window is between one and two hours of silence: it tells me something stopped, then goes quiet rather than repeating forever.

## Reading the data back

Each read route answers one question over a defined window: visits from the latest 100 records, browsers and the hourly pattern from the latest 500, and sources, referrals and locations across everything stored. The dashboard then normalises every response through one function, and that function refuses to guess:

```ts
const { label, raw } = readRecord(key, item as Record<string, unknown>);
if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0)
  throw new Error("A metric value could not be read.");
totals.set(label, (totals.get(label) ?? 0) + raw);
samples.set(label, (samples.get(label) ?? 0) + 1);
```

A malformed record makes the panel an error with a reason, rather than quietly becoming a chart of zeroes that looks like an empty day. Dates are grouped by UTC day, hours must be integers from 0 to 23, and duplicate labels are combined. Most panels sum their values. Session lengths are averaged per day instead, which is why the function counts samples as well as totals. Devices are summed per type and shown as a share of the summed total, because the stored device percentages are not guaranteed to add up to a hundred.

## Stored first, demo as the fallback

The dashboard opens on stored data. All eight panel requests go out together, with `cache: "no-store"`, and share an abort signal that combines the component's own cancellation with a ten-second timeout:

```ts
const requestSignal = signal
  ? AbortSignal.any([signal, controller.signal])
  : controller.signal;
```

Each panel succeeds or fails on its own, so one broken route does not take the others down with it. Then one small rule decides what you see:

```ts
// The stored snapshot is used when at least one panel has rows. When every
// panel failed or came back empty, the dashboard falls back to the demo dataset.
if (list.some((panel) => panel.status === "ready" && panel.rows.length > 0))
  return { kind: "stored", panels };
```

If even one panel has stored rows, you get the stored snapshot, with errors shown on the panels that failed and a retry button on each. Only when nothing at all came back does the dashboard switch to the demo dataset, and it tells you why, with the reason it fell back. The demo dataset is a fixed fortnight of example traffic written into the source, with a comment above it that sets the rule I care about most: never merge it with stored records, and never call it real visitors. You can switch between the two yourself, and a provenance banner, announced to screen readers, always states which one you are looking at.

That banner went through more drafts than any chart. "Events from the collector, including simulated traffic" is the honest description of the stored view, and it is the sentence that stops a nicely drawn chart from implying an audience that does not exist.

## Charts that follow the theme

Recharts draws the time-based panels: an area chart for visits with a seven or fourteen day view, a second area chart for average session length, and bars for the hourly pattern. Sources, referrals, locations, devices and browsers are ranked lists instead, each row showing its number next to a bar sized against the largest value, with the top eight listed. Every chart has a "View the data" table beneath it, so nothing is only available as a shape.

Light and dark follow the system setting, and the part I enjoyed was not having to write any JavaScript for it. All of the colours are CSS custom properties, switched by a `prefers-color-scheme: dark` query, and the charts are SVG, so they can use the same variables directly:

```tsx
<stop offset="0%" stopColor="var(--chart-highlight)" stopOpacity={0.28} />
```

When the system theme changes, the browser re-resolves the variables and every gradient, gridline and axis label changes with it, without React re-rendering anything. Each gradient takes its ID from `useId`, so the definitions never collide on the page. A test reads `globals.css` itself, pulls out both themes, and checks that body and muted text reach 4.5:1 on every background and that the focus ring reaches 3:1, so a palette tweak cannot quietly break legibility in one mode.

## What it taught me

Collecting on the server is a small amount of code, and almost all of the interesting work sat around it: knowing which values a request can truthfully tell you and which it cannot, keeping the collector out of the page's way, and finding out that a Worker's open connections are a resource you have to give back. The lesson I would carry to any dashboard, though, is the one about provenance. A chart is persuasive whether or not its numbers are real, so the interface has to say where they came from every time, and it is far easier to build that in from the start than to add it to a chart that already looks convincing.
