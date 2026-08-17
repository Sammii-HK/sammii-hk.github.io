---
title: "create-mcp-server"
description: "CLI scaffolder for Model Context Protocol servers"
techStack: "Node.js, TypeScript, tsup, Prompts"
---

## The problem

Every new MCP (Model Context Protocol) server starts from the same fifteen minutes: TypeScript configuration, the MCP SDK, Zod validation schemas, stdio transport wiring, and a dev mode with auto-reload, copied and adjusted from whatever project came before. None of that setup is specific to what the server actually does: it's the same scaffolding every time, which makes it a good candidate for automating away entirely. create-mcp-server is an `npx` scaffolder that generates a ready-to-develop MCP server in seconds, so that boilerplate stops being something to remember and starts being something to run.

## How it's built

### Prompts and validation

The CLI uses the Prompts library for interactive setup: project name, description, and a checklist of example tools to include. Input is validated as it's entered (no spaces in the project name, a non-empty description), with sensible defaults where it can fall back to them.

### Generating the project

Once the prompts complete, the scaffolder writes out a complete TypeScript project: a tsconfig.json in strict mode, a package.json with the MCP SDK as a dependency, a src/index.ts with stdio transport already wired up, Zod-validated example tool definitions, and npm scripts for build and dev mode. Which tools get included depends on the checklist, an echo tool, a file reader, a web fetcher, a calculator, each demonstrating a different MCP pattern (simple input/output, file system access, async operations, multiple parameters), and the selected ones are injected straight into the generated index.ts.

### The dev loop

The generated project ships with a dev script that watches for file changes and restarts the server automatically, using tsup's watch mode to recompile on save alongside a process manager that restarts the stdio server. The loop it's built for is: edit a tool, save, test immediately.

## Where it got hard

Two things about this project needed real problem-solving beyond writing the templates themselves.

The first was making sure the generated code stays valid TypeScript no matter which combination of example tools someone picks. With four optional tools and no fixed combination guaranteed, a templating engine felt like the wrong tool for the job. Instead, the generator uses a plain string builder that constructs the imports, tool definitions, and handler registrations directly from whichever tools were selected.

The second was harder to test for, because it only shows up once the package leaves my machine. For `npx init-mcp-server` to work reliably, the package has to declare its binary correctly, handle being run without a prior install, and behave the same way across Node.js 18 and up. Testing across different Node and npm versions turned up edge cases in npx's caching behaviour that needed explicit version pinning to avoid. The generated project itself has a parallel version of this problem: it builds with tsup, which handles TypeScript compilation, bundling, and declaration generation in one step, but getting that config to produce both ESM and CJS outputs with correct package.json exports took real iteration, because it had to work on whoever runs the generator's machine, not just mine.

## Outcome

`npx init-mcp-server` generates a fully configured MCP server project in under 10 seconds. The generated project compiles, runs in dev mode, and responds to tool calls immediately, removing the boilerplate barrier to building MCP integrations so the next step is implementing the tools that are actually specific to the project.
