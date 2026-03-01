---
title: "Why I Run Temporal on My £8 Server"
description: Cron jobs lose state when they crash. Queues lose messages when they restart. Temporal doesn't. Here's why I added a workflow engine to a single-server indie setup and what it actually solves.
date: 2026-04-01
tags: [devops, backend, indie-hacking, docker]
draft: false
---

There's a point in every indie product where you have jobs that need to run reliably: publish a post, send a notification, retry a failed API call. The standard answer is a cron job or a queue. Both work until they don't.

I run Temporal on the same £8 Hetzner server as everything else. Here's why, and what it actually buys.

## What cron jobs can't do

Cron jobs run on a schedule. If the job crashes halfway through, cron has no idea. The next run starts fresh with no knowledge of what happened before. If the server restarts during the job, the work is lost.

For Spellcast's publish pipeline, that's a real problem. Publishing a post to five platforms involves five separate API calls. If the server restarts after the third call, a naive cron implementation either re-publishes to all five (duplicates) or skips the remaining two (silent failure).

Queues are better: they persist messages and retry on failure. But basic queue implementations (Bull, BullMQ) still lose state on restart unless you've specifically configured persistence and your retry logic is correct.

## What Temporal does differently

Temporal is a workflow engine. You write workflows as ordinary code — async functions with await — and Temporal handles durability automatically. Every step is logged. If the process crashes, Temporal replays the workflow from the last checkpoint on restart.

```typescript
import { proxyActivities } from '@temporalio/workflow';

const { publishToTwitter, publishToLinkedIn, publishToInstagram } =
  proxyActivities<typeof activities>({ startToCloseTimeout: '30s' });

export async function publishPost(postId: string): Promise<void> {
  // Each activity is automatically retried on failure
  // If the process crashes between calls, Temporal replays from here
  await publishToTwitter(postId);
  await publishToLinkedIn(postId);
  await publishToInstagram(postId);
}
```

If the process crashes after `publishToTwitter` succeeds but before `publishToLinkedIn` runs, Temporal replays the workflow. Because the `publishToTwitter` activity completed and was logged, Temporal skips it and continues from `publishToLinkedIn`. No duplicates. No silent gaps.

## The activities

Activities are the individual units of work — the actual API calls, database writes, or external operations:

```typescript
export const activities = {
  async publishToTwitter(postId: string): Promise<void> {
    const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
    await twitterClient.post({ text: post.content });
    await db.update(posts)
      .set({ status: 'published', publishedAt: new Date() })
      .where(eq(posts.id, postId));
  },

  async publishToLinkedIn(postId: string): Promise<void> {
    // same pattern
  },
};
```

Activities have configurable retry policies. A Twitter API rate limit error gets retried with exponential backoff. A 404 (post not found) fails immediately with no retry. Temporal handles the retry loop so you don't have to.

## Running it on a single server

Temporal requires a server process and a worker process. The server manages workflow state; the worker executes activities.

In docker-compose:

```yaml
temporal:
  image: temporalio/auto-setup:latest
  ports:
    - "7233:7233"
  environment:
    - DB=postgresql
    - DB_PORT=5432
    - POSTGRES_USER=temporal
    - POSTGRES_PWD=${TEMPORAL_DB_PASSWORD}
    - POSTGRES_DB=temporal
  depends_on:
    - postgres

temporal-worker:
  build:
    context: .
    dockerfile: docker/worker/Dockerfile
  environment:
    - TEMPORAL_ADDRESS=temporal:7233
  depends_on:
    - temporal
```

The worker is a Node.js process that registers the workflow and activity implementations and polls Temporal for work:

```typescript
import { Worker } from '@temporalio/worker';
import * as activities from './activities';

const worker = await Worker.create({
  workflowsPath: require.resolve('./workflows'),
  activities,
  taskQueue: 'spellcast-publish',
});

await worker.run();
```

On a 4 GB VPS, Temporal takes around 300-400 MB of RAM at idle. Not nothing, but acceptable alongside Postgres and Redis.

## Triggering workflows

Scheduling a post creates a Temporal workflow execution rather than writing directly to a queue:

```typescript
import { Client } from '@temporalio/client';

const client = new Client({ connection: { address: 'temporal:7233' } });

await client.workflow.start(publishPost, {
  taskQueue: 'spellcast-publish',
  workflowId: `publish-${postId}`,
  args: [postId],
  // Schedule for the future
  startDelay: scheduledFor.getTime() - Date.now(),
});
```

The `workflowId` is deterministic based on the post ID. If the same post is accidentally triggered twice, Temporal deduplicates it by ID and the second call is a no-op.

## When is it actually worth it?

Temporal is real infrastructure. It adds operational complexity and RAM usage. For a simple product where jobs are short-lived, low-stakes, and infrequent, a cron job or basic queue is fine.

It's worth it when:

- Jobs span multiple external API calls that each need to succeed
- Silent failure is expensive (a post that doesn't go out when it should)
- You need long-running workflows (a scheduled post might be hours or days away)
- You want visibility: Temporal's UI shows every workflow, its state, history, and any errors

For Spellcast, publishing to five platforms with retry logic and deduplication was exactly the case. One silent failure in a publishing queue is worse than the overhead of running Temporal.

## What I don't use it for

Short, stateless jobs (generating a daily report, sending a single notification) still run as cron entries. Temporal's overhead isn't worth it for work that can simply be retried from scratch if it fails.

The rule: use the simplest tool that handles failure correctly. For many jobs, a cron job with a try/catch and a Slack alert is enough. Temporal is for the jobs where "crash halfway through" has meaningful consequences.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
