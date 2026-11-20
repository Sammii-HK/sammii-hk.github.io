---
title: "sammii-cli"
description: "A terminal portfolio using Ink and React to present a keyboard menu, project descriptions and contact links."
techStack: "Node.js, Ink, React, ink-select-input, ink-gradient"
updated: "2026-11-20"
status: "Packaged CLI; source reviewed at 3f7ab9e. Terminal-size and current content polish remain open."
---

<!-- Kept in step with the canonical structured study in sammii-cli.json. -->

Packaged CLI; source reviewed at 3f7ab9e. Terminal-size and current content polish remain open.

## Use a different rendering surface

The package entry calls Ink with a React application. The interface is still built from state and components, but its target is a terminal. A gradient lettered header establishes identity, followed by a menu for About, Projects, Links and Exit.

## Keep navigation small

ink-select-input owns menu selection. Choosing an item changes a view state; Escape returns from a detail view and q can quit from the menu. Products and experiments render as colour-coded project cards. Links are displayed as terminal text. The reviewed application does not programmatically launch the selected project URL.

## Ship the entry as ordinary JavaScript

A terminal portfolio should have a small, inspectable installation path.

- **Require a separate compilation step for each use:** A consumer would need to build the presentation before running it.
- **Point the package binary at a ready JavaScript entry (chosen):** bin/cli.js has a Node shebang and imports the application directly. React.createElement keeps JSX compilation out of this package’s runtime path.

The source is an npm-style command package whose entry renders the menu directly through Ink.

## Terminal constraints need their own review

The current views use fixed content widths and a fixed-size lettered header. A terminal-size matrix is needed before claiming that they adapt to narrow windows. The application uses Ink’s exit function; this review did not establish a custom cursor-reset handler, a universal hyperlink experience or startup-time measurements. The next pass should bring its project data into line with the current web portfolio and verify navigation in real terminals.
