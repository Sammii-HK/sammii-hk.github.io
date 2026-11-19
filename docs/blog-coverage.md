# Blog coverage: Labs charts and explorations (2026-11-18)

Every chart on labs.sammii.dev/charts and every exploration on labs.sammii.dev/explorations now has a draft post.
Scheduled 2026-11-19: one post every weekday at 09:00 London, 23 Nov 2026 to 29 Jan 2027. Each post is
`draft: false` with a future `date`, so `getAllPosts` hides it until that date. Full order: `docs/blog-schedule.md`.

- **Charts:** 37 in `app/labs/charts/registry.ts` (the registry numbers run 01 to 37; there is no 38 or 39).
  Branch `drafts/chart-blog-posts`, cut from `origin/master`. Posts are `content/blog/<chart slug>.md`,
  with `date: '2026-11-18'` as a placeholder. Set the real date when each one is scheduled. Each also has
  `series:` and `chart:` fields.
- **Explorations:** 15 in PR #10's `catalogue.json`. Two drafts already existed there (`where-light-can-go`,
  `one-arrival-at-a-time`), and 13 are new on branch `drafts/exploration-blog-posts`, cut from
  `codex/explorations-discovery`. They follow the existing drafts: no date, `status: "unpublished"`,
  `interactiveLab` set to the catalogue id, the `<InteractiveExploration>` embed and a standalone link.
- The launch post `charts-information-design-for-design-engineers` is published. It is the series overview,
  and parts of it are now out of date (see below).

## Charts

| # | Chart | Series | Post | Status | Checked |
|---|---|---|---|---|---|
| 01 | The family tree of colour spaces | Colour and perception | `colour-spaces` | Draft | Yes, fixed |
| 02 | Why HSL lies | Colour and perception | `why-hsl-lies` | Draft | Yes, fixed |
| 03 | Six centuries of communication and type | Typography | `communication` | Draft | Yes, fixed |
| 04 | The typography genome | Typography | `typography` | Draft | Yes, fixed |
| 05 | How a keypress becomes a pixel | The browser and the machine | `keypress` | Draft | Yes, fixed |
| 06 | The gamuts | Colour and perception | `gamuts` | Draft | Yes, fixed |
| 07 | What a CSS property costs | The browser and the machine | `repaint` | Draft | Yes, fixed |
| 08 | The event loop, for interfaces | The browser and the machine | `event-loop` | Draft | Yes, fixed |
| 09 | Big O, in the keystroke | The browser and the machine | `big-o` | Draft | Yes, fixed |
| 10 | Every named CSS colour, in OKLCH | Colour and perception | `named-colours` | Draft | Yes, fixed |
| 11 | How a URL becomes a page | The browser and the machine | `url` | Draft | Yes, fixed |
| 12 | Easing versus springs | Motion and interaction | `springs` | Draft | Yes, fixed |
| 13 | Why z-index: 9999 does nothing | The browser and the machine | `stacking` | Draft | Yes, fixed |
| 14 | Contrast, two ways that disagree | Colour and perception | `contrast` | Draft | Yes, fixed |
| 15 | Specificity, three columns | The browser and the machine | `specificity` | Draft | Yes, fixed |
| 16 | Seven, and why the week is in that order | Number and symbol | `seven` | Draft | Yes, fixed |
| 17 | Thirty years of CSS layout, the same page each way | The browser and the machine | `layout` | Draft | Yes, fixed |
| 18 | Why 16px is not 16px | Typography | `x-height` | Draft | Yes, fixed |
| 19 | The four lengths of a string | The browser and the machine | `unicode` | Draft | Yes, fixed |
| 20 | Floating point, at the pixel | The browser and the machine | `floating-point` | Draft | Yes, fixed |
| 21 | What a byte of JavaScript costs | The browser and the machine | `js-cost` | Draft | Yes, fixed |
| 22 | Your commit is not gone | The browser and the machine | `git-graph` | Draft | Yes, fixed |
| 23 | Getting the menu out of the card | The browser and the machine | `anchor` | Draft | Yes, fixed |
| 24 | The anatomy of a letter | Typography | `letter` | Draft | Yes, fixed |
| 25 | Why they are still seeing the old version | The browser and the machine | `caching` | Draft | Yes, fixed |
| 26 | The visible spectrum is a sliver | Perception and consciousness | `spectrum` | Draft | Yes, fixed |
| 27 | How long “now” takes | Perception and consciousness | `now` | Draft | Yes, no change |
| 28 | Tests for a mind | Perception and consciousness | `tests-for-a-mind` | Draft | Yes, fixed |
| 29 | What your eye actually renders | Perception and consciousness | `retina` | Draft | Yes, no change |
| 30 | A context window, to scale | AI engineering | `context-window` | Draft | Yes, no change |
| 31 | Where an LLM call spends its time | AI engineering | `llm-latency` | Draft | Yes, fixed |
| 32 | Lunary's grimoire, mapped by meaning | AI engineering | `grimoire-map` | Draft | Yes, fixed |
| 33 | How text becomes tokens | AI engineering | `tokens` | Draft | Yes, fixed |
| 34 | What 900 videos taught me | Short-form video | `videos` | Draft | Yes, fixed |
| 35 | The 16.7ms frame budget | The browser and the machine | `frame-budget` | Draft | Yes, fixed |
| 36 | How long text needs on screen | Short-form video | `text-on-screen` | Draft | Yes, fixed |
| 37 | Touch targets, to scale | Motion and interaction | `touch-targets` | Draft | Yes, fixed |

