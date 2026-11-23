---
title: "Two seconds is plenty for six words and not enough for twelve"
description: >-
  A card that shows your line of text for exactly as long as a rule allows, then takes it away. My video app's rules against silent reading speed and the BBC and Netflix subtitle standards.
date: '2027-01-14T09:00:00+00:00'
tags:
  - charts
  - short-form video
  - reading
  - accessibility
series: "Short-form video"
chart: "text-on-screen"
draft: false
---

Press **Play: a 2 s card** and a line appears on a small phone-shaped card: "Two seconds is plenty for six words and not enough for twelve." A progress bar shrinks as it plays. Then the line is gone, and the card asks: "Gone after 2.0 s. Did you get to the end?"

Two seconds for those twelve words is 360 words a minute. The average adult reading English non-fiction silently, on a still page, manages 238.

The chart is at [labs.sammii.dev/charts/text-on-screen](https://labs.sammii.dev/charts/text-on-screen/). It exists because, in one test render, my own video app gave a 12-word line a second and a half.

## Why I built it

My video app puts lines of text on screen, one after another. In that test render, a line of twelve words was on screen for 1.5 seconds: 480 words a minute, before allowing time to notice the card. That is well above the average silent-reading rate discussed below. A fixed 2-second card still asks for 360 words a minute. Neither is a sensible default for the audience I am designing for.

So the app now has floors. The chart sets them beside the published reading and subtitle rates, times your line six ways, and the first part of it makes you feel the difference rather than read about it.

## Using it

**The line** is a text box. Type anything into it, or pick one of the sample lines under it, labelled by length: **4 words**, **8 words**, **12 words** and **20 words**. It starts on the 12-word one.

Then there are three play buttons, each with the time it will give your line:

- **Play: a 2 s card**, which is always 2.0 s.
- **Play: my rule**, the floor my app uses for silent text notes. For the 12-word line, 3.3 s.
- **Play: subtitle speed**, the BBC's slower subtitle rate. For the 12-word line, 4.5 s.

Each one shows the line for exactly that long and then takes it away, and afterwards tells you how many words a minute that was.

Below that, **Every rule, to scale** draws seconds on screen against words on the line, from 1 to 24 words, for five rules: the 2 s card, my note rule, silent reading at 238 words a minute, the BBC at 160, and my card rule. Shaded bands show the published ranges (175 to 300 words a minute for most adult silent readers, 160 to 180 for BBC subtitles), and a vertical mark shows where your line falls. Beside it, a table prices your exact line by all six rules, including Netflix's, and the last column, **2 s gives**, says how much of each rule a fixed 2-second card actually gives you, measured against the rule's most lenient end.

For the 12-word sample, the table reads, shortest first:

- A fixed 2 s card: 2.0 s
- Silent reading, 238 wpm: 3.0 s (2.4 to 4.1)
- Netflix, 20 characters a second: 3.1 s for its 62 characters (3.1 to 3.6)
- My note rule: 3.3 s
- BBC subtitles, 160 to 180 wpm: 4.5 s (4.0 to 4.5)
- My card rule: 4.8 s

At the silent reader's average, the six-word half of that line takes about 1.5 seconds. That is where the title comes from: two seconds is plenty for six words and not enough for twelve.

## My two rules

Both rules live in the app's text-beat assembler, `TextBeatAssembler`, in the PostReady codebase.

**The note rule** is words divided by 4, plus 0.3 seconds: a quarter of a second a word, which is 240 words a minute, with a beat to find the line. It is the floor for silent text notes, short videos that loop, so a viewer gets a second pass. That is why it can sit close to the silent-reading average.

**The card rule** is slower. It is the larger of 1.8 seconds and words divided by 3 plus 0.5 seconds, which is 180 words a minute, the BBC's faster rate. Then it adds 0.3 seconds for each word with a number in it, 0.2 for an acronym, and 0.15 for a word of nine letters or more. On top of that is a 0.15-second fade in and a 0.15-second fade out, which do not count as reading time. The curve on the chart is the card rule for plain short words; the table prices the exact line, so a line with a year or a long word in it costs more.

A fixed 2-second card holds about 6 words by the note rule, 7 at the average silent reading speed, and 6 at the BBC's faster subtitle rate.

## Why subtitles run slower than reading

Brysbaert's meta-analysis of 190 studies puts adult silent reading of English non-fiction at 238 words a minute on average, fiction at 260, with most adults between about 175 and 300. Reading aloud averages 183.

That is reading a still page. On screen, the words compete with the picture, and the subtitle standards are slower: 160 to 180 words a minute at the BBC (0.33 to 0.375 seconds a word, with a target minimum of around 0.3 seconds a word), and at most 20 characters a second for adults and 17 for children's programmes at Netflix, never under 20 frames. A 12-word line is 4 to 4.5 seconds at the BBC's rate.

Text that moves is slower again. In Uetsuki and colleagues' study of dynamically presented Japanese text, the optimum rate was about 6 letters a second, against an average of 11.3 for silent reading: roughly half.

The other side of the argument is worth knowing too. Eye-tracking by Szarkowska and Gerber-Morón found that most viewers coped with subtitles at up to 20 characters a second and still followed the picture, and that slow subtitles caused more rereading. The standards are a floor for comfort, not a ceiling on ability.

## What it cannot tell you

It does not measure you. The play buttons show you what a rule feels like on your screen, and whether you got to the end is yours to judge. Nothing is recorded.

The reading speeds are averages. Most adults fall in a wide band, and the chart draws the band for that reason, but your audience may sit anywhere in it, or outside it. Brysbaert's figures are for English, and the moving-text study is of Japanese.

Word counts are a split on spaces, so "£1,234.56" is one word to the chart. Netflix counts characters instead, which is why it is in the table and not drawn as a curve: its time depends on how long the words are, not how many there are.

And my rules are floors I chose for my app, with sources behind them, not a standard. The silent text notes loop, which is the only reason the note rule can be as quick as it is.

The chart is at [labs.sammii.dev/charts/text-on-screen](https://labs.sammii.dev/charts/text-on-screen/). `?focus=3` opens it on the 12-word line, and `?focus=4` on the 20-word one. It sits alongside [what 900 of my videos taught me](https://labs.sammii.dev/charts/videos/) in the short-form video series.

## Sources

- Marc Brysbaert, How many words do we read per minute? A review and meta-analysis of reading rate, Journal of Memory and Language 109 (2019).
- BBC Subtitle Guidelines, section 4, Timing.
- Netflix, Timed Text Style Guide: General Requirements and Subtitle Timing Guidelines.
- Masaki Uetsuki, Junji Watanabe, Hideyuki Ando and Kazushi Maruya, Reading traits for dynamically presented texts, Frontiers in Psychology 8 (2017).
- Agnieszka Szarkowska and Olivia Gerber-Morón, Viewers can keep up with fast subtitles: evidence from eye movements, PLOS ONE 13(6) (2018).
