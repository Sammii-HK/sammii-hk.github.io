---
title: >-
  I built a self-managing memory system for Claude Code (and it changed how I
  work)
description: >-
  How structured markdown files give AI agents persistent context, multi-agent
  coordination, and session continuity
date: '2026-03-06'
tags:
  - ai
  - productivity
  - claude-code
  - developer-tools
draft: false
---
Every time I started a new Claude Code session, I had the same problem: the agent had no idea what I'd been working on. It didn't know which branches were active, what decisions I'd made yesterday, or which bugs I'd already solved. I was constantly re-explaining context.

My "memory" was a single flat file (MEMORY.md) with a 200-line cap. It was a dump of random facts, project notes, and workarounds crammed together with no structure. Claude would load it, skip half of it, and miss critical details buried on line 147.

So I built something better.

## The problem with flat memory

Claude Code has a built-in memory system. It reads a `MEMORY.md` file from a project-specific directory on session start. That's useful, but it has limits:

- **200-line cap**: anything beyond that gets truncated
- **No structure**: facts about six different projects, infrastructure details, and content strategy rules all jammed into one file
- **No session continuity**: no record of what happened last session or what's in progress
- **No multi-agent coordination**: if you run multiple Claude agents in parallel (which I do constantly), they can't see what the others are doing

I run 4-5 Claude agents simultaneously across different projects. One might be refactoring Lunary's transit engine while another is setting up infrastructure and a third is auditing the content pipeline. They were all working blind, occasionally stepping on each other's files.

## The context layer

Instead of one flat file, I built a structured directory of markdown files that Claude reads and writes to continuously:

```
~/.claude/projects/.../memory/
  MEMORY.md              # Index (routing table, <100 lines)
  active-work.md         # Live multi-agent coordination
  live-metrics.md        # Auto-updated product metrics
  projects/
    lunary.md            # Per-project state
    spellcast.md
    content-creator.md
    ...
  worklog.md             # Rolling session history (last 30)
  decisions.md           # Architecture decisions with rationale
  infra.md               # Servers, ports, LaunchAgents, credentials
  gotchas.md             # Known bugs and workarounds
  social.md              # Social accounts, publishing config
  content-strategy.md    # Growth strategy, content rules
  writing-rules.md       # Style guide
```

### MEMORY.md becomes a routing index

Instead of cramming everything into 200 lines, MEMORY.md is now a short table of contents. It points Claude to the right file for the current task:

- Working on Lunary? Read `projects/lunary.md`
- Writing social content? Read `social.md` + `content-strategy.md` + `writing-rules.md`
- Debugging something? Check `gotchas.md` first

This means everything gets read because it's targeted. Claude doesn't skip your social media account IDs when it's debugging a database migration, and it doesn't miss your gotchas file when it's writing a blog post.

### active-work.md: the multi-agent coordination file

This is the part that actually changed my workflow. `active-work.md` is a live file that every agent reads on startup and updates continuously:

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
```

When I start a new agent, it reads this file and immediately knows what's happening across the whole workspace. It knows which files to avoid, what's blocked, and where other agents are stuck.

The key rule: **update continuously, not at session end**. Agents write to `active-work.md` when they start a task, update it when their status changes, and remove their entry when they finish. If an agent crashes mid-session, the entry stays, so the next agent knows there might be uncommitted changes.

### Project files track live state

Each `projects/<name>.md` follows a consistent structure:

- **Status**: active, paused, or shipped
- **Current work**: what's being worked on right now
- **Recent changes**: last 10 meaningful changes with dates
- **Active branches**: any open feature branches
- **Blockers**: anything stuck
- **Key facts**: stack, ports, gotchas specific to this project

These get updated as work happens, not at session end. When I switch from one agent to another, the second agent can read the project file and see exactly what the first one just did.

### Decisions log captures the "why"

One of the most useful files. `decisions.md` records architecture and tech choices with rationale:

```markdown
## 2026-03-06 - Windmill over custom cron
- Chose Windmill for job orchestration over raw LaunchAgents
- Reason: need retries, error visibility, scheduling UI
- Running locally because Chrome-dependent jobs need Mac
```

Three weeks from now, when I've forgotten why I chose Windmill over a simple cron job, the answer is right there. Every new agent reads it and understands the constraints without me explaining them again.

### Gotchas prevent re-solving solved problems

`gotchas.md` is the file I wish I'd had from day one. It captures things that break repeatedly:

- The Remotion source-map directory that pnpm creates empty (and the copy command that fixes it)
- The better-auth version that must stay pinned because of a zod conflict
- The Prisma JSON field that double-encodes if you stringify before passing to the update

Every time Claude hits one of these, instead of spending 20 minutes debugging, it checks gotchas first and finds the fix immediately.

## Wiring it up across projects

The context layer lives in a shared directory, but Claude agents launched in subdirectories won't automatically find it. Each project needs two pointers:

1. **Project CLAUDE.md** gets a "Context Layer: READ FIRST" block at the top pointing to the shared memory directory
2. **Project-specific MEMORY.md** (in Claude's project memory directory) tells the agent to read the shared files

This means an agent launched in `~/development/lunary/` will:
1. Read `lunary/CLAUDE.md` and see "read the context layer"
2. Read its project-specific MEMORY.md and see "read active-work.md and projects/lunary.md"
3. Check what other agents are doing
4. Start work with full context

## The protocol

The instructions in CLAUDE.md define a simple protocol:

**Session start:**
1. Read the index (MEMORY.md)
2. Read active-work.md (what's happening right now)
3. Read the relevant project file
4. Check gotchas.md if debugging

**During work:**
- Update active-work.md when you start or finish tasks
- Update project files immediately when meaningful changes are made
- Add gotchas the moment you discover them
- Add decisions when they're made

**Session end:**
- Remove your active-work.md entry
- Append a summary to worklog.md

The critical insight: **continuous updates, not batch updates at session end.** If an agent only writes at the end, a crash loses everything. And more importantly, other agents running in parallel can't see what's happening until it's too late.

## What changed

Before this, starting a new Claude session felt like onboarding a new contractor every time. Now it feels like resuming a conversation. The agent knows what I was doing yesterday, what decisions I've made, what's broken, and what my other agents are working on right now.

The multi-agent coordination alone was worth it. I regularly run agents in parallel across Lunary, Spellcast, and my content pipeline. Before `active-work.md`, they'd occasionally both try to modify the same config file or duplicate work. Now they check what's in progress and route around it.

The whole system is just markdown files in a known location. No database, no external tools, no dependencies. Claude reads and writes markdown natively, so there's zero friction. It took about an hour to set up and has saved me from re-explaining context in every single session since.

## Try it yourself

If you use Claude Code across multiple projects, the minimum viable version is:

1. Create a `memory/` directory in your Claude project config
2. Put a MEMORY.md index that points to topic files
3. Create an `active-work.md` for multi-agent coordination
4. Add "read the context layer" to each project's CLAUDE.md
5. Tell Claude to update these files continuously, not just at session end

The files are just markdown. You can read them yourself, edit them, or use them as documentation. They're version-controllable if you want history. And because Claude writes them in the same format it reads them, the system maintains itself.

The best part: the context layer I built today will be the first thing tomorrow's Claude session reads. It already knows what it is, how it works, and why I built it.

---
