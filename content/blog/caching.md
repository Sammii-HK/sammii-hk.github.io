---
title: "Why they are still seeing the old version"
description: >-
  You shipped the fix, you can see it, and they cannot. A chart that runs five sets of caching headers against the same six visits, with your deploy in the middle, and shows which visit finds out.
date: '2026-11-30T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - http
  - caching
  - performance
series: "The browser and the machine"
chart: "caching"
draft: false
---

You deploy the fix. You open the site and it is there. Someone messages to say it is still broken. You ask them to refresh. Still broken. You do a hard reload on your own machine, just to be sure, and it is definitely fixed. For you.

Nothing is broken. Their browser has a stored copy of the page that it believes is still fresh, so it never asked the server whether anything had changed.

[labs.sammii.dev/charts/caching](https://labs.sammii.dev/charts/caching/) runs five sets of caching headers against the same six visits, with your deploy in the middle, so you can see exactly which visit finds out and which one does not.

## The one true thing

A fresh stored response is reused without contacting the server at all.

Freshness is the whole mechanism. While a stored response's age is under its `max-age`, the browser may use it without a request leaving the machine. Only once it is stale do validators like `ETag` come into play. So a change on the server is invisible to that browser until its copy expires.

The chart calls the classic version of this the most common caching bug in production: HTML served with `max-age=3600`. You deploy the fix and, for an hour, their browser does not ask.

## The six visits

Every preset runs against the same timeline:

1. First visit, at 0 seconds
2. Clicks through, 30 s later
3. Comes back half an hour later
4. You deploy the fix, they reload, at 1,900 seconds
5. They hard-reload (Cmd+Shift+R)
6. An hour after their first load

Each row shows what the browser does, the status, the bytes transferred and the time, with a bar. From the deploy onwards, each row also ends in a verdict: "They see the fix." or "They still see the old version." (On the hashed asset it reads "They see the fix: the new build is a new URL.")

## The five presets

**1. The bug.** `Cache-Control: max-age=3600`, with an ETag, on `/index.html`. The first visit downloads the page. The next two come from the browser's cache in 0 and 3 ms. Then you deploy, they reload, and the copy is 1,900 seconds old against a `max-age` of 3,600. Still fresh. No request. They still see the old version. Only the hard reload breaks through.

**2. HTML, done right.** `no-cache, must-revalidate` with an ETag. Every visit asks. Before the deploy, the server answers each one with an empty `304 Not Modified`, about 0.3 KB, in one round trip. After the deploy, the ETag no longer matches, so the server sends the new body and they see the fix straight away. The chart's notes call this what you want on HTML.

**3. Hashed asset.** `max-age=31536000, immutable` on `/app.4f2a9c.js`. Every visit after the first, apart from the hard reload, is served from memory without asking, at any age. That is correct, because a new build is a new filename: the page asks for that new URL fresh, and the old one is simply never requested again.

**4. Stale while revalidate.** `max-age=60, stale-while-revalidate=86400`. Fresh for a minute, then the stored copy is served instantly while it refreshes in the background. On the deploy visit they see the old version once, while the background refresh fetches the new build. Fast, and one version behind for one visit.

**5. no-store.** Nothing is stored. Every visit is a full download, and every visit sees the latest build. The chart's note is the right one: correct for a bank statement, an expensive mistake for anything else.

## Two words that are easy to swap

`no-cache` does not mean do not store. It means store it, and always revalidate before using it. That is what you want on HTML: every visit asks, and almost every answer is an empty 304 costing one round trip. `no-store` is the one that means do not keep it.

And `immutable` plus a build hash is the only honest way to cache something for a year. `immutable` tells the browser not to revalidate even on an explicit reload, so it is only safe on a URL whose content genuinely cannot change. A hash in the filename guarantees that. That is the whole reason bundlers put hashes in filenames.

## Why the hard reload lies to you

A hard reload sends `Cache-Control: no-cache` on the request and ignores every stored response. That is why it always works for you. It never works for them, because they are not doing it, and their browser is still following the headers you sent yesterday.

## How the numbers are made

The times are a model, not a measurement. The chart assumes one 4G round trip of 170 ms and 75 ms to send 84 KB, the same model as [How a URL becomes a page](https://labs.sammii.dev/charts/url/). A memory hit is 0 ms, a disk hit 3 ms, a 304 one round trip, a full response the round trip plus the transfer. What matters is the shape: a fresh hit costs nothing and can be wrong, a 304 costs one round trip and is always right, a full response costs both.

The logic is a small function that follows RFC 9111 freshness. It checks for `no-store`, works out the age of the stored copy, compares it with `max-age` (or a year, for an immutable hashed URL), then checks the `stale-while-revalidate` window, then the ETag. It also tracks which build the stored copy is, so a hard reload halfway through stores the new version and later cache hits are counted as seeing the fix.

## What it does not do

It is one browser cache. There is no CDN, no proxy and no service worker in the model, so if one of those is holding your old build, the chart cannot show it.

`Vary` is in the notes but not in the demo. It lists the request headers that form part of the cache key: a response that varies on `Accept-Encoding` is stored separately per encoding, and one that varies on `Cookie` is effectively uncacheable. It is the header that silently breaks things, and the chart does not show it.

The split between memory and disk cache is the model's own rule: the chart calls anything under 60 seconds a memory hit and anything older a disk hit, except the hashed asset, which is always a memory hit.

The presets are fixed. You cannot type your own headers, and `must-revalidate` changes the header line but not the outcome of any visit. There is also one small oddity in the model: in the "HTML, done right" preset, the last visit downloads the full body again, even though the hard reload had already stored the new build. A real server would answer that one with a 304.

See which of your visits finds out at [labs.sammii.dev/charts/caching](https://labs.sammii.dev/charts/caching/).

## Sources

- RFC 9111 (HTTP Caching), sections 4 and 5
- RFC 5861 (stale-while-revalidate)
- Chrome DevTools network documentation
