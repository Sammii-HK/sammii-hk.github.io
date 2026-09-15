# sammii.dev redesign: audit and plan

## Approved amendments (15 Sept 2026, supersede the brief where they differ)

1. **Cursor system:** parity first, evolution second. Preserve visually and behaviourally through migration; after parity is verified the colour model may evolve for perceptual consistency, accessibility or lens integration. The interaction identity must stay recognisable.
2. **AI lens:** featured Orbit, Lunary, Spellcast. `create-mcp-server` is supporting, not a flagship.
3. **ScapeStudio:** leaves the homepage, lives on `/work`. Not deleted, not archived.
4. **Strata:** case study is the primary destination; production/App Store URL later; any homepage interaction is labelled a fragment/study, never "the app".
5. **Lens controls:** do not lock to `<button role="radio">`. Pick the pattern after weighing inline-prose placement, three mutually exclusive lenses, view change below, and reuse in sticky nav. Prefer native semantics.
6. **AI motion:** emergence through recomposition (assemble, regroup, meaningful intermediate arrangements, structural resolve, progressive relationships). No blur-to-sharp, scrambling, Matrix, terminal, glow or fake networks.
7. **Hierarchy:** featured = chapters, supporting = references. Supporting is a substantially denser, quieter system (editorial rows, compact fragments, one-line lens summary, restrained metadata, arrow), never a small card.
8. **Lens-aware compositions:** featured compositions receive `lens` explicitly and may change visual/content emphasis (Lunary is the model). One adaptable composition per project, not three.
9. **Environment:** discrete meaning → `data-lens="design|ai|product"` on the root; continuous environment → CSS custom properties. Do not encode every lens distinction numerically.
10. **`/work`:** reusing `ProjectItem` is a temporary migration step. Final `/work` is a designed evidence index, built after the homepage is stable.
11. **Live fragments:** V1 ships only the Gamut fragment. If it earns its place: Strata, then Kern/Type Lab, then reconsider Lattiq. No scripted two-cursor Lattiq simulation in V1.
12. **Performance:** no invented JS budget. Measure the current homepage (JS transferred/executed, LCP, CLS, INP, frame stability) and set budgets relative to it. LCP/CLS/INP/smoothness/mobile lead; Lighthouse is supporting evidence.
13. **Phases:** 2A data + selectors → 2B environment provider (parity gate) → 2C document scroll → 2D hero + lens → 2E selected work (all static compositions, Gamut fragment only) → 2F environmental lens behaviour + Labs portal → 2G about/experience/contact → 2H temporary `/work` → 2I case-study shell → 2J a11y/responsive/perf/polish.
14. **Process:** commit this plan to the `redesign` branch, implement 2A only, report, stop.

---

Phase 1 output, 15 Sept 2026. No code has been changed. Everything below comes from reading the repo at `d152e9d`.

## 0. What the site is today, in one paragraph

A Next 14 App Router site, **statically exported** (`output: 'export'`) and deployed to **GitHub Pages** via `.github/workflows/deploy.yml`. The homepage is one client component (`PortfolioContainer`) that owns the cursor colour system and renders a fixed-height, internally scrolling `ProjectGrid`: an intro block, then three equal card grids (Featured work / More products / Experiments) of the same `ProjectItem` card, each opening a `ProjectModal`. Project data is one flat array in `app/common/data/projects.ts` (34 entries: 22 products, 12 experiments). Case studies are 21 Markdown files rendered by `app/projects/[slug]` through `next-mdx-remote` with a single prose template. Fonts are Jost (UI) and Inter (prose) from `next/font`. Tailwind with `darkMode: "media"`, no custom tokens. There are also unrelated surfaces (`/blog`, `/founder`, `/links`, `/ops/*`, `/[hub]` persona hubs) that the redesign should leave alone.

---

## 1. Preserve

**The cursor colour system, exactly as a formula.** It lives in three places and they all share one idea: `xPc` (0–100, cursor X doubled across the viewport), `yPc` (0–100), and channels `r = f(xPc)`, `g = f(yPc)`, `b = 255 - r`.

- `gradient-creator.ts` → `backgroundGradientCreator(xPc, yPc, t)`: four drifting radial blobs at 11–15% opacity, sin/cos time drift. This is the ambient background.
- `gradient-creator.ts` → `gradientCreator(xPc, yPc)`: the logo mask fill in `Navbar`.
- `CursorFollower.tsx`: a 350px blurred radial that trails the pointer at 5% opacity, same channel formula ("so the follower and logo feel connected").
- `ProjectGrid.tsx` `CardGrid`: hovered card border colour from cursor position *within the card*, pastel-floored at 140.

