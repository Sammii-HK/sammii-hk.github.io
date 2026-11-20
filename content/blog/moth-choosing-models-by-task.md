---
title: "The smallest model that does the actual job"
description: "Comparing Bonsai 2, Gemma 3 and Tev on local tasks, and discovering why a single accuracy score can reward the wrong behaviour."
date: '2026-11-20'
tags:
  - ai
  - local-models
  - evaluation
  - engineering
draft: false
---
I wanted to know which local model should do each job in my system. Not which one had the best reputation. Not which was largest. Which one could do the work, within the machine I actually have.

So I compared Bonsai 2 at 2B, 4B and 9B, Gemma 3 4B and Tev at 0.8B on tasks drawn from my own operation. The evaluation included classification, short summaries, chart-reading vision and reply-opportunity scoring. The production-shaped prompts mattered as much as the model names.

The goal was to find the smallest model close enough to the best result for a particular job. The first useful discovery was that the word “accuracy” was hiding several different questions.

## A summary has to keep the facts

The summary task asked for short bullets from internal state reports. The rubric checked that every figure in the answer appeared in the source, enough source figures survived, the result stayed within three bullets and it used no more than 90 words.

That is a bounded mechanical rubric. It does not establish that the summary is insightful, or that a number kept its correct meaning. It catches a useful class of failure without pretending to measure everything.

In the first 20-report batch:

- **Bonsai 2 2B:** 13/20 passed; 1.69 s median.
- **Tev 0.8B:** 12/20 passed; 0.88 s median.
- **Bonsai 2 4B:** 16/20 passed; 6.37 s median.
- **Bonsai 2 9B:** 15/20 passed; 6.73 s median.
- **Gemma 3 4B:** 17/20 passed; 7.07 s median.

The 2B model passed one more case than Tev in this batch. Tev was faster. The larger Bonsai model did not beat the smaller 4B candidate here, and Gemma had the most passes. These are small local samples, not a general ranking of the models.

I kept a second, disjoint summary batch too. Results moved: Gemma passed 35%, Bonsai 4B passed 50% and Bonsai 9B passed 65%. The retained results do not include a 2B or Tev run for that second batch. It would be misleading to compare their first-batch score against someone else's second-batch score.

## Saying no to everything can look accurate

The reply-opportunity set had 30 labelled posts, only eight of which were genuine opportunities.

Tev rejected all 30. Plain accuracy called that 73.3%, because it correctly rejected the 22 negative examples. It found none of the eight opportunities.

That is an excellent reason to keep the underlying counts beside the headline score. If the job is to find useful opportunities, an always-no classifier has not solved it.

Balanced accuracy gives equal weight to sensitivity and specificity. It puts that all-negative result at 50%. The evaluation code now calculates it alongside the other counts. A faster model returning a consistently unhelpful decision is not an operational win.

## Moth needs a different comparison

Moth, my persistent AI kitten, needs choices that fit the world she is currently in. A summary score says nothing about that contract.

The retained Moth decision replay used 25 contexts. Bonsai 4B and 9B each returned 22 accepted decisions. Their median times were 10.367 and 17.823 seconds respectively. Gemma 3 4B returned one accepted decision in that harness, at an 11.084-second median.

Those are acceptance counts. They are not scores for imagination, character or the long-term quality of her life. They establish whether the response met that particular decision interface.

The current keeper configuration uses Bonsai 4B as its main model, 9B for wondering and 2B in the shadow-model role. That is a task split, not a declaration that one size won everything.

## Keep the rubric attached to the claim

There is no single “model quality” hiding in this table. There are tasks, prompts, settings, outputs, validators, latencies and the failures the rubric knows how to see.

A small model can be enough for a narrow job. A larger one can earn its place somewhere else. A number can also look good because the benchmark rewards doing nothing.

The useful outcome is a routing decision I can explain with the retained result. If I cannot say what was scored, how many cases were tested and what the score misses, the leaderboard is decoration.

### Evidence

The local evaluation set was built on 19 November 2026. These figures come from retained results inspected on 20 November; I did not rerun the models for this article. The harness calls the local production helpers, loading one candidate at a time. Timing depends on that machine and its load.

[Read the aggregate results and rubric notes](https://github.com/Sammii-HK/sammii-hk.github.io/blob/master/docs/evidence/local-model-evaluation-2026-11-20.json). The export contains counts and timings, not the underlying private reports or messages.
