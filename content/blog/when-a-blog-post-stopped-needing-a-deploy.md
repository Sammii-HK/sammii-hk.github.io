---
title: "When a blog post stopped needing a deploy"
description: "How this blog moved from a static build to a live content reader, then gained full-text feeds and a shared publication policy. The useful changes were at the boundaries."
date: '2026-11-22'
tags: ['nextjs', 'content-systems', 'rss', 'architecture', 'building-in-public']
draft: true
series: 'The browser and the machine'
---

The first version of this blog read Markdown files from the filesystem and included the resulting pages in a static export. A new article travelled through the same build as a change to the interface.

The files still live in the same repository. What changed was when the running site could read them, which version it would use when the network failed, and how other readers could get the complete article.

That history is spread across five changes: the initial blog in February, future-date filtering in March, publication without a deploy in September, full-text feeds two days later, and shared title cleanup in October. Together they describe a content system growing beyond the page that first displayed it.

## The original boundary was a build

The [23 February implementation](https://github.com/Sammii-HK/sammii-hk.github.io/blob/f23ceacc2fdb58d50e9494ea42f618baa453f899/app/lib/blog.ts) was straightforward. Enumerate `content/blog`, read each Markdown file, parse its frontmatter, calculate reading time and sort the resulting posts by date. A slug corresponded to a filename.

That put the source and its history in one familiar place. An article could be reviewed as a diff. A correction could be traced to a commit. The page did not need a separate content editor or database to know what to render.

The release boundary came from the static export around that reader. A file added after a build was not automatically a page in the deployed output. The publishing workflow had to produce another build to make the new content available.

This is a reasonable arrangement for a small site. It also makes an editorial change depend on the application delivery path, even when the renderer and its dependencies have not changed at all.

## A date is a publication rule

The [9 March change](https://github.com/Sammii-HK/sammii-hk.github.io/commit/da4d8b59ad2d5d193e53ad856f653707504ef31e) added a second condition to the existing draft filter: the article's date must have arrived. The route-generation list used the same draft and date conditions.

Those are separate decisions. A draft stays withheld even if its date is yesterday. A completed article dated next week should not appear merely because its Markdown has already been committed.

The core rule can be written as a small pure function. This is an illustrative extraction, with an explicit invalid-date guard, rather than a replacement pasted into the site:

```ts
type Publication = { draft: boolean; date: string };

function isPublic(post: Publication, now: Date): boolean {
  const publishedAt = Date.parse(post.date);

  return !post.draft
    && Number.isFinite(publishedAt)
    && publishedAt <= now.getTime();
}
```

Passing the clock makes the boundary easy to check: just before the date, exactly at it, after it, and while the draft flag remains true. An explicit timezone offset also makes the stored date identify a particular instant.

In a static build, this policy is evaluated while generating the output. Crossing the date later does not itself rebuild the site. The rule can be correct while the delivery mechanism still needs another event before the article appears.

## September gave content its own path

The [21 September change](https://github.com/Sammii-HK/sammii-hk.github.io/commit/7f38b773248f7c78af013564b782f49e1612ecfd) introduced a live reader for the same Markdown directory on GitHub's `master` branch. Bundled files remained the build-time source and fallback. The article route allowed new slugs to be rendered on demand.

The system now had three deliberately different situations. During a production build, it could use the files already in the build. At runtime on Vercel, it could request the repository's current content. If that request failed, it could use the bundled copy when one existed.

The central choice in the [reader](https://github.com/Sammii-HK/sammii-hk.github.io/blob/7f38b773248f7c78af013564b782f49e1612ecfd/app/lib/blog.ts) is short enough to inspect directly:

```ts
const raw = (live() ? await githubRaw(slug) : null)
  ?? localRaw(slug);
```

This is an excerpt inside the asynchronous loader; its helper functions are defined elsewhere in that module. The nullish fallback means a missing remote result can fall back to a local one. It does not merge two versions of an article. Once text has been selected, the parser handles it through one path.

There is a corresponding change to the deployment contract. The [ignored-build script](https://github.com/Sammii-HK/sammii-hk.github.io/blob/7f38b773248f7c78af013564b782f49e1612ecfd/scripts/vercel-ignore-build.sh) checks whether a commit changes anything outside `content/blog` and `docs`. If it does not, the script permits the configured content-only build skip. Code changes still belong to a build.

The important separation is between making content available and shipping a new renderer. The repository continues to record both, but they no longer have to take the same delivery path.

## A cache interval is not a publishing alarm

The live reader configures a 600-second revalidation interval. It also tags the article list and individual articles so the [authenticated revalidation endpoint](https://github.com/Sammii-HK/sammii-hk.github.io/blob/574bbec892621a4c4d810d8cf45268d213833a1e/app/api/revalidate/route.ts) can request a refresh after a publishing action.

Neither detail should be mistaken for a promise that every visitor sees a scheduled article at precisely its publication second. A date establishes eligibility. Cached content and cached route output determine when a particular request observes that eligible version. The implementation contains cache and revalidation policy, not an independent wall-clock publishing job.

The [article route](https://github.com/Sammii-HK/sammii-hk.github.io/blob/574bbec892621a4c4d810d8cf45268d213833a1e/app/blog/%5Bslug%5D/page.tsx) checks the draft flag and future date before rendering. The feed and list use the filtered collection. These checks matter separately from whether a slug can be discovered: knowing a filename does not make it a publicly available article.

For a content system, the useful states are consequently more specific than “written” and “published”. A file can be committed, eligible, still represented by an older cached result, or available through one refreshed surface while another has yet to refresh. A delivery receipt should say which of those it actually checked.

## A fallback changes the meaning of deletion

The same fallback that keeps an existing article readable during a failed fetch creates another consequence. The reader combines remote and bundled slugs, and a failed remote lookup can return the bundled article.

If an article is removed from the repository but remains in the deployed bundle, that implementation can still find its local copy. A remote 404 and another failed remote response both become the same missing result before fallback. This follows from the source; it is not a claim that an article was accidentally republished in a live incident.

The distinction matters when designing withdrawal. Availability during an outage and authoritative deletion are different requirements. A stricter design could represent “the source says this no longer exists” separately from “the source could not be reached”, or maintain explicit withdrawal records. That would be a further change to the contract, not something the current fallback already guarantees.

## The feed needed the article, not only its description

Two days after the live reader, the [23 September change](https://github.com/Sammii-HK/sammii-hk.github.io/commit/d1ea728cebb4454821bcee81cb11be05afdd8885) addressed another boundary. The RSS feed contained summaries, while a reader trying to understand the writing needed the bodies.

The revised feed puts the complete converted article in `content:encoded`. The description remains useful as a summary, but it is no longer the only text available. A read-only blog API and plain-text site views consume the same parsed article collection.

That introduces format work of its own. XML text needs escaping, and a CDATA section cannot contain its own closing delimiter. The [RSS implementation](https://github.com/Sammii-HK/sammii-hk.github.io/blob/574bbec892621a4c4d810d8cf45268d213833a1e/app/rss.xml/route.ts) handles the latter by splitting the section:

```js
const cdata = html =>
  `<![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
```

The Markdown-to-HTML conversion is deliberately plain. An interactive component on the website does not become an interactive feed widget simply because its surrounding article has been exported. The portable value is the explanation, its code and its links.

Full text also does not guarantee that every client can retrieve or interpret the feed. It gives a capable reader the content it previously could not obtain from the summary alone. That is a specific improvement worth checking independently of the website's appearance.

## Fix a shared representation once

The [19 October correction](https://github.com/Sammii-HK/sammii-hk.github.io/commit/8bd4609f81e612f546833c99284af167b7286728) found twelve articles whose bodies opened with the same title their page header already rendered. That duplicated the heading on the page and carried the repetition into other outputs.

The correction belongs in the parser: remove a leading H1 when its normalised words match the frontmatter title, along with an immediately following thematic rule. Keep a genuinely different opening heading. The Markdown files remain intact, and consumers of the parsed body receive the same correction.

That is a useful final step in this history. Adding more ways to read an article increases the value of a shared representation. It also raises the cost of making each output invent its own publication and cleanup rules.

The blog began as files turned into pages. It became a reader with explicit choices about source, eligibility, freshness and format. Those boundaries are where the significant development happened, and they are the places I would inspect first when a content system says a post exists but a reader still cannot see it.

## Read this as a series

This article is part of **The browser: from an input to a visible result**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Use [the keypress-to-pixel chart](https://labs.sammii.dev/charts/keypress/) to locate the delay, then [the event-loop model](https://labs.sammii.dev/charts/event-loop/) and [rendering-cost chart](https://labs.sammii.dev/charts/repaint/) to inspect different causes.
