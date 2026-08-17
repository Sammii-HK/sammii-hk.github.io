---
title: "The CSS Color Game"
description: "Daily colour recognition game with email delivery and social sharing"
techStack: "Next.js, Vercel Edge Middleware, React Email, Resend"
---

## The problem

Most developers can't look at `#4A90D9` and know what colour that is. Hex and RGB values stay abstract until you've built an intuition for them, and that intuition only comes from repetition: guess, get told if you're right, try again tomorrow. That's the premise behind the CSS Color Game, a daily challenge where you guess which colour a hex or RGB value represents, keep a streak going, and see how you rank against other players.

For that loop to actually hold up, three separate things needed to work: a challenge calibrated to be genuinely testing rather than a coin flip, a reason to come back the next day, and a reason for it to spread past people who already knew it existed.

## Daily colour generation

The site is built with Next.js and uses Vercel Edge Middleware. Each day's challenge is generated deterministically from the date using a seeded random number generator: every player gets the same target colour and the same three distractors, which is what makes the leaderboard meaningful in the first place. If challenges varied per player, "today's fastest score" wouldn't mean anything.

Too far from the target in hue and the game is trivially easy; too close and it stops being a game and starts being frustrating. The generator controls this by varying the hue offset, roughly 60 degrees apart on an easy day down to around 15 degrees on a hard one, while keeping lightness and saturation similar across all options, so hue is the one variable actually being tested.

## Streak tracking and leaderboards

Player progress lives in cookies, so there's no login required. The leaderboard itself is server-side, backed by PostgreSQL: streaks count consecutive days of correct guesses, and the board shows both today's fastest correct answers and the all-time longest streaks.

## Daily email notifications

The daily email is what turns a one-off visit into a habit, so it had to actually land in inboxes rather than spam folders. Templates are built with React Email, which renders the layout as React components, and Resend handles delivery. Each email recaps yesterday's answer, shows where today's streak stands, and links through to that day's challenge, with a layout that holds up in both light and dark email clients.

Getting daily mail past spam filters turned out to be less about the sending service and more about everything around it. SPF, DKIM, and DMARC need to be configured properly, and sending has to stay consistent rather than bursty. Resend covers most of that infrastructure, but the content itself still needed its own tuning: a plain text fallback, a reasonable ratio of text to images, and an unsubscribe link that's easy to find.

## Social sharing and OG images

Finishing a challenge gives players something to share: a custom Open Graph image, rendered server-side through the Next.js OG image API, showing their score, streak length, and the day's colour. Every result gets its own image rather than a reused generic one, which is what makes sharing on X, or elsewhere, actually show something specific to that person's run.

That per-result generation runs straight into how aggressively social platforms cache OG images. The fix lives in the share URL itself: each one carries a hash unique to that player's result, so a new result means a new URL rather than a request for one a platform has already cached. Cache-control headers are set to let platforms cache freely per URL, while the unique hash keeps every new result showing its own image instead of someone else's.

## Outcome

The CSS Color Game runs as a daily challenge with email-driven retention. Players report getting better at estimating colours from hex values after a few weeks of regular play. The sharing loop, players posting their streaks and comparing leaderboard positions, has driven organic discovery, with no paid promotion behind it.
