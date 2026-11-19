---
title: "Step outside the pattern"
slug: "step-outside-the-pattern"
description: "Move sideways from Earth and watch the Big Dipper lose its shape, using seven stars, their Hipparcos parallaxes and an honest account of what those distances can support."
date: '2026-12-16T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - astronomy
  - design-engineering
interactiveLab: "depth"
---

# Step outside the pattern

From Earth, the Big Dipper is a flat shape: four stars for the bowl, three for the handle. Move the viewpoint a few light-years to one side and the stars begin to slide against each other. Keep going and the stars pull away from the dashed outline of the shape you started with.

The pattern only works from one place. *Step outside the pattern* takes seven familiar stars, places them at their measured distances, and lets you walk the viewpoint away from Earth to see the depth the flat shape was hiding.

## Take a step sideways

<InteractiveExploration slug="big-dipper-in-3d" />

[Open the full Big Dipper in 3D exploration](https://labs.sammii.dev/explorations/big-dipper-in-3d/).

*Interactive: keep **Compare Earth's pattern** ticked and drag **Distance travelled sideways from Earth** slowly from 0 to 60 light-years. Watch the small **Travel path · top view** inset as you go, then choose **Dubhe** and **Mizar** in turn.*

The slider moves you from 0 to 60 light-years in steps of a tenth of a light-year. The caption changes from **View from Earth** to **View from a new position** as soon as you leave. **Return to Earth** brings you back, and **Star names** turns the labels on and off.

Two things stay fixed while you move. The camera keeps pointing at the centre of the seven-star sample, so the group never drifts out of view. And the angular scale of the projection does not change, so the dashed Earth outline remains a fair comparison with the moved pattern.

The inset in the corner is a top-down sketch of the journey. Earth is a point, the seven stars are dots at their distances, and a copper line shows how far you have gone. It is a projection onto one plane, not a full three-dimensional map.

## The stars that are not where they look

Pick a star with the buttons under the canvas and its readout gives two distances: one from Earth and one from your current viewpoint.

At the start, five of the seven sit at similar distances. Mizar is 78.2 light-years away, Merak 79.4, Alioth 80.9, Megrez 81.4 and Phecda 83.7. The other two are farther out: Alkaid at 100.7 light-years and Dubhe, at the corner of the bowl, at 123.6.

That spread is what the sideways step exposes. Nearby and distant stars shift by different amounts when you move, so Dubhe, roughly half as far again as the other bowl stars, does not keep pace with them. At the full 60 light-years, the readout puts Dubhe 145.5 light-years from your new position and Mizar 90.7.

## From a parallax to a position

The data comes from the original 1997 Hipparcos Main Catalogue, at epoch J1991.25. Each star has a right ascension, a declination and a trigonometric parallax measured in milliarcseconds. The exploration turns the parallax into a distance with:

**d (parsecs) = 1000 / parallax (milliarcseconds)**

and converts parsecs into light-years at 3.261563777 light-years per parsec. Distance and direction together give each star a position in three dimensions. The observer starts at the origin and moves in a straight line along the initial camera's east direction. Every frame then projects the stars from wherever you are.

The journey is sideways on purpose. It is not a trip to a named star, and the chosen path never passes through one. If it did, the direction to that star would be undefined. The model guards that case and stars behind the camera are simply hidden, rather than allowing an infinite position on the screen.

## How sure are the distances?

The readout shows the uncertainty rather than hiding it. Choose **Dubhe** and the detail line gives its catalogue parallax, 26.38 ± 0.53 milliarcseconds. Inverting those one-standard-error limits gives a distance range from 121.2 to 126.2 light-years from Earth.

That range is an illustration of the catalogue uncertainty, not a modern probabilistic distance estimate. It is a useful reminder that the depth you see when you move is built from measurements with error bars, not from exact positions.

These seven were chosen because their parallaxes are high-significance measurements. In the wider constellation views of the same catalogue, 67 stars have parallaxes too weak to support a confident distance, and those views decline to give one. A three-dimensional reconstruction from those weaker values would look just as convincing on screen and be far less trustworthy. Keeping this view to seven stars is a deliberate limit.

## What this is not

This is a focused geometric study of seven stars, not an all-sky map and not a spacecraft simulation.

The geometry is static. The stars do not move during your journey, and there is no correction for light travel time. There is no relativistic aberration or Doppler shift, no recalculation of dust or extinction, and no stellar evolution. Apparent brightness is not recalculated for the new viewpoint, so point sizes stay presentation choices. Earth and the observer are ideal points, and a star shown as a single point may be a multiple system.

The lines are the familiar Big Dipper guide, a visual convention rather than a physical connection between the stars.

Drag the slider slowly and stop at the point where you would no longer call the shape a dipper. Wherever that is for you, it is the moment the constellation stops being a thing in the sky and becomes a view from somewhere.

## Sources

- NASA HEASARC, [*Hipparcos catalogue*](https://heasarc.gsfc.nasa.gov/w3browse/star-catalog/hipparcos.html), for field definitions, units and provenance.
- ESA, [*Hipparcos catalogue fields*](https://hipparcos-tools.cosmos.esa.int/pstex/sect2_01.pdf), for the definitions of position, parallax and parallax standard error.
- Star values: ESA (1997), *The Hipparcos and Tycho Catalogues*, ESA SP-1200, with each star's original ESA record linked from its readout.
