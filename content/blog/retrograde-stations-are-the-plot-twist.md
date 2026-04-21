---
title: "Retrograde stations are the plot twist: rewriting the transit engine three times"
description: >-
  The naive version of a transit engine is a week's work. The correct version
  is three rewrites, a sub-day interpolation, and a cache TTL that drops to 5%
  near a station. Here is what each rewrite got wrong.
date: '2026-05-18'
tags:
  - typescript
  - astronomy
  - lunary
  - astrology
draft: false
---
A transit is a moment when a moving planet crosses a meaningful point in your natal chart. You were born with Venus at 12° Taurus; today transiting Mars is at 12° Taurus; that is a Mars-Venus conjunction, and for the next few days your Mars transit is in aspect to your natal Venus.

A transit engine has to answer three questions for every planet in the sky, every day:

1. Where is it right now?
2. Is it forming an aspect to something in the natal chart?
3. Is that aspect tightening, exact, or loosening?

I rewrote the Lunary transit engine three times before I got this right. Each rewrite fixed what the previous version missed. The third version is what runs in production. This is what each previous one got wrong.

---

## What the first version got wrong: severity tagging

The first transit engine was happy. It computed ecliptic longitudes using astronomy-engine, calculated angular differences between transiting and natal positions, and surfaced aspects when the angle was close to 0°, 60°, 90°, 120°, or 180°. It looked plausible. It was also constantly firing transits too early and expiring them too late.

The bug was the orb, the tolerance around an exact aspect within which the aspect is considered active. The first version used a single orb value for all aspects. A conjunction at 5° was treated the same as a square at 5°. This is wrong in two directions.

Conjunctions and oppositions are the most forceful aspects. They deserve a wider orb because their influence builds and decays gradually. Squares and trines are more acute and should use a narrower orb. Minor aspects (sextiles, quincunxes) narrower still.

The corrected version uses per-aspect orbs:

```typescript
// Major aspects: 8 degree orb
if (Math.abs(diff - 0)   <= 8) return { aspectType: 'conjunction', intensity: 10 - Math.abs(diff - 0)   };
if (Math.abs(diff - 180) <= 8) return { aspectType: 'opposition',  intensity: 10 - Math.abs(diff - 180) };

// Minor majors: 6 degree orb
if (Math.abs(diff - 120) <= 6) return { aspectType: 'trine',  intensity: 8 - Math.abs(diff - 120) };
if (Math.abs(diff -  90) <= 6) return { aspectType: 'square', intensity: 8 - Math.abs(diff -  90) };
```

The `intensity` score derives from the residual: an aspect exact to the degree has maximum intensity; one at the edge of orb has minimum. That number is what drives the UI's visual weight for the aspect (thicker line, bolder chip, higher up in the "notable today" list).

Getting per-aspect orbs right means the engine no longer surfaces "your Mars squares your Venus" for a whole fortnight. It surfaces it for the three or four days the square is actually tight. Which is the only window where the interpretation is meaningful.

## What the second version got wrong: retrograde stations

Orbs correct. Timing feels right. But outer planet transits, Saturn on your Moon, Jupiter on your Sun, were still mispriced. They would fire, fade, come back, fade again. Users were confused. So was I.

The reason is retrograde motion. When a planet retrogrades, its ecliptic longitude decreases day over day until the motion reverses and it goes forward again. The moment motion reverses is a **station**. Stations are the most intense point of a retrograde cycle.

A planet stationing retrograde on your natal Venus is not a minor brush. It is the planet appearing to **stop** on your Venus, then crawl backwards over it, then eventually turn around and cross it a third time, all within a period of months. Three passes of the same aspect, not one. Astrologers call this a triple hit. The middle pass, around the station, is the loudest.

The second version of the engine treated every day's longitude independently. It had no concept of a station, no understanding of triple hits, no sense that the same aspect could be active now, inactive for a month, then active again.

The third version detects stations directly. `findRetrogradeBounds` scans ahead day by day until the daily motion flips from negative to positive, then refines by linear interpolation to sub-day precision:

