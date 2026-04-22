---
title: "Synastry at 600 pairs (and why the first 245 were thin)"
description: >-
  Synastry compares two birth charts, planet by planet, aspect by aspect. The
  first version of Lunary's engine did this with 5 aspect types across 7
  planets. The current version does 6 across 10 points. Here is what the
  difference actually means and why the expansion was not optional.
date: '2026-07-01'
tags:
  - typescript
  - astronomy
  - lunary
  - astrology
draft: false
---
Synastry is a reading of two birth charts side by side. You put person A's chart next to person B's chart and you ask, for every planet in A, how does it relate to every planet in B? If A's Venus sits at 12° Taurus and B's Mars sits at 14° Taurus, that is a Venus-Mars conjunction across the two charts, and in astrology that aspect has a specific meaning about romantic and physical attraction. The engine's job is to find every one of those cross-chart aspects and hand back a list, sorted by how tight they are.

Lunary shipped synastry with five aspect types across seven planets. The second version runs six across ten. The difference is not decorative. It is the difference between a report that reads as thin and a report that reads as correct. Here is what each version did, and what users saw that forced the rewrite.

---

## What the first version looked like

The first synastry engine in Lunary is still in the codebase at `utils/astrology/synastry.ts`. It sets up the aspect table like this:

```typescript
const ASPECT_DEFINITIONS = {
  conjunction: { angle: 0,   orb: 8, symbol: '☌', nature: 'neutral'     },
  opposition:  { angle: 180, orb: 8, symbol: '☍', nature: 'challenging' },
  trine:       { angle: 120, orb: 8, symbol: '△', nature: 'harmonious'  },
  square:      { angle: 90,  orb: 8, symbol: '□', nature: 'challenging' },
  sextile:     { angle: 60,  orb: 6, symbol: '⚹', nature: 'harmonious'  },
};
```

Five aspects. Uniform 8° orbs on four of them, 6° on the sextile. The planets it considered were the personal planets plus the two social ones:

```typescript
const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const SOCIAL_PLANETS   = ['Jupiter', 'Saturn'];
```

The cross-chart loop filtered each input chart down to those seven bodies and checked every pair:

```typescript
for (const planetA of relevantPlanetsA) {
  for (const planetB of relevantPlanetsB) {
    const aspectResult = findAspect(
      planetA.eclipticLongitude,
      planetB.eclipticLongitude,
    );
    if (aspectResult) {
      // ... push aspect, count for scoring
    }
  }
}
```

That gives you 7 × 7 = 49 cross-chart pairs to check, times 5 aspect types to match each pair against, for a theoretical upper bound of 245 potential aspects before orb filtering. In practice most pairs match zero or one aspect, so a typical synastry came back with somewhere between eight and twenty aspects. Which sounds fine until you looked at a real one.

## What users saw

A user with, for instance, a Moon-Venus trine, a Sun-Mars sextile, a Mercury-Mercury conjunction, and a Venus-Jupiter trine with their partner would get four aspects back. Four. For two charts that any astrologer would look at and say "this is a rich synastry, there is a lot going on here." The report would read as flat because the engine was missing entire categories of connection that a human reading would have caught.

The gaps were not subtle.

No Ascendant or Descendant. These are the angles of the chart, not planets, but in synastry they are at least as important as the personal planets. A person's Sun on your Ascendant is one of the classic "I notice you the second you walk in" aspects. A person's Venus on your Descendant is the textbook "this person is exactly my type" signature. The first version of the engine could not see either because it only matched bodies in its personal-plus-social list.

No lunar nodes. The north node and south node are calculated points, not planets, but in synastry astrology they read the karmic layer: past-life sense of familiarity, where you are pulled together, where you are teaching each other something you both need to learn. A chart with a tight Sun-north-node conjunction across the two people is the canonical "we are meant to know each other" aspect. The first engine had no nodes.

No minor aspects. The quincunx (150°) and its cousins describe the adjustment dynamics in a relationship: the small, persistent "you do this thing and it drives me slightly mad, but I also cannot imagine you not doing it" patterns. A relationship without any quincunxes in the synastry reads as frictionless on paper but most real relationships have a few.

The feedback was not metric-driven. It was "this does not feel like my relationship." When a feature's output is supposed to describe something the user has direct, daily evidence of, any gap between the report and the lived experience is immediately obvious. Four aspects for a relationship that feels like twenty is worse than no synastry feature at all, because it is actively miscommunicating.

## What the second version does

The second synastry engine lives at `src/lib/astrology/synastry.ts`. It expands in both axes.

Six aspect types instead of five:

| Aspect      | Angle | Orb  | Harmonious | Weight |
|-------------|-------|------|------------|--------|
| Conjunction | 0°    | 10°  | yes        | 10     |
| Opposition  | 180°  | 10°  | no         | 8      |
| Trine       | 120°  | 8°   | yes        | 8      |
| Square      | 90°   | 8°   | no         | 6      |
| Sextile     | 60°   | 6°   | yes        | 4      |
| Quincunx    | 150°  | 3°   | no         | 2      |

The per-aspect orbs are the important part. Conjunctions and oppositions get 10° because they are the most forceful aspects and their influence builds and decays gradually. Trines and squares get 8°. Sextile gets 6°. Quincunx gets 3°, because the aspect itself is more specific and a loose quincunx is just noise.

Ten points instead of seven:

```typescript
const SYNASTRY_PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn',
  'Ascendant', 'Descendant', 'North Node',
];
```

