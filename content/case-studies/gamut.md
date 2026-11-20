---
title: "Gamut"
description: "An earlier colour-system tool connecting generated OKLCH scales, semantic roles, interface previews and editable exports."
techStack: "Next.js, TypeScript, OKLCH, Tailwind CSS"
updated: "2026-11-20"
status: "Source reviewed at 3d05f4c; live interactions and exports have not been retested."
---

<!-- Kept in step with the canonical structured study in gamut.json. -->

Source reviewed at 3d05f4c; live interactions and exports have not been retested.

## A scale becomes an interface

Gamut starts with named colour scales and roles. A base hex colour supplies hue and chroma; the generator applies a fixed table of eleven lightness and chroma factors, then reduces chroma where necessary to fit sRGB. The same generated palettes feed the swatches, light/dark interface previews and export formats.

## Make the conversion inspectable

The source contains the Oklab conversion matrices, sRGB transfer functions and a twenty-iteration binary search over chroma. It holds the requested lightness and hue while finding an in-gamut chroma. This is an implemented colour pipeline, not proof that equal OKLCH lightness looks equally bright in every context. The fixed step table is a design convention, not a perceptual benchmark.

## Separate scale values from semantic roles

Roles such as primary and neutral produce default mappings for backgrounds, surfaces, borders and text. Light and dark modes resolve those mappings to different scale steps. CSS and JSON export resolve the selected mode; the Style Dictionary-shaped export includes both semantic modes. Tailwind export writes colour scales into a configuration object. There is no Figma API synchronisation in this path.

## Target sRGB output

- **Gave up:** Wide-gamut source colours are reduced to values suitable for sRGB hex exports.
- **Got:** One set of generated values can be previewed and copied into ordinary CSS and downstream configuration. The tool checks each scale step against white and black using WCAG contrast ratios; that does not certify every semantic foreground/background pair.

## A rename exposes an identity mismatch

The current source keeps a scale ID when its display name changes. Semantic tokens refer to IDs, while preview/export palette maps are keyed by names. A renamed scale can therefore fall through to the #888888 token fallback. URL decoding also accepts scale fields without the validation used by the colour input. These remain actual tool follow-ups; this portfolio review has corrected the earlier production-ready and timing claims, not repaired that code.

## Place it in the progression

Gamut remains an earlier focused colour tool alongside the broader system-creation work in Saer. Its source shows palette generation and format adapters. The next product evidence should exercise rename, malformed shared links, semantic contrast and exported values, then capture the real workflow. No speed or production adoption result is claimed.