Also preserve: the scroll-driven wave that modulates `yPc` while the grid scrolls (`handleScroll` in `PortfolioContainer`), the lerp smoothing (factor 0.2 / 0.06), the touch path, the `hidden md:block` guard on the follower, and the pastel floor idea for anything that has to stay readable. These are the identity. They move, they do not get rewritten.

**Other things worth keeping:**
- Jost for UI + Inter for reading text, with `font-bold` remapped to 600. This is already a considered pairing; the redesign adds a third voice, it does not replace these.
- The accessibility scaffolding already present: modal focus trap, `aria-haspopup`, `focus-visible` rings, `.skip-link`, `.sr-only`, `prefers-reduced-motion` global kill switch, `role="list"` on grids.
- The `getImagePath` / `image-map.json` pipeline and the 2800x1400 screenshot script. Media exists for every flagship (gamut, kern, lattiq, lunary, orbit, strata all have png+webp).
- `getGithubRepoUrl`, `getPrivateRepoMailto`, the `privateRepo` / `noRepo` flags.
- JSON-LD person/website schema on the homepage, `ArticleJsonLd` on case studies, `opengraph-image.tsx`.
- The URL-hash deep link to a project modal (`#gamut`). It becomes the case-study link instead, but the intent (shareable per-project URL) stays.
- `/blog`, `/founder`, `/links`, `/ops/*`, `/[hub]`: untouched.
- Static export + GitHub Pages. Nothing in the brief needs a server.

## 2. Change

- **Homepage layout model.** `h-[100dvh]` grid with an internally scrolling region means the page itself never scrolls; that is why the scroll listener has to hunt for `#project-grid-scroll` with a MutationObserver and retries. The new IA (hero → work → labs portal → about → experience → contact) is a normal document that scrolls. The scroll-wave input moves to `window` scroll. This removes the most fragile code in the repo.
- **The intro block.** "AI product engineer and design engineer." headline, the green "Open to roles" pill, and the `21 products / 12 experiments / 21 case studies` counters go. Replaced by the hero and three-lens sentence.
- **`featured: boolean` + `FEATURED_ORDER` array.** Currently hierarchy is a boolean plus a hardcoded id list inside a component (and that list leads with AI work, which contradicts the brief's default). Replaced by per-lens `focus` data (section 6).
- **One `ProjectItem` card for everything.** Featured work gets bespoke compositions; supporting work gets a compact row system; `/work` gets a third, denser presentation. The card component survives only for `/work`.
- **`ProjectModal`.** Every project's detail is a modal today. Flagships link straight to their case study; the modal is dropped from the homepage (it can stay as the `/work` quick-look if wanted, but the brief's hierarchy is better served by direct links).
- **Case-study page.** One `max-w-2xl prose` column for everything, headed by title/description/reading time/techStack. Becomes a shell that can host bespoke sections and live fragments while still rendering the existing Markdown unchanged.
- **Metadata.** `layout.tsx` title/description say "AI Product Engineer & Design Engineer"; `page.tsx` JSON-LD says "Founding Design Engineer". Both realign to the one-engineer-three-lenses positioning, design-led.
- **Reduced-motion handling.** The global `* { transition-duration: 0.01ms !important }` is a blunt instrument that will also kill the lens transition's *state* communication. Replace with a `useReducedMotion` gate that swaps spring/layout animation for instant reorders while keeping opacity cross-fades that carry meaning.
- **Strata's `liveUrl`** is a raw Vercel preview hash (`strata-jam1xzj8w-…`). Needs a real domain or the App Store link before it becomes a lens-1 featured project.

## 3. Move

