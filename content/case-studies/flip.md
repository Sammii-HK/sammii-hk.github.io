---
title: "Flip"
description: "Feature flags and A/B experiments: MurmurHash3 assignment, a small browser SDK, unique-visitor outcomes, Wilson intervals and Bonferroni-adjusted z-tests, behind management routes that need an operator token"
techStack: "Next.js, TypeScript, Prisma, PostgreSQL, Zod"
---

## The idea

Feature flags and experiments look simple from the outside: a switch, and a coin toss for which version someone sees. Underneath there are three genuinely interesting problems. A visitor has to land in the same variant every time without the server remembering them. A conversion has to be tied to the exposure that caused it. And the results page has to say something true about the numbers, which is harder than drawing two bars and calling the taller one the winner.

Flip is my self-hosted take on all three. It has boolean flags and weighted experiments per tenant, a decision API that assigns variants deterministically, a tracking API that only accepts a conversion after a recorded exposure, a browser SDK, and a results view with conversion rates, lift, Wilson intervals and Bonferroni-adjusted two-sided z-tests.

The source is on [GitHub](https://github.com/Sammii-HK/flip). The dashboard shows a sample workspace with example experiments, so you can read the results view without anyone's real data behind it. I wrote about the statistics at more length in [A self-hosted feature flag service with Wilson confidence intervals](/blog/self-hosted-feature-flags-wilson-intervals/).

## Assignment without memory

The obvious way to give someone a stable variant is to store it: pick at random on the first visit and look it up afterwards. Flip computes it instead. The same visitor and experiment always produce the same number, so the answer never needs storing:

```ts
export function assignVariant(visitorId: string, experimentKey: string,
  variants: { key: string; weight: number }[]): string {
  const hash = murmurhash3(`${visitorId}:${experimentKey}`) % 100;
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.weight;
    if (hash < cumulative) return v.key;
  }
  return variants[variants.length - 1].key;
}
```

MurmurHash3 is a fast, non-cryptographic 32-bit hash with good avalanche behaviour: change one character of the input and roughly half the output bits flip, so similar IDs scatter rather than cluster. Flip carries its own implementation, the x86 32-bit variant with the standard mixing constants, and it returns 613153351 for `"hello"` with seed 0, matching the reference.

Three details in that function do real work. The hash input includes the experiment key, so a visitor's bucket in one experiment says nothing about their bucket in another. The weights are whole percentages and the schema rejects any experiment whose weights do not total exactly 100, so the hash modulo 100 maps straight onto the cumulative ranges. And the server reads variants ordered by key, so the ranges are laid out the same way on every request.

There is a small piece of arithmetic hiding in `% 100`. A 32-bit hash has 4,294,967,296 possible values, which is 42,949,672 × 100 + 96. Buckets 0 to 95 each receive one more possible hash value than buckets 96 to 99, a bias of about one part in forty-three million. That is far below anything an experiment could detect, so a plain modulo is fine here.

## The decision endpoint

`/api/v1/decide` takes a key and answers for whichever it finds. A flag comes back as `{ type: "flag", enabled }`. An experiment that is not running returns its first variant, so a paused test falls back to the control experience. A running experiment takes the visitor ID from the request, then the `flip_vid` cookie, and only then generates a fresh UUID. It assigns a variant, records an exposure, and responds.

The order of those last two steps changed. The first version started the exposure write and responded without waiting, with a `.catch(() => {})` to swallow failures. That meant a visitor could be shown a variant whose exposure was never stored, which is exactly the record the results depend on. The exposure is now awaited before the response goes out, so if the write fails, the request fails, rather than producing an experience the results will never know about. When the server had to mint the visitor ID itself, it also sets the cookie for a year, with `Secure` on HTTPS.

## An SDK that names what it tracks

The browser SDK is a single class, compiled by a small build script into a standalone `/sdk/flip.js` that sets `window.Flip`:

```js
const flip = Flip.init({ apiKey: "your-key" });
const variant = await flip.getVariant("checkout-flow");
await flip.track("checkout-flow", "purchase", { value: 49.99 });
```

Its first version taught me two lessons. Its `track(eventName)` took no experiment at all and attributed the conversion to whichever experiment happened to be last in its cache, which is a guess, and with more than one experiment on a page it can credit the wrong one. It also sent conversions with `navigator.sendBeacon`, which is the natural tool for "send this even if the page is closing". But a beacon cannot set an `Authorization` header, and the tracking route requires a bearer key, so those conversions were refused.

The released `track` takes the experiment key explicitly and refuses to run until a variant for that experiment has been fetched. It sends with `fetch` and `keepalive: true`, which survives page unloads like a beacon does but can carry the bearer header. It sends `credentials: "omit"`, so no cookies from the host site travel with it, checks the base URL is plain HTTP or HTTPS with no credentials or query string in it, and rejects any payload over 16 KiB before sending, matching the limit the server enforces. Failures now reach the caller as errors, where the first version silently fell back to `"control"`.

## Counting visitors, not events

The first results route counted rows: every exposure event and every conversion event per variant. That is the wrong unit. Someone who reloads the page three times is three exposures, and someone who buys twice is two conversions. The statistics that follow assume each trial is one independent person, so the counts have to be people too.

`visitorOutcomes` rebuilds the counts from the raw events. For each visitor and variant it keeps the earliest exposure time. Any visitor who was exposed to more than one variant of the same experiment is excluded entirely and counted in an `excludedVisitors` figure, since their outcome cannot be attributed. Then a conversion only counts if it names the experiment's goal event, belongs to a visitor with an exposure in that variant, and happened at or after that exposure:

```ts
const exposure = exposures.get(event.visitorId)?.get(event.variantId);
if (exposure === undefined || event.createdAt.getTime() < exposure)
  continue;
const converted = conversions.get(event.variantId) ?? new Set<string>();
converted.add(event.visitorId);
```

Conversions are collected into a `Set` of visitor IDs, so a visitor converts at most once. The tracking route enforces the same rules on the way in: a conversion for the wrong goal is a 400, and one with no matching exposure is a 409.

## The statistics

With one exposed visitor per trial and at most one conversion each, every variant is a binomial sample: n visitors, x conversions, and an observed rate p̂ = x / n.

**Wilson intervals for each rate.** The textbook interval is p̂ ± z·√(p̂(1 − p̂)/n), but it behaves badly exactly where experiments start, with small samples and rates near zero. The sample workspace's early "welcome" test has a control with 2 conversions from 24 visitors. That textbook interval gives roughly −2.7% to 19.4%, a range that includes negative conversion rates. The Wilson interval comes from asking a different question: which true rates p would make the observed p̂ unsurprising, meaning |p̂ − p| ≤ z·√(p(1 − p)/n)? Solving that inequality for p gives:

```ts
const denominator = 1 + (z * z) / n;
const centre = p + (z * z) / (2 * n);
const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
return [Math.max(0, (centre - margin) / denominator),
        Math.min(1, (centre + margin) / denominator)];
```

With z = 1.96 that is a 95% interval, and for the same 2 out of 24 it gives 2.3% to 25.9%: asymmetric, pulled towards the middle, and always inside 0 to 1. Its width is the honest message of that test, which is that 24 visitors tell you very little.

**Two-proportion z-tests against the control.** For each treatment, the null hypothesis is that both groups share one true rate. Under that hypothesis the best estimate of it is the pooled rate p̄ = (x₁ + x₂)/(n₁ + n₂), and the standard error of the difference is √(p̄(1 − p̄)(1/n₁ + 1/n₂)). The test statistic is z = (p̂₂ − p̂₁)/SE, and the two-sided p-value is 2(1 − Φ(|z|)). There is no statistics library: Φ comes from the Abramowitz and Stegun polynomial approximation of the error function, with Φ(z) = ½(1 + erf(z/√2)).

The sample checkout experiment makes it concrete. The control converted 200 of 2,000 visitors (10%) and the focused checkout 250 of 2,000 (12.5%). The pooled rate is 450/4,000 = 0.1125, the standard error is √(0.1125 × 0.8875 × 0.001) ≈ 0.0100, so z ≈ 0.025/0.0100 ≈ 2.50 and the two-sided p-value is about 0.012.

**Bonferroni across treatments.** Every extra treatment is another chance for noise to look like a result. With m comparisons each run at level α, the chance that at least one is a false positive can be nearly m times α. Bonferroni divides the risk back out: multiply each p-value by m (capped at 1) and compare with the family-wide α of 0.05. The union bound then guarantees the chance of any false positive across the whole experiment stays at or below 0.05. The sample pricing experiment has two treatments. The card layout's raw p-value of 0.166 becomes 0.333, nowhere near. The comparison table's 0.0052 becomes 0.0105, which is still below 0.05 and counts as a clear difference.

**Guards before any comparison.** The z-test leans on a normal approximation that only holds once both groups have a reasonable number of conversions and non-conversions. So a comparison only runs when each group has at least 100 exposed visitors and at least 10 of each outcome. Below that, the p-value is `null` and the page says it is too early to compare.

**No automatic winner.** The first version reported a "confidence" of (1 − p) × 100 and crowned a winner when it reached 95 with positive lift. Both ideas are misleading: 1 − p is not the probability that a variant is better, and checking repeatedly until something crosses a line inflates the false-positive rate well beyond 5%. The stats now set `hasWinner` to `false` and `confidence` to `null` unconditionally, and the policy object travels with every result to say so in words: exploratory only, no sequential monitoring and no power guarantee. The results page shows rates, intervals, lift and adjusted p-values, and closes with "Weigh the size of the change before you ship it." A decision is still a person's job.

## Who can change things

The first version's management routes had no guard at all. The flag and experiment routes read and wrote a demo tenant named by an environment variable, the stats route read any experiment by ID, and the API key route listed every key in full and could delete them.

Management now sits behind two credentials. The operator sends a server-only `FLIP_MANAGEMENT_TOKEN` as a bearer token, compared with `timingSafeEqual` after a length check, together with the tenant's key in an `X-Flip-Tenant-Key` header:

```ts
const configured = deps.managementToken();
if (!configured)
  return response("Management is unavailable. The public dashboard is a read-only sample.", 503);
const token = bearer(request);
if (!token || !equal(token, configured))
  return response("Management authorisation required.", 401);
```

If no token is configured, management is simply unavailable, and that is decided before any tenant lookup touches the database. The browser SDK's key is a data-plane key: it can ask for decisions and record conversions, and cannot change a flag. Updates are written as `updateMany` filtered by both the record ID and the tenant, so an ID belonging to another tenant matches nothing and returns a 404. Key administration answers 501 until there is an owner identity model to hang it on, and nothing returns a raw key. Every request body is capped at 16 KiB and every response is marked `no-store`.

The public dashboard follows from that. It reads a fixed sample workspace from the source, never the database, with three example experiments and three flags, and a banner saying the figures are example data. The flag switches work, but only in the page, and reset when you reload.

## Light and dark

The dashboard follows the system colour scheme through CSS custom properties and a `prefers-color-scheme: light` block. The light values are not an inversion: the success, warning and danger text move to much deeper shades, and the accent text goes from pale lilac to deep purple, so status colours keep their contrast on white.

## What it taught me

Almost every improvement to Flip was about units and honesty rather than cleverness. A visitor, not an event, is the unit of an experiment. An exposure that is not stored did not happen. A beacon that cannot authenticate delivers nothing. And the most useful thing a results page can do is say how much the numbers can carry. The maths is small enough to write by hand, and writing it by hand is what showed me where each guard belongs.
