---
title: "Teaching a computer to paint: what the baseline taught me"
description: "A reproducible painting experiment, from random shapes to pigment mixing and six AI art directors, and why a fixed brush schedule still mattered."
date: '2026-11-20'
tags: ['creative-coding', 'ai', 'javascript', 'art']
draft: true
lab_url: 'https://sammii.dev/experiments/teaching-a-computer-to-paint/index.html'
---

A computer can get very good at copying a picture without producing something that feels painted. That was the first useful result of [Teaching a computer to paint](https://sammii.dev/experiments/teaching-a-computer-to-paint/index.html). The first painter reduced its error dramatically. The image still looked like a filter.

The project follows the same synthetic sunset through four versions of a painting engine. The sunset is generated in code, rather than taken from a photograph. Keeping the subject fixed makes the changes easier to see: which decisions belong to the brush system, which belong to the palette, and what happens when a model gets to direct the work.

The final episode gives six models the same constrained job. They look at the target and canvas, then tell a deterministic painter where to work next. None finishes with a lower error than the fixed schedule. That result is interesting because the model's notes often make visual sense. Describing a useful change and spending a limited stroke budget effectively are different skills.

## Start with a loop you can explain

The first painter proposes an ellipse, triangle or curve, fits its colour to the target, nudges it, and keeps it if the canvas improves. Repeating this 6,000 times takes the recorded error from 24,690 to 1.68.

There is no understanding of mountains or sunsets in that decision. There is a candidate image and a number. A simplified version of the acceptance loop looks like this:

```js
// Illustrative structure, not the project's full renderer.
// renderStroke must return a new image without changing canvas.
function improve(canvas, proposeStroke, renderStroke, error, attempts) {
  let best = canvas;
  let bestError = error(best);

  for (let i = 0; i < attempts; i++) {
    const stroke = proposeStroke(best);
    const candidate = renderStroke(best, stroke);
    const candidateError = error(candidate);

    if (candidateError < bestError) {
      best = candidate;
      bestError = candidateError;
    }
  }

  return { canvas: best, error: bestError };
}
```

This is a useful baseline because its promise is narrow. Given a fixed error function, each accepted step improves that score. It does not promise pleasing marks, an interesting composition or a convincing surface. A rejection is easy to explain; a beautiful result is not guaranteed.

It also exposes a common mistake in creative tools: treating the measurable objective as the whole brief. Pixel accuracy was something I could count. The quality of a painted mark required changing the process.

## Put a painter's process into the brush engine

The second episode builds on Aaron Hertzmann's [1998 paper on painterly rendering](https://doi.org/10.1145/280814.280951). It works through five brush sizes, from large to small. Each scale uses a blurred version of the target, and the painter spends its effort in grid cells where the canvas still differs from that reference.

Blur is doing practical work here. A large brush should respond to broad colour regions. If it tries to reproduce every tiny edge, its scale and its instructions fight each other. Smaller brushes can pick up finer information later.

Curved strokes follow directions derived from the image. Bristle texture, paint running dry along a stroke, and a height map lit from the top left give the marks a surface. This version uses 20,229 strokes. That count describes the run; it is not evidence that more strokes are inherently better.

The awkward cases were more useful than the smooth ones. A stopping rule that asks whether the existing canvas already matches better than the brush does behaves badly on blank paper. Nothing matches yet. Early strokes dragged one colour across mountain ridges. An additional rule stops a stroke when the local target colour moves too far from the brush's own colour.

The sun created the opposite problem. Its flat interior offered little directional information, so the marks became aimless dabs. Taking direction from a much blurrier image gave the strokes a broader structure to follow around it.

Both fixes come from asking what information the rule actually has. A sensible rule can still be wrong for an empty canvas or an area with no useful local gradient.

## A restricted palette changes the problem

Episode three replaces unrestricted colour choice with mixtures of eight paints, using a Kubelka-Munk based pigment model. Each stroke has a recipe drawn from 10,340 possible mixtures. It is an approximation of pigment behaviour, with a specific palette, rather than a claim to simulate every physical paint.

The immediate consequence is that some target colours cannot be reached. The deepest navy in the sunset sits outside what those mixtures can produce.

At first, the planner kept trying anyway. It put down smaller and smaller marks in regions it could never fully correct. One run reached 112,519 strokes, with a gritty sky and an error that barely moved. The planner was being persistent about an impossible objective.

The useful fix was to let it see the target as its palette could reproduce it. That brought the stroke count back to about 12,000. The limitation remained visible in the finished picture, but the planner stopped treating it as a local mistake that another tiny brush might solve.

This is a transferable design problem. If an optimiser cannot reach the requested state, more iterations can make the output busier without making it better. A restricted font set, a fabrication process or a colour gamut can create the same mismatch. The objective has to acknowledge the available materials.

## Give the model a bounded directing job

For the final episode, the model never places individual strokes. It receives one image containing the target and current canvas on an A to J by 1 to 10 grid. It can return up to three notes per round, specifying a cell range, brush and reason. The existing painter carries those instructions out inside the selected regions.

A deliberately invented example of the instruction shape is:

```js
// An illustrative direction, not a quote from a recorded run.
const note = {
  cells: "D2:F4",
  brush: "medium",
  reason: "Refine the sun's boundary without repainting the sky."
};
```

This keeps the model's contribution inspectable. If a change goes wrong, there is a distinction between choosing the wrong region, choosing the wrong scale and executing the brush stroke. A free-form image generator would make those responsibilities much harder to separate.

Each director has roughly a 12,000-stroke budget and at most 14 rounds. It sees a 640-pixel view of a 1080-pixel canvas. It never receives the numerical error score. Every round preserves the view and notes, so the decisions can be examined alongside the result.

## What actually happened

The fixed schedule and all six directors used the same painting machinery. Here are the recorded final results from the [project case study](https://sammii.dev/projects/teaching-a-computer-to-paint/):

| Director | Strokes | Final error |
| --- | ---: | ---: |
| Fixed schedule based on Hertzmann's method | 9,949 | 19.6 |
| GPT-6.1-Sol, through Codex | 11,215 | 21.0 |
| GPT-6.1 Terra, through Codex | 10,994 | 24.4 |
| Claude Opus 5.5 | 7,874 | 27.2 |
| Claude Haiku 5.5 | 9,680 | 31.4 |
| Claude Sonnet 5.5 | 7,194 | 34.3 |
| GPT-6-Luna, through Codex | 9,189 | 35.6 |

Lower means closer to the palette-reachable reference under this episode's error measure. These numbers should not be compared directly with the first episode's error: the target representation and painting constraints have changed.

Every director initially covered the canvas, generally with large brushes. Five of the six focused on the sun in the second round. Their notes identified visible problems, and the broad pattern was recognisably coarse to fine.

The finish still favoured the fixed schedule. The closest models spent more strokes than that baseline. Two directors had a round that made the score worse. Sonnet briefly led at approximately the same stroke count early in the run, then fell behind. Those details matter more than declaring a winner from the final column.

This was one run per model, using one seed and one synthetic image. It is an experiment, not a benchmark of general painting ability. The models were also working without the metric that determined the table. A model that cares about a visually salient edge may allocate effort differently from a loop that systematically reduces numerical error.

## Keep the process reproducible

The painting engines use seeded, deterministic rendering. Episodes can be rendered again byte for byte, and the second episode's output is checked by hash after later changes to the shared engine. That does not mean a model will necessarily produce identical new instructions on another run. It means the recorded instructions and renderer can be examined without an uncontrolled animation changing the evidence.

Video frames are rendered offline and passed to ffmpeg. The demonstration does not depend on the frame rate of a screen recording. For a visual experiment, that distinction makes comparison much easier: a dropped frame should not look like a different painting decision.

The part I would carry into another tool is this separation of responsibilities. Keep a reliable process for the work it can do thoroughly. Give a model the decisions that benefit from interpreting an image or a brief. Preserve enough of both that a disappointing result can be explained.

The [interactive series](https://sammii.dev/experiments/teaching-a-computer-to-paint/index.html) lets you compare those layers directly. The most useful question is which part of the picture changes when the decision-maker changes, and whether that change serves the thing you actually wanted to make.

## Read this as a series

This article is part of **Systems that learn and choose**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Read this alongside [Moth's possibilities](https://sammii.dev/blog/moth-a-world-of-possibilities/), [task-specific model evaluation](https://sammii.dev/blog/moth-choosing-models-by-task/) and [the painting experiment](https://sammii.dev/experiments/teaching-a-computer-to-paint/index.html). They ask different questions about decisions, observation and evidence of improvement.
