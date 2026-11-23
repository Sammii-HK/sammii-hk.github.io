---
title: "Day Lite"
description: "A Mapbox globe that shows sunrise, sunset and the hours of daylight wherever the pointer goes, worked out for the place's own civil day"
techStack: "React, TypeScript, Mapbox GL, Astronomy Engine, Day.js, tz-lookup, Vite"
---

## What it is

Day Lite is a globe you move over to see the daylight. Wherever the pointer goes, the panel beside it shows that place's sunrise, sunset, hours of daylight and a bar of the whole day in gold and night blue. Click or tap to pin a place. You can also pick an example place, type coordinates or choose a date. Everything is worked out in the browser, and it never asks for your location.

You can try it at [day-lite.vercel.app](https://day-lite.vercel.app).

The first version was a one-day sketch in January 2025. It looked right for most places most of the time, which is the most dangerous kind of wrong. Rebuilding it meant answering a question I had skipped: what is "a day" at a given place?

## Where it started

The sketch put a Mapbox map on the page, took the coordinates under the mouse and asked Astronomy Engine for the next sunrise and the next sunset from the current moment. Its time zone was a function I was quite pleased with at the time:

```ts
function calculateUtcOffset(longitude: number) {
  const offset = Math.round(longitude / 15);

  return Math.max(-12, Math.min(14, offset));
}
```

The reasoning is sound geography. The Earth turns 360 degrees in 24 hours, so each hour of clock time is 15 degrees of longitude. But time zones are civil decisions, not geometry. Kathmandu sits at 85.3 degrees east, which this rounds to plus 6; its clocks are on plus 5:45. Greenwich rounds to 0, which is wrong for half the year because of British Summer Time. Madrid, west of Greenwich, rounds to 0 and keeps Central European time. The `tz-lookup` package was imported in the very first commit and then dropped as unused in the tidy-up, while the longitude rule stayed.

The daylight figure had a quieter problem. It was the difference between the next sunrise and the next sunset:

```ts
const daylightMinutes = dayjs(sunrise?.date).diff(dayjs(sunset?.date), 'minute');
```

At night both events are tomorrow, and the sunrise comes first, so the difference is the daylight, negative, and the display took its absolute value. During the day the next sunset is tonight and the next sunrise is tomorrow, so the same subtraction gives the length of the night. Near the equinoxes the two are close, so nothing looked wrong. In a London summer it would show the length of the short night in the middle of the afternoon.

The refactor tried to fix it by stepping back to the previous sunrise whenever the sunrise's day of the month was later than the sunset's. That compared day numbers in the browser's time zone, not the place's, and the comparison fails at the end of a month, when the 1st is not greater than the 31st. And when there was no event at all, in a polar winter, `dayjs(undefined)` quietly became the current time, so a missing sunrise could show up as a plausible clock reading.

## A day belongs to a place

The rebuild starts from a place and a local date, and the place decides the time zone:

```ts
export const timeZoneAt = (location: Coordinates) => tzLookup(location.latitude, location.longitude);
```

`tz-lookup` maps coordinates to an IANA zone name such as `Asia/Kathmandu` or `America/Havana`, and that name carries the whole history of the zone's offsets and daylight saving rules. The selected date then becomes two instants: the local midnight that starts it and the local midnight that starts the next date. Sunrise and sunset are whatever happens between those two instants.

That interval is not always 24 hours. In London, 29 March 2026 is 23 hours long and 25 October 2026 is 25, and the panel says so: "This date lasts 23h 00m because the clocks change." The bar chart is scaled to the real length of the day, so its quarter marks fall on the right clock times either way.

## The midnight that happens twice

Finding local midnight sounds like one call to Day.js. It nearly is. Cuba ends daylight saving at one in the morning by turning the clocks back to midnight, so on 1 November 2026 Havana has two midnights an hour apart. Day.js picked the later one, and the day came out at 24 hours instead of 25. So `civilMidnight` checks for itself:

```ts
const offsets = new Set<number>();
for (let hours = -36; hours <= 36; hours += 6) offsets.add(dayjs(new Date(provisional.getTime() + hours * 3600000)).tz(zone).utcOffset());
const candidates = [...offsets].map(offset => new Date(Date.parse(`${date}T00:00:00Z`) - offset * 60000)).filter(instant => dayjs(instant).tz(zone).format('YYYY-MM-DD HH:mm:ss') === `${date} 00:00:00`);
return candidates.length ? new Date(Math.min(...candidates.map(instant => instant.getTime()))) : provisional;
```

The maths is simple once it is written down. If a zone is at offset o minutes from UTC, local midnight on a date is the instant "that date at 00:00 UTC" minus o. A zone only uses a handful of offsets around any given date, so the code samples the real offset every six hours across three days either side of Day.js's answer. Each distinct offset gives a candidate instant. A candidate is real only if converting it back into the zone reads exactly that date at 00:00:00. If more than one survives, the date had two midnights, and the earliest is where the day begins.

## The date that never happened

The same check catches a date that does not exist. At the end of 2011 Samoa moved across the International Date Line, from ten hours behind UTC to fourteen ahead, and went straight from 29 December to 31 December. There is no midnight on 30 December in `Pacific/Apia`. No candidate survives, the fallback instant does not read as that date, and `dayBounds` refuses it:

```ts
if (localDate(start, zone) !== date || end.getTime() <= start.getTime()) throw new Error('This date does not exist in the selected time zone.');
```

The panel then asks for another date rather than quietly showing a neighbouring day's figures under the wrong heading.

## Sunrise, sunset and the shape of the day

Within those bounds, the calculation has to cope with a day that has a sunrise and a sunset, only one of them, both twice or neither. It starts by asking which comes first after midnight, searching up to 370 days ahead:

```ts
const nextRise = search(1, start, 370);
const nextSet = search(-1, start, 370);
// ...
let daylight = Boolean(nextSet && (!nextRise || nextSet < nextRise));
```

If the next event is a sunset, the Sun is already up at midnight. Then it collects every rise and set inside the day, sorts them, and walks through them flipping between day and night, adding up the daylight intervals. A sunset-only day is daylight from midnight to that sunset. A day with no events at all is either continuous daylight or continuous night, depending on what that first comparison found, and a day that cannot be resolved is marked unavailable instead of being given a number.

The search itself is Astronomy Engine's `SearchRiseSet`, deliberately. The textbook way to find sunrise is the hour-angle equation:

```text
cos H0 = (sin h0 - sin φ · sin δ) / (cos φ · cos δ)
```

where φ is latitude, δ is the Sun's declination and h0 is the altitude that counts as rising, about minus 0.833 degrees once you allow for the Sun's radius and the bending of light by the atmosphere. Daylight is then 2 × H0 divided by 15 degrees an hour. The equation also shows where polar day and night come from. When the right-hand side is above 1 or below minus 1 there is no solution: the Sun never reaches the horizon. At Tromsø, at 69.65 degrees north, the Sun's declination at the June solstice is about 23.44 degrees, so even at midnight it is about 3 degrees above the horizon. In December the same numbers put noon about 3 degrees below it. The tests check both, along with a Greenwich midsummer of between 16.5 and 17.5 hours.

But that equation holds the Sun's declination fixed through the day. A search over the Sun's actual position handles the edges, the days where the Sun just grazes the horizon, without a separate threshold of my own. The code says so in a comment: use the library's own rise and set model, not a separate centre-altitude threshold.

## Hover to explore

Moving the pointer over the globe previews a place, and leaving the globe returns to the pinned one. Pointer events arrive far faster than anyone can read a panel, so they pass through a small throttle that keeps only the latest value and calls back at most once per animation frame:

```ts
push(value: T) {
  latest = value;
  if (frame === null) frame = schedule(() => { frame = null; callback(latest); });
},
```

Coordinates are wrapped into the range minus 180 to 180 and rounded to four decimal places, about 11 metres, which is far finer than sunrise can tell apart. Hover only applies to a fine pointer. On a touch screen a tap pins a place, and the map uses Mapbox's cooperative gestures so a one-finger swipe scrolls the page instead of trapping it.

The globe turns slowly until it is touched, one easing call chained to the end of the last:

```ts
instance.easeTo({ center: [center.lng - SPIN_DEGREES, center.lat], duration: SPIN_MS, easing: t => t });
```

Six degrees every four seconds is a full turn every four minutes, and the linear easing keeps the joins invisible. A mouse press, a touch, the wheel, a drag or a hover stops it. With reduced motion it never starts, and choosing a place jumps there instead of flying.

## Fitting the globe to the space

Mapbox describes size by zoom level. At zoom z the world is 512 × 2^z pixels round, and on a globe that circumference is π times the diameter. To make the globe fill 80% of the free space:

```ts
const diameter = Math.max(1, Math.min(width, height)) * 0.8;
return clamp(Math.log2((diameter * Math.PI) / 512), 0.3, 2.6);
```

On wide screens the daylight panel floats over the right of the map, so the map gets 452 pixels of right padding and the globe centres in the space that is left. On phones the padding moves to the top. Both values live in CSS custom properties, which the code reads and reapplies whenever the map resizes, so the layout has one source of truth.

## The map follows the colour scheme

The page follows the system's light or dark setting, and so does the globe. A media query hook built on `useSyncExternalStore` reports the scheme, and the map swaps between Mapbox's light and dark styles:

```ts
instance.on('style.load', () => instance.setFog(fogForScheme(schemeRef.current)));
```

Swapping a style replaces everything that lives on it, including the atmosphere around the globe, so the fog is reapplied each time a style finishes loading. The pin is a DOM marker rather than a map layer, so it survives the swap untouched. The fog's space colour is the page background, `#f4f1eb` in light and `#0f171d` in dark, so the globe sits on the page instead of in a box, with stars in the dark sky only.

The scheme is read through a ref, so changing it does not tear down and rebuild the map. And Mapbox's own stylesheet, which loads lazily with the map, sets `.mapboxgl-map { position: relative }`. Arriving after the page's CSS, that collapsed the full-bleed map, so the page's rule is written two classes deep to win on specificity.

## A detour I came back from

The first rebuild made the map optional: a flat Mercator panel behind a Load interactive map button, click only, always dark. The calculations were right and the page worked without the map. But the hover was the reason Day Lite existed, sliding across a continent and watching the day stretch and shrink. The released version brings the globe back as the main view, loads it straight away in its own chunk so the page paints first, and keeps the panel, the date picker, the example places and the coordinate form for anyone who would rather not use a map. If the map cannot load, the daylight still can.

## What it taught me

A day is not 24 hours, midnight is not unique and a date is not guaranteed to exist. None of that is astronomy. The Sun was always the easy part, because a well-tested library does it. The work was in the civil layer between the Sun and the clock, and in writing tests for the strange days, Kathmandu, Havana, Apia, Tromsø, so that the ordinary ones are right for the right reasons.
