---
title: "Artify"
description: "An image-making workspace and content pipeline that turns astronomical context, a source illustration and a format plan into reviewable visual outputs."
techStack: "Next.js, TypeScript, astronomy-engine, FLUX Kontext, DeepInfra, Kling, fal.ai, Remotion, Spellcast API"
updated: "2026-11-20"
status: "Local studio and pipeline candidate 9cafbd8 verified; deployment, live generation and delivery remain untested."
---

<!-- Kept in step with the canonical structured study in artify.json. -->

Local studio and pipeline candidate 9cafbd8 verified; deployment, live generation and delivery remain untested.

## Keep context, image direction and delivery separate

Artify combines a browser workspace with scripts for a recurring visual-content workflow. The browser accepts an image and a style, scene or custom instruction. The daily pipeline builds a plan from astronomical context, renders or generates media, prepares captions and can hand the resulting assets to Spellcast. Those are separate boundaries with different failure modes.

_Original image workspace restored as the showcase. The added marketing introduction and Garamond treatment have been removed locally; a fresh capture is pending._

## From daily context to a scheduled asset

1. **Context:** astronomy-engine supplies lunar and solar context used by the day plan alongside the project’s scene and seasonal rules. [Implementation](https://github.com/Sammii-HK/artify/blob/4894054/src/lib/astro.ts)
2. **Image generation:** The reviewed image-to-image path sends a source image and instruction to FLUX Kontext through DeepInfra. It writes the returned image for later stages. [Implementation](https://github.com/Sammii-HK/artify/blob/4894054/src/lib/pipeline/image-gen.ts)
3. **Motion and composition:** A separate helper sends still images to Kling through fal.ai. Remotion compositions and rendering scripts prepare formatted assets. [Implementation](https://github.com/Sammii-HK/artify/blob/4894054/scripts/fal-video.ts)
4. **Delivery:** The client uploads media, creates a draft and calls a separate scheduling endpoint. The daily run records media paths, failures and scheduled post identifiers in a manifest. [Implementation](https://github.com/Sammii-HK/artify/blob/4894054/src/lib/pipeline/spellcast-client.ts)

Architecture links refer to the earlier committed 4894054 source. The local 9cafbd8 candidate adds the validation, dry-run and studio repairs described below. No provider or publishing operation was invoked.

## Make the publishing boundary explicit

A successful image request does not establish that a post exists, has the right identity or is scheduled.

- **Treat generation as completion:** An image file would stand in for the entire delivery workflow.
- **Carry outputs into a separate scheduling stage (chosen):** The daily script collects results before uploads and scheduling, counts failures and records returned post identifiers.

Generation, rendering and scheduling can be inspected separately. A run manifest is useful operational evidence; proving public delivery still requires the downstream receipt.

## Validation has its own failure policy

The earlier source could report a skipped or unavailable vision check as passing and retain a rejected image when a retry failed. The local candidate distinguishes passed, failed, skipped and error. Generated candidates stay in memory until accepted; an unavailable validator becomes needs-review, and a failed retry cannot return the rejected first image as success. Explicitly disabled validation is marked unchecked, with pass false. Cached images are labelled not checked this run. These branches have mocked regression checks; automated hand validation remains fallible, and the browser studio does not claim its results are hand-validated.

## Make a dry run a plan

The earlier dry run stopped delivery while still doing external generation. The local daily command now parses dates and flags before dynamically importing the live module. Its dry path calculates cadence only, with generation, validation, uploads and scheduling explicitly false. The actual CLI was exercised under guards rejecting network calls, credential-file reads and writes. This proof applies to the repaired daily entry; the wider legacy manual CLI was not re-certified.

## Verify the interface up to the provider boundary

The actual local studio was checked at 1144px and 390px. Shared navigation links are 44px high, neither layout overflows horizontally, the project sketch loads as a source preview, style search narrows choices, and clearing a scene requires a custom direction before generation becomes available. The Generate button was not pressed. Fifteen mocked tests cover the dry-run boundary, validation states, retries and studio errors; TypeScript, production build and eight icon guard tests pass, with a zero-advisory dependency audit in that checkout. Recorded-run and tarot routes honestly show missing local records rather than populated archives.

_Unreleased local candidate, 20 November 2026. Actual local workspace with a loaded project sketch and custom scene direction. The result panel shows the source starting point, not a newly generated image._

_Unreleased local candidate, 20 November 2026. Actual 390px local studio layout, with shared navigation and recorded project output._

> These screenshots show a local release candidate and existing project assets. They are not live-site captures or fresh generated results. Live image quality, provider availability, charges, rendering, scheduling, HEIC/large-source handling and result-download CORS remain open. No production cadence, cost saving or autonomous publishing outcome is inferred.