- **To Labs (data flag now, real Labs site later):** kinetic, spectra, refract, isle, beyond-light-vr, celestial-map, creative-coding, liquidity, day-lite, balloon-bonanza, tailwind-colour-creator, communication-infographic. Grove: flagged `labs`, `visibility: "archive"`, no prominence.
- **To `/work` only (never on the homepage):** pizzazz, conjure, sammii-cli, podify, spellcast, homebase, iprep, artify, glint, create-mcp-server, crystal-index, the-colour-game, flip, scapestudio. Note scapestudio is currently `featured: true` and the brief does not list it for any lens.
- **Homepage candidates (any lens):** strata, kern, gamut, prism, lunary, orbit, lattiq. create-mcp-server is the natural "strongest additional AI-native project" for the AI lens's third slot unless Spellcast is preferred; that is a data decision, not code.
- **`FEATURED_ORDER`** moves out of `ProjectGrid.tsx` into the data file as `focus.*.rank`.
- **Cursor system** moves out of `PortfolioContainer` into a provider (section 6) so the navbar logo, the background, the follower, card borders, and future project compositions all read one set of environmental values instead of prop-drilling `xPc/yPc`.

## 4. Current architecture constraints

1. **Static export.** No `searchParams` on the server, no middleware, no ISR. `?focus=` must be read client-side after hydration. Consequence: the server-rendered HTML always contains the design-lens order (which is what the brief wants as the no-JS/canonical state), and a `?focus=ai` visitor sees a one-frame reorder on hydration unless it is handled. Plan: render design order in HTML, and on mount apply the URL lens *without* animation (set state before first paint via `useLayoutEffect`), so only user-initiated switches animate. `trailingSlash: true` is already set for Pages.
2. **Next 14.2 / React 18.** Fine for everything proposed. No View Transitions API dependency; layout animation is done in userland.
3. **No animation library installed.** Kern uses Framer Motion; this repo does not. The lens hierarchy transition (shared-element move between featured and supporting) is the one place a library earns its weight. Recommendation: `motion` (Framer Motion's current package) for `layoutId` transitions on the ~8 homepage projects only, tree-shaken, loaded with the homepage. Everything else (hero hover, environmental values, card borders) stays CSS custom properties + rAF as today.
4. **Cursor state is React state at 60fps.** `setXPc/setYPc/setTime` every frame re-renders the whole container tree. Works today because the tree is small. With bespoke featured compositions it will not. The provider must write to CSS custom properties on a root element (`--env-x`, `--env-y`, `--env-hue`, `--env-energy`) via refs, not React state, and components read them in CSS. React state is only for the discrete lens.
5. **Case-study Markdown has no structured frontmatter beyond `title/description/techStack`.** Lens-specific summaries cannot come from the Markdown; they belong in `projects.ts`.
6. **`darkMode: "media"` only.** No manual toggle; fine, keep it. But the environmental colour must be contrast-checked against both `white` and `black` grounds, since the background blobs sit on both.
7. **Blog and case-study routes share `globals.css` prose rules.** Case-study shell changes must not restyle the blog.
8. **Images are 2:1 screenshots.** Bespoke featured compositions want different crops/fragments; screenshots stay as fallback media, not the hero of each composition.

## 5. Proposed information architecture

```
/                       Hero → lens sentence → Selected work (3 featured + 3–5 supporting) → Labs portal → About → Experience → Contact
/?focus=design|ai|product   same page, different editorial lens; invalid → design; / stays canonical
/work                   curated index: Products · Design & developer tools · AI systems · Earlier work
/projects/[slug]        case study (existing route kept; shell upgraded)
/labs → labs.sammii.dev external for now; nav item + portal section only
/blog, /founder, /links, /ops/*, /[hub]   unchanged
```

Sticky nav: `SAMMII · Design engineering · AI product engineering · Product engineering · LABS ↗`, appearing once the hero scrolls out. Active lens shown by weight/underline in Jost, no pills, no "viewing" copy. On mobile it collapses to the wordmark plus a single-row lens control that is horizontally scrollable, ~44px tall.

Homepage order of sections is fixed across lenses; only the contents of Selected work, the hero sentence, project summaries/emphasis, and the environmental parameters change.

## 6. Proposed component and data architecture

### Data (`app/common/data/projects.ts`, extended not replaced)

```ts
type Lens = "design" | "ai" | "product";
type Tier = "featured" | "supporting" | "work";
type Home = "home" | "work" | "labs" | "archive";

type Project = {
  id: string; title: string; techStack: string; info: string;
  type: "product" | "experiment";                 // kept for /work grouping + Labs candidates
  liveUrl?: string; caseStudy?: string; highlights?: string[];
  privateRepo?: boolean; noRepo?: boolean;
  home: Home;                                     // replaces `featured`
  group?: "products" | "tools" | "ai" | "earlier"; // /work grouping
  labs?: { kind: "experiment" | "study" | "lab-project" };
  fragment?: "strata-scale" | "gamut-palette" | "kern-type" | "lattiq-editor" | "lunary-world" | "orbit-flow";
  focus: Partial<Record<Lens, { rank: number; tier: Tier; summary?: string; emphasis?: string[] }>>;
};
```

Pure selectors in `app/lib/lenses.ts`: `getLensOrder(lens)` → `{ featured: Project[], supporting: Project[] }` sorted by rank, falling back to base `info` when a lens summary is absent. Lens copy (hero headlines, sentence phrases, environmental parameters) lives in `app/common/data/lenses.ts`. Initial ranks from the brief go in as data; a project missing a lens entry is `work` tier for that lens.

### Components (new under `app/src/components/`)

- `env/EnvironmentProvider.tsx` — owns pointer/scroll/time, writes `--env-x`, `--env-y`, `--env-hue`, `--env-energy`, `--env-warmth` to a root `data-env` element via rAF; exposes `setLensParams()` so a lens or a hovered flagship can nudge the target values (hue bias, energy ceiling). `backgroundGradientCreator` is refactored to *read* those variables in CSS (`rgb(from …)` is not needed; the existing rgb arithmetic becomes `calc()` on `--env-*`). Contains the existing lerp, scroll wave, touch handling and the follower.
- `env/AmbientBackground.tsx`, `env/CursorFollower.tsx` (moved), `Navbar` reads the same variables for the logo.
- `lens/LensProvider.tsx` — discrete state `{ lens, previewLens }`, URL sync (`history.pushState` on commit, `popstate` listener, `replaceState` never), reduced-motion flag.
- `lens/LensSentence.tsx` — the hero sentence with three `<button role="radio">` phrases inside a `role="radiogroup"` (correct selected-state semantics without looking like a filter). Hover/focus sets `previewLens`; click/Enter/Space commits. Touch has no hover, so tap = commit.
- `lens/LensNav.tsx` — sticky control, same radiogroup semantics, appears via `IntersectionObserver` on the hero.
- `work/SelectedWork.tsx` — reads `getLensOrder`, renders `FeaturedSlot` ×3 and `SupportingRow` ×n from one flat list of the ~8 homepage projects, keyed by id, wrapped in `LayoutGroup` so a project moving tiers animates between its two presentations.
- `work/featured/*.tsx` — one composition per flagship (`StrataFeature`, `GamutFeature`, `KernFeature`, `LunaryFeature`, `OrbitFeature`, `LattiqFeature`, `PrismFeature`), each implementing the same `FeaturedProps` contract (project, lensSummary, emphasis, fragmentSlot). Bespoke layout, shared contract.
- `work/fragments/*.tsx` — lazy (`next/dynamic`, `ssr: false`) interactive fragments, each under ~15KB, each with a static fallback image: `StrataScaleFragment` (log-scale slider between two real reference points), `GamutPaletteFragment` (one OKLCH hue/chroma control producing an 11-step scale live), `KernTypeFragment` (one variable-font axis on a line of type), `LattiqEditorFragment` (two cursors typing into a shared doc, scripted, showing merge). Lunary and Orbit get static compositions first; fragments later.
- `work/SupportingRow.tsx` — compact horizontal row: small fragment or crop, title, one-line lens summary, two metadata tokens, arrow. Visibly a different system from the featured compositions.
- `LabsPortal.tsx` — end of Selected work; copy TBD; environmental energy ceiling raised in its viewport (`IntersectionObserver` → `setLensParams`).
- `About.tsx`, `Experience.tsx`, `Contact.tsx` — server components, plain.
- `/work` page: server component grouping by `group`, using the existing `ProjectItem` card (kept) inside four titled sections.
- Case-study shell: `app/projects/[slug]/page.tsx` gains an optional `CaseStudyHero` (title, one-line hook, fragment slot, metadata) and a `components` map passed to `MDXRemote` so Markdown can use `<Diagram>`, `<Decision>`, `<HardPart>` when a case study is rewritten later. Existing `.md` files render unchanged.

### Typography

Three voices, all from what is installed plus one addition: **Display** = Jost 600 at a restrained scale (the wordmark and hero only, `text-wrap: balance`), **Editorial** = Inter (existing prose), **Technical** = a monospace for metadata, measurements and fragment readouts (`ui-monospace` stack now; a self-hosted mono like Geist Mono or JetBrains Mono via `next/font` if the system stack proves too inconsistent). Defined as CSS variables in `globals.css` (`--font-display`, `--font-editorial`, `--font-technical`) and a small type scale, so Type Lab can feed it later.

## 7. Proposed interaction architecture

- **Two-level lens interaction.** `previewLens` (hover/focus, pointer devices only) changes the hero headline text and swaps the hero's motion class; nothing below the hero moves. `lens` (click/tap/Enter/Space) commits: updates radiogroup `aria-checked`, pushes `?focus=` (or bare `/` for design), reorders Selected work with layout animation, swaps summaries/emphasis, nudges environmental targets. Leaving the hero clears preview.
- **URL contract.** `/` canonical. Commit to design → `history.pushState(null, '', '/')`. `popstate` → set lens from URL, animate. Unknown value → design, no URL rewrite. `<link rel="canonical" href="https://sammii.dev/">` on all lens states.
- **Keyboard.** Arrow keys move between phrases (radiogroup pattern), Enter/Space commit, Tab leaves the group. Focus ring uses the existing `focus-visible` treatment. The sticky nav is the same component, so behaviour is identical.
- **Touch.** Tap = commit. No preview state. Hover-only content does not exist anywhere.
- **Reading order.** The DOM order of Selected work is always the *current lens* order (React reorders the array; layout animation handles the visual move), so screen readers get the editorial hierarchy, not a stale order.
- **Environmental inputs.** pointer X/Y (existing), scroll wave (existing, moved to window), time drift (existing), plus two new scalars: `hue bias` and `energy` per lens and per hovered flagship (Strata: cooler, lower energy; Lunary: darker, more luminous blobs; Gamut: chroma up; Kern: none). Values are targets lerped over ~600ms so nothing snaps. Contrast guard: blob opacity stays ≤15% (as today) and text never sits on a blob without the page ground behind it, so AA is preserved by construction; verify with a quick script over the 4 grounds × lens params.
- **Labs portal proximity.** As the portal enters view, `energy` ceiling rises (follower slightly larger, blob drift faster) and the portal's own type gets a proximity response. Reverts on exit. Restrained: numbers, not new effects.

## 8. Proposed animation approach

- **Featured ↔ supporting transitions:** `motion`'s `layoutId` per project, scoped to the ~8 homepage items, duration ~450ms, `easeOut`, staggered by ≤40ms so at most two objects are in flight at once. Media cross-fades (opacity), containers move (transform), summaries swap after the move completes. No page reset, no flash.
- **Three motion languages, implemented as a single token set** (`--motion-spring`, `--motion-ease`, `--motion-duration`, `--motion-stagger`) that the lens sets on the root, plus one distinct micro-behaviour each:
  - Design: spring-based (stiffness ~300, damping ~28), proximity response on featured media (translate ≤6px toward the pointer), Kern fragment's variable axis follows pointer X. Nothing bounces unprompted.
  - AI: content "resolves": summaries and metadata mount from a blurred/low-contrast intermediate to final over ~300ms; supporting rows assemble top-down. No scrambling text, no glow.
  - Product: deterministic `easeInOut` with snap-to-grid; featured compositions align to a visible 12-column rhythm; supporting rows slide into their slots. Ordered, not dull.
- **Hero hover preview:** headline text swap via opacity/blur cross-fade of two stacked lines, 200ms; the phrase itself gets an underline draw. Only the hero.
- **Reduced motion:** `useReducedMotion()` → layout animation replaced by instant reorder with a 150ms opacity fade on the Selected work container; environmental time-drift frozen, cursor colour still responds (it is colour, not motion); follower hidden. Replaces the global `!important` rule for the homepage.
- **Performance budget:** homepage JS ≤ 120KB gz (today ~90KB); `motion` ~30KB, fragments lazy; no WebGL; all continuous effects are `transform`/`opacity`/custom-property writes from one rAF; Lighthouse performance ≥ 95 on mobile stays the gate.

## 9. Migration and build order

1. **Data** — extend `Project` with `home/group/labs/fragment/focus`, backfill all 34 entries (flags only; no copy yet), add `lenses.ts` and `getLensOrder`, unit-test the selectors. Homepage still renders via the old grid at this step. Zero visual change.
2. **Environment provider** — lift the cursor/scroll/time system into `EnvironmentProvider`, drive CSS variables, refactor `backgroundGradientCreator`, `Navbar` logo, `CursorFollower`, card border to read them. Visual parity check against the current site (side-by-side screenshots) before moving on. This is the riskiest "preserve" step, so it goes early and gets its own PR.
3. **Page skeleton** — replace the `100dvh` internal-scroll layout with a document that scrolls; new sections as placeholders; old grid moved to `/work` route as-is. Homepage now: hero (static), old grid content, footer.
4. **Hero + lens** — `LensProvider`, `LensSentence`, `LensNav`, URL sync, keyboard/touch, hover preview. Selected work still un-animated but lens-ordered.
5. **Selected work** — `SelectedWork`, `SupportingRow`, first three featured compositions (Strata, Kern, Gamut for the default lens), layout transitions, reduced-motion path. Then Lunary, Orbit, Lattiq, Prism compositions.
6. **Fragments** — Gamut palette, Kern axis, Strata scale, Lattiq editor; lazy, fallback images.
7. **Environmental lens params + Labs portal.**
8. **`/work`** — grouping, headers, keep `ProjectItem`; remove modal or keep as quick-look.
9. **About / Experience / Contact** — content from LinkedIn + CV master profile, design-first narrative.
10. **Case-study shell** — hero slot + MDX components; no rewrites.
11. **Polish + gates** — keyboard, touch, reduced motion, contrast script, deep links, back/forward, invalid params, no-JS render, Lighthouse, mobile.

Each step is a PR on a `redesign/*` branch; `main` deploys to Pages, so nothing ships until step 11 unless a step is independently safe (1, 2, 8 are).

## 10. Risks and conflicts with the brief

1. **Static export vs `?focus=` (brief §10).** Handled client-side as described; the cost is that OG previews for `/?focus=ai` are identical to `/`. Acceptable per §37 ("where technically sensible"). If per-lens OG images matter later, they need separate paths (`/design`, `/ai`, `/product`) rather than query strings.
2. **Cursor system at 60fps through React state (§35).** Must move to CSS variables before featured compositions exist, or the page will stutter. Step 2 is not optional.
3. **The global reduced-motion `!important` rule (§34).** Conflicts with meaningful state transitions; scoped replacement planned. Blog keeps the old rule.
4. **Strata's live URL** is a preview deployment; also Strata is a React Native app, so the "live fragment" is a web re-implementation of the log-scale, not the product. Fine, but it must be labelled as a fragment, not "try Strata".
5. **Type Lab does not exist (§15).** Kern takes the slot; its data entry gets `title: "Kern"` today and a note that the slot is Type Lab's. Do not rename Kern.
6. **Prism (§15)** is featured today and leads the AI-ish ordering; it drops to supporting in the design lens and off the AI lens. Its case study describes it as a "component system", consistent with the brief, so no copy conflict.
7. **Scapestudio is `featured: true` today** and appears in no lens in the brief. It goes to `/work` under Products. Flagging in case that is unintended.
8. **AI lens third featured slot** is undecided in the brief. Proposed: create-mcp-server (published npm CLI + VS Code extension, clearly AI-native, has a case study). Alternative: Spellcast. Data-only decision.
9. **Existing hash deep links (`#gamut`)** are used in the wild (CVs, posts). Keep a tiny redirect: on mount, if `location.hash` matches a project with a case study, `replace` to `/projects/<slug>/`; otherwise scroll to its row on `/work`.
10. **Persona hubs (`/[hub]`) are a catch-all dynamic route.** A future `/work` static route wins over it in Next's matching (static beats dynamic), and `/labs` would too, but any new top-level path must be checked against `persona-hubs.ts` slugs to avoid a silent shadow.
11. **Case studies are 450–700 words each and share the same skeleton** (the Aug audit found identical "Challenges" structure). The brief says not to rewrite them now; the shell will make the sameness more visible next to bespoke homepage compositions. Accept for this phase; rewrite the three design-lens flagships first when the time comes.
12. **`motion` is a new dependency** in a repo that has none for animation. Justified only by the featured↔supporting shared-element move. If that transition is cut, so is the dependency.
13. **Contrast under environmental colour (§34).** Blobs are ≤15% opacity over pure white/black, so AA holds today; lens hue/energy nudges must keep the opacity ceiling. A build-time script will assert text/ground contrast for the extreme `--env-*` values.

---

Stopping here, per §41. Nothing has been built. Decisions needed from you before Phase 2: the AI lens's third featured project (create-mcp-server vs Spellcast), whether Scapestudio really leaves the homepage, and a real URL for Strata.
