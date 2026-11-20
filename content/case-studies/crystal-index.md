---
title: "Crystal Index"
description: "A structured crystal catalogue and collection product with a separately authenticated image-identification API."
techStack: "TypeScript, Next.js, Prisma, PostgreSQL, Vercel Blob, AI vision"
updated: "2026-11-20"
status: "Web source reviewed at 56258c19; uncommitted web changes and native companion release remain separately unverified."
---

<!-- Kept in step with the canonical structured study in crystal-index.json. -->

Web source reviewed at 56258c19; uncommitted web changes and native companion release remain separately unverified.

## Keep a catalogue separate from a specimen

The Prisma schema separates a Crystal record from reusable CrystalInfo, images, users, locations and collection records. Colour, chakra and intention are string arrays; hardness is a numeric field. This provides a concrete catalogue and collection model without the enum/join-table architecture described in the earlier case study.

## Filter the list the user actually has

The directory route fetches a catalogue list, and FilterableCrystalGallery filters and sorts that list in the browser. Search, colour, chakra, zodiac and element controls combine over those records. The source does not establish indexed server-side composed filtering, URL-persisted filter state or a sub-100ms query result. Those earlier claims were removed. A separate public v1 catalogue endpoint applies Prisma array-membership filters and capped pagination; it is distinct from the browser directory path.

## Two AI paths with different purposes

The legacy CrystalInfo creation route asks GPT-4 for a short description and colour/chakra arrays, parses JSON and writes the result. The image-identification helper instead calls Qwen3-VL through DeepInfra and returns model-suggested matches. Its runtime parser checks string names and numeric confidence values, but does not enforce catalogue membership, bounded values, a normalised total or sorting. A confidence value is a model output, not calibrated identification accuracy.

## Identification crosses more than one boundary

The identification API accepts an app credential or a hashed API key, applies a plan-based rate check, accepts an image, stores an image record and can use confirmed similar examples when calling the vision helper. This review read those paths without uploading an image, loading a model, querying the database or exercising subscriptions. Remote-image validation, uncertain identifications, collection ownership and failure recovery still need a real tool pass.

## Show only the visual evidence that exists

React Three Fiber is used for a location globe in the reviewed web source. No per-crystal procedural geometry or material preset system was found, so the portfolio no longer presents a 3D specimen viewer as implemented. The native companion is recorded project context, but its SwiftUI/RevenueCat source and release were not located or verified in this web checkout. A separate native review is needed before using it as current engineering evidence.

> Cultural and metaphysical associations belong to catalogue content, not scientific or medical identification evidence. No model-accuracy, collection-scale performance or therapeutic result is claimed. Current web polish, legacy icon replacement, native verification and a recorded identification walkthrough remain open.
