---
title: The maths behind how long a planet stays in your sign
description: >-
  Saturn does not spend 2.5 years in every sign. It ranges from 2.1 to 2.7 years
  depending on orbital eccentricity. I built transit duration tracking into
  Lunary and it changed how I read charts entirely.
date: '2026-03-21'
tags:
  - astrology
  - lunary
  - engineering
  - grimoire twist
draft: false
---
Most astrology content rounds the numbers. Saturn spends "about 2.5 years" in each sign. Jupiter spends "about a year." These are averages. They are also wrong for any specific transit you actually care about.

Saturn spent 2.7 years in Pisces (March 2023 to February 2026). It will spend 2.1 years in Taurus (April 2028 to June 2030). That is a six-month difference. For a planet whose transits define entire chapters of your life, six months is not a rounding error.

When I built transit duration tracking into Lunary, the real numbers surprised me. They also changed how I read charts.

---

## Orbits are not circles

The reason planets spend different amounts of time in different signs is orbital eccentricity. Planetary orbits are ellipses, not circles. A planet moves faster when it is closer to the Sun (perihelion) and slower when it is further away (aphelion). This is Kepler's second law: a planet sweeps out equal areas in equal times.

For Saturn, the difference is measurable. Its orbital eccentricity is 0.0565, which means its distance from the Sun varies by about 11% between perihelion and aphelion. When Saturn is closer to the Sun, it moves through signs faster. When it is further away, it lingers.

The zodiac is fixed against the stars. But the planet's speed through that fixed backdrop changes continuously. The result: Saturn in Pisces lasts 974 days. Saturn in Taurus lasts 778 days. Nearly 200 days difference, same planet.

---

## The actual numbers from Lunary's ephemeris

Here is what Lunary's transit engine computes for Saturn, using real ephemeris data from astronomy-engine (VSOP87):

| Sign | Total days | Years | Segments |
|------|-----------|-------|----------|
| Aquarius | 911 | 2.5 | 2 |
| Pisces | 974 | 2.7 | 2 |
| Aries | 888 | 2.4 | 2 |
| Taurus | 778 | 2.1 | 1 |
| Gemini | 773 | 2.1 | 1 |
| Cancer | 859 | 2.4 | 2 |
| Leo | 840 | 2.3 | 3 |
| Virgo | 908 | 2.5 | 2 |

The "segments" column matters. When Saturn retrogrades, it can briefly re-enter the previous sign before moving forward again. Saturn in Leo has three segments: it enters, retrogrades back, re-enters, retrogrades back again, then finally commits. The total cumulative time is 840 days across those three passes. If you only counted the first entry, you would think Saturn left Leo after a few months.

---

## How the calculation works

Lunary uses two different strategies depending on how fast the planet moves.

**Fast planets** (Moon through Mars) use a simple formula: degrees remaining in the sign divided by the planet's daily motion. The Moon moves about 13.2 degrees per day. If it is at 22 degrees of Aries, it has 8 degrees remaining, which gives roughly 14.5 hours. Mercury averages 4.1 degrees per day but varies enormously, from barely moving during a retrograde station to covering 2 degrees in a single day.

```typescript
// Fast planets: degrees to boundary ÷ daily motion
const degreeInSign = currentLongitude % 30;
const degreesRemaining = 30 - degreeInSign;
const remainingDays = degreesRemaining / dailyMotion;
```

The key detail: Lunary uses the actual observed daily motion from astronomy-engine, not the average. For the Moon, actual speed varies between 12.2 and 14.8 degrees per day, a 20% range. Using the average would put the Moon's sign change time off by hours.

**Slow planets** (Jupiter through Pluto) use pre-computed ephemeris data. A script scans forward through time at one-day resolution, recording every moment each planet changes sign. The results are stored as date segments. At runtime, Lunary looks up which segment the current date falls in and calculates remaining time from there.

```typescript
// Slow planets: lookup from pre-computed sign segments
const segments = SLOW_PLANET_SIGN_CHANGES[planet][currentSign];
const activeSegment = segments.find(
  seg => now >= seg.start && now <= seg.end
);
const remainingDays = (activeSegment.end - now) / msPerDay;
```

