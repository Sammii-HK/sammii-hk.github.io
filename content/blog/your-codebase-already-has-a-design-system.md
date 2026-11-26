---
title: 'Your codebase already has a design system'
description: 'The design system a team actually has lives in its code, not its docs. Saer, a CLI I built, reads that system, and a read-only MCP server lets coding agents read it too.'
date: '2026-11-26T09:00:00+00:00'
tags:
  - design-systems
  - css
  - mcp
draft: false
---

A frontend codebase has a design system long before anyone writes one down. It is in the colours people reach for, the values that keep coming back, the tokens that get used and the ones that quietly stop being used. When a team does declare a system, the code keeps moving: a raw value lands next to the token it should have used, a near copy of a colour arrives, a role that clearly exists never gets a name.

Coding agents make this faster. An agent asked for a button may find the declared token and three raw values that look almost the same, with nothing to say which one is the system. Adding a fourth is the easy path.

## Two systems, one repo

Most projects have two design systems: the one that is declared, in config and custom properties, and the one that is in use. The useful question is not whether the code follows the declared system. It is what the system actually is, and where the two disagree.

Saer is a CLI I built to answer that. It scans an existing frontend codebase and infers the design system that actually exists. The private beta reads colour, type, spacing and the other foundations, and the components themselves: it takes the Tailwind config, CSS custom properties, the React components and how they are used, and reconciles them into one model of the system.

## What it reports

The findings are split by how sure Saer can be:

- Exact drift: a raw value in the code that is exactly the value of a declared token, so the token was bypassed. This is deterministic and the most trustworthy kind of finding.
- Dead declarations: tokens that are declared and never used.
- Near-match drift: a raw value close to a token but not the same. This is inferred, carries a confidence score, and is labelled experimental and kept apart from exact drift.
- Conflicts: the same variable declared with different values in the same context, also labelled experimental.
- Duplicate components: the same component name defined in more than one file, with the uses of each, so you know which one to keep.

I also tested whether the same model carries over beyond colour. It did. Type, spacing, radius, shadows and the other foundations use the same states and the same split between exact and inferred findings, and components get their own: variants passed but never declared, and call sites that restyle what a component already sets. Each area went into the beta only once its drift detection was as deep as colour's, because a report that is shallow in one place is harder to trust everywhere.

## Saying what it does not know

The worst output a tool like this can produce is not a missing finding. It is a confident wrong one, or a clean report built on no evidence.

Both happened during development. A CSS file that nested its dark and light themes inside one root block was read as flat, and a light value was reported as dark, as a known fact, with no warning. The fix was a structural CSS parser instead of searching the text for closing braces. Separately, a repo where Saer found no colour system at all was reported as fully resolved. The fix there was to judge evidence at the level of the whole report, as sufficient, partial or insufficient, so a report with nothing behind it cannot look clean.

Saer now separates two kinds of "I can't tell you". Unknown means the repo does not contain enough evidence to answer. Unresolved means Saer met something it cannot read yet. The second is a limit of the tool, so it is never turned into a question for the person reading the report.

## Same input, same report

Scanning is local and deterministic. No AI model runs at scan time, the free scan needs no account, and the only thing a scan writes is one output folder inside the scanned project. For the same repository and the same version, the report is identical apart from its timestamp, on every supported machine. A design system tool that gives a different answer on a different machine is not describing the system.

## Handing it to agents

The second half is a local MCP server over the scan. Before a task, a coding agent can ask which existing components, variants and tokens to build it from, with the evidence for each. After it writes, it can check only the lines it changed, against the same rules as the scan. The server reads the scan and the files, sends none of your code anywhere, and the only thing it can write is a fresh scan in that same output folder.

The rule that matters most is that the server can never upgrade a state. Unknown stays unknown, and an experimental finding never arrives as a fact. Before it writes a new value or a new component, a coding agent can read the tokens and components the codebase already has, the evidence for each, and what is still in doubt. That is the difference between an agent guessing at a system and an agent building with the real one.

## What I take from it

- Treat the code as the record of what the system is, and the docs as a claim about it.
- Keep exact findings and inferred findings apart, and label the inferred ones every time.
- Separate "the evidence is missing" from "the tool cannot read this yet".
- Treat a clean report on no evidence as a failure, not a pass.
- Give agents the system read-only, with the uncertainty attached.

Saer is in private beta. You can try the free colour scan or request early access at saer.app.
