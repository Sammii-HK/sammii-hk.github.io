---
title: "Crystal Index"
description: "A structured crystal catalogue and collection product with a separately authenticated image-identification API."
techStack: "TypeScript, Next.js, Prisma, PostgreSQL, Vercel Blob, AI vision"
updated: "2026-11-20"
status: "Local web-directory candidate ba6f28e0; offline component checks pass. Production data, owner draft and native companion remain separate."
---

<!-- Kept in step with the canonical structured study in crystal-index.json. -->

Local web-directory candidate ba6f28e0; offline component checks pass. Production data, owner draft and native companion remain separate.

## Keep a catalogue separate from a specimen

The Prisma schema separates a Crystal record from reusable CrystalInfo, images, users, locations and collection records. Colour, chakra and intention are string arrays; hardness is a numeric field. This provides a concrete catalogue and collection model without the enum/join-table architecture described in the earlier case study.

## Filter the list the user actually has

The directory loads a catalogue list and filters it in the browser. The local candidate normalises recorded colour/chakra values, uses explicitly recorded zodiac/element associations and matches any selected value within one group while combining groups. It no longer searches prose for zodiac substrings or infers elements from zodiac signs. Search, facets and sort persist in allowlisted URL state; detail links and the back link restore that directory view. This is not indexed server-side composed filtering or a measured query-speed result. A separate public v1 endpoint has capped Prisma filtering and is not the directory path.

_Offline component review at local ba6f28e0, not the production catalogue. Three illustrative records have intentionally absent photographs; no database, account, analytics or model is connected._

## Keep missing information visible

An empty result, an unavailable service, an absent image and a missing association mean different things. Treating them alike makes a catalogue look more complete than it is.

- **Infer or conceal missing values:** A name found in descriptive prose can appear to satisfy a filter, and a missing photograph can become an unexplained blank.
- **Use recorded fields and explicit states (chosen):** Use structured public metadata for associations, place unknown sort values last, distinguish fetch failure from empty results and show named image fallbacks.

The local directory supports labelled filters, removable chips, announced counts and keyboard-native detail links. Traditional associations are presented separately from mineral characteristics.

## Two AI paths with different purposes

The legacy CrystalInfo creation route asks GPT-4 for a short description and colour/chakra arrays, parses JSON and writes the result. The image-identification helper instead calls Qwen3-VL through DeepInfra and returns model-suggested matches. Its runtime parser checks string names and numeric confidence values, but does not enforce catalogue membership, bounded values, a normalised total or sorting. A confidence value is a model output, not calibrated identification accuracy.

## Identification crosses more than one boundary

The identification API accepts an app credential or a hashed API key, applies a plan-based rate check, accepts an image, stores an image record and can use confirmed similar examples when calling the vision helper. This review read those paths without uploading an image, loading a model, querying the database or exercising subscriptions. Remote-image validation, uncertain identifications, collection ownership and failure recovery still need a real tool pass.

## Show only the visual evidence that exists

React Three Fiber is used for a location globe in the reviewed web source. No per-crystal procedural geometry or material preset system was found, so the portfolio no longer presents a 3D specimen viewer as implemented. The native companion is recorded project context, but its SwiftUI/RevenueCat source and release were not located or verified in this web checkout. A separate native review is needed before using it as current engineering evidence.

> Cultural and metaphysical associations are catalogue content, not scientific, chemical or medical identification evidence. The web source has a local directory repair, with a separate owner draft that removes identification surfaces and changes store links. Integration must preserve that work. Native verification, production-data ownership, provider behaviour and a recorded identification walkthrough remain open.

## What the offline review establishes

Nine query/data and actual-component DOM checks and eleven shared icon regressions pass. The browser reviewed the actual gallery, detail navigation and theme with three explicitly illustrative records and a stubbed image transport. Keyboard detail/back restoration and phone facets were exercised; the repaired page fits 390px. This does not establish production data loading, image delivery, accounts or native behaviour. Full TypeScript and Next production-build success is not claimed: legacy declaration parsing and a database-backed sitemap remain separate checks, alongside the framework dependency migration.
