---
title: "create-mcp-server"
description: "CLI scaffolder for Model Context Protocol servers"
techStack: "Node.js, TypeScript, tsup, Prompts"
---

## The problem

Setting up a new MCP (Model Context Protocol) server from scratch involves boilerplate: TypeScript configuration, the MCP SDK, Zod validation schemas, stdio transport wiring, and a dev mode with auto-reload. Every new server starts with the same 15 minutes of copy-pasting from a previous project. I wanted an `npx` scaffolder that generates a ready-to-develop MCP server in seconds.

## Architecture

### Interactive prompts

The CLI uses the Prompts library for interactive setup. Users provide a project name, description, and select from a list of example tools to include. The prompts validate input (no spaces in project name, non-empty description) and provide sensible defaults.

### Template generation

After prompts complete, the scaffolder generates a complete TypeScript project. The template includes: tsconfig.json with strict mode, package.json with MCP SDK dependency, a src/index.ts with stdio transport setup, example tool definitions with Zod schemas, and npm scripts for build and dev mode.

### Example tool selection

Users choose which example tools to include from a checklist: a simple echo tool, a file reader, a web fetcher, and a calculator. Each tool demonstrates a different MCP pattern (simple input/output, file system access, async operations, multiple parameters). Selected tools are injected into the generated index.ts.

### Dev mode with auto-reload

The generated project includes a dev script that watches for file changes and restarts the server automatically. This uses tsup's watch mode to recompile TypeScript on save, combined with a process manager that restarts the stdio server. The development loop is: edit a tool, save, test immediately.

## Challenges

**Template interpolation**: The generated code needs to be valid TypeScript regardless of which combination of example tools the user selects. The template system uses a simple string builder rather than a templating engine, constructing the imports, tool definitions, and handler registrations based on the selected tools.

**npx compatibility**: For `npx init-mcp-server` to work reliably, the package needs to declare its binary correctly, handle being run without installation, and work across Node.js versions 18+. Testing across different Node versions and npm versions revealed edge cases with npx's caching behaviour that required explicit version pinning.

**tsup configuration**: The generated project uses tsup for building, which handles TypeScript compilation, bundling, and declaration generation in one step. Getting the tsup config to produce both ESM and CJS outputs with correct package.json exports required careful configuration that needed to work on the user's machine, not just mine.

## Outcome

`npx init-mcp-server` generates a fully configured MCP server project in under 10 seconds. The generated project compiles, runs in dev mode, and responds to tool calls immediately. It eliminates the boilerplate barrier to building MCP integrations, letting developers jump straight to implementing their specific tools.
