---
title: "Orbit"
description: "A content pipeline run as a team of specialised agents on local models"
techStack: "Node.js, Shell, Ollama (local models), launchd"
---

## The problem

Several brands, eight platforms, and a content pipeline with distinct stages: research, scriptwriting, editing, optimisation, scheduling, engagement and analysis. Each stage needs different skills and different context, and doing all of it by hand is a full-time job on its own. Orbit is what came out of trying to close that gap: rather than one person context-switching between kinds of task, specialised agents each take one stage and hand their work on.

## Architecture

### One job per agent

Each agent has a single responsibility: one writes scripts, another edits for tone, another optimises hooks and captions, another plans the schedule, another watches engagement. Agents are defined as JSON: a system prompt, the tools they are allowed to call, and what they receive and are expected to hand back.

### Local models, routed by role

Every agent runs on a local model through Ollama, chosen for the job. Gemma 3 27B writes and edits long-form scripts, Phi-4 writes short punchy hooks and captions, and Qwen 3 handles research, analytics, planning and structured tasks, with a smaller Qwen for quick JSON work. Running locally keeps the marginal cost of a run at zero and the drafts on my own hardware.

### Scheduled, not orchestrated by a platform

There is no workflow platform underneath. launchd jobs start each part of the pipeline on a schedule, research, creative work, engagement checks and self-review, and a shell orchestrator runs the stages in order and passes each one's output to the next.

### A control room

The page at orbit-live.sammii.dev shows the system's shape: every agent, its role, and the order work flows through them. The roster, roles and flow are the real ones. The activity on the page is simulated, and the page says so, because the real pipeline runs on a private machine.

## Where it got hard

Passing work between stages without losing context took several iterations. A raw draft handed from one agent to the next lost what it was for, so each piece of work travels with its target platforms and a variant for each platform alongside the text.

Local models also fail in ordinary ways: invalid output, a slow response, a tool erroring. Each run records which agents failed, so a bad output shows up in that run's summary instead of disappearing.

## Outcome

Orbit turns a content operation into software: a roster of narrow agents, each easy to change on its own, on models that cost nothing per run. Adding a capability means adding or editing an agent definition rather than rebuilding the pipeline.
