---
title: >-
  I built a hive mind for my AI agents (and they coordinate better than most
  teams)
description: >-
  How 7 MCP servers, a local brand API, and 16 files of shared memory let my
  Claude agents work across 10 projects without stepping on each other
date: '2026-03-10'
tags:
  - ai
  - productivity
  - claude-code
  - developer-tools
  - series-ai-hive-mind
draft: false
---
I run 4-5 Claude Code agents simultaneously. One is refactoring my astrology platform's transit engine. Another is publishing articles across four blog platforms. A third is generating TikTok videos with ML-scored engagement predictions. A fourth is autonomously building UI components, recording them, and posting to X.

They all share the same brand voice, the same knowledge base, the same metrics, and the same understanding of what the others are doing right now.

This is the system I built to make that work.

## What the hive mind actually is

It's not one thing. It's a network of interconnected systems that give every AI agent access to:

1. **Shared memory** across all projects (what's being worked on, what was decided, what's broken)
2. **140+ tools** via MCP servers (schedule posts, query analytics, publish articles, manage photos)
3. **A local brand API** that injects domain knowledge into every generation call
4. **Cross-account boost rules** that automatically amplify content between accounts
5. **Autonomous pipelines** that research, build, record, and publish without human input

Here's the full architecture:

```
Claude Code agents (4-5 concurrent sessions)
    |
    +-- Shared Memory Layer (16 markdown files)
    |   +-- active-work.md      <- live coordination
    |   +-- projects/*.md       <- per-project state
    |   +-- gotchas.md          <- known bugs
    |   +-- decisions.md        <- architecture choices
    |   +-- live-metrics.md     <- auto-updated daily
    |
    +-- MCP Servers (5 registered)
    |   +-- Spellcast MCP       <- 140 tools: posts, articles, analytics, AI content, boosts
    |   +-- Lunary MCP          <- 100+ tools: metrics, grimoire, OG images, video scripts
    |   +-- Photos MCP          <- 22 tools: album access, usage tracking, Spellcast pipeline
    |   +-- Blog MCP            <- 6 tools: personal blog CRUD + publish
    |   +-- Git MCP             <- standard git operations
    |
    +-- Brand API (localhost:9002)
    |   +-- Ollama (llama3.1:8b with brand system prompt)
    |   +-- 40+ grimoire JSON files (crystals, tarot, spells, zodiac)
    |   +-- 10 brand knowledge markdown files
    |   +-- Smart context injection (only loads relevant data per query)
    |
    +-- Open WebUI (localhost:8080)
    |   +-- 4 knowledge bases (Sammii Brain, Grimoire, Content Strategy, Tech Architecture)
    |   +-- 5 Python tools (brand knowledge, grimoire search, content engine, metrics, Spellcast)
    |
    +-- Autonomous Pipelines
        +-- Content Creator     <- video/carousel generation + ML scoring + Spellcast scheduling
        +-- Prism Pipeline      <- scout -> curator -> builder -> recorder -> publisher (daily)
        +-- Daily Metrics Cron  <- pulls DAU/MAU/MRR at 07:00, writes to live-metrics.md
```

Every piece connects to the others. Let me walk through each layer.

## Layer 1: shared memory (how agents coordinate)

The core problem: when I start a new Claude session, it has no idea what my other agents are doing. Two agents might both try to modify the same config file. One might re-solve a bug another already fixed.

The fix is a directory of markdown files at `~/.claude/projects/.../memory/` that every agent reads on startup and updates continuously as it works.

The critical file is `active-work.md`:

```markdown
## In Progress

### [lunary] - Refactoring transit engine
- **Started**: 2026-03-06 10:00
- **Doing**: Rewriting severity calculation
- **Files touched**: src/lib/transits.ts, src/lib/severity.ts
- **Status**: working

### [spellcast] - Article publishing pipeline
- **Started**: 2026-03-06 10:30
- **Doing**: Adding LinkedIn companion post generation
- **Files touched**: apps/api/src/routes/articles.ts
- **Status**: working

### [prism] - Design engineering component library
- **Started**: 2026-03-06
- **Doing**: Building MagneticButton component
- **Files touched**: prism/ (entire project)
- **Status**: working
```

