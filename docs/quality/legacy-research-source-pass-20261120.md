# Legacy and research source receipts, 20 November 2026

Thirteen remaining catalogue entries are accounted for here. This closes source identification and portfolio-claim checks where the named files support them, not product polish. None was launched in a browser or deployed. Existing local changes were left untouched; no environment, private session/state, database, model or delivery operation was used. Two research entries have explicitly incomplete source receipts.

## the-colour-game

Source: 243408d, local game component change preserved.

Evidence: src/lib/colours.ts; src/components/ColourGame.tsx; src/lib/email.ts; src/app/api/send-daily-email/route.ts; src/app/api/og/highscore/route.tsx.

Established: Date-hashed colour helper, browser personal progress, React Email worker delivery and query-driven OG images. Removed shared-leaderboard, identical daily game/distractors, direct Resend, Edge middleware, durable send dedupe and measured retention claims.

Remaining: Play/error/reset/phone/keyboard; process-local email dedupe and fallback recipients; no live delivery or DB checks. Icon scan: 28 blocking, 20 content-symbol reviews.

## isle

Source: 406137d, webview local modification preserved.

Evidence: src/SessionWatcher.ts; src/extension.ts; src/IslePanel.ts; webview/main.ts.

Established: VS Code session watcher/webview bridge, nonce CSP, calendar seasons, hour-bucket lighting and astronomy-derived moon phase. The declared astronomy Observer is unused; accurate solar-position lighting claim removed.

Remaining: Fresh session mapping, stale/path/privacy boundaries, CSP/data escaping, keyboard alternatives and resource cleanup. No private Claude session files read and no extension launched. Icon scan: 0 blocking, 2 content-symbol reviews.

## beyond-light-vr

Source: 91636b3.

Evidence: src/journey.js; src/main.js; src/room.js; src/shaders/uvReveal.frag.

Established: Authored colour phases, WebXR entry, GLSL text reveal and desktop postprocessing bloom after reading time. The VR branch uses the plain renderer, so desktop bloom is not proof of a headset white-out finish.

Remaining: Headset session/controller/comfort/physical performance, phone navigation, font reading time, reduced motion and desktop-versus-VR parity. It is an artistic fluorescence simulation, not a UV/wavelength measurement. Icon scan: 1 blocking, 0 reviews.

## celestial-map

Source: 92f24cc, untracked build output and ignore files preserved.

Evidence: src/stars.js; src/projection.js; src/controls.js; src/interaction.js; src/planets.js.

Established: D3 orthographic Canvas map, remote D3 Celestial catalogue, approximate B-V-to-RGB and magnitude-size mapping, named-star overlays and Astronomy Engine sidereal-time controls. Removed unverified 9,000-plus count and calibrated-colour implication.

Remaining: Pin and attribute remote master catalogue; verify count and load/error states, projection/behind-globe clipping, controls and astronomical interpretation. No CDN request or scientific recalculation. Icon scan: 0 blocking, 0 reviews.

## creative-coding

Source: 1cff25f, unrelated gitignore change preserved.

Evidence: index.html; experiment-01.html through experiment-15.html.

Established: All fifteen linked HTML sketches exist, load the same DSCF7641.JPG and p5 1.9.0. Index and representative pixel-scanner, Sobel-edge, Voronoi, particle and final sketches inspected. Reclassified as interactive experiments rather than writing.

Remaining: All fifteen actual workflows, image/load errors, p5 CDN availability/licence, captions, reduced motion, keyboard/phone, and low-contrast index metadata. No live sketch or image edit. Icon scan: 16 blocking, 0 reviews.

## liquidity

Source: ce2d908, unrelated untracked shell file untouched.

Evidence: src/app/page.tsx; src/app/gsap/page.tsx; src/app/canvas/page.tsx.

Established: Two selectable paths: GSAP SVG wave and Rapier Canvas particles constrained by a text mask. The latter creates 2,500 rigid bodies with strong containment forces; it is not a fluid solver.

Remaining: Canvas RAF loop does not retain cancellation/free-world cleanup; GSAP timers/lifecycle and repeated navigation need checking. Also keyboard/touch equivalents, GPU/CPU/frame cost, reduced motion and actual phone layout. Icon scan: 0 blocking, 0 reviews.

## day-lite

Source: d36261e.

Evidence: src/App.tsx.

Established: Mapbox pointer coordinates select an Astronomy Engine Observer; SearchRiseSet supplies sunrise/sunset and daylight readouts. No custom terminator layer or explicit globe projection found. Corrected catalogue accordingly.

