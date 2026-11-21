# Portfolio corrections and remaining checks, 21 November 2026

This is a local, unreleased checkpoint. Existing owner changes and other release branches are preserved.

## Corrected and checked

- Artify keeps a direct image workspace, its neutral palette and Inter. Added promotional introduction/footer and Garamond are removed. Source 7bf4615, verification receipt ccdd619. Its production build passes. Actual desktop and 390px phone checks cover local sketch preparation and style search; no generation ran.
- ScapeStudio opens directly into image upload. Original daisy photography is restored as the portfolio showcase. Source 4395b75, verification receipt be699e5. Production build and actual desktop/phone entry checks pass; earlier editor/export evidence is separate.
- Portfolio original-photo restoration e6a98bb production build passes. Actual Work → ScapeStudio → Labs navigation, phone search and Prism topic selection pass, with no horizontal overflow or console errors in those journeys. Moth, ScapeStudio and Artify have matching image boxes on Work.
- iPrep 1c393e3 adds normal lint/test/build Lucide gates: zero blocking source findings, 14 focused checks and 374 preserved handler attributes. Full application installation/types/build/browser remain unverified.
- Spellcast web 4cf8b30 adds normal web lint/test/build Lucide gates: zero blocking findings across 201 web and 20 shared UI files, 14 focused checks and 54 preserved handler attributes. Actual installed Lucide 0.468 renders all eight platform choices and a labelled fallback. Full application/runtime checks remain unverified.

## Navigation follow-up

The actual browser check found Labs study links escaping local previews to production. The follow-up uses client navigation and local case/recorded-experiment paths on portfolio and preview hosts, while retaining the public Labs subdomain's cross-site destinations. Regression cases protect both host behaviours and query/hash preservation. 142 Vitest and 12 Node icon/coverage cases, lint and standalone types pass. Final production build passes. Actual IAB click from Labs to Why this take won opens the local `/projects/why-this-take-won/` case, with no console errors. The public Labs host contract is covered by regression tests, not a new public deployment. Saved evidence: `.codex-artifacts/labs-study-local-navigation-20261121.jpg`.

## Still open

- Reconcile isolated source patches with current release branches before any release. Source and browser evidence do not establish that deployed sites have these changes.
- Lunary's overlapping release work stays separate. Its remaining normal icon gates, archived Grove/Tailwind Colour Creator/Communication Infographic gates, and native surfaces remain open.
- Moth's full strict typecheck/DEV fixtures and dependency debt; Strata native fallback icons/Expo dependency debt; Isle's newer owner-edited world; private/backend/native/provider journeys remain outside the completed checks.
- Podify storage/configuration/confidentiality restrictions and the previously documented Conjure, Flip and Crystal dependency debt remain. These projects are not certified release-ready by a portfolio screenshot.
- No new push, merge, deploy, provider generation or publication was performed in this continuation.
