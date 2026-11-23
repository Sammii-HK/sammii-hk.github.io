---
title: "Designing the wait in an AI interface"
description: "Inside Prism's AI response component: a 400ms quiet window, gaps between stream events, cancellation races, readable output and a recorded answer that cites the wrong component."
date: '2026-11-20'
tags:
  - design-engineering
  - ai
  - react
  - state-machines
  - accessibility
draft: false
---
One of the recorded answers in Prism opens the wrong component. The question asks about the action menu's keyboard behaviour. Search returns Menu first. The model opens Radial menu, writes an answer and supplies a perfectly functional citation to Radial menu.

The request completes successfully. The answer still needs checking.

I kept that run in the [AI response demo](https://prism.sammii.dev/ai-response). It makes a useful test of the interface: can someone see what happened, inspect the source and decide whether the answer deserves their trust?

That question shaped more of the component than the typing animation did. Waiting for an AI response includes several different experiences: waiting for the first event, watching a tool run, reading partial text, sitting through a gap and deciding to stop. Each needs its own behaviour.

## Give the interface events it can explain

The response consumes an asynchronous stream with five event types: `text`, `tool_call`, `tool_result`, `error` and `done`. A text event appends a chunk. A tool call creates a step with a name and arguments. Its result updates that same step, matched by ID, and can attach sources.

Here is the shape of the event contract, abbreviated from the implementation:

```ts
type StreamEvent =
  | { t: number; type: "text"; text: string }
  | { t: number; type: "tool_call"; id: string;
      name: string; args: Record<string, unknown> }
  | { t: number; type: "tool_result"; id: string;
      ok: boolean; summary: string; sources?: Source[] }
  | { t: number; type: "error"; message: string }
  | { t: number; type: "done" };
```

The component can render “Opened dialog” because it received a call to `get_component` with `slug: "dialog"`. Expanding the step reveals those arguments. It does not invent a reassuring account of work the system has not reported.

A failed tool and a failed response are also separate. A tool can time out, display its failure and leave the model able to explain what happened. Treating every failed tool as the end of the whole response would lose that distinction.

## Two clocks, two different questions

Prism's waiting surfaces share two defaults: a **400ms quiet window** and a **2,000ms slow threshold**. These are implementation choices, not timings established by a usability study.

During the quiet window, the assistant is in `waiting`. Its response shell and Stop control can exist, but the “Thinking” label is withheld. If an event arrives sooner, the interface moves directly to the state that event describes. The whole interface does not disappear for 400ms, and the rule does not delay incoming text.

The longer threshold measures something different: **time since the last event**. Every tool call, tool result and text chunk updates `lastEventAt`. A timer checks that gap every 250ms and shows “Still working” with the elapsed seconds after it passes the threshold.

This matters for a response that takes twenty seconds but keeps producing useful output. Its total duration alone does not justify calling it stalled. Conversely, an answer can begin promptly and then go silent halfway through. Measuring the gap catches that second case.

The label only establishes that the client has not received another event. It cannot prove the server is still making progress. Stop remains available so the user can act on the uncertainty.

## Stop has to win the race

Aborting a request and protecting the interface from its late results are separate jobs. A source might already have queued an event when the user presses Stop.

The assistant hook keeps a monotonically increasing run ID. Starting a response captures the current ID; stopping, resetting or starting another response advances it. Before accepting an event, the hook checks that the event still belongs to the current run.

This is the relevant check from the stream loop:

```ts
for await (const event of source(ctl.signal)) {
  if (id !== run.current) return;
  lastEventAt.current = performance.now();
  dispatch({ type: "event", event });
}
```

Stop also aborts the source and moves the response into `stopped`. The reducer rejects further events once the response has settled. Running tool steps become failed steps labelled “Stopped”, rather than continuing to look active.

The text already received stays visible. If the reveal animation was behind the incoming stream, stopping exposes the received text immediately, so the answer does not appear to keep typing after Stop.

**Retry starts a fresh run.** The partial answer is preserved while the response is stopped or failed; it is not a saved conversation history that survives every subsequent attempt. That is an important limit of this component. A product that needs to compare attempts would need to retain them outside this single-response state.

## Smooth the delivery without hiding its end

Transport chunks are a poor reading rhythm. A burst can contain half a sentence; the next event might be a single word. Rendering those bursts directly makes the answer jump down the page.

Prism separates received text from revealed text. On each animation frame, it advances through a share of the outstanding characters, with a minimum advance so the last few characters can finish. A larger backlog catches up faster. Reduced-motion mode shows the received text directly.

There is a cost: smoothing adds a presentation delay after the network has delivered the words. The component keeps its `aria-busy` state until both the stream and the reveal have finished. Copy uses the received text, so its contents do not depend on the animation's current position.

This is a character-based reveal. It does not implement grapheme-aware pacing, and the animation advances per frame rather than using an elapsed-time rate. Those are useful boundaries to know before adapting it to more languages or treating its reading speed as identical across displays.

## A citation should expose the mistake

The renderer recognises numbered markers such as `[2]`. It creates a link only when a source with that number exists in the response's source data. An unmatched marker stays plain text.

In the wrong-source recording, source 2 really is Radial menu. The link works because the source exists. Following it exposes the mismatch with the question about Menu.

That is what this layer can offer: a way to inspect where an answer came from. It does not establish that the retrieved source was the right one, that the model used it correctly or that the answer is true. A successful `done` event cannot settle those questions either.

## Make the difficult runs repeatable

The demo replays five recordings made with a local `qwen2.5-coder:7b` model through Ollama. Calls use two tools over Prism's component registry: search the components, then retrieve a component's description.

In the successful Dialog recording, the first tool call arrives at **8,833ms** and the run ends at **31,933ms**. Those are timestamps from that recording on the recorded setup, not a benchmark for the model or a prediction for another machine. They give the demo real periods of waiting to render.

Replay preserves the relative event timing at real pace. The public demo defaults to **3× faster**, with a real-pace option; the tests can request another speed. Visitors replay stored events rather than generating another paid model call.

The failure scenarios have different provenance:

| Scenario | What actually happened |
| --- | --- |
| Wrong component | The recorded model selected Radial menu after search returned Menu first. The result is kept. |
| Tool timeout | The first component lookup was deliberately made to fail during recording. The model's subsequent response is its own. |
| Dropped connection | Replay deliberately cuts the Dialog recording at 24 seconds and emits an error. Retry plays the full recording. |

The timeout scenario's next attempt is a separately recorded run. It is not a live recovery taking place in the visitor's browser. Keeping those distinctions visible makes the demo more useful to someone trying to understand its behaviour.

## Test what the interface promises

The existing Playwright suite has seven AI-response cases: completion with sources, the quiet-window delay, a long silence, Stop and Escape, a tool timeout followed by another attempt, the wrong-source recording and a connection drop followed by Retry.

The quiet-window test measures from the click to the “Thinking” label inside the page, rather than trusting the test runner to observe a 400ms interval accurately. The Stop test checks that the retained paragraphs stop changing. The citation tests check actual link destinations.

For announcements, a polite, atomic live region stays empty while text arrives. It receives the complete answer after completion and reveal, or a short stopped/error message. The tests check the DOM status text. They do **not** establish how this behaves in an actual screen-reader session; that still needs testing with assistive technology.

These checks make specific promises inspectable. They do not demonstrate that people finish tasks faster or trust the interface more. I have not measured either outcome for this component.

The [implementation merged in Prism PR 33](https://github.com/Sammii-HK/prism/pull/33). Start with the [wrong-component scenario](https://prism.sammii.dev/ai-response), expand the tool step and follow its citation. It is a compact example of how a response can finish, look convincing and still leave the most important decision to its reader.
