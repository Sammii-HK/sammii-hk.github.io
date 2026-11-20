---
title: "create-mcp-server"
description: "A small CLI that turns selected examples into an editable TypeScript MCP server with a stdio entry point."
techStack: "Node.js, TypeScript, MCP SDK, Zod, Prompts, tsup"
updated: "2026-11-20"
status: "Packaged CLI; source reviewed at a699c5d. Generated-project execution was not rerun in this review."
---

<!-- Kept in step with the canonical structured study in create-mcp-server.json. -->

Packaged CLI; source reviewed at a699c5d. Generated-project execution was not rerun in this review.

## Automate the repeated starting point

The CLI collects a project name, description and a selection of examples, then writes the package, TypeScript configuration, README, server entry and selected tool modules. It checks for an existing target directory before writing. The generated files remain ordinary source that a developer can change.

## Show a protocol pattern in a small module

The current examples are hello, calculator, notes and summarise. Calculator demonstrates numeric Zod inputs. Notes uses an in-memory map exposed through tools. Summarise splits text into sentences and selects a bounded number of them; it does not invoke a model. Each selected module contributes its own import and registration in the server entry.

## Generate explicit tool modules

Optional examples should leave a readable entry point and a clear place to implement the next tool.

- **Put every example in one large generated handler:** The starting file would accumulate examples the developer might not need.
- **Write only selected modules and registrations (chosen):** A small lookup maps choices to template functions and module filenames. The entry generator includes the corresponding imports and registration calls.

The developer can inspect one example, remove it or add another without learning a custom runtime supplied by the scaffolder.

## Separate the CLI build from the project it creates

tsup builds the scaffolder as an ESM Node entry with a shebang. The generated project instead uses TypeScript compilation and a tsx development command. It starts an MCP SDK server over stdio. The reviewed development script runs the entry directly; automatic watching and dual ESM/CJS output are not established by those templates.

## Installation is part of the workflow

After writing files, the scaffolder chooses pnpm when available and otherwise npm, installs dependencies and attempts an initial Git commit. That makes dependency failures a user-facing boundary. The next tool pass should verify name validation for both prompted and positional input, cancellation, installation errors and generated-project behaviour across supported environments. This review read the source only and makes no generation-time or compatibility benchmark claim.
