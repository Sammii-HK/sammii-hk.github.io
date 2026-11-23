---
title: "Celestial Map"
description: "A star globe drawn on Canvas with D3, placing the Sun, Moon and planets among the catalogue stars for any moment between 1600 and 2400"
techStack: "JavaScript, D3, Canvas, Astronomy Engine, Vite"
---

## What it is

Celestial Map is the whole sky drawn as a globe you can turn. Pick a date and a time and the Sun, Moon and planets take their places among about five thousand catalogue stars, the constellation lines and the Milky Way. Drag it and it coasts. Leave it alone and it starts to turn on its own. Hover over a planet or a bright star and a card tells you what it is.

You can try it at [celestial-map.sammii.dev](https://celestial-map.sammii.dev).

Most of the interesting decisions come down to one question asked over and over: what exactly is this point, and from where am I looking at it?

## Looking at the sky from the inside

D3's orthographic projection draws a sphere the way you would see a globe from outside it. That is right for the Earth and wrong for the sky. We see the celestial sphere from the inside, so a sky drawn as an outside globe has every constellation mirrored. The fix is one flag:

```js
projection = d3.geoOrthographic()
  .scale(scale)
  .translate([width / 2, height / 2])
  .rotate([0, -20, 0])
  .clipAngle(90)
  .precision(0.5);

// View from inside the celestial sphere so constellations aren't mirrored
if (typeof projection.reflectX === 'function') {
  projection.reflectX(true);
}
```

Every position is a pair of equatorial coordinates, right ascension and declination, treated as longitude and latitude. Right ascension is measured in hours, so the code multiplies it by 15: 24 hours is 360 degrees. The starting rotation tilts the view 20 degrees above the celestial equator.

The rotation also carries time. When you choose a moment, the controls turn the globe to Greenwich sidereal time:

```js
p.rotate([-SiderealTime(selectedDate) * 15, r[1], r[2]]);
```

Sidereal time is the right ascension currently crossing a meridian. D3's rotation moves the point at longitude minus λ to the centre, so negating it puts the right ascension on Greenwich's meridian at that moment in the middle of the view. Turning the globe afterwards changes where you are looking, not when.

## Geocentric, and why that took a correction

The Sun, Moon and planets come from Astronomy Engine. The first version, in February 2026, asked for them like this:

```js
// Geocentric observer (centre of Earth) for RA/Dec calculations
const GEOCENTRIC = new Observer(0, 0, 0);
const equ = Equator(body, date, GEOCENTRIC, false, true);
```

The comment says centre of the Earth. The code says latitude 0, longitude 0, height 0, which is a point on the surface in the Gulf of Guinea. An `Observer` in Astronomy Engine is always somewhere on the ground, so that call returned topocentric positions: the sky as seen from one spot on the equator.

For the planets it barely matters: moving the observer by an Earth radius shifts them by a tiny fraction of a degree. The Moon is different. It is close enough that parallax, the shift caused by viewing from the surface instead of the centre, can reach about a degree, which is roughly two Moon widths. At the moment the tests use, the old call put the Moon about three quarters of a degree from its geocentric position.

The released version asks for an Earth-centred vector and converts that to right ascension and declination:

```js
// ofdate=false: J2000 epoch, aberration=true for accurate positions
const equ = EquatorFromVector(GeoVector(body, date, true));
```

`GeoVector` returns J2000 equatorial coordinates, the same frame as the star catalogue. A test checks every body against that conversion and checks that the Moon no longer matches the old surface observer. The page says it plainly: the whole sky, seen from the centre of the Earth, which is why it never needs your location.

## The ecliptic, drawn from first principles

The dashed golden line is the ecliptic, the plane the Sun appears to travel along over a year and the planets stay close to. It is a great circle tilted against the celestial equator by the obliquity of the Earth's axis, 23.4393 degrees at J2000. To draw it, the code walks ecliptic longitude λ from 0 to 360 degrees and rotates each point into equatorial coordinates:

```js
const ra = Math.atan2(Math.cos(OBLIQUITY) * Math.sin(lam), Math.cos(lam));
const dec = Math.asin(Math.sin(OBLIQUITY) * Math.sin(lam));
```

That is a single rotation about the line where the two planes cross. At λ of 0 and 180 degrees the ecliptic meets the equator, at the equinoxes. At 90 degrees, the June solstice, the declination reaches its maximum of plus 23.44 degrees.

## Star colour from B-V

Each catalogue star carries a B-V colour index, the difference between its brightness through a blue filter and a visual one. Hot stars are bluer, so their index is low or negative. Cool stars are redder, with indices above 1. I map that index to a display colour with a clamped, piecewise linear ramp across five bands, blue-white, white, yellow, orange and red:

```js
} else if (t < 0.8) {
  // Yellow
  const u = (t - 0.4) / 0.4;
  r = 255;
  g = 235 - 55 * u;
  b = 195 - 100 * u;
}
```

Each band starts on the colour where the previous one ends, so there is no visible step at the joins. It is an approximation chosen to look right on a dark screen, not a physical conversion.

Size comes from magnitude. Astronomical magnitude is logarithmic and backwards: five magnitudes is a factor of 100 in brightness, and lower numbers are brighter. The radius is

```js
return 4 * Math.pow(10, -0.28 * mag);
```

If the area of each dot tracked brightness exactly, the exponent would be 0.2. At 0.28 each magnitude changes the radius by a factor of about 1.9, so the bright stars stand out more than they strictly should. That is a legibility choice. The stars are sorted dimmest first so the bright ones draw on top.

The Milky Way is five nested outlines from the catalogue, each filled at 4% opacity. Where they overlap the fills stack, so where all five meet the band builds up to about 18% while its edges stay at 4%. The brightness gradient comes from the data's own contours.

## Points behind the globe

The most useful thing I learned about D3 here is that clipping only applies to paths. `geoPath` respects `clipAngle(90)`, so constellation lines stop cleanly at the edge. Calling the projection on a single point clips nothing: a point on the far side gets real screen coordinates, mirrored onto the front of the disc.

The original star renderer relied on a null check:

```js
const p = projection(star.coords);
if (!p) continue; // behind globe
```

That check never fired, so the back of the sky was being drawn through the front. The released version tests each point against the centre of the view:

```js
export function isFrontFacing(projection, coords) {
  const centre = projection.invert(projection.translate());
  return Boolean(centre && coords && geoDistance(centre, coords) < Math.PI / 2 - 1e-8);
}
```

Inverting the screen centre gives the sky coordinate currently facing you. A point is on the near hemisphere when its great-circle distance from that centre is less than 90 degrees. Stars, planets, labels and hover targets all go through it, so you can no longer hover over a star that is on the other side of the sky.

## Orbit paths, and the dead ends on the way

The dashed paths show where each body appears over one of its orbits, centred on the chosen date: Mars traces its retrograde loop, the Moon its monthly circuit. Drawing them took seven commits on the first day, and the history is the most honest record of what I tried.

The first version projected each sample and lifted the pen whenever the projection returned null, which, as above, it never does. The second switched to `geoPath` to get proper clipping, and the commit message records that a short step from about 359 degrees to 1 degree was then drawn as a line across the whole face of the globe. The fix was to unwrap right ascension so neighbouring samples never jump by more than 180 degrees:

```js
for (let i = 1; i < coords.length; i++) {
  while (coords[i][0] - coords[i - 1][0] > 180)  coords[i][0] -= 360;
  while (coords[i][0] - coords[i - 1][0] < -180) coords[i][0] += 360;
}
```

Next came a 6 pixel outward offset so paths floated above the surface. It was in screen space, so the paths drifted as the globe turned, and the next commit removed it. A two-pass version followed. The one that stuck draws each path in a single stroke through a second, unclipped projection:

```js
orbitProj = d3.geoOrthographic().clipAngle(180).precision(0.5);
```

It shares the main projection's rotation, scale and position, so the back of each loop shows through the disc instead of breaking off at the edge. The page explains that these are apparent paths across the sky, not the shapes of the orbits.

## Caching paths by their own resolution

Each path samples its body's full period: 120 points for the Moon's 27.32 days, 360 for Pluto's 90,560. The first cache kept everything until the date moved by a day, but the Moon moves about 13 degrees a day, so its path could sit visibly off the Moon. The released cache gives each path its own tolerance:

```js
if (Math.abs(date.getTime() - orbitCacheDate[name]) > (cfg.periodDays * 86400000) / cfg.samples / 2) delete orbits[name];
```

A path is resampled once the date has moved by more than half its own sample spacing. For the Moon that is about 2.7 hours; for Pluto it is about 126 days. Between those points the drift is smaller than the gap between samples, so it cannot be seen, and scrubbing the time slider only recomputes the paths that have actually moved.

## Labels in a conjunction

Every visible body keeps its name, and near the Sun planets bunch together all the time. Each label is a box beside its body, and the renderer tries a short list of vertical offsets until the box is clear of every label already placed:

```js
const LABEL_NUDGES = [0, 13, -13, 26, -26, 39, -39];
```

Hovered or selected names are placed first so they keep their natural position. One honest note: the boxes are 14 pixels tall and the steps 13, so two labels starting at exactly the same point skip a row each time. Real conjunctions are never quite that exact, and a test that zooms right out on the Sun checks the crowded labels land on separate rows.

## Spin, drag, inertia and twinkle

The globe has five states: idle spin, dragging, coasting, easing and still. After three seconds of stillness it turns at 2 degrees a second. A drag only changes longitude, so the tilt you chose stays put, and it converts pixels to degrees using the projection's scale: at the centre of an orthographic globe of radius R, a pixel is 1/R radians of arc.

When you let go, the speed comes from the last few pointer samples, and only if the pointer was still moving in the last 100 milliseconds, so a held drag does not fling. Then it decays:

```js
velocity *= Math.pow(0.97, dt * 60);
```

Raising 0.97 to the power of elapsed sixtieths of a second makes the decay the same at any frame rate. The speed halves roughly every 0.38 seconds, and the globe stops below 0.05 degrees a second. With reduced motion there is no idle spin, no coasting and no easing; the North and South buttons jump straight there, and Rotate globe still starts the spin if you ask for it.

The background stars are decorative and say so. They are a port of Lunary's starfield: a seeded generator so the same 220 stars appear every time, each twinkling as three sine waves:

```js
Math.sin(star.speed * t + star.phase)          * 0.60 +
Math.sin(star.speed * 1.618 * t + star.phase2) * 0.25 +
Math.sin(star.speed * 3.141 * t + star.phase3) * 0.15;
```

The frequency ratios of 1.618 and 3.141 never line up, so the shimmer never settles into an obvious loop. A low-rate loop redraws at most every 50 milliseconds, and only while the globe is still, since spinning already redraws every frame. It holds still under reduced motion.

## Local time, a night sky in both themes, and the catalogue

Dates and times start in your own time zone, named on the control (GMT or BST in London), with UTC one tap away. A date typed into the control is accepted only if it survives a round trip back to the same text, which quietly rejects 30 February, and the time slider runs from minute 0 to 1439 so it can never roll over into tomorrow.

The page follows the system's light or dark setting through colour tokens. The map frame does not. It keeps its dark tokens in both schemes, so in light mode a night sky sits in a light page. The canvas paints with fixed night colours and never needs repainting when the scheme changes. A star map on a white disc stops looking like the sky.

The catalogue files, once fetched from a CDN at d3-celestial's `master` branch, are now bundled from a pinned commit with checksums the tests verify. They load with `Promise.allSettled`, so if one fails the planets still work and a Try again button appears.

## What it taught me

Every bug worth fixing here was a mismatch between what a value claimed to be and what it was: a "geocentric" observer standing on the equator, a null check for points that are never null, a daily cache for a body that moves 13 degrees a day. The fixes were rarely more than a few lines. Finding them meant reading the libraries closely enough to know what an `Observer` is and what a projection does with a single point, then writing tests that pin those meanings down.
