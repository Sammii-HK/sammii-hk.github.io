---
title: "How long \"now\" takes"
description: >-
  A flash that is drawn exactly above a moving dot appears to trail behind it.
  A chart that shows the brain's delay, then puts its timings on one millisecond
  axis with a 16.7 ms frame and a 44 ms keypress, then measures your own.
date: '2026-12-28T09:00:00+00:00'
tags:
  - charts
  - perception and consciousness
  - latency
  - perception
series: "Perception and consciousness"
chart: "now"
draft: false
---

A dot slides along a track. Once per pass, a second dot flashes for a single frame directly above it. Most people see the flash a little behind, as if the moving dot had already travelled on by the time the flash happened. Speed the dot up and the gap grows.

Then you switch the demo to freeze on the flash frame, and it stops with the two dots lined up exactly. They were always lined up. What you saw was not what was on the screen.

That is the flash-lag effect, and it opens the chart: [labs.sammii.dev/charts/now](https://labs.sammii.dev/charts/now/).

## A moment after the moment

Light from the screen reaches you in a nanosecond. Turning it into an experience takes much longer. Tens of milliseconds go on the signal climbing from the eye to the cortex, and then the brain appears to wait a little longer still before it settles on what happened.

The flash-lag effect was first described by MacKay in 1958, and revived by Nijhawan in 1994, who argued that the brain extrapolates moving things forward. Others proposed that moving objects are simply processed faster than flashes. Then Eagleman and Sejnowski, in 2000, showed that what people report seeing at the moment of the flash depends on what the moving object does in roughly the next 80 ms. They called it postdiction: the brain decides what happened at a moment after the moment.

Eagleman later argued that the brain waits about 80 ms for its slowest signals, which puts perception at least that far behind reality. The chart is careful to say that this is a minimum, that other estimates of the time to awareness run from 100 to 500 ms, and that why flash-lag happens is still argued over. Krekelberg and Lappe reviewed the debate in 2001, and it is not settled.

## The demo

The flash-lag panel has three controls: Play (which becomes Pause, and Play again after a freeze), Speed, with slow, medium and fast, and On the flash, with keep going and freeze. The flash is drawn on exactly the frame the moving dot passes the middle, so the two are aligned to within one frame. If you see a gap, the gap is yours.

## The timings, to scale

The second part of the chart is every timing on one linear millisecond axis, so the proportions are true. Rows are coloured by kind: machine, brain, and the whole person. Hover or tap a row for what it is and where it comes from.

The machine rows are computed. One frame at 60 Hz is 16.7 ms. A typical keypress reaches the glass in about 44 ms, which is the sum of the twelve hops in [How a keypress becomes a pixel](/blog/keypress) at that chart's default settings. A Display refresh switch (60, 120, 144 and 240 Hz) moves both rows, because the frame is part of the keypress.

The brain rows are from studies. In anaesthetised macaques shown flashes, the first responses reach the fast pathway of the thalamus about 33 ms after light hits the retina, and primary visual cortex at about 66 ms on average. In people, the biggest, most reliable EEG wave to a reversing checkerboard, the P100, peaks at about 100 ms. Photos flashed for 20 ms are told apart, animal from no animal, in the brain's responses by about 150 ms.

And then the row that every interface designer has met: about 0.1 s is the limit for a response to feel instantaneous, from Nielsen in 1993, restating Miller in 1968. The chart puts it on the same axis as the brain, and notes that it is a usability threshold, not a perceptual one.

## The screen is quicker than the now

This is the fact that made me want to build it. A frame at 60 Hz is 16.7 ms and a typical keypress reaches the glass in about 44 ms. The brain's own present runs at least 80 ms behind the world, by Eagleman's estimate. The screen is quicker than the now it is drawn for.

Which makes the first row strange. On a touchscreen built to respond in 1 ms, people dragging an object could feel as little as 2 to 11 ms of added lag, about 6 ms on average (Ng and colleagues, 2012). Your sense of now lags by tens of milliseconds, and yet you can feel a few milliseconds between your finger and the thing it moves.

The chart offers one reading, and I think it is the right one: delay you share with the world goes unnoticed, because everything you perceive is late by the same amount. Delay between you and your tool is a difference you can compare directly. Tapping is much more forgiving: in the same group's later work, people could not tell 1 ms from about 64 ms on touch-down.

## Measure yours

The last part is a reaction test. Press to start, then press again (space, Enter or a tap) the moment the panel turns dark. It waits a random one and a half to three and a half seconds so you cannot anticipate it. It keeps your last five tries and shows the median, which then appears on the timeline above as its own row, sorted in with everything else.

I am not going to tell you what to expect, because the number is not only you. The clock starts in the animation frame where the panel changes and stops at the input event's timestamp, so it includes part of your display's latency and all of your input device's. That is deliberate. Your result lands on the chart beside the parts it is made of.

For comparison, the chart has two published figures. In a lab, simple reaction time to a light averages 213 ms once the test hardware's own delay is removed (Woods and colleagues, 2015). Online, across over 81 million clicks on Human Benchmark through people's own machines, the median is 273 ms. The 60 ms between them is about the size of a keypress-to-screen pipeline. Not a controlled comparison, as the chart says, but a suggestive one.

## What it does not do

The brain timings are averages from studies with wide spreads between people, tasks and methods. The macaque latencies are from anaesthetised animals shown flashes, and human latencies run longer. The Model Human Processor row is an engineering model from 1983, not a measurement of a brain.

The 44 ms keypress is typical figures added up, not a measurement of your machine. Dan Luu's end-to-end measurements of real machines from 2014 to 2017 ranged from 50 to 200 ms, and that range is on the chart too.

Your reaction time is one person on one machine, a handful of tries, with your hardware inside it. Nothing is stored or sent; the result stays in the page. And the demo is a demo: Michael Bach's Optical Illusions and Visual Phenomena has a fuller one.

Play the dot, then freeze it: [labs.sammii.dev/charts/now](https://labs.sammii.dev/charts/now/?focus=postdiction).

## Sources

- MacKay, Nature 181:507 (1958).
- Nijhawan, Motion extrapolation in catching, Nature 370:256 (1994).
- Eagleman and Sejnowski, Motion integration and postdiction in visual awareness, Science 287:2036 (2000).
- Krekelberg and Lappe, Trends in Neurosciences 24:335 (2001).
- Eagleman (2010), in Space and Time in Perception and Action, Cambridge University Press.
- Schmolesky et al. (1998), J Neurophysiol 79:3272.
- Culham (1998), Trends Cogn Sci 2:473.
- ISCEV standard for clinical visual evoked potentials, 2025 update, Doc Ophthalmol 151:97.
- Nielsen (1993), Usability Engineering.
- Miller (1968), AFIPS Fall Joint Computer Conference 33:267.
- Card, Moran and Newell (1983), The Psychology of Human-Computer Interaction.
- Thorpe, Fize and Marlot (1996), Nature 381:520.
- Luu (2017), Computer latency: 1977 to 2017, danluu.com.
- Woods, Wyma, Yund, Herron and Reed (2015), Front Hum Neurosci 9:131.
- Human Benchmark, Reaction Time Test statistics, read 19 October 2026.
- Ng, Lepinski, Wigdor, Sanders and Dietz (2012), UIST.
- Jota, Ng, Dietz and Wigdor (2013), CHI.
- Ng et al. (2014), CHI.
- Michael Bach, Optical Illusions and Visual Phenomena.
- How a keypress becomes a pixel, [labs.sammii.dev/charts/keypress](https://labs.sammii.dev/charts/keypress/).