The pre-computation handles retrograde re-entries correctly. Saturn entering Aries, retrograding back into Pisces for four months, then re-entering Aries is stored as two separate Aries segments. The total duration sums across all segments, so users see "2.4 years total in Aries" rather than being confused when Saturn briefly disappears back into Pisces.

---

## Retrograde makes everything harder

Retrograde is when a planet appears to move backwards through the zodiac from Earth's perspective. It is an optical illusion caused by relative orbital speeds, like overtaking a car on the motorway and watching it appear to drift backwards.

For fast planets during retrograde, the simple degrees-remaining formula breaks entirely. If Mercury is retrograde at 15 degrees of Gemini, it is moving backwards, towards 14, 13, 12 degrees. Dividing remaining degrees by daily motion would give a nonsensical answer because the planet is heading the wrong way.

Lunary handles this by scanning forward with astronomy-engine to find the actual station direct date: the moment the planet stops moving backwards and resumes forward motion.

```typescript
// Scan forward to find when retrograde ends
for (let i = 1; i <= 120; i++) {
  const futureDate = new Date(date.getTime() + i * msPerDay);
  const motion = dailyMotion(futureDate);
  if (motion > 0) {
    // Retrograde ended — refine to half-day precision
    // Linear interpolation between the two days
    endDate = interpolate(prevDate, futureDate, prevMotion, motion);
    break;
  }
}
```

This gives accurate retrograde durations. Mercury retrograde lasts about three weeks, not the four days that the naive formula would calculate.

---

## Why this changed how I read charts

Before building transit duration tracking, I read transits as a list. Saturn is in Pisces. Jupiter is in Gemini. Mars is in Leo. Each item was equally present, equally weighted.

Adding duration context changes the reading fundamentally. "Saturn has been in Pisces for 22 months and has 10 months remaining" is a completely different statement from "Saturn is in Pisces." The first tells you where you are in a story. The second just names the chapter.

The badge display in Lunary shows remaining time: "10m left" for Saturn, "3d left" for Mars, "14h left" for the Moon. Seeing these together reveals the layering. The Moon changes the emotional texture every 2.3 days. Mars shifts the energy every six weeks. Saturn provides the structural backdrop for 2-3 years.

The cache system reflects this too. Saturn's position is cached for seven days because it barely moves. The Moon's position is cached for 15 minutes. Near sign boundaries, all cache TTLs drop by 75% so the transition is captured accurately. The infrastructure mirrors the astrology: fast planets need frequent attention, slow planets reward patience.

---

## Pluto is the extreme case

Pluto's orbital eccentricity is 0.2488, far more eccentric than any other planet. Its transit durations are wildly uneven. Pluto spent about 15 years in Capricorn. It will spend roughly 20 years in Aquarius. In some signs it lingers for over 30 years. In others, barely 12.

An entire generation shares a Pluto sign. The variation in duration means some generations carry that shared transformation for twice as long as others. The "Pluto in Capricorn" generation (roughly 2008-2024) had a shorter collective experience than the "Pluto in Aquarius" generation that follows.

This is not trivia. If you believe outer planet transits shape collective experience, then the duration is the intensity. A 12-year Pluto transit and a 30-year Pluto transit are not the same kind of event, even if the sign is the same.

---

## The numbers are the astrology

I have found that the more precisely I engage with the actual orbital mechanics, the more astrology makes sense, not less. Rounding Saturn to "2.5 years" obscures the fact that Saturn in Pisces is a qualitatively different experience from Saturn in Taurus, not just because of the signs, but because one lasts six months longer. Six months more pressure. Six months more consolidation. Six months more of whatever Saturn in that sign is working on in your chart.

The ancient astrologers did not have VSOP87 or astronomy-engine. But they watched the sky every night for centuries. They knew these durations intimately. The maths we compute in milliseconds, they observed over lifetimes. The precision is modern. The knowledge is ancient.

*This is a Grimoire Twist: astrology education with a Lunary engineering angle.*
