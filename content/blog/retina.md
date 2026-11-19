---
title: "What your eye actually renders"
description: >-
  Cone and rod density across the human retina from Curcio's own 1990 data, the optic disc where there is nothing to count, and a card for finding your own blind spot, with the three things your brain fills it with.
date: '2027-01-05T09:00:00+00:00'
tags:
  - charts
  - perception and consciousness
  - vision
  - perception
  - data
series: "Perception and consciousness"
chart: "retina"
draft: false
---

Close your left eye. Look at the cross with your right eye, keep looking at it, and bring your face slowly towards the screen. At about 3.6 times the distance between the cross and the dot, the dot is gone. The card looks blank where it was.

That is the first thing on [labs.sammii.dev/charts/retina](https://labs.sammii.dev/charts/retina/), and I put it before the data on purpose. Hold your gaze still and the scene seems sharp and complete from edge to edge. The retina disagrees, and it is more convincing to find the hole in your own eye first and then see the counts it sits in.

## Find your blind spot

The card has two controls. **Eye** switches between right eye and left eye, which flips the card so the target is on the correct side. **Target** gives you three versions of the same trick:

- **dot**: the dot lands on your blind spot and disappears.
- **line**: a line with a gap in it. When the gap lands on your blind spot, the line looks unbroken. There is no line there; your brain draws one.
- **stripes**: a striped field with a hole. When the hole lands on your blind spot, it fills with stripes. There are no stripes there; your brain carries them across.

The distance is worked out, not guessed. The centre of the blind spot sits 15.5° out from where you are looking (Rohrschneider, 2004), so the target has to be seen at that angle, and 1 / tan 15.5° is 3.61. The blind spot is about 6.4° wide, so there is a range rather than a single point: the card says anywhere between 3.0 and 4.6 times the cross-to-target distance.

## Sharp in a pit, coarse at the edges

Below the card is the chart itself: cone and rod density along the horizontal meridian of the retina, temporal side on the left, nasal side on the right. The numbers are not mine and not a textbook redraw. They are the spreadsheet behind Figures 6 and 9 of Curcio, Sloan, Kalina and Hendrickson's 1990 paper, Human photoreceptor topography, published by Christine Curcio with the paper. It averages whole retinas from donors aged 27 to 44, counted under a microscope. The dots on the chart are the measured points and the lines just join them.

What the curves show is extreme. Cones, which give you detail and colour, are packed into a pit at the centre: the composite reads 196,890 per square millimetre at the very centre of the fovea. One millimetre out on the temporal side it is 19,699. That is a tenfold drop inside a millimetre.

Rods, which work in dim light, do the opposite. At the centre there are none. They climb as the cones fall, and peak at about 145,000 per square millimetre around 20 degrees out on the nasal side, then decline towards the edge. Switch **Range** from **Whole retina** to **Central 20°** and a shaded band marks the rod-free zone, 0.35 mm across, about 1.25°. That is why a faint star can vanish when you look straight at it and come back when you look slightly to one side.

The slider underneath, **From the centre**, moves a cursor along the meridian. The readout gives the distance in degrees and millimetres, the cone and rod counts, how many rods there are per cone at that point, and cone density as a percentage of its peak. Between measured points it says so and rounds the value; a table under the chart lists every measured one. The **Density axis** toggle switches between linear and log; on the linear axis the cone peak dwarfs everything else, and on the log axis you can read the far periphery, where cones settle into the low thousands.

And then there is the gap. On the nasal side, at 3.98 mm from the centre, the composite has no value at all. Move the slider into the hatched band and the readout changes to "The optic disc: no rods, no cones". This is where the optic nerve and the blood vessels leave the eye. Light that lands here is not detected. Because the lens flips the image, this patch of nasal retina looks out at the temporal side of your visual field: the blind spot you found with the card.

## Counted

The chart ends with a short list of totals from Curcio's abstract and the disc measurements:

- **199,000** cones per square millimetre at the centre of the fovea, as the average of the individual peaks. Between individuals it ranged from 100,000 to 324,000, a threefold spread in the sharpest part of human vision. (The curve itself reads 196,890 at the centre; that is the composite. The 199,000 is the paper's abstract, averaging each eye's own peak.)
- **92 million** rods in an average retina (77.9 to 107.3 million), against **4.6 million** cones (4.08 to 5.29 million). Twenty rods for every cone, and almost none of them where you are looking.
- **6.4° × 7°** of visual field with nothing in it, in every eye: the average optic disc, 1.76 mm across and 1.92 mm tall (Jonas, Gusek and Naumann, 1988).

## Why you never see the hole

With both eyes open, each eye's blind spot falls on a part of the scene the other eye can see, and your eyes are never still for long. But even with one eye closed and held steady, as on the card, you do not see a hole. You see whatever surrounds it. This is perceptual filling-in, and recordings show that neurons in early visual cortex take part in it (Komatsu, 2006).

What that means is still argued over. Dennett, in Consciousness Explained (1991), said the brain simply ignores an absence it has no reason to notice. Pessoa, Thompson and Noë (1998) reviewed evidence that some completion is active, with neural signals that spread into the missing region. The chart does not pick a side. Either way, the picture you experience as even and complete is not what the retina sends. It is sharp only in a pit a few degrees across, coarse and almost all rods towards the edge, with a hole in each eye, and it reaches you finished.

## What the chart cannot tell you

The curves are an average, and individual eyes vary a great deal, most of all at the fovea. The first full count, Østerberg's in 1935, was of a single eye; the shapes agree with Curcio's, the numbers do not exactly, which is the point of counting more than one eye.

It is one line through the retina, the horizontal meridian, not the whole surface. The degrees are the authors' conversion from millimetres using the Drasdo and Fowler (1974) schematic eye, 275 µm per degree near the centre and non-linear towards the edge. The optic disc is drawn where the composite has no value, at the average disc size, not measured from any one eye.

And the blind-spot card uses the average angle, so the distances it gives you are a guide, not a measurement of your eye. If the dot vanishes a little nearer or further than 3.6, that is you, not the maths.

This one is part of the perception series that grew out of my MA, A Journey Through Light: a cube whose quotes could only be read under ultraviolet light. One of them was from The Little Prince, that what is essential is invisible to the eye. This chart is the literal version.

Find yours at [labs.sammii.dev/charts/retina](https://labs.sammii.dev/charts/retina/), or open straight on the [rod-free centre](https://labs.sammii.dev/charts/retina/?focus=fovea) or the [blind spot](https://labs.sammii.dev/charts/retina/?focus=blindspot).

## Sources

- Curcio, Sloan, Kalina and Hendrickson, Human photoreceptor topography, Journal of Comparative Neurology 292:497 (1990), and the spreadsheet behind Figures 6 and 9 published by Christine Curcio ([christineacurcio.com/PRtopo](https://christineacurcio.com/PRtopo))
- Drasdo and Fowler, schematic eye (1974)
- Østerberg, Acta Ophthalmologica supplement 6 (1935)
- Jonas, Gusek and Naumann, Investigative Ophthalmology and Visual Science 29:1151 (1988)
- Rohrschneider, Investigative Ophthalmology and Visual Science 45:3257 (2004)
- Ramachandran, Blind spots, Scientific American 266(5) (1992)
- Komatsu, The neural mechanisms of perceptual filling-in, Nature Reviews Neuroscience 7:220 (2006)
- Dennett, Consciousness Explained (1991)
- Pessoa, Thompson and Noë, Finding out about filling-in, Behavioral and Brain Sciences 21:723 (1998)
