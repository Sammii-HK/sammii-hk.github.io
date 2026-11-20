---
title: "From charts to explorable models: what changed in Labs"
description: "How Labs grew from a colour-space family tree into a collection of explorable models, and the specific changes that made the explanations easier to inspect, compare and trust."
date: '2026-11-20'
draft: true
tags:
  - creative-coding
  - information-design
  - design-engineering
  - science
lab_url: "https://labs.sammii.dev/explorations/"
---

Select a colour space and the chart lights up its ancestors. Pause two falling balls and the exploration lets you compare their positions at the same instant. Move a constellation through time and its original outline stays behind as a reference.

Those interactions ask different questions. The first reveals a relationship already present in the data. The others let you change a condition and inspect a calculated result. That difference explains a lot of what changed as [Labs](https://labs.sammii.dev/) grew: the work moved beyond arranging information towards making the assumptions behind an explanation available to play with.

There is a useful history in the code. It includes a shared renderer, a small but consequential touch fix, a larger star catalogue and a common home for fifteen scientific explorations. It also includes boundaries. The commit history shows when the explorations were integrated into this site; it does not establish that each one grew out of an earlier chart.

## A second family tree changed the first abstraction

The [first chart commit, on 21 September 2026](https://github.com/Sammii-HK/sammii-hk.github.io/commit/54eb6089b454e4a3b0495462ab782ddb3819cee7), introduced twenty-five colour spaces. Time ran horizontally, purpose determined the lane, and edges distinguished derivation from influence. A year scrubber revealed the tree gradually; inspecting a node exposed its relationships.

That is a particular explanation with a particular vocabulary. A colour space has transformations, coordinates and purposes. A typeface has exemplars, family resemblances and historical influences. Sharing a drawing does not make those histories interchangeable.

Later that evening, [the typography chart introduced a generic `LineageTree`](https://github.com/Sammii-HK/sammii-hk.github.io/commit/8449376a81c47976c983ad7289d09a87faa49bd0). The reusable part accepted nodes, lanes, dates, edges and a function for the information panel. The typography version could stretch crowded centuries and show live font specimens; the colour version could show colour ramps.

One small distinction in that implementation matters: tracing ancestry follows descent edges. An influence can light up its own connection without becoming an ancestor. Otherwise, a shared renderer would quietly strengthen the historical claim whenever it followed a dotted line.

Open the [colour tree](https://labs.sammii.dev/charts/colour-spaces/) and [typography genome](https://labs.sammii.dev/charts/typography/) beside each other. The navigation feels related, while the information panel answers a different question. That is the useful level of reuse: keep the interaction familiar and let the subject retain its meaning.

## The explanation needed a stable place to sit

Another [September change](https://github.com/Sammii-HK/sammii-hk.github.io/commit/1577135870e91f43f3ecb389959a5492a0b8d7f9) added focused links, a presentation mode, chart facts through an API and information panels that stopped resizing the page.

These are modest features individually. Together, they make an explanation easier to point at. A focused link can start another reader on the relevant node. A panel that keeps its space lets the reader compare two entries without the surrounding page jumping. Presentation mode gives the same chart a cleaner recording surface.

This is also where a collection becomes more demanding than a set of isolated sketches. Consistency starts to mean something operational: a reader expects the next chart to preserve their orientation, and another tool needs a reliable way to discover what exists. The September implementation supplied both a visual frame and machine-readable chart facts.

## A tap should leave the thing selected

The [20 October touch correction](https://github.com/Sammii-HK/sammii-hk.github.io/commit/d5e37864f3e87b50a31cb7de6fdf7d23a405e94f) is a particularly good example of development that a finished screenshot cannot show.

Rows in the spectrum and perception timelines could open on hover and then toggle on click. Those behaviours disagreed about the meaning of the interaction. If the pointer interaction had already selected a row, the subsequent click could close the detail that the reader was trying to inspect.

The correction made selection repeatable: selecting the same row again kept it selected. The change also used `aria-pressed` for the selected button state, and connected the spectrum buttons to their detail panel.

A minimal version of that selection pattern looks like this. This is an illustrative React component, rather than a copy of the chart:

```tsx
import { useId, useState } from "react";

type Row = { id: string; title: string; explanation: string };

export function InspectableRows({ rows }: { rows: Row[] }) {
  const panelId = useId();
  const [selectedId, select] = useState(rows[0]?.id);
  const selected = rows.find(row => row.id === selectedId);

  return <>
    {rows.map(row => {
      const choose = () => select(row.id);
      return <button key={row.id} type="button"
        aria-pressed={row.id === selectedId}
        aria-controls={panelId}
        onMouseEnter={choose} onFocus={choose} onClick={choose}>
        {row.title}
      </button>;
    })}
    <p id={panelId}>{selected?.explanation ?? "Choose a row."}</p>
  </>;
}
```

The button still has its native keyboard behaviour. Pointer hover, keyboard focus and activation all express the same intent. A separate dismissal control would need a separate intent; repeated selection does not have to double as dismissal.

## More stars brought more kinds of uncertainty

The sky explorations record another concrete expansion. Their [source notes](https://github.com/Sammii-HK/sammii-hk.github.io/blob/7c067c19af94fe49de1008f5cf13a9afca579224/public/exploration-runtime/sources/sky.md) preserve an original seven-star Big Dipper sample and describe the catalogue assembled on 12 November: 756 measured stars supporting the modern constellation views, with 88 selectable patterns.

The seven-star depth view remains deliberately small. Its stars have strong parallax measurements. The broader catalogue contains measurements that cannot support the same confident distance calculation, including one negative measured parallax. That star can still participate in the sky-position and proper-motion illustration; the interface does not invent a distance for it.

Another source endpoint has no astrometric solution in the chosen catalogue. Its missing segment is disclosed and omitted. The original seven records remain an independent check against the expanded data.

This changes the meaning of “more complete”. Adding hundreds of points makes missing values, coordinate epochs, identification and uncertainty part of the interface design. The original sample becomes a useful regression baseline, while the wider view needs a more expressive account of what is known.

Try [the sky through time](https://labs.sammii.dev/explorations/constellations-through-time/) and then [the Big Dipper in depth](https://labs.sammii.dev/explorations/big-dipper-in-3d/). One changes elapsed years from the catalogue epoch; the other changes viewpoint through a static seven-star geometry. Their shared stars do not make those controls equivalent.

## A slider needs to say what it measures

The same issue appears across the world explorations. The [worlds source notes](https://github.com/Sammii-HK/sammii-hk.github.io/blob/7c067c19af94fe49de1008f5cf13a9afca579224/public/exploration-runtime/sources/worlds.md) distinguish physical seconds in the gravity comparison, a normalised daylight phase and illustrative progress through a plate-boundary sequence. The [surface evolution model](https://github.com/Sammii-HK/sammii-hk.github.io/blob/7c067c19af94fe49de1008f5cf13a9afca579224/public/exploration-runtime/sources/evolution.md) adds a synthetic history expressed in model millions of years.

They can all use a slider. They cannot honestly use the same unexplained “time” label.

In [the gravity room](https://labs.sammii.dev/explorations/gravity-on-other-worlds/), compare Earth and the Moon, then pause before both balls have landed. The useful constraint is one elapsed time and one metre scale. If each ball were instead animated through the same percentage of its own flight, the comparison would disguise the difference the model exists to explain.

In [plate tectonics](https://labs.sammii.dev/explorations/plate-tectonics/), the progress control sequences a process illustration. It is not a dated reconstruction of a particular continent. In [Worlds in Time](https://labs.sammii.dev/explorations/planetary-surface-evolution/), a scrubber visits stored numerical states; adding an impact recalculates the subsequent history while preserving earlier states.

A small type boundary can keep those meanings visible during implementation. This is a simplified example, not the runtime's existing API:

```ts
type Position =
  | { kind: "elapsed"; seconds: number }
  | { kind: "illustration"; fraction: number }
  | { kind: "synthetic-history"; modelMyr: number };

export function positionLabel(position: Position): string {
  switch (position.kind) {
    case "elapsed":
      return `${position.seconds.toFixed(1)} s elapsed`;
    case "illustration":
      return `${Math.round(position.fraction * 100)}% of sequence`;
    case "synthetic-history":
      return `${position.modelMyr.toLocaleString("en-GB")} model Myr`;
  }
}
```

Inputs still need range validation at the control boundary. The type gives the values distinct names; the visible label gives the reader the same distinction. Reusing a control should preserve the unit and the claim behind it.

## Give the model a home without rewriting it

The [19 November integration](https://github.com/Sammii-HK/sammii-hk.github.io/commit/7c067c19af94fe49de1008f5cf13a9afca579224) added fifteen standalone exploration pages and prepared two unpublished articles using the same runtime. Its review notes record that the imported model files were preserved byte for byte, with source hashes in a manifest.

The new work surrounded those models with introductions, control guidance, limitations, sources and related explorations. The shared stage also had to distinguish loading, readiness and failure. Its [message handling](https://github.com/Sammii-HK/sammii-hk.github.io/blob/7c067c19af94fe49de1008f5cf13a9afca579224/app/labs/explorations/ExplorationStage.tsx) checks the sender's window and origin; the readiness exchange handles a model loading before the parent page finishes hydration. A failed interactive view offers a retry, while the explanatory text remains available without JavaScript.

That is a different development problem from deriving a trajectory or drawing a constellation. A reusable model now needs a reliable lifecycle and an explanation that survives outside its canvas.

Read across the collection with those changes in mind: relationships in the [family trees](https://labs.sammii.dev/charts/colour-spaces/), consistent selection in the [perception timeline](https://labs.sammii.dev/charts/now/), explicit units in the [world models](https://labs.sammii.dev/explorations/gravity-on-other-worlds/), and preserved evidence in the [expanding sky catalogue](https://labs.sammii.dev/explorations/constellations-through-time/). The connection is a growing responsibility to make the reader's comparison meaningful. Every extra control gives them another question to ask, and gives the implementation another assumption to expose.

## Read this as a series

This article is part of **The browser: from an input to a visible result**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Use [the keypress-to-pixel chart](https://labs.sammii.dev/charts/keypress/) to locate the delay, then [the event-loop model](https://labs.sammii.dev/charts/event-loop/) and [rendering-cost chart](https://labs.sammii.dev/charts/repaint/) to inspect different causes.
