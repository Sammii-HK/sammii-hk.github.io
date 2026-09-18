# Phase 2F: environmental lens personality and the Labs portal

Date: 15 Sept 2026. Branch `redesign`.

## What differs by lens (behaviour, never colour)

The colour formula from the Phase 2B parity gate is unchanged for every lens; the unit test asserts the four channel triplets are identical across lenses for the same input. `app/src/components/env/lens-environment.ts` is the whole table:

| | Pointer follow | Drift | Blobs lean toward pointer | Rest positions | CSS |
|---|---|---|---|---|---|
| **Design** · things react | light spring (stiffness 0.14, damping 0.68): weight and a hint of overshoot | ×1.15 amplitude, ×1.1 rate | no | original | ambient layer scales up to 3% and saturates up to 12% with pointer energy, relaxes when still |
| **AI** · things form | slow exponential lerp 0.11 | ×1, ×0.85 rate | yes, up to 28% while the pointer moves, relaxing when it stops | original | none |
| **Product** · things find their place | critically damped lerp 0.22, no overshoot | ×0.6 amplitude, ×0.8 rate | no | eased 70% toward a regular 25/75 lattice | none |

Verified at the same pointer position: the three lenses produce different `--env-p1..4` and the same channel formula; hovering another lens leaves `data-lens` and the environment untouched; committing changes it without a navigation.

## Custom properties and attributes

- Added: `--env-energy` (0..1, smoothed pointer speed). The only new continuous variable.
- `data-lens` on the environment root (existed since 2B) now selects the behaviour set. The formula functions gained optional `params`/`pointer` arguments whose defaults are the identity (`IDENTITY_PARAMS`), so the parity test still passes unchanged.

## CursorFollower

Measured on the current page: max 8/255 pixel difference with it on versus off (mean 1.2). On the live site it sits at `z-index:-10` under the `bg-white` wrapper and is invisible; it only became faintly visible after 2C's `isolation: isolate`. Its stacking was accidental and it ran its own rAF loop and mousemove listener for nothing. Decision: not mounted on the homepage. Its "the environment notices you" role is carried by `--env-energy` under the Design lens instead. The component stays for `/hero-lab`.

## Reduced motion (environment)

`EnvironmentProvider` now honours `prefers-reduced-motion` (live, via `matchMedia` change events): the time-drift term is frozen at its value when the preference took effect, the scroll wave is disabled, pointer energy is held at 0, and the pointer response is immediate rather than eased, so colour still answers the pointer without choreography. Verified: `--env-t` and `--env-p1` constant over 700 ms, colour changed on pointer move, no change on scroll. Design's CSS breathing is off. Lens identity survives through the rest positions (Product's lattice) but nothing depends on it.

## Labs portal

Concept: the rule that closes Selected Work is the boundary, and it is a string. One quadratic Bézier in an inline SVG. With a pointer it bends toward you; a click or tap plucks it and it rings down on a damped spring; focusing the link plucks it. Reduced motion: the rule stays straight. Copy: "Things that don't belong in case studies." (chosen over the question; the line reads better above a rule). Destination `https://labs.sammii.dev` as a plain link with `rel="noopener"`.

**Status of the destination: `labs.sammii.dev` does not resolve (no DNS record, curl 000).** The portal ships with a quiet "Opening soon" beside the link so it does not pretend; delete the `.labs-status` span when Labs is live.

Cost: one path element, a rAF loop that runs only while the string is moving (settles and stops), no React state, no library. Section height 248 px on a phone.

## Verification (browser)

- Design/AI/Product deep links each initialise their environment; commit switches it without reload; preview never touches it.
- Reduced motion as above; portal straight under it.
- Portal: bends near the pointer, plucks on click, plucks on focus (outline visible), plucks on touch tap, returns to exact rest, link href/text/rel correct, zero horizontal overflow at 1440/834/390.
- Gamut fragment still interactive under Design; Selected Work still recomposes (Product → Lunary, Lattiq, Strata); hero/nav unchanged.
- tsc clean, vitest 38/38 (5 new lens-parameter tests), export builds.

## Performance (same harness, quiet machine: load average 3)

| Metric | 2E | 2F |
|---|---|---|
| Homepage JS transferred | 403.2 kB | 406.2 kB (+3.0 kB: lens table, spring, portal) |
| Route `/` first-load JS | 123 kB | 124 kB |
| LCP | 80 ms | 88 ms |
| CLS | 0 | 0 |
| rAF interval p50 / p95 / max over 2 s of pointer movement | 16.7 / 17.7 / 17.7 ms, 0 long frames | 16.7 / 17.6 / 32.4 ms, 0 long frames |
| React commits during that movement | 3 | 7 (all from the random pointer path crossing lens phrases: hover preview is discrete state; the environment loop commits nothing) |
| Custom-property writes per second | 494 | 693 (one more variable, `--env-energy`, at 60 fps) |
| Click → lens committed and work recomposed | 57 ms | 67 ms |
| New dependencies | none | none |
