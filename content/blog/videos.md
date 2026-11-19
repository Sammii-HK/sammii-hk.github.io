---
title: "What 900 of my videos taught me, and why it is less than it looks"
description: >-
  Every video from six of my TikTok accounts as a dot, engagement against length and format. Short beat long by about ten to one on my personal account, and then the confound that makes the lesson smaller.
date: '2027-01-27T09:00:00+00:00'
tags:
  - charts
  - short-form video
  - tiktok
  - data analysis
series: "Short-form video"
chart: "videos"
draft: false
---

On my personal TikTok account, videos of eight seconds or less have a median engagement rate of 13.6%. Videos over 45 seconds have 1.3%. Same account, same person, about ten to one.

That is the number I wanted to put at the top of a post and tell everyone to make shorter videos. I am not going to, because the chart I built to show it also shows why it is mostly not true in the way it sounds.

The chart is at [labs.sammii.dev/charts/videos](https://labs.sammii.dev/charts/videos/). It is every video from six of my TikTok accounts, 900 in all, as a dot: how long it runs, and what share of the people who saw it liked, commented or shared.

## Read this before the numbers

Everything on this page is correlation, on one creator's accounts. My personal account, Sparkle, changed all at once, era by era: format, length, the line on screen, the topic and the audience. So most of "short beats long" is also "October 2025 beats July 2026". This is a record of what happened to me, not a law of the platform and not advice.

With that said, here is what it shows.

## The ten to one

Engagement rate here is (likes + comments + shares) divided by views, and every figure is a median, because a handful of videos run close to 40% and would drag a mean around.

On Sparkle, by length:

- **8 s or less**: 13.6% (69 videos)
- **9 to 20 s**: 5.1% (49)
- **21 to 45 s**: 1.9% (23)
- **Over 45 s**: 1.3% (10)

By format, the silent clips with a line of text on screen sit at 13.3% (58 videos). The scripted talking heads sit at 1.3% (27). The 28 videos my own pipeline made in June and July 2026, mostly scripted to camera, have a median of 1.4%.

## The first frame

The cover is the frame a scrolling thumb sees first, so I had Apple's Vision text recognition read every one. Text was found on 89 of Sparkle's 154 covers. On the 28 from the pipeline months, it was found on 1. On technically blonde, an account where every video is a scripted talking head, it was found on none of 25.

The chart draws this as rows of squares, one per video, filled where the cover carries text. The line on the first frame was the part the generated videos left out.

## The confound

The era table on the chart is the most important thing on it. Sparkle, era by era:

- **2023, music and vlogs**: 19 videos, median 5.5%.
- **Aug to Sep 2025, short clips**: 37 videos, 8.9%.
- **30 Sep to 22 Oct 2025, mostly one silent template**: 41 videos, median length 5 seconds, 98% of them eight seconds or less, 15.7%.
- **Late Oct 2025 to May 2026, mixed**: 19 videos, 6.1%.
- **Jun to Jul 2026, scripted talking heads from the pipeline**: 28 videos, median length 37 seconds, none of them eight seconds or less, 1.4%.
- **Aug to Sep 2026, unscripted vlogs**: 10 videos, 3.5%.

The short videos and the long ones are mostly from different months. The October 2025 run, which supplies a lot of the short winners, was mostly one silent template, many of them with an explicit ask for likes and comments in the caption, and some of its comments probably came from a circle of small creators who engage with each other. None of its 41 videos passed 500 views.

So I looked inside single eras, where the month is held still. In the two the chart compares, short still wins, by less. In Aug to Sep 2025 it is 11.8% at eight seconds or less (18 videos) against 7.7% for longer (17). From late Oct 2025 to May 2026 it is 7.1% (6) against 4.7% (13). That is a gap, but it is nothing like ten to one, and the groups are small.

## Reach is a different question

Engagement rate is not the same as being seen. On Sparkle the 31 videos with the most views and the 31 with the highest engagement share none at all, and the rank correlation between views and engagement is minus 0.33. The videos people liked most, as a share, were not the ones TikTok showed to the most people.

The table on the chart has a **Pushed (500+ views)** column for that reason. These accounts usually stop at a first tier of 200 to 400 views, and a second tier lands around 700 to 1,000, so passing 500 says TikTok tried the video on a wider pool. On Sparkle, 14 of the 69 shortest videos were pushed. 13 of the 23 between 21 and 45 seconds were.

## Using it

Across the top, **Account** picks one of the six (Sparkle, technically blonde, Seer, Stardust, Spellbound and Lunary) or **All 900**. Length runs along a log axis, engagement up the side, and the median of each length bucket is drawn across it as a step. Hover or tap a dot for its engagement, length, views, format and, on Sparkle, its era.

Under the plot, the format buttons highlight one format at a time, each with its count and median: **Silent clip, text on screen**, **Short clip, no text on the cover**, **Longer clip, text on screen**, **Music or dance**, **Scripted talking head**, **Unscripted talking or vlog**, and **No length recorded**. Below that are the length table, the covers and the era table.

Pick **All 900** and the panel warns you off it: Lunary, the app's own account, is 615 of the 900, so the pooled view is mostly a brand account. The shape only means anything one account at a time.

## What it cannot say

The formats are inferred by rule, not by hand: from length, whether the cover carries text, and the caption. I checked them against contact sheets of the covers for Sparkle and technically blonde only, so on the other four accounts they are rough.

Watch time and retention, which probably decide the wider push, are not in the export at all.

70 posts have a length of 0 seconds in the export, 3 on Sparkle and 67 on Lunary. They are left off the length axis and out of the length buckets, so the chart shows 830 dots rather than 900.

Lunary cannot test the pattern. It has exactly one timed video of eight seconds or less.

And these are my accounts and my audiences. Spellbound has eight videos, too few to read anything into. A different creator, a different niche or a different year could show the opposite. If there is anything here worth taking away, it is the method rather than the number: split by era before you believe a format.

## How it is built

The data is the TikTok analytics export for six accounts, pulled on 18 October 2026: 900 unique videos from August 2023 to October 2026. `scripts/labs/video-engagement.mjs` builds the chart's data file from the per-video table, and every figure on the page is in that file. Only numbers leave the analysis: no captions, on-screen text, ids or dates are published. The component computes nothing except the drawing.

The other chart in this series, [how long text needs on screen](/blog/text-on-screen), is about the line itself: how long it has to stay up to be read.

The chart is at [labs.sammii.dev/charts/videos](https://labs.sammii.dev/charts/videos/). `?focus=sparkle` opens it on my personal account, and `?focus=scripted` highlights the scripted talking heads.

## Sources

- TikTok analytics export for six of my accounts, pulled 18 October 2026.
- Apple Vision text recognition, used to read the cover frames.
