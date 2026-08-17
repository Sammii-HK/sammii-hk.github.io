---
title: "Lunary"
description: "A full-stack PWA for real-time planetary tracking, personalised astrology, and a 2,000+ page grimoire"
techStack: "Next.js 15, Prisma, Neon PostgreSQL, Stripe, Vercel"
---

## The problem

Astrology apps tend to fail in one of two directions. Some flatten the whole subject down to a single daily horoscope card: no depth, nothing to explore twice. Others go the opposite way, all dense charts and unglossed jargon. Neither leaves much room for someone who wants accurate data and a way to actually understand it.

Lunary is a Next.js 15 PWA built to sit between those two failure modes: real planetary positions calculated in real time, personalised birth charts, and a content library big enough to answer the questions a chart raises rather than just present it.

## Architecture

The app runs as a Next.js 15 PWA on Vercel, backed by a Neon PostgreSQL database via Prisma.

### Astronomical engine

Planetary and lunar positions come from astronomy-engine, a library implementing VSOP87 and NOVAS C 3.1, accurate to within one arcminute, more precision than astrology strictly needs. The real decision was where to run it. astronomy-engine is JavaScript-native, so calculations happen client-side rather than through a server-side ephemeris service. That removes network latency from every position lookup and means the core feature carries no backend dependency at all.

### Birth chart system

Birth charts use the Placidus house system. Synastry comparisons calculate 36 aspects per chart pairing now; the first version shipped with 10, and user testing showed how often the smaller set was missing configurations people were actually looking for. The Cosmic Score sits on top of this: it evaluates 12 pattern types across a chart and compresses them into one number, giving a legible answer to "how's today" without anyone having to read the underlying data themselves.

### Content system

The grimoire holds over 2,000 articles across astrology, tarot, crystals, spells, and divination, all structured in the database with metadata for search, filtering, and cross-linking. Horoscopes run for all 12 signs through 2030, monthly and yearly, generated programmatically and then reviewed rather than published raw. Transit pages (Saturn in Gemini 2030) and placement pages (Saturn in Gemini) are pre-built on the same content model, which is what turns the grimoire into a programmatic SEO footprint rather than just a reference library.

### Subscription model

Billing runs on Stripe under a freemium structure. Free includes the universal astrology features, the full grimoire, and no ads; Pro adds personalised features at £8.49 a month. The subscription lifecycle is entirely webhook-driven, Stripe events write straight to the database, so there's no polling loop and no manual state to reconcile.

## Challenges

### Push notifications across iOS Safari and native

Getting push notifications working reliably across both iOS Safari (through the PWA) and the native Capacitor build meant handling service worker registration timing and permission flows separately for each. Firebase Cloud Messaging does the actual delivery, but the permission prompt itself had to be built from scratch, since the default ask-immediately pattern is exactly the kind of prompt users dismiss on reflex.

### Widgets with no access to app state

The native widgets (Cosmic Dashboard, Moon Tracker, Daily Card) run in an environment that's cut off from the main app's state entirely. Each one makes its own lightweight API call and renders independently.

### Keeping 2,000+ articles navigable

At grimoire scale, structured metadata and cross-references stop being optional. Every article carries tags for zodiac sign, planet, element, and topic, which is what makes faceted filtering across the whole grimoire possible, but maintaining that tagging at 2,000+ articles needed a custom admin interface.

## Outcome

Lunary is incorporated as a Delaware C-Corp via Stripe Atlas, with Mercury for banking. It has active users on both web and mobile through Capacitor, and the grimoire drives significant organic search traffic. The MCP server, 60+ tools for AI-assisted content management and analytics, now powers the automated content pipeline that runs through Orbit.
