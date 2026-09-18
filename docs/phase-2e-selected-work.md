# Phase 2E: Selected Work editorial system

Date: 15 Sept 2026. Branch `redesign`.

## Architecture

- `app/lib/selected-work.ts`: `selectedWorkModel(committed)` is the whole editorial contract, pure and tested. It reads Phase 2A's `getLensOrder`, builds three `Chapter`s (index, pacing layout, lens summary, emphasis, href, `fragment` flag) and n `Reference`s, plus `order` (ids in reading order) for keyed continuity. `projectHref` = case study; Strata never surfaces its preview-deployment live link.
- `app/src/components/work/SelectedWork.tsx` (client): reads `useLens().committed` only. Renders one keyed `[data-flip=id]` wrapper per project for its whole life on the page; the wrapper holds a `Chapter` or a `Reference` depending on tier.
- `useFlipOrder`: measures wrappers after every commit; when the order key changes it offsets each surviving wrapper back to its previous position and releases it (520ms), fades in newcomers, and fades the swapped content. No React state, no library. Skipped under `prefers-reduced-motion`.
- `Chapter.tsx`: the shared grammar (index · kicker · title · visual · summary · emphasis · links) with a `VISUALS` map for project-specific compositions; anything unmapped falls back to the screenshot.
- `visuals/`: `StrataVisual`, `KernVisual`, `GamutVisual`, `OrbitVisual`, `LunaryVisual` (lens-aware), `SpellcastVisual`, `LattiqVisual`. `GamutFragment.tsx` is the one live fragment.
- `Reference.tsx`: indexed typographic rows, a different system from the chapters.
- The old `ProjectGrid`/`ProjectModal` are no longer rendered on the homepage (kept for `/work`, Phase 2H).

## Output per lens (verified in the browser)

| Lens | Chapters | References |
|---|---|---|
| design | Strata · Kern · Gamut | Prism · Lunary · Lattiq |
| ai | Orbit · Lunary · Spellcast | create-mcp-server · Lattiq · iPrep |
| product | Lunary · Lattiq · Strata | Gamut · Orbit · Spellcast · Kern |

Matches Phase 2A exactly; no data was changed.

## Pacing

Chapter 1 = `bleed` (visual spans the full column, past the right edge at ≥1200px), chapter 2 = `split-right`, chapter 3 = `split-left`. Position decides layout, so every lens reads bleed → split → split rather than three cards, and no chapter is 100vh.

## Visual concepts (all from real data, case studies or the real screenshots)

- **Strata**: the Cosmos screenshot as a wide field, plus an axis beneath with real reference points (ISS 408 km, Moon 1.3 light-sec, Voyager 1 165 AU, Oort cloud 2,000 AU, observable universe 46.5 billion ly) placed by log10 of their distance in light-seconds. The clustering is the app's own point.
- **Kern**: a specimen next to the product: a weight run in the site's own Jost at the four loaded weights, and a five-step modular scale with rem values. A specimen, not a claim about Kern's presets.
- **Gamut**: the live fragment (below).
- **Orbit**: the seven pipeline stages from the project description as an indexed hand-off chain with a slow moving dash, the "14 agents, one responsibility each, JSON-defined" note, and the control-room screenshot. No nodes, no glow.
- **Lunary**: one composition, three emphases keyed by lens: AI = context → interpretation → personalisation (Astronomy Engine, 1,300+ page grimoire, MCP 60+ tools); Product = compute / content / commerce (Next.js 15, generated library, Stripe on Prisma + PostgreSQL); Design = positions / information design / surface. Same screenshot.
- **Spellcast**: one post fanning to eight platform slots (no logos), the Postiz + Temporal / Hetzner note, dashboard screenshot. Nothing about autonomy.
- **Lattiq**: two clients with their own IndexedDB copies joined by a Yjs CRDT / WebSocket link (a slow dashed pulse), editor screenshot. No scripted cursors.

## Gamut fragment

