---
title: "Worlds in time"
slug: "worlds-in-time"
description: "Grow a synthetic planet or moon through impacts, cooling and surface renewal, change one condition, and see how much of the history is really calculated."
date: '2027-01-21T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - planetary-science
  - design-engineering
interactiveLab: "evolution"
---

# Worlds in time

A yellow moon fills the view. As its history plays, patches of it keep changing: new material spreads, fills low ground and buries the bowls and rims of older craters.

Now take away the tidal heat that drives it and run the same history again. The starting terrain is identical. The **Impact events** count is identical, because the impacts arrive in the same places. What changes is how much of the surface keeps being renewed.

*Worlds in Time* is a numerical surface-process model wrapped around a rotatable globe. You choose one of eight worlds, set four conditions, and the model calculates a history of impacts, deposition, slow relaxation of relief and cooling. Every position on the timeline is a stored state of that calculation, not an animation drawn to look like one.

## Run an experiment

<InteractiveExploration slug="planetary-surface-evolution" />

[Open the full Worlds in Time exploration](https://labs.sammii.dev/explorations/planetary-surface-evolution/).

*Interactive: choose Io from **Planet or moon**, play the history once, then set **Sustained tidal heat** to `0.0×`, press **Run these conditions** and play it again.*

That suggestion is the piece's own. On Io, Europa and Enceladus the **Try an experiment** panel asks whether the same world keeps renewing its surface once sustained tidal heat is switched off. On the other five worlds it asks you to turn surface renewal off and count how many more scars survive. On the Moon, which opens by default, the model deposits very little material at the default settings and terrain seed, so that second experiment shows only a small difference; Io makes the contrast much easier to see.

## The controls

**Planet or moon** offers Earth, the Moon, Mars, Mercury, Venus, Io, Europa and Enceladus. Under the menu, a line gives the terrain seed and the world's radius in kilometres.

**Change the forces** holds four sliders, each a multiplier from `0` to `3×`:

- **Impact frequency** scales the illustrative bombardment rate.
- **Surface renewal** scales volcanic or icy deposition.
- **Relief relaxation** scales the topographic diffusion coefficient.
- **Sustained tidal heat** keeps heating Io, Europa and Enceladus. For the other five worlds it reads **Not applied** and is disabled.

Moving a slider does not change anything straight away. **Run these conditions** recalculates the history. **Generate a different terrain** keeps the conditions and changes the starting surface, and **Restore this world's defaults** puts everything back.

The timeline runs from **Newly generated surface** to **4.5 billion model years**, with **Play**, a rewind button and playback at ½×, 1× or 3×. **See the world as** switches between **Surface & material**, **Elevation** and **Change since the start**. **Compare with start** splits the globe between the first snapshot and the selected time. **Place an impact** lets you tap the globe to add a crater of your own; with the globe focused, pressing I places one at its centre.

The readouts are model time, **Relative internal heat**, **Impact events** and **Recently changed surface**. Hovering over the globe gives the model elevation at that point in kilometres, with latitude and longitude. A small chart under the globe traces internal heat through the run.

## What is calculated

The provenance notes describe the model precisely, so it is worth following them.

The surface is a 128 × 64 equal-area grid in longitude and `μ = sin(latitude)`. Each cell holds a height in kilometres, a material value and a decaying activity value. The history is 180 steps over 4,500 model million years.

At each step, four things happen.

**Relief relaxes.** Height diffuses across the sphere using a conservative finite-volume scheme:

**∂h/∂t = κ/R² [∂μ((1 − μ²)∂μh) + ∂²λh/(1 − μ²)]**

where `h` is height, `κ` is the diffusion coefficient, `R` is the world's radius and `λ` is longitude. The solver takes small explicit substeps to stay stable, and no height flows out through the poles. Diffusion on its own preserves the mean height; impacts and deposition can change it.

**Impacts arrive.** Craters are a smooth bowl with a raised rim, at a synthetic rate that declines over time. The impact sequence comes from a fixed catalogue of candidates, and lower **Impact frequency** settings accept a subset of that same catalogue. Changing **Surface renewal** cannot change where the impacts fall. That is what makes the experiment above a fair comparison.

**Material is deposited.** Volcanic or icy deposits raise terrain and partly fill depressions nearby. A few rocky worlds also get a small prescribed uplift field. The notes are careful to say that this uplift is not plate tectonics.

**Activity cools.** Internal heat follows `dH/dt = −(H − Heq)/τ`, an exponential approach to an equilibrium value. Tidal heating raises that equilibrium for the three tidally heated moons. `H` is a dimensionless activity index, not a temperature.

## Your impact changes the future, not the past

When you place an impact, the model inserts it at the selected step and recalculates everything after it with the same seed. Earlier snapshots are left unchanged. Scrub back past the moment of your impact and the surface is exactly as it was; scrub forward and the new crater is part of the history, being softened and partly buried like any other.

The status line under the timeline reports the latest notable event, including **Your impact** when it is yours.

## Where the rates come from, and where they do not

The diffusion framework is related to work by C. I. Fassett and B. J. Thomson on crater degradation on the lunar maria, which supports diffusion as a first-order framework for how craters degrade. Their calibrated value for the examined lunar maria is about `5.5 m²/Myr`. This model does not use it. Its coefficients are deliberately accelerated so that change is visible on a coarse globe, and they must not be read as measured planetary diffusivities.

The world radii approximately match the named bodies, from Enceladus at `252.1 km` to Earth at `6,371 km`, using NASA fact sheets and body pages. Everything else, including the initial terrain, event rates, crater sizes and global textures, is a simplification chosen for the experiment.

## What it is not

The catalogue entry and the in-page notes both say this directly, and it bears repeating:

- The terrain is synthetic. Earth's continents are generated, not historical maps.
- The rates are accelerated and uncalibrated. Model years do not reconstruct the actual history or predict the future of these bodies.
- Internal heat is a dimensionless index, not a measured core temperature.
- The model omits plate tectonics, interior fluid dynamics, impact shock physics, atmosphere, climate and orbital tides.
- Colours, icy fracture lines, apparent oceans and molten areas are illustrative renderings of the model state.
- Enceladus's south-polar jets are not resolved by a whole-sphere model.
- **Recently changed surface** counts grid cells above a decaying activity threshold. It is a model statistic, not a measured resurfacing fraction.

The display also interpolates the coarse grid and exaggerates slopes so the relief can be read.

## Checking the model

The model's tests check that diffusion conserves height and stays within its bounds, that seeded histories are deterministic, that impacts genuinely alter the state, that snapshots before a user impact are unchanged, that late tidal heating behaves as expected, that switching a process off really removes it, that all eight presets produce finite histories, and that sampling works at the poles and across the longitude seam. Those tests support the claim that the globe shows what the model calculated. They cannot make the model a reconstruction of any real world.

## Place one impact and watch it age

Go back to Io with its default conditions. Scrub to early in the history, press **Place an impact** and tap the globe. Then play forward with **See the world as** set to **Change since the start**. Your crater arrives, relief relaxation starts to soften it, and later deposits can bury parts of it as they renew the surface around it. Scrub back before it and it was never there.

## Sources

- C. I. Fassett and B. J. Thomson, [*Crater degradation on the lunar maria: Topographic diffusion and the rate of erosion on the Moon*](https://doi.org/10.1002/2014JE004698), *Journal of Geophysical Research: Planets* (2014).
- NASA Science, [*Moon Formation*](https://science.nasa.gov/moon/formation/).
- NASA Science, [*Io*](https://science.nasa.gov/jupiter/jupiter-moons/io/).
- NASA Science, [*Europa Facts*](https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/).
- NASA Science, [*Enceladus*](https://science.nasa.gov/saturn/moons/enceladus/).
- NASA / NSSDCA, [*Planetary Fact Sheet*](https://nssdc.gsfc.nasa.gov/planetary/factsheet/), for approximate radii.
