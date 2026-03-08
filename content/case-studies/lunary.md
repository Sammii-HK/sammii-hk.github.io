---
title: "Lunary"
description: "A full-stack PWA for real-time planetary tracking, personalised astrology, and a 2,000+ page grimoire"
techStack: "Next.js 15, Prisma, Neon PostgreSQL, Stripe, Vercel"
---

## The problem

Existing astrology apps either oversimplify (daily horoscope and nothing else) or overwhelm with jargon and no explanation. There was no product that combined accurate astronomical data with accessible, well-written astrology content, all in a fast, modern interface.

I wanted to build something that could calculate real planetary positions in real time, generate personalised birth charts, and wrap it all in a content-rich grimoire covering astrology, tarot, crystals, and more.

## Architecture

The app is a Next.js 15 PWA deployed on Vercel with a Neon PostgreSQL database via Prisma.

### Astronomical engine

All planetary and lunar calculations use the astronomy-engine library, which implements VSOP87 and NOVAS C 3.1. This gives positions accurate to within one arcminute, which is more than sufficient for astrological use. The key decision here was choosing a JavaScript-native library over a server-side ephemeris service. Running calculations client-side means zero latency for position lookups and no backend dependency for the core feature.

### Birth chart system

Birth charts use the Placidus house system with 36 planetary aspects calculated per synastry comparison. The initial version supported 10 aspects; I iterated to 36 after user testing showed that the limited set missed commonly referenced configurations. The Cosmic Score system evaluates 12 pattern types across a chart, giving users a single digestible number that represents the overall energy of a given day.

### Content system

The grimoire contains over 2,000 articles covering astrology, tarot, crystals, spells, and divination. All content is structured in the database with metadata for search, filtering, and cross-linking. Horoscopes exist for all 12 zodiac signs through 2030, both monthly and yearly, generated programmatically and reviewed for quality.

Transit pages (e.g. Saturn in Gemini 2030) and placement pages (e.g. Saturn in Gemini) are also pre-built, creating a deep SEO footprint of programmatic pages that rank for long-tail queries.

### Subscription model

The app uses a freemium model with Stripe billing. The free tier includes universal astrology features, the full grimoire, and no ads. Pro unlocks personalised features at £8.49/month. The subscription lifecycle is entirely webhook-driven: Stripe events trigger database updates, so there are no polling loops or manual state management.

## Challenges

**Push notifications on iOS**: Getting reliable push notifications working across iOS Safari (via PWA) and native (via Capacitor) required careful handling of service worker registration timing and notification permission flows. Firebase Cloud Messaging handles the delivery, but the permission UX had to be built from scratch to avoid the aggressive prompt patterns that users ignore.

**Widget rendering**: The app supports three native widget types (Cosmic Dashboard, Moon Tracker, Daily Card). Widgets run in a constrained environment with no access to the main app's state, so each widget makes its own lightweight API call and renders independently.

**Content at scale**: Managing 2,000+ articles with structured metadata, cross-references, and search required building a custom admin interface. Each article has tags for zodiac signs, planets, elements, and topics, enabling faceted filtering across the grimoire.

## Outcome

Lunary is a Delaware C-Corp incorporated via Stripe Atlas with Mercury banking. The app has active users on both web and mobile (via Capacitor), with the grimoire driving significant organic search traffic. The MCP server exposes 60+ tools for AI-assisted content management and analytics, which powers the automated content pipeline via Orbit.