Gamut's real scale (`gamut/src/lib/palette.ts`): eleven steps 50–950 with fixed OKLCH lightness targets and per-step chroma multipliers, copied verbatim. Swatches are `oklch(var(--l) calc(var(--g-c) * var(--k)) var(--g-h))`, so the browser does the colour maths. Resting state is server-rendered at hue 292, chroma 0.21. When Gamut is a chapter, two native range inputs (hue 0–360, chroma 0–0.3) write `--g-h`/`--g-c` onto the palette from refs; a live `<output>` shows the step-500 `oklch()` value. Native ranges give keyboard (arrow keys) and touch for free; focus ring styled. The slider handlers write custom properties from refs, so no React commit happens on input by construction, but the automated keyboard/touch probe could not run (the machine was too loaded to launch a browser); verify by hand: focus the Hue slider and press → repeatedly, and drag it on a phone. Verified: the fragment mounts interactive only under Design (`gamut[data-interactive]` present for design, absent for ai/product).

## Lens recomposition

Committed lens only; preview never touches the section (the model is built from `committed`, and the test asserts it). On commit: wrappers that survive travel to their new slot (Kern was measured moving 1,127px from chapter 2 to reference 4), newcomers fade in, swapped content fades in. Reading position: nothing scrolls programmatically; Chrome's scroll anchoring keeps the viewport pinned to nearby content, which reads as stable when a chapter above changes height.

## Motion library

None. The only shared-element need (wrapper travel between tiers) is a 40-line FLIP with `transform` transitions. Motion would only earn its bundle if chapters needed to morph size while travelling; they fade instead, which is calmer and readable.

## Responsive

1440 / 834 / 390 verified for all three lenses: zero horizontal overflow, chapters keep their identity on phones (Strata axis drops one label, Kern specimen wraps, Gamut palette stays eleven-up with sliders stacked, Lunary columns stack, Lattiq link turns vertical), references scan as rows.

## Accessibility

h2 "Selected work" (visible, quiet) → h3 per chapter, `aria-labelledby` per article; references are an `ol` with `aria-label="Supporting work"` and each row is one link labelled by its title. Reading order equals visual order (the DOM is reordered, not CSS `order`). Decorative visuals `aria-hidden`; informative ones (Strata axis, Lunary columns, Spellcast branch, Lattiq sync) carry labels. Focus rings on titles, links, rows and range inputs. Reduced motion: no FLIP, no enter/swap fades, no Orbit/Lattiq dashes, hierarchy updates immediately with weight/position intact.

## Media

Existing 2800×1400 screenshots through `next/image` (`sizes` 100vw/60vw, width/height reserved so CLS stays 0), chapter 1 `priority`, the rest lazy. Only the current lens's three chapters render, so three screenshots load per lens, not nine. Prism's 1.2 MB PNG is never loaded (references have no media).

## Performance (same harness as 2B–2D; machine at load average ~260 during this run, so timings are not comparable, only sizes and counts)

| Metric | 2C | 2E |
|---|---|---|
| Homepage JS transferred | 398.6 kB (9 files) | 403.2 kB (10 files) |
| Route `/` first-load JS (Next report) | 120 kB | 123 kB |
| CLS | 0 | 0.0001 |
| React commits during 2 s pointer movement | 0 | 2 (the pointer crossed a lens phrase: hover preview is discrete state, not frame-frequency) |
| Media loaded on the Design homepage | 34 card thumbnails | 5 files, 1.1 MB unoptimised PNG in the static harness (Vercel serves resized WebP in production) |
| New dependencies | none | none |
| Gamut fragment | n/a | not measured (browser launch timed out under load); by construction no React state on input |

LCP (1.8 s) and click-to-commit (8.8 s) in this run are artefacts of the loaded machine (the harness managed one animation frame in two seconds); re-run `scripts/parity/perf.mjs out after-2e` on a quiet machine before reading them.

## Build / tests

tsc clean, ESLint clean, vitest 33/33 (12 new Selected Work contract tests), static export 207 pages, `/hero-lab` still a production 404.

## Open questions

1. Scroll anchoring on lens change is the browser's, not ours; if a visitor is deep in chapter 3 when they switch, Chrome pins to whatever it anchors on. Acceptable, but worth watching in 2J.
2. Strata's live link stays hidden until a real URL exists (brief amendment 4).
3. The Kern specimen's modular scale is illustrative (ratio 1.25); if Kern has a canonical default scale, the numbers should come from it.
4. `ProjectGrid`/`ProjectModal`/`ViewToggle` are now unused by any route until `/work` (2H).
