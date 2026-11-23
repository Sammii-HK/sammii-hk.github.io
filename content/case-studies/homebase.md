---
title: "Homebase"
description: "A private operations console for the products I run alone: live health, an approval queue with tiered autonomy, acknowledgements that stop finished work resurfacing, and a pixel-art world that follows the London sky"
techStack: "Next.js, React, TypeScript, WebAuthn, Service Workers, Push API, Canvas 2D, astronomy-engine"
---

## The problem

When you run several products on your own, the hard part is rarely writing the next feature. It is staying oriented. Which service is down, which scheduled post failed, which piece of AI-drafted content is waiting for a yes, which background agent has stalled. Before Homebase, all of that was spread across dashboards, log files and terminal tabs.

Homebase is the one screen that answers "what needs me right now". It is a Next.js app installed as a PWA on my phone and desktop, signed in with a passkey, with tabs for status, the review queue, money, job applications, chat and a small coding assistant. It also has a pixel-art view where the same live data is drawn as a little island with a pond, a garden and an office.

It is a private tool. It reads real operational data from my own systems, so there is no public site and no demo to link to, and the repository is private. What follows is a walk through the engineering, with excerpts from the source.

## Tiers of trust

Homebase can take actions as well as show things: retry a failed post, sync integrations, approve content, trigger a content run, deploy. The question I kept circling was how much of that should happen without me. The answer became a small policy module with four tiers:

```ts
export type AutonomyTier = "auto" | "notify" | "approve" | "escalate";

const DEFAULT_RULES: TierRule[] = [
  { action: "retry-post", tier: "auto" },
  { action: "approve-post", tier: "notify", scoreAbove: 85, scoreAboveTier: "notify" },
  { action: "approve-post", tier: "approve" }, // fallback for low-score posts
  { action: "deploy", tier: "escalate" },
  // ...
];
```

`auto` runs and logs. `notify` runs and sends me a push. `approve` goes into the queue for a tap. `escalate` is blocked until I explicitly confirm. The lookup is deliberately conservative:

```ts
const rules = config.rules.filter((r) => r.action === action);
if (rules.length === 0) return "approve"; // default: require approval for unknown actions
```

An action nobody has written a rule for falls to approval rather than to automation, so adding a new capability can never quietly make it autonomous. Score overrides are checked first, then the last matching rule wins, which lets one action have a cautious default and a more trusting rule above a quality score. The rules live in a JSON config written on first run, so I can retune them without a deploy, and every decision is appended to a capped log of 500 entries with the action, tier, whether it ran and why. The action route and the crons that act on their own all go through `canExecute` and `logTierDecision` first.

## A threshold that learns from my decisions

The content pipeline gives each draft a quality score, and drafts above a threshold can be approved automatically. A fixed threshold felt wrong: I did not actually know which number matched my own taste. So every approve and reject, manual or automatic, is logged with its score, platform and account, and a daily cron recalculates the threshold from that history.

The algorithm groups decisions into five-point score buckets and finds the lowest bucket where I approved at least 95% of the time:

```ts
for (const d of scored) {
  const bucketLower = Math.floor(d.score! / 5) * 5;
  const bucket = buckets.get(bucketLower) ?? { approved: 0, total: 0 };
  bucket.total++;
  if (d.action === "approve") bucket.approved++;
  buckets.set(bucketLower, bucket);
}
```

Buckets with fewer than three decisions are skipped, and the walk goes upwards from the lowest score, stopping at the first bucket that clears the target. There are guard rails around it. Below 20 scored decisions it returns the default of 85 with zero confidence. The result is clamped between 70 and 95, so it can never drift into approving almost everything or almost nothing. Confidence grows linearly to 1 at 100 decisions. Thresholds are calculated globally, per platform and per account, and the lookup prefers the most specific one only when its confidence is above 0.3, falling back to the platform, then the global value, then 85.

