---
title: "The CSS Color Game"
description: "Daily colour recognition game with email delivery and social sharing"
techStack: "Next.js, Vercel Edge Middleware, React Email, Resend"
---

## The problem

CSS colour values are abstract. Most developers cannot look at `#4A90D9` and picture the colour. I wanted a daily game that builds colour intuition: guess which colour a hex or RGB value represents, track streaks, and compete on leaderboards. The game needed daily email delivery to drive retention and social sharing to drive discovery.

## Architecture

### Daily colour generation

Each day's challenge is deterministically generated from the date using a seeded random number generator. This ensures every player gets the same challenge on the same day, enabling fair leaderboard comparison. The seed produces a target colour and three distractor colours with controlled difficulty (distractors are close in hue but distinguishable).

### Streak tracking and leaderboards

Player progress is stored in cookies (no login required) with a server-side leaderboard in PostgreSQL. Streaks track consecutive days of correct guesses. The leaderboard shows today's top scores (fastest correct answers) and all-time longest streaks.

### React Email and Resend

Daily game notifications are built with React Email, which renders email templates as React components. Resend handles delivery. The email shows yesterday's answer, today's streak status, and a CTA to play today's challenge. The email template adapts its styling for both light and dark email clients.

### Social sharing with OG images

After completing a challenge, players can share their result. The share generates a custom Open Graph image showing their score, streak length, and today's colour, rendered server-side via the Next.js OG image API. The image is unique per player result, encouraging sharing on X and other platforms.

## Challenges

**Distractor difficulty**: If distractor colours are too different from the target, the game is trivially easy. If they are too similar, it becomes frustrating. The generation algorithm controls difficulty by varying the hue offset (easy: 60 degrees apart; hard: 15 degrees apart) while keeping lightness and saturation similar across all options.

**Email deliverability**: Getting daily emails past spam filters requires proper SPF, DKIM, and DMARC configuration, plus consistent sending patterns. Resend handles most of this, but the email content also needed tuning: plain text fallback, reasonable text-to-image ratio, and a clear unsubscribe link.

**OG image caching**: Social platforms cache OG images aggressively. The share URL includes a unique hash per player result, ensuring each share gets its own image. Cache-control headers are set to allow platform caching while ensuring new results generate fresh images.

## Outcome

The CSS Color Game runs as a daily challenge with email-driven retention. Players report improved ability to estimate colours from hex values after a few weeks of play. The social sharing loop, where players share their streaks and compete on leaderboards, drives organic discovery without paid promotion.
