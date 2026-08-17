---
title: "Strata"
description: "One zoom gesture, every scale — from the ISS overhead to the edge of the observable universe"
techStack: "React Native, Expo, React Native Skia, RevenueCat"
---

## The problem

Most "explore the universe" apps and most "history of everything" timelines are two different products, built on two different engines, sold separately. But the underlying interaction is identical: a single axis, logarithmic zoom, and a point you can drag along it. Strata builds that engine once and points it at two very different datasets.

## Architecture

### One canvas, two universes

The core is a single React Native Skia canvas that renders a zoomable, draggable line. "Cosmos" plots it against distance — light-seconds at one end, 46.5 billion light-years at the other, log-scaled so the ISS, the Moon, the Oort cloud, and the edge of the observable universe all sit on the same axis without any of them disappearing into a pixel. "History" plots the same engine against time instead of distance, walking roughly 900 curated events across Europe, world history, and ideas.

### Depth as a first-class interaction

Pinch or scroll changes the zoom level; drag travels along the axis; tapping a point surfaces what it is; tapping a second point measures the gap between them. That "measure the gap" interaction — distance or duration, depending on which universe you're in — is the one piece of UI unique to Strata versus a generic pan-and-zoom map, and it's what turns passive scrolling into an actual question-answering tool.

### Free hook, paid depth

Cosmos ships free — it's the viral, shareable half, and it's aimed squarely at people already interested in astrology and space content. History is a £3.99 unlock. RevenueCat handles entitlements for that purchase and for two further content packs (Life on Earth, Deep Ocean) built on the same engine but not yet shipped, plus a bundle price across all of them.

## Challenges

**Keeping two axes honest at once**: a log scale that works for "22 AU" also has to work for "1 light-second" without either end feeling broken or empty. The zoom curve needed real tuning against actual reference points (ISS altitude, Voyager 1's distance, the observable universe's radius) rather than an arbitrary exponential.

**Making history feel like distance**: the History lens reuses the exact same drag/zoom/measure interactions as Cosmos, which meant designing ~900 events so that "measure the gap" between, say, the printing press and the moon landing feels as legible as measuring light-years between two stars — a duration, rendered with the same visual grammar as a distance.

## Outcome

Strata is one rendering engine sold as two products from the same free hook, with two more content packs planned on the same foundation rather than a separate build each time.
