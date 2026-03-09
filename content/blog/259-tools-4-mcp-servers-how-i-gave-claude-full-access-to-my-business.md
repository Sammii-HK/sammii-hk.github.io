---
title: '259 tools, 4 MCP servers: how I gave Claude full access to my business'
description: >-
  I built 4 custom MCP servers exposing 259 tools across social scheduling,
  product analytics, photo management, and blog publishing. Here's how they work
  together and what changed.
date: '2026-03-07'
tags:
  - mcp
  - claude
  - ai
  - indie-hacking
  - developer-tools
  - automation
draft: true
---
Back in March I wrote about building my first two MCP servers for Spellcast and Lunary. Two servers, maybe a dozen tools, enough to check metrics and schedule posts from a Claude conversation.

Three months later, I have four MCP servers exposing 259 tools. Claude can manage my social media across 8 platforms, pull real-time product analytics, browse and schedule photos from my macOS Photos library, and write and publish blog posts, all without me opening a single dashboard.

This is what it looks like when MCP stops being a novelty and becomes infrastructure.

## The four servers

### Spellcast MCP: 133 tools

Spellcast is my self-hosted social scheduling platform. The MCP started small (list posts, create posts, check analytics) and grew into a full operational layer.

**Content management** (posts, articles, dumps, templates, recurring posts): create, update, delete, duplicate, schedule, reschedule, publish, reject, approve. Bulk operations for batch scheduling and approval. Article publishing to Medium, Dev.to, and Hashnode with canonical URLs.

**Analytics** (engagement, followers, hashtags, best times, velocity): pull performance data for any account, any date range. Engagement trends, follower growth, hashtag analysis, post velocity, category breakdowns. Weekly digest generation.

**Brand voices**: each social account has a distinct AI persona. The MCP exposes CRUD for brand voices plus content generation that uses them. When Claude writes a tweet for @sammiihk, it pulls the voice profile first.

**Campaigns and A/B testing**: create campaigns, generate campaign posts from URLs, run A/B tests, evaluate results, apply winners. The test evaluation checks statistical significance before promoting.

**Automation**: autopilot configs, boost rules, RSS feeds, topic monitors, competitor tracking. Claude can configure what runs automatically and what needs manual review.

**Engagement**: list replies, comments, mentions across all platforms. Generate AI reply suggestions using the brand voice. Reply directly from the conversation.

The practical result: I can say "check engagement across all accounts, reply to anything worth replying to, and schedule three tweets about the new feature" and Claude handles the entire flow.

### Lunary MCP: 97 tools

Lunary is my astrology app with 250+ MAU and 2,000+ grimoire articles. The MCP covers product analytics, content, and the astrology engine itself.

**Product analytics**: DAU/WAU/MAU trends, MRR and revenue breakdowns, cohort retention, feature adoption, user segments, subscription lifecycle, plan breakdowns. Enough to run a full product review from one conversation.

**Growth and conversion**: funnel analysis, activation metrics, churn prediction, conversion influence tracking, CAC calculation, reactivation campaigns. The AI conversion tools surface patterns I'd miss manually.

**Content and grimoire**: search 2,000+ articles covering astrology, tarot, crystals, spells, and divination. Browse categories, get correspondences, look up placements and transits. This is what makes Lunary's content programmatic: the grimoire is structured data, not just blog posts.

**Astrology engine**: birth chart calculations, aspect analysis, transit tracking, house systems, numerology, tarot spreads. All powered by astronomy-engine (real ephemeris data, not lookup tables).

**Operations**: health checks, database status, cron job management, notification history, push subscriber management.

The tool I use most is `get_dashboard`. One call returns MAU, MRR, retention, feature usage, and trend direction. Every morning briefing starts there.

### Photos MCP: 22 tools

This one's unusual. It talks to macOS Photos via JXA (JavaScript for Automation), letting Claude browse, search, and manage my photo library.

**Albums**: list albums, get photos from specific albums, move photos between albums, remove from albums.

**Search and audit**: search by keyword, date, or metadata. Audit the concepts album to find unprocessed photos. Get unused photos that haven't been posted yet.

**Pipeline**: the real power. Six pipeline tools handle the full flow from Photos library to scheduled social post:

