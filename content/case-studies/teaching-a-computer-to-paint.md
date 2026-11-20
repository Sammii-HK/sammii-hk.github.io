---
title: "Teaching a computer to paint"
description: "A painting engine built one episode at a time, then handed to six AI models as art director. Same brief, same canvas, same paints, one run each. The best model finished within 1.4 points of a 1998 algorithm, and none of them beat it."
techStack: "JavaScript (ES modules), Node, ffmpeg, Claude Code subagents, Codex CLI"
updated: "2026-11-20"
status: "Recorded research essay; raw reproduction harness and run folders are not bundled with this portfolio."
---

## The problem

Most "AI makes art" demos hide the interesting part. A model produces a finished image and you can't see how it got there, what it chose, or whether a dumber method would have done as well.

I wanted the opposite: a painting system where every decision is visible, every version is reproducible, and the AI's contribution can be measured against a baseline. So I built it as a series, each episode adding one idea to the last, all painting the same sunset so any two can sit side by side.

## Architecture

### Episode 1: random shapes

Hill climbing in the style of Geometrize and primitive. Propose a random ellipse, triangle or curve, give it the exact colour that best matches the target where it lands, nudge it a few times, and keep it only if the canvas gets closer. 6,000 strokes took the error from 24,690 to 1.68. Very accurate, and it looked like a filter.

### Episode 2: a painter's process

Aaron Hertzmann's *Painterly Rendering with Curved Brush Strokes of Multiple Sizes* (SIGGRAPH 1998). Five brushes from big to small, each painting a blurrier copy of the target, only in grid cells that are still wrong, with every stroke steering along the edges in the image. On top of that I added a bristle texture, paint that runs dry along a stroke, and a height map lit from the top left so the marks catch the light. 20,229 strokes.

### Episode 3: paint that mixes like paint

Screens mix colour by averaging light, so yellow and blue make a muddy sage. Real pigment absorbs light, so they make green. I swapped the mixing for Kubelka-Munk (1931), limited the painter to eight real paints, and made every stroke a recipe from them, shown on screen. 10,340 recipes in all.

### Episode 4: the model as art director

The model never places a stroke. Each round it sees one image: the target and the canvas side by side on an A to J by 1 to 10 grid. It writes what it sees and up to three notes, each a cell range, a brush and a reason. The episode 3 painter carries them out inside those cells only. It has a budget of about 12,000 strokes and at most 14 rounds, and it never sees the error score.

### The harness

Everything is deterministic and seeded. Every episode re-renders byte for byte, and episode 2's output is checked by hash after every later change to the shared painter. Video is rendered offline frame by frame into ffmpeg, not screen-recorded. Claude directors run as Claude Code subagents; Codex directors run through the Codex CLI on the same brief. Each director has its own run folder holding every view it saw and every note it wrote.

## Challenges

**Strokes that never stop.** Hertzmann's rule stops a stroke when the canvas already matches better than the brush does. On blank paper nothing matches, so first-layer strokes dragged one colour straight across the mountain ridges. The fix was a second stopping rule: stop when the colour under the brush drifts too far from the brush's own.

**The squiggly sun.** The sun is flat inside, so there was no edge for strokes to follow and they became random dabs. Borrowing the direction from a very blurred copy of the picture made the strokes circle the sun, which is roughly what a person would do.

**Aiming at colours it couldn't mix.** Eight paints can't reach the deepest navy in the sky. The planner didn't know that, and kept dropping smaller and smaller strokes on cells it could never fix: 112,519 strokes, a gritty sky, and an error that barely moved. Showing it the target as its palette sees it brought the count back to about 12,000.

**A score that measured the food.** In a parallel slime mould experiment, an agent model reported 97.9% of its trail on the shortest path through a maze. The food sources sit on that path, so the score was counting the food. I threw the number out and switched to the tube model that actually solves mazes.

**Checking the directors really looked.** A model that can't see an image can still write a convincing description of one. For every Codex run I counted the image results in its session log against the rounds it played. All three matched, one image per decision.

## Outcome

Six directors, one run each, against the fixed schedule from episode 3:

| Director | Strokes | Error (lower is closer) |
|---|---|---|
| Fixed schedule, Hertzmann 1998 | 9,949 | **19.6** |
| GPT-6.1-Sol (Codex) | 11,215 | 21.0 |
| GPT-6.1 Terra (Codex) | 10,994 | 24.4 |
| Claude Opus 5.5 | 7,874 | 27.2 |
| Claude Haiku 5.5 | 9,680 | 31.4 |
| Claude Sonnet 5.5 | 7,194 | 34.3 |
| GPT-6-Luna (Codex) | 9,189 | 35.6 |

No model beat the fixed schedule at the end. Along the way only one was ever ahead of it at the same stroke count: Sonnet, briefly, at about 2,100 strokes (60.8 against 63.7), before falling behind again. The best Codex models came closest at the finish, partly by spending more strokes. The Claude models were thriftier and stopped earlier. Two directors had a round that made the painting worse, Sonnet in round 6 and Terra in round 4. And by eye, the finished paintings are hard to tell apart.

The models did direct like painters. Every one covered the whole canvas in round one, mostly with the biggest brush. Five of the six went for the sun in round two (Terra refined the whole canvas instead), and all of them broadly worked from big brushes to small, though Haiku used a fine brush on the sun's edge as early as round two. Their notes named real problems ("a dark bite in the sun's lower left", "a salmon arch where the target is violet"). Several said in their own retrospectives that their last rounds barely helped, and the numbers agree.

What I take from it as an AI engineer: a model is a good director when "good" means what a person sees, and a weak optimiser when "good" is a number it isn't shown. If you want both, give it the number, or let a plain loop do the thorough part and keep the model for the decisions.

Limits: one run per model and one seed, so this is an experiment, not a benchmark. The palette caps how close anyone can get. The directors saw a 640 px view of a 1080 px canvas. The most expensive tiers, Claude Fable and GPT-6.2-Astra, weren't run.


This essay documents a recorded experiment. Its saved visual outputs and reported comparison are preserved here; this portfolio review did not rerun the painter, recheck the metric implementation or reconstruct the director sessions. The one-run limits above remain part of the result.
