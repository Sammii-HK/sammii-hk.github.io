---
title: "Why this take won: making a selection score readable"
description: "Inside Post Ready's phrase scoring: word coverage, fillers, pace and gaze, with worked examples and an interactive way to inspect the trade-offs."
date: '2026-11-20'
tags: ['javascript', 'product-design', 'video', 'explainability']
draft: true
lab_url: 'https://sammii.dev/experiments/why-this-take-won/index.html'
---

“Best take” sounds like a single judgement. In an editor it can mean several things: the words are complete, the speaker looks at the camera, there are fewer fillers, or the sentence lands well. Those qualities do not always agree.

[Why this take won](https://sammii.dev/experiments/why-this-take-won/index.html) opens up one small part of that decision. It is a JavaScript port of the phrase-selection rules from Post Ready 1.0.1, based on `MultiTakeAssembler.swift` at commit `3fff237a`. Three invented takes go through the same scoring logic, and you can see each contribution to the winning score.

The takes and script are synthetic. They are there to make the rules legible, rather than to demonstrate speech recognition on real recordings. The demo can explain why a rule chose a phrase. It cannot establish that the result sounds funnier, warmer or more convincing.

## Choose at the scale of a phrase

The first decision is what to compare. Choosing one entire recording would discard a useful sentence because another part went badly. This selector divides the script into phrases, then scores candidate windows for each phrase separately.

The splitter is deliberately small. Sentence punctuation ends a phrase. A comma, semicolon or colon can end one once it has at least three tokens. It can also split before conjunctions such as “and”, “but” and “because”, with a maximum of fourteen tokens. The final token always closes the remaining phrase.

That is a heuristic over words and punctuation, rather than a grammatical parser. It is understandable, cheap to run and easy to inspect. It will also meet sentences whose natural spoken rhythm does not match its boundaries.

The demo's invented script becomes five phrases. With the default settings, the selected sequence is Take 2, Take 1, Take 3, Take 3, Take 2. A single “best recording” label would hide why those pieces came from different places.

## Four components, one total

For each candidate, the score is the sum of four terms:

```js
const total = coverage + filler + pace + gaze;
```

The useful part is the meaning of those terms. Coverage rewards recognised script words. Fillers subtract a fixed penalty. Pace rewards closeness to a target rate, then penalises larger deviations. Gaze adds a supplied bonus.

Keeping the components visible means a winner has an explanation. It also reveals the preferences encoded in the weights. A total is not an independent measurement of performance quality; it is the result of those preferences.

### Coverage asks which distinct words were heard

The function lowercases words and strips punctuation from their ends. It puts the expected words and heard words into sets, then counts how many distinct expected words appear in the heard set.

Here is an extracted version of that calculation, with its inputs simplified to arrays of strings:

```js
const normalise = word =>
  word.toLowerCase().replace(/^\p{P}+|\p{P}+$/gu, "");

function coverageScore(expectedWords, heardWords) {
  const expected = new Set(expectedWords.map(normalise));
  const heard = new Set(heardWords.map(normalise));
  let hits = 0;

  for (const word of expected) {
    if (heard.has(word)) hits++;
  }

  return expected.size === 0 ? 1 : hits / expected.size;
}
```

Sets make the limitation quite precise. “We need this now” and “now this need we” contain the same distinct words and receive the same coverage score. Repetition does not earn extra credit. An extra unrelated word does not directly reduce coverage, although it can affect pace. A transcript error is still an error as far as the matcher is concerned.

That is useful when reading a result. A coverage of 1 means all distinct expected words were found. It does not certify their order, pronunciation or meaning.

### Fillers have a visible price

Each word marked `isFiller` subtracts 0.4 at the default setting. Two flagged words therefore contribute -0.8. The scorer consumes that label; it does not decide from the spelling alone whether an “um” was an accidental hesitation or part of the script.

That distinction matters because the invented script actually includes the word “um”. The scoring function needs the upstream annotation to describe what happened. A small pure function can be fully transparent and still depend on assumptions made before its input arrived.

### Pace has a target and a tolerance

Pace uses all recognised words in the candidate window divided by its duration in seconds. Fillers still count as words for this calculation. The default target is 2.58 words per second.

At that target, pace contributes +0.2. At a deviation of 0.8 words per second, the contribution reaches zero. Beyond that, a penalty grows until it reaches -0.6. This is the default curve written as a standalone function:

```js
function paceScore(wordsPerSecond) {
  const delta = Math.abs(wordsPerSecond - 2.58);

  if (delta <= 0.8) {
    return 0.2 * (1 - delta / 0.8);
  }

  return -0.6 * Math.min(1, (delta - 0.8) / 1.2);
}
```

For example, 2.58 gives +0.2, 3.38 gives approximately zero, and 4.58 reaches -0.6. Because it uses absolute deviation, the same distance below the target receives the same score.

This encodes a preferred delivery rate. It does not know whether a pause carries the joke, whether an unfamiliar term needs space, or whether a brisk passage suits the speaker. Those are reasons to make the preference inspectable.

### Gaze is a supplied signal

The final term is a gaze bonus passed into the scorer. The demo's gaze multiplier adjusts that contribution before scoring. The function shown here is not performing eye tracking or inferring confidence from a face.

This boundary keeps the explanation honest. “Gaze contributed +0.2” is a description of the input and rule. It is not proof that the person communicated better.

## Work through a real calculation from the demo

The first invented phrase begins “I spent the weekend teaching a computer to choose my best take”. This is example script copy, not a claim about a particular weekend. It has twelve distinct expected words after normalisation.

At the default weights, the three candidate windows produce these values, rounded to three decimal places:

| Component | Take 1 | Take 2 | Take 3 |
| --- | ---: | ---: | ---: |
| Coverage | 1.000 | 1.000 | 0.917 |
| Fillers | -0.800 | 0.000 | 0.000 |
| Pace | 0.084 | 0.155 | -0.029 |
| Gaze | 0.000 | 0.200 | 0.000 |
| Total | **0.284** | **1.355** | **0.888** |

Take 2 wins because it has complete coverage, no flagged fillers, a pace near the target and a gaze bonus. Take 1 also covers the words, but its two fillers carry a substantial penalty. Take 3 misses one distinct word and runs faster than the preferred range.

The table makes the explanation much more useful than “Take 2 scored highest”. You can disagree with the filler penalty or decide that the missing word is unacceptable. The rule remains open to inspection.

There is a sharper example in the third phrase. One candidate misses “said”, giving it coverage of 0.875, yet its gaze and pace contributions let it outscore another candidate with complete coverage. It does not win that phrase overall, but the pairwise comparison shows that the score permits compensation between components.

If missing any scripted word should disqualify a candidate, changing a weight may be the wrong intervention. An explicit eligibility rule would express that requirement more clearly. The current function is an additive preference model, not a completeness guarantee.

## Make adjustments reveal consequences

The interactive controls let you change the filler penalty, gaze multiplier, target pace and largest pace penalty. They change the demonstration only; they do not update the app's settings.

A useful way to explore is to pick a phrase, predict which take will benefit from an adjustment, and then move one control. Raising the filler penalty should only directly change candidates with flagged fillers. Setting gaze's multiplier to zero removes its contribution. Moving the target pace changes which delivery receives the pace reward.

Stable winners are informative too. A knob that moves a number without changing a choice may still affect the margin between candidates. A close score is not a calibrated confidence level, though. It is simply a close result under these particular rules.

The demo resolves exact ties by keeping the earlier candidate: its comparison only replaces the winner when the new score is strictly greater. That is a deterministic convention, with no additional claim about quality.

## Let the explanation stop at its boundary

The small functions in [the demo source](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/public/experiments/why-this-take-won/score.mjs) make concrete checks possible. Complete coverage should score 1. Two flagged fillers should subtract 0.8. The pace curve should meet at zero without a jump. A reviewer can calculate those cases independently.

None of those checks can tell us whether a cut feels natural. Nor can a synthetic example establish the accuracy of the transcription or gaze signals in a real recording. Those need their own evaluation.

The value of this interface is that it gives a person something specific to judge. It turns “the computer preferred this” into a visible set of trade-offs. The final choice still belongs to the person making the video, who can hear what these four numbers leave out.
