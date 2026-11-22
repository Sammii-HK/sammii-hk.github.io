---
title: "When the browser became part of the explanation"
description: "The recorded changes that put real buttons, lagging search fields and browser measurements ahead of the diagrams in Labs, and how to keep a measurement honest about what it includes."
date: '2026-11-22'
draft: true
tags:
  - charts
  - design-engineering
  - javascript
  - performance
  - information-design
series: "The browser and the machine"
lab_url: "https://labs.sammii.dev/charts/event-loop/"
---

One of the most useful changes in Labs was a component moving down the page. The event-loop stepper stayed. A real button went above it.

The [21 September revision](https://github.com/Sammii-HK/sammii-hk.github.io/commit/339ba53a72d80354f21f6ae056db4b06370f392a) changed the page from “The event loop, step by step” to “The event loop, for interfaces”. Before the reader reached the queues and console output, they could click Save and watch a loading state fail to appear.

A few minutes later, [Big O received the same treatment](https://github.com/Sammii-HK/sammii-hk.github.io/commit/4f3da01b8e7b26f7d425e42ca297955ae7acb61f). Its curves stayed too. Two search fields appeared above them, each doing real filtering work, with a timer around the operation.

Those changes are a more specific development story than “the charts became interactive”. They already had controls. What changed was the evidence the reader encountered first: an explanation began with a consequence they could produce in their own browser.

## Let the reader encounter the problem

The original event-loop page opened with a small model of tasks, microtasks and rendering. The revised page added three demonstrations: a missing loading label, a version that gives the browser a chance to show the label before doing the work, and two animations exposed to the same busy main thread.

The sequence matters. Someone can now arrive with an ordinary interface problem, recognise the symptom, and then use the stepper to investigate its mechanism. The model still makes queue order inspectable. The demonstration gives the order a consequence.

The Big O revision makes a related move. A logarithmic chart explains how growth rates separate. A search field explains why a developer should care before the input reaches a mathematically interesting size. The new fields use the same generated items and selected IDs, then change the membership test inside the filtering loop.

A [subsequent planning commit that evening](https://github.com/Sammii-HK/sammii-hk.github.io/commit/567b4bf99f433e536964e8de6df0b518965919f1) recorded this as the collection's house rule: start with the visible interface consequence, use actual work or actual document elements where possible, and follow with the mechanism. That is documented editorial development, rather than a retrospective story inferred from similar-looking pages.

## A real result still needs a precise name

Adding a timer does not automatically make every label around it a measurement.

The [event-loop implementation](https://github.com/Sammii-HK/sammii-hk.github.io/blob/339ba53a72d80354f21f6ae056db4b06370f392a/app/src/components/charts/JankDemo.tsx) records gaps between `requestAnimationFrame` callbacks. Its longest-gap readout is an observation from the current session. Its classification of a gap as smooth or dropped uses a fixed threshold in the code.

Those are different claims. The observed intervals describe the cadence of callbacks. They are not a direct counter of completed pictures on the physical display. The [HTML rendering model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model) allows rendering opportunities to vary with refresh rate, visibility and browser decisions. A universal frame verdict would need more context than one fixed line.

The loading-state example has a similar boundary. Letting the label appear before expensive work is useful feedback. The expensive work can still occupy the main thread afterwards. The revised page's own notes recommend splitting the work or moving suitable work to a Worker. Making a wait visible and making an interface responsive are separate improvements.

Try [the event-loop page](https://labs.sammii.dev/charts/event-loop/) at a modest work setting. Compare the two Save buttons and watch the animation driven by JavaScript. The experiment is about scheduling under a controlled obstruction, not a diagnosis of every cause of a slow application.

## Decide what belongs inside the stopwatch

The [Big O component](https://github.com/Sammii-HK/sammii-hk.github.io/blob/4f3da01b8e7b26f7d425e42ca297955ae7acb61f/app/src/components/charts/AccidentalQuadratic.tsx) starts its timer before filtering and stops it after building the matching results. React updates happen afterwards, and only eight matching rows are displayed. The measured interval covers the synchronous filtering and membership work. It does not cover the complete journey from a physical keystroke to updated pixels.

The selected-ID `Set` is also prepared outside that timed interval and reused. That matches a particular interface design: selection changes less often than the search query. Building a fresh set for every query would answer a different performance question.

A minimal version of that comparison looks like this. This is a standalone illustrative example, with smaller generated data, rather than the production component. Run it in a browser console or a current Node environment:

```js
const items = Array.from({ length: 5000 }, (_, id) => ({
  id,
  label: `item ${id}`,
}));
const selectedIds = items.filter(item => item.id % 2 === 0)
  .map(item => item.id);
const selectedSet = new Set(selectedIds); // Reusable setup, not timed.

function filterAndMark(query, isSelected) {
  const result = [];
  for (const item of items) {
    if (item.label.includes(query)) {
      result.push({ id: item.id, selected: isSelected(item.id) });
    }
  }
  return result;
}

function measure(label, operation) {
  const start = performance.now();
  const rows = operation();
  const durationMs = performance.now() - start;
  return {
    label,
    durationMs,
    matches: rows.length,
    selected: rows.filter(row => row.selected).length,
  };
}

const results = [
  measure("array membership", () =>
    filterAndMark("item", id => selectedIds.includes(id))),
  measure("reused set", () =>
    filterAndMark("item", id => selectedSet.has(id))),
];
console.table(results);
```

Both rows should report 5,000 matches and 2,500 selected items. That checks that the timed operations did equivalent work before comparing their durations. The verification counts and console output occur outside the measured interval too.

Change the query to something selective, then try an empty query. Repeat in the opposite order. If you want to study the cost of rebuilding the set, put its construction inside a separately named measured operation. Keep the question visible when you move the stopwatch.

This is a small demonstration, not a benchmark suite. Engine optimisation, other work and timer resolution can affect a sample. [`performance.now()` uses a monotonic clock](https://www.w3.org/TR/2026/WD-hr-time-3-20261106/), but browsers can reduce its precision. Nor does JavaScript promise that every `Set` lookup takes one fixed step: the [language specification requires average access below linear growth](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-set-objects), leaving the implementation open.

## One chart can contain several kinds of evidence

The next day's [JavaScript-cost addition](https://github.com/Sammii-HK/sammii-hk.github.io/commit/4ad40302d5a3aa65c68baf89b4412bc38edcea8f) made this boundary especially visible. It generates source text, compresses it when the browser supports the operation, and times function construction and first execution. Then it combines those observations with other quantities to draw its bars.

Reading [the implementation](https://github.com/Sammii-HK/sammii-hk.github.io/blob/4ad40302d5a3aa65c68baf89b4412bc38edcea8f/app/src/components/charts/JsCost.tsx) gives each quantity a different status:

| Quantity | Where it comes from |
|---|---|
| Gzipped source size | Compression of the generated text in this browser, when available |
| Construction and first execution times | Timed operations on this machine |
| Download duration | A calculation from chosen bandwidth, round-trip delay and transfer size |
| Phone durations | The local timings multiplied by a selected factor |
| JPEG decoding duration | An estimate used for the comparison |

That mixture can be useful when it stays legible. A reader can ask how a larger transfer or a slower CPU assumption changes the picture. The phone buttons do not become measurements of actual phones, and the network buttons do not become a connection test.

The generated source also changes between runs. The source comment explains why: reusing identical text could allow compilation caching to dominate the comparison. Even the choice of whether a run is fresh or repeated belongs to the question being asked.

A synthetic bundle remains its own workload. It does not reproduce the imports, application state, DOM changes or rendering work of an arbitrary product. The useful conclusion is that transferred bytes and executed work are separate costs, with separate evidence behind their bars.

## Sometimes the browser supplies the behaviour, not the number

The [stacking-context chart](https://github.com/Sammii-HK/sammii-hk.github.io/commit/29dbf870ac1de3aed924ee010c8286981f9b56fa) takes another route. It uses ordinary elements and CSS so the browser itself determines whether a menu is covered. The accompanying paint-order panel is calculated from the component's rules. It is an explanation of that controlled scene, not a general browser inspector.

The [anchor-positioning follow-up](https://github.com/Sammii-HK/sammii-hk.github.io/commit/255c94b6861cd052f9a15fa2db9e873449c3dc18) adds actual popover behaviour and feature detection. A capability check answers whether this browser recognises the feature being tested. It does not establish that every menu layout, fallback or keyboard interaction has been validated.

The distinction is useful across the collection: a visible reproduction, an observed duration, a calculated model and an estimated scenario can all explain something. Each needs a name that preserves how the result was obtained.

Start with [the missing loading state](https://labs.sammii.dev/charts/event-loop/), continue to [the measured search fields](https://labs.sammii.dev/charts/big-o/), and then inspect [the JavaScript-cost comparison](https://labs.sammii.dev/charts/js-cost/). The development connecting them is an explanation becoming testable in the reader's hands, while the implementation keeps responsibility for saying exactly what the test covers.

## Read this as a series

This article is part of **The browser: from an input to a visible result**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Use [the keypress-to-pixel chart](https://labs.sammii.dev/charts/keypress/) to locate the delay, then [the event-loop model](https://labs.sammii.dev/charts/event-loop/) and [rendering-cost chart](https://labs.sammii.dev/charts/repaint/) to inspect different causes.