Even above the threshold, automatic approval is capped at three posts per account and platform per day. The fourth goes into the queue like anything else. If the global threshold moves by three points or more, the cron sends me a push saying so, so the system cannot change its own behaviour without me noticing.

## Not telling me twice

Once several detectors were feeding the same "today's plan" card, a new problem appeared: they described the same task in different words. One would talk about retrying failed posts, another about posts that failed to publish, and a background agent might already be working on it. The card filled up with repetition.

The fix has two halves. First, a keyword canonicaliser maps free text onto a stable subject ID. Each rule can require all of some terms, any of others, and none of a third set, and rules are scored by how many terms they match so the most specific one wins:

```ts
function scoreRule(haystack: string, rule: KeywordRule): number {
  if (rule.not?.some((term) => haystack.includes(term))) return 0;
  let score = 0;
  if (rule.all) {
    for (const term of rule.all) {
      if (!haystack.includes(term)) return 0;
      score += 1;
    }
  }
  // ...each matching "any" term adds one more
}
```

The `not` list matters: working through the engagement queue and replying to high-intent opportunities are different jobs, and the exclusion keeps one rule from swallowing the other. Text that matches nothing returns `null` and passes through untouched, because a wrong merge is worse than a duplicate.

Second, agents can acknowledge work. They append a line to an outbox file with a subject, a status and a timestamp, and Homebase reads it back:

```ts
if (entry.status === "in_progress" && age <= inProgressMs) return true;
if (entry.status === "done" && age <= doneMs) return true;
```

An item someone is working on stays hidden for two hours, and one that is done stays hidden for a day. After that it can surface again, which is the right behaviour if the problem comes back. Items sharing a subject collapse into the highest-scoring one, annotated with who last acknowledged it.

## Passkeys for a single user

WebAuthn is usually justified by scale. Here there is exactly one user, but the dashboard can approve content and trigger real actions on live systems, so the sign-in needed to be stronger than a password in a browser, not weaker because I am the only person using it.

Registration is locked down twice. It needs the server secret as a bearer token, and once a credential exists it refuses to register another:

```ts
if (!SECRET || token !== SECRET) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const alreadyRegistered = await hasCredential();
if (alreadyRegistered) {
  return NextResponse.json({ error: "Already registered" }, { status: 409 });
}
```

Challenges live in memory for 60 seconds and are deleted the moment they are read, so each one can only be used once. A successful authentication updates the credential's signature counter and sets an `httpOnly` session cookie holding a signed JWT. Scripts such as the heartbeat use the same secret as a bearer token instead. The health stream is an `EventSource`, which cannot send custom headers, so it accepts the session cookie that the browser sends automatically.

## Live, but not frantic

The dashboard fetches stats, heartbeat and alerts together with `Promise.all` once a minute, and skips the fetch entirely while the tab is hidden. When the tab comes back into view it fetches straight away, so a phone pulled out of a pocket shows fresh data without waiting for the next tick.

Service health is separate and faster. A server-sent events route pings each product's health endpoint every ten seconds, with a six-second timeout, and pushes the result down one long-lived connection. If the connection drops, the client waits fifteen seconds before reconnecting rather than hammering the server. One decision in there needed a comment of its own, explaining that Cloudflare blocks datacentre IPs and that the service is up:

```ts
if (res.status === 403) return { status: "ok", latencyMs };
```

The server Homebase ran on was being blocked by one product's edge protection. A 403 there means the edge answered, so the service is up. Reporting it as down would have trained me to ignore red.

## The caching saga

A PWA that shows live data has to be careful about what it caches. The service worker routes requests by strategy. Mutations are never touched. A short list of read endpoints (the briefing, approval queue, alerts, intelligence, calendar and performance) use stale-while-revalidate, so the app opens with the last known data and then updates. Hashed static assets are cache-first. The HTML shell is network-first and deliberately left out of the precache, because a cached shell would point at JavaScript chunks from an old build.

