---
title: "The visible spectrum is a sliver"
description: >-
  The whole electromagnetic spectrum on one axis, with the light you can see at its true width, about 1.6%. Then the stretch around it, where bees and birds see ultraviolet and pit vipers sense heat, and Eagleman's "one ten-trillionth" checked three ways.
date: '2027-01-13T09:00:00+00:00'
tags:
  - charts
  - perception and consciousness
  - vision
  - physics
  - a journey through light
series: "Perception and consciousness"
chart: "spectrum"
draft: false
---

The top of [labs.sammii.dev/charts/spectrum](https://labs.sammii.dev/charts/spectrum/) is a long grey strip divided into Gamma, X-rays, UV, Infrared, Microwave and Radio, with one thin stripe of colour in it. Above the strip, in bold: **1.6%** of this axis is light you can see.

That stripe is everything you have ever seen. Every face, every sunset, every screen. The rest of the strip is there too, all the time, and you are blind to it.

My MA, A Journey Through Light, was a cube whose quotes could only be read under ultraviolet light. Nothing in the cube changed when the light did, only what you could perceive. The argument was that what we see is a sliver of what is there. This chart is the sliver, to scale.

## To scale, on a log axis

The strip runs from 10 fm to 100 km, nineteen powers of ten, on a logarithmic wavelength axis. That is how the spectrum is always drawn, because nothing else fits. The visible band is 380 to 760 nm, as ISO 21348 draws it, and on that axis it takes up about 1.6% of the width.

Under the strip each band is listed with its edges: gamma shorter than 1 pm, X-rays 1 pm to 10 nm, UV 10 to 400 nm, visible 380 to 760 nm, infrared 760 nm to 1 mm, microwave 1 mm to 1 m, radio longer than 1 m. The note beside them is worth reading. Band edges are conventions, not physics: X-rays and gamma rays overlap and are told apart by where they come from, and the microwave and radio boundaries differ between standards. And gamma rays carry on past the left edge of the chart.

## Closer, and who sees what

The second section zooms in twice. The first plot is **Light, 250 nm to 1 µm: eyes**. The second is **Heat, 1 to 30 µm: a different sense**. Each has the ISO sub-bands across the top (UV-C, UV-B, UV-A, the visible band and IR-A on the first; IR-A, IR-B and IR-C on the second) and one bar per animal, from the range its eyes or sense organs respond to. Ticks inside a bar are the peak sensitivities of its receptor types. Hover or tap a row and the panel gives the range, what it means, a note on how firm it is, and its sources.

There are six rows:

- **Human**: 380 to 760 nm, three kinds of cone peaking at about 420, 534 and 563 nm.
- **Human, without a lens**: down to about 315 nm. Your retina can detect ultraviolet. Your lens stops it, letting through less than 5% of light shorter than 400 nm. People whose lens has been removed detect light down to about 315 nm, where the cornea sets the limit (Griswold and Stark 1992). The receptors could always see it; the lens was in the way.
- **Honeybee**: about 300 to 650 nm, with receptors peaking near 344, 436 and 544 nm. Bees see into the ultraviolet, where many flowers carry patterns we cannot see, and they lose the reds we can.
- **Birds with UV cones**: four kinds of colour cone where we have three, the fourth peaking between about 355 and 380 nm in ultraviolet-sensitive species.
- **Mantis shrimp**: twelve photoreceptor types from 300 to 720 nm. And, tested, they are surprisingly poor at telling close colours apart (Thoen et al. 2014). The researchers think it recognises colours by scanning rather than comparing them. More receptors is not more seeing.
- **Pit viper**: not an eye at all. The pit organ is a thin membrane warmed by radiation, so it has no pigment and no sharp band. It responds most strongly at about 3 to 15 µm, where warm bodies glow, and it is drawn hatched to say so.

Two marker lines run down the plots. One is labelled **MA cube**, at 355 nm, in UV-A: the band a blacklight emits, where the quotes in my cube became readable. The ultraviolet-reactive paint absorbs it and re-emits visible light. The other is labelled **37 °C**, at 9.3 µm, where a body at body temperature radiates most strongly, by Wien's displacement law. It sits inside the pit viper's bar, which is the point.

You can open the page on any row with `?focus=`: [without a lens](https://labs.sammii.dev/charts/spectrum/?focus=aphakic), [the honeybee](https://labs.sammii.dev/charts/spectrum/?focus=bee) or [the mantis shrimp](https://labs.sammii.dev/charts/spectrum/?focus=mantis).

## "Less than one ten-trillionth", checked

The last section takes on the famous number. "What we see is less than a ten-trillionth of what's out there," David Eagleman told a TED audience in 2015. On the log axis above it is 1.6%. Both can be right, because the spectrum has no top. The fraction depends on where you stop counting, and on whether you count in wavelength or in frequency.

So the chart counts in frequency, from zero up to a photon of your choosing. Visible light is 394 THz wide. Under **Stop counting at** there are three buttons, and the readout changes with each:

- **the end of X-rays** (1 pm, 1.24 MeV): about one part in 760 thousand.
- **the end of ISO's gamma rays** (10 fm, 124 MeV): about one part in 76 million.
- **1.4 PeV, LHAASO 2021**, a photon among the most energetic ever detected: about one part in 860 trillion. Less than one ten-trillionth.

For the first two the chart adds that it is not yet one ten-trillionth, and that getting there needs the count to reach photons of about 16 TeV. So Eagleman's figure holds if you count in frequency and include the most energetic photons we have seen. It is not wrong. It is a choice of scale, and so is my 1.6%. The number changes with the scale; the sliver does not.

## What it cannot show

The spectral colours in the visible stripe are approximate. A screen cannot show spectral colours, which is a nice irony on a chart about the limits of seeing.

The edges of human vision are soft. The CIE gives no single edge: anywhere from 360 to 400 nm at the short end and 760 to 830 nm at the long, depending on how bright the light is. The human row uses ISO's 380 to 760.

The animal ranges are only as good as their sources, and several are approximate, drawn with a soft edge. The bird bar's 700 nm upper edge is the convention modellers use, not a measured cut-off. The two ticks in it are the range of one ultraviolet cone's peak across species, not two cones. And the pit viper's 3 to 15 µm is the least certain number on the chart: it is a heat sense with no pigment, and the figure comes from a review rather than a measurement I could check.

If you want the installation itself, it is in [Beyond the visible](/blog/beyond-the-visible-uv-acetate-and-the-installation-i-painted), and I went back to it in [The light we built](/blog/the-light-we-built). This chart sits beside [What your eye actually renders](/blog/retina), which is the same argument told from inside the eye.

See the sliver at [labs.sammii.dev/charts/spectrum](https://labs.sammii.dev/charts/spectrum/).

## Sources

- ISO 21348:2007, Space environment: process for determining solar irradiances
- CIE S 017:2020, 17-21-003
- David Eagleman, Can we create new senses for humans?, TED2015
- Cao et al. (LHAASO), Ultrahigh-energy photons up to 1.4 petaelectronvolts from 12 γ-ray Galactic sources, Nature 594:33 (2021)
- Bowmaker and Dartnall, J Physiol 298:501 (1980)
- Griswold and Stark, Vision Res 32:1739 (1992); van Norren and Vos, Vision Res 14:1237 (1974)
- Hempel de Ibarra, Vorobyev and Menzel, J Comp Physiol A 200:411 (2014), after Menzel and Backhaus (1991)
- Garcia et al., Front Plant Sci 11:601700 (2020), after Peitsch et al. (1992)
- Hart and Hunt, Am Nat 169:S7 (2007); Ödeen and Håstad, BMC Evol Biol 13:36 (2013); Lind et al., Proc R Soc B 281:20132209 (2014); Venable, Gahm and Prum, Commun Biol 5:576 (2022)
- Thoen, How, Chiou and Marshall, Science 343:411 (2014); Chiou et al., Curr Biol 18:429 (2008)
- Gracheva et al., Nature 464:1006 (2010); Grace et al., Biosens Bioelectron 14:53 (1999); Goris, J Herpetol 45:2 (2011); Ebert and Westhoff, J Comp Physiol A 192:941 (2006)
