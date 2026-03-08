---
title: "sammii-cli"
description: "Terminal portfolio rendered in the command line using Ink and React"
techStack: "Node.js, Ink, React, chalk"
---

## The problem

Portfolios are websites. That is the assumption. But developers spend most of their time in the terminal, and I wanted a portfolio that meets them there. Run `npx sammii` from any terminal and browse projects, links, and bio without opening a browser. The challenge was building a rich, navigable UI inside the constraints of a terminal emulator.

## Architecture

### Ink rendering

Ink is a React renderer for the terminal. Instead of rendering to the DOM, components render to ANSI escape sequences that terminals interpret as styled text, boxes, and layouts. This means the portfolio is built with familiar React patterns (components, hooks, state) but outputs to stdout.

### Arrow key navigation

The UI uses a custom navigation hook that tracks the focused section and item index. Arrow keys move between sections (bio, products, experiments, links) and within each section's items. Enter opens the selected item's URL in the default browser using the `open` package.

### Gradient ASCII header

The portfolio header renders "SAMMII" as large ASCII art using ink-gradient, which maps a colour gradient across character positions. The gradient updates based on the terminal's colour support (256-colour or truecolor), falling back gracefully to plain text on limited terminals.

### Colour-coded sections

Products and experiments are visually distinct using chalk colour functions. Products use one colour range, experiments another. Each item displays its title, tech stack, and a truncated description, formatted to fit within the terminal's column width.

## Challenges

**Terminal width handling**: Terminals range from 80 to 200+ columns. Long project descriptions that look fine in a wide terminal wrap awkwardly in a narrow one. The layout measures terminal width at render time and truncates descriptions with ellipsis to prevent wrapping.

**npm global package publishing**: Publishing a CLI tool to npm requires the package.json `bin` field to point to a shebang-prefixed entry file. The build step compiles TypeScript to JavaScript and prepends `#!/usr/bin/env node`. Version management uses npm's built-in versioning to keep `npx sammii` always pointing to the latest release.

**Exit handling**: Ink applications need to clean up properly on exit (Ctrl+C, Escape). The app registers an exit handler that resets terminal styles and cursor visibility to prevent leaving the terminal in a broken state.

## Outcome

`npx sammii` runs in any terminal with Node.js installed. It renders a full portfolio with navigation, colour, and links in under two seconds. It is a conversation starter that demonstrates both technical skill and a willingness to meet users in unexpected places.
