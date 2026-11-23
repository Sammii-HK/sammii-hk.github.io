# Prism controls in the portfolio

Copied from Sammii-HK/prism, commit 03a2e50 (20 November 2026), using the source-distribution model of Prism's registry. No runtime request to another checkout or CDN is required.

- `behaviour.ts`: Prism `app/lib/core/behaviour.ts`, shared control behaviour, with an additive `close` callback for focus dismissal.
- `reduced-motion.ts`: Prism `app/lib/hooks/reduced-motion.ts`, unchanged.
- `spring-css.ts`: Prism `app/lib/expressions/spring-css.ts`, unchanged.
- `Select.tsx`: Reserved expression's Select adapted to portfolio surface tokens. Adds a scrollable list, active-option scrolling, a Lucide selected indicator and blur dismissal for the longer topic catalogue.

Keep keyboard behaviour aligned with Prism when updating the source. The component supports arrows, Home/End, typeahead, Enter/Space, Escape, Tab and outside-pointer dismissal. CSS springs respect reduced motion. Pointer targets are at least 44 px tall.
