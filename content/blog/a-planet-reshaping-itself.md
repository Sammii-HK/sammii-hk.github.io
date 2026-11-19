---
title: "A planet reshaping itself"
slug: "a-planet-reshaping-itself"
description: "Open an ocean, build a volcanic arc and offset a river across a fault, and see why a process illustration should not pretend to be a map of the past."
date: '2026-12-01T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - geology
  - design-engineering
interactiveLab: "past-earth"
---

# A planet reshaping itself

A blue river runs across a landscape seen from above. A fault cuts through the middle. Drag a slider and the two halves of the land slide in opposite directions. The river is still there, but it no longer lines up with itself.

Nothing was added and nothing was taken away. The landscape simply records how far the two sides have moved.

*A planet reshaping itself* is three short illustrated sequences, one for each broad kind of plate boundary, driven by the same progress control. The point is comparison: pull a landscape apart, push it together or slide it sideways, and look at the different shapes each motion leaves behind.

## Three ways to move a plate

<InteractiveExploration slug="plate-tectonics" />

[Open the full plate tectonics exploration](https://labs.sammii.dev/explorations/plate-tectonics/).

*Interactive: choose **Offset the land**, then drag **Scrub the process** slowly from left to right and follow the river.*

Three buttons choose the sequence: **Open an ocean**, **Build an arc** and **Offset the land**. **▶ Play sequence** runs the current one on to the end, **Rewind** returns it to the beginning, and **Scrub the process** lets you stop anywhere. The slider's readout is a percentage, such as **35% through sequence**, not a date.

Each sequence has three stages, and the heading and explanation below the drawing change as you pass through them. The corner of the canvas says whether you are looking at a **Cross-section** or a **Plan view**, and the other corner always says **Schematic**.

## Open an ocean

The view starts here. Two plates pull apart under arrows pointing outwards. The stages are **Stretching crust**, **Opening a basin** and **An ocean is growing**.

As progress increases, the gap between the plates widens and its floor deepens. Water enters the basin, and the caption changes from **A widening rift** to **New crust at the spreading centre**. The explanation for the first stage adds a detail that is easy to get wrong in a drawing: rising mantle can partially melt as pressure falls. The provenance notes are explicit that the mantle is predominantly solid, with local partial melting, so the coloured rising material marks melt generation rather than a sea of liquid rock.

## Build an arc

Here an oceanic plate meets a continental margin. The stages are **A plate bends downward**, **A slab sinks deeper** and **An arc rises**.

The descending slab lengthens as progress increases, and a volcanic arc grows on the overriding plate. The middle stage explains the connection: the slab carries water-bearing material to depth, and released water can help nearby mantle rock partially melt. The final stage includes a caveat in its own text: this is an ocean-continent subduction example, not every kind of plate collision.

## Offset the land

This is the only plan view, looking down on the surface. The stages are **Matching landmarks**, **The river is offset** and **A longer displacement**.

A river and bands of rock begin continuous across the boundary. As the plates slide, both are offset in the same direction as the motion arrows. The last explanation is the cleanest statement of the difference between this boundary and the other two: the illustration adds no new crust and removes none at the fault.

## Progress is not time

The slider goes from 0 to 100% through a sequence. There is no conversion to years, distances, energy or a tectonic rate. The geometry grows in step with progress. That is a drawing choice, not a claim that plates move at a constant speed in any particular place.

That is the main limit of the piece, and it is stated in the line under the drawing, in the notes and in the catalogue entry. A rift that opens in twelve seconds of playback is an illustration of a process, not a forecast of one.

## Historical reference points

Below the drawing, an expandable panel called **Historical reference points** offers four markers: **≈ 300 Ma** (Pangea), **≈ 200 Ma** (A new ocean), **66 Ma** (A boundary) and **Today**. Each has a short paragraph. The panel opens with a reminder that these dates provide context and do not set the age of the process drawing.

The 66 Ma marker uses the International Commission on Stratigraphy's chart, version 2024/12, which places the boundary between the Cretaceous and the Paleogene at 66.0 million years ago. The Pangea marker describes land that now includes North America, Africa, South America and Europe forming part of Pangea roughly 300 to 200 million years ago; the notes list the USGS page *What was Pangea?* among the sources. Neither marker is a map.

## The feature that is not there

The original plan was more ambitious: choose a real place and see where it was in the past. The provenance notes record what happened. The documented GPlates reconstruction endpoints, and the service's own example, could not be retrieved with the tools available while the piece was built. No API output is bundled, and so no palaeocoordinates, coastlines or local historical geology are drawn.

The notes go further and set out what a proper replacement would need: outputs from a pinned GPlates model, with its dataset revision and anchor plate recorded, exact inputs and timestamps preserved, coordinate order and age ranges validated and raw responses checksummed. They also warn that the service's default model can change, so relying on an implicit default would not be enough. Even then, a reconstructed point alone would not justify drawing a historical coastline, climate or landscape around it.

I think that paragraph is the most valuable part of the documentation. It would have been easy to sketch a plausible ancient coastline and label it. Instead, the interactive does the part it can support, the processes, and leaves the part it cannot as a clearly described gap.

## What this does not show

- It does not reconstruct a real place, a historical coastline or local geology.
- Progress is a sequence, not elapsed geological time.
- The three boundaries are idealised. The convergent example is specifically oceanic plate beneath continent.
- The geometry is schematic, with no measured depths, widths or rates.

## Try the comparison

Play each sequence once, in order. One builds new crust, one carries crust down into the mantle, and one does neither and only moves the landmarks. The same slider drives all three, which is why the differences are so easy to see.

## Sources

- USGS, [*Plate Tectonics and Volcanism in Western California*](https://pubs.usgs.gov/fs/2025/3013/fs20253013.pdf) (2025).
- NASA Science, [*Earth Facts*](https://science.nasa.gov/earth/facts/).
- USGS, [*What was Pangea?*](https://www.usgs.gov/faqs/what-was-pangea), for the historical marker.
- International Commission on Stratigraphy, [*International Chronostratigraphic Chart*, version 2024/12](https://stratigraphy.org/ICSchart/ChronostratChart2024-12.pdf), for the 66.0 Ma boundary.
- EarthByte / GPlates, [*reconstruction model documentation*](https://gwsdoc.gplates.org/models/), for the reconstruction that was planned but not implemented.
