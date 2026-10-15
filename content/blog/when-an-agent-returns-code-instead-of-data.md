---
title: 'When an agent returns code instead of data'
description: 'One of my content agents returned placeholder code instead of data, and the system carried on for five cycles. What I changed so a plausible wrong answer stops at the boundary.'
date: '2026-10-15T16:35:00+01:00'
tags:
  - engineering
  - ai-agents
  - reliability
draft: false
---

Orbit is my multi-agent content system. A planner directs each run, and a Bash orchestrator runs the agents in sequence or in parallel. Most of the interesting problems in it are about what the agents write. This one was about what an agent returned.

## The failure

On 24 March 2026 the analytics agent returned placeholder code instead of data. Nothing crashed. The output file existed, the next agent read it, and the system carried on for five cycles.

That is the failure I now design for first. An agent that errors is easy to see: something exits with a failure and the run stops. An agent that returns something plausible but wrong is quiet, and every step after it treats the wrong thing as input.

## Check the shape after every run

The fix was output validation after every agent run, in the orchestrator itself. It asks three questions of each output:

- Is it valid JSON?
- Does it look like code instead of data?
- Is it an error object?

None of these are clever. They are the checks a person would make on opening the file. The difference is that the orchestrator makes them every time, so one agent's output only becomes the next agent's input once it has passed.

## One retry, then stop

Validation on its own turns a quiet failure into a loud one. That is better, but a run that halts is still a missed run. So the critical agents (analytics, scriptwriter, editor and researcher) get one retry, with an explicit instruction appended to the prompt, and the run halts only if the retry also fails.

Two ideas sit inside that rule. Criticality belongs to the agent, not to the failure: Orbit has agent criticality tiers, and the halt applies to the critical ones. And the retry is not the same call made twice. It tells the model what the output has to be, which gives a near miss a real chance to become a pass.

## Recovery has to be validated too

In May 2026 I fixed the next layer of the same problem. Some of Orbit's agents run on local models through Ollama. When a local model failed, the orchestrator restored that agent's last-good snapshot so the run could continue. A sensible fallback, except that nothing checked the snapshot. A last-good file that was not actually good would be copied straight back in.

So recovery now goes through the same kind of gate as a fresh run:

- The last-good snapshot is restored only if it passes that agent's schema check.
- A recovered agent shows as a concern in the health report, not as healthy.
- A content job fails if its output contains blocked content, instead of reporting success.

The second point matters more than it looks. A green health check that hides a fallback teaches you to stop reading the health check. Marking a recovery as a concern keeps the dashboard honest: the run finished, but something needed rescuing, and I want to see that.

## What I take from it

- Validate the shape of every handoff between agents, not only the final output.
- Treat "it returned something" and "it returned the right kind of thing" as different results.
- Give critical steps one retry with a clearer instruction, then stop.
- Put fallbacks and restored state through the same checks as fresh output.
- Report a recovery as a concern, so a rescue never looks like a clean run.

None of this needs a framework. The checks are a few lines of Python inside the Bash orchestrator. What it needs is the habit of asking, at every boundary, what a plausible wrong answer would look like, and refusing to pass it on.

More on Orbit: [sammii.dev/projects/orbit](https://sammii.dev/projects/orbit/)
