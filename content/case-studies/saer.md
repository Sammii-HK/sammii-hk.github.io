---
title: "Saer"
description: "Design-system intelligence grounded in the codebase, with evidence-backed guidance for coding agents. Live work in progress, currently in private beta."
techStack: "Python, TypeScript, CSS analysis, MCP"
---

## The product

Saer reads the design system that exists in a codebase: its declared tokens, components and how they are actually used. It shows where implementation diverges from that system, then makes the evidence available to coding agents through MCP.

It is live and in active development. The current private beta is for macOS on Apple Silicon; the public website explains the current access and installation options.

## The engineering

The local scanner checks declared foundations against real usage across CSS, Tailwind and React components. It produces a machine-readable system record and a report for people. The CLI packaging and the product website sit alongside the Python analysis engine.

An exact token bypass is different from a perceptual near-match. Saer keeps deterministic findings separate from inferred ones, and reports unresolved evidence rather than turning uncertainty into a pass. Its accessibility checks are static source checks, not a claim of WCAG conformance.

The MCP layer gives coding agents the reconstructed system and guidance backed by that evidence. Scanning is local and read-only. Optional cloud history stores reviewed summaries, while source code, reports and paths stay local.

## Where it stands

Saer is being used on real codebases, including Lunary and its own website. The live site labels the state of each capability and publishes a dated Lunary scan as a case study.

[Explore Saer](https://saer.app) or read the [Lunary scan case study](https://saer.app/case-studies/lunary).
