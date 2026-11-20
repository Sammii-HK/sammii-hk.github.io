---
title: "Type Lab"
description: "From browsing a font to exporting a type system: pairing, variable axes, fluid scales and previews from shared inputs."
techStack: "Next.js, TypeScript, Variable Fonts, CSS, Design Tokens"
updated: "2026-11-20"
status: "Earlier Type Lab release merged; local polish ad269a2 verified, not deployed."
---

<!-- Kept in step with the canonical structured study in kern.json. -->

Earlier Type Lab release merged; local polish ad269a2 verified, not deployed.

## A typography decision needs somewhere to go

Kern began as a variable-font explorer. Type Lab extends the workflow: browse the catalogue, choose heading, body and mono roles, compare them in interface previews, tune a fluid scale and export the result. The output matters as much as the specimen.

_Actual unreleased local ad269a2. The build uses the real bundled catalogue snapshot; public font files loaded in the browser. This is not a deployment screenshot._

## Navigation should reveal the whole workflow

- **What happened:** Phone navigation clipped later sections inside an unmarked horizontal scroller. The routes existed, but their entry points were easy to miss.
- **Why:** A desktop row had become a discovery problem at the narrow breakpoint.
- **Fix:** All six sections now remain visible across two phone rows, with a named navigation region and current-page state. The final 390px check found no document overflow; app navigation, family pickers and controls have 44px targets.

## Prove that an axis reaches the exported system

In the actual local browser, Fraunces loaded and its keyboard weight control reached 900. Assigning Heading carried that value into Pairing and Export through hv=wght.900. Copied CSS contained heading weight 900, fluid clamp values and measured fallback faces. This connects a real axis control to the exported artefact rather than relying only on a specimen screenshot.

_Actual local 390px app controls. All six navigation links and the three family pickers were checked at 44px high. Scaled miniature previews are intentionally smaller and are not the app controls._

> Local ad269a2 passes 60 Vitest checks plus 11 canonical icon regressions, normal lint, strict types and the normal Next build; full/production audits report zero findings. Independent axis labels and actual muted-text/background token contrast have dedicated regressions. The catalogue fallback identifies itself as a snapshot and does not promise an unimplemented retry. Playwright selectors were updated, but its CLI was not run. Physical touch, broader assistive technologies, every route/breakpoint and download handling are not certified by this pass.

## Follow a type decision into production

1. **Catalogue boundary:** A server-side fetch races the live refresh against a patience window. The browser can receive the bundled catalogue while an upstream request completes into the cache. [Implementation](https://github.com/Sammii-HK/kern/blob/0b9763d/lib/catalogue/fetch.ts)
2. **Type roles:** Heading, body and mono share one lab state. The same family can serve more than one role without requiring duplicate font requests. [Implementation](https://github.com/Sammii-HK/kern/blob/0b9763d/lib/lab-state.ts)
3. **Scale mathematics:** Each step has two endpoint sizes, a slope and an intercept. Tracking tightens with size; leading is derived from the base. Rounding happens when formatting output. [Implementation](https://github.com/Sammii-HK/kern/blob/0b9763d/lib/scale.ts)
4. **Export boundary:** CSS, Tailwind v4 and token output receive the same roles and scale. Browser-measured fallback faces feed size-adjust rather than changing the authored font sizes. [Implementation](https://github.com/Sammii-HK/kern/blob/0b9763d/lib/export.ts)

The path is from source data to an editable design-system artefact. It is separate from a claim about which typeface improves conversion or readability.

## Make the catalogue resilient

The catalogue should refresh without requiring every visitor to wait for an upstream service.

- **Only serve a live catalogue:** Fresh data, but a slow or changed upstream response blocks the first useful screen.
- **Live metadata with a bundled fallback (chosen):** Try the keyless Google Fonts metadata endpoint, then the official API when configured, then a bundled snapshot. A short patience window lets the page return the snapshot while refresh continues.

Source selection is explicit in lib/catalogue/fetch.ts. The snapshot can also be rebuilt deliberately, rather than relying on a hand-maintained font list.

## Pairing with reasons

Suggestions combine category contrast, curated pairings and font measurements where available. Each suggestion carries its reasons. They are typography heuristics, not a model predicting which pairing will perform best. Variable axes use each font’s actual range rather than assuming every family exposes the same controls.

## One system behind the previews and exports

A good-looking preview is misleading if copying the output produces different typography.

- **Calculate each export independently:** Easy to start, but the preview, CSS and token output can drift.
- **Generate from shared role and scale inputs (chosen):** Use the same heading, body and mono state, catalogue entries and scale steps for CSS, Tailwind and token exports.

Scale arithmetic keeps full precision until formatting. Both ends of the viewport range define the fluid interpolation. Interface previews make the pairing reviewable in context.

## Be explicit about fluid tokens

- **Gave up:** A fluid clamp() value cannot be represented as a single standard DTCG dimension.
- **Got:** Each scale step exports minimum and maximum typography tokens. A namespaced extension carries the clamp() expression for tools that understand it; consumers still need to implement the interpolation.

## A route for each part of the job

The root is now the font browser. Pairing, the scale and export have their own routes; the traditional specimen is at /specimen. Sources for the shared implementation are lib/scale.ts, lib/export.ts, lib/pairing.ts and lib/catalogue/fetch.ts. No adoption or performance outcome is claimed here.

## Explore the work

- [Browse Type Lab](https://kern.sammii.dev)
- [Open the specimen](https://kern.sammii.dev/specimen)
- [Review the implementation](https://github.com/Sammii-HK/kern/pull/1)
