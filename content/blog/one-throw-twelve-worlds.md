---
title: "One throw, twelve worlds"
slug: "one-throw-twelve-worlds"
description: "Throw the same ball on Earth and the Moon with one shared clock and one metre scale, and see which differences really come from gravity."
date: '2026-12-10T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - planetary-science
  - design-engineering
interactiveLab: "gravity"
---

# One throw, twelve worlds

Two balls leave the ground together, at the same speed and the same angle. One lands in under two seconds and stops. The other is still climbing.

Nothing about the throw is different. The first ball is on Earth and the second is on the Moon, and the only number that changed between them is the downward acceleration. *The gravity room* is built to keep everything else fixed so that you can see that one change clearly: the same launch, the same clock and the same metre scale on both axes, across twelve planets, moons and dwarf planets.

## Watch the Moon outlast Earth

<InteractiveExploration slug="gravity-on-other-worlds" />

[Open the full gravity comparison](https://labs.sammii.dev/explorations/gravity-on-other-worlds/).

*Interactive: leave the Moon selected with **Selected + Earth**, press **▶ Play**, then drag **Scrub elapsed time** back to the moment Earth's ball lands.*

The view starts paused at the default launch: `12.0 m/s` at `45°`. Three readouts sit above the chart for the selected world: **Gravity**, **Range** and **Flight time**. For the Moon they read `1.6 m/s²`, `90.0 m` and `10.61 s`. Switch to Earth and they become `9.8 m/s²`, `14.7 m` and `1.73 s`.

When Earth's ball reaches the ground it stays at its endpoint. The clock keeps running for the Moon's ball, which needs the rest of its ten and a half seconds. Leaving the landed ball in place is a small decision with a large effect: a short flight and a long one remain comparable at every moment, instead of one curve disappearing.

## The controls

- **Explore a world** chooses the selected world from three groups: rocky planets, gas and ice giants, and moons and dwarf planets.
- **Compare** sets what else is drawn: **Selected + Earth**, **Rocky planets + selected** or **All 12 worlds**.
- **Launch speed** runs from `4` to `25 m/s`, and **Launch angle** from `10°` to `80°` above horizontal. Changing either one rewinds the flight.
- **▶ Play**, **↻ Replay** and **Rewind** control the shared clock, and **Playback** offers ¼×, 1× and 2×.
- **Scrub elapsed time** moves every ball to the same moment.

Hover over the chart to inspect the selected arc: the tooltip gives the time, **Distance**, **Height** and **Vertical speed**, or says the ball is **At the reference plane**. Tapping the chart moves the shared clock to that point. With the chart focused, the arrow keys step by `0.1 s` (`1 s` with Shift), Home and End jump to the start and end of the comparison, Space or Enter plays and pauses, and Escape clears the inspection.

Below the chart, **Compare all 12 worlds numerically** opens a table with gravity, range and flight time for every world at the current launch.

## Two worlds that draw one curve

Choose **Rocky planets + selected** with the Moon still selected. That is five worlds, but only four arcs. Mercury and Mars both use `3.7 m/s²` in this model, so their paths coincide. At the default launch each gives `38.9 m` in `4.59 s`.

That overlap is a useful check on the drawing. Two very different planets, one curve: the comparison is responding only to the acceleration it was given.

At the other extremes, Jupiter's `23.1 m/s²` gives a range of `6.2 m` and a flight of `0.73 s`. Pluto's `0.62 m/s²` gives `232.3 m` and `27.37 s`. In **All 12 worlds**, Pluto sets the size of the plot and the length of the shared clock.

## The equations

The model uses the exact no-drag solution for a projectile under constant downward acceleration, as set out in [NASA Glenn's ballistic flight equations](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ballistic-flight-equations/):

**x = vx₀ t**

**y = h₀ + vy₀ t − ½ g t²**

**flight time = (vy₀ + √(vy₀² + 2 g h₀)) / g**

The launch height `h₀` is zero here. Because the solution is analytic, any point on the clock can be calculated directly, which is why scrubbing backwards is as reliable as playing forwards.

The chart fits whatever set of worlds you are comparing, but it never gives two curves different scales. Height and distance share one metre scale, and every ball shares one elapsed time. **Playback** changes how quickly you watch; it never changes the physics.

## Where the gravity values come from

Most values come from the [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/), metric version, revised 18 March 2025. Europa (`1.31`), Titan (`1.35`) and Pluto (`0.62 m/s²`) come from [NASA's Solar System Small Worlds Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/galileanfact_table.html).

Two details are easy to miss. First, NASA's [fact sheet notes](https://nssdc.gsfc.nasa.gov/planetary/factsheet/planetfact_notes.html) define the planetary values as equatorial effective gravity, which includes the local reduction caused by rotation. The model uses those effective values as given; it does not calculate rotation separately.

Second, Pluto's sources disagree. The Small Worlds sheet and the [detailed Pluto fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/plutofact.html) both give `0.62`, while the metric summary lists `0.7`. The model uses `0.62`, and the interface says so in its notes rather than quietly rounding one into the other.

## Giant planets have nowhere to land

Jupiter, Saturn, Uranus and Neptune are marked with a dagger in the table. Their values refer to a reference level of 1 bar in the atmosphere. There is no solid surface there. Select one and the note under the controls says the baseline is an imaginary reference plane.

So the Jupiter arc is not a throw from the ground. It is the same vacuum calculation run at a level of the atmosphere, with an invented floor to stop the ball. That makes it a fair comparison of the acceleration, and nothing more.

## What this leaves out

- **Air.** Every world is a vacuum comparison, including Earth, Venus and Titan. Drag and wind are omitted.
- **Terrain and bounce.** The ball stops at a flat reference plane.
- **Curvature and Coriolis deflection.** The acceleration is constant over a short, flat path.
- **The giant planets' surfaces**, which do not exist. Their baseline is imaginary.

These omissions are what make the comparison clean, and they are also why it should not be read as a forecast of a real throw on Venus or Titan. The view isolates gravity because that is the only variable it is designed to explain.

## Checking the comparison

The world module's tests cover the trajectory equations independently, ground contact, SI units, all twelve sourced gravity values and their reference levels, and the common clock before and after landing. They also check that the all-world view's domain is calculated across every compared world, which is how Pluto ends up setting it. Those checks support the numbers inside the model's stated assumptions. They do not add air or terrain to it.

Try one last comparison. Select Pluto, choose **All 12 worlds** and press **▶ Play**. Every other ball lands before Pluto's reaches the top of its arc. It is the same throw.

## Sources

- NASA / NSSDCA, [*Planetary Fact Sheet, metric*](https://nssdc.gsfc.nasa.gov/planetary/factsheet/), revised 18 March 2025.
- NASA / NSSDCA, [*Fact Sheet Notes*](https://nssdc.gsfc.nasa.gov/planetary/factsheet/planetfact_notes.html), for equatorial effective gravity and the 1 bar reference level.
- NASA / NSSDCA, [*Solar System Small Worlds Fact Sheet*](https://nssdc.gsfc.nasa.gov/planetary/factsheet/galileanfact_table.html), for Europa, Titan and Pluto.
- NASA / NSSDCA, [*Detailed Pluto Fact Sheet*](https://nssdc.gsfc.nasa.gov/planetary/factsheet/plutofact.html), as a cross-check on Pluto's value.
- NASA Glenn Research Center, [*Ballistic Flight Equations*](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ballistic-flight-equations/).