## Explorations

| Exploration | Category | Post | Status | Checked |
|---|---|---|---|---|
| A planet reshaping itself (`plate-tectonics`) | Worlds | `a-planet-reshaping-itself` | Draft | Yes, fixed |
| A day on another world (`day-on-another-world`) | Worlds | `a-day-on-another-world` | Draft | Yes, fixed |
| Beneath the surface (`inside-planets`) | Worlds | `beneath-the-surface` | Draft | Yes, fixed |
| The gravity room (`gravity-on-other-worlds`) | Worlds | `one-throw-twelve-worlds` | Draft | Yes, fixed |
| One sky, many stories (`constellations-and-sky-stories`) | Skies | `one-sky-many-stories` | Draft | Yes, fixed |
| The sky unravelling (`constellations-through-time`) | Skies | `the-sky-unravelling` | Draft | Yes, fixed |
| Step outside the pattern (`big-dipper-in-3d`) | Skies | `step-outside-the-pattern` | Draft | Yes, fixed |
| Near a black hole (`black-hole-time-dilation`) | Light and time | `two-clocks-near-a-black-hole` | Draft | Yes, fixed |
| Where light can go (`black-hole-light-paths`) | Light and time | `where-light-can-go` | Draft (already existed in PR #10) | Not rechecked (written before this work) |
| One arrival at a time (`double-slit-experiment`) | Quantum | `one-arrival-at-a-time` | Draft (already existed in PR #10) | Not rechecked (written before this work) |
| Through the forbidden (`quantum-tunnelling`) | Quantum | `through-the-forbidden` | Draft | Yes, fixed |
| A little less certain (`quantum-uncertainty`) | Quantum | `a-little-less-certain` | Draft | Yes, fixed |
| The shape of a note (`vibrating-membranes`) | Sound and pattern | `the-shape-of-a-note` | Draft | Yes, fixed |
| Patterns that grow (`reaction-diffusion`) | Sound and pattern | `patterns-that-grow` | Draft | Yes, fixed |
| Worlds in Time (`planetary-surface-evolution`) | Worlds | `worlds-in-time` | Draft | Yes, fixed |

## Fact-check pass (2026-11-18)

A second set of reviewers, who did not write the drafts, read all 50 in full. They checked every number, date,
name, control label and claim against the piece's own source: the page, its components and data, the footer,
facts.ts, the catalogue, the runtime source notes and the model code. Where a number is computed by the page,
they re-ran the chart's or model's own code in node. They fixed wrong claims, cut unsupported ones, and changed
Sources sections to name things as the footer does. 47 posts changed and 3 (retina, context-window, now) needed
nothing. Every post now has a source behind each of its claims. Two lines stay as written, as limits stated in
the author's voice: letter's "I have not tested them across many", and x-height's "a Google family that fails to
load is left out", which is the footer's claim and wasn't tested with a failed load.

What was most often wrong:
- **Controls described inaccurately:** hover versus tap, where a panel sits, which presets exist, what a slider
  does, which `?focus` a page reads.
- **General knowledge the source does not state:** history, mechanism, classical physics, first names.
- **Live results stated as fact:** what the reader's own screen or measurement will show.
- **Sources padded:** publishers or full titles added beyond what the footer gives.
- **A few figures misread:** for example keypress's "most hops are constant" (five of twelve are), the
  patterns-that-grow rate differences, and the 0.25 nm spread described as a width.

Full per-post change log: `docs/blog-review-log.md`.

## Things to check before publishing

### Posts that need a human read
- **one-sky-many-stories:** Matariki, the Seven Sisters and the Celestial Emu are paraphrased from the runtime's
  own attributed text, and the nine Matariki names use Te Papa's spelling. The constellation illustrations and the
  sound experiment (**the-shape-of-a-note**) are still marked for editorial review in `docs/explorations-review.md`,
  so both posts say as little as possible about them.
- **Numbers the writers worked out by running the chart or model code** rather than copying them from text. They
  are what the page shows, but nobody has checked them on the live page. Examples: the HSL 12.2x spread and the
  luminance values; gamut areas (P3 136%, Adobe RGB 135%, Rec. 2020 189% of sRGB); waterfall and keypress totals;
  gravity ranges and flight times; the black-hole clock minutes; Tabit's 12.67 degrees; the 3.86 eV resonance; the
  Big Dipper distances; the text-on-screen worked examples; the videos medians, recomputed from the rows.
- **Short or bare slugs on master:** `url`, `now`, `seven`, `letter`, `anchor`, `tokens` and `videos`
  follow the brief (`<chart slug>.md`) but make weak blog URLs. Rename them before publishing if you want
  descriptive ones. Cross-links use `/blog/<slug>`, so update those too.
- **The two existing exploration drafts** still contain en dashes (for example "Runge–Kutta"). I didn't edit them.

### The source contradicts itself (fix the chart, not just the post)
- **why-hsl-lies:** the footer, the HSL row text and the facts.ts `cube-root` entry say yellow and blue differ
  "nine to one". The component computes about 12x, which matches the `twelve-x` fact. The post uses 12.
- **repaint:** the registry blurb says "Two properties live in the cheap column". `data.ts` has six composite
  properties (33 layout, 16 paint, 6 composite). The post uses six.
- **specificity:** the lead and the `ladder` fact say seven things get a say *before* specificity. The ladder has
  seven steps in total and specificity is the sixth.
- **git-graph:** the footer says gc keeps unreachable objects two weeks (`gc.pruneExpire`). `data.ts` step 5,
  the GitGraph note and the `reset` fact say 90 days. The post follows the footer.
- **springs:** the footer says the Heavy preset creeps in without overshoot. Its settings (200 / 30 / 3) give a
  damping ratio of about 0.61, so it does overshoot, and no preset is overdamped.
- **unicode:** "Café, two ways" uses the same precomposed é twice, so it doesn't show the difference its note
  describes. "A name" is stored precomposed, so a 20-unit limit would not reject it, which contradicts the note
  and the `limit` fact.
- **letter:** the registry and the component comment say "hand-placed names", but the code finds the pointers in
  the ink. All four specimens are EB Garamond, and the overshoot fact says "each font".
- **named-colours:** the copy says six greys have two spellings each. `data.ts` has seven pairs.
- **contrast:** the code compares two methods, but the component is called `ContrastThreeWays` and the launch post
  promised three.
- **colour-spaces:** the facts.ts focus ids are never read (the tree only reads `?year=` and `?play=1`), so the
  video lane's focus clips won't focus. The ramp note "nine equal-step hues" is true only of HSL, LCH and OKLCH.
  `data.ts` says P3 has "about a quarter more colours" and Rec. 2020 "three quarters of visible colours"; both
  disagree with the gamuts chart.
- **gamuts:** the footer says the fill outside sRGB is "nearest-displayable", but the canvas is sRGB, so a P3
  screen still sees the clip.
- **event-loop:** the `label` fact's focus opens the stepper, not the label demo (JankDemo ignores `?focus`).
  JankDemo counts frames over a fixed 34 ms as dropped; FrameMeter uses 1.5 times the measured refresh.
- **keypress:** vsync is called "the biggest single cost", but on the heavy page-work setting the handler is larger
  (14 ms against 8.3 ms).
- **url:** the facts.ts claim of more than a second to the first byte on 3G holds only for HTTP/1.1 with TLS 1.2
  (1,060 ms). On the default it's 860 ms. The post doesn't use it.
- **big-o:** "800 million comparisons on the first keystroke" is an upper bound. The post says "up to".
- **anchor:** the copy says unsupported browsers fall back to hand positioning. They don't, so the menu detaches.
- **stacking:** the panel's tree is computed by the component, not read from the browser. The "portal" fix is
  drawn inside the scene.
- **layout:** the code panel shows `minmax(120px, 1fr)` but the page renders 110px.
- **caching:** after a hard reload, the last "HTML, done right" visit still scores as a full 200.
  `must-revalidate` changes no outcome, and `Vary` is discussed but not modelled.
- **js-cost:** the chart opens on the 4x phone setting. "Per KB" divides by the source size, not the gzipped size.
  The 280 KB fact doesn't match the 3.5x fallback (about 293 KB).
- **x-height:** all five system fonts are marked as present, so a missing one gets measured as the browser's
  substitute.
- **communication vs typography:** they disagree on Akzidenz-Grotesk (1896 / 1898), Johnston (1918 / 1916) and Didot
  (Transitional / Didone). The communication lead promises the web, but the type side ends in 1976. The Newspaper
  entry is dated 1450 but its text says the 17th century. Typos remain ("King Henry V1II").
- **spectrum:** the share is "about 1.6%" in some places and "a little over 1.5%" in others (computed 1.58%).
- **seven:** the chart dates the MA to 2018, while `the-light-we-built` says the cube was built in 2017. "Later work
  puts the honest figure nearer four" has no citation.
- **now:** Ng et al. 2014 is in the data file but not in the footer.
- **touch-targets:** the 8 to 10 mm fingertip is credited to the MIT Touch Lab in the data but called "less directly
  sourced" in the footer.
- **tests-for-a-mind:** the footer lists fewer sources than the cards. The post uses the cards' list.
- **retina:** the optic disc is drawn at 14.3 degrees, while the blind-spot card uses 15.5 (two sourced measures).
  The cone peak is 196,890 or 199,000 depending on the source. The post explains both.
- **context-window:** "Lunary needs 12" holds for the 1,000,000 button. Against GPT-4.1's 1,047,576 it would be 11.
  The blog's count of 66 posts dates from 19 October.
- **llm-latency:** the example cold call has a 50-token prompt, but the cold median has 3,297 tokens. The page says
  three calls found the model unloaded while the fact says two. "Barely changes" doesn't match 23.8 against 35
  tok/s. The 28 calls are 27 plus one uncategorised.
- **tokens:** the footer's list of o200k models is longer than the row label. The verified sentence list doesn't
  match the sentences shown. The note says Gemma keeps four spaces as separate tokens, but the data has one.
- **videos:** the registry says 900 dots, but 830 are plotted (70 have no length). The "cover" fact says 28 scripted
  videos; the scripted format has 27.
- **Explorations:**
  - **Worlds in Time:** the Moon's default experiment barely changes anything at the default seed (one
    eruption), so the post opens on Io instead.
  - **Gravity:** Pluto is 0.62 m/s² against NASA's 0.7 (the interface discloses this). The catalogue lists three
    sources, but some values come from two more NASA fact sheets.
  - **Plate tectonics:** the catalogue's process names differ from the button labels.
  - **Quantum uncertainty, Big Dipper and the sky stories:** their source lists differ between the catalogue and
    the runtime.
  - **The sky unravelling:** `sky.js` still ships old Big Dipper text.
  - **Patterns that grow:** the Coral preset's clock starts at t = 1600.
- **Found in the fact-check pass:**
  - **llm-latency:** facts.ts `cold` says two of 28 calls were cold, but the data says three. The +1 call is an
    unlabelled prime call.
  - **tests-for-a-mind:** the legend says solid cards are tests used on real subjects, but the Lovelace test and
    the AI Consciousness Test are drawn solid.
  - **videos:** the page lede "Held inside a single era, short still wins" covers only two eras. In 2023 it goes
    the other way.
  - **floating-point:** typing a whole number such as 3 shows "Not the number you typed".
  - **js-cost:** after a measurement, moving the slider updates only the label, and per-KB divides the old times by
    the new size.
  - **caching:** the swr deploy visit shows a 304 where a 200 is due.
  - **anchor:** the footer says both support checks use CSS.supports, but popover is a prototype check.
  - **keypress:** the vsync and scanout ranges ("2 to 8 ms") exclude the 8.3 ms the chart shows at 60 Hz.
  - **frame-budget:** facts.ts credits the 10 ms work budget to RAIL, while the footer credits it to Paul Lewis.
  - **why-hsl-lies:** facts.ts says OKLCH is "within 1.2 times", but the chart shows 1.1 times.
  - **contrast:** the dark-grey-on-black note says 2.3:1, but the card shows 2.37.
  - **named-colours:** the lime note contradicts the green note.
  - **gamuts:** the idle panel says "nearest colour this screen can make", but the fill is clipped sRGB.
  - **letter:** the footer omits the eye and aperture from the parts not snapped onto ink.
  - **explorations:**
    - The day-on-another-world panel does not link the Mars or Earth facts the catalogue lists.
    - The frame titles differ from the catalogue titles.
    - The gravity and tectonics catalogue entries list fewer sources than the panels.
    - The nine Matariki names come from a Te Papa page (what-and-who-matariki) that neither the catalogue nor
      the runtime lists.
    - Two VizieR mirrors are linked.
    - The Alula Australis note says "segments" where one segment is dropped.
    - The Big Dipper notes panel lists the ESA Orion article, which belongs to the time view.
- **Launch post:** its descriptions of event-loop and big-o predate the live demos and the log/linear toggle.

### What the writers deliberately left out
- **Facts not in the chart's own files**, however familiar: author first names the footers don't give, outside
  history, and explanations of mechanisms the source doesn't state.
- **Live measurements:** reaction time, frame rate, seam width, parse times and overshoot. Each post tells the
  reader what they will measure instead of quoting a result.
- **Invented first-person lines:** several were cut ("the trick I use most", "the one that made me draw this
  chart"). If you want more of your own voice in a post, add it at review.
