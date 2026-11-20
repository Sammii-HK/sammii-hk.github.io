# Remaining product and creative source review, 20 November 2026

These are source receipts for eight catalogue entries, not a browser polish pass. Existing local changes were left untouched. No environment files, private operational records, database commands, generation, provider calls or deployments were used. The project catalogue keeps all 39 projects alongside 15 explorations and 37 charts.

The product studies for Gamut, Homebase, Crystal Index and Flip now use structured JSON with matching Markdown fallbacks. Kinetic, Spectra, Refract and Grove retain the shorter creative-work format; their evidence and limits are recorded here rather than forcing a product template.

## gamut

Source: 3d05f4c.

Files: src/lib/palette.ts; src/lib/colour.ts; src/lib/tokens.ts; src/lib/export.ts; src/lib/url.ts; src/app/page.tsx.

Implemented: Eleven fixed OKLCH steps, 20-iteration chroma search, white/black contrast, role-derived previews and four export formats.

Remaining: Scale rename preserves ID but palette maps use names, so semantic resolution can fall back to #888888. Shared URLs are decoded without colour/role validation. Test renames, malformed URLs, semantic-pair contrast and exact exports.

Shared source icon scan: 1 blocking icon finding; 0 content-symbol reviews.

## homebase

Source: 4a9c05a, with separate dirty local work.

Files: apps/web/src/components/Dashboard.tsx; apps/web/src/lib/autonomy.ts; apps/web/src/lib/action-outbox.ts; apps/web/src/lib/auth.ts; apps/web/public/sw.js.

Implemented: Current command-centre/social/money/queue/chat navigation, sixty-second core refresh, action tiers and subject acknowledgements. Pixel rooms are legacy, not current navigation.

Remaining: No private state or live actions inspected. Check route-by-route policy enforcement, configured authentication, stale/partial/source-time UX, cached reads versus offline mutations and recorded safe-fixture walkthrough.

Shared source icon scan: 130 blocking icon findings; 39 content-symbol reviews.

## crystal-index

Source: 56258c19, with separate dirty local work.

Files: prisma/schema.prisma; components/Organisms/FilterableCrystalGallery.tsx; app/crystals/page.tsx; app/api/v1/crystals/route.ts; pages/api/crystalInfo/create.ts; lib/openai-identify.ts; pages/api/v1/identify.ts.

Implemented: String-array catalogue/collection records, browser directory filters, separately paginated array-filter API, legacy GPT-4 descriptions and Qwen3-VL identification. Three/Fiber source found is a location globe.

Remaining: Removed per-specimen 3D, indexed join filtering, editable-before-save generation and query-speed claims. Vision output only checks field types, not membership/bounds/normalisation. Native SwiftUI/RevenueCat source not located in reviewed web checkout. Check ownership, image validation, subscriptions, uncertainty UI and native source separately. No DB/model/image calls made.

Shared source icon scan: 23 blocking icon findings; 34 content-symbol reviews.

## flip

Source: b696ada, unrelated screenshot modification preserved.

Files: src/lib/hashing.ts; src/lib/stats.ts; src/lib/auth.ts; src/lib/schemas.ts; src/sdk/flip.ts; src/app/api/v1/decide/route.ts; src/app/api/v1/track/route.ts; src/app/api/internal/experiments/route.ts; src/app/api/internal/stats/[id]/route.ts.

Implemented: Server-side weighted MurmurHash3 assignment; one-year visitor cookie; in-memory SDK choice cache; z-test and Wilson calculations; event-count dashboard.

Remaining: Beacon sends no credential accepted by tracking auth. SDK track uses last cached experiment. Stats count all conversion events rather than goal-filtered unique visitors; no sample/power/multiple-testing gates. Internal management/stats routes lack checked authentication. No batching/WebSocket/size/performance proof. Repair actual tool before promoting its experiment results.

Shared source icon scan: 0 blocking icon findings; 0 content-symbol reviews.

## kinetic

Source: 76499dc.

Files: app/page.tsx; app/components/SpringPlayground.tsx; app/components/GestureCards.tsx; app/components/GravityBalls.tsx; app/globals.css.

Implemented: 25 motion cards; selected spring controls; drag reorder and velocity/distance dismissal. Gravity Balls is authored bounce keyframes, not a physical gravity solver.

Remaining: Removed all-demos-adjustable and pinch claims. CSS reduced-motion rule does not establish that JS springs/RAF stop. Check keyboard equivalents for drag/swipe, measured touch targets, motion reduction and real phone behaviour. Keep as motion studies, not a production component guarantee.

Shared source icon scan: 5 blocking icon findings; 8 content-symbol reviews.

## spectra

Source: d43105a, unrelated untracked build declarations preserved.

Files: apps/web/src/hooks/useAudioData.ts; apps/web/src/components/ShaderCanvas.tsx; apps/web/src/shaders/fragment.glsl.ts.

Implemented: Explicit microphone request, 512-point FFT with index-band averages, smoothed shader uniforms and Three.js rendering. Bass warps, mid shifts hue and high adds shimmer.

Remaining: Start click exists on parent overlay and child button, allowing bubbling to request twice; denial is caught in hook but handleStart still hides the overlay containing the error. AudioContext is not retained/closed; only tracks/RAF are stopped. React polling updates the audio bridge rather than exposing the unused ref getter. Verify single start, denial/retry, resource cleanup, physical frequency-band labels and reduced-motion fallback in the actual tool.

Shared source icon scan: 0 blocking icon findings; 0 content-symbol reviews.

## refract

Source: 8ee0c7a.

Files: app/api/shader/route.ts; components/ShaderCanvas.tsx; app/page.tsx.

Implemented: Server-side Groq Llama 3.3 70B description-to-GLSL, request-length validation and browser compile-before-apply; failed compile retains previous scene. No text hashing.

Remaining: No generation or recorded playback invoked. Route lacks reviewed auth/rate/timeout/provider-failure handling; regex float conversion is not a GLSL parser. Full program-link behaviour, high-DPI coordinate consistency, GPU cost, material/geometry disposal, pointer/touch and reduced motion remain. Portfolio AI showcase must use recorded evidence.

Shared source icon scan: 0 blocking icon findings; 0 content-symbol reviews.

## grove

Source: 908400b, with separate dirty sprite/session changes.

Files: components/Forest.tsx; app/api/sessions/route.ts; engine/scene.ts; engine/sprite.ts; engine/renderer.ts; engine/particles.ts.

Implemented: Earlier local session monitor: five-second polls, project clearings, character-grid sprites, animated night scene and firefly/spark particles.

Remaining: Source reads local Claude session records; never inspected those records. No seasonal/world-clock/weather system established. Committed scene still has placeholder workstations. Path reconstruction replaces every hyphen; failed polls silently retain stale sessions. Check privacy/auth boundary, source-time/error state, cleanup, resizing, keyboard and semantic alternative. Kept in archive.

Shared source icon scan: 0 blocking icon findings; 4 content-symbol reviews.

## Checks and interpretation

The shared central icon scanner was run read-only on each named source root. The totals are blocking lint findings, not necessarily distinct controls. Review candidates remain separate; data symbols and sprite art must not be blindly replaced. No tool files were changed, and this pass does not establish that each site integrates the icon guard into its own release commands. The portfolio itself retains its separate zero-blocking icon checks.

Source files can establish an implemented branch or a contract mismatch. They do not prove live authentication configuration, current model service availability, measured speed, client compatibility, calibrated identification or user experience. The ledger retains those open checks.
