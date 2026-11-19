---
title: "Why the loading label never shows"
description: >-
  The event loop, for interfaces: a Save button that never says Saving, a CSS animation that survives a busy page while a JavaScript one freezes, and then the rules underneath, stepped through until 1, 4, 3, 2 makes sense.
date: '2026-12-02T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - javascript
  - performance
series: "The browser and the machine"
chart: "event-loop"
draft: false
---

You click Save. The button freezes. It never says "Saving…". Then, all at once, it says "Saved".

The code definitely set the label to "Saving…" first. You can see the line. It just never reached the screen.

The chart's notes call it the single most common loading-state bug in the wild, and it is the first thing on [labs.sammii.dev/charts/event-loop](https://labs.sammii.dev/charts/event-loop/). It opens with what the event loop does to an interface, with real work and real frames, and only then steps through the rules.

## The one true thing

The browser runs one task at a time on the same thread that paints. It paints between tasks, never during one.

So if you set the label and then do 400 ms of work in the same task, the label is set, the work runs, the label is set again to "Saved", and only then does the task end and the browser get a chance to paint. By that point the only thing to paint is "Saved".

Every stutter, every spinner that never appears, every click that seems to do nothing for a moment is that same fact wearing a different costume.

## Feel it first

The top half of the chart is three live demos and one slider, **Main-thread work per click**, from 50 to 1,500 ms in steps of 50. It starts at 400. The work is real: a synchronous loop that runs on the main thread until that many milliseconds have passed.

**1 · The label that never shows.** A button labelled Save. Click it and it sets its text to "Saving…", does the work in the same task, then sets "Saved". You never see "Saving…".

**2 · The fix: let it paint first.** The same work, but scheduled after `requestAnimationFrame` and then `setTimeout`. The rAF callback lands in the next frame; the timeout it queues is a task, which runs after that frame has painted "Saving…". The loading state exists because the loop was given a turn.

**3 · Two animations while you click.** Two balls sliding along two tracks. One is a CSS transform animation. The other is moved from JavaScript, one `requestAnimationFrame` at a time. Click either button above and the CSS ball keeps moving, because the compositor runs it off the main thread. The JavaScript ball stops dead until the task ends.

Next to the slider is a meter: the longest frame gap in the last second and a half or so, measured from the gaps between requestAnimationFrame callbacks. It says "(smooth)" or "(dropped frames)". I am not going to tell you what number you will see, because it is your machine doing the work. Click the first button with the slider at 1,500 and watch the meter.

That third demo is also the event loop's argument for `transform` and `opacity`. They are the animations that survive a busy page, because they do not need the thread that is busy.

## The rules underneath

The bottom half is a stepper. Three snippets sit in tabs: **The classic**, **Microtasks starve the loop** and **rAF is not a task**. Each one is run through a small model of the loop, drawn as four boxes and a line: the Call stack, the Microtask queue ("drains completely before the next task"), the Task queue ("setTimeout, events, I/O"), the rAF callbacks ("run in the render step"), and a Render line for style, layout, paint and composite. The console sits on the right. **Reset**, **Back** and **Step** walk through it one change at a time.

**The classic** is four lines:

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
```

The console reads 1, 4, 3, 2. The whole script is one task. The promise queues a microtask, the timeout queues a task. Microtasks drain the moment the script's stack empties, before any other task can run, so 3 prints before the timeout's 2, even at 0 ms.

**Microtasks starve the loop** queues a timeout, a frame, a promise chain that logs a then b, and a `queueMicrotask` that logs c. The console reads a, c, b, timeout, frame. Running a queues b, and b joins the back of the same drain, behind c. Only when the microtask queue is completely empty does the loop take the next task. Chain enough promises and the page never gets to render.

**rAF is not a task** registers a frame callback that registers another, and a 0 ms timeout. The timeout is a task and is due at once, so it usually runs before the next frame. The second rAF callback, registered during a frame, waits for the next one: a whole refresh, about 16 ms, after the first. rAF is tied to rendering; tasks are not.

## How it is built

The stepper does not run your code in the browser's real loop. It runs each snippet against a fake API (log, setTimeout, promise, rAF, queueMicrotask) that records what would be queued, then replays the HTML specification's processing model in miniature: run a task to completion, perform a microtask checkpoint, then, if there is a rendering opportunity, run the animation frame callbacks and update the rendering, then take the next task. Every step is a snapshot of the call stack, the three queues and the console.

The demos are the opposite: no model at all, just a busy loop and a frame meter.

## What it does not do

The model treats a 0 ms timer as due before the next frame. That is what happens in practice, because frames are about 16 ms apart and the timer clamp is 1 to 4 ms, but it is a simplification. It also ignores task sources and priorities, which do not change these three orderings.

The demos measure your machine, so what you see depends on it. The dropped-frames label uses one fixed threshold, so on a high refresh rate screen it is a rough guide rather than a frame count. And the fix in demo two is the smallest one, not the best one. The notes say the better fix is to move the work off the thread with a Worker, or split it.

The chart is at [labs.sammii.dev/charts/event-loop](https://labs.sammii.dev/charts/event-loop/). Add `?focus=classic`, `?focus=starve` or `?focus=raf` to open the stepper on one snippet.

## Sources

- WHATWG HTML, section 8.1.7 Event loops
- Jake Archibald, Tasks, microtasks, queues and schedules (2015)
- Jake Archibald, In the loop (JSConf.Asia 2018)
- Philip Roberts, What the heck is the event loop anyway? (JSConf EU 2014)