Getting updates to reach the phone took several attempts, and the git history shows each one. First, CI stamped the commit SHA into the first line of `sw.js` on every deploy, because a browser only reinstalls a service worker when its bytes change. The cache names carry a version constant, bumped by hand when old caches need clearing.

The last fix was not in the service worker at all. The root page had been prerendered as static, and the response carried a year-long `s-maxage`, so Cloudflare's edge kept serving an old login page across deploys. The page is now forced dynamic, and the config overrides the cache header on the two files that must never go stale:

```ts
return [
  { source: "/", headers: [{ key: "Cache-Control", value: NO_CACHE }] },
  { source: "/sw.js", headers: [{ key: "Cache-Control", value: NO_CACHE }] },
];
```

Everything under `/_next/static/` keeps its long cache, because those filenames change whenever their content does.

## A pond that shows system health

The pixel view started life as SVG rooms, one per product, with characters that reacted to live Claude Code activity through a hook. It was rebuilt as a canvas engine: a 32 by 19 grid of 16 px tiles, with an office, a garden and a river along the bottom five rows. Everything that stands up is pushed into one list with the y of its base and sorted before drawing, so characters pass behind trees and in front of desks. Characters find their way around with a breadth-first search over a walkability grid, and if they are sent to a blocked tile they aim for the nearest walkable neighbour instead.

Scenery is placed by a seeded FNV-1a hash, so the stars, clouds and floor texture land in the same places on every load instead of reshuffling.

The pond is the part I use most. Its state comes from a four-step health tier:

```ts
if (systemsUp === 0) return 3;
if (systemsUp < totalSystems - 1) return 2;
if (systemsUp < totalSystems || failedPosts > 0) return 1;
return 0;
```

At tier 0 the water is clear with ripples. As the tier rises the ripples slow and thin out and scum appears on the surface, until at tier 3 it is dark and brackish. The same drawing code renders a 64 by 64 crop of the pond into an offscreen canvas every animation frame and writes it into the favicon as a data URL, so the browser tab and the installed app's icon show system health without opening anything.

There were dead ends. Hand-drawn character sprites were replaced with an open-source CC0 sprite sheet that had proper walk and idle cycles. Tiled grass from a cosy sprite pack went in and came straight back out: the tiles had mismatched palettes and made a patchwork, so the hand-drawn grass returned. The newest addition is an ambient view where each group of background agents on my Mac mini is a building with a worker sprite, a running, idle and error count, and dots that travel along the lines between groups that hand data to each other.

## Light, dark and the actual sky

The interface follows the system colour scheme. The CSS is layered: primitive colours, then semantic tokens such as `--hb-bg-canvas` and `--hb-text-secondary`, then legacy aliases like `--hb-60` that older components still use. In light mode the semantic tokens and the aliases are redefined, so a component written for white-on-black text gets dark-on-cream without being touched. The dark translucent panels flip to white ones, a couple of Tailwind `bg-black` utilities are overridden directly, and the lilac accent switches to a deeper shade so it keeps its contrast on a pale background.

The pixel world ignores all of that on purpose. It follows the real sun over London. On load it imports `astronomy-engine`, computes sunrise and sunset for the day, adds 45 minutes of dawn and dusk either side, and caches the result per date. The current moment is then mapped onto the sky's colour keyframes:

```ts
} else if (nowMs >= sunriseMs && nowMs < sunsetMs) {
  const progress = (nowMs - sunriseMs) / Math.max(1, sunsetMs - sunriseMs);
  skyHour = 6 + progress * 12;
}
```

However long the day actually is, daylight is stretched or squeezed to fill the keyframes from 06:00 to 18:00, so a short December afternoon still gets a full sunset. At night the moon is drawn in its real phase.

## What it taught me

Homebase is the first thing I open in the morning, and it has changed how I think about automation. The useful questions were never "can this run by itself" but "how will I know what it did" and "how do I take the trust back". Unknown actions default to a human. A threshold that learns is clamped and announces its changes. Acknowledgements expire. Even the pond is an argument for showing state somewhere you will see it without looking for it.
