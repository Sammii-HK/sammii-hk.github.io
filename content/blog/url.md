---
title: "A slow page is mostly waiting"
description: >-
  How a URL becomes a page, drawn as one waterfall computed from round trips. On a slow link most of the time before the first byte is the network asking and answering, and on a cheap phone the JavaScript dwarfs the waiting.
date: '2027-01-28T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - performance
  - networking
series: "The browser and the machine"
chart: "url"
draft: false
---

You press return and nothing happens. The tab spins, the screen stays white, and you start to wonder whether you mistyped the address. Then the page arrives all at once, as though it had been sitting there the whole time.

It had not. For most of that white screen, nothing was being built. The browser was asking a question and waiting for the answer, then asking another one.

The chart is at [labs.sammii.dev/charts/url](https://labs.sammii.dev/charts/url/). It draws every step between pressing return and seeing a page as a bar on one time axis, and computes every bar from the network and device you pick. It is the network sibling of the keypress chart.

## The number at the top

The chart opens on a mid-range phone on 4G, HTTP/2 with TLS 1.3, a cold DNS lookup, 80 KB of CSS and 400 KB of JavaScript. The line above the waterfall reads: first paint at 403 ms, usable at 806 ms, and before the first byte of HTML arrives, 260 ms, "all of it waiting".

Switch the network to 3G and that last number becomes 860 ms. First paint moves to 1,705 ms and the page is usable at 3,580 ms. Nothing about the page changed. Only the network did.

That is the one true thing I wanted the chart to make obvious: a slow page is mostly made of latency, not work. Every step before the first byte is a round trip, and in the model a round trip costs the same whatever it is carrying.

## The six knobs

Across the top there are six rows of buttons:

- **Network**: fibre (10 ms RTT), 4G (50 ms RTT) or 3G (200 ms RTT). Behind the labels the model also gives each one a bandwidth: 100, 20 and 1.6 Mbps.
- **Protocol**: HTTP/1.1 + TLS 1.2, HTTP/2 + TLS 1.3, or HTTP/3 (QUIC).
- **DNS**: cached or cold.
- **JavaScript**: 0, 100, 400 or 1,200 KB.
- **CSS**: 20, 80 or 200 KB.
- **Device**: laptop, mid phone or cheap phone.

Hover or tap a bar and the panel underneath tells you which stage it belongs to (connect, fetch or render), when it starts, how long it runs and what is happening in it. The bars start where their step starts, so you can see what overlaps and what has to wait. A marker shows where the first paint lands.

## How the bars are computed

The maths is deliberately simple, and the notes under the chart state all of it.

DNS is one round trip to a resolver, or 1 ms if the name is already cached. TCP is one round trip: SYN, SYN-ACK, ACK. TLS 1.2 needs two round trips to agree keys; TLS 1.3 needs one. HTTP/3 runs on QUIC, which folds the transport and TLS handshakes into a single round trip.

Then the request itself: one more round trip plus 60 ms of server time, and the first byte arrives. The HTML is 40 KB, and its download is size over bandwidth. The CSS and JavaScript are discovered early in the document and fetched in parallel over the warm connection, each costing a round trip plus its own download.

The CSS is render-blocking. Nothing paints until it is in. Style, layout and first paint take 20 ms on the laptop, 45 on the mid phone and 90 on the cheap one. Then the JavaScript is parsed, compiled and run at a cost per kilobyte that depends on the device: 0.25 ms on the laptop, 0.8 on the mid phone, 2.5 on the cheap phone. Those figures sit in the range Addy Osmani reports in The cost of JavaScript.

## Two things the knobs show

**The protocol is a latency feature.** On 3G, HTTP/1.1 with TLS 1.2 spends 600 ms on TCP and TLS before it can even send the request. HTTP/3 spends 200. That is 400 ms saved before a single byte of HTML arrives, and the first byte lands at 660 ms instead of 1,060. On fibre the same change is worth 20 ms, which is easy to miss on a fast connection.

**The device moves a different bar.** 400 KB of JavaScript costs 100 ms to parse, compile and run on the laptop and 1,000 ms on the cheap phone. Put the cheap phone on fibre and the first byte arrives at 100 ms and the first paint at 210 ms, then the page sits there for another second running its script. It is the one bar that stretches when you change the device rather than the network. Push JavaScript to 1,200 KB on the same phone and that bar is 3,000 ms on its own.

The two halves of the chart's lead are both true, just on different settings: on a slow link the waiting dwarfs the work, and on a cheap phone the JavaScript dwarfs the waiting.

One more thing the defaults show: on 3G, with the default 400 KB of JavaScript, the longest bar is not the handshakes. It is the script's fetch, 2,200 ms (a round trip plus its download at 1.6 Mbps), which runs alongside the CSS and the first paint, and the script cannot run until it is in.

## What it does not do

This is a model, not a measurement. It does not time your connection or your device. The round trips, bandwidths, server time and per-kilobyte costs are fixed numbers in the code, not readings from any machine.

The notes are explicit about what is left out: congestion windows, priorities, caching, preloading and the HTTP/1.1 connection limit. Those change the numbers, not the shape. The code also fetches the CSS and JavaScript in parallel for every protocol, and the comment beside it admits that HTTP/1.1 would serialise more than that. The HTML is always 40 KB and the server always takes 60 ms.

So the waterfall will not tell you how fast your site is. It tells you which kind of slow you are looking at. If the bars before the first byte are long, you have a latency problem, and the fixes are fewer round trips: a newer protocol, a cached lookup. If the last bar is long, you have a JavaScript problem, and a faster network will not fix it. If you want that last bar measured rather than modelled, [What a byte of JavaScript costs](https://labs.sammii.dev/charts/js-cost/) generates a bundle and times it in your own browser.

Pick 3G, a cheap phone and 1,200 KB and the page is usable at 10,260 ms: 6,200 of that fetching the script and 3,000 running it. Then set JavaScript to 0 KB and the same page is usable at 1,750 ms, the moment it first paints.

The chart is at [labs.sammii.dev/charts/url](https://labs.sammii.dev/charts/url/), and it will open with one bar selected if you add `?focus=tls`, `?focus=ttfb` or `?focus=exec`.

## Sources

- RFC 8446 (TLS 1.3)
- RFC 9000 (QUIC)
- RFC 9114 (HTTP/3)
- Addy Osmani, The cost of JavaScript (2018 to 2023)
- Ilya Grigorik, High Performance Browser Networking
- HTTP Archive Web Almanac page weight medians