Every agent checks this before starting work. Every agent updates it as status changes. Every agent removes its entry when done. It's a coordination protocol built entirely on file reads and writes.

The key insight: **continuous updates, not batch updates at session end.** If an agent crashes, its entry stays visible. If an agent finishes something, others see it immediately.

I'll cover the full memory system in Part 2 of this series.

## Layer 2: MCP servers (the tool network)

MCP (Model Context Protocol) lets Claude call external tools during a session. I have five servers registered, giving every agent access to the same capabilities.

### Spellcast MCP: 140 tools for content operations

Spellcast is my social media scheduling platform. Its MCP server exposes everything:

```typescript
// spellcast-mcp/src/index.ts
const server = new McpServer({ name: "spellcast", version: "1.0.0" });

registerPostTools(server);        // 30 tools: create, schedule, bulk operations
registerArticleTools(server);     // 6 tools: publish to Dev.to, Hashnode, Medium
registerAnalyticsTools(server);   // 9 tools: engagement trends, best times, velocity
registerContentTools(server);     // 15 tools: AI generation, variations, scoring
registerEngagementTools(server);  // 15 tools: replies, discovery, competitor tracking
registerBoostTools(server);       // 6 tools: cross-account amplification
registerAutopilotTools(server);   // 7 tools: autonomous post generation
registerBrandVoiceTools(server);  // 5 tools: per-account voice profiles
registerAbTestTools(server);      // 5 tools: content A/B testing
// ... plus campaigns, dumps, RSS, categories, system
```

This means any Claude agent, in any project, can schedule posts, publish articles, analyse engagement, generate AI content, and manage boost rules.

### Lunary MCP: 100+ tools for product analytics

The Lunary MCP connects directly to my admin API:

```typescript
// lunary-mcp/src/client.ts
async function lunary<T = unknown>(path: string, options = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/admin${path}`, {
    headers: { Authorization: `Bearer ${ADMIN_KEY}` },
  });
}
```

It exposes analytics (DAU/WAU/MAU, revenue, cohort retention, feature adoption), grimoire search (semantic vector search across 2,000+ articles), OG image generation with auto-scheduling to Spellcast, video script generation, and the Astral Guide AI chat.

The social tools bridge Lunary and Spellcast: Lunary generates OG images (horoscope cards, moon phase graphics, cosmic state visualisations), uploads them to Spellcast's CDN, generates AI captions, and auto-schedules with cadence guards.

### Photos MCP: macOS Photos to social pipeline

This one connects my local Photos.app library to the publishing pipeline. I can tell Claude "post unused photos from the Concepts album to Instagram" and it will browse my Photos library via `osxphotos`, find unused images, upload them to Spellcast, generate AI captions, and schedule them with cadence-aware timing. It tracks which photos have been used so nothing gets double-posted.

## Layer 3: the brand API (local knowledge injection)

Every AI-generated caption, comment, article, and boost reply needs to sound like me and know my domain. The Brand API wraps Ollama (running `llama3.1:8b` locally) and intelligently injects relevant knowledge into every LLM call.

The clever part is **smart context injection**. When a query comes in about crystals, it only loads crystal data. When it's about tarot, it loads tarot cards. It analyses the query against 40+ data requirement flags and builds a context payload within a 12,000 token budget:

```
POST /analyze { "query": "What crystals help with protection?" }

