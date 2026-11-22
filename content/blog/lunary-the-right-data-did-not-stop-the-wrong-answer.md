---
title: "Lunary: the right data did not stop the wrong answer"
description: "A wrong Moon sign exposed a gap between a validator for scheduled copy and a validator for conversation. The fix was a more precise contract for time, claims and delivery."
date: '2026-11-22'
tags: ['ai', 'typescript', 'testing', 'lunary']
draft: true
series: 'AI engineering'
project_url: 'https://lunary.app'
---

On 1 October 2026, Lunary's guide answered with the Moon in Scorpio. The computed position put it at 15 degrees Gemini. The reply also described a Scorpio ingress as a current transit.

The model had been given astronomical context. There was already a checker for generated social copy. Neither was enough to stop this answer being wrong.

The [public case study records the failure and repair](https://github.com/Sammii-HK/sammii-hk.github.io/blob/574bbec892621a4c4d810d8cf45268d213833a1e/content/case-studies/lunary.json). The useful part is the mismatch between the two jobs. A validator looking for an event within a date window was being asked to support a conversation about what was happening now. A Scorpio ingress existed within that window. That did not put the Moon in Scorpio at the time of the request.

This is a specific kind of reuse problem: the code can be functioning as designed while the meaning of “valid” changes around it.

## The data and the answer are different artefacts

Lunary computes planetary positions and supplies them to the guide as context. That gives the model a source for factual sky claims. It does not make every sentence the model writes a faithful transformation of that source.

There are at least two separate questions to ask. Was the relevant data available at generation time? Does the resulting answer agree with it? Passing the first check cannot stand in for the second.

The same pattern appears outside this product. An assistant may receive the correct stock count and still describe an unavailable item as available. A report generator may receive the right billing date and phrase it as a completed payment. Supplying a fact is an input decision. Checking the claim made from it is an output decision.

In Lunary, the repair adds a post-generation pass that reads recognised sky claims back out of the answer. It compares them with computed evidence, removes failing sentences and supplies a factual correction. The guide's prose is therefore an output to inspect, even when its prompt contained the right information.

## A nearby event is not a current position

The existing social-copy checker had a useful job. It could look for unsupported events, wrong dates and other contradictions in text intended for publication. A schedule naturally gives that work a window of relevant dates.

Conversation adds a more immediate promise. “The Moon is in Scorpio” is a position claim. “The Moon enters Scorpio next week” is an event claim with a future reference. Finding the event somewhere in a window does not settle the first sentence.

The change was to retain the useful event checks and add a stricter pass for chat. The request time anchors the check, while the wording can point to another time. A current position, a dated event and a reference to someone's birth chart need different treatment.

| Claim being made | Evidence it needs |
| --- | --- |
| A planet occupies a sign now | Computed position at the relevant current time |
| A planet enters a sign on a date | Computed event timing for that date |
| A planet occupied a sign at a past time | Evidence for the past time being discussed |
| A placement belongs to a birth chart | That chart's context, rather than today's sky |

The table is a contract, not an implementation of natural-language understanding. The difficult work is identifying which row a sentence belongs to, including when it contains more than one claim.

## Carry the subject and time with the claim

A useful small example starts after extraction, once a claim has an explicit kind. This TypeScript is an illustrative current-position checker, not Lunary's full text parser:

```ts
type PositionClaim = {
  kind: "current" | "natal" | "dated";
  body: string;
  sign: string;
};

type SkySnapshot = {
  asOf: string;
  positions: Readonly<Record<string, string | undefined>>;
};

function checkCurrentPosition(
  claim: PositionClaim,
  sky: SkySnapshot,
) {
  if (claim.kind !== "current") {
    return { status: "different-contract" as const };
  }

  const actual = sky.positions[claim.body];
  if (actual === undefined) {
    return { status: "unverified" as const, asOf: sky.asOf };
  }

  return {
    status: actual === claim.sign ? "matched" : "contradicted",
    expected: actual,
    asOf: sky.asOf,
  };
}
```

Given a snapshot with the Moon in Gemini, a current Gemini claim matches and a current Scorpio claim contradicts it. A natal Scorpio claim reaches a different contract. It has not been verified by this function, and it has not been rejected merely because today's Moon is elsewhere.

The missing-data branch matters too. If a body's position is absent, the result is unverified. Absence is not agreement. Returning a distinct status prevents a failed lookup from quietly becoming a successful check.

Keeping the snapshot time in the result makes the comparison inspectable later. “Matched” is incomplete without knowing which evidence it matched and when that evidence applied.

## The words still need interpreting

The actual checking problem is more involved than that helper. A sentence can say “your Moon in Scorpio”, “the Moon in Scorpio today” or “when the Moon is in Scorpio”. Those phrases can refer to a natal placement, a current factual claim or a hypothetical condition.

The public repair explicitly preserves natal references. Correcting someone's birth-chart placement to today's position would create a new error while appearing to enforce consistency.

Time needs the same care. An upcoming ingress should not become current just because it appears in the available event data. A question about an earlier date should not be answered against today's sky. A broad phrase about a week also has a different scope from an assertion about this instant.

This is where a deterministic checker earns a narrow description. It checks the claim forms and temporal rules it recognises. It is not a proof that every possible phrasing has been understood. “No recognised contradiction” is a smaller claim than “the whole answer is true”.

The practical response is to preserve examples that distinguish those meanings. A regression set should include a true current placement, a false one, a natal placement, a future event on the right day and an event assigned to the wrong day. Testing only a clearly wrong planet-sign pair would miss the boundary that caused the original failure.

## Correct the answer without inventing a new one

The repair described in the case study removes a failing sentence and adds a “Sky check” correction based on the computed position. That keeps the correction attached to something the system can establish.

There is an advantage to this bounded operation. Asking another model to rewrite the answer until it sounds correct creates another generation step to inspect. A deterministic correction can state the factual disagreement directly.

It also has a cost. Removing a sentence can leave an awkward transition, lose useful surrounding prose or expose that the rest of the answer depended on the rejected premise. Sentence-level correction is a specific repair strategy, rather than a guarantee that the surviving advice is coherent or useful.

The output therefore needs its own review surface: which sentence failed, what claim it contained, which computed fact contradicted it and what text replaced it. A bare success flag would hide the part of the process most useful for improving the system.

## Delivery needs an explicit contract too

Checking a completed answer and preventing unverified text from being seen are different delivery promises.

For a buffered response, a small pipeline can make the order explicit:

```ts
// Illustrative buffered delivery, not the streaming implementation.
async function deliverChecked(
  generate: () => Promise<string>,
  check: (draft: string) => Promise<{ text: string }>,
  save: (text: string) => Promise<void>,
  show: (text: string) => void,
) {
  const draft = await generate();
  const checked = await check(draft);
  await save(checked.text);
  show(checked.text);
}
```

Here the checker owns the text sent to both storage and display. If checking throws, the function reaches neither destination. The surrounding interface would still need to explain that failure to the person waiting.

A streaming interface has another state: text that has arrived before the final check completes. If those tokens have already been displayed, a correction must replace the visible answer as well as the saved one. That is useful recovery, but it cannot establish that the earlier words were never seen. If that stronger promise is required, unverified text needs to be withheld.

The distinction should stay visible when describing the product. A corrected final message is evidence of a completed check. It is not, on its own, evidence about every intermediate frame of the conversation.

## Test the boundary that actually changed

The most valuable regression here is the original mismatch: the Moon's correct current position, a different ingress inside the available window, and a reply that confuses them. That case distinguishes the new contract from the old one.

The next checks should cross the boundaries around it. Preserve a valid natal reference. Reject a current claim that borrows the same sign. Keep dates attached to future events. Confirm that storage receives the corrected text. Exercise a checker failure without silently returning the unverified draft.

None of that scores the guide's tone or establishes the value of an interpretation. It checks a smaller obligation: a factual sky claim should agree with the evidence for the time and subject it names.

The development lesson is that reuse needs a semantic check as well as a type check. A validator built for scheduled copy can contribute to a conversation, but the conversation still needs to define what current, future and personal mean. Supplying computed context addresses the input. Checking the generated claim addresses a different gap.

## Read this as a series

This article is part of **Systems that learn and choose**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Read this alongside [Moth's possibilities](https://sammii.dev/blog/moth-a-world-of-possibilities/), [task-specific model evaluation](https://sammii.dev/blog/moth-choosing-models-by-task/) and [the painting experiment](https://sammii.dev/experiments/teaching-a-computer-to-paint/index.html). They ask different questions about decisions, observation and evidence of improvement.
