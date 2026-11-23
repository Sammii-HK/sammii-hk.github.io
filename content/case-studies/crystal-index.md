---
title: "Crystal Index"
description: "A crystal directory with search, filters and sort kept in the address, a camera identification service for the iOS app, and an image pipeline that stopped compressing every picture twice"
techStack: "TypeScript, Next.js, React, Prisma, PostgreSQL, pgvector, Vercel Blob, Qwen3-VL, Zod"
---

## What it is

Crystal Index started in February 2021 as a small Express server. It is now a public crystal directory at [crystalindex.co.uk](https://crystalindex.co.uk), and the web half of a native iOS app that identifies a crystal from a photo. Each page in the directory pairs mineral facts, such as hardness on the Mohs scale, with the traditional associations people come looking for, such as chakra, zodiac sign and element, and keeps the two clearly labelled as different kinds of information.

The interesting work sits in three places: a directory whose whole view lives in the URL, an identification endpoint that must be safe to call from an app whose only credential ships inside the binary, and an image pipeline.

## A directory that lives in the address

I wanted any view of the directory to be a link: "violet crystals for the crown chakra, hardest first" should be something you can share, bookmark, or return to with the back button. The filters are not React state that happens to be mirrored into the URL. The URL is the state, and there is exactly one function for reading it:

```ts
function allowed(query: URLSearchParams, key: string, options: readonly string[]) {
  return [...new Set(
    query.getAll(key)
      .flatMap((value) => value.split(","))
      .map(normal)
      .filter((value) => options.includes(value)),
  )];
}
```

Every facet goes through an allowlist. A value that is not one of the known chakras, colours, signs or elements disappears, duplicates collapse through the `Set`, and `?colour=red&colour=pink` means the same as `?colour=red,pink`. The writer, `catalogueQuery`, is the mirror image: it sorts each facet's values before appending them and leaves out the default sort, so the same view always produces the same string.

That canonical form matters. When you open a crystal from a filtered view, the card's link carries the view along as `?directory=…`, and the detail page's back link rebuilds it with `catalogueBackHref`, which parses the string and writes it out again. A crafted `directory` value cannot turn the back link into a redirect somewhere else, because anything that is not an allowed facet is gone by the time the link is written.

On the client, toggling a filter uses `history.replaceState`, so twelve clicks do not leave twelve history entries, and a `popstate` listener restores whatever view the address describes.

## Match any within a group, narrow across groups

The filtering is a pure function, `selectCatalogue`, and its rule is the one the page states in plain words: choose several values in a group to match any of them, and different groups narrow the results. Purple or blue, and the heart chakra.

```ts
const includes = (selected: string[], values: readonly string[] | undefined, chakra = false) =>
  !selected.length ||
  !!values?.some((value) =>
    selected.includes(normal(value).replace(chakra ? /\s+chakra$/ : /$^/, "")),
  );
```

An empty group passes everything. Chakra values are normalised so "Heart Chakra" and "heart" are the same thing. The `/$^/` in the other branch is a small trick: a pattern that can never match, so non-chakra values pass through `replace` untouched without a second code path.

Sorting uses an `en-GB` `Intl.Collator` with numeric comparison and falls back to name and then id, so the order is deterministic. A crystal with no recorded hardness always goes to the end of the hardness sort rather than counting as zero, and missing dates behave the same way.

## Recorded associations, not guessed ones

The extra detail comes from a hand-curated JSON encyclopaedia in the repository, joined to database records by name, then alternative name, then a partial match. That is where a crystal's zodiac signs and elements come from.

This is the part of the directory I rewrote most recently, and the version before it is the clearest dead end in the history. The old gallery found zodiac matches by searching each crystal's name, bio and description for the sign's name as a substring, and it had no element data at all: choosing "Fire" was translated into Aries, Leo and Sagittarius, and then into the same substring search. Any description that happened to contain "leo" inside another word would count as a match, and a crystal recorded against Fire would be missed unless its prose mentioned one of those three signs. The current version only ever filters on recorded values, and its test is named for exactly that: zodiac and element filters use recorded metadata, not prose or inferred zodiac elements.

Above those filters, the page also says that element here is a symbolic association, not chemical composition. A directory that mixes mineralogy and tradition owes people that sentence.

## Telling "nothing matched" from "nothing loaded"

The directory page fetches the catalogue on the server and passes it through a Zod schema, `parseCatalogueResponse`, which returns `null` on failure. That gives three distinct outcomes, a list, an empty list or no list, and they render differently. An empty result says no crystals match this view and offers to clear the filters. A failed load says the directory could not load and that your filters have not been cleared, with a "Try again" button that is a plain GET form carrying every current query parameter as a hidden input. It works without JavaScript and cannot lose the view you were in.

The schema only keeps the fields the directory actually uses, so anything else in the response is stripped before it can be serialised into the page.

## Identification from a camera

The iOS app sends a photo to `/api/v1/identify`. The design question was less "which model" and more "what does this endpoint trust". There are three kinds of caller: someone signed in on the web, a developer with an API key, and the native app. The first two have accounts, so they get a per-account limit based on their plan, and their identifications are kept as history on their own account. The app is anonymous by design and authenticates with a shared secret read from an environment variable. The route's own comment is plain about what that is worth:

```ts
// Abuse guard: throttle native-app requests per IP. The shared app secret is weak
// (it ships in the binary), so this per-IP cap is the real protection against an
// extracted key running up DeepInfra/blob cost.
```

So the protection is layered underneath it:

```ts
const appLimit = await checkRateLimit(`app-ip:${ip}`, 'identification-app', 20, 60) // 20/hour/IP
const globalLimit = await checkRateLimit('app-global', 'identification-app-global', 1500, 24 * 60)
```

The first is a per-address throttle. The second is a circuit breaker: if the secret is extracted and used from many addresses at once, there is still a ceiling on how many vision calls the app path can make in a day. A throttled address gets a 429 with `Retry-After`, and the daily cap answers with a 503 saying identification is busy right now, which is the honest description from the user's side. Payloads over 10 MB are rejected before any upload or model call.

The limiter is deliberately simple and lives in Postgres. Each allowed request writes a row with its own `resetAt`, the count is the number of live rows for that key, and expired rows are deleted on the way in. Because every row expires on its own schedule, it behaves like a sliding window rather than a counter that resets on the hour.

## Deleting the photo

The privacy policy says a photo is only used to identify the crystal, but app photos were once uploaded to Blob storage for the model to read and then left there. The fix makes the promise structural:

```ts
const anonymousUploads: string[] = []
const discardAnonymousUploads = () =>
  Promise.all(anonymousUploads.splice(0).map(url => deleteImageFromBlob(url)))
```

Every blob created for an app request, including any background-removed copy, goes onto that list. It is drained after a successful analysis and again in the `catch` block, so a failure leaves no photo behind either. `splice(0)` empties the array as it reads it, so the two calls can never delete the same file twice. App callers are never handed back a URL for their photo; the response sends `null` in its place. A small test reads the route and checks all three behaviours.

## The model, and the models before it

The history here is a record of trying things until they worked. The first version, in November 2025, sent the photo to a CLIP interrogator on Replicate, which returns a caption, and then scored that caption against the catalogue with a growing set of heuristics: lists of artistic phrases to strip out, and rules to guess whether "white" described the crystal or the cloth it was photographed on. It was a lot of code to recover meaning from text that was never meant to carry it. In March 2026 I replaced it with a vision language model, briefly tried a smaller open model, and settled the same week on Qwen3-VL-30B through DeepInfra.

The prompt lists every crystal name in the encyclopaedia, asks the model to weigh colour, transparency, lustre, habit and optical effects, and to answer in JSON only with four or five ranked matches, at temperature 0.1. The parser strips a stray Markdown fence and keeps only well-typed matches. The prompt asks for names from the list and for confidences that sum to one, but the code only checks types, so a confidence is the model's own estimate rather than a calibrated probability.

There is also a small learning loop. When a signed-in user confirms or corrects one of their identifications, a CLIP embedding of the image is stored in a pgvector column against the confirmed name. The next identification looks for confirmed images with a cosine similarity above 0.7 and names them in the prompt as visually similar confirmed crystals. If pgvector or the embedding service is unavailable, the lookup returns nothing and identification carries on without it.

## Images, served once

Crystal photos are resized to at most 1920 pixels wide and encoded as WebP at quality 85 by sharp when they are uploaded, then stored in Vercel Blob. Next's image optimiser was compressing those already-compressed images again, and with a sixty-second cache lifetime it kept doing it, in more than one format and across many widths. It accounted for most of the site's requests. The released config turns it off:

```js
// Trade-off: one size for all viewports, which is fine at 26-70 KB each.
unoptimized: true,
```

Each image is now served straight from storage. The tuned settings below that line stay in place, so the optimiser can be switched back on without rediscovering them.

Older records resolve their image through `/api/image/[id]`, which redirects to the Blob URL. Two fixes there are worth recording. The route had been bundled for the Edge runtime, where Prisma cannot run, so it failed on every request; it is now pinned to Node. And the site middleware used to stamp every `/api/image` response as immutable for a year before the handler had run, which meant the failures were cached by the CDN too. Now only a successful redirect carries a long cache header, set by the handler itself, and a test checks the middleware never blanket-caches that path again.

sharp also failed to load in the serverless runtime, so `lib/blob.ts` imports it lazily, only when compression is requested, and identification uploads the app's JPEG as it is. Naming that blob `crystal.jpeg` rather than `crystal.jpg` was its own small fix: the content type is derived from the extension, and the vision provider rejected `image/jpg`.

## Sitemap and structured data

The sitemap is generated from the database: static pages, every crystal at its canonical slug, published blog posts, and a directory view for each chakra and colour, which only works because a filtered view is a real URL. Numeric crystal URLs redirect to their slug, and each crystal page carries breadcrumb, product, article and FAQ structured data built from its encyclopaedia entry.

## Light and dark

The site follows the visitor's system setting with CSS custom properties: dark values on `:root`, light values inside a `prefers-color-scheme: light` query, and components reading `var(--ci-*)`. The latest fix came from a contrast check: the hero's slate tiles stay dark in both schemes, so they now keep white text in both, instead of switching to dark text at about 2:1.

## What it taught me

Crystal Index is the oldest thing I still work on, and it reads like it: Pages Router and App Router side by side, migrations from 2022, an identification service from 2026. This round was mostly about being exact with trust. An app secret is a filter, not a lock, so the real limits go underneath it. A promise in a privacy policy should be something the code cannot forget to do. And an association you have not recorded is not one you should infer.
