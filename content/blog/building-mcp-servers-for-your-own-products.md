---
title: "I Built MCP Servers for My Own Products: Here's the Workflow"
description: Model Context Protocol exposes your product's API as tools Claude can call directly. Here's how I built Spellcast MCP and Lunary MCP, and why it changed how I manage everything.
date: 2026-03-09
tags: [mcp, claude, ai, indie-hacking, developer-tools]
draft: false
---

I used to manage my products through dashboards. Check analytics here, schedule posts there, pull metrics from another tab. Constant context-switching.

Now I do all of it by talking to Claude.

Not through some hacked-together integration: through MCP servers I built for my own products. Model Context Protocol is the standard Anthropic published for giving AI assistants structured access to external tools. I built servers for both Spellcast and Lunary. Here's how, and why it changed everything.

## What MCP actually is (in one paragraph)

MCP is a protocol that lets you define a set of "tools", which are functions with typed inputs and outputs that Claude can call during a conversation. Instead of copy-pasting data into a chat window, Claude calls your API directly and works with the live result.

The architecture: your MCP server exposes tools over stdio (or HTTP). Claude Code discovers them and can call them when relevant. You write the server once; it works in any MCP-compatible client.

## The Spellcast MCP

Spellcast is my social scheduling platform. The MCP server exposes the full API as typed tools:

```typescript
server.addTool({
  name: 'list_posts',
  description: 'List scheduled, published, draft, or failed posts with optional filters',
  parameters: z.object({
    account_set_id: z.string().optional(),
    status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
    limit: z.number().default(50),
  }),
  execute: async ({ account_set_id, status, limit }) => {
    const posts = await db.query.posts.findMany({
      where: buildWhereClause({ account_set_id, status }),
      limit,
    });
    return posts;
  },
});
```

What I can do from a Claude conversation:

- `list_posts`: see everything in the queue
- `create_post`: schedule new content
- `update_post`: edit scheduled posts
- `publish_article`: push articles to Dev.to and Hashnode
- `get_analytics`: pull engagement data
- `list_brand_voices` / `update_brand_voice`: manage AI personas
- `generate_content`: create post variations using my brand voice
- `list_account_sets`: manage posting personas

The practical workflow: I describe what I want, and Claude calls the tools. "Optimise the hooks on my scheduled tweets" becomes Claude reading every post, identifying weak openers, and rewriting them in batches.

## The Lunary MCP

Lunary is my astrology platform. The MCP exposes product analytics and content tools:

```typescript
server.addTool({
  name: 'get_dashboard',
  description: 'Get key product metrics: MAU, MRR, retention, feature usage',
  parameters: z.object({}),
  execute: async () => {
    const metrics = await getProductMetrics();
    return metrics;
  },
});
```

What I can do:

- `get_dashboard`: MAU, MRR, retention at a glance
- `get_dau_wau_mau`: engagement breakdown
- `get_feature_usage`: which parts of the app people actually use
- `get_cohort_retention`: how well I'm holding users over time
- `search_grimoire`: search the 2,000+ article content library
- `get_ai_insights`: patterns Claude surfaces from the data
- `predict_churn`: identify at-risk users

## What the workflow actually looks like

A typical morning:

**Me:** "Check Lunary metrics and tell me what's changed since last week."

Claude calls `get_dashboard`, `get_dau_wau_mau`, `get_cohort_retention`. Returns a summary. Surfaces what moved.

**Me:** "Schedule a thread about the SEO growth for the sammii account."

Claude calls `list_account_sets` to find the right persona, `get_brand_voice` to load my voice profile, `generate_content` to write five thread variations, presents them, waits for my pick, then calls `create_post` to schedule it.

**Me:** "Those tweets from February with weak hooks, fix them."

Claude calls `list_posts` for the date range, reads each one, identifies weak openers, writes improvements, calls `update_post` in batches.

No dashboards. No tab-switching. Just conversation with full product access.

## Building your own

```bash
npm install @modelcontextprotocol/sdk zod
```

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'my-product', version: '1.0.0' });

server.tool(
  'get_stats',
  'Get product statistics',
  {},
  async () => {
    const stats = await fetchMyProductStats();
    return { content: [{ type: 'text', text: JSON.stringify(stats) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

Wire it into Claude Code's settings:

```json
{
  "mcpServers": {
    "my-product": {
      "command": "node",
      "args": ["/path/to/my-mcp/dist/index.js"]
    }
  }
}
```

Your product's API is now accessible from any Claude conversation.

## Why it matters for solo founders

The power isn't just convenience. Claude can operate across your entire product context in a single conversation: read your analytics, read your content queue, read your brand voice, and produce work that's coherent across all of them without you manually bridging the gap.

I estimate MCP saves me 5-8 hours a week in dashboard time and manual data-pulling. More importantly, it removes the friction that stops small tasks from getting done. If checking metrics requires three tabs and a copy-paste, you do it less. If it's one sentence, you do it constantly and catch things early.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
