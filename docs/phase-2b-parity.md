# Phase 2B: environment provider migration, parity report

Date: 15 Sept 2026. Branch `redesign`. Compared `out/` built at `310f3e4` (before) against the refactor (after), same Playwright harness (`scripts/parity/capture.mjs`, `scripts/parity/perf.mjs`), `performance.now()` frozen at 120 s so the time-drift term is deterministic, 900 ms settle for the lerps.

## Architecture after the refactor

- `app/src/components/env/environment-formula.ts`: the cursor colour formula, verbatim from `gradient-creator.ts`, returning CSS custom properties instead of style strings. `ambientVars` (four blobs: `--env-c1..4`, `--env-p1..4`), `logoVars` (`--env-logo-a/b/c`), plus raw `--env-x`, `--env-y`, `--env-t`.
- `app/src/components/env/EnvironmentProvider.tsx`: owns pointer/touch targets, the 0.2 lerp, the scroll wave and the single rAF loop. Writes the variables to its root `div[data-env]` with `style.setProperty`. No React state in the loop. Stamps `data-lens` (inert, default `design`). Exposes `useEnvironment()` → `{ root }` for later consumers.
- `globals.css`: `[data-env]` declares the defaults (exactly the old first-render values for x = y = 0, t = 0) and the four-blob `background` reading the variables; `.logo` reads `--env-logo-*` on lavender.
- `PortfolioContainer` is now layout only. `Navbar` needs no props on the homepage; it still accepts `xPc/yPc` so the blog wrapper's own pointer state is untouched.
- `CursorFollower` moved to `env/` unchanged (own rAF, own lerp 0.06, desktop-only). The hovered-card border in `ProjectGrid` was already ref-driven and is unchanged.
- `gradient-creator.ts` kept for `/founder` and the blog; annotated.

Rule kept: continuous environment → custom properties; discrete editorial state → `data-lens` / React state.

## Formula parity (unit test)

`app/lib/__tests__/environment-formula.test.ts` composes the CSS strings back from the variables and asserts byte equality with `backgroundGradientCreator` and `gradientCreator` for 420 (x, y, t) samples including x > 100 (pointer X is doubled) and t up to 3600 s. Passes.

## Visual parity (screenshots, 1440x900 unless stated)

| State | Pixel mean diff (0–255) | Pixels > 24 | Computed bg identical | Logo identical | Card border identical |
|---|---|---|---|---|---|
| cursor left/top | 0.00 | 0.00% | yes | yes | n/a |
| cursor centre | 0.03 | 0.00% | yes | yes | yes |
| cursor right/bottom | 0.02 | 0.00% | yes | yes | n/a |
| cursor moving | 0.00 | 0.00% | yes | yes | yes |
| grid scrolled (900px) | 0.00 | 0.00% | one channel ±1 * | yes | yes |
| card hover | 0.01 | 0.00% | yes | yes | yes |
| dark, centre | 0.00 | 0.00% | yes | yes | yes |
| dark, card hover | 0.02 | 0.00% | one channel ±1 * | yes | yes |
| mobile 390x844, touch | 0.00 | 0.00% | yes | yes | yes (follower `display:none` both) |
| reduced motion | 0.03 | 0.00% | yes | yes | yes |

\* lerp had not fully converged at the capture instant in one of the two runs; the formula test proves identical output for identical inputs.

No-JS first paint (JavaScript disabled): computed background and logo strings identical, screenshot pixel diff 0.0. The SSR HTML no longer carries an inline `style="background: …"`; the CSS defaults reproduce it.

## Performance / render (same harness, headless Chromium, 2 s of continuous pointer movement)

| Metric | Before | After |
|---|---|---|
| Homepage JS transferred | 398.2 kB (9 files) | 399.6 kB (9 files) |
| Route `/` first-load JS (Next report) | 121 kB | 121 kB |
| LCP | 668 ms | 224 ms † |
| CLS | 0 | 0 |
| Click → dialog painted | 2105 ms † | 592 ms † |
| React commits during pointer movement | 40 (one per frame) | 0 |
| rAF frame interval p50 / p95 / max | 64.6 / 84.4 / 100.2 ms | 34.4 / 66.8 / 83.3 ms |
| Inline style mutations on the container per second | 19 (whole `style` attribute rewritten) | 234 (14 custom properties × ~17 frames) |

† Single runs in a software-rendered headless browser; treat LCP and click timings as directional, not absolute. The architectural criterion is the React commit count: pointer movement no longer re-renders the tree. Frame intervals halved in the same harness. The custom-property writes are many small attribute mutations rather than one large one; the browser recalculates style once per frame either way. If it ever matters, the provider can diff values and skip unchanged writes.

## Accessibility and reduced motion

- Keyboard, focus rings, skip link, modal focus trap: untouched.
- `prefers-reduced-motion: reduce`: identical to before, which means the ambient drift and cursor lerp still run under reduced motion (the global CSS kill switch only affects transitions/animations, not this rAF loop). This is parity, not correctness; gating the time-drift term under reduced motion is queued for Phase 2F/2J per the brief (§34).
- Touch: same target-update rules; the follower stays hidden below `md`.

## Regressions / unresolved

1. Reduced motion does not pause the environment (pre-existing, preserved deliberately).
2. Project screenshots render as broken images when the static export is served locally in both versions (next/image default loader on `output: 'export'`). Not introduced here; worth checking on the live GitHub Pages build before Phase 2E relies on media.
3. `out/` is tracked in git and is rewritten by every build. Left out of the redesign commits.
4. The blog keeps its own, simpler pointer system through `Navbar`'s legacy props; consolidating it onto the provider is optional later work.
