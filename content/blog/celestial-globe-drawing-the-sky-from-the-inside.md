---
title: "Celestial Globe: drawing the sky from the inside"
description: "How a Canvas sky map combines D3 projections, stellar magnitude, layered drawing and planetary positions, and where its visual model needs careful boundaries."
date: '2026-11-20'
tags: ['creative-coding', 'data-visualisation', 'javascript', 'astronomy']
draft: true
lab_url: 'https://celestial-map.sammii.dev'
---

A globe is usually something you look at from outside. A map of the sky has a different problem: the constellations surround the observer. Copy the familiar Earth-globe recipe without accounting for that difference and the patterns can appear mirrored.

[Celestial Globe](https://celestial-map.sammii.dev) is an interactive sky map built with D3, Canvas and Astronomy Engine. It combines catalogue stars, constellation lines, a faint Milky Way, planetary positions and a date control. You can rotate the view, inspect named objects and follow the paths traced by planets through the sky.

The interesting engineering sits between those layers. The coordinates need to agree. The bright objects need to remain legible. The pointer needs to find a tiny star without requiring a tiny target. And the visualisation needs to be clear about what its model represents.

## Start with the observer's point of view

The map uses an orthographic projection, which gives a round, globe-like view. D3 handles the spherical geometry while Canvas handles the drawing. The relevant configuration in [the projection module](https://github.com/Sammii-HK/celestial-map/blob/92f24cc94e9cbf27fff36267a5ca67921ab35c85/src/projection.js) can be reduced to this:

```js
import * as d3 from "d3";

function makeSkyProjection(width, height) {
  return d3.geoOrthographic()
    .scale(Math.min(width, height) * 0.45)
    .translate([width / 2, height / 2])
    .rotate([0, -20, 0])
    .clipAngle(90)
    .reflectX(true);
}
```

The horizontal reflection is the important sky-specific choice. It changes the handedness of the picture so the constellation shapes correspond to looking into the celestial sphere. Rotation then controls which part of that sphere is centred in the display.

Right ascension and declination supply the positions. Astronomy Engine returns right ascension in hours, while the projection expects angular coordinates in degrees. Multiplying right ascension by fifteen makes the conversion: twenty-four hours correspond to a full turn. Declination is already an angle in degrees.

The planetary calculation requests J2000 equatorial coordinates, matching the reference frame used for the catalogue. Consistency matters more than simply having two arrays labelled longitude and latitude. Two plausible positions expressed in different frames can produce a plausible-looking but misleading map.

## Clipping is part of drawing geometry

There is a subtle D3 distinction worth keeping visible when adapting this project. Calling a projection directly transforms one coordinate. Sending geometry through `geoPath` also uses the projection's streaming pipeline, where clipping is applied.

The project uses both routes: paths for the globe and constellation geometry, and direct coordinates for custom star discs. A returned pair of numbers is not, by itself, evidence that a point belongs to the visible hemisphere. The same visibility decision also needs to govern labels and pointer targets.

For a minimal renderer that delegates point clipping to D3, this is a useful alternative pattern. It is an illustrative adaptation, rather than the project's custom glow renderer:

```js
function drawStar(ctx, projection, star) {
  const point = {
    type: "Point",
    coordinates: star.coords
  };

  const path = d3.geoPath(projection, ctx)
    .pointRadius(star.radius);

  ctx.beginPath();
  path(point);
  ctx.fillStyle = star.color;
  ctx.fill();
}
```

[D3's projection documentation](https://d3js.org/d3-geo/projection) and [path documentation](https://d3js.org/d3-geo/path) are useful here because the distinction affects more than astronomical maps. Any spherical visualisation with separately drawn icons needs its geometry and symbols to agree about what is visible.

## Make brightness readable without pretending it is size

The star catalogue comes from [d3-celestial](https://github.com/ofrohn/d3-celestial). The renderer derives a display radius from magnitude using:

```js
const radius = 4 * 10 ** (-0.28 * magnitude);
```

Lower magnitudes produce larger dots. A magnitude-zero star gets a radius of 4 pixels; magnitude two gets about 1.10; magnitude four gets about 0.30. This is a visual encoding chosen for the display, not a calculation of a star's physical radius or its apparent disc.

That distinction is easy to lose once a chart becomes attractive. The dot is a symbol for relative prominence. Its size should help someone find a pattern, while the label or accompanying information carries the more precise meaning.

Stars with a magnitude below two receive a soft glow. Dim stars are drawn first so brighter ones remain on top. Colour comes from a piecewise approximation based on the catalogue's B-V colour index, ranging from blue-white through warmer colours. It provides a visual cue rather than a calibrated reproduction of stellar colour on every screen.

The planets use fixed display radii too. Their discs are designed to be found and inspected. They are not a shared scale model of planetary size or angular diameter.

## Draw in an order that tells the viewer what matters

Canvas gives the application direct control over paint order. The background starfield goes down first, followed by the globe disc and grid. The Milky Way is faint enough to provide structure without swallowing the constellations. The equator, ecliptic and constellation lines establish relationships before the prominent points and labels arrive.

Planetary paths sit behind the planet discs. Names are drawn late, so a useful label survives the detail beneath it. This order is part of the interface: the eye can identify objects before deciding which supporting lines to investigate.

There are also two distinct kinds of stars on screen. The procedural background outside the globe provides atmosphere. The catalogue points inside the map carry astronomical positions. Keeping those roles separate prevents decorative noise from acquiring the authority of data.

The Milky Way layer uses a low alpha value. That is a small implementation choice with a large perceptual effect. A mathematically correct layer can still be visually too loud for the role it serves.

## Keep the drawing and pointer in the same units

High-density screens introduce another coordinate system. The canvas has a backing-store resolution, a CSS size and a projection expressed in screen coordinates. Mixing them makes the image soft or moves the hit targets away from the things they belong to.

The project sizes the backing store using `devicePixelRatio`, then resets the drawing transform so the rest of the renderer continues to use CSS pixels. Here is the same pattern in a reusable form:

```js
function sizeCanvas(canvas, ctx, width, height, dpr) {
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
```

Using `setTransform` establishes the scale explicitly. It avoids accidentally accumulating another scale factor on every resize.

The hit-test radii remain in CSS pixels: twenty for planets and fifteen for named stars. Those targets are intentionally larger than many of the drawn dots. A useful interaction should not require someone to land precisely on a subpixel mark.

The hover loop checks at roughly twenty updates per second. Dragging and inertia use animation frames, while a lower-frequency render loop supports twinkling when the view is static. Those are scheduling decisions in the source, rather than measured claims about performance on every device.

## Make the motion understandable

Horizontal dragging changes longitude while holding a fixed tilt. After release, angular velocity decays with elapsed time. The code distinguishes dragging, inertia, a static state and idle rotation, which keeps each mode's responsibilities visible.

The North and South controls provide a different view of the sphere. They animate towards a pole, while a subsequent horizontal drag returns to the fixed-tilt interaction. These are navigation choices, not a simulation of moving an observer around Earth.

The date and time controls update planetary positions and use Greenwich sidereal time to orient the map. The selected time is handled through JavaScript's local date controls. The application does not ask for the viewer's latitude and longitude, so its display should not be described as the exact sky above their garden.

There is a concrete naming trap in the current planetary module. It calls `new Observer(0, 0, 0)` a geocentric observer, but [Astronomy Engine defines those arguments](https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md) as geographic latitude, longitude and height above mean sea level. They describe a surface location at the equator and Greenwich meridian, not Earth's centre. The identifier does not change the calculation. A precise local-sky mode would need an explicit observer and horizon treatment.

The toggled “orbit” lines need similar care. They sample planetary positions over time in sky coordinates. They show apparent trajectories against the celestial background, rather than physical paths drawn around the Sun. The viewpoint is part of what creates those curves.

## Preserve the model as the picture grows

There are straightforward improvements to make before treating the globe as a precision observing tool: consistent visibility handling for symbols and hit tests, explicit observer coordinates, and a clear distinction between apparent paths and physical orbits. Pinning the catalogue assets to a version would also make future renders easier to reproduce; the current URLs follow the upstream master branch.

For an exploratory map, the existing layers already give people several ways into the sky. You can recognise a constellation, inspect a named star, change the date or compare a planet's path with the ecliptic. Each interaction makes one relationship easier to see.

That is the balance I want in this kind of visualisation: enough atmosphere to invite exploration, with the coordinate systems and visual encodings explained well enough that the picture does not imply more than its model contains. You can explore the [live globe](https://celestial-map.sammii.dev) and inspect the [source](https://github.com/Sammii-HK/celestial-map) side by side.
