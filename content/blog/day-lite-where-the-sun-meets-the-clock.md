---
title: 'Day Lite: where the Sun meets the clock'
description: 'Building a daylight globe with Mapbox and Astronomy Engine, and separating sunrise calculations from the much messier business of local time.'
draft: true
date: '2026-11-20'
tags: ["creative-coding", "maps", "astronomy", "javascript"]
lab_url: 'https://day-lite.vercel.app'
---

Move a pointer across a map and the coordinates change. That is the obvious part. In [Day Lite](https://day-lite.vercel.app), those coordinates also become a place to stand: an observer looking towards the horizon, waiting for the Sun to rise or set.

The prototype combines a Mapbox globe with Astronomy Engine. Hovering over a location updates its sunrise, sunset and daylight information. It begins near Greenwich and uses the current date. There is no date slider in this version; the small interaction is about moving through places while the date remains implicit. The [source is short enough to read in one sitting](https://github.com/Sammii-HK/day-lite/blob/main/src/App.tsx).

What makes the project interesting is the boundary between two kinds of time. Sunrise is an astronomical event. “07:42 locally” is a representation of that event under a set of human rules. Mixing those together too early makes an interface look more certain than its model deserves.

## A map can be an input device

The core interaction starts with Mapbox's `mousemove` event. The event provides a longitude and latitude, which become the observer location in React state. Mapbox handles the map and its interaction; Astronomy Engine calculates the Sun's rise and set events.

You can see that separation in the [Mapbox map API](https://docs.mapbox.com/mapbox-gl-js/api/map/): the map exposes events and geographical coordinates, but it is not the source of the sunrise calculation. A beautiful globe and an accurate astronomical model are separate responsibilities.

To explore the idea, start around the equator and move north or south. Then travel roughly along a similar latitude. The first movement changes the seasonal pattern of daylight strongly; the second changes where the place sits in the daily rotation. The precise values depend on the date and the model's event definitions.

Finally, move towards the polar regions. This is the most useful part of the exercise for a developer, because it exposes an assumption that is easy to bury in a component: there may be no sunrise or sunset in the next 24 hours.

The map is doing something a form would make cumbersome. It lets you ask a sequence of adjacent questions without repeatedly typing coordinates. That makes it excellent for exploration. A product built around exact locations would still benefit from search, coordinate entry and a way to pin a selection.

## Give the calculation a clear question

Astronomy Engine represents an observer using latitude, longitude and height above sea level. Its `SearchRiseSet` function searches forwards or backwards through a bounded time interval for a rise or set event. It can return `null` when that event does not occur within the search window.

That API is more precise than a variable called `sunrise` suggests. Which sunrise? The next one after now? The one on a selected local date? The start of the daylight interval that contains the current moment? Those are different queries.

Here is a minimal example that asks one specific question: find the next sunrise after a starting instant, then the sunset following it. It uses `astronomy-engine`, as Day Lite does, but it is a separate teaching example rather than the prototype's original date logic.

```ts
import { Body, Observer, SearchRiseSet } from 'astronomy-engine';

export function nextDaylightInterval(
  latitude: number,
  longitude: number,
  after: Date,
) {
  if (
    !Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
    !Number.isFinite(longitude) || Math.abs(longitude) > 180 ||
    !Number.isFinite(after.getTime())
  ) {
    throw new RangeError('Use valid coordinates and a valid date.');
  }

  const observer = new Observer(latitude, longitude, 0);
  const rise = SearchRiseSet(Body.Sun, observer, +1, after, 2);
  if (!rise) return { kind: 'no-rise-in-window' as const };

  const set = SearchRiseSet(Body.Sun, observer, -1, rise.date, 2);
  if (!set) return { kind: 'no-set-in-window' as const };

  return {
    kind: 'interval' as const,
    sunrise: rise.date,
    sunset: set.date,
    durationMinutes: (set.date.getTime() - rise.date.getTime()) / 60_000,
  };
}
```

The two-day search bound is a choice for this example, not a claim that every location has a rise and set in that period. The returned states preserve what was actually established. “No sunrise found in this window” does not mean “this location is permanently dark”.

The function also does not calculate daylight within a civil calendar day. To do that, first establish the selected day's boundaries in the relevant time zone, then account for which portions of daylight overlap that interval. Naming the function honestly prevents a convenient helper from acquiring a misleading meaning later.

The [Astronomy Engine documentation](https://github.com/cosinekitty/astronomy/tree/master/source/js#SearchRiseSet) also explains its horizon assumptions. It accounts for the apparent radius of the Sun and a typical atmospheric refraction correction. Local hills, buildings and actual weather conditions introduce differences that this small model does not resolve.

## Longitude is not a time-zone database

The original Day Lite code estimates a UTC offset by rounding longitude divided by 15. The geometric intuition is understandable: a full rotation is 360 degrees, and dividing it into 24 equal parts gives 15 degrees per hour.

That produces a rough longitudinal offset. It cannot identify the legal clock used by the people who live at that coordinate. Time-zone boundaries do not follow a tidy set of meridians, and daylight-saving rules are not encoded in longitude. Some civil offsets are not even whole hours.

This is an important limitation of the prototype's display. A calculated event can be useful while its formatted “local” clock time remains approximate. The interface should say which kind of time it is showing.

For a more complete version, the route would be: resolve the coordinate to an IANA time-zone identifier, calculate the event as an instant, then format that instant using the identifier. The [IANA Time Zone Database](https://www.iana.org/time-zones) exists because political decisions and historical rules cannot be recovered from a point's geometry.

Once you already have the correct identifier, the browser can format an instant for it:

```js
function formatLocalEvent(instant, timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(instant);
}

const event = new Date('2026-06-21T04:00:00Z');
console.log(formatLocalEvent(event, 'Europe/London'));
console.log(formatLocalEvent(event, 'Asia/Tokyo'));
```

The two lines format the same illustrative instant. They are not sunrise predictions for London and Tokyo. That distinction is exactly the point: the event and its representation are separate pieces of data.

[`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) accepts a time-zone identifier, but does not discover one from latitude and longitude. A coordinate-to-zone dataset or service remains a separate dependency, and its maintenance belongs in the design.

## Keep durations as durations

A daylight duration is elapsed time between two instants. It should be calculated before either instant becomes a formatted string. Strings such as `06:15` and `20:45` have lost their date, offset and ordering context.

The next step is to turn a positive total number of minutes into hours and remaining minutes. For display, a tiny helper is sufficient:

```js
function describeDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) {
    throw new RangeError('Expected a non-negative duration.');
  }
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  return `${hours}h ${minutes}m`;
}
```

This helper avoids taking the absolute value of a negative result to make it look plausible. If sunset precedes the selected sunrise, that is a pairing problem to solve. A friendly label should not hide it.

For polar conditions, a special state is more informative than an empty time or a made-up duration. It can explain that the requested event was not found and let the user broaden the date range. The exact wording should follow the calculation, rather than guess a seasonal explanation from a missing value alone.

## Hover has a cost and an access problem

Day Lite's current implementation updates React state on each map mouse movement, and the event calculations happen during rendering. That is straightforward to understand, but the amount of work follows the event rate.

For a richer interface, I would separate the moving pointer from the committed observer. The map can track smoothly while calculations update at a bounded rate, or the user can click to pin a place. Either design should keep the displayed coordinates visibly associated with the displayed result, so delayed work never looks like an answer for the wrong point.

Hover is also an incomplete input model. A touch user needs a clear tap or pin interaction. A keyboard user needs a way to choose a location without tracing the globe with a mouse. Named presets, latitude and longitude fields, and a readable result panel can all feed the same calculation function.

Those are useful extensions to this prototype, not features I am claiming are already implemented. They follow from taking the original interaction seriously: if the globe is the input device, the rest of the interface needs another route to the same question.

## The boundary is the interesting part

Day Lite makes a small astronomical calculation tangible. You move across a globe and see a different relationship with the Sun. The map invites exploration; the calculation gives that exploration a rule.

The most valuable lesson for me to articulate is where that rule ends. A horizon model has assumptions. A search has a time window. A date belongs to a time zone. A time zone belongs to a maintained body of civil rules. Making those boundaries visible gives the reader more understanding than another decimal place ever could.

[Explore Day Lite](https://day-lite.vercel.app) · [Read the source](https://github.com/Sammii-HK/day-lite)

## Read this as a series

This article is part of **Building a sky: from a view to a model**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Move between [the celestial map](https://celestial-map.sammii.dev), [Day Lite](https://day-lite.vercel.app) and [the sky in three dimensions](https://labs.sammii.dev/explorations/big-dipper-in-3d/). Each changes a different assumption about where a view comes from.
