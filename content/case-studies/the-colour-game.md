---
title: "The CSS Color Game"
description: "A colour-recognition game with explicit round transitions, a three-stage Gauntlet and resilient browser-local progress."
techStack: "Next.js, React Email, PostgreSQL, Cloudflare Workers"
updated: "2026-11-20"
status: "Local candidate cfaf28d: actual client game and phone flows verified; full site build, delivery and release remain open."
---

<!-- Kept in step with the canonical structured study in the-colour-game.json. -->

Local candidate cfaf28d: actual client game and phone flows verified; full site build, delivery and release remain open.

## Keep the game separate from the date

The game chooses random CSS colours for practice and a three-stage Gauntlet. The dated reference colour is a separate feature, selected by hashing a date into the colour list. It does not imply identical game rounds for every visitor or a sequence that visits every colour once. The Gauntlet draft was already in progress; this local repair builds on it and preserves three correct answers per stage, 10 / 20 / 30 points, and one miss ending a run.

_Actual client-only local review. Feedback remains until Next colour; server, date-reference and email routes are excluded. This is not a production screenshot._

_Actual random Gauntlet client at 390px. Browser-local scores are shown, not a shared leaderboard._

## An answer should change the score once

- **What happened:** Choices remained active while delayed feedback was showing. A second event could score the same round again, and an old timeout could change a newer mode or difficulty.
- **Why:** Independent score, target, options and timer updates had no single boundary between a question, its feedback and the next round. A separate options effect also used practice difficulty during Gauntlet promotion.
- **Fix:** The local engine models question, feedback and results explicitly. A synchronous round reference rejects duplicate or blank submissions; the next round is an explicit action. Options are generated from the active stage, and switching modes or difficulty begins a fresh run.

## Let the player finish reading

Feedback explains the correct CSS name and, for a recognised wrong guess, shows the guessed colour alongside it. A fixed timer can move on before that comparison has been read.

- **Explicit Next colour (chosen):** Keep feedback stable, lock answers, focus Next after a guess and restore focus to the next answer. Results focus Try again.
- **Automatically replace the round after a delay:** Requires cancellation across mode changes and imposes a fixed reading pace on every player.

Native Enter was checked through a correct answer, Next and hard-mode validation. Three Easy correct answers advanced to Medium at 30 points; a later miss preserved the run score and displayed the stage counts.

## Test the colour, not a spelling accident

Aqua and cyan have the same rendered colour, so they cannot be distinct alternatives. Options now sample without replacement by hex value and use a bounded Fisher-Yates shuffle. The next target excludes the previous rendered colour. Typed answers trim spaces, ignore case and accept CSS aliases such as grey/gray and aqua/cyan. A blank hard-mode answer does not consume the round.

## Personal progress stays on this browser

Practice best and local-calendar play history keep their existing storage keys. Invalid saved values are rejected; denied storage reads or writes leave the game playable and explain when progress lasts only for the visit. A yesterday streak remains available to continue today. This records days with a guess, not server-verified correct-answer streaks. There is no shared leaderboard or cross-device score synchronisation.

## A consistent shell and usable phone controls

The local phone check found no document overflow at 390px, and all observed game buttons and the answer field measured 44px high. Answer status is announced, mode buttons expose selected state, and keyboard focus follows the round. The theme helper and Tailwind now share the same dark-class contract; denied preference storage falls back to the system setting. The home page no longer advertises an unsupported community size or an upload gallery.

## Email has its own delivery boundary

The authenticated daily-email route loads active subscriber records and renders a React Email template. The helper posts HTML and plain text to a configurable worker endpoint. This is a different implementation from the earlier claim of direct Resend delivery. Its process-local sent-today set is a basic repeat guard, not durable idempotency across workers or restarts. Database-error and test-recipient fallback behaviour still needs a delivery review.

## Copy a score without pretending it is verified

The game copies the actual browser-local practice best and reports clipboard success or failure. The placeholder social post has been removed. The separate OG endpoint still renders score and streak query parameters, which are not signed score receipts or evidence of anti-tampering.

> Local cfaf28d has 20 Jest checks, 11 shared icon regressions, zero icon violations, TypeScript and changed-source lint passing. Full and production dependency audits report zero vulnerabilities after the compatible patch. The client-only review excludes server, analytics, email and date-reference routes. A full Next production build was withheld, and broad legacy site lint errors remain. No current production play, inbox delivery, worker behaviour, retention or learning outcome is established by these checks.
