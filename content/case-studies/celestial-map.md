---
title: "Celestial Map"
description: "An inspectable celestial atlas that keeps time, reference frame and projection separate from the view you rotate."
techStack: "JavaScript, D3, Canvas, Astronomy Engine, Vite"
updated: "2026-11-20"
status: "Local actual-tool pass at 614df51, unreleased. Engine integration and desktop/phone controls checked; independent astronomical accuracy is not established."
---

<!-- Kept in step with the canonical structured study in celestial-map.json. -->

Local actual-tool pass at 614df51, unreleased. Engine integration and desktop/phone controls checked; independent astronomical accuracy is not established.

## Make the globe explain what it represents

The local atlas separates a selected UTC moment from camera rotation. Ten calculated Solar System bodies and fifteen existing named-star references can be inspected and centred through labelled controls. The globe uses Earth-centred J2000 coordinates, not a local horizon or a forecast of what a person can see outside.

![Actual Celestial Map local atlas with a catalogue-loaded star globe, selected Moon label, UTC controls and paused rotation.](/assets/images/refresh-20261120/celestial-map-desktop.jpg)

Actual unreleased 1144px view. Body sizes and star display colours are illustrative; catalogue and engine integration do not constitute independent astronomy validation.

## Choose the reference frame before drawing the point

The earlier call used Observer(0,0,0), a surface observer, while describing the result as geocentric.

- **Use a surface observer as the Earth centre:** A latitude, longitude and elevation describe a location on the surface. The mismatch is especially visible in the Moon integration case.
- **Use Earth-centred vectors and convert their coordinates (chosen):** The local adapter uses Astronomy Engine GeoVector and EquatorFromVector, with tests comparing the actual library integration for every calculated body.

The labels and calculation now agree about their reference frame. This verifies the integration choice; it does not independently benchmark the underlying ephemeris.

## Projection does not automatically decide visibility

D3 point projection is not the same clipping boundary as a GeoPath. A spherical front-face test now filters back-facing point layers and hit targets. Optional dashed apparent paths deliberately retain their back hemisphere and are described as sampled sky trajectories, not physical orbit diagrams. Close body markers remain visible while only the selected or hovered name is drawn, avoiding overlapping planet labels.

## Keep controls useful when data is unavailable

The three public catalogue files are bundled at a pinned upstream revision with checksums and the BSD licence. They settle independently and have an explicit retry state; a failed layer no longer prevents the calculated bodies and controls from loading. A stable fitted zoom base prevents repeated zoom from compounding unpredictably, and its bounded ratio survives resizing.

![Local Celestial Map phone view with the real bundled star globe, paused rotation and the beginning of the UTC control panel.](/assets/images/refresh-20261120/celestial-map-phone.jpg)

Actual 390px view with no horizontal overflow. No device location was requested, and this view does not describe a local visible sky.

## Give every gesture an inspectable alternative

Native UTC controls reject impossible dates and stop time at 23:59, avoiding an unreflected next-day rollover. Keyboard arrows rotate the scene; explicit pole, zoom and reset buttons provide alternatives to dragging. In the browser, Vega and Deneb selection updated the inspector, Centre returned focus to the canvas, Space controlled rotation and Enter toggled a Moon path while the chosen time stayed fixed.

## Keep the evidence at its actual level

Thirteen product, engine, DOM and catalogue cases plus eleven icon regressions pass, along with normal lint, a production build and a frozen offline install. Full and production dependency audits report zero findings. Desktop and phone controls measured at least 44px, including expanded methodology. Long-session timing, every path combination, assistive technology and independent astronomical accuracy remain unverified.
