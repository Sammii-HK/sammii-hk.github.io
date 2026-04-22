---
title: "The 31 Vercel crons running a solo product"
description: >-
  Lunary runs on a schedule as much as on requests. This is what every one of
  those scheduled jobs actually does, how they fit together, and the patterns
  I use so a stuck cron does not take down the whole product.
date: '2026-06-10'
tags:
  - vercel
  - cron
  - nextjs
  - lunary
  - solo-dev
draft: false
---
Lunary is a solo SaaS. One engineer, one codebase, one Vercel project, one Postgres database. The product looks like a normal request-driven web app from the outside, but at least half of what it does on any given day is not triggered by a user at all. It is triggered by the clock.

The temptation, when you cross the point where "things need to happen on a schedule", is to reach for the big tools. A queue worker on a separate service. A Kubernetes cron operator. Temporal. SQS with a Lambda consumer. Sidekiq. They are all good tools. None of them are what a one-person product needs.

What I actually have is thirty-one Vercel cron endpoints, careful scheduling, and idempotency as the whole safety net. That is the architecture.

---

## The architecture is a JSON file

Vercel crons are declared in `vercel.json`. Each entry is a path, pointed at a route handler in the app, plus a cron expression. Vercel hits the endpoint on schedule. The endpoint is a normal Next.js App Router route, so it has full access to the database, environment variables, shared libraries, everything the rest of the app has.

That is the whole contract. There is no separate worker process, no message queue, no DLQ. The cron hits an HTTP endpoint. The endpoint does the thing. If it returns 200, Vercel marks it succeeded. If it throws or returns a non-2xx, Vercel marks it failed and logs the status.

Here is a slice of the real config:

```json
{
  "crons": [
    { "path": "/api/cron/generate-daily-tarot",      "schedule": "5 0 * * *" },
    { "path": "/api/cron/process-deletions",         "schedule": "0 2 * * *" },
    { "path": "/api/cron/update-global-cosmic-data", "schedule": "0 6 * * *" },
    { "path": "/api/cron/daily-morning-notification","schedule": "30 7 * * *" },
    { "path": "/api/cron/compute-metrics",           "schedule": "0 4 * * *" },
    { "path": "/api/cron/trial-reminders",           "schedule": "0 7 * * *" },
    { "path": "/api/cron/welcome-drip",              "schedule": "0 10 * * *" },
    { "path": "/api/cron/abandoned-checkout-drip",   "schedule": "5 10 * * *" },
    { "path": "/api/cron/pipeline-health",           "schedule": "0 22 * * *" }
  ]
}
```

Thirty-one of those entries, organised across the day. Let me walk through what they actually do.

## The real list, grouped by what they are for

**Content generation (4)**. `generate-daily-tarot` produces a card per active user at 00:05 UTC, respecting each user's timezone so they see a new card at their local midnight. `weekly-stories` and `weekly-carousels` produce Instagram content for the coming week early Sunday morning. `generate-weekly-challenge` publishes a community ritual prompt every Monday.

**Astrological calculations (5)**. `update-global-cosmic-data` refreshes planetary positions at 06:00, feeding the live transit widgets. `daily-cosmic-pulse` computes a "headline event" for the day at 14:00. `moon-circles` builds community content for the current moon phase at 20:00. `activate-retrograde-spaces` flips community spaces on and off as retrogrades begin and end. `compute-transit-dates` runs once a year at the stroke of the new year to precompute every notable transit for the coming twelve months.

**Analytics and business ops (6)**. `compute-metrics` rolls up DAU, WAU, MAU, MRR, activation events, retention cohorts at 04:00. `stripe-sync` reconciles the subscription table against Stripe at 03:00 so the product never trusts a stale local copy. `weekly-subscription-sync` does a deeper weekly reconciliation. `fx-drift` recalculates currency exposure once a month. `sync-seo-metrics` (handled via a separate path) pulls Search Console. `yearly-tarot-analysis` builds the "year in cards" retrospective on 1 January.

