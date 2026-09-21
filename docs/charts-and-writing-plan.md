# Charts, videos and writing: the plan (2026-09-21)

Information-design pieces in the Useful Charts / McCandless register, about the things a design engineer works with. Every piece is three things at once: an interactive page on labs.sammii.dev/charts, a downloadable poster (SVG, print size), and a scripted video for X from the project-video lane. Each also gets a blog post on sammii.dev and a LinkedIn piece.

Rules: every fact sourced (author, year) in the page footer; UK English; no em dashes; no invented numbers; charts render with real data, never illustrative values.

## Series A: colour and perception
1. **The family tree of colour spaces** (built). Munsell to CSS Color 4, six lanes, derivation and influence edges, live ramps in each space.
2. **Why HSL lies** (built): one row per hue, the same nominal lightness in HSL, LCH and OKLCH, with the measured luminance beside it. The chart Gamut's README always wanted.
3. **The gamuts** (built): sRGB, Display P3, Adobe RGB, Rec. 2020 and the spectral locus drawn on the CIE 1931 diagram, with a toggle for what your own screen can show (read from `matchMedia('(color-gamut: p3)')`).
4. **Contrast, three ways**: WCAG 2 ratio, APCA and plain luminance difference for the same pairs, so people see where they disagree.

## Series B: typography (builds on the eleven Love Letters and Kern)
0. **Six centuries of communication and type** (built): the student communication infographic rebuilt as a scroll spine, inventions left, type right, 65 entries.
5. **The typography genome** (built): blackletter to variable fonts as a family tree; humanist, grotesque, geometric, neo-grotesque, transitional, didone, slab, with a real specimen at every node via Kern's font set. Video: the year scrub, then a hover down the humanist branch.
6. **The anatomy of a letter**: one interactive glyph with every term (x-height, aperture, terminal, spur, ear) labelled on hover, switchable between four faces so the differences are visible.
7. **The London letter**: Johnston, Gill, Transport, Rail Alphabet and their descendants, the faces you read on the way to work. Draws on the Johnston and Transport letters.
8. **How a font file becomes pixels**: glyph outlines to hinting to rasterisation to subpixel rendering, as a flow.

## Series C: the browser and the machine (the CS pieces)
0. **The event loop, step by step** (built) and **Big O, to scale** (built).
9. **How a keypress becomes a pixel** (built): keyboard to OS to browser to compositor to GPU, as a McCandless flow with the latency budget at each hop.
10. **The evolution of CSS layout**: tables, floats, flexbox, grid, container queries, anchor positioning; a timeline with the browser-support tide behind it.
11. **The JavaScript framework family tree**: Prototype and jQuery to React Server Components, with forks, influences and deaths.
12. **The rendering pipeline** (built as What a CSS property costs): style, layout, paint, composite, and which CSS properties trigger which, colour-coded. The chart every performance talk redraws by hand.
13. **What an LLM call actually costs**: tokens, context, providers, latency and price on one diagram, drawn from real provider tables (the AI Gateway pitch, made visual).
14. **The colour of the web**: the most used named CSS colours by frequency, a real dataset from the HTTP Archive.

## Series D: from the MA (source of truth: Notion, "MA: A Journey Through Light")
15. **The visible spectrum and what sits outside it**: the electromagnetic spectrum drawn to scale, with the sliver we see and the ultraviolet where the installation's quotes appeared. Eagleman's "less than one ten-trillionth" made visible.
16. **The symbolism of seven**: seven heavens, seven chakras, seven planetary spheres, seven gods of fortune, across cultures, as a radial chart. Bellos's 1-in-10 finding as the centre.
17. **The seven spheres**: the installation's journey, red to violet, each sphere with its Hermetic pull-quote and the artists referenced, as a poster.
18. **Vanitas, a timeline**: the painters and the symbols (skulls, snuffed candles, bubbles) from the thesis's research thread, alongside the contemporary light artists.

## Videos
Every chart gets a scene in `visual-lane/project-video-render.mjs`: load with `?play=1` for the timeline reveal, then a scripted hover down one lineage, 9 seconds, captioned from the chart's own footer. The colour-spaces scene is the template.

## Blogs: what has no post yet
Projects with no dedicated post on sammii.dev (checked 2026-09-21 by content search): Strata, Homebase (architecture only, no live link), create-mcp-server, Kinetic, Spectra, Refract, Celestial Map, Day Lite, Liquidity, Balloon Bonanza, Crystal Index, The Colour Game, Pizzazz, sammii-cli, Tailwind Colour Creator, the fifteen creative-coding sketches (one post, one begonia), and Beyond Light as a build (the WebXR reconstruction; the installation itself is Part 6 of the series).

Each post follows the case-study voice: the problem, the hard part, one true number, what it taught. Source of truth is the project's case study in `content/case-studies` plus the code. No post for a project ships without a screenshot or clip from the project-video lane.

Already covered (do not duplicate): Gamut (OKLCH not HSL), Kern (kerning pair), Prism (self-building library), Lattiq (local-first), Isle (Animal Crossing villagers), Orbit (14 agents), Flip (Wilson intervals), Glint (edge middleware), ScapeStudio (Web Workers), iPrep (interview coach), Podify, Spellcast and Lunary (many), the MA series parts 1 to 7 (complete).

## More to build (added 2026-09-21)
- **Every named CSS colour in OKLCH**: the 148 named colours on a hue and chroma wheel, resolved in the browser, with the oddities (darkgray lighter than gray) called out.
- **The em, the point and the pixel**: how type units relate, drawn to scale at 96 dpi.
- **Easing, drawn**: cubic-bezier presets against spring curves, with the velocity plotted.
- **The stacking context**: what creates one, as a decision tree you can walk.
- **Specificity, to scale**: selectors as (a, b, c) triples on a sorted axis.
- **How a URL becomes a page**: DNS, TCP, TLS, HTTP, parse, render, as a latency waterfall (the network sibling of the keypress chart).
- **What a byte of JavaScript costs**: download, parse, compile, execute, per KB, on a phone versus a laptop.
- **Git, as a graph**: commits, branches, merges, rebase, drawn and stepped like the event loop.
- **Floating point**: why 0.1 + 0.2 is not 0.3, the bits laid out.
- **Unicode**: code point, code unit, grapheme, for one emoji family.

## Order of work
Built: colour spaces, why HSL lies, communication and type, the typography genome, keypress to pixel, the gamuts, what a CSS property costs, the event loop, Big O. Next: the symbolism of seven (MA) → the gamuts → the evolution of CSS layout → the anatomy of a letter → then alternate one from each series. Every built chart has a scene in the project video lane. Blogs for the gap list run in parallel through the content pipeline, two a week, oldest project first.
