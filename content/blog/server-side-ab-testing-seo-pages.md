---
title: 'Server-side A/B testing across 2,000 SEO pages'
description: >-
  Client-side A/B testing has a blind spot. The users most likely to block
  scripts are exactly the users you most want to understand. Here's how I moved
  variant assignment to the edge and built a contextual CTA test with 100+
  variants across Lunary's grimoire.
date: '2026-03-09'
tags:
  - ab-testing
  - nextjs
  - seo
  - indie-hacking
  - performance
draft: false
---
Client-side A/B testing has a blind spot. The users most likely to block scripts are exactly the users you most want to understand.

Privacy-conscious users, developers, and power users all run ad blockers at higher rates than the general population. When your test script loads via a tag manager or a third-party SDK, you are systematically excluding those users from your sample. You get results, but they are results from a biased subset of your audience.

For Lunary's grimoire — 2,000+ SEO pages covering astrology, tarot, crystals, and numerology — I needed something that worked on every request. Here is how I built it.

## The architecture: variant assignment at the edge

The core idea is simple: move variant assignment from the browser to the Next.js middleware layer, which runs at Cloudflare's edge before any page is rendered.

Every request goes through middleware. By the time a component renders, the variant is already decided and stored in a cookie. No JavaScript needs to execute on the client. No script tag needs to load. No consent check can block it.

The variant assignment function is a deterministic hash:

```typescript
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

function assignVariant(
  userId: string,
  testName: string,
  test: { variants: string[]; weights?: number[] },
): string {
  const hash = hashString(`${userId}-${testName}`);
  const { variants, weights } = test;

  if (weights && weights.length === variants.length) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const normalized = hash % totalWeight;
    let cumulative = 0;
    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i];
      if (normalized < cumulative) return variants[i];
    }
  }

  return variants[hash % variants.length];
}
```

The input is `${anonId}-${testName}`. The same anonymous user always gets the same variant for the same test — if they visit twice, they see the same copy.

The anonymous ID (`lunary_anon_id`) is a UUID generated on first visit and stored in a cookie with a 365-day TTL. When a user authenticates, the anonymous ID is stitched to their account so pre-signup behaviour is preserved.

Assigned variants are stored in a second cookie (`lunary_ab_tests`) as a JSON object:

```json
{ "cta-copy-test": "mystical", "paywall_preview_style_v1": "blur" }
```

This cookie is `httpOnly: false` so client components can read it without a server round-trip.

## Bot exclusion

Bots should not be assigned variants. If Googlebot lands on a crystal page and ends up in a variant, it will be over-represented in impressions with zero conversion potential, skewing your results.

The middleware checks the user agent against a pattern covering common crawlers, preview renderers, and AI scrapers. It also checks for the absence of an `accept-language` header — bots rarely send it, making it a lightweight and reliable exclusion signal.

```typescript
const BOT_UA_PATTERN =
  /bot|crawler|spider|crawling|preview|facebookexternalhit|slackbot|googlebot|bingbot|gpt|openai|anthropic/i;

const shouldSkipTracking = (request: NextRequest) => {
  const ua = request.headers.get('user-agent') || '';
  if (BOT_UA_PATTERN.test(ua)) return true;
  const acceptLang = request.headers.get('accept-language');
  if (!acceptLang) return true;
  return false;
};
```

Bots get no variant assignment and no tracking. Their visits never enter the data set.

## The contextual CTA test

The test I most wanted to run was not a straightforward A vs B. Lunary's grimoire covers 26 distinct content categories: horoscopes, angel numbers, crystals, tarot spreads, houses, aspects, transits, and more. A generic "Start your free trial" CTA works, but I suspected copy anchored to what the user is actually reading would convert better.

The hypothesis: someone reading about angel numbers is in a different mindset than someone reading about birth chart aspects. If the CTA speaks to what they are already thinking about, it should feel more relevant.

So instead of one test with two variants, I built one test with 26 hubs, each with 3-5 copy variants. The variant ID is `${hub}_${index}`, so the admin dashboard shows entries like `Horoscopes_0`, `AngelNumbers_2`, `GrimoireReference_1` — all tracked under the single test name `sticky_cta_copy`.

```
horoscopes_0: "This is your sun sign. Your chart has 10 more."
horoscopes_1: "Generic horoscope? Your chart is more specific."
horoscopes_2: "Your rising sign gets a horoscope too."
horoscopes_3: "Which planets are transiting your chart today?"
horoscopes_4: "Sun sign horoscopes miss 90% of the picture."

angelNumbers_0: "You saw the number. Now what?"
angelNumbers_1: "Angel numbers are signals. Your chart shows the context."
angelNumbers_2: "You noticed the pattern. Now check your timing."

crystals_0: "Not every crystal is for every moment."
crystals_1: "Crystals work better with timing."
crystals_2: "Which crystal fits YOUR chart right now?"
```

