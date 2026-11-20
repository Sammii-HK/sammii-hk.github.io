---
title: "The countdown looked right until I timed it"
description: "Fixing a duration control in Kinetic led me through elapsed time, shared state and the difference between a working animation and a working interaction."
date: '2026-11-20'
tags:
  - design-engineering
  - animation
  - react
  - testing
draft: true
---
Kinetic had a countdown ring with three duration buttons: five, ten and thirty seconds. Changing the duration changed the number in the middle. Pressing Start made the ring empty.

It looked like a countdown. The duration buttons did not control how long it took.

The progress value was being sent towards zero with a spring. I had connected the selected duration to the displayed number without making it the source of elapsed time. The interface offered a choice that its behaviour did not honour.

I found this while reviewing the actual tools in my portfolio. The repair is in a local, unreleased Kinetic candidate. It is a small bug, but it gets at something I care about in design engineering: the relationship between what a control promises and what the system actually does.

## Make the duration authoritative

Kinetic is a collection of twenty-five motion studies. A spring belongs in that collection. A countdown also needs a way to know how much time has passed.

I separated those responsibilities. Starting a run records `performance.now()`. Each update compares the current reading with that start, subtracts the elapsed time from the selected duration and clamps the remainder.

This is the calculation in the local candidate:

```ts
export function countdownAt(
  durationSeconds: number,
  startedAt: number,
  now: number,
) {
  const total = Math.max(0, durationSeconds * 1000);
  const remaining = Math.max(
    0,
    Math.min(total, total - Math.max(0, now - startedAt)),
  );
  return {
    seconds: Math.ceil(remaining / 1000),
    fraction: total ? remaining / total : 0,
    complete: remaining === 0,
  };
}
```

The interval asks for an update every fifty milliseconds. That is a request to refresh the display, not a claim that the browser will call it precisely on schedule.

If an update arrives late, the calculation uses the time that has actually elapsed. It does not subtract one tick and quietly lose the delay. That gives the calculation a sensible response to a delayed callback without pretending I have exhaustively tested every background-tab condition.

The ring takes the remaining fraction. The displayed number rounds the same progress upwards to a whole second. Completion comes from reaching zero, rather than waiting for an animation to settle.

Changing the selected duration resets the run. Starting disables Start until the run ends or is reset. The interval is cleared when that running effect ends. Those decisions belong to the countdown's behaviour as much as the moving stroke does.

## Check the thing on the screen

A test of the arithmetic was useful, but I wanted to see the rendered control honour the choice too.

In the browser check, a five-second run showed Running with three seconds remaining at 2.105 seconds after starting. Start was disabled. At 5.260 seconds it showed Stopped with zero remaining, and Start was enabled again.

Those are observation times. They do not mean the timer has been measured as accurate to a thousandth of a second. They show that this sampled run used the selected duration and reached a coherent stopped state.

The pure regression checks cover the selected duration, elapsed-time boundaries and delayed updates. The browser check connects that calculation to the displayed number, the ring and the control state. I need both kinds of evidence because a correct helper can still be connected to the wrong part of an interface.

## Follow the keyboard after moving something

The same review found another version of that problem in the reorder study.

The list could move a row with a named move button. Moving a row to the top disabled its move-up button. The order was correct, but focus had been on the control that had just become disabled.

I changed the interaction to keep focus on the moved row. The final phone check confirmed the new order and focus on Spring physics. Checking only the array would have missed the experience of the person who moved it.

The dock had a related spatial problem. Focusing the last item magnified it, and the enlarged control could clip at the right edge. The repair gives the scroll region room for that scale change and brings the focused item into view. The final selected Settings control stayed inside the phone stage.

These were different bugs, with different fixes. Each appeared when I followed an interaction beyond its first visible success: after the row moved, after the dock item grew, after the countdown started.

## Let the studies be found

A collection also has to work before someone reaches the interesting control. The local gallery now has search, categories and permanent section links. It names examples that have been deferred rather than presenting an empty preview as a broken animation.

Previews initialise as they are approached. A visited preview stays mounted, so I am treating that as an improvement to initial loading rather than a complete budget for a long session of animations.

There is also a reduced-motion setting alongside the system preference. I have not certified every timing and opacity effect across all twenty-five studies. That is a separate job from confirming that the sampled countdown lasts for its chosen duration.

The part I want to carry into other products is the sequence of questions. What does this control promise? What owns that value? Where does focus go next? What happens when the chosen item grows, moves or disappears?

The countdown became more convincing when I stopped judging it by how convincingly the ring moved.
