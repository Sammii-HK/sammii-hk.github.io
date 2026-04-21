---
title: "A self-hosted feature flag service with Wilson confidence intervals"
description: >-
  LaunchDarkly charges per flag and per seat. Flip is a self-hosted alternative
  with a real statistical significance engine, deterministic MurmurHash3
  assignment, and a sub-2 KB SDK. This is what is inside it.
date: '2026-05-06'
tags:
  - typescript
  - statistics
  - experiments
  - feature-flags
draft: false
---
Feature flags and A/B testing are table stakes. The hosted services charge per seat, per flag evaluation, per environment, per month. For a solo product with a handful of active experiments, the bill adds up to a line item that should not exist. I built Flip as a self-hosted replacement because I wanted three things: a drop-in SDK, a clean dashboard, and a real statistical significance engine that does more than show me which variant got more clicks.

This is how the important bits work.

---

## Deterministic variant assignment

Assigning a user to a variant needs three properties. The same user must always get the same variant (consistency across page loads). The assignment should not require any round trip (no server call, no cookie write). Variants should distribute evenly by weight even on small samples.

MurmurHash3 handles all three. It is a non-cryptographic hash function designed for lookup keys: fast, well-distributed, and deterministic. The 32-bit version is thirty lines of code and produces a uniform integer from any string input.

```typescript
export function murmurhash3(key: string, seed: number = 0): number {
  let h1 = seed >>> 0;
  const len = key.length;
  const nblocks = len >> 2;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  for (let i = 0; i < nblocks; i++) {
    let k1 =
      (key.charCodeAt(i * 4) & 0xff) |
      ((key.charCodeAt(i * 4 + 1) & 0xff) << 8) |
      ((key.charCodeAt(i * 4 + 2) & 0xff) << 16) |
      ((key.charCodeAt(i * 4 + 3) & 0xff) << 24);

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  // tail handling and final mix ...
  return h1 >>> 0;
}
```

The constants `0xcc9e2d51` and `0x1b873593` are the MurmurHash3 mixing multipliers from Austin Appleby's original implementation. They are not magic numbers I made up: they were chosen because they produce good avalanche behaviour, which means flipping a single input bit flips about half the output bits. That property is what gives you even distribution.

`Math.imul` matters. JavaScript numbers are 64-bit floats, so naive multiplication of two 32-bit integers can exceed 2^53 and lose precision. `Math.imul` performs the multiplication modulo 2^32 with correct sign handling, which is exactly what MurmurHash needs.

Assignment composes the visitor ID and experiment key into the hash input, so the same visitor gets a different variant in each experiment but always the same variant in a single experiment:

```typescript
export function assignVariant(
  visitorId: string,
  experimentKey: string,
  variants: { key: string; weight: number }[]
): string {
  const hash = murmurhash3(`${visitorId}:${experimentKey}`) % 100;
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.weight;
    if (hash < cumulative) return v.key;
  }
  return variants[variants.length - 1].key;
}
```

Weights are percentages summing to 100. Unequal splits (like 90/10 for a gradual rollout) work out of the box. No server call, no cookie, no state. Give the SDK a visitor ID from your own session and it computes the same answer every time.

## Statistical significance: two-proportion z-test

The second thing Flip does beyond most DIY A/B stacks is compute significance properly. Showing "variant A got 12% conversion, variant B got 14%" is a presentation failure, not a statistical one: without a p-value, the reader has no way to know whether the difference is signal or noise.

A two-proportion z-test compares two conversion rates and returns the probability the observed difference could have happened by chance:

```typescript
function zTest(
  conversionsA: number, exposuresA: number,
  conversionsB: number, exposuresB: number
): { zScore: number; pValue: number; confidence: number } {
  const pA = exposuresA > 0 ? conversionsA / exposuresA : 0;
  const pB = exposuresB > 0 ? conversionsB / exposuresB : 0;
  const pPooled = (conversionsA + conversionsB) / (exposuresA + exposuresB);

  const se = Math.sqrt(
    pPooled * (1 - pPooled) * (1 / exposuresA + 1 / exposuresB)
  );

  const zScore = (pB - pA) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)));
  const confidence = (1 - pValue) * 100;

  return { zScore, pValue, confidence };
}
```

The pooled proportion `pPooled` is used in the standard error because under the null hypothesis the two variants share a single true conversion rate. Using separate proportions in the SE biases the test. This is the textbook move, and it matters: skipping it is one of the most common DIY A/B bugs.

`pValue` is two-tailed because you do not know in advance which variant will win. The `(1 - pValue) * 100` conversion gives confidence as a percentage, so "significant" is defined as `confidence >= 95`, the standard 5% false-positive rate.

