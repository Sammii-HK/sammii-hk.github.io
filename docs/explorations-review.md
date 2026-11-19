# Standalone explorations

## Scope

This change adds a collection and fifteen independent interactive pages inside
the existing Labs design. It also prepares two unpublished articles that embed
the same runtime. The main portfolio navigation and homepage are unchanged.

The public URL shape is `https://labs.sammii.dev/explorations/<slug>/`. Local
Next development uses `/labs/explorations/<slug>/`; host-specific Vercel rewrites
provide the public path. The runtime uses the separate `/exploration-runtime/`
prefix so the page rewrite cannot intercept its assets.

Every page includes a server-rendered introduction, controls guidance, changing
readouts in the interactive model, limitations, primary sources, related
explorations and links to Sammii's work, writing and contact section.

## Discovery

- Unique titles, descriptions, canonical addresses and 1600 by 900 sharing
  images derived from the actual models.
- WebPage and BreadcrumbList structured data, author attribution and ordinary
  crawlable links. No invented publication dates or rich-result guarantees.
- Separate main-site and Labs sitemaps. The Labs sitemap contains its landing
  page, Charts index, 37 chart pages, Explorations index and 15 exploration
  pages, for 55 entries. Static pages do not receive a manufactured update date.
- A real `/labs/robots.txt` route handler supplies the Labs crawler endpoint.
- Vercel previews are marked noindex. Runtime wrappers are noindex so the
  explanatory page is the intended search destination.
- Both new articles retain `draft: true`, no publication date and a normal
  standalone-page link after their interactive component. They remain absent
  from the public blog, RSS and sitemap until intentionally published.

## Runtime and source integrity

`public/exploration-runtime/source-manifest.json` records SHA-256 hashes for the
20 imported model, style, source-note and font inputs. The original model files
are preserved byte-for-byte. The sources directory contains their provenance
notes and applicable licences; the font directory includes its licences.

The parent stage and same-origin iframe exchange readiness, height and error
messages. Each listener verifies the exact window and origin. Readiness is
replayed after hydration, retries and back/forward-cache restoration; a failed
mount cannot report success. JavaScript-free readers retain the explanations
and sources, while a failed interactive view offers a retry.

The bridge reports the first trusted interaction using only the existing
`control`, `adjust`, `select` or `inspect` categories. The existing Vercel
Analytics SDK receives ready, first-interaction and onward-destination events.
No text input, pointer coordinates, URL query values or personal identifiers are
sent by these additions. Production ingestion and plan availability have not
been verified; no paid service or account setting was changed.

## Rebuilding

The committed assets are sufficient for an ordinary `npm ci` and `npm run
build`. Python is not required by the site build.

To regenerate wrappers from the committed inputs:

```sh
python3 scripts/build-exploration-runtime.py
```

To regenerate the editorial sharing covers, use Python with Pillow and Node:

```sh
python3 scripts/build-exploration-cards.py
```

Import a newly reviewed source snapshot only with the explicit
`--source-dir /path/to/creative` option on the runtime script. Review its source
manifest before committing. A repository-only regeneration reproduced all 53
runtime files and covers byte-for-byte during this review.

## Verification

- Production Next build, TypeScript and targeted registry, source integrity,
  lifecycle, sitemap, draft exclusion and bounded analytics checks.
- Browser loading of all 15 pages. Each of the five module families was also
  exercised: black-hole path presets, gravity selection and keyboard scrubbing,
  constellation choice and time scrubbing, clock radius and pause, planetary
  history scrubbing.
- Browser verification of the real Labs robots endpoint, the 55-entry sitemap
  and the unpublished black-hole article returning the 404 view.
- Local analytics debug output shows ready and first-interaction events. This
  is not evidence of production event ingestion.
- The cloud browser denied fullscreen; the page displayed its graceful
  fallback and continued working. Native browser fullscreen still needs a
  check on the target device.

This is a reviewable implementation. Production host routing, live indexing,
Search Console discovery and analytics outcomes are release checks, not claims
made by the local tests. The constellation illustrations and sound experiment
also retain their existing editorial review needs.
