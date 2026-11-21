---
title: "Turning a Saer theme into components I can install"
description: "The decisions behind Saer's own small component registry: shared generation, editable source, theme boundaries and a real consumer installation."
date: '2026-11-20'
tags:
  - design-engineering
  - design-systems
  - react
  - developer-tools
draft: true
---
A colour scale is useful. So is a type scale. I wanted Saer Create to carry those choices into something I could actually put in a project: a button, an input, a set of tabs, with the selected system already connected to them.

That became Saer's own component registry.

The current implementation is a local release candidate. It has seven components, an interactive catalogue and shadcn-compatible registry items. The separate public repository, distribution licence and directory namespace are still release decisions. There is no published `@saer` installation to announce here.

What I do have is a working path from a generated system to editable component source, and a consumer check that installed all seven components and compiled them.

## The preview and the exported thing need to agree

The preview sits beside the code someone is about to take away. Keeping those outputs aligned is part of making that handoff useful.

I used the same component generation function for the preview workspace, ZIP kit and registry payloads. The generated source files also populate the candidate registry folder.

There are two useful forms of the registry. The source manifest points to files in that folder. The HTTP item embeds the component source, so the installer has the content it needs. Both come from the same generated component files.

That is still something to check rather than assume. A freshness test compares the checked-in registry payloads, source manifest and component files with the generator. Editing an output without regenerating the others should create a visible disagreement.

The catalogue starts with Saer's default system. Exporting an item from Create carries the system currently being edited, including its light and dark semantic tokens. The distinction matters: browsing a default button and exporting a customised theme are different actions.

## A component brings part of a system with it

The current kit contains Button, Input, Badge, Card, Switch, Tabs and Select. They target React and Tailwind CSS 4 in a shadcn-configured project. Select also declares its Lucide dependency.

The registry item includes the scale values and semantic colour aliases, plus font, type, line-height, radius, shadow and spacing values. Its light and dark sections carry the corresponding semantic values.

This makes a chosen system portable, but it also gives installation a wider effect than adding a single file. Those theme variables can change the surrounding application. The install guidance needs to say that plainly before someone brings the item into an existing design system.

The component files have their own destination. For example, the button file targets:

```json
{
  "path": "components/button.tsx",
  "type": "registry:ui",
  "target": "@ui/saer/button.tsx"
}
```

The `saer` subdirectory keeps it separate from an existing UI button. It does not isolate the global theme variables. Those are two different boundaries, and preserving one does not establish the other.

Fonts have a similar boundary. Exporting the selected font family as a token does not load its font files into the consuming app. The current instructions leave that step explicit.

## Keep the installable source small enough to inspect

I started with seven components because I wanted to inspect the actual behaviour and output of each one.

The switch exposes its checked state through a button with switch semantics. Tabs have selected state, panel relationships and arrow, Home and End navigation. Select has a labelled trigger, listbox state and named Lucide icons.

Those details make the source more useful to someone taking ownership of it. They also give me concrete interactions to check. They do not establish complete accessibility certification across browsers and assistive technology.

This kit does not currently include the whole catalogue of overlays, menus and complex widgets that a larger library might offer. I do not want the existence of a registry index to imply that all of those interaction problems have been solved.

The useful question for this version was whether these seven pieces could leave Create as coherent, editable source, with their requirements and theme effects still visible.

## Install it into another project

A registry that renders on its own site has only exercised part of the path. I also checked the items through the actual installer in an isolated consumer project.

All seven components installed and compiled. The consumer already contained a UI button, and that existing file stayed unchanged. A real HTTP item resolved through the CLI as well. The index and seven item payloads validated against the installed shadcn schemas.

Those checks answer specific questions: can the installer resolve the source, does the destination preserve the existing button, and does the resulting project compile? They do not answer every question about the consuming application's theme, font loading or interaction design.

There is a browser layer too: catalogue search, component selection, keyboard use and the phone layout. I want those checks alongside the generated-file and installation checks because the catalogue is the interface through which someone chooses what to install.

## Give the components their own release boundary

Saer also has a scanning engine. Making the components available should not require publishing that engine or the account application with them.

The source-only registry candidate contains a manifest, the seven component files and its README. It leaves the paid engine and account code outside that folder. It is prepared for review as an independent repository, with publication and licensing still to complete.

That separation lets me review two things on their own terms: the editable components someone receives, and the tooling that inspects a codebase's design system.

For Create, the next useful unit of progress is the whole handoff: choose a system, inspect its components, understand the global theme changes, install the files and see them compile in the receiving project. Each of those steps needs to agree with the one before it.
