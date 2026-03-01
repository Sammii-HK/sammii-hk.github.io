---
title: "Why I Switched From Prisma to Drizzle ORM (Six Months In)"
description: Prisma is excellent until it isn't. After six months with Drizzle on two production apps, here's what actually changed and what I'd choose again.
date: 2026-03-25
tags: [database, typescript, nextjs, indie-hacking]
draft: false
---

I used Prisma for the first version of Lunary. I switched to Drizzle for Spellcast. Six months later, both are in production. Here's what I actually learned.

## Why I switched

The honest answer: bundle size and cold start performance.

Lunary runs on Vercel. Prisma's query engine is a compiled Rust binary that ships as a dependency. In a Next.js App Router app, that adds meaningful cold start time on serverless functions. For a hobby-tier app trying to keep latency low, it was noticeable.

Drizzle has no query engine. It generates raw SQL and sends it directly to the database driver. The whole library is around 30KB. Cold starts are fast.

That was the original reason. Six months in, there are more.

## What Drizzle actually does differently

### Schema as code, not SDL

Prisma defines schema in its own SDL file (`schema.prisma`). Drizzle defines schema directly in TypeScript:

```typescript
// Prisma
model Post {
  id          String   @id @default(uuid())
  content     String
  scheduledFor DateTime
  status      PostStatus @default(draft)
}

// Drizzle
export const posts = pgTable('posts', {
  id:           uuid('id').defaultRandom().primaryKey(),
  content:      text('content').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  status:       postStatus('status').default('draft').notNull(),
});
```

The Drizzle version is just TypeScript. You can import it, extend it, compute derived types from it, and use it in conditions. The schema is a first-class object in your codebase rather than a separate file in a different language.

### Query building is composable

Drizzle queries are plain TypeScript expressions. You can compose them:

```typescript
// Base query
const baseQuery = db.select().from(posts).where(eq(posts.accountSetId, accountSetId));

// Conditionally extend it
const query = status
  ? baseQuery.where(eq(posts.status, status))
  : baseQuery;

// Add pagination
const results = await query.limit(50).offset(page * 50);
```

With Prisma, conditional query building requires building a `where` object and spreading it. It works but it's less ergonomic. Drizzle's approach feels closer to writing SQL directly.

### Migrations are SQL files you own

Running `drizzle-kit generate` produces a plain SQL migration file:

```sql
CREATE TABLE IF NOT EXISTS "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "content" text NOT NULL,
  "scheduled_for" timestamp NOT NULL,
  "status" "post_status" DEFAULT 'draft' NOT NULL
);
```

You see exactly what's going to run before it runs. You can edit it if needed. You commit it to git. The migration history is human-readable.

Prisma's migrations are also SQL, but the generated output can be more verbose and the tooling is more opinionated about the workflow.

## What Prisma still does better

### Relation handling

Prisma's include/select API for relations is genuinely better than anything I've found in Drizzle:

```typescript
// Prisma: clean and obvious
const post = await prisma.post.findUnique({
  where: { id },
  include: { accountSet: { include: { socialAccounts: true } } },
});

// Drizzle: more explicit, more verbose
const result = await db
  .select()
  .from(posts)
  .leftJoin(accountSets, eq(posts.accountSetId, accountSets.id))
  .leftJoin(socialAccounts, eq(socialAccounts.accountSetId, accountSets.id))
  .where(eq(posts.id, id));
```

For deeply nested relations, Drizzle requires more thinking about joins. Prisma's nested include syntax is genuinely easier to read.

### The Prisma Studio

Prisma Studio is a good local database browser. Drizzle Studio exists but is less mature. If you regularly need to inspect or edit data locally, Prisma's tooling is still ahead.

### Error messages

Prisma produces clear error messages with context. Drizzle's errors sometimes require you to know what the underlying SQL was doing. This is a minor point but it matters during debugging.

## Six months in: what I'd choose again

For **Spellcast** (Vercel-deployed Next.js, performance matters, complex schema): Drizzle. The bundle size, cold start performance, and composable queries are worth the join verbosity.

For **a simpler app or one not on serverless**: Prisma is probably still fine. The developer experience is more polished overall and the relation handling is easier.

The situation where I'd reconsider Drizzle: a team environment where less experienced developers need to write queries. Drizzle's SQL-adjacent API rewards knowing SQL; Prisma's API is more forgiving.

## The migration itself

Going from Prisma to Drizzle on an existing schema took about a day. The main steps:
1. Write Drizzle schema to match the existing Prisma schema
2. Generate a Drizzle migration snapshot (without running it, since the tables already exist)
3. Replace all Prisma queries with Drizzle equivalents
4. Remove Prisma from the dependency tree

The query replacement is the time-consuming part. Straightforward CRUD is fast to rewrite; complex queries with multiple relations take more thought.

If you're starting a new project today and you're deploying to serverless: start with Drizzle. The bundle size alone is worth it before you get to the ergonomics.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
