---
title: "create-mcp-server"
description: "CLI scaffolder for Model Context Protocol servers"
techStack: "Node.js, TypeScript, tsup, Prompts"
---

## The problem

Every new MCP (Model Context Protocol) server starts with the same setup: TypeScript configuration, the MCP SDK, Zod input schemas, stdio transport wiring and a development loop, usually copied from whichever project came before. None of it is specific to what the server does. init-mcp-server is an `npx` scaffolder that writes that setup for you, so the first thing you edit is a tool, not a config file.

## How it's built

### Prompts and validation

The CLI asks for a project name, a description and which example tools to include. The name can also be passed as an argument, and both routes go through the same validation: lowercase letters, numbers and hyphens, so a name can never escape the current directory or inject anything into the generated source. The description is written with JSON serialisation for the same reason.

### Generating the project

The scaffolder writes a strict TypeScript project with the MCP SDK and Zod, a `src/index.ts` that connects a stdio transport, and one file per selected example under `src/tools/`. There are four examples, each showing a different MCP pattern:

- **hello**: a tool with no parameters
- **calculator**: add and multiply, with Zod validating the input
- **notes**: create and list notes held in memory
- **summarise**: select sentences, with an optional limit

The server entry imports and registers only the tools that were selected, so any combination compiles. The generated project builds with `tsc` and develops with `tsx watch`, which restarts the server when a file is saved.

## Where it got hard

The hard part was everything that happens outside the happy path, on someone else's machine.

A scaffolder writes into a real directory, so it must never overwrite anything. It refuses existing directories and symlinks, rejects unknown example names before it creates a single file, and removes duplicate selections. If the dependency install fails, it keeps the generated project, explains how to finish the install, and skips the git commit rather than committing a broken state.

The package manager was a quieter trap. The CLI used pnpm whenever pnpm was installed, even when launched with `npx`, and pnpm 10 and later stop an install until a dependency's build script is approved. tsx depends on esbuild, which has one, so a pnpm install failed on a fresh project. The CLI now installs with whichever package manager launched it, and pnpm projects get a workspace file that approves esbuild for both pnpm 10 and 11.

## Verification

Seven regression tests run against the built CLI: unsafe names through the real command, unsafe targets and unknown tools, existing directories and symlinks, the generated files for every example, recovery from a failed install, package manager detection and the pnpm approval.

Beyond the tests, a real MCP SDK client connected to a freshly generated server over stdio. It listed six tools (hello, add, multiply, create-note, list-notes and summarise), each one worked, and invalid calculator input was rejected. After the package manager fix, fresh projects generated through npm and through pnpm both installed and committed cleanly, and the npm one compiled and answered over stdio. This covers macOS with Node 23; it doesn't establish Windows behaviour or compatibility with every MCP client.
