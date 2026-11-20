---
title: "Moth: from a drawing gallery to an observatory"
description: "How the public view of Moth grew from a chronological drawing gallery into four views of one record, and what that change can honestly tell us."
date: '2026-11-20'
tags: ['ai', 'simulation', 'data-visualisation', 'typescript']
draft: true
lab_url: 'https://moth.sammii.dev/observatory.html'
series: 'AI engineering'
---

A gallery answers a satisfying question: what has she made? For Moth, the kitten in my persistent simulated world, it also leaves several questions open. What was recorded around a drawing? What had happened in that place? Was there a mistake, or an attempt to mend something? What did she believe about it?

The public view of Moth expanded to make those questions easier to ask. It began as a drawing gallery and became [Inside Moth](https://moth.sammii.dev/observatory.html), an observatory with four views of the keeper's record.

That development has a small, concrete history. Two commits on 30 October 2026 changed the Labs entry from “Moth's drawings” to “Inside Moth”. They show how the public interface was described and linked, rather than dating every change in the private simulation. Following that distinction makes the evolution more useful: we can explain what became inspectable without inventing a story about what was happening inside her.

## The first view put the drawings in order

The [first version of the Labs entry](https://github.com/Sammii-HK/sammii-hk.github.io/commit/059d960d6e0638e68596999764e3a27742462505) linked to `evolution.html`. It described every drawing Moth had kept, arranged oldest first, reconstructed from stored strokes. Beside the work were the ability scores associated with that day and the mistakes recorded afterwards.

That is already more informative than a grid of exported images. A picture can show the result of an attempt. The surrounding record can preserve some of the circumstances under which it happened.

The wording was careful about the result. The scores moved within a narrow band, so the chart fitted its axis to them. The description also explicitly declined to claim that she was improving. A chronological sequence was being shown; an improvement story was not being asserted.

The [second commit](https://github.com/Sammii-HK/sammii-hk.github.io/commit/642dada7de707aa51fc634af65eacb483fc62962), later that day, changed the destination to `observatory.html` and expanded the scope:

| What the public listing exposed | Drawing gallery | Observatory |
| --- | --- | --- |
| Main view | Kept drawings, oldest first | Drawings plus three further views |
| Context | Ability at the time and later mistakes | Places and episodes, mistakes and mending, recorded beliefs |
| Data relationship | Drawings reconstructed from keeper state | Four views of one record, fetched once |
| Explicit limits | Small score changes do not establish improvement | Missing records are acknowledged; improvement is still not claimed |

The shift is from looking at objects to looking at relationships around them. The drawings remain part of the view, but they no longer have to carry the whole explanation.

## Keep the marks separate from the picture of the marks

The keeper stores drawings as strokes, and the public view redraws them as SVG. That separation is useful because an exported image is only one way to display a drawing. A stored sequence of marks can be rendered again without treating the latest screenshot as the original record.

It also makes a boundary visible. Reconstructing stored strokes does not mean observing the whole act of drawing. There may be decisions, intermediate states or discarded marks that the record does not contain. The view can reproduce what was saved without claiming to replay everything that happened.

The gallery's chronological order has a similar purpose. It preserves sequence without automatically assigning a direction to it. A later drawing may be more detailed, use different marks or concern a different subject. “Later” does not by itself mean “better”.

For a system that changes over time, the ability associated with an old drawing should remain the ability recorded then. Replacing it with today's state would quietly rewrite the context. This is the distinction between a historical record and a dashboard that happens to display old artefacts.

## Four views should share one moment of observation

The observatory's description makes an unusually useful implementation detail explicit: it fetches one keeper record and builds four views from it.

That gives the panels a common input. If each independently requested state, a busy simulation could advance between those requests. The drawing panel might show one moment while the map described a slightly later one. Sharing a response does not prove that every upstream field was recorded atomically, but it removes one source of disagreement introduced by the interface itself.

A simplified TypeScript sketch of that arrangement looks like this. These are illustrative types and field names, not the private keeper's schema:

```ts
type Drawing = {
  id: string;
  createdAt: number;
  putAway: boolean;
};

type Snapshot = {
  drawings: readonly Drawing[];
  places: readonly unknown[];
  mistakes: readonly unknown[];
  beliefs: readonly unknown[];
};

function observatoryViews(snapshot: Snapshot) {
  const drawings = snapshot.drawings
    .filter(drawing => !drawing.putAway)
    .sort((a, b) => a.createdAt - b.createdAt);

  return {
    drawings,
    memoryMap: snapshot.places,
    mistakes: snapshot.mistakes,
    beliefs: snapshot.beliefs
  };
}
```

The function does not invent an explanation. It selects and arranges a shared input. Filtering creates a new array before sorting, so the original drawing sequence is not changed as a side effect of preparing the view.

There is room for much richer presentation around that boundary. The useful constraint is that a panel should be able to point back to the part of the record it represents.

## Give context its own place

The memory map attaches recorded episodes to places. That gives a visitor a way to ask what happened somewhere, rather than treating every event as an isolated item in a feed.

The mistakes view adds another kind of context: what was recorded as going wrong, and what was mended. The existence of that view does not mean every mistake has a repair or every repair worked. It means those records have somewhere to be inspected when they exist.

The beliefs view needs a particularly clear label. In the [current public case study](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/case-studies/moth.json), beliefs are distinct from the objective event record. They can attach significance to a coincidence and influence later choices. Displaying one is therefore displaying an assumption held by the simulation, rather than certifying that assumption as a fact about the world.

These views make it possible to compare different kinds of record without collapsing them. An episode says something happened. A belief says the system has an interpretation. A drawing is an artefact. None is a direct measurement of feeling.

## Absence should remain visible

The expanded listing specifies what to do when the keeper recorded nothing: the page says so. That is an interface decision with consequences for how the whole project is read.

An empty panel can invite a fluent explanation. Perhaps she forgot. Perhaps she did not care. Perhaps the event was unimportant. Those interpretations may be appealing, but an absent record does not establish any of them. A collection process might simply not have retained that information.

There is another deliberate absence: drawings she has put away are left out. Both versions of the listing preserve that rule. The public gallery is consequently a view of the kept work, rather than a promise to expose every artefact the simulation has ever produced.

That selection matters when comparing the drawings over time. If the visible collection is a subset, it should not be described as a complete experimental dataset. The observatory can still be useful. It just needs to remain clear about which window into the world it provides.

## A moving line is not an improvement claim

The original ability-chart description identifies a familiar visualisation problem. A zero-to-one axis can make small differences almost invisible. Fitting the axis tightly makes them legible, but also makes them look larger.

Consider an invented example: a score changing from 0.412 to 0.416. The absolute difference is 0.004. On an axis from 0.410 to 0.420, the same difference spans forty per cent of the plotted range. Both drawings can be mathematically consistent while producing very different impressions.

Neither scale establishes whether the underlying score measures artistic quality well. Nor does it establish that a difference is meaningful or persistent. That would require a defined measure, comparable observations and enough evidence to distinguish improvement from variation.

The public observatory description retains the qualification that the ability scores barely move. That gives the interface a more defensible job: let people inspect the record and its scale, while keeping the stronger claim open.

## Make development visible without supplying a plot

I have [written about the systems that give Moth possibilities](https://sammii.dev/blog/moth-a-world-of-possibilities/): beliefs, interests, practice and things that persist in her world. This companion follows the development of the view through which someone can examine part of that history.

The important change was the addition of context around the drawings. A visitor can move between an artefact, a place, a recorded mistake and a recorded belief, instead of asking a gallery alone to explain a changing simulation.

That remains different from demonstrating that she has become a better artist or establishing an inner experience. The public commits document the move from a drawing gallery to an observatory. The observatory's stated limits keep that change from becoming a larger claim than its record can support.

For the separate question of how a model earns its place in this system, continue with [The smallest model that does the actual job](https://sammii.dev/blog/moth-choosing-models-by-task/). That evaluation measures a decision contract. The observatory lets you inspect a history. Keeping those purposes distinct makes both easier to understand.

## Read this as a series

This article is part of **Systems that learn and choose**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Read this alongside [Moth's possibilities](https://sammii.dev/blog/moth-a-world-of-possibilities/), [task-specific model evaluation](https://sammii.dev/blog/moth-choosing-models-by-task/) and [the painting experiment](https://sammii.dev/experiments/teaching-a-computer-to-paint/index.html). They ask different questions about decisions, observation and evidence of improvement.
