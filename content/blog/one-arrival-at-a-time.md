---
title: "One arrival at a time"
slug: "one-arrival-at-a-time"
description: "Build a double-slit pattern from individual detections, change the geometry, then give the paths a record."
draft: true
status: "unpublished"
tags:
  - creative-coding
  - quantum-physics
  - design-engineering
interactiveLab: "double-slit"
---

# One arrival at a time

Clear the detector. Add one dot. Add another.

There is very little to recognise at first. A few isolated marks do not announce the striped pattern they belong to. Keep sending detections and the gaps become visible. The picture becomes easier to read even though each new mark still arrives in one place.

*One arrival at a time* is an interactive double-slit model built around that difference between an individual event and a distribution. The curve above the detector shows the predicted probability density. The dots below are independent samples drawn from it. You can change the wavelength, move the slits farther apart and compare two different conditions for recording the path.

## Build the pattern

<InteractiveExploration slug="double-slit-experiment" />

[Open the full double-slit experiment](https://labs.sammii.dev/explorations/double-slit-experiment/).

*Interactive: select **Paths indistinguishable**, press **Clear**, then use **+ 1 detection** a few times. Press **Send detections** to accumulate more, or move **Accumulated events** to compare a sparse detector with a fuller one.*

The initial view already contains 1,200 detections, so clearing it is part of the experiment. Playback adds events until the display reaches 12,000. Pause whenever a shape starts to emerge, then scrub backwards to see how little evidence was available earlier.

The model does not give each dot a preselected stripe to fill. It samples a horizontal position from the whole probability distribution. Sparse patches and uneven counts are expected consequences of sampling; the code does not tidy them into a perfect histogram.

The vertical scatter only separates the marks visually. This is a one-dimensional detector model: the horizontal coordinate carries the physical meaning. The plotted density and the detector share that same horizontal scale, in millimetres.

## What adds together

For coherent alternatives, quantum theory adds probability amplitudes before taking the squared magnitude. With two amplitudes, `A₁` and `A₂`, the probability is proportional to:

**|A₁ + A₂|²**

The combined result contains a cross term. Depending on relative phase, that term can increase or reduce the probability at a particular position. Adding the two probabilities separately would lose it. [Feynman, Leighton and Sands explain these rules](https://www.feynmanlectures.caltech.edu/III_03.html) using the two-slit arrangement.

The individual arrivals and the interference pattern belong in the same explanation. A detection is localised; a pattern describes the relative frequency of many possible outcomes. The [opening quantum chapter of the Feynman Lectures](https://www.feynmanlectures.caltech.edu/III_01.html) develops this distinction through a sequence of detector experiments.

In the widget, the upper curve is supplied by an ideal optical model. The dot sampler then makes the relationship between that smooth prediction and a finite collection of events visible. It does not calculate a hidden route for each particle between the source and the detector.

## Make a prediction before moving a slider

Leave the path setting alone and increase **Wavelength**. The fringes spread out. Return it to `550 nm`, then increase **Slit separation**. The fringes move closer together.

For small angles in the far field, the spacing of the interference factor is approximately:

**Δy = λL / d**

where `λ` is wavelength, `L` is detector distance and `d` is slit separation. The full pattern also has a broader diffraction envelope because the slits have finite width. [OpenStax's double-slit derivation](https://openstax.org/books/university-physics-volume-3/pages/4-3-double-slit-diffraction) treats the interference pattern and this envelope together.

Here, `L` stays at one metre and each slit is `35 µm` wide. The wavelength range is `400–700 nm`; the separation range is `90–300 µm`. At `550 nm` and the default separation of `180 µm`, the spacing readout is about `3.06 mm`. Move separation to `300 µm` and it becomes about `1.83 mm`.

That comparison is a useful small test. Before dragging, decide whether you expect the bright bands to move together or apart. Then check both the curve and the readout. The numbers make it possible to distinguish a change in the model from a change in how the canvas happens to be drawn.

## Give the paths a record

Now select **Record which path**.

The narrow interference fringes disappear from the prediction, leaving the broader single-slit envelope. In the model, this setting represents a physical interaction that leaves fully distinguishable records of the two alternatives. When the record is not included in the screen measurement, those alternatives contribute probabilities without their interference cross term. The relevant distinction is physical path information; a person looking at the screen is not a parameter. The [Feynman chapter on quantum behaviour](https://www.feynmanlectures.caltech.edu/III_01.html) discusses how identifying the route changes the experimental prediction.

There is a specific assumption here: the ideal recording interaction leaves each individual-slit envelope unchanged. The toggle compares two limiting distributions under that assumption. It does not simulate a particular detector, its recoil, its efficiency or all the ways a real apparatus might disturb the light.

Changing this setting also rebuilds the displayed event sample. It compares two setups using the same event count. It does not claim that marks already recorded in a laboratory would rearrange themselves. For a clearer comparison, press **Clear** after switching and let the new pattern build from an empty detector.

## Sampling without disguising the approximation

The implementation evaluates the density in 1,600 horizontal bins across a detector window from `−12 mm` to `+12 mm`. It normalises those bins, builds their cumulative probability and uses that cumulative distribution to turn random numbers into detector positions.

Normalising within this window means every displayed dot lands inside it. The event count is a count of the shown detections, not a prediction of every photon emitted by a source. Light landing outside the window and finite detection efficiency are beyond the calculation.

The random sequence is seeded. Scrubbing backwards reveals the same earlier events, which makes it possible to inspect a particular sparse patch again. When a control changes, the same random values are mapped through the new distribution. That is a deliberate comparison mechanism in the software, not a claim that separate physical runs produce identical outcomes.

The numerical tests check the central peak, destructive-interference zeros, symmetry and normalisation. A larger sampled run is also compared with the predicted probability of landing in a central region. Those checks test whether the implementation follows its stated distribution. They cannot turn this simplified model into an experimental measurement.

## Keep the curve and the dots together

The curve makes the prediction legible immediately. The detector makes you wait for evidence. Keeping both visible gives each a job: one shows what the model expects, and the other shows how a finite sample can approach it.

Try ending with only a few dozen detections. Switch between the two path settings and ask how confidently you could identify either pattern from those marks alone. Then reveal a few thousand. The difference is visible without giving an individual dot more information than it contains.

## Sources

- Richard Feynman, Robert Leighton and Matthew Sands, [*The Feynman Lectures on Physics*, Volume III, chapter 1: Quantum Behavior](https://www.feynmanlectures.caltech.edu/III_01.html), for individual detections, interference and path discrimination.
- The same authors, [Volume III, chapter 3: Probability Amplitudes](https://www.feynmanlectures.caltech.edu/III_03.html), for the rule for combining amplitudes.
- OpenStax, Rice University, [*University Physics Volume 3*, §4.3: Double-Slit Diffraction](https://openstax.org/books/university-physics-volume-3/pages/4-3-double-slit-diffraction), for the finite-width envelope and far-field interference pattern.
