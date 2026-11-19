---
title: "One sky, many stories"
slug: "one-sky-many-stories"
description: "Switch a modern constellation between illustration, lines and bare stars, then read three separately attributed accounts of patterns in the sky."
date: '2026-12-08T09:00:00+00:00'
draft: false
status: "unpublished"
tags:
  - creative-coding
  - astronomy
  - design-engineering
interactiveLab: "stories"
---

# One sky, many stories

Orion opens as a drawing. A copper figure sits behind the stars, the familiar lines run between them, and a caption names the pattern. Switch to **Lines** and the figure goes. Switch to **Stars** and the lines go too. What remains is 23 measured stars with no shape attached to them.

Nothing about the stars changed between those three views. Only the drawing did. That is the idea behind *One sky, many stories*: a line between stars is a choice made by someone looking up, and the measured sky and the stories told about it are different kinds of thing.

## Start with the bare stars

<InteractiveExploration slug="constellations-and-sky-stories" />

[Open the full constellations and sky stories exploration](https://labs.sammii.dev/explorations/constellations-and-sky-stories/).

*Interactive: leave **Sky pattern / account** on **Modern constellations · all 88**, then switch the **View** from **Illustration** to **Lines** to **Stars**. Use **Find a constellation** to try another figure.*

The modern view covers all 88 constellations. The search box accepts a name or a figure, so typing "swan" or "bear" works as well as "Orion". A count underneath tells you how many of the 88 match. Below the drawing, a short line describes the selection: for Orion, 23 catalogue stars and 24 line segments.

Every bright point is a measured star you can inspect. Hover for a tooltip with its proper motion and distance note, or tap it or choose it from the **Inspect a star** list, and a readout gives its catalogue position, its proper motion, its parallax and a link to the original ESA record. The faint scatter behind them is decoration, and the canvas says so.

The star data is the original 1997 Hipparcos Main Catalogue from ESA, not Gaia and not the later 2007 reduction. Positions are given at the catalogue epoch, J1991.25. The constellation lines come from Olaf Frohn's D3 Celestial data, which the project uses only to identify which catalogue star sits at each end of each line. The rendered positions are the Hipparcos ones.

## A drawing is not the data

The **Illustration** view draws a contemporary figure for each of the 88 names. These are original procedural studies, built from a small set of shared shapes (a person, a beast, a bird, a fish, an instrument and so on) with individual details. They are interpretations of the modern names, not reproductions of historic star-atlas plates or of any culture's artwork.

The lines are a convention too. The description under each constellation calls them one modern line convention, and the sources panel adds that they are neither official IAU boundaries nor physical connections between stars.

One honest gap shows up in Ursa Major. The source topology includes a star called Alula Australis (HIP 55203), but the original catalogue has no astrometric solution for it: its position, parallax and motion cells are blank. Rather than guess a value, the exploration omits that star and its one connecting segment and says so in the Ursa Major description. The modern view therefore draws 742 of the source's 743 segments.

Distances get the same care. A readout only offers an approximate distance when the parallax is at least five times its reported error. Below that, it says the distance is poorly constrained by this historical parallax. One star in the sample has a negative measured parallax, and it gets no distance at all.

## Three accounts, each with a name attached

Now open **Sky pattern / account** and choose one of the other three options. The modern atlas is replaced by a separate view with its own drawing, its own text and its own source link.

Each account is kept specific. None is presented as the story every community tells, and none is a complete alternative catalogue of the sky. The exploration paraphrases only what its named source says.

**Matariki · Te Papa / regional Māori accounts.** Te Papa describes nine named stars in Matariki and acknowledges that some iwi recognise seven. The museum's account has developed with participating iwi and with the place in which the museum stands. The view lists the nine names in Te Papa's spelling: Matariki, Pōhutukawa, Tipuānuku, Tipuārangi, Waitī, Waitā, Waipunarangi, Ururangi and Hiwa-i-te-Rangi. It does not assign those names to individual points in the drawing, and it notes that the number recognised in an account is not a census of every physical star in the cluster.

**Seven Sisters · Greek account.** The Greek account gives seven daughters the names Alcyone, Electra, Maia, Merope, Taygeta, Celaeno and Asterope, with Atlas and Pleione as their parents. NASA/JPL identifies those names with prominent members of the Pleiades. In this view, seven of the nine schematic points turn copper. The cluster layout is idealised, not a catalogue map, and the canvas is labelled to say that no star-by-star correspondence is implied.

**Celestial Emu · Kamilaroi / Euahlayi account.** In the Kamilaroi and Euahlayi accounts described by Ngarrngga, the Celestial Emu takes shape in dark regions of the Milky Way. Its changing evening orientation through the year is connected with the behaviour of emus on the ground. Ngarrngga also notes that related accounts differ between communities. This is the one view where the subject is the space between stars rather than the stars themselves, so it gets an extra control: **Bring the dark forward** deepens the dust clouds against the luminous band.

## What the controls do not claim

All three accounts share one slider, **Turn this schematic scene**, which rotates the drawing up to 70 degrees either way. It is tempting to read that as the emu turning through the seasons. It is not. Rotation is a visual interaction only. It does not calculate the sky for any location, season or date.

The drawings in these views are original schematics. The emu is a negative-space suggestion built from procedural dust and texture, not a traced animal, a traditional boundary or a copy of any photograph or artwork. The cluster is nine idealised points. The exploration bundles no cultural artwork, sacred text or generated mythology, and its notes panel, **About the drawings and accounts**, repeats that.

These limits shape the whole design. A single selector that let you switch Orion into an emu would imply a one-to-one translation between traditions that the sources do not make. Keeping the modern atlas and the attributed accounts in separate views, with separate jobs, is how the piece avoids saying more than it knows.

## Keep the two views apart

The modern view answers a narrow question: where are these measured stars, and which lines does one modern convention draw between them? The accounts answer different questions, and each answer belongs to the people and the source it is attributed to.

Try ending on the Celestial Emu with **Bring the dark forward** turned all the way up. Then switch back to Orion in **Stars** view. Same sky, a very different place to look.

## Sources

- Te Papa, [*Matariki regional variations*](https://www.tepapa.govt.nz/digital-museum/explore-digital-museum/matariki-maori-new-year/matariki-regional-variations), for the Matariki account and its regional and iwi context.
- NASA JPL, [*The Seven Sisters*](https://www.jpl.nasa.gov/images/pia09263-the-seven-sisters-pose-for-spitzer/), for the Greek naming account.
- Ngarrngga, [*The Celestial Emu*](https://www.ngarrngga.org/case-study/case-study-1-the-celestial-emu), for the Kamilaroi and Euahlayi account.
- Olaf Frohn, [*D3 Celestial*](https://github.com/ofrohn/d3-celestial), for constellation line topology and names, used under its BSD 3-Clause licence.
- Star positions, proper motions and parallaxes: ESA (1997), *The Hipparcos and Tycho Catalogues*, ESA SP-1200, delivered by CDS/VizieR, catalogue I/239.
