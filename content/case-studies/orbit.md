---
title: "Orbit"
description: "Autonomous content command centre orchestrating 14 AI agents across a multi-stage pipeline"
techStack: "Node.js, Shell, Claude Code SDK, Windmill"
---

## The problem

Six brands, eight platforms, and a content pipeline with eight distinct stages: ideation, scriptwriting, editing, optimisation, scheduling, engagement monitoring, SEO analysis, performance review. Each stage needs different skills and different context, and doing all of it by hand for six brands is a full-time job on its own. Orbit is what came out of trying to close that gap: rather than one person context-switching between eight kinds of task, specialised AI agents handle each stage, coordinating through a shared pipeline.

## Architecture

### Fourteen agents, one job each

Each agent in Orbit has a single responsibility: one writes scripts, another edits for tone, another optimises hashtags, another schedules at the best times, another watches engagement and drafts replies. Agents are defined as JSON configs: a system prompt, the MCP tools they're allowed to call, and an input/output contract specifying what they receive and what they're expected to hand back.

### Windmill runs the flow

Windmill is the orchestration layer underneath all of this. Cron-triggered flows kick off the daily content pipeline at scheduled times; event-driven flows fire in response to engagement notifications. Every flow defines which agents run in what order, passes outputs between stages, retries on failure, and logs execution traces for debugging.

### Claude Code SDK does the tool use

Agents execute through the Claude Code SDK, which handles the structured tool-use side: conversation management, tool call execution, output extraction. Each agent gets its input (a content brief, say) plus access to a specific set of MCP tools, Spellcast for scheduling, Lunary for analytics, Chrome for research, scoped to what that agent actually needs.

### A dashboard that shows the machine working

A Next.js dashboard surfaces what all 14 agents are doing at any given moment: what's running, what's finished, what it produced. The pipeline view traces the flow from ideation through to publishing, and social metrics pulled from Spellcast feed back in so performance sits next to the process that generated it.

## Where it got hard

Getting agents to pass structured data between stages without losing context took several iterations. The fix was typed JSON contracts: when the scriptwriter hands off a draft, the editor receives it bundled with metadata about the target platform, brand voice, and content category, not just the raw text.

An agent can fail for ordinary reasons (API timeout, invalid output, a tool erroring), and Windmill's retry logic re-runs the failed stage with exponential backoff. If an agent keeps failing regardless, the pipeline alerts and skips that specific content piece rather than jamming the whole queue behind it.

Fully autonomous publishing needs confidence in output quality. Each agent's output includes a self-evaluation: a confidence score and any flagged concerns. Anything below a confidence threshold gets queued for human review instead of going out automatically.

## Outcome

Orbit runs the entire content lifecycle for six brands without manual intervention, generating, optimising, scheduling, and monitoring hundreds of posts a week. Because the architecture is one agent per responsibility, adding a new capability, a new platform or content format, means adding or updating a single agent definition rather than touching the pipeline itself.
