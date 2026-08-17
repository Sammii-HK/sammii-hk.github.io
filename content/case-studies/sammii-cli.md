---
title: "sammii-cli"
description: "Terminal portfolio rendered in the command line using Ink and React"
techStack: "Node.js, Ink, React, chalk"
---

## The problem

A portfolio almost always means a browser tab, so much so that the format goes unquestioned. But developers spend most of their working hours somewhere else: the terminal. `npx sammii` is built on the idea of a portfolio someone runs from a terminal instead of opening in a browser tab.

That choice creates a harder interface problem than it sounds like. Everything has to work with a keyboard and a grid of monospace characters that could be 80 columns wide or 200. Building something that feels like a real, navigable UI inside those constraints was the actual work.

## Architecture

### Ink rendering

Ink is a React renderer for the terminal. Instead of rendering to the DOM, components render to ANSI escape sequences that terminals interpret as styled text, boxes, and layouts. The result is that the portfolio is built with ordinary React patterns (components, hooks, state) but its output target is stdout, not a browser.

### Arrow key navigation

A custom navigation hook tracks the focused section and item index. Arrow keys move between sections (bio, products, experiments, links) and within each section's items. Enter opens the selected item's URL in the default browser using the `open` package.

### Gradient ASCII header

The header renders "SAMMII" as large ASCII art using ink-gradient, which maps a colour gradient across character positions. It reads the terminal's colour support (256-colour or truecolor) and falls back to plain text gracefully on more limited terminals.

### Colour-coded sections and layout

Products and experiments are visually distinct using chalk colour functions, one colour range per category, with each item showing its title, tech stack, and a truncated description. Because terminal width isn't fixed, the layout measures the terminal's column count at render time and truncates descriptions with an ellipsis rather than letting them wrap awkwardly.

## Challenges

### Getting npm to treat it as a real global package

Publishing a CLI tool to npm requires the package.json `bin` field to point to a shebang-prefixed entry file. The build step compiles TypeScript to JavaScript and prepends `#!/usr/bin/env node` to the compiled entry point. Version management then relies on npm's built-in versioning to keep `npx sammii` pointing at the latest release.

### Leaving the terminal the way it found it

Ink applications need to clean up properly on exit, whether that's Ctrl+C or Escape. Without that, an interrupted Ink process can leave a terminal with broken styling or a hidden cursor. The app registers an exit handler that resets terminal styles and cursor visibility on the way out, so quitting the CLI never leaves a mess behind in someone's shell.

## Outcome

`npx sammii` runs in any terminal with Node.js installed and renders a full portfolio with navigation, colour, and links in under two seconds. It's a conversation starter that demonstrates both technical skill and a willingness to meet people somewhere they didn't expect a portfolio to show up.
