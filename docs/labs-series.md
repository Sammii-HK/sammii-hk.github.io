# Labs: connected series and development histories

Prepared 20 November 2026. All publication times are Europe/London.

Nine reader paths connect all **66 catalogue items**. The original **12 implementation articles** are joined by **three development histories** and **one reader guide**: **16 complete drafts**, **22,789 prose words** and **37 code examples**.

All changes are prepared in [draft PR #15](https://github.com/Sammii-HK/sammii-hk.github.io/pull/15). New articles remain marked `draft: true` and have not been given publication slots. The 50 existing scheduled posts and two held explorations retain their exact content, dates and holds.

## What makes these series

Each path follows a question through related explanations and implementations. The tables below give a useful reading order, not an invented project chronology. A separate history article makes chronological claims only where pinned commits or explicit source notes support them.

The current blog parser discards the existing `series` frontmatter, so metadata alone would not make the connections visible. The sixteen new drafts include a reader guide and ordinary Markdown reading-path sections. This is a content-only change; it does not create a new route type or change the portfolio layout.

## Three new development histories

| Article | Documented development | Evidence |
|---|---|---|
| [From a palette generator to Gamut, and back again](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/from-a-palette-generator-to-gamut-and-back-again.md) | November 2025 HSL generator; March 2026 Gamut; April 2026 relative-lightness and OKLCH backports. | Four pinned revisions and reproduced palette outputs. Code reuse does not imply identical palette policies. |
| [From charts to explorable models: what changed in Labs](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/from-charts-to-explorable-models.md) | September shared chart renderer; October selection correction; November catalogue and exploration integration. | Pinned commits, the sky catalogue notes and the integration manifest. Integration dates are not claimed as the models' origin dates. |
| [Moth: from a drawing gallery to an observatory](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/moth-from-a-drawing-gallery-to-an-observatory.md) | Two public listing revisions on 30 October expand a gallery into a four-view observatory. | Exact before/after public commits. This does not reconstruct private cognition history or establish improvement in drawing. |

## Reader guide

[Reading the labs as connected series](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/reading-the-labs-as-connected-series.md) is a complete introduction to the nine paths. It links to currently published articles, live lab pages and the three new history pieces in this draft batch. It does not depend on the 50 future posts or the two held articles becoming public.

## Nine reading paths

| Path | Core lab items | Continuing question |
|---|---:|---|
| Colour: from coordinates to a useful tool | 6 | What has to survive when a colour moves from an idea to a screen, a palette and an export? |
| Typography: from a letter to a system | 4 | How do the history and proportions of letterforms become decisions in a working interface? |
| Motion: from a curve to something you can interrupt | 5 | What changes when an animation must respond to another action before it finishes? |
| The browser: from an input to a visible result | 16 | Which part of the journey is responsible when the page arrives late, looks wrong or fails to respond? |
| Building a sky: from a view to a model | 10 | What changes when the observer, the world or the timescale moves? |
| Invisible worlds: what an interactive model can explain | 7 | Which part of a phenomenon can the reader vary, and where does the explanation stop? |
| Systems that learn and choose | 8 | What can the system actually do, and what evidence would justify calling it better? |
| Light, image and sound | 7 | Which qualities of an experience survive when its material changes? |
| From footage to a decision | 3 | How can a video tool make a useful recommendation without hiding its assumptions? |

## Colour: from coordinates to a useful tool

Colour history and perceptual differences lead into the documented Tailwind Colour Creator and Gamut feedback loop, then into gamut limits, contrast and naming.

| Read order | Article | Actual publication state |
|---:|---|---|
| 1 | [Twenty-five ways to write a colour down](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/colour-spaces.md) | Scheduled 2026-11-24 09:00:00 London |
| 2 | [Fifty percent of what? Why HSL lies about lightness](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/why-hsl-lies.md) | Scheduled 2027-01-20 09:00:00 London |
| 3 | [From a palette generator to Gamut, and back again](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/from-a-palette-generator-to-gamut-and-back-again.md) | Completed draft; not scheduled |
| 4 | [A palette generator should keep the colour you gave it](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/a-palette-generator-should-keep-the-colour-you-gave-it.md) | Completed draft; not scheduled |
| 5 | [The triangle your screen lives in](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/gamuts.md) | Scheduled 2027-01-01 09:00:00 London |
| 6 | [Orange on white, scored twice](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/contrast.md) | Scheduled 2026-12-24 09:00:00 London |
| 7 | [darkgray is lighter than gray](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/named-colours.md) | Scheduled 2027-01-11 09:00:00 London |

**Published companions:** [Why your design system needs OKLCH, not HSL](https://sammii.dev/blog/why-your-design-system-needs-oklch-not-hsl/); [One colour formula: how I made my developer portfolio feel alive](https://sammii.dev/blog/one-colour-formula-portfolio/).


## Typography: from a letter to a system

Type history becomes a family tree, then a study of anatomy and apparent size, and finally an adjustable tool in Kern.

| Read order | Article | Actual publication state |
|---:|---|---|
| 1 | [Six centuries of communication and type, and the student who wrote it](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/communication.md) | Scheduled 2026-12-30 09:00:00 London |
| 2 | [The typography genome: five hundred years of type as one family tree](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/typography.md) | Scheduled 2027-01-18 09:00:00 London |
| 3 | [The anatomy of a letter, and the overshoot nobody mentions](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/letter.md) | Scheduled 2027-01-07 09:00:00 London |
| 4 | [Why 16px is not 16px](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/x-height.md) | Scheduled 2027-01-29 09:00:00 London |

**Published companions:** [A love letter to Garamond](https://sammii.dev/blog/love-letter-to-garamond/); [A love letter to Baskerville](https://sammii.dev/blog/love-letter-to-baskerville/); [A love letter to Bodoni](https://sammii.dev/blog/love-letter-to-bodoni/); [A love letter to Johnston Sans](https://sammii.dev/blog/love-letter-to-johnston-sans/); [A love letter to Futura](https://sammii.dev/blog/love-letter-to-futura/); [A love letter to Helvetica](https://sammii.dev/blog/love-letter-to-helvetica/); [A love letter to Univers](https://sammii.dev/blog/love-letter-to-univers/); [The kerning pair problem: why I built Kern](https://sammii.dev/blog/the-kerning-pair-problem/); [Kern: exploring variable fonts and generating fluid type](https://sammii.dev/blog/fluid-type-from-a-variable-font-explorer/).


## Motion: from a curve to something you can interrupt

Springs and input lead into Kinetic, constrained bodies in Balloon Bonanza, two fluid-looking techniques in Liquidity and the size of the controls people touch.

| Read order | Article | Actual publication state |
|---:|---|---|
| 1 | [Easing versus springs: what happens when you interrupt](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/springs.md) | Scheduled 2027-01-12 09:00:00 London |
| 2 | [Kinetic: designing motion you can interrupt](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/kinetic-designing-motion-you-can-interrupt.md) | Completed draft; not scheduled |
| 3 | [Making balloons feel light with Matter.js](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/making-balloons-feel-light-with-matter-js.md) | Completed draft; not scheduled |
| 4 | [Liquidity: two ways to make type feel fluid](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/liquidity-two-ways-to-make-type-feel-fluid.md) | Completed draft; not scheduled |
| 5 | [Touch targets, at the size your finger meets them](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/touch-targets.md) | Scheduled 2027-01-22 09:00:00 London |

**Published companions:** [Cursor-Reactive Gradients: Making CSS Respond to Mouse Position](https://sammii.dev/blog/cursor-reactive-gradients-css-mouse-position/); [Building a vertical snap carousel with touch-drag pagination](https://sammii.dev/blog/building-a-vertical-snap-carousel-touch-drag-pagination/).


## The browser: from an input to a visible result

Network and JavaScript work lead into rendering and perception, then CSS diagnosis and the source history needed to inspect a change.

| Read order | Article | Actual publication state |
|---:|---|---|
| 1 | [From charts to explorable models: what changed in Labs](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/from-charts-to-explorable-models.md) | Completed draft; not scheduled |
| 2 | [A slow page is mostly waiting](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/url.md) | Scheduled 2027-01-28 09:00:00 London |
| 3 | [Why the loading label never shows](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/event-loop.md) | Scheduled 2026-12-02 09:00:00 London |
| 4 | [One emoji, four lengths](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/unicode.md) | Scheduled 2027-01-15 09:00:00 London |
| 5 | [Floating point, at the pixel](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/floating-point.md) | Scheduled 2026-12-04 09:00:00 London |
| 6 | [The search box that stops keeping up](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/big-o.md) | Scheduled 2026-11-26 09:00:00 London |
| 7 | [Why they are still seeing the old version](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/caching.md) | Scheduled 2026-11-30 09:00:00 London |
| 8 | [What a byte of JavaScript costs](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/js-cost.md) | Scheduled 2026-12-11 09:00:00 London |
| 9 | [Most of a keypress is the screen](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/keypress.md) | Scheduled 2026-12-15 09:00:00 London |
| 10 | [A faster screen halves your deadline](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/frame-budget.md) | Scheduled 2026-12-07 09:00:00 London |
| 11 | [How long "now" takes](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/now.md) | Scheduled 2026-12-28 09:00:00 London |
| 12 | [Fifty-five CSS properties, and the two safe to animate](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/repaint.md) | Scheduled 2026-12-21 09:00:00 London |
| 13 | [Thirty years of CSS layout, one page seven ways](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/layout.md) | Scheduled 2026-12-17 09:00:00 London |
| 14 | [Specificity is three columns, not a score](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/specificity.md) | Scheduled 2026-12-29 09:00:00 London |
| 15 | [Why z-index: 9999 does nothing](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/stacking.md) | Scheduled 2027-01-06 09:00:00 London |
| 16 | [Getting the menu out of the card](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/anchor.md) | Scheduled 2026-11-23 09:00:00 London |
| 17 | [Your commit is not gone](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/git-graph.md) | Scheduled 2026-12-09 09:00:00 London |

**Published companions:** [Charts: information design about the tools we use](https://sammii.dev/blog/charts-information-design-for-design-engineers/); [Browser photo editing in Web Workers: 60fps on large images](https://sammii.dev/blog/browser-photo-editing-web-workers/); [Local-first collaborative editing with Yjs CRDTs: an editor that survives the Tube](https://sammii.dev/blog/local-first-collaborative-editing-yjs-crdts/).


## Building a sky: from a view to a model

A celestial view leads into sky stories, stellar motion and depth; local daylight then opens onto planetary days, gravity, interiors and long histories.

| Read order | Article | Actual publication state |
|---:|---|---|
| 1 | [Celestial Globe: drawing the sky from the inside](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/celestial-globe-drawing-the-sky-from-the-inside.md) | Completed draft; not scheduled |
| 2 | [One sky, many stories](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/one-sky-many-stories.md) | Scheduled 2026-12-08 09:00:00 London |
| 3 | [The sky unravelling](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/the-sky-unravelling.md) | Scheduled 2026-12-22 09:00:00 London |
| 4 | [Step outside the pattern](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/step-outside-the-pattern.md) | Scheduled 2026-12-16 09:00:00 London |
| 5 | [Day Lite: where the Sun meets the clock](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/day-lite-where-the-sun-meets-the-clock.md) | Completed draft; not scheduled |
| 6 | [A day on another world](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/a-day-on-another-world.md) | Scheduled 2026-11-25 09:00:00 London |
| 7 | [One throw, twelve worlds](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/one-throw-twelve-worlds.md) | Scheduled 2026-12-10 09:00:00 London |
| 8 | [Beneath the surface](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/beneath-the-surface.md) | Scheduled 2026-12-03 09:00:00 London |
| 9 | [A planet reshaping itself](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/a-planet-reshaping-itself.md) | Scheduled 2026-12-01 09:00:00 London |
| 10 | [Worlds in time](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/worlds-in-time.md) | Scheduled 2027-01-21 09:00:00 London |

**Published companions:** [The maths behind how long a planet stays in your sign](https://sammii.dev/blog/the-maths-behind-how-long-a-planet-stays-in-your-sign/); [Retrograde stations are the plot twist: rewriting the transit engine three times](https://sammii.dev/blog/retrograde-stations-are-the-plot-twist/); [Synastry at 600 pairs (and why the first 245 were thin)](https://sammii.dev/blog/synastry-at-36-aspects/).


## Invisible worlds: what an interactive model can explain

Relativity and light paths lead into quantum examples, then vibrating membranes and reaction-diffusion patterns, with the model limits carried alongside the controls.

| Read order | Article | Actual publication state |
|---:|---|---|
| 1 | [Two clocks near a black hole](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/two-clocks-near-a-black-hole.md) | Scheduled 2027-01-04 09:00:00 London |
| 2 | [Where light can go](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/where-light-can-go.md) | Held draft; existing hold preserved |
| 3 | [Through the forbidden](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/through-the-forbidden.md) | Scheduled 2026-12-25 09:00:00 London |
| 4 | [A little less certain](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/a-little-less-certain.md) | Scheduled 2026-11-27 09:00:00 London |
| 5 | [One arrival at a time](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/one-arrival-at-a-time.md) | Held draft; existing hold preserved |
| 6 | [The shape of a note](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/the-shape-of-a-note.md) | Scheduled 2026-12-18 09:00:00 London |
| 7 | [Patterns that grow](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/patterns-that-grow.md) | Scheduled 2026-12-14 09:00:00 London |

**Published companions:** [Charts: information design about the tools we use](https://sammii.dev/blog/charts-information-design-for-design-engineers/).


## Systems that learn and choose

Tokens, context and latency establish the machinery; retrieval, a painting baseline, Moth and Isle show different uses of it; tests for a mind keep capability and consciousness distinct.

| Read order | Article | Actual publication state |
|---:|---|---|
| 1 | [Strawberry is three numbers](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/tokens.md) | Scheduled 2027-01-19 09:00:00 London |
| 2 | [A million tokens is not much of a codebase](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/context-window.md) | Scheduled 2026-12-23 09:00:00 London |
| 3 | [Where an LLM call spends its time](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/llm-latency.md) | Scheduled 2027-01-08 09:00:00 London |
| 4 | [Obsidian's nearest neighbours: Lunary's grimoire, mapped by meaning](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/grimoire-map.md) | Scheduled 2026-12-31 09:00:00 London |
| 5 | [Teaching a computer to paint: what the baseline taught me](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/teaching-a-computer-to-paint-what-the-baseline-taught-me.md) | Completed draft; not scheduled |
| 6 | [Moth has possibilities, not a plot](https://sammii.dev/blog/moth-a-world-of-possibilities/) | Published |
| 7 | [Moth: from a drawing gallery to an observatory](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/moth-from-a-drawing-gallery-to-an-observatory.md) | Completed draft; not scheduled |
| 8 | [I made a VS Code extension that turns my AI agents into Animal Crossing villagers](https://sammii.dev/blog/i-made-a-vs-code-extension-that-turns-my-ai-agents-into-animal-crossing-villagers/) | Published |
| 9 | [Tests for a mind: what each one actually looks at](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/tests-for-a-mind.md) | Scheduled 2027-01-26 09:00:00 London |

**Published companions:** [The smallest model that does the actual job](https://sammii.dev/blog/moth-choosing-models-by-task/); [When an agent returns code instead of data](https://sammii.dev/blog/when-an-agent-returns-code-instead-of-data/); [No model decides whether a model made something up](https://sammii.dev/blog/no-model-decides-whether-a-model-made-it-up/); [Is consciousness merely intelligence?](https://sammii.dev/blog/is-consciousness-merely-intelligence/); [The grimoire is the product: 2,000 articles with pgvector semantic search](https://sammii.dev/blog/the-grimoire-is-the-product-pgvector-semantic-search/).


## Light, image and sound

The existing Journey Through Light essays connect perception and symbolism to the installation; browser reconstruction, image transformations, generated shaders and audio mappings explore other materials.

| Read order | Article | Actual publication state |
|---:|---|---|
| 1 | [Seven, and why the week is in that order](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/seven.md) | Scheduled 2027-01-25 09:00:00 London |
| 2 | [The visible spectrum is a sliver](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/spectrum.md) | Scheduled 2027-01-13 09:00:00 London |
| 3 | [What your eye actually renders](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/retina.md) | Scheduled 2027-01-05 09:00:00 London |
| 4 | [Rebuilding Beyond Light: making room for the reveal](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/rebuilding-beyond-light-making-room-for-the-reveal.md) | Completed draft; not scheduled |
| 5 | [One photograph, fifteen ways to draw with data](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/one-photograph-fifteen-ways-to-draw-with-data.md) | Completed draft; not scheduled |
| 6 | [Refract: from a sentence to a running shader](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/refract-from-words-to-a-running-shader.md) | Completed draft; not scheduled |
| 7 | [Spectra: turning sound into a shader without animating every pixel in JavaScript](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/spectra-turning-sound-into-a-shader.md) | Completed draft; not scheduled |

**Published companions:** [Beyond the visible: UV, acetate, and the installation I painted](https://sammii.dev/blog/beyond-the-visible-uv-acetate-and-the-installation-i-painted/); [The light we built](https://sammii.dev/blog/the-light-we-built/); [From the library to Lunary: how seven spheres became an app](https://sammii.dev/blog/from-the-library-to-lunary/); [Mythology as code: planetary gods as stages of consciousness](https://sammii.dev/blog/mythology-as-code/).


## From footage to a decision

Observed video outcomes lead into the reading time of an overlay and the explicit trade-offs behind selecting a take.

| Read order | Article | Actual publication state |
|---:|---|---|
| 1 | [What 900 of my videos taught me, and why it is less than it looks](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/videos.md) | Scheduled 2027-01-27 09:00:00 London |
| 2 | [Two seconds is plenty for six words and not enough for twelve](https://github.com/Sammii-HK/sammii-hk.github.io/blob/a79c7049cadc132d7103e921c3b9e20069a48c33/content/blog/text-on-screen.md) | Scheduled 2027-01-14 09:00:00 London |
| 3 | [Why this take won: making a selection score readable](https://github.com/Sammii-HK/sammii-hk.github.io/blob/content/labs-blog-gaps-2026-11-20/content/blog/why-this-take-won-making-a-selection-score-readable.md) | Completed draft; not scheduled |

**Published companions:** [I Built a Video System That Predicts Performance Before Publishing](https://sammii.dev/blog/video-system-that-predicts-performance/); [Building a beauty filter pipeline for iOS that doesn't melt faces](https://sammii.dev/blog/postready-beauty-filter-pipeline-ios/).

## How another instalment should advance the story

1. Start from a specific previous state: a commit, a screenshot, an exported result or a published claim.
2. Identify the constraint or question that changed. Separate a documented reason from an editorial interpretation.
3. Show the consequential difference with a small code comparison, an interface change or a worked example.
4. Explain what the evidence establishes, including scope and remaining trade-offs.
5. End with the next unresolved question and a link back to the relevant earlier chapter.

A series position does not reserve a publication date, and a proposed future improvement is not an implemented result. No new recurring automation, cross-post or schedule was created by this work.

## Publication and link dependencies

- Publish the reader guide and its three linked history articles together, no later than the implementation articles that link to the guide. All remain drafts in this PR.
- Existing published and scheduled article bodies are unchanged. No live article now links to an unpublished hub as a result of this work.
- The guide links to published articles, live experiments and the three history pieces prepared in the same batch. Future and held article links in this editorial map lead to their source files and are labelled with their real state.
- Existing frontmatter series labels are preserved. The nine paths are editorial reading routes; this change does not imply that the site now renders series metadata.
- Keep the two held exploration drafts held unless their separate release decision changes.

## Verification

The map contains all 66 original catalogue items exactly once, with no missing or duplicate primary assignment. The source manifest retains every original publication state. All sixteen prepared articles have valid frontmatter, unique slugs, balanced code fences and `draft: true`. New internal blog links resolve either to an already-published article or a completed article in the same draft batch; no new article link targets a held or future-dated post.

The new histories use pinned source evidence. Focused checks cover the four-colour comparison, the shared-snapshot example, the axis arithmetic and the chart article's teaching examples. The original implementation examples retain the earlier validation. These are article and source checks, not a claim that the draft PR has been deployed.
