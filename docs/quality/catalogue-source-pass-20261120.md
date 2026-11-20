# Catalogue source pass, 20 November 2026

Local portfolio changes only. This pass corrects and expands case studies; it does not establish that the individual tools are visually polished or their live workflows are complete. All 39 projects, 15 explorations and 37 charts remain in the per-entry ledger. Unreviewed entries remain explicitly open.

## Conjure

Reviewed committed source at `0ca070b`; inspected files have no staged or unstaged source changes. The structured study replaces the Markdown study at render time, without deleting it.

- `apps/web/src/app/api/generate/route.ts`: Zod input schema, Groq Llama adapter, requested variations, JSON parsing, deterministic parameter append, temporary session/iteration IDs when no stored session exists.
- `apps/web/src/components/PromptBuilder.tsx`: generation/refinement state and request context.
- `apps/web/src/app/api/prompts/route.ts`: saved prompt creation requires an existing stored iteration. End-to-end saving from the current anonymous generation path needs completion.
- `apps/extension/content.ts`, `manifest.json`, `panel/App.tsx`: Midjourney-targeted content script, local iframe and local API configuration. The reviewed implementation does not establish shadow-DOM isolation or a background-service-worker API proxy. Message origin validation and production host configuration need a tool-side fix.

Removed sub-second generation and any-page extension claims. Output validation still needs a schema for the expected labels/count. No model, extension installation or DB call was run.

## Artify

Reviewed source at `4894054`; the inspected implementation files match the commit. Existing unrelated README/package changes were untouched.

- `src/lib/astro.ts`, `src/lib/pipeline/day-plan.ts`: astronomical context and daily plan.
- `src/lib/pipeline/image-gen.ts`: DeepInfra FLUX image editing, optional hand validation and retry. API-skipped validation returns pass; some retry failures retain the earlier image. Accepted does not mean checked.
- `scripts/fal-video.ts`: Kling 2.6 Pro through fal.ai, rather than the old case study's provider attribution.
- `scripts/daily-generate.ts`, `src/lib/pipeline/spellcast-client.ts`: separate generation, upload, draft and scheduling stages, with a manifest. Dry-run disables delivery but can still generate externally.

Removed unmeasured rendering throughput, guaranteed validation and unattended daily publishing outcomes. No generator, provider, upload or schedule operation was invoked. Tool-side validation states and reviewable delivery UX remain open.

## Podify

Reviewed source at `460c62a`; inspected files match the commit. Existing tsbuildinfo change was untouched.

- `app/api/podcast/generate/route.ts`: capacity/quota boundary, source resolution, job creation, Ollama/Voicebox web defaults and explicit asynchronous trigger path.
- `lib/pipeline.ts`: transcript persistence, synthesis, assembly, estimated costs and episode registration.
- `lib/jobs.ts`, `components/generation-progress.tsx`: memory/Blob job state and polling; elapsed time is displayed, not a measured time-remaining estimate.
- `lib/generate-audio.ts`: configurable providers, per-speaker voices, ordered results from concurrent tasks, opt-in paid fallback for Voicebox.
- `lib/assemble-podcast.ts`: format conversion, concatenation, speaker-dependent random gaps and optional music/intro/outro. The code does not establish silence analysis, segment crossfades or a loudness/compression pass.
- `app/api/podcast/feed/route.ts`: RSS metadata/enclosures.

Removed a fixed per-episode cost, fixed generation time and unmeasured listener-naturalness claims. No speech, model, episode or feed write was run. Actual output listening, intended visibility, browser/native delivery and long-running interaction quality remain open.

## iPrep

Reviewed clean deployed-source worktree `9e415de`, rather than older main `9c75f7f`. The structured study now represents the deeper learning product as well as spoken practice.

- `lib/playground/studio-build-teaching.ts`: goals, first actions, terms and worked examples using different data.
- `lib/playground/studio-worker.ts`: compilation, a DOM environment and explicit learner/event/reply commands.
- `lib/playground/studio-build-progress.ts`: exact cumulative group/label checks, source-bound receipts and explicitly assisted guided checkpoints.
- `lib/playground/progress-contract.ts`, `engine.ts`: session/lesson completion identities, hints/misses/scaffold evidence and separate supported/independent practice records.
- `lib/playground/progress-client.ts`: account-checked acknowledgements, retained queues on rejection/conflict and bounded progress paging.
- `lib/playground/coaching-progress.ts`, `coaching-catalogue.ts`: canonical completion replay and public teaching/execution boundaries, separate from private preparation material.
- `lib/ai.ts`, `audio-analysis.ts`: context-sensitive STAR instructions and heuristic delivery/confidence indicators.

Removed unsupported human-calibrated scoring and measured learner-outcome claims. No live learner records, audio, model, DB or native flow was used. The repository's standard build runs a migration and was intentionally not run as a source review. Actual hesitation, enjoyment, later recall and current multi-device delivery remain separate checks.

## Moth

Retained the existing detailed structured study and earlier attributed model replay evidence. Rechecked clean committed files in `elsewhere-agent` at `7526032`: provider contract, beliefs, interests, skills and works. The mechanics support the account of probabilistic encounters, mistaken assumptions, practice and persistent changes to the world. This pass did not rerun the Mini model evaluation or establish the current live model configuration. Live world/observatory UX, accessible controls and updated screenshot remain open.

## Validation

The full portfolio suite passes: 109 tests across 16 files. TypeScript and the portfolio icon guard pass, with zero blocking icon findings and 18 data-symbol review candidates. The shared icon guard's eight regression tests pass. Source/API/architecture links point at the reviewed revisions for Conjure, Artify and Podify. The iPrep and Moth source reviews are recorded here without manufacturing hosted proof for local source branches.
