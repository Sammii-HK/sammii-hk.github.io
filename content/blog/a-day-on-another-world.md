---
title: "A day on another world"
slug: "a-day-on-another-world"
description: "Move the light from dawn to dusk on twelve planets and moons, and see why an honest sky study has to say what it is not calculating."
date: '2026-11-25T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - planetary-science
  - design-engineering
interactiveLab: "surfaces"
---

# A day on another world

The Sun is low over a Martian horizon. The sky is warm and dusty, except for a small patch of blue right around the Sun itself.

Switch to the Moon and drag the light to noon. The Sun climbs, the ground brightens, and the sky stays black. As the scene's note puts it, the Moon's exceedingly thin exosphere cannot make an Earth-like daylight sky.

*A day on another world* keeps the viewpoint and the interaction the same and changes the world around you. It is a set of twelve painted sky studies, informed by NASA descriptions, with one control for moving through daylight. It is also a piece that has to be careful about its own title, because it does not calculate the length of a day anywhere.

## Start at a Martian dusk

<InteractiveExploration slug="day-on-another-world" />

[Open the full planetary skies exploration](https://labs.sammii.dev/explorations/day-on-another-world/).

*Interactive: start on Mars at **Dusk**, then use **Explore a world** to switch to the Moon, Venus and Jupiter without moving the light.*

The view opens on Mars near the end of its daylight phase. **Explore a world** lists twelve bodies in three groups: rocky planets, gas and ice giants, and moons and dwarf planets. The **Move through daylight** slider runs from dawn to dusk, and three buttons, **Dawn**, **Noon** and **Dusk**, jump to fixed points along it.

As you move the slider, the label beside it changes through **Dawn**, **Morning**, **Noon**, **Afternoon** and **Dusk**. Below the controls, a short note describes the selected world's sky or surface, and a link, **Read the observations behind this world**, opens the NASA page the scene draws on.

## Four kinds of sky

The twelve scenes fall into a few distinct treatments, and switching between them is the most useful thing to do with the piece.

**Mars keeps its blue close to the Sun.** The scene's note explains that fine dust can create a blue glow near the setting Sun while the rest of the sky stays warmer. The code reflects that: on Mars the glow is drawn small and grows towards twilight, instead of washing across the whole sky. NASA's [Mars facts](https://science.nasa.gov/mars/facts/) and its piece on [sunsets on other worlds](https://www.nasa.gov/solar-system/nasa-scientist-simulates-sunsets-on-other-worlds/) are among the sources the exploration lists.

**Venus and Titan have no visible Sun.** Venus's dense cloud cover turns the view into diffuse ochre light. Titan's organic haze softens the light over dunes and lakes of liquid methane and ethane. In both, the Sun is drawn as a broad glow without a sharp disc. [NASA's Titan facts](https://science.nasa.gov/saturn/moons/titan/facts/) are the listed source for Titan; the scene note also says that Titan's water is largely frozen into the ground.

**Mercury, the Moon and Europa keep black skies.** These worlds have only a tenuous exosphere or an extremely thin atmosphere, so the scenes do not borrow an Earth-like sunset. Drag through the whole range on the Moon and only the Sun's position, the brightness of the ground and the crater highlights change.

**The giant planets have no ground at all.** Jupiter, Saturn, Uranus and Neptune are cloud-only scenes, labelled on the canvas as **ATMOSPHERIC VIEWPOINT · NO SOLID SURFACE**. There are no mountains, soil or floor, and no invented horizon line pretending to be land. Every foreground layer is cloud.

## How one slider lights twelve worlds

The slider is a single number between 0 and 1. The code turns it into a solar altitude with a sine curve, so it is highest at the midpoint, and derives a twilight factor from how low the Sun is. That factor blends each world's daytime colours into its dusk colours. The same calculation runs for every world; what differs is each world's palette, whether it draws a solar disc and whether it has any atmospheric glow at all.

That is why the comparison works. The interaction is identical, so the differences you see come from the scene descriptions, not from a different control on each world.

## What the colours are

They are artistic choices. The provenance notes say so directly and list them: the hex colours, terrain, Sun arc, glow size, exposure and brightness. This is a stylised atmosphere and lighting study, not NASA's radiative-transfer simulation and not a calibrated photograph.

A few decisions are worth naming because they push against a familiar picture:

- Neptune's palette avoids the strongly enhanced blue of some processed Voyager imagery. It is still an artistic palette.
- Saturn's rings are left out of its local sky, because their appearance depends on where you are and the season. They appear, stylised, in the related interior cutaways instead.
- The Sun's size is not a measured angular size.
- Generated terrain does not imply any particular location. Europa's ridges and Pluto's glaciers are original schematic terrain.

## What "a day" does not mean here

The control is a normalised dawn-to-dusk phase. It is not hours. It does not calculate the length of a planetary day, latitude, season, horizon direction or atmospheric density.

So the piece cannot tell you how long a Martian afternoon lasts, or what the sky would look like at a particular place and time. Mercury's unusual apparent solar motion is not simulated. Uranus's extreme seasons are not simulated. Every world gets the same tidy arc from one side of the frame to the other, because the arc is a way of moving the light, not a model of the Sun's path.

I kept the title anyway, because it describes the experience well: pick a world and stay for its daylight. The limits are what make that experience honest. The scene notes, the line under the scene and the in-page **Model & sources** panel all repeat them, so a reader moving quickly is less likely to mistake a painting for a measurement.

## Try the same moment everywhere

Press **Dusk**, then step through all twelve worlds without touching the slider. The same lighting phase gives a local blue halo, a diffuse ochre wash, a black sky over grey ground, and a cloud deck with nothing underneath. That contrast is the reason the piece exists.

## Sources

- NASA, [*Sunsets on Other Worlds*](https://www.nasa.gov/solar-system/nasa-scientist-simulates-sunsets-on-other-worlds/) (22 June 2020).
- NASA Science, [*Mars Facts*](https://science.nasa.gov/mars/facts/).
- NASA Science, [*Titan Facts*](https://science.nasa.gov/saturn/moons/titan/facts/).
- The interactive's own **Model & sources** panel also links NASA's facts pages for Mercury, Venus, the Moon, Europa, Pluto, Jupiter, Saturn, Uranus and Neptune, and NASA's [*Sunrises and Sunsets on Mars*](https://science.nasa.gov/solar-system/planets/mars/what-does-a-sunrise-sunset-look-like-on-mars/).