Response:
{
  "active": ["crystals", "correspondences", "moonPlacements"],
  "estimatedTokens": 7500
}
```

Spellcast uses this as the first choice for all content generation, falling back to DeepInfra if the local API is unavailable:

```typescript
// spellcast/apps/api/src/lib/deepinfra.ts
async function tryBrandApi(messages: ChatMessage[]): Promise<string | null> {
  const health = await fetch(`${BRAND_API_URL}/health`, {
    signal: AbortSignal.timeout(1000),
  });
  if (!health.ok) return null;
  
  const res = await fetch(`${BRAND_API_URL}/v1/chat/completions`, {
    method: 'POST',
    body: JSON.stringify({ model: 'sammii-brand', messages, temperature: 0.7 }),
  });
}
```

Free, local, brand-aware, and grimoire-grounded.

## Layer 4: cross-account boost rules

When my personal account (@sammiihk) posts, my brand account (@LunaryApp) automatically likes and comments within 3-15 minutes. And vice versa. The comments are generated with the brand voice of the commenting account:

```typescript
// spellcast/apps/api/src/lib/boost-queue.ts
async function generateBoostComment(rule, post, boosterAccountId) {
  const voice = await getBrandVoiceProfile(userId, boosterAccountSetId);
  
  const systemPrompt = `You are commenting as ${boosterAccount.name}.
    ${voiceProfileToPrompt(voice)}
    Write a genuine 1-2 sentence comment that references specific content.
    Never write generic comments like "Love this!" or "Great post!"`;
  
  return generateText([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Comment on: "${post.content}"` },
  ]);
}
```

The boost cron runs every 2 minutes, finds pending actions, and executes through Postiz's engagement API. Each action has a random delay so it doesn't look automated.

## Layer 5: autonomous pipelines

### Content Creator: AI video pipeline with ML scoring

The Content Creator generates TikTok videos and Instagram carousels from persona blueprints. It plans content via pillar rotation with trend mixing, generates scripts via the persona voice system, scores with an ML model (hookStrength weighted highest at 0.20), and auto-schedules to Spellcast.

### Prism: fully autonomous component pipeline

Prism builds UI components daily with zero input:

```bash
# prism/pipeline/orchestrator.sh auto
# scout (Haiku + Chrome)  -> browse X for UI interaction patterns
# curator (Sonnet)        -> pick today's component, write build brief
# builder (Sonnet)        -> build component, demo, registry, verify build
# recorder (Playwright)   -> 12s 1080x1080 video with organic cursor
# publisher (Haiku)       -> upload video + schedule tweet via Spellcast
```

Each agent passes data through state files. The scout writes findings, the curator reads them and writes a brief, the builder builds from it, the recorder captures it, the publisher posts it.

## How it all connects

Here's a real workflow that touches most of the system:

1. I tell a Claude agent "publish my latest article about transit calculations"
2. Agent reads `active-work.md` to check nothing conflicts
3. Agent calls Spellcast MCP `create_and_publish_article` with Dev.to + Hashnode targets
4. Spellcast auto-generates an X thread (via Brand API for voice-consistent content)
5. Spellcast auto-generates a LinkedIn companion post (scheduled for Tue/Wed/Thu 17:30)
6. Blog MCP publishes to the personal blog
7. When the X thread goes live, boost rules trigger: @LunaryApp auto-comments within 3-15 min
8. Agent updates `active-work.md` and `projects/spellcast.md`
9. Next morning, the metrics cron updates `live-metrics.md` with any traffic spike
10. Tomorrow's Build in Public post references real numbers from that file

One command. Eight platforms. Boost engagement. Metrics tracked. All coordinated.

## The numbers

- **5 MCP servers** registered, always available to every agent
- **260+ tools** across Spellcast (140), Lunary (100+), Photos (22), Blog (6)
- **16 shared memory files** for cross-agent coordination
- **40+ data sources** loaded by the Brand API based on query relevance
- **10 projects** connected through the same infrastructure
- **2 autonomous pipelines** generating and publishing daily

## What's next in this series

- **Part 2: The context layer** - shared markdown files for session continuity and multi-agent coordination
- **Part 3: Automated content at scale** - Content Creator pipeline, persona system, ML scoring
- **Part 4: Building a local brand API** - Ollama with smart context injection and grimoire knowledge
- **Part 5: The autonomous pipeline** - Prism's daily scout, curator, builder, publisher cycle

---
