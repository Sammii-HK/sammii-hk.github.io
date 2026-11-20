# Writing draft review, 20 November 2026

Two local drafts are in the normal content format with `draft: true`. No push, deployment, revalidation, platform submission or publication was performed. The normal blog reader excludes drafts from the index/full-text RSS, the article page returns not found for drafts and the individual article API also rejects drafts. These files are for source review, not a new publication schedule.

## Duplicate check

Compared the owner's supplied seventeen-story HackerNoon inventory with the local blog titles/content, the existing schedule, and the local writing publication receipt. Publisher titles differ from local originals, so this is topic/angle comparison rather than a claim that every provider record has a verified one-to-one canonical mapping. No private dashboard counts are used as portfolio or article material.

| Existing HackerNoon story in the supplied inventory | Local overlap reviewed |
|---|---|
| How I Fixed Retrograde Timing, Aspect Orbs, and Caching in My Astrology Engine | `retrograde-stations-are-the-plot-twist` |
| How I Expanded an Astrology Compatibility Algorithm From 7 to 10 Chart Points | `synastry-at-36-aspects`, `building-synastry-engine-36-planetary-aspects` |
| Seven Spheres Became an App: Here's How | `from-the-library-to-lunary` |
| Building MCP Servers for My Own Products: Introducing the Workflow | `building-mcp-servers-for-your-own-products` |
| Building a Browser-Based Image Editor With Web Workers and OffscreenCanvas | `browser-photo-editing-web-workers` |
| How I Built Semantic Search for 2,000 Articles Using pgvector and Postgres | `the-grimoire-is-the-product-pgvector-semantic-search` |
| Three Months of Freemium: What Worked, What Failed, and What I'd Change | `freemium-model-three-months-in` |
| Why HSL Is Broken for Design Systems and How OKLCH Fixes It | `why-your-design-system-needs-oklch-not-hsl`, scheduled colour series |
| Designing Reliable Scheduled Workflows Without a Dedicated Job Queue | `31-vercel-crons-solo-product` |
| Helvetica: The Typeface Everyone Respects but Nobody Questions | `love-letter-to-helvetica` |
| Meet Kern: The Typography Playground for Variable Fonts and Fluid Type | Both existing Kern posts; editorial title mapping not asserted |
| I Created an AI Cat That Thinks for Herself. Now I Have More Questions Than Answers | Existing consciousness/Moth writing and the two separately published Moth posts; exact original mapping not asserted |
| How to Prevent Silent Failures in Multi-Agent AI Systems | `when-an-agent-returns-code-instead-of-data` |
| Building a Typography Playground With Variable Fonts and Fluid CSS | Both existing Kern posts; editorial title mapping not asserted |
| I Run a One-Person Company With AI. Here's What I Won't Let It Do | `a-proposal-is-not-an-approval` |
| How I Built a Data-Driven Portfolio That Takes 30 Seconds to Update | `portfolio-infinitely-extendable-json` |
| How I Built a Mouse-Responsive Gradient Using Just CSS and Math | `cursor-reactive-gradients-css-mouse-position`, `one-colour-formula-portfolio` |

The separately scheduled collaborative-editor post already has `local-first-collaborative-editing-yjs-crdts`. Existing `moth-a-world-of-possibilities`, `moth-choosing-models-by-task` and `prism-designing-the-wait` were published through the earlier writing batch; none is duplicated here. No guessed expansion of tev/jev or new claim about Moth models is introduced.

The scheduled `springs` article explains interruption and a numerical spring comparison. The new Kinetic article is a concrete elapsed-clock bug, rendered timing check and subsequent keyboard/containment repairs. The existing Prism daily-library article describes its generation pipeline; the new Saer draft concerns its own seven-component installable registry and consumer/theme boundaries. Existing Saer replay writing concerns agent design-system reuse, rather than this registry release candidate.

## Draft: The countdown looked right until I timed it

File: `content/blog/a-countdown-needs-a-clock.md`.

Source anchors, read without environment or runtime state:

- Kinetic `ee8b23b` and `d1333e9`, `app/components/CountdownRing.tsx`: records `performance.now`, selected duration, fifty-millisecond refresh, shared progress and interval cleanup.
- `app/lib/countdown.ts`: quoted calculation matches the actual helper. No third-party code or prose copied.
- `docs/quality/kinetic-verification-20261120.md`: actual five-second observations at 2.105 and 5.260 seconds, keyboard reorder focus, dock containment and explicit test limits.
- Local case study `content/case-studies/kinetic.json` and gallery source confirm twenty-five studies, discovery and first-approach deferral.

Does not claim timer precision to a thousandth, exhaustive background behaviour, a full assistive-technology audit or that every animation library lacks duration-based springs. The supplied mid-transition reorder screenshot remains withheld and is not an article illustration.

## Draft: Turning a Saer theme into components I can install

File: `content/blog/saer-a-theme-you-can-install.md`.

Source anchors:

- Saer local functional registry batch `bef31ea`, `packages/saer-loom/src/lib/registry.ts`, `components.ts`, registry freshness tests and `docs/registry-review-20261120.md`.
- `packages/saer-registry/README.md`, manifest and seven generated component files confirm the independent source candidate, targets, dependency declarations and beta limits.
- Actual consumer installation receipt: all seven installed/compiled, existing button preserved, eight HTTP index/item files schema-checked. This is not a performance or user-outcome measurement.
- Later portfolio tool receipt records the superseding visible Hex export check. This article does not reuse the earlier green-export attempt as changed-colour proof.

Explicitly local/unreleased, no claimed public repo, distribution licence, @saer namespace or paid-tier component promise. Component subdirectory isolation is not confused with global theme isolation. Required fonts remain an integration step. No claim of complete accessibility certification or a full complex-widget library.

## Writing and scope review

Read the shared writing rules, content rules and interview-work exclusion. Kinetic and Saer are owned product work; no interview task is used. UK English, sentence-case headings, no em/en dashes, no boilerplate author footer, no achievement badges and no invented improvement percentages. The earlier local-model default note is superseded by the current owner instruction permitting Codex work; no model/provider operation was invoked for either draft.

## Local validation

Both files parsed as the existing site frontmatter format and compiled successfully with the installed MDX compiler. They contain 900 and 953 words respectively. The actual `getAllPostsFull()` published reader excluded both with network calls blocked and the production-build phase selected. The countdown code block matched the checked-out `countdownAt` implementation exactly. No prohibited en/em dash characters were found. No site behaviour was changed, so a repeated full application build was not needed for these content-only drafts.
