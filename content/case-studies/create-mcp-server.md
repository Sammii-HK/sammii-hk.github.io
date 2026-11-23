---
title: "create-mcp-server"
description: "An npx scaffolder that writes a strict TypeScript MCP server with the SDK, Zod inputs, a stdio transport and only the example tools you pick, and that is careful on someone else's machine"
techStack: "Node.js, TypeScript, tsup, prompts, MCP SDK, Zod"
---

## The problem

Every new MCP (Model Context Protocol) server starts with the same setup: TypeScript configuration, the MCP SDK, Zod input schemas, stdio transport wiring and a development loop, usually copied from whichever project came before. None of it is specific to what the server does. init-mcp-server is an `npx` scaffolder that writes that setup for you, so the first thing you edit is a tool, not a config file.

```bash
npx init-mcp-server
```

The repository is still called create-mcp-server, which was the original name. When it came to publishing, that name was already taken on npm, so the package became [`init-mcp-server`](https://www.npmjs.com/package/init-mcp-server). The source is on [GitHub](https://github.com/Sammii-HK/create-mcp-server).

One thing to be clear about up front: npm currently serves version 1.0.0, from March. The repository's main branch is at 1.1.0, which reworks validation, installation and package manager handling. Running `npx init-mcp-server` today gets you 1.0.0. Below I describe the code on main and say where 1.0.0 behaves differently, because several of the most interesting decisions are exactly those differences.

## Three questions

The CLI uses the `prompts` library to ask for a project name, a description and which example tools to include, as a multiselect with hello and calculator ticked by default. The name can also be passed as the first argument, which skips that question.

In 1.0.0 those two routes were not equal. The prompt validated the name against `/^[a-z0-9-]+$/`, but a positional name went straight through. On main, both use the same function:

```ts
export function validateProjectName(name: string): true | string {
  if (!name || name.length > 214 || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    return /* a message explaining the rule */;
  }
  return true;
}
```

It returns `true` or a string, which is the contract `prompts` expects from a `validate` function, so the same function can sit directly in the prompt and also guard the argument.

214 is npm's limit on a package name, and the name becomes the generated `package.json` name, so the rule is borrowed rather than invented. Requiring a letter or number first rules out `-server`, which a shell or CLI could read as a flag. The positional name is checked before any prompt appears, so a bad argument exits with an error and nothing on disk changes.

The name is also a directory, so validation alone is not the whole story. `projectDirectory` resolves the target and then asks the path module whether it is really a child of where you are standing:

```ts
const parent = resolve(cwd);
const directory = resolve(parent, name);
const child = relative(parent, directory);
if (!child || child === ".." || child.startsWith(".." + sep) || isAbsolute(child)) {
  throw new Error("The project must be a new directory inside the current folder");
}
```

The regular expression already rejects slashes and dots, so in practice this check should never fire. It is there because `scaffold()` is also exported and can be called directly, and because two independent guards are cheap when the cost of getting it wrong is writing files somewhere you did not mean to.

## Templates as functions

Every generated file comes from a function that takes the project config and returns a string. The interesting one is the server entry, which is assembled from whatever was selected:

```ts
const imports = config.tools
  .filter((t) => TOOL_IMPORTS[t])
  .map((t) => `import { ${TOOL_IMPORTS[t].importName} } from "${TOOL_FILES[t]}";`)
  .join("\n");

const registrations = config.tools
  .filter((t) => TOOL_IMPORTS[t])
  .map((t) => `${TOOL_IMPORTS[t].registerName}(server);`)
  .join("\n");
```

Each example lives in its own file under `src/tools/` and exports a `register` function that takes the server. The entry imports and calls only the ones you chose, so any combination compiles, and removing an example later means deleting one file and two lines. There is no runtime supplied by the scaffolder: what you get is ordinary SDK code.

Anything user-supplied that lands in generated source is serialised rather than pasted. The `package.json` template has always built an object and called `JSON.stringify`, so a description with quotes, backslashes or newlines comes out intact. On main the server name in `src/index.ts` is written the same way, as `name: ${JSON.stringify(config.name)}`, where 1.0.0 put it inside quote marks by hand.

## An allowlist before the lookup

The tool templates are found by key in a plain object. A plain object has a prototype, so a lookup for `constructor` or `__proto__` finds something even though nobody put it there. On main, the requested tools are checked against an explicit list before the lookup ever happens, and duplicates are dropped:

```ts
config.tools.some(
  (tool) => !EXAMPLE_TOOLS.includes(tool as (typeof EXAMPLE_TOOLS)[number]),
)
// ...
config = { ...config, tools: [...new Set(config.tools)] };
```

Both checks run before a single directory is created, so an unsupported example name leaves nothing behind. Through the interactive prompt you can only pick real choices anyway. The check is for anyone calling `scaffold()` directly, which the tests do.

## Four small examples

There are four examples, each showing a different MCP pattern:

- **hello**: a tool with no parameters
- **calculator**: `add` and `multiply`, with Zod validating that both inputs are numbers
- **notes**: `create-note` and `list-notes`, sharing a `Map` held in memory for as long as the server runs
- **summarise**: picks sentences from a block of text, with an optional limit

Summarise is the one most likely to be misread, so it is worth showing:

```ts
const sentences = text
  .split(/[.!?]+/)
  .map((s) => s.trim())
  .filter(Boolean);

const points = sentences.slice(0, maxPoints).map((s) => `• ${s}`);
```

It does not call a model. It splits on runs of sentence punctuation, trims, drops empties and returns the first `maxPoints` sentences (five by default) as bullets. That is deliberately naive: a decimal like 3.5 or an abbreviation like "e.g." will split a sentence in two. It is an example of an optional, defaulted Zod parameter and a text-processing tool, not a summariser.

There is a small exploration hidden in the labels. In 1.0.0 the prompt described notes as a "Resource provider (note:// URIs)" and summarise as a "Prompt template", the two other MCP primitives besides tools. The templates themselves were always tools. On main the labels describe what the code actually does: "Create and list notes in memory" and "Select sentences with an optional limit".

## The generated project

The output is a strict TypeScript project targeting ES2022, with `module` set to ES2022 so the entry can use top-level `await` to connect the transport:

```ts
const transport = new StdioServerTransport();
await server.connect(transport);
```

It builds with `tsc` and starts from `dist/index.js`. In development, 1.0.0 ran `tsx src/index.ts`, which starts the server once, even though its README promised auto-reload. On main the script is `tsx watch src/index.ts`, which restarts the server whenever a file is saved. Main also starts new projects on newer dependencies: MCP SDK 1.32.2 and Zod 4.6.6, where 1.0.0 started at SDK 1.12 and Zod 3.24.

When it finishes, the CLI prints the `.mcp.json` snippet for Claude Code. In 1.0.0 that JSON was assembled line by line with the path glued together using a forward slash. On main it is a real object, with the path built by `path.join` and the whole thing printed through `JSON.stringify`, so separators and escaping are right on any platform.

## Installing on someone else's machine

A scaffolder writes into a real directory on a machine I have never seen, so most of the care goes into what happens off the happy path.

It refuses to touch an existing directory or a symlink. If the dependency install fails, which happens whenever a registry is unreachable, the files are already written and are perfectly usable, so main keeps them and says what to do next:

```ts
throw new Error(
  `Project files were kept in "${config.name}", but dependencies could not be installed. Open that folder and run "${pm} install" to continue.`,
);
```

Because that error is thrown before the git step, it also never commits a half-installed project. In 1.0.0 a failed install surfaced as the raw error from the child process.

The package manager was a quieter trap. 1.0.0 chose pnpm whenever `pnpm --version` succeeded, even if you had launched the CLI with `npx`. And pnpm 10 and later stop an install until a dependency's build script is approved. tsx depends on esbuild, which has one, so on a machine with a recent pnpm the install of a fresh project failed. Main follows the tool that actually launched it, which npm and pnpm both announce in an environment variable:

```ts
export function detectPackageManager(
  userAgent = process.env.npm_config_user_agent ?? "",
): "npm" | "pnpm" {
  return userAgent.startsWith("pnpm/") ? "pnpm" : "npm";
}
```

Anything else, Yarn included, falls back to npm. pnpm projects also get a `pnpm-workspace.yaml` that approves esbuild. pnpm 10 reads `onlyBuiltDependencies` and pnpm 11 reads `allowBuilds`, and each ignores the other's key, so the file carries both.

## Building the scaffolder

The CLI itself is built with tsup as ESM for Node 18, with a `#!/usr/bin/env node` banner so the output runs directly as a binary. There are two entries, the CLI and `scaffold`, so the tests can import the real built module instead of a copy. The built `dist` folder is committed to the repository, and the history shows how that came about: the rename commit accidentally swept `node_modules` in as well, the next commit removed it along with `dist`, and the one after that brought `dist` back on its own, tracked for npm, so the built CLI sits alongside its source.

The version in the banner used to be a hard-coded `v1.0.0` string. On main it is read from `package.json` at runtime with `createRequire`, which works because the built file sits one folder below the package root and npm always publishes `package.json`, even with a `files` list that names only `dist`.

## Tests against the real build

There are seven tests, written with Node's built-in test runner and run against the built output, not the TypeScript source. The first spawns the actual CLI with a list of hostile names and checks that each one exits with an error and leaves the folder empty:

```js
for (const name of [
  "../escape", "/tmp/escape", ".", "..", "-server", "two words",
  'quote";throw Error(1);', "name\nother", "a".repeat(215),
]) {
```

The others cover unsafe targets and unsupported tools including `constructor` and `__proto__`, existing directories and symlinks, a generated project with every example (and hello selected twice) checking each appears once and that a tricky description survives, recovery from a failed install using an injected command runner that always throws, package manager detection from real user-agent strings, and the pnpm workspace file. `scaffold()` accepts that command runner as an option precisely so a test can simulate a broken registry without a network.

Beyond the tests, while making these changes I generated a fresh project, compiled it and connected a real MCP SDK client to it over stdio. It listed six tools (hello, add, multiply, create-note, list-notes and summarise), each one answered, and invalid calculator input was rejected.

## Light and dark

There is no page here to theme. The CLI's output is plain text styled with picocolors (bold for the name, dim for hints, green for success and red for errors), which are the terminal's own styles. They follow whatever theme the terminal uses, light or dark, without the scaffolder needing to know.

## What it taught me

The generator itself, templates included, is around six hundred lines and was quick to write. What took the time was everything around it: making two routes to the same input agree, refusing to write outside the folder, keeping a project when the network fails, and noticing that "is pnpm installed?" is a different question from "did the user choose pnpm?". A scaffolder's first impression happens on a stranger's machine, and that is where its real work is.
