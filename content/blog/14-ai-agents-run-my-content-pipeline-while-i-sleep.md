---
title: 14 AI agents run my content pipeline while I sleep
description: >-
  How I built Orbit, an autonomous content command centre with 14 specialised AI
  agents that plan, create, score, and schedule content across multiple
  platforms without manual intervention.
date: '2026-03-07'
tags:
  - ai
  - automation
  - indie-hacking
  - claude
  - content
draft: true
---
Every morning I wake up to a dashboard showing me what my AI agents did overnight. Content scored and scheduled. Competitors analysed. Reply opportunities surfaced. SEO decay flagged. All without me touching a keyboard.

This is Orbit, my autonomous content command centre. It runs 14 specialised AI agents in a multi-stage pipeline, and it has fundamentally changed how I think about content.

## Why I built it

I was spending hours each day on the content treadmill: researching trends, writing posts, scheduling across platforms, replying to engagement, checking analytics, adjusting strategy. Each task on its own is manageable. Combined, they eat your entire day.

The obvious answer is "just automate it." But content automation usually means scheduling tools or basic templates. I wanted something that could actually think, that could look at what performed well yesterday and adjust what it creates today.

So I built a system where every stage of the content lifecycle has its own AI agent, each with a narrow focus and clear inputs and outputs.

## The 14 agents

Each agent is a specialised AI session with its own config file, its own MCP (Model Context Protocol) tools, and its own state. Here is the full roster:

| Agent | Role |
|-------|------|
| **Planner** | Runs first. Reads all state files, recent performance, and content calendar. Produces a plan with focus directives for every other agent. |
| **Analytics** | Pulls 7-day performance data, updates KPIs, evaluates A/B test results. |
| **Researcher** | Scans competitors via browser automation and APIs, identifies trends and hooks worth stealing. |
| **Scout** | Browses X, Threads, and Reddit for high-momentum posts with low reply counts, perfect for early engagement. |
| **Engager** | Processes replies and mentions, scans discovery feeds, drafts contextual responses. |
| **Reply analyst** | Analyses which replies performed best, extracts winning patterns, promotes high-performers to standalone posts. |
| **SEO optimiser** | Pulls Google Search Console data, identifies declining pages, content gaps, and low-hanging fruit. |
| **Optimizer** | The feedback brain. Writes learnings back into other systems, manages trending topics, feeds A/B winners into performance configs. |
| **Scriptwriter** | Generates content across three brand personas. Creates A/B tests for hooks and timing. Uses image generation APIs for visual assets. |
| **Editor** | Scores every piece of content on a 10-dimension rubric: hook quality, brand voice, platform fit, emotional resonance, specificity, engagement architecture, CTA effectiveness, readability, originality, and content-market fit. |
| **Scheduler** | Takes approved content and schedules it at optimal times based on platform-specific data. |
| **Conversion analyst** | Tracks which content actually drives signups and revenue, not just vanity metrics. |
| **Paywall strategist** | Analyses premium content performance and optimises the free-to-paid content funnel. |
| **GTM researcher** | Monitors go-to-market signals, competitor launches, and market positioning opportunities. |

## How they coordinate

The agents do not run in a free-for-all. The orchestrator script manages a structured pipeline with parallel stages:

```
Planner
  → Analytics
    → [Engager + Researcher + Scout + Reply analyst + SEO optimiser] (parallel)
      → Optimizer
        → Scriptwriter
          → Editor
            → Scheduler
```

The planner runs first and sets the agenda. If X engagement dropped 23% this week, the planner tells the researcher to focus on algorithm changes, tells the scriptwriter to prioritise thread-format content, and tells the scout to target high-momentum tweets.

After analytics gathers the numbers, five agents run in parallel because they do not depend on each other. The researcher scans competitors while the scout browses for reply opportunities while the SEO optimiser checks Search Console.

Once all five finish, the optimizer synthesises their findings into actionable directives. Then the scriptwriter creates content informed by everything upstream. The editor scores it. The scheduler publishes what passes.

## The scoring rubric

The editor is arguably the most important agent. It scores every piece of content across 10 dimensions with platform-specific weightings. A TikTok post weights hook quality at 22% because the first two seconds decide everything. A Threads post weights engagement architecture at 16% because it is a conversation-first platform.

Quality gates are strict:

- Below 50: rejected outright
- 50 to 65: sent back for revision
- 65 to 80: approved for scheduling
- Above 80: prioritised for peak posting times

Content that scores below 65 goes back to the scriptwriter with specific feedback on which dimensions fell short. Maximum two revision cycles before it gets rejected entirely.

## Checkpoint and resume

The pipeline takes time. If an agent fails halfway through, I do not want to restart from scratch. Every agent writes a checkpoint on completion, and the orchestrator can resume from exactly where it left off.

Agents also have criticality tiers. The planner, analytics, scriptwriter, editor, and scheduler are critical; if they fail, the pipeline stops. Research and SEO agents are enrichment tier; if they fail, the pipeline continues with reduced intelligence. The engager and reply analyst are optional; failures are silently skipped.

## The tech stack

Orbit is deliberately simple:

- **Shell script orchestrator** that spawns Claude Code SDK sessions as agents
- **JSON files** for inter-agent communication (no database, no message queue)
- **Node.js server** serving the dashboard and state API on port 3001
- **Static HTML/CSS/JS dashboard** with a dark theme, polling state every 5 seconds
- **MCP configs** giving each agent only the external tools it needs

Each agent gets a `--strict-mcp-config` flag so the scriptwriter can access content tools but not analytics, and the SEO optimiser can access Search Console but not social scheduling. Least privilege, applied to AI agents.

The dashboard has six pages: overview, research findings, pipeline status, performance metrics, agent details, and SEO intelligence. Everything updates live. I can see at a glance which agents are running, what they found, and what content is moving through the pipeline.

## The feedback loops

The part I am most proud of is how the system learns from itself. The optimizer agent closes multiple feedback loops:

1. It writes insights back into the product (Lunary) so the app's own cron jobs benefit from content learnings
2. It feeds trend reports to the video content pipeline so automated videos reflect current topics
3. It tags underperforming posts with failure reasons and stores them in a failure library, which the scriptwriter checks before creating similar content
4. It evaluates A/B tests after 24 hours and feeds winners into the performance config

The system gets measurably better over time because every run incorporates learnings from the last.

## What I have learned

Building Orbit taught me that AI agent systems do not need to be complex infrastructure projects. Shell scripts, JSON files, and the Claude Code SDK got me further than any framework would have.

The key insight: narrow agents with clear interfaces beat general-purpose agents every time. Each of my 14 agents does one thing well. They communicate through files on disk. The orchestrator is a bash script. And it works.

If you are drowning in content work and thinking about automation, start with one agent that does one thing. Add a second that reads the first one's output. Before you know it, you have a pipeline.

See you tomorrow. I will be sleeping while my agents handle it.

, Sammii