The copy is assigned in `getContextualNudge()`, a server-side function that takes the pathname and the user's anonymous ID:

```typescript
export function getContextualNudge(
  pathname: string,
  userSeed?: string,
): ContextualNudge {
  const matchingRule = config.rules?.find((rule) =>
    new RegExp(rule.match).test(pathname),
  );
  const hub = matchingRule?.hub || 'universal';
  const pool = config.ctaNudges[hub] ?? config.ctaNudges.universal;

  const hashInput = userSeed ? `${pathname}-${userSeed}` : pathname;
  const index = Math.abs(hashString(hashInput)) % pool.length;
  const base = pool[index];

  return {
    hub,
    ...base,
    ctaVariant: `${hub}_${index}`,
  };
}
```

The variant is determined server-side, passed as a prop to the sticky CTA component, and rendered with no client-side lookup. No flash of wrong content.

## Dynamic copy injection

Some variants go further. They include placeholders filled with content from the actual page being viewed:

```
"Your {EXAMPLE_TEXT} reading isn't finished yet."
```

At render time, `{EXAMPLE_TEXT}` is replaced with an example pulled from the current page — a tarot card name, a crystal type, an angel number. The CTA copy literally references what the user just read.

```typescript
function injectExamples(text: string, hub: string, pathname: string): string {
  const example = getExampleForHub(hub, pathname);
  if (!example) return text;

  return text
    .replace(/{EXAMPLE_TEXT}/g, example.text)
    .replace(/{EXAMPLE_INTERPRETATION}/g, example.interpretation);
}
```

This is not personalisation based on the user's history. It is contextual: the copy adapts to the page, not the person. The distinction matters for both privacy and implementation complexity.

## Tracking without consent-based blocking

Events are tracked via server-side API calls, with the anonymous ID passed as a request header rather than a cookie value. The middleware fires a background tracking call using `waitUntil()` so it does not block the page response:

```typescript
event.waitUntil(
  fetch('/api/ether/visit', {
    method: 'POST',
    body: JSON.stringify({ path: pathname }),
    headers: { 'x-lunary-anon-id': anonId },
  })
);
```

CTA impressions and clicks land in a `conversion_events` table with the A/B metadata in a JSONB column:

```json
{
  "event_type": "cta_impression",
  "anonymous_id": "a1b2c3...",
  "page_path": "/grimoire/angel-numbers/1111",
  "metadata": {
    "abTest": "sticky_cta_copy",
    "abVariant": "angelNumbers_1",
    "hub": "angelNumbers"
  }
}
```

Because the tracking call goes to a first-party endpoint with no third-party cookies, it is not subject to ITP restrictions or blocked by standard privacy browser settings.

## Statistical analysis

The admin dashboard queries conversion rates per variant and runs a Z-test for two proportions:

```typescript
const z = Math.abs(p2 - p1) / se;

if (z >= 2.576) return 99;
if (z >= 1.96)  return 95;
if (z >= 1.645) return 90;
```

A variant is flagged as significant at 95% confidence with at least 100 impressions per variant being compared. With 26 hubs at 3-5 variants each, different sections of the grimoire accumulate data at different rates depending on traffic volume.

There is also an AI insights button that passes raw variant data to a language model and asks it to explain what the results suggest — useful when variants are close and you want a second read on whether the difference is meaningful.

## Closing a test properly

Before the contextual test, I ran a simpler one: sparkles icon vs no icon on the sticky CTA. The sparkles variant won at 0.79% CTR with 90% confidence.

That result is now hardcoded. The test is retired. The variant logic is gone.

```typescript
// inline-cta-style: REMOVED — sparkles won (0.79% CTR, 90% confidence).
// Hardcoded in components.
```

Most A/B testing setups accumulate variants indefinitely. Treating a finished test as technical debt to remove keeps the codebase legible and stops you from carrying dead branches forever.

## Trade-offs

**Cookie assignment is not persistent across devices.** If a user clears cookies or switches devices, they get a new anonymous ID and could end up in a different variant. For CTA copy this is tolerable. For a pricing experiment it would need more careful handling.

**Simultaneous tests can interact.** If paywall style and CTA copy are both in test at the same time, the combination of `blur + mystical` may behave differently than either test predicts in isolation. The current setup does not model interaction effects.

**Low-traffic hubs have a cold-start problem.** Some grimoire categories accumulate impressions slowly. Statistical significance may take months for niche hubs. That is fine as long as you are not blocking a decision on the result.

The server-side approach removes the measurement bias from the setup. Everything else is just patience and sample size.

---
