---
title: "create-mcp-server"
description: "A small CLI that turns selected examples into an editable TypeScript MCP server with a stdio entry point."
techStack: "Node.js, TypeScript, MCP SDK, Zod, Prompts, tsup"
updated: "2026-11-20"
status: "Published CLI with a locally verified release candidate at fc0f2b0. The npm release has not been updated."
---

<!-- Kept in step with the canonical structured study in create-mcp-server.json. -->

Published CLI with a locally verified release candidate at fc0f2b0. The npm release has not been updated.

## Automate the repeated starting point

The CLI collects a project name, description and a selection of examples, then writes the package, TypeScript configuration, README, server entry and selected tool modules. The local release candidate validates prompted and positional names through the same rule and confines creation to a named child of the current folder. Existing directories and symlinks are preserved. The generated files remain ordinary source that a developer can change.

## Show a protocol pattern in a small module

The current examples are hello, calculator, notes and summarise. Calculator demonstrates numeric Zod inputs. Notes uses an in-memory map exposed through tools. Summarise splits text into sentences and selects a bounded number of them; it does not invoke a model. Each selected module contributes its own import and registration in the server entry.

## Generate explicit tool modules

Optional examples should leave a readable entry point and a clear place to implement the next tool.

- **Put every example in one large generated handler:** The starting file would accumulate examples the developer might not need.
- **Write only selected modules and registrations (chosen):** A small lookup maps choices to template functions and module filenames. The entry generator includes the corresponding imports and registration calls.

The developer can inspect one example, remove it or add another without learning a custom runtime supplied by the scaffolder.

## Separate the CLI build from the project it creates

tsup builds the scaffolder as an ESM Node entry with a shebang. The local candidate generates a project with TypeScript compilation, a tsx watch development command and an MCP SDK server over stdio. Its template starts at the tested MCP SDK 1.32.2 and Zod 4.6.6. This is an SDK v1 integration; it makes no dual ESM/CJS output or SDK v2 compatibility claim.

## Installation is part of the workflow

The scaffolder chooses pnpm when available and otherwise npm. If dependency installation fails, it preserves the generated files, explains the recovery command and stops before Git initialisation. Unsupported example names are rejected before writing, and repeated selections are deduplicated. The package description is serialised as JSON rather than interpolated into a template string.

## One name, one validation path

- **What happened:** The earlier source accepted a positional project name without the same validation used by the prompt. Development mode also launched once while its description suggested watching.
- **Why:** The path into a workflow should not change which inputs are accepted, or what the advertised command does.
- **Fix:** The local candidate shares validation across both entry points, checks directory containment and generates a real watch command. Five regressions exercise the distributed CLI, unsafe targets and tool selections, existing directories and symlinks, generated examples and failed-install recovery.

## Test the server, not just the template

A fresh project generated from the local candidate was installed with lifecycle scripts disabled and compiled. A real MCP SDK client completed initialisation over stdio and listed six tools. It exercised hello, addition, multiplication, creating and listing in-memory notes, and bounded sentence selection; invalid calculator input was rejected. Both the scaffolder and that fresh generated project reported zero dependency advisories in this recorded check. This establishes one generated local server, not every operating system or MCP client.

> The generated-server receipt belongs to the local fc0f2b0 candidate. The earlier npm package and screenshots remain the old baseline until a separate release. No npm publication, source push, hosted service, model call or database operation was performed.