**Notifications and email (12)**. `daily-morning-notification` sends the day's horoscope push notifications at 07:30. `trial-nurture` and `trial-reminders` sit at 06:00 and 07:00 to walk users through their seven-day Pro trial. `welcome-drip`, `abandoned-checkout-drip`, `browse-abandon`, `post-upgrade-onboarding`, and `annual-renewal-reminders` are the lifecycle email stack, all firing in sequence between 10:00 and 10:20. `re-engagement` runs on a Monday/Wednesday/Friday schedule at 09:00 to wake up dormant users. And then there is a cluster of `announcement-email-*` crons (referrals, moon-circles, synastry, deeper-transits, light-mode-runes) that all fire at 14:00 and fan out one-off product announcements when their internal flag is set.

**Housekeeping (3)**. `process-deletions` runs GDPR erasure at 02:00 when traffic is lowest. `pipeline-health` runs at 22:00 and checks whether tomorrow's scheduled content actually exists in the right tables. `weekly-reading` builds the personal weekly tarot reading every Sunday morning.

**Social (1)**. `weekly-reading` could live here too but conceptually it is content. The Sunday carousels and stories also straddle the line. The truth is that the categories leak into each other, because that is how solo products work.

Thirty-one jobs. One engineer. No workers, no queue.

## Scheduling discipline: spread the clock

The easiest way to make Vercel crons fail is to schedule everything at `0 0 * * *`. Cold starts stack up, database connections pile into the pooler, and the first slow job makes every subsequent one start late.

The schedules above are spaced on purpose. Nothing fires exactly on the hour if it does not have to. `generate-daily-tarot` runs at five past midnight, not midnight, so the previous day's analytics have fully flushed. `compute-transit-dates` runs at 00:30 on 1 January, thirty minutes after `generate-daily-tarot` is likely to still be grinding through the timezone fan-out. Lifecycle emails stagger at minute 0, 5, 10, 15, 20 because each one queries the same user table and there is no reason to make them fight for rows.

The announcement emails all sit at 14:00 because they are idempotent one-shots with an internal "already sent?" flag. They are not really five separate jobs; they are five lightweight sweeps that mostly return early, so clustering them is fine.

## Idempotency is the whole safety net

The product does not own the exact timing. Vercel does. Crons can fire twice, three times, or occasionally zero times. A cron that fires twice must produce the same result as one that fires once. This is not optional; this is what keeps the product coherent.

Three patterns cover almost everything.

**ON CONFLICT upserts.** The most common one. When a cron produces a row per user or per day, the row has a natural key and the write is an upsert:

```sql
INSERT INTO daily_tarot_cards (user_id, local_date, card_id, seed, created_at)
VALUES (${userId}, ${localDate}, ${cardId}, ${seed}, NOW())
ON CONFLICT (user_id, local_date) DO UPDATE SET
  card_id = EXCLUDED.card_id,
  seed    = EXCLUDED.seed,
  created_at = EXCLUDED.created_at;
```

The `(user_id, local_date)` unique index is the discipline. A second run of the same cron recomputes the same card (because the seed is deterministic on user and date) and writes the same row. No duplicate cards, no duplicate notifications, no "you got two different tarot cards for Tuesday" support emails.

**Sent-event tables.** When a cron sends a notification or an email, "already sent" is an event, not a flag on a user. A single table, `notification_sent_events`, holds `(event_key, recipient_id, sent_at)` with a unique index on `(event_key, recipient_id)`. The cron checks before sending and writes after. Event keys look like `daily-morning-2026-06-10` or `trial-reminder-day-6-${userId}`. A replay of the cron finds the row, returns early, and nobody gets a duplicate email.

**State-check then update.** For jobs that mutate community state rather than produce new rows, the "did I already do this?" check is just a `WHERE` clause. `activate-retrograde-spaces` is a nice minimal example:

```ts
const activatedResult = await sql`
  UPDATE community_spaces
  SET is_active = true
  WHERE space_type = 'retrograde_checkin'
    AND starts_at <= NOW()
    AND ends_at   >= NOW()
    AND is_active = false
  RETURNING slug
