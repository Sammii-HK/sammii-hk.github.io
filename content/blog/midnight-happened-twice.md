---
title: "My daylight calculator lost an hour at midnight"
description: "Repairing Day Lite meant deciding what a local day is, preserving missing solar events and testing the midnight that happens twice."
date: '2026-11-20'
tags:
  - engineering
  - design-engineering
  - testing
  - astronomy
  - day-lite
draft: true
---
I had a regression for a day in Havana that should span twenty-five hours. My daylight calculator gave it twenty-four.

I had already replaced its rough clock offset derived from longitude with a civil time zone. That was necessary, but it had not finished the job. On that date, midnight happened twice. The conversion had chosen the later one.

This came up while repairing Day Lite, a small browser tool for sunrise, sunset and daylight. The current repair is a local candidate. The calculations and offline interface have been checked; it has not been deployed.

## First, decide which day you mean

The original sketch selected an observer from the pointer position on a map. It used Astronomy Engine to search for solar events, then displayed times with an offset roughly calculated as:

```ts
Math.round(longitude / 15)
```

That is a rough geographic idea of an hour offset. It does not encode civil time-zone boundaries, daylight saving changes or places with offsets that are not whole hours.

There was another problem beneath the formatting. Searching forward from the current instant does not define the sunrise and sunset of a selected local date. After sunset, the next sunrise belongs to another date. A missing polar event might not belong to tomorrow either.

The calculator now starts with coordinates and a local date. Bundled coordinate data supplies an IANA zone name. That zone supplies the date's start and the next date's start. Solar events are collected within those boundaries.

The interval between those boundaries is not assumed to be twenty-four hours.

## A time-zone name did not remove the ambiguity

The normal DST cases were useful regressions: a London date lasting twenty-three hours, and another lasting twenty-five. Kathmandu checked that the code was not quietly assuming offsets in whole hours.

Then I added Havana's repeated midnight.

The first civil-date conversion used Day.js's zoned midnight directly. For the repeated boundary, it selected the later occurrence. The resulting date interval was an hour shorter than intended, despite using a real zone name.

The regression gives my `dayBounds` helper a concrete contract:

```ts
const day = dayBounds('2026-11-01', 'America/Havana');

expect(
  (day.end.getTime() - day.start.getTime()) / 3_600_000,
).toBe(25);
```

The repair checks actual offsets around the provisional boundary and keeps the earliest valid midnight for that local date. It resolves the following date independently. If a whole local date was skipped, the date is rejected rather than normalised into an apparently successful result for a different day.

Those are specific tested cases. They do not establish that I have independently audited every historical rule, territorial border or runtime time zone database. The coordinate lookup and the browser's zone data remain part of the model.

## No event is a result

The earlier component could pass an absent event into Day.js. An undefined date can become the current time, so “there is no sunrise in this search” could acquire a plausible-looking clock reading.

That is a particularly bad failure for a tool whose main job is to show a time.

The new calculation preserves missing events. It uses the ordering of the next rise and set to establish whether the selected date begins in daylight, then sums daylight intervals within the local day. A day can contain a rise, a set, both, or neither. A sunset-only day does not need an invented sunrise to produce a bounded interval.

The search is limited. If it cannot establish a usable ordering, the result is unavailable. The interface can then say so without filling the gap with the time now.

Astronomy Engine's [rise/set API](https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md) supplies the event model, including the Sun's visible limb and refraction assumptions. I have not added weather or local terrain observations. The result is a model estimate, not a record of what someone saw from a particular hillside.

## The interface needed the same boundaries

A correct helper would not be enough if the screen still suggested something else.

I added labelled coordinate and date controls, public example places and a local clock that refreshes independently of map movement. Today follows the selected zone; choosing a historical date leaves that date selected as the clock changes.

The map is optional. The local review used an empty map token and a static server with external connections blocked. The solar calculation still worked. Configured map loading and failures have mocked contract tests, but I did not request a location permission or send real user coordinates to prove the calculator.

In the actual browser pass, selecting Tokyo moved Today to the next date while London was still on the previous one. Native date keys selected Tromsø in December with no sunrise and zero daylight, then June with continuous daylight and no daily rise/set events. Typed Sydney coordinates changed the zone and hemisphere notation. Invalid input retained the previous valid result and explained the error.

Reviewing the phone capture caught one more mismatch: continuous daylight on a historical date had a moon icon. The icon had followed current-time membership rather than the selected day's condition. That is fixed too. It was a small illustration of the larger bug: the date being discussed has to stay attached to the result being shown.

The local candidate has twelve solar/interface tests, alongside the shared icon checks, lint and a production build. The phone-sized browser pass checked the actual controls and layout. Those checks make a concrete claim about this implementation. They do not turn a browser viewport into a physical-touch test, or a set of regression dates into an astronomy certification.