`normalCdf` is the Abramowitz and Stegun polynomial approximation to the standard normal cumulative distribution function. It has seven constants and maximum error of about 7.5 × 10⁻⁸, which is more than good enough for A/B results:

```typescript
function normalCdf(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return 0.5 * (1.0 + sign * y);
}
```

No dependency on a stats library. Thirty lines of code give you a z-test that matches SciPy to six decimal places.

## Wilson confidence intervals

A p-value tells you whether there is a difference. A confidence interval tells you how big the difference might actually be, which is what you want to know when deciding whether to ship.

The naive confidence interval for a proportion uses the normal approximation: `p ± z * sqrt(p(1-p)/n)`. This breaks badly when `p` is near 0 or 1, or when `n` is small, because the interval can go below 0 or above 1. Those bounds are nonsensical: a conversion rate cannot be negative.

The Wilson interval is the fix. It is derived from inverting the z-test and solving for the interval endpoints directly:

```typescript
function wilsonInterval(
  conversions: number,
  exposures: number,
  z: number = 1.96
): [number, number] {
  if (exposures === 0) return [0, 0];
  const p = conversions / exposures;
  const n = exposures;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);

  return [
    Math.max(0, (centre - margin) / denominator),
    Math.min(1, (centre + margin) / denominator),
  ];
}
```

`z = 1.96` is the 95% confidence value. The `centre` and `denominator` terms come from the algebra of inverting the z-test. Because the calculation is a rearrangement rather than an approximation, the Wilson interval always sits inside [0, 1] and remains accurate at small `n`.

The dashboard shows Wilson intervals as bars on each variant's conversion rate. A variant with 500 exposures and 50 conversions shows a 10% rate with a visibly wide bar. A variant with 50,000 exposures and 5,000 conversions shows a 10% rate with a bar so narrow you can only just see it. The bar is how "how confident am I in this number?" is communicated without a single line of text.

## When to call it

The significance check is applied in `computeStats`:

```typescript
significant: confidence >= 95,
```

A winner is then the first significant variant whose lift is positive:

```typescript
const winner = computed.find((v) => v.significant && (v.lift ?? 0) > 0);
```

This avoids two common traps. First, declaring a loser as a winner (significant but lift is negative). Second, letting noise promote a marginal variant before the sample is large enough for the test to have real power. The 95% threshold is chosen deliberately; at the standard 5% alpha and typical sample sizes, roughly one in twenty A/A tests will show false significance. If you lower the threshold you will ship winners faster and also ship losers more often.

Wilson intervals and z-tests assume independent trials and fixed sample sizes. They are not sequential-testing-aware. If you peek at an experiment every day and stop as soon as it hits significance, your effective false-positive rate is much higher than 5%. Flip's solution is simple: do not do that. Set a minimum sample size per variant before the test is evaluated, and commit to running for a fixed window. Sequential-testing frameworks (like mSPRT or Bayesian approaches) solve this more elegantly, but add complexity that a personal-project A/B tool does not need.

## The SDK is basically nothing

```typescript
// sdk/flip.ts, roughly
export function decide(visitorId: string, experimentKey: string) {
  const experiment = cache[experimentKey];
  if (!experiment) return { variant: null };
  const variant = assignVariant(visitorId, experimentKey, experiment.variants);
  return { variant };
}
```

The SDK's job is three things: fetch flag and experiment configuration from the dashboard API, cache it, and call `assignVariant` locally. All the logic is in the hashing function, which is shared between dashboard and SDK so assignments match exactly.

The whole SDK compresses to under 2 KB because the hashing function is the only non-trivial part and that function is already small. No websockets, no streaming, no background sync: experiments update when the SDK refetches (every 60 seconds by default), which is plenty fast for decisions that happen at page-view frequency.

---

## What it did not need

A ClickHouse or warehouse integration. Flip uses Postgres for exposure and conversion events. Events are tiny (experiment id, variant, visitor id, timestamp), and the hot queries are aggregations grouped by variant. Postgres is perfectly adequate for a single-product traffic volume.

A dedicated UI framework. The dashboard is Next.js App Router with server components where possible and minimal client state. The charts are just numbers rendered as divs with widths computed from the Wilson intervals. Nothing fancy.

An auth provider. API keys are UUIDs stored hashed. Requests that carry a valid key are trusted for write access; public decide calls do not need auth.

Flip is three hundred lines of meaningful code and a Postgres schema. LaunchDarkly charges a few hundred pounds a month for a feature flag service. I get the one I need for the cost of the Vercel deployment, which is zero because it fits on the free tier. If your product does not have a data scientist reviewing experiments daily, a service like Flip is probably what you actually want.