`;
```

The `AND is_active = false` clause is the idempotency. Run this cron once, twice, or seventeen times; the set of spaces you activate is always the ones that need activating. No counters go wrong, no duplicate activity rows, no "welcome" messages to a space that is already open.

Every cron, bar none, has to pick one of these three patterns. If you cannot state which one a new cron is using, do not merge it.

## The failure mode that matters: silent succeeds

The scariest cron failure is not a thrown exception. It is a cron that returns 200 but did nothing, or did half of what it was supposed to. Vercel logs it as succeeded. The dashboard looks green. Users start complaining three days later about the feature that stopped working.

Two rules kill most of this.

**Never swallow errors silently inside a 200 response.** If a route catches an exception, it must decide whether the cron as a whole is still valid. Partial failure on a per-user fan-out can return 200 with a summary of counts, but a thrown exception in the outer handler must return 500:

```ts
} catch (error) {
  console.error('[cron-name] failed', error);
  return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
}
```

Vercel honours the status code. A 500 shows up as a failed invocation in the cron history. A swallowed exception that still returns 200 does not.

**Write a `cron_runs` table.** Console logs are fine until you want to answer "when did this cron last succeed?" and cannot query them. The table is trivial: job name, started_at, ended_at, status, error_message, summary jsonb. Each cron writes one row on entry (status `running`) and updates it on exit (status `success` or `error`). A separate cron, `pipeline-health`, sweeps the table and pings Discord if anything has been stuck in `running` for longer than its usual duration or if a `success` row has not appeared in the expected window.

That last cron is the one that catches everything else. It is worth more than any individual job.

## Logging is free, querying is not

Vercel's cron log UI is fine at Lunary's volume. What it does not let you do is answer questions. "How long does `compute-metrics` usually take?" "Did `weekly-carousels` produce anything last Sunday?" "Which trial-nurture send had a 90th-percentile email vendor latency?" Postgres rows let you answer all of these with a one-line query. Log lines in the Vercel UI do not.

The `cron_runs` row cost is one insert and one update per invocation. For thirty-one jobs running a handful of times a day each, that is a few thousand rows a month. It takes less database than one chatty user session. You get observability, alerting, and a basis for tuning all in the same table.

## Edge vs serverless, and memory

Vercel crons can target either edge or Node serverless functions. Edge is tempting: faster cold starts, lower cost, zippy-feeling. Most Lunary crons are not edge, and that is deliberate. Edge functions do not get the same database drivers, the same filesystem access, or the same runtime shape as Node. `compute-metrics` needs the full `@vercel/postgres` stack and does heavier analytics work. `pipeline-health` makes authenticated server-to-server API calls that want Node's fetch and a few shared libs.

What gets tuned instead is memory. The `functions` block in `vercel.json` pins memory per route:

```json
"functions": {
  "src/app/api/cron/pipeline-health/*.ts":          { "memory": 256 },
  "src/app/api/cron/activate-retrograde-spaces/*.ts": { "memory": 256 },
  "src/app/api/cron/process-deletions/*.ts":        { "memory": 256 }
}
```

256 MB is plenty for jobs that do a handful of small queries. The default (1024 MB) is wasted money on those. `generate-daily-tarot` and `compute-metrics` stay on the default because they genuinely use it.

## What I would change with more people

Vercel crons are the right answer at one engineer. They are not the right answer at ten.

At ten engineers you want a real queue (tasks can take longer than Vercel's timeouts allow), retries with backoff (not "it fires again tomorrow"), dead-letter queues (so a broken job does not silently miss a day), and a scheduler with first-class dependencies ("only run X after Y finishes"). Temporal, Inngest, or a Kubernetes CronJob setup all solve those problems and more.

None of that is free. They are weeks of setup, months of operational learning, and an ongoing bill. For a solo product at Lunary's traffic, the same result is a `vercel.json` with thirty-one entries, a small number of idempotency patterns, and a `cron_runs` table. The architecture is boring. The architecture works. That is the whole point.
