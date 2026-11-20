---
title: "Conjure"
description: "A prompt-building prototype that separates a visual brief, a creative direction and the syntax expected by an image platform."
techStack: "Next.js, TypeScript, AI SDK, Groq, Zod, Prisma, Chrome Extension MV3"
updated: "2026-11-20"
status: "Local product candidate 7cf0d8a with dependency follow-up 550bbc2; live generation, account storage and extension delivery remain unverified."
---

<!-- Kept in step with the canonical structured study in conjure.json. -->

Local product candidate 7cf0d8a with dependency follow-up 550bbc2; live generation, account storage and extension delivery remain unverified.

## Make variation a decision people can inspect

A brief can stay the same while an image direction changes. Conjure asks for conservative, creative and experimental interpretations, then lets a person copy or refine a direction. Platform and orientation are separate inputs. That separation makes the interface useful for comparing the idea itself before adapting its syntax for Midjourney, FLUX or DALL·E.

## From brief to platform prompt

1. **Input boundary:** The builder sends the brief, account context, platform and orientation, with a loading state and visible generation errors. [Implementation](https://github.com/Sammii-HK/conjure/blob/0ca070b/apps/web/src/components/PromptBuilder.tsx)
2. **Request boundary:** Zod bounds the brief and accepts supported platform/orientation values. The reviewed adapter calls Llama 3.3 70B through Groq. [Implementation](https://github.com/Sammii-HK/conjure/blob/0ca070b/apps/web/src/app/api/generate/route.ts)
3. **Formatting boundary:** The route requests three labelled variations, parses the response and appends platform parameters after generation. DALL·E is handled separately from prompt-text parameters. [Implementation](https://github.com/Sammii-HK/conjure/blob/0ca070b/apps/web/src/app/api/generate/route.ts)
4. **Iteration boundary:** Refinement carries the original brief, a selected base prompt and a change request back to the same endpoint. [Implementation](https://github.com/Sammii-HK/conjure/blob/0ca070b/apps/web/src/components/PromptBuilder.tsx)

Architecture links identify the earlier 0ca070b baseline. The local 7cf0d8a/550bbc2 candidate adds the persistence, output validation, extension and dependency work below. No generation or database operation was exercised.

## Keep formatting outside the creative instruction

A platform-specific suffix is deterministic. Asking a model to reproduce it makes a mechanical constraint part of every generated sentence.

- **Generate the whole string:** The model would be responsible for both the visual idea and the exact platform syntax.
- **Apply supported platform parameters in code (chosen):** A shared platform/orientation map supplies parameters after the model returns its visual description.

The same brief and variation workflow can target different image tools without asking the model to invent parameter syntax.

## Give a browser draft its own identity

The earlier generation response used temporary IDs that the save endpoint could not persist. Guest drafts now have explicit browser identities: save, rating, favourites, search and remix share a local shelf. Repeated saves deduplicate by iteration and direction; corrupt storage and quota errors are visible. Those records stay in that browser and are not account-synced or backed up. Authenticated generation uses a separate user-owned session/iteration path, and library operations check ownership before saving. Injected tests cover both contracts; real authenticated database persistence remains unexercised.

## The extension has a concrete integration surface

The local MV3 package now bundles its actual React panel instead of embedding localhost. The content script checks both iframe identity and extension origin; the panel checks acknowledgements against the Midjourney parent and origin. Text insertion is bounded and does not submit an image. The production API host is explicit, and the temporary draft panel does not claim library sync. Manifest/package checks and a production build pass. The extension has not been installed or tested against today’s live Midjourney DOM.

## Validate the result as well as the request

The local candidate checks all three distinct direction labels and their output fields, retains refinement context and includes remixed reference prompts. Only Midjourney gets an aspect-ratio suffix; the tool does not force a model version or stylisation. Eleven injected/mocked tests cover storage failure, ownership, output rejection, refinement and extension messages. Actual desktop and 390px navigation and provider-unavailable feedback were checked without fabricating output. Generation and account persistence still require separately authorised live integration checks.

## Keep compatible repairs separate from a breaking migration

The dependency follow-up patches within supported major versions and denies account routes with 503 when account configuration is absent. A resolved dependency regression distinguishes the authentication router’s Zod 4 from the application’s Zod 3. Builds and local auth/session fixtures pass, but known findings remain in older SDK, Zod and Prisma tooling lines. Their breaking transitions are not presented as completed. No environment files, credentials, database commands, generation or release were used.