The new names in there are the ones that were missing from the first pass. Ascendant and Descendant bring the angular connections. North Node brings the karmic layer. That is 10 × 10 = 100 cross-chart pairs, against 6 aspect types, for a theoretical upper bound of 600 potential aspects before orb filtering. In practice a typical synastry now comes back with somewhere between twenty and forty, which is closer to what the charts actually contain.

The loop itself is structurally the same, just with an explicit inner loop over aspect types and a weighting calculation per match:

```typescript
for (const p1 of person1Planets) {
  for (const p2 of person2Planets) {
    for (const aspectDef of ASPECT_DEFINITIONS) {
      let diff = Math.abs(p1.eclipticLongitude - p2.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;

      const orbDiff = Math.abs(diff - aspectDef.angle);
      if (orbDiff <= aspectDef.orb) {
        const planetWeight =
          ((PLANET_WEIGHTS[p1.body] || 1) + (PLANET_WEIGHTS[p2.body] || 1)) / 2;
        const weight = aspectDef.weight * planetWeight;
        aspects.push({ /* ... */ });
      }
    }
  }
}
```

The 360° wrap on line 4 is doing real work. The ecliptic is circular; two planets at 359° and 2° are 3° apart, not 357°. Without that fold, every synastry would periodically miss aspects that span the 0° Aries boundary and would score some charts as catastrophically incompatible for no reason other than Aries being where the coordinate system wraps.

## Why per-aspect orbs matter here too

The first version used uniform 8° orbs on the majors and 6° on the sextile. The second uses the values in that table above. The upgrade matters because synastry aspects with different angles have genuinely different tolerances.

A conjunction is a fusion of energies. Planets within 10° of each other in the same sign, across two charts, are doing something: the looser the orb, the more diffuse, but there is still a there there at 9°. A square is more acute: 8° is generous already, and a 10° square would read as weak tension that the relationship barely notices. A quincunx is the most specific of the lot: 3° is the right number because a 5° quincunx is just arithmetic, not an aspect anyone is experiencing.

Using one orb for all aspects flattens those distinctions. The engine either over-reports or under-reports depending on where you set the single value. Per-aspect orbs fix both ends of that.

## Weighting: why planet matters, not just aspect

The other thing the second version added is weighting per planet. Not all planets carry equal weight in synastry. A Sun-Moon conjunction is a much bigger deal than a Saturn-Saturn conjunction. Astrology has been ranking this for two thousand years and the software should do the same:

```typescript
const PLANET_WEIGHTS: Record<string, number> = {
  Sun: 10, Moon: 10, Venus: 9, Mars: 8, Mercury: 6,
  Ascendant: 8, Descendant: 7,
  Jupiter: 5, Saturn: 5,
  'North Node': 4, Chiron: 3,
  Uranus: 2, Neptune: 2, Pluto: 2,
};
```

Personal planets heavy, angles high, nodes and Chiron middling, outer planets low. The weighting feeds into a per-aspect score that is the average of the two planets' weights multiplied by the aspect type's weight. That produces a number that sorts aspects by "how much this one actually matters in this reading" rather than by raw tightness.

The compatibility score at the end of the pipeline is built from the same weights: harmonious aspects add proportionally to their weight and orb tightness, challenging aspects subtract (at half the magnitude, so challenging aspects are treated as growth-producing rather than disqualifying). That score plus a coarse element and modality match gives the final 0-100 number.

## Why not go further

Six aspect types is not the theoretical maximum. Classical astrology has quintiles (72°), biquintiles (144°), septiles (≈51.4°), semi-squares (45°), sesquiquadrates (135°), and more. The engine stops at six because the remaining aspects have weaker traditional grounding in synastry specifically. A quintile might be meaningful in a natal chart reading; across two charts, it is mostly noise. Adding them would inflate the aspect count and dilute the signal that the interesting aspects already produce.

The point count is similarly bounded. Chiron is in the `PLANET_WEIGHTS` table but not in `SYNASTRY_PLANETS`, so it does not currently show up in the cross-chart loop. Adding Chiron is plausible and would bring the wounded-healer reading into synastry; the outer planets (Uranus, Neptune, Pluto) are a harder call because they move so slowly that their synastry aspects describe generational compatibility more than personal chemistry. A tight Pluto-Pluto conjunction is true of every pair of people born within a year or two of each other. Including it would drown the personal aspects in generational noise.

Those are judgement calls, and the honest answer is that 600 theoretical pairs is where Lunary has landed for now. If users tell me the Chiron layer is missing, Chiron goes into `SYNASTRY_PLANETS` next.

## The lesson

Five aspect types across seven planets looked right on paper. It generated valid output. It did not crash. It passed the basic sanity check of producing a compatibility score between 0 and 100. And it was thin. Users with genuinely strong synastry looked at their report and saw a list of four aspects and knew, immediately, that the engine was not reading what they were living.

This is not an astrology point. It is a product point. When your feature's output is supposed to match something the user has direct, high-resolution evidence of, you cannot half-ship the feature. The user will notice. The answer is to ship the feature at the right resolution or to not ship it yet.

Six aspect types, per-aspect orbs, ten points including the angles and the north node, weighted by astrological importance, sorted by weight. That is what a synastry engine has to do to not read as thin. Two rewrites later, I think it is there. The feedback switched from "this is missing things" to "how do I interpret this?" which is the level at which astrology is supposed to be read.

Research first. Iterate until the report reads as correct.
