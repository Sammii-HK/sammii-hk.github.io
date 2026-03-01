---
title: "How Lunary Went From 100 to 12,300 Google Impressions/Day in 3 Months"
description: Programmatic SEO at scale. 2,000+ grimoire articles, every horoscope page indexed through 2030, and an automated content pipeline. Here's what actually drove the 123x growth.
date: 2026-03-11
tags: [seo, indie-hacking, content-marketing, nextjs]
draft: false
---

In November 2025, Lunary had about 100 organic impressions per day on Google. By February 2026, that number was 12,300. 123x growth, no paid links, no SEO agency.

Here's exactly what drove it.

## The baseline

When I started tracking seriously in November, Lunary had:
- A handful of indexed pages
- No structured content strategy
- Average position around page 2-3 for most queries
- Almost no impressions for anything other than brand queries

The product itself was solid: real astronomical calculations, birth charts, transit tracking, a tarot system. But Google didn't know it existed in any meaningful way.

## What I built

### 1. The grimoire: 2,000+ articles on astrology content

The biggest driver wasn't a technical trick. It was content volume with genuine quality.

I built a content pipeline that generates articles on astrology, tarot, crystals, spells, and divination. The key constraint: these articles are written to be *useful*, not just to rank. Real card meanings. Actual crystal properties. Proper ritual guides.

The distribution covers astrology, tarot, crystals, spells, numerology, divination, and general esoteric content. Each article is properly structured with clear headings, internal links to related grimoire entries, and links to Lunary features where relevant.

The content is generated with Claude, reviewed for accuracy (the astronomical and esoteric facts need to be right), then published. The pipeline handles the mechanics; I handle the quality bar.

### 2. Horoscope pages indexed through 2030

Lunary generates monthly and yearly horoscopes for every zodiac sign, through the end of 2030. That's 12 months x 12 signs x 5 years = 720 horoscope pages, all individually indexed, all with real astrological content.

Search volume exists for queries like "Pisces horoscope March 2026" and "Scorpio horoscope 2027." Getting indexed early with genuinely useful content means Google starts testing Lunary in those positions before the competition catches on.

### 3. Programmatic SEO structure

The grimoire isn't a blog. It's a structured reference library. Every entry has:
- A canonical URL that maps to the concept (`/grimoire/crystals/amethyst`)
- Proper schema markup (Article schema, breadcrumbs)
- Internal links to related entries and relevant Lunary features
- Content depth that matches search intent

Structure matters because Google's crawl budget is finite. A well-organised site with clear URL patterns and proper internal linking gets crawled more efficiently than a pile of posts.

### 4. Technical fundamentals that didn't block indexing

Nothing exotic:
- Server-rendered pages (Next.js App Router, no client-side rendering blocking crawlers)
- Fast Core Web Vitals
- Clean sitemap with proper `lastModified` dates
- No duplicate content (each grimoire entry has a single canonical URL)

Most SEO problems I see in indie products are technical blockers, not content problems. Fixing them first means content work actually pays off.

## The growth pattern

The growth didn't go linear. It went in steps.

**Months 1-2:** Slow. Google indexes new content cautiously. This is normal: new content from a relatively new domain builds trust slowly. Impressions barely move.

**Month 3:** Acceleration. Once Google starts testing pages in new positions, impressions jump before clicks follow. High impressions with low CTR looks alarming but it's actually the signal it's working. Google is expanding the site's footprint.

**Ongoing:** Average position improved from ~17 to ~8.9. Most pages are on the first page but not yet in the top 3. The next step is earning the top positions on high-intent queries.

## What didn't work

- **Backlink outreach:** Too slow, too manual. Not worth the time for a solo product at this stage.
- **Generic listicles:** "Top 10 crystals for beginners" style content performed worse than specific, deep entries on individual topics.
- **Thin content at high volume:** Articles under 500 words got indexed but didn't earn positions. Depth matters more than count.

## The honest reality of programmatic SEO

Building 2,000+ articles sounds like gaming Google. It's not, if the content is actually good.

Google is very good at distinguishing useful content from keyword-stuffed filler. The grimoire articles rank because they answer real questions, not because there are a lot of them. Volume amplifies quality. It doesn't substitute for it.

The investment: engineering time to build the pipeline, AI API costs for generation, ongoing review. The payoff: compounding organic traffic that doesn't require ongoing spend.

At 12,300 impressions/day and a 3-4% average CTR, that's roughly 400 organic visits per day. For a 229 MAU product, that's meaningful top-of-funnel that compounds every month the content stays indexed.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
