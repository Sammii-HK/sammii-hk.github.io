---
title: "Gamut"
description: "An earlier colour-system tool connecting generated OKLCH scales, semantic roles, interface previews and editable exports."
techStack: "Next.js, TypeScript, OKLCH, Tailwind CSS"
updated: "2026-11-20"
status: "Local colour-workshop candidate 8c36917 verified; deployment and independent colour-science certification remain open."
---

<!-- Kept in step with the canonical structured study in gamut.json. -->

Local colour-workshop candidate 8c36917 verified; deployment and independent colour-science certification remain open.

## A scale becomes an interface

Gamut starts with named colour scales and roles. A base hex colour supplies hue and chroma; the generator applies a fixed table of eleven lightness and chroma factors, then reduces chroma where necessary to fit sRGB. The same generated palettes feed the swatches, light/dark interface previews and export formats.

_Unreleased local candidate, 20 November 2026. Actual local editor with renamed purple primary, Slate neutral and a separately keyed amber Orchid accent._

_Unreleased local candidate, 20 November 2026. Actual 390px local interface preview with purple primary and amber accent._

## Make the conversion inspectable

The source contains the Oklab conversion matrices, sRGB transfer functions and a twenty-iteration binary search over chroma. It holds the requested lightness and hue while finding an in-gamut chroma. This is an implemented colour pipeline, not proof that equal OKLCH lightness looks equally bright in every context. The fixed step table is a design convention, not a perceptual benchmark.

## Separate scale values from semantic roles

Roles such as primary and neutral produce default mappings for backgrounds, surfaces, borders and text. Light and dark modes resolve those mappings to different scale steps. CSS and JSON export resolve the selected mode; the Style Dictionary-shaped export includes both semantic modes. Tailwind export writes colour scales into a configuration object. There is no Figma API synchronisation in this path.

## Target sRGB output

- **Gave up:** Wide-gamut source colours are reduced to values suitable for sRGB hex exports.
- **Got:** One set of generated values can be previewed and copied into ordinary CSS and downstream configuration. The tool checks each scale step against white and black using WCAG contrast ratios; that does not certify every semantic foreground/background pair.

## Keep identity when a name changes

The earlier tool preserved scale IDs while preview/export lookup used editable names, allowing a rename to resolve semantic colours to grey. The local candidate now carries stable IDs through preview and all semantic exports. Versioned URLs preserve IDs, labels, roles and active selection separately; malformed colours, roles and repeated IDs fall back to a default editor. Export names are normalised and disambiguated, so duplicate labels remain separate scales.

## Place it in the progression

Gamut remains its own focused colour workshop alongside the broader system-creation work in Saer. Five regressions cover semantic rename stability, custom references, safe export keys, shared-link round trips and malformed links. TypeScript, build and eight icon regressions pass; the dependency audit in that checkout reports zero findings. Its colour algorithm was preserved, not independently re-certified.

## Check the colour through the whole workflow

In the actual local editor, a visible Hex value of #8544cc produced a primary preview/export value of #8949d1. Renaming primary to Orchid and neutral to Slate kept that semantic colour. Adding a second Orchid scale produced a distinct orchid-2 export with amber Accent #d18500. Reload retained all three names, IDs, roles, active selection and dark mode. Desktop and 390px views fit without horizontal overflow and measured controls were at least 44px high. Clipboard feedback appeared, but copied contents were not independently read back.