1. `sync_ready_to_albums`: moves approved photos into platform-specific albums
2. `sync_to_image_bank`: uploads to Spellcast's media library
3. `photos_to_spellcast`: generates captions using brand voice and schedules posts
4. `photos_carousel_to_spellcast`: builds multi-image carousel posts
5. `sparkle_photo_overlay_to_spellcast` / `sparkle_portrait_to_spellcast`: applies overlay effects before posting

**Usage tracking**: marks photos as used with timestamps, tracks usage history, prevents re-posting.

The workflow: "Find unused landscape photos from last month, pick 5 good ones, schedule them across the week with captions." Claude searches Photos, filters by unused status, generates captions in my voice, and schedules via Spellcast. I approve.

### Blog MCP: 7 tools

The simplest server. It manages the markdown blog on my portfolio site.

- `list_posts`: all posts including drafts
- `get_post`: full markdown content by slug
- `create_post`: new draft with frontmatter
- `update_post`: edit content or metadata
- `delete_post`: remove a post
- `publish_post`: flip draft to published

Seven tools, but they close the loop. When I write an article in a Claude conversation, it goes straight into the blog as a draft. Then Spellcast MCP publishes it to Hashnode and Dev.to with canonical URLs pointing back to my site.

## How they work together

The servers are independent, but Claude sees all of them simultaneously. That's where it gets interesting.

**Morning briefing**: Claude calls Lunary MCP for product metrics, Spellcast MCP for content queue status and engagement, Photos MCP for unused photo count. Returns a single summary.

**Article workflow**: I discuss an idea with Claude. It drafts the article, creates it via Blog MCP, publishes to external platforms via Spellcast MCP, and schedules companion social posts, all in one conversation.

**Photo content day**: Photos MCP finds unused shots, Spellcast MCP checks what's already scheduled to avoid clashes, generates captions using the right brand voice, schedules across platforms with optimal timing from the analytics tools.

**Performance review**: Lunary MCP pulls retention and feature data, Spellcast MCP pulls social engagement and content performance, Claude cross-references to find which content drives signups versus which just gets likes.

None of these workflows require me to open a browser. The context stays in one place.

## Architecture notes

All four servers use stdio transport (not HTTP). Each runs as a Node.js process that Claude Code spawns on demand. Configuration lives in `.claude.json`:

```json
{
  "spellcast": {
    "command": "node",
    "args": ["/path/to/spellcast-mcp/dist/index.js"]
  },
  "lunary": {
    "command": "node",
    "args": ["/path/to/lunary-mcp/dist/index.js"]
  },
  "photos": {
    "command": "node",
    "args": ["/path/to/photos-mcp/dist/index.js"]
  },
  "blog": {
    "command": "node",
    "args": ["/path/to/blog-mcp/dist/index.js"]
  }
}
```

Each server is self-contained. Spellcast MCP talks to the Spellcast API. Lunary MCP queries PostgreSQL directly. Photos MCP calls macOS via JXA. Blog MCP reads and writes markdown files on disk. No shared state between servers.

The Spellcast and Lunary MCPs use Zod for parameter validation. Tools are organised by domain into separate files (15 files for Spellcast, 14 for Lunary). Each file registers its tools with the shared server instance.

Photos MCP is the most unusual because it bridges Claude to a native macOS app. The JXA scripts run via `osascript` and return JSON. It's not the fastest (each Photos query takes 1-2 seconds), but it works reliably.

## What I'd do differently

**Start with the operations you do daily.** My first tools were analytics dashboards and post scheduling because I was doing those every morning. The exotic stuff (A/B test evaluation, churn prediction, photo pipelines) came later once the basics were solid.

**Group tools by workflow, not by API endpoint.** Early on I mirrored my REST APIs 1:1. That gave me hundreds of tools but Claude had to chain 5 calls for simple tasks. Better to have composite tools that handle common workflows in one call.

**Don't over-describe.** Claude is good at inferring what tools do from their names and parameter types. The tools I spend the most time documenting are the ones with non-obvious side effects.

**Keep servers independent.** I considered having Spellcast MCP call Photos MCP directly. Instead, Claude orchestrates between them. This is simpler, more debuggable, and means each server can evolve independently.

## The numbers

259 tools. 4 servers. Around 15,000 lines of TypeScript. Saves me an estimated 8-10 hours per week in dashboard time and manual operations.

More importantly, it removes friction. When checking metrics requires opening three tabs, you do it once a day. When it's one sentence, you do it ten times. The frequency changes the decisions.

---