```typescript
function findRetrogradeBounds(planet: string, date: Date) {
  function dailyMotion(d: Date): number {
    const lon1 = getLongitude(d);
    const lon2 = getLongitude(new Date(d.getTime() + msPerDay));
    let diff = lon2 - lon1;
    if (diff >  180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  }

  // Scan forward to find station direct (motion goes from negative to positive)
  let endDate: Date | null = null;
  for (let i = 1; i <= 120; i++) {
    const futureDate = new Date(date.getTime() + i * msPerDay);
    const motion = dailyMotion(futureDate);
    if (motion > 0) {
      const prevDate = new Date(futureDate.getTime() - msPerDay);
      const prevMotion = dailyMotion(prevDate);
      const fraction = Math.abs(prevMotion) / (Math.abs(prevMotion) + Math.abs(motion));
      endDate = new Date(prevDate.getTime() + fraction * msPerDay);
      break;
    }
  }

  // ... similar backward scan for station retrograde
}
```

Two things about this that matter.

The linear interpolation is not optional. Motion at day N is -0.3° and at day N+1 is +0.4°. The zero crossing is not at either endpoint. It is fractionally between them, at `0.3 / 0.7` of the way through day N. That fraction converts to a sub-day timestamp for the station, which is accurate to within a few hours and which is what you need for the UI to show "Mercury stations direct at 14:47 on 7 June" instead of "Mercury stations direct today."

The 360° wrap-around is not optional either. If a planet crosses from 359° to 1° between two days, the naive `lon2 - lon1` is -358°, not +2°. Wrapping to the shorter signed arc catches this. Without it, you would periodically see a planet "retrograde" for one day every time it crossed the 0° Aries boundary, which is nonsense but would tank the whole station detector.

The 120-day forward scan is generous enough to catch outer planet retrogrades (Saturn retrogrades for about 140 days but the station is always within 120 days of any date inside the retrograde window). The 60-day backward scan catches the station retrograde event for any point mid-retrograde.

## What the third version got right: caching that knows about stations

The transit engine is called many times per day per user: once on page load, once when the dashboard refreshes, once when a widget syncs. Recomputing planetary longitudes every call is wasteful, so there is a cache. The trick is knowing when to invalidate it.

The first caching attempt used a fixed TTL per planet: a few hours for Mercury, most of a day for Saturn. This broke at station boundaries. A cache entry with a 6-hour TTL for Mercury was fine most of the time and disastrous the morning Mercury stationed direct, because the cached `retrograde: true` would persist for hours after Mercury had started moving forward again.

The cache now has an adaptive TTL that knows how close the next station is:

```typescript
// Near retrograde station, shorten TTL so the flag flips promptly
if (retrogradeRemainingHours !== undefined && retrogradeRemainingHours >= 0) {
  if (retrogradeRemainingHours <= 1)  return Math.floor(baseTTL * 0.05);
  if (retrogradeRemainingHours <= 4)  return Math.floor(baseTTL * 0.1);
  if (retrogradeRemainingHours <= 12) return Math.floor(baseTTL * 0.25);
}
```

At 12 hours from a station, the TTL drops to a quarter. At 4 hours, a tenth. At 1 hour, 5%, which is about three minutes for Mercury. The cache flips the retrograde flag essentially as soon as the station occurs, without having to wake up on a cron or trigger a database invalidation. The same pattern applies to sign boundaries, since a planet crossing from one sign to the next is a similar discontinuity.

This is the move I am most pleased with, because it is the one that makes the astronomically correct engine also operationally cheap. The cache runs cold only near the events that matter. The rest of the time, every page hit reads from a warm, stale-but-correct cache.

## The bit I wish I had known first

Retrograde motion is an illusion. The planet is not actually stopping or reversing; it is moving at its normal speed along its orbit. What changes is the angle between it and Earth, because Earth is also moving and we see the planet from a moving platform. The apparent ecliptic longitude goes up, down, up again, because of the geometry of the two orbits.

The reason this matters for a transit engine is that stations are not "events" in the planet's physics. They are events in the observer's frame. If you were standing on the Sun, Mercury would never retrograde. From Earth, it does, four times a year, for about three weeks each time.

Astrology, for all the stick it gets, has been describing observer-frame events with a consistent vocabulary for two thousand years. The software has to respect that vocabulary because the users expect it. A Mercury retrograde that the engine fails to flag, or worse, flags a day late, is not a bug users forgive. It is the whole reason they are looking at the chart.

Three rewrites later, I think the engine is right. I know that because users stopped complaining about transits being off. The only feedback I get on it now is about interpretation, which is the level at which astrology is supposed to be debated, not the mechanics.

Research first. Iterate until right. The transit engine is what that phrase points at in practice.
