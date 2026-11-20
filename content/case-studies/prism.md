---
title: "Prism"
description: "A component system that makes its behaviour inspectable: spring motion, shared overlays, three visual expressions and recorded AI response states."
techStack: "React, TypeScript, Spring Physics, Browser Top Layer"
updated: "2026-11-20"
status: "Live component demos; registry and interaction refinements verified locally, not yet deployed"
---

<!-- Kept in step with the canonical structured study in prism.json. -->

Live component demos; registry and interaction refinements verified locally, not yet deployed

## From components to a system

The interesting part of Prism is no longer an individual button. It is whether inputs, menus, dialogs and asynchronous responses behave like they belong to the same product. I moved the work towards shared behaviour: typed APIs, spring motion, a common overlay layer and visual expressions held to the same interaction contracts.

_Actual local gallery, 20 November 2026, filtered to eight registry installs. The registry release is not yet deployed._

## Follow an asynchronous answer through the interface

1. **Stream contract:** An abortable StreamSource yields text, tool calls, tool results, errors and completion. The contract accepts either a real provider adapter or a recording. [Implementation](https://github.com/Sammii-HK/prism/blob/db18633/app/lib/hooks/assistant.ts)
2. **State transitions:** A quiet window avoids flashing a busy state. A stalled stream exposes waiting and cancellation. A settled or replaced run ignores late events. [Implementation](https://github.com/Sammii-HK/prism/blob/db18633/app/lib/hooks/assistant.ts)
3. **Response surface:** The component renders received text, inspectable tool steps, citations and stop/retry controls. A citation is a link only when its source exists. [Implementation](https://github.com/Sammii-HK/prism/blob/db18633/app/lib/components/ai-response.tsx)
4. **Behaviour checks:** The browser suite exercises the response lifecycle. The demo uses retained recordings, including imperfect runs and a labelled injected timeout. [Implementation](https://github.com/Sammii-HK/prism/blob/db18633/tests/ai-response.spec.ts)

This is interface engineering around a model response. It does not claim that displaying a citation proves the answer correct.

## Keep the behaviour, change the expression

A different visual language should not require a different keyboard model or props API.

- **Separate component implementations:** Each expression could evolve independently, but behaviour would need to be checked and repaired in several places.
- **Shared behaviour with distinct expressions (chosen):** Keep the interaction contract and vary the presentation. Test that contract across the expressions.

The expressions become a test of the component system rather than separate galleries. Visual variety has to survive the same behavioural checks.

## Let the browser own the layer

A panel inside a transformed or clipped ancestor can disappear regardless of its z-index. Closing a native overlay immediately also cuts off its exit motion.

- **Portals and larger z-index values:** Move each panel manually and manage its stacking outside the browser top layer.
- **Top layer with shared dismissal and presence (chosen):** Use manual popovers and native dialogs, with a shared dismiss stack and spring presence. Prefer CSS anchor positioning where supported, with a measured JavaScript fallback.

Escape dismisses the top layer. Closing panels stay mounted through their exit spring. Modal focus return and scroll locking belong to the shared layer, rather than each component inventing them.

## Show the engineering

X-ray makes hit targets, focus order, roles, contrast and springs visible while exploring a component. Its overlay joins the top layer too, so opening a dialog does not hide the inspection tools. This exposes implementation choices; it does not certify accessibility or replace testing.

## Make AI behaviour repeatable

An AI response interface needs to handle waiting, tool calls, partial answers, interruption and failure. A fresh model response on every visit would make those states difficult to compare and introduce a running cost.

- **Call a model on every visit:** Fresh output, but variable timing, variable content and a model bill attached to a public demo.
- **Replay recorded local-model events (chosen):** Record real local Ollama output, preserve event timing and feed it through an abortable stream interface.

The demo can be stopped, retried and inspected without a paid call. An injected tool timeout is labelled, and a wrong-source run remains visible as a failure. The interface presents response state; it does not verify whether a model claim is true.

## AI interfaces beyond the answer bubble

The AI response component makes tool arguments inspectable, reveals streamed text at an even pace, links citations only when a source exists and announces the completed answer once to screen readers. Latency states and the async button share timing rules for fast starts, slow requests and retry; settled states ignore late results. Token Compose explores a different boundary: a seeded generator produces layouts from a closed token vocabulary, and a validator rejects off-token values. It is deterministic generation, not an LLM choosing a layout, and the validator checks membership rather than taste or contrast.

## Inspect the AI interaction work

- [Recorded AI response](https://prism.sammii.dev/ai-response)
- [Latency states](https://prism.sammii.dev/latency-adapt)
- [Async button](https://prism.sammii.dev/async-button)
- [Token Compose](https://prism.sammii.dev/token-compose)

## An invisible palette was still reachable

- **What happened:** The closed command palette was transparent and ignored pointer input, but its modal and search field remained in the accessibility tree.
- **Why:** Visual hiding did not remove the closed interface from focus navigation or assistive-technology exposure.
- **Fix:** The local component now makes the closed panel inert and aria-hidden, isolates the background while open and restores prior states on close. In the browser pass, Tab and Shift+Tab stayed in the search field, submenu selection returned focus there, Escape returned to the root and then restored focus to the launcher, and reopening reset the query and submenu. The palette and gallery also fitted the measured 390-pixel viewport. This is observed Chrome interaction behaviour, not a full accessibility certification.

## What remains

The local release candidate adds eight shadcn-format registry bundles, tested together in a separate consumer. The gallery distinguishes registry installs, source references and interaction studies, and links installation instructions from the actual component. These installation paths depend on deploying the new registry; they are not claimed as already public. More form primitives and a shared OKLCH token contract remain follow-ups.

## Explore the work

- [Open Prism](https://prism.sammii.dev)
- [Review the implementation](https://github.com/Sammii-HK/prism/pull/33)