Remaining: Longitude/15 offset is an approximation, not civil time-zone/DST lookup. Polar missing events and date-boundary math need checking; current time refresh depends on rerenders, not a timer. Verify map credentials through normal runtime without reading env files, map errors and phone/keyboard selection. Icon scan: 1 blocking, 0 reviews.

## balloon-bonanza

Source: 4bb3edd.

Evidence: src/App.tsx; src/App.css.

Established: 100 balloon circles and knots, three constraints each, three walls, pointer constraint, tuned low gravity/restitution, runner cleanup and separate theme update. Removed sixty-FPS measurement and physical-buoyancy implication.

Remaining: Actual feel and frame times, phone touch, canvas resizing, keyboard alternative, motion pause and theme UI. No benchmark or browser pass in this review. Icon scan: 1 blocking, 0 reviews.

## tailwind-colour-creator

Source: 6b17d43.

Evidence: src/TailwindColorGenerator.tsx.

Established: Current source is OKLCH with relative lightness/chroma factors, twenty-step gamut chroma search, input-centred step 500 and CSS/Tailwind v4/config copy outputs. Removed old HSL/official-palette exactness claims.

Remaining: Malformed six-character hex produces NaN, custom token-name escaping, copy failure feedback, all exported snippets and measured colour/contrast/phone checks. No exact Tailwind or colour-science benchmark. Icon scan: 0 blocking, 0 reviews.

## communication-infographic

Source: 4640689.

Evidence: src/components/Timeline.js; src/components/Modal.js; src/components/TimelineScrubber.js; src/utils/getTimelineData.js; src/data.json.

Established: Earlier React/Framer Motion timeline with category/title filtering, keyboard-openable detail dialogue, Escape/focus trapping/restoration and a year scrubber. Removed SVG-rendering and unverified responsive-stack claims.

Remaining: Initial layout computes positions once; resize handling and scrubber geometry need review, plus background isolation, touch/keyboard scrubbing, source dates/attribution and phone reading. Archived entry kept. Icon scan: 0 blocking, 0 reviews.

## moth-drawings

Source: mechanics source 7526032; observatory-specific source unavailable in reviewed tracked files.

Evidence: Moth packages/core/src/cat/drawing.ts; apps/web/src/ui/drawings.ts; existing catalogue and structured Moth study.

Established: The Moth mechanics source includes stroke drawings and a put-away state. Existing observatory description is retained as earlier recorded context, with primary navigation to the Moth study.

Remaining: The standalone observatory implementation was not located among the reviewed tracked web sources, so its four panels, one-fetch contract, current hiding behaviour and screenshots are not reverified. No keeper state, private drawings or live model calls inspected.

## why-this-take-won

Source: portfolio source; original Swift function at 3fff237a read through git show.

Evidence: public/experiments/why-this-take-won/score.mjs; takes.mjs; index.html; PostReady/Pipeline/MultiTakeAssembler.swift at 3fff237a.

Established: Port arithmetic and constants inspected against the original committed Swift function. Four hand-worked offline cases pass: full coverage at target pace, one filler penalty, repeated-word set coverage and punctuation splitting. Samples explicitly invented; weight sliders are exploratory, not deployed app weights.

Remaining: No speech, gaze detector, real transcript or native app end-to-end validation. Coverage compares unique normalised word sets rather than repeated-word completeness; study now explains that distinction. Actual controls/phone/accessibility and present native-source parity remain open.

## teaching-a-computer-to-paint

Source: recorded portfolio study and saved image assets; raw harness/run folders not located.

Evidence: public/experiments/teaching-a-computer-to-paint/index.html and local WebP assets; content/case-studies/teaching-a-computer-to-paint.md.

Established: Recorded essay and static images cover procedural sunset, four painting episodes and a one-run-per-model comparison. All referenced local images exist. Entry remains research/writing, not an interactive painting tool.

Remaining: No raw painter harness, per-director messages, metric implementation or reproduction/checksum run located for this pass; numerical results are preserved as recorded research, not re-certified. Original paper fidelity, pigment model, image provenance and experimental conclusions need those receipts. No generation/model/provider runs.

## Catalogue coverage

All 39 project entries now have either a prior product/source receipt, one of the named source passes, or an explicit artefact/source limitation. The ledger still includes all 15 explorations and 37 charts. None of these statuses claims that all 91 experiences are polished, scientifically checked, accessible or current on the live host.

Icon numbers are source-lint findings, not unique controls. Review-only data symbols remain distinct, and the shared guard was not installed into these tool releases in this lane.
