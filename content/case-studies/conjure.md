---
title: "Conjure"
description: "A prompt-building prototype that separates a visual brief, a creative direction and the syntax expected by an image platform."
techStack: "Next.js, TypeScript, AI SDK, Groq, Zod, Prisma, Chrome Extension MV3"
updated: "2026-11-20"
status: "Prototype; source reviewed at 0ca070b. Generation, saving and extension delivery need further end-to-end verification."
---

<!-- Kept in step with the canonical structured study in conjure.json. -->

Prototype; source reviewed at 0ca070b. Generation, saving and extension delivery need further end-to-end verification.

## Make variation a decision people can inspect

A brief can stay the same while an image direction changes. Conjure asks for conservative, creative and experimental interpretations, then lets a person copy or refine a direction. Platform and orientation are separate inputs. That separation makes the interface useful for comparing the idea itself before adapting its syntax for Midjourney, FLUX or DALL·E.

## From brief to platform prompt

1. **Input boundary:** The builder sends the brief, account context, platform and orientation, with a loading state and visible generation errors. [Implementation](https://github.com/Sammii-HK/conjure/blob/0ca070b/apps/web/src/components/PromptBuilder.tsx)
2. **Request boundary:** Zod bounds the brief and accepts supported platform/orientation values. The reviewed adapter calls Llama 3.3 70B through Groq. [Implementation](https://github.com/Sammii-HK/conjure/blob/0ca070b/apps/web/src/app/api/generate/route.ts)
3. **Formatting boundary:** The route requests three labelled variations, parses the response and appends platform parameters after generation. DALL·E is handled separately from prompt-text parameters. [Implementation](https://github.com/Sammii-HK/conjure/blob/0ca070b/apps/web/src/app/api/generate/route.ts)
4. **Iteration boundary:** Refinement carries the original brief, a selected base prompt and a change request back to the same endpoint. [Implementation](https://github.com/Sammii-HK/conjure/blob/0ca070b/apps/web/src/components/PromptBuilder.tsx)

Source reviewed at 0ca070b on 20 November 2026. This review did not invoke generation or publishing services.

## Keep formatting outside the creative instruction

A platform-specific suffix is deterministic. Asking a model to reproduce it makes a mechanical constraint part of every generated sentence.

- **Generate the whole string:** The model would be responsible for both the visual idea and the exact platform syntax.
- **Apply supported platform parameters in code (chosen):** A shared platform/orientation map supplies parameters after the model returns its visual description.

The same brief and variation workflow can target different image tools without asking the model to invent parameter syntax.

## Persistence is an unfinished product boundary

The repository includes saved-prompt, rating and library routes, but the generation path currently returns temporary session and iteration identifiers when it cannot resolve an existing session. A save endpoint expects a real stored iteration. A visible Save control therefore does not establish that a newly generated prompt will survive a reload. Completing that transition and testing its failure states is a prerequisite for presenting the library as a finished workflow.

## The extension has a concrete integration surface

The MV3 manifest targets Midjourney. Its content script adds a collapsible iframe pointing to a local development server and can write a prompt into recognised Midjourney inputs. A separate panel implementation also calls that local server. The reviewed implementation is an iframe/content-script prototype; production host configuration, message-origin checks and extension interaction testing still need work.

## The next quality gate

The request has a schema, while the generated variations are currently parsed and mapped without an equivalent output schema enforcing labels and count. Strengthening that boundary belongs before stronger reliability claims. This review did not measure response speed, call the model, exercise account persistence or install the extension. A public AI demonstration should be a recording of the actual verified flow.
