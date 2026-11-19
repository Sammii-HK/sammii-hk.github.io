---
title: "Beneath the surface"
slug: "beneath-the-surface"
description: "Open a cutaway into twelve planets and moons, and see how a diagram can separate what is well supported from what is still a possibility."
date: '2026-12-03T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - planetary-science
  - design-engineering
interactiveLab: "interiors"
---

# Beneath the surface

Open Earth and you find what most of us drew at school: a thin crust, a thick mantle, a liquid outer core and a solid centre.

Now open Jupiter. There is no crust. The outer edge is a reference level in the atmosphere, not a surface. The layers below do not meet at clean lines; they blur into one another. At the centre is not a ball but a **Dilute core region**, which the label describes as heavy material mixing with the surrounding fluid.

*Beneath the surface* is a set of twelve cutaway diagrams, built to compare very different kinds of world without pretending they are the same kind of object. The more interesting part is how it treats uncertainty: some layers are drawn as established, some as inferred and some are left out on purpose.

## Peel back a planet

<InteractiveExploration slug="inside-planets" />

[Open the full planet interiors exploration](https://labs.sammii.dev/explorations/inside-planets/).

*Interactive: start with Earth, drag **Open the cutaway** all the way, then switch to Jupiter and compare the edges between layers.*

The view opens on Earth with the cutaway at 74% and the **Rocky mantle** selected. **Explore a world** chooses one of twelve bodies, grouped into rocky planets, gas and ice giants, and moons and dwarf planets. **Open the cutaway** runs from 0% to 100% and the canvas shows the current value, for example **74% cutaway**.

Below the controls is a row of buttons, one per layer. Choosing one names it under the drawing and shows a short explanation. Further down, each world has a line of the processes that shape it, such as **Plate tectonics · volcanism · water and wind** for Earth, and a link, **Evidence & model context**, to the NASA page behind it.

## Three levels of confidence

The labels do most of the work. Read them side by side and a pattern appears.

**Strongly supported.** Europa has an **Inferred ocean** beneath its **Ice shell**. The layer note says strong evidence supports a salty global ocean, while its depth is not encoded in the diagram. [NASA's Europa facts](https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/) are the reference.

**One possible model.** Titan's second layer is called **Possible water-rich ocean**, and the note calls it one interpretation of Cassini data. The world summary says this is a possible layered model, not a uniquely established interior. It also separates the methane and ethane lakes on Titan's surface from the water-rich layers deeper down, which are a different thing entirely. See [NASA's Titan facts](https://science.nasa.gov/saturn/moons/titan/facts/).

**Not drawn.** Pluto has three layers: **Volatile-ice deposits**, a **Water-ice shell** and a **Rock-rich core**. There is no ocean layer. The summary says a surviving subsurface ocean is a possibility, not an established layer in this view, so the diagram does not give it a ring.

That third choice is the one I find most useful. A diagram that adds every plausible layer looks more complete and says less. Leaving the Pluto ocean out, and saying why, keeps the drawing honest.

## Giants without floors

The four giant planets are drawn differently from the rocky ones. Their layers are rendered as soft gradients rather than hard circles, because their transitions are gradual.

Jupiter's layers run **Atmosphere**, **Dense hydrogen fluid**, **Metallic hydrogen** and **Dilute core region**. The notes say pressure changes hydrogen into dense fluid and metallic states, that no sharp global liquid surface is implied, and that Juno supports a dilute core that blends into its surroundings. [NASA's Jupiter facts](https://science.nasa.gov/jupiter/jupiter-facts/) are the reference.

Uranus and Neptune each have a **Hot volatile-rich interior**. The notes are careful about the word "ice": in an ice giant it describes composition, water, ammonia and methane under high pressure, not ordinary frozen ice and not a cold liquid-water sea.

## A few rocky details

- **Earth** keeps the liquid outer core and solid inner core as separate layers, and the mantle note says the diagram does not turn the whole mantle into a liquid ocean.
- **Mercury** has a **Large metallic core** inside a comparatively thin rocky shell. Its process line mentions cooling and contraction, which the summary links to long surface scarps.
- **Venus** is shown with volcanism and crustal deformation, but without an Earth-style network of moving plates, because one is not established.
- **The Moon** has a **Small core region** that groups solid, liquid and partly molten sublayers for clarity.

## What the proportions mean

This is the limit to keep in mind while dragging. The layer sizes are drawing proportions, not measured thicknesses. A comment in the code says exactly that: the ratios are deliberate drawing choices, not estimated boundary radii.

Several things follow from that:

- Every world is drawn at the same display size, so a Pluto cutaway is as large as a Jupiter one.
- Crusts and ice shells are enlarged so you can see and inspect them.
- Fine sublayers are omitted.
- The cutaway percentage is the fraction of the drawing that is revealed. It is not a physical depth and not a volume of excavated rock.

So you can compare the order of layers, their names and how confident each one is. You cannot read the diagram to find how deep Europa's ocean is or how large Mercury's core is in kilometres. The diagrams are inferred, simplified models, not cross-section images.

Saturn's stylised rings appear here, in the global view, even though they are left out of the local sky scenes in the companion piece on daylight. A ring seen from far away is a reasonable thing to draw. A ring seen from inside the atmosphere depends on where you are.

## Compare three icy worlds

Choose Europa, open the cutaway fully and select **Inferred ocean**. Then choose Titan and select **Possible water-rich ocean**. Then Pluto, where there is no ocean layer to select. Three icy worlds, three different levels of evidence, and the labels tell you which is which.

## Sources

- NASA Science, [*Jupiter Facts*](https://science.nasa.gov/jupiter/jupiter-facts/).
- NASA Science, [*Europa Facts*](https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/).
- NASA Science, [*Titan Facts*](https://science.nasa.gov/saturn/moons/titan/facts/).
- The interactive's **Model & sources** panel also links NASA's facts pages for each of the other nine worlds, and each world's **Evidence & model context** link opens the relevant one.
