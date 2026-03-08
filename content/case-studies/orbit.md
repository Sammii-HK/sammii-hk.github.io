---
title: "Orbit"
description: "Autonomous content command centre orchestrating 14 AI agents across a multi-stage pipeline"
techStack: "Node.js, Shell, Claude Code SDK, Windmill"
---

## The problem

Managing social media content across multiple brands involves a long chain of tasks: ideation, scriptwriting, editing, optimisation, scheduling, engagement monitoring, SEO analysis, and performance review. Each task requires different skills and context. Doing this manually for six brands across eight platforms is a full-time job. I wanted an autonomous system where specialised AI agents handle each stage, coordinating through a shared pipeline.

## Architecture

### 14 specialised agents

Each agent has a single responsibility: one writes scripts, another edits for tone, another optimises hashtags, another schedules at optimal times, another monitors engagement and drafts replies, and so on. Agents are defined as JSON configurations specifying their system prompt, available tools (via MCP), and input/output contracts.

### Windmill orchestration

Windmill manages the execution flow. Cron-triggered flows kick off the daily content pipeline at scheduled times. Event-driven flows respond to engagement notifications. Each flow defines the agent sequence, passes outputs between stages, handles retries on failure, and logs execution traces for debugging.

### Claude Code SDK

Agents execute via the Claude Code SDK, which provides structured tool use. Each agent receives its input (e.g. a content brief) and has access to specific MCP tools (Spellcast for scheduling, Lunary for analytics, Chrome for research). The SDK handles conversation management, tool call execution, and output extraction.

### Real-time dashboard

A Next.js dashboard shows the current state of all agents: which are running, which have completed, and what they produced. The pipeline view visualises the flow from ideation through publishing. Social metrics from Spellcast feed into the dashboard for performance tracking.

## Challenges

**Agent coordination**: Agents need to pass structured data between stages without losing context. The pipeline uses typed JSON contracts between agents. If the scriptwriter outputs a draft, the editor receives it with metadata about the target platform, brand voice, and content category. Getting these contracts right took several iterations.

**Failure recovery**: When an agent fails (API timeout, invalid output, tool error), the pipeline needs to retry intelligently. Windmill's retry logic re-runs the failed stage with exponential backoff. If an agent consistently fails, the pipeline alerts and skips that content piece rather than blocking the entire queue.

**Quality without review**: Fully autonomous content publishing requires confidence in output quality. Each agent includes self-evaluation in its output (confidence score, flagged concerns). Content below a confidence threshold is queued for human review rather than auto-published.

## Outcome

Orbit manages the entire content lifecycle for six brands autonomously. It generates, optimises, schedules, and monitors hundreds of posts per week. The agent architecture means adding a new capability (like a new platform or content format) only requires adding or updating a single agent definition, not rewriting the pipeline.
