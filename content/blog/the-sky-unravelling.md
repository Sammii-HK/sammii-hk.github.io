---
title: "The sky unravelling"
slug: "the-sky-unravelling"
description: "Scrub a constellation a hundred thousand years forward or back, watch measured proper motions pull its stars apart, and see where a linear model stops being trustworthy."
date: '2026-12-22T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - astronomy
  - design-engineering
interactiveLab: "time"
---

# The sky unravelling

Press **Play time** and Orion holds together for a moment. Then one star starts to drift, leaving a pale trail. The dashed outline of the original pattern stays where it was, and the lines between the moving stars stretch into a shape nobody would name.

Constellations feel permanent because a human lifetime is short. *The sky unravelling* stretches the timeline far enough for the measured motions of individual stars to add up, and keeps the starting pattern on screen so you can see how far they have gone.

## Let the pattern loosen

<InteractiveExploration slug="constellations-through-time" />

[Open the full constellations through time exploration](https://labs.sammii.dev/explorations/constellations-through-time/).

*Interactive: keep **Original pattern** and **Motion trails** ticked, then press **Play time**. Pause, choose **Fit current + original** to bring every star back into frame, and pick a star from **Inspect a star**.*

The main slider is labelled **Years from catalogue epoch J1991.25**. It runs from minus 100,000 to plus 100,000 years in steps of 250. **Play time** advances 12,000 model years for each second of playback; **Return to 1991.25** puts everything back.

**Selected constellation** lets you switch to any of the 88 modern figures, and **Find a constellation** narrows the list. Choosing a new one resets the clock and the zoom. The **View** buttons switch between **Lines** and **Stars**, and **Star names** turns the labels on or off.

The camera does not chase the stars. Each constellation has a fixed viewing direction with east to the left and north up, so a star moving out of frame really does leave. When that happens, a note under the canvas counts the stars that have gone. The **−** and **+** buttons zoom by hand, and **Fit current + original** frames both the moved pattern and the starting one.

## Why the start is not "today"

The starting point is labelled **CATALOGUE EPOCH J1991.25**, never "now". That is the epoch of the source: the original 1997 Hipparcos Main Catalogue from ESA. Its positions are given for 1991.25, and the exploration does not pretend they describe tonight's sky.

The sample covers 756 stars across the 88 constellations, each with a measured position and proper motion. Proper motion is the rate at which a star shifts across the sky, measured here in milliarcseconds per year. A milliarcsecond is a thousandth of a second of arc, so these are tiny numbers. Only the timescale makes them visible.

Open **Inspect a star** with Orion selected and the contrast is immediate. Rigel, the brightest star in the figure by catalogue magnitude, has a measured proper motion of 2.0 milliarcseconds per year. Tabit, in the same constellation, has 463.6. Over the full slider, Rigel barely moves. Tabit travels more than 12 degrees in this model, so its trail is by far the longest.

## From a rate to a position

Each star starts as a unit direction from its right ascension `α` and declination `δ`:

**r = [cos δ cos α, cos δ sin α, sin δ]**

Its two proper-motion components point along the local east and north directions on the sky. The exploration converts them from milliarcseconds per year into radians per year, combines them into a single sideways vector `v`, and then moves the star with:

**direction(Δt) = normalise(r + Δt v)**

where `Δt` is the number of years from J1991.25. That is a linear model. The star keeps moving in the direction it was measured moving, at the rate it was measured moving, with no radial component, and the result is projected back onto the sphere.

There is one detail the notes are careful about. The catalogue's right-ascension motion, written `μRA*`, already includes the factor of `cos δ`. The model does not divide by it a second time. Using the local east vector directly also keeps the calculation finite at the poles.

## What the readouts will and will not say

Every inspected star shows its catalogue position, both proper-motion components, its parallax with its uncertainty, and its V magnitude, along with a link to its original ESA record.

A distance is a different matter. The readout offers an approximate distance only when the parallax is at least five times its reported error. Rigel's parallax, 4.22 ± 0.81 milliarcseconds, clears that bar, and the readout gives roughly 772.9 light-years by inverting it. Betelgeuse's parallax, 7.63 ± 1.64, does not, so its readout says the distance is poorly constrained by this historical parallax. In the full sample, 67 measurements fall below that threshold. One of them is a negative parallax, and that star gets no distance at all.

There is also one star the model cannot move. Alula Australis, in Ursa Major, has no astrometric solution in the original catalogue. Its cells are blank, so it is omitted with its one connecting segment, and the Ursa Major description says so. Giving it zero motion would have made it look like the steadiest star in the sky.

## How far to trust a hundred thousand years

Not very far, and the exploration says so. The long range is illustrative. It is not an accurate long-term ephemeris.

The model leaves out radial velocity. It leaves out the pull of the Galaxy, stellar encounters and the orbits of binary stars. It ignores the precession of Earth's axis, changes in brightness, and stars being born or dying. The source uncertainties are not propagated into position ellipses either. The notes put it plainly: long extrapolations can be materially wrong.

ESA's own explainer on the future of Orion makes a similar point about its animation, which also leaves out births and deaths. What this exploration offers is a measured-data illustration of accumulating proper motion, not a forecast of the future sky.

The lines between them are a drawing convention, not physical links. Leave **Original pattern** on, scrub to either end of the slider and then back to 1991.25. The dashed outline was only ever one moment.

## Sources

- NASA HEASARC, [*Hipparcos catalogue*](https://heasarc.gsfc.nasa.gov/w3browse/star-catalog/hipparcos.html), for field definitions, units and provenance.
- CDS VizieR, [*Original Hipparcos catalogue*, I/239](https://vizier.cds.unistra.fr/viz-bin/VizieR-3?-source=I%2F239), for the original measured positions, proper motions and parallaxes.
- ESA, [*The future of the Orion constellation*](https://www.esa.int/articles/about-us/directorates/science/gaia/the-future-of-the-orion-constellation), for an illustrated explanation of how an asterism changes.
- Olaf Frohn, [*D3 Celestial*](https://github.com/ofrohn/d3-celestial), for the constellation line topology, used under its BSD 3-Clause licence.
