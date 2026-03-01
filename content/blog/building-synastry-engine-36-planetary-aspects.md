---
title: "How I Built a Synastry Engine That Calculates 36 Planetary Aspects in Real Time"
description: Synastry is the astrology of relationships. Computing it properly means calculating aspects between every planet in two birth charts simultaneously. Here's the maths and the implementation.
date: 2026-03-18
tags: [astronomy, javascript, react, indie-hacking]
draft: false
---

Synastry is the branch of astrology that analyses relationships by comparing two birth charts. You take every planet in one chart and check how it relates to every planet in the other.

Done properly, that's 36 planetary aspects computed simultaneously, in real time, using observatory-grade positional data.

Here's how I built it for Lunary.

## What synastry actually computes

A birth chart has around 10 primary celestial bodies: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto. (Lunary also tracks Chiron, the North Node, and the Part of Fortune, but let's start with 10.)

To compute synastry between two charts, you compare each body in chart A against each body in chart B. 10 x 10 = 100 possible pairings. You filter those down to the ones that form meaningful angular relationships (aspects), which typically gives you around 30-40 active aspects per pair of charts.

For each pair, you calculate:
1. The angular separation between the two bodies (their positions in ecliptic longitude)
2. Whether that separation falls within the orb of a recognised aspect
3. The aspect type (conjunction, opposition, trine, square, sextile, and so on)
4. How exact the aspect is (tighter aspects are considered stronger)
5. Whether the aspect is applying or separating (approaching exact vs moving away)

## Getting the planetary positions

Everything starts with accurate positions. Lunary uses [astronomy-engine](https://github.com/cosinekitty/astronomy), which implements VSOP87 planetary theory combined with NOVAS C 3.1 methods from the US Naval Observatory. Arcminute precision.

For a given birth time and location, getting ecliptic longitude looks like this:

```typescript
import * as Astronomy from 'astronomy-engine';

function getEclipticLongitude(body: Astronomy.Body, date: Date): number {
  const time = Astronomy.MakeTime(date);
  const equatorial = Astronomy.GeoVector(body, time, false);
  const ecliptic = Astronomy.Ecliptic(equatorial);
  return ((ecliptic.elon % 360) + 360) % 360; // normalise to 0-360
}
```

Running this for all 10 bodies gives you an array of positions for each chart.

## Computing the aspects

With two sets of positions, the aspect calculation loops through every pair:

```typescript
const ASPECTS = [
  { name: 'conjunction',  angle: 0,   orb: 8 },
  { name: 'opposition',   angle: 180, orb: 8 },
  { name: 'trine',        angle: 120, orb: 6 },
  { name: 'square',       angle: 90,  orb: 6 },
  { name: 'sextile',      angle: 60,  orb: 4 },
  { name: 'quincunx',     angle: 150, orb: 3 },
  { name: 'semi-sextile', angle: 30,  orb: 2 },
];

function computeSynastryAspects(
  chartA: PlanetPosition[],
  chartB: PlanetPosition[],
): SynastryAspect[] {
  const aspects: SynastryAspect[] = [];

  for (const bodyA of chartA) {
    for (const bodyB of chartB) {
      const separation = angularSeparation(bodyA.longitude, bodyB.longitude);

      for (const aspect of ASPECTS) {
        const deviation = Math.abs(separation - aspect.angle);
        const normalised = Math.min(deviation, 360 - deviation);

        if (normalised <= aspect.orb) {
          aspects.push({
            bodyA: bodyA.name,
            bodyB: bodyB.name,
            type: aspect.name,
            exactness: 1 - normalised / aspect.orb, // 1.0 = exact, 0.0 = at orb limit
            applying: isApplying(bodyA, bodyB, aspect.angle),
          });
        }
      }
    }
  }

  return aspects;
}

function angularSeparation(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}
```

The `exactness` score (0 to 1) becomes the weighting factor. A Sun conjunct Venus with exactness 0.95 is treated very differently from one at 0.2.

## Determining applying vs separating

An aspect is "applying" when the faster-moving body is moving toward the exact angle, and "separating" when it's moving away. In traditional astrology, applying aspects are considered stronger.

```typescript
function isApplying(
  bodyA: PlanetPosition,
  bodyB: PlanetPosition,
  targetAngle: number,
): boolean {
  // The faster body is the one with higher daily motion
  const [faster, slower] = bodyA.dailyMotion > bodyB.dailyMotion
    ? [bodyA, bodyB]
    : [bodyB, bodyA];

  const currentSep = angularSeparation(faster.longitude, slower.longitude);
  const nextSep = angularSeparation(
    faster.longitude + faster.dailyMotion,
    slower.longitude + slower.dailyMotion,
  );

  return Math.abs(nextSep - targetAngle) < Math.abs(currentSep - targetAngle);
}
```

## Scoring and surfacing results

Thirty-six aspects is too many for a user to parse at once. Lunary scores each aspect by a combination of planet significance, exactness, and aspect strength:

```typescript
const PLANET_WEIGHT: Record<string, number> = {
  Sun: 10, Moon: 10, Venus: 8, Mars: 7,
  Mercury: 6, Jupiter: 5, Saturn: 5,
  Uranus: 3, Neptune: 3, Pluto: 3,
};

const ASPECT_WEIGHT: Record<string, number> = {
  conjunction: 10, opposition: 9, trine: 8,
  square: 7, sextile: 6, quincunx: 4,
  'semi-sextile': 2,
};

function scoreAspect(aspect: SynastryAspect): number {
  const planetScore = (PLANET_WEIGHT[aspect.bodyA] + PLANET_WEIGHT[aspect.bodyB]) / 2;
  const aspectScore = ASPECT_WEIGHT[aspect.type];
  return planetScore * aspectScore * aspect.exactness;
}
```

The top 10-12 scored aspects are shown prominently. The full 36 are available on request.

## Performance

Computing 36 aspects for two birth charts takes under 2ms in V8. The astronomical position calculations (the expensive part) take around 10ms for 10 bodies. Total round-trip for a full synastry computation is well under 100ms including network.

Positions are cached per birth data so that comparing the same chart against multiple others doesn't repeat the planetary calculation.

## What the user sees

The Circle feature in Lunary presents synastry as a grid: chart A's planets across the top, chart B's planets down the side, aspects shown at each intersection. The strongest aspects get a summary interpretation based on the planet combination and aspect type.

It's the same analysis a professional astrologer uses, built on the same precision data, accessible without needing to understand the underlying maths.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
