---
title: "Day Lite"
description: "A daylight explorer built around civil dates, polar states and a usable calculator that works without map tiles."
techStack: "React, TypeScript, Astronomy Engine, Day.js, tz-lookup, Mapbox GL, Vite"
updated: "2026-11-20"
status: "Unreleased local 895c163 / 273180a: actual offline calculator verified; configured maps and release remain unverified."
---

<!-- Kept in step with the canonical structured study in day-lite.json. -->

Unreleased local 895c163 / 273180a: actual offline calculator verified; configured maps and release remain unverified.

## The selected day is part of the calculation

Day Lite began as a map-led daylight sketch. The local repair turns the selected place and civil date into the calculation boundary. It uses bundled coordinate-to-time-zone data and Astronomy Engine rise/set estimates; the map is optional. Longitude divided by fifteen is no longer treated as a civil time zone, and moving a pointer is no longer the only way to choose a place.

_Actual unreleased offline calculator. The solar outputs are calculated locally; Mapbox tiles, geolocation and configured-map behaviour are not demonstrated._

## A missing sunrise is not the current time

- **What happened:** The earlier client could feed an absent event into Day.js and receive a plausible current-time value. It also compared day-of-month numbers and subtracted timestamps in the wrong direction.
- **Why:** Searching forward from now does not define the selected civil date. Taking an absolute negative duration or filling a missing event hides the boundary problem instead of resolving it.
- **Fix:** Validate the date and coordinates, define the local day’s start and end, collect events within those bounds and sum daylight intervals. A rise or set at the next day’s midnight belongs to that next day. Missing events remain missing, and an unresolved ordering is explicitly unavailable.

## Treat midnight as a civil boundary

The local day can last 23 or 25 hours, and some zones repeat midnight itself. A default ambiguous-time conversion selected the later Havana midnight and lost an hour in a regression.

- **Choose the first valid local midnight (chosen):** Inspect nearby actual zone offsets, select the earliest valid midnight and resolve the following date independently. Reject a skipped entire local date.
- **Add twenty-four hours to a convenient instant:** The result can describe the wrong local date or miss an hour around a civil-clock transition.

Regressions cover London’s 23/25-hour dates, Kathmandu’s non-hour offset, Havana’s repeated midnight and the skipped Apia date. These checks exercise specific rules in the runtime zone data, not every political boundary or historical calendar change.

## Polar day and night are results

Next rise/set ordering establishes whether the selected date begins in daylight, using the library’s own event model. The bounded search can distinguish continuous daylight from continuous night, including a day with only one event. If no usable ordering can be resolved, the result stays unavailable. There is no invented sunrise or claim that this measures terrain, weather or all real-world observing conditions.

_Actual local calculation at 390px, selected through native date keys. This is model output with a sea-level observer and standard refraction, not field observation or a configured-map demonstration._

_Actual typed coordinates plus Enter. Offline map state is preserved; no device location was requested._

## Keep the calculator usable without a map

The coordinate form, public example places and local-date controls work with a keyboard. Invalid input announces an error while retaining the last valid results. The local clock refreshes separately; Today follows the chosen zone and rolls at its midnight, while an explicitly selected date stays selected. Solar calculations are memoised by place and date rather than repeated for every clock tick or pointer move.

## Make the network boundary visible

Mapbox is lazy-loaded only after an explicit action when configured. Missing configuration and mocked load errors leave the calculator intact; map and marker resources have disposal paths. The actual browser review used an empty map token, no external stylesheet and a static preview with connect-src none. No tile request, permission, private calendar, actual location or provider call was used.

> Local 895c163 / 273180a passes 12 solar/UI tests, 11 canonical icon regressions, lint and the TypeScript/Vite build. Full and production-group dependency audits report zero findings. Actual Chrome desktop/390px checks cover zone-specific dates, invalid and valid Enter submissions, native date keys, polar states, Today, no document overflow and observed controls at least 44 by 44px. Configured Mapbox, physical virtual keyboards, wider assistive technologies and broad astronomy/time-zone accuracy remain unverified. The large optional map chunk warning is retained. No deployment occurred.
