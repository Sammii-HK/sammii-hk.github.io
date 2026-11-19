# Review log (fresh reviewers, 2026-11-18)

## tests-for-a-mind, retina, context-window, llm-latency
- retina: no change. context-window: no change.
- tests-for-a-mind: description "list a machine can sit gets very short" -> "see which ones a machine can sit" (readout is 6 of 11). PCI "needs no response" -> "is designed to need no response" (card wording).
- llm-latency: "read most of a sentence before the left pane shows anything" wrong (spinner shows; short answer finished by 4.6 s reveal) -> "by the time the left pane shows a single word, you have read the whole answer". "That replay is the end of" -> "sits near the end of" (medians table follows). "Streaming puts this call close to the first threshold" wrong (165 ms > 0.1 s) -> first token well inside second threshold; spinner lands well past it. "most dramatic row" -> "biggest change".
- New source issues: facts `cold` says two of 28, footer and data.json n=3 (long run 4 ~3.8 s TTFT, counted cold since load > 300 ms). +1 call is an unlabelled "prime" call; jsonl also has 2 "hosted" runs never shown. tests-for-a-mind legend "Solid cards are tests used on real subjects" but Lovelace test and AI Consciousness Test drawn solid. Page metadata "The Turing test" vs card "The imitation game".

## grimoire-map, tokens, videos, text-on-screen (all changed)
- grimoire-map: cosine scores shown to two decimals, not three; "panel on the right" -> "beside the map (below on narrow screens)"; cut "and how the navigation works".
- tokens: hex chip readout shows the bytes themselves, not a count (added).
- videos: "Short still wins, by less" inside single eras overstated (2023: short 3.8% n=4 vs longer 6.3% n=15) -> "In the two the chart compares, short still wins, by less". "was one template" -> "was mostly one silent template".
- text-on-screen: cut "Most people do not." (unmeasured); 12-word table reordered shortest first to match chart.
- New source issue: videos page.tsx lede "Held inside a single era, short still wins" loops over DATA.withinEra (two eras only); 2023 goes the other way. Chart lede and facts.ts overstate.

## unicode, floating-point, git-graph, springs, touch-targets, now
- now: no change (44 ms = 43.7 ms summed from keypress defaults).
- unicode: "plainly shorter than 20" -> "twenty letters long"; grapheme cut "whole family or nothing" wrong (slider min 1) -> "always the whole family"; cut "each layer built to fix the one below" and font/platform drawing claim; Sources matched to footer wording.
- floating-point: Sources matched to footer (removed added titles/first name).
- git-graph: toggle-off claim narrowed ("only commits a branch can reach are drawn"); "full state after one command" -> "after that step" (steps 3, 8, 9 run several); Pro Git cited as footer has it.
- springs: cut "not copied from either library" and "motion should be close"; Heavy stated concretely (zeta ~0.61, underdamped); cut linear() hitch claim; "notes suggest" -> "notes say"; Sources matched.
- touch-targets: "a web page cannot ask" -> "can only guess"; added Material's "8 dp or more between targets"; Sources matched.
- New source issues: floating-point bit view says "Not the number you typed" for whole numbers like 3 (toPrecision strip gives "3."). Café sample bytes identical (c3a9 twice). Ubuntu guide missing from touch-targets footer Sources.

## stacking, specificity, layout, anchor, caching, js-cost (all changed)
- stacking: "bottom half" disappears -> "it disappears"; paint-order list reversed to bottom-to-top (card z 0, section z 1, toolbar z 2); will-change wording matched; "menu rendered at end of body" credited as chart's words; cut "no API for the stacking tree"; "five deep" -> "contexts inside contexts".
- specificity: cut version-number analogy; Sources -> "CSS Cascade 5, section 6".
- layout: demo CSS has no comment, now quotes the code panel's; flexbox/grid snippets say 8px gap vs demo 6px (named alongside minmax 120/110).
- anchor: "no JavaScript in that path" untrue -> "No JavaScript positions it"; "lag is visible" -> pays with a listener every scroll; cut "where menu libraries spend most of their code".
- caching: "exactly what you want" -> "what you want"; hashed asset from memory except hard reload; added preset verdict wording; memory/disk split described as the model's rule; Sources in footer form.
- js-cost: "top bar keeps going" only after measure; only parse/compile and first run are timed; "change size and watch" -> "measure again"; replaced live-result claim with computed 500 KB download times (~31 ms Fast Wi-Fi, 300 ms 4G, 3.3 s Slow 3G).
- New source issues: stacking metadata says tree browser "actually built". anchor footer says both checks use CSS.supports, popover is a prototype check. caching swr deploy visit shows "200 (stale) then 304" but background revalidation after deploy would get 200. js-cost: after measuring, slider updates only the lane label; bars/table keep old measurement and per-KB divides old times by new size.

## url, repaint, event-loop, big-o, keypress, frame-budget (all changed)
- url: description "on a cheap phone the JS takes longer than everything else" -> chart's lead "the JavaScript dwarfs the waiting"; "only the distance changed" -> "only the network did" (3G changes bandwidth too); 2,200 ms bar is round trip + download, overlaps only CSS and first paint; "chosen to be typical" -> "not readings from any machine"; cut "a connection already open" fix; "downloading" -> "fetching"; ?focus selects a bar, does not hide others.
- repaint: title "the two you can animate" -> "the two safe to animate"; "55 I reach for most" -> "55 common properties"; ::after -> "a pseudo-element"; frame-budget citation corrected.
- event-loop: cut launch-history line (stepper and demos landed same day per git); "watch the meter jump" -> "watch the meter"; "five boxes" -> "four boxes and a line"; rAF "runs before next frame" -> "usually runs"; queue count fixed; cut "real browser has more queues".
- big-o: 800 million paragraph rests on source's "n items x m selected", not includes() early exit.
- keypress: "Most return a constant" -> "Five" (of 12); "every range wider than the number" false for display hops (8.3 ms vs "2 to 8 ms"); "lower than measured end to end" -> "on modern machines" (Apple IIe 30 ms).
- frame-budget: "last few dozen" -> "last 60 frames".
- New source issues: keypress vsync/scanout ranges "2 to 8 ms" but 60 Hz default shows 8.3 ms. frame-budget facts.ts and hover credit 10 ms work budget to RAIL; footer credits Paul Lewis and gives RAIL only 6 ms.

## explorations: worlds (all six changed)
- two-clocks: cut "is why the slider stops short" (no reason in source for 1.05 limit). Hour equivalents 58.5/42.4/13.1/34.6 min verified.
- one-throw: "measured at" 1 bar -> "refer to"; caption vs note-under-controls; cut "which have atmospheres"; Sources names matched ("Fact Sheet Notes", "Detailed Pluto Fact Sheet"). Ranges/times verified by node.
- a-day: Moon at noon "shadows in craters turn" wrong and "nothing to scatter light" unsupported -> "Sun climbs, ground brightens, sky stays black" + exosphere note; "colours chosen by hand" -> "artistic choices"; canvas label in caps; dusk ground is grey; Sources list the nine worlds the panel links.
- beneath: buttons sit below controls; layers inspected via buttons not drawing; Pluto has three layer buttons ("no ocean layer to select").
- a-planet: Play runs on from current position; cut design-intent claim; limit is under the drawing; rift ~half width; Pangea marker cites nothing (notes list USGS).
- worlds-in-time: globe only rotates on drag/arrow keys; Fassett and Thomson "related"/"supports diffusion as first-order framework" not "grounded in". Seed 47: Moon 1 deposition; Io 281 -> 40 with tidal heat off, impacts 37 either way.
- New source issues: catalogue lists NASA Mars facts for day-on-another-world but panel does not link Mars or Earth facts. Frame titles differ from catalogue titles ("Time, near a black hole", "One throw. Twelve worlds.", "Borrow another sky", "Peel back a planet", "A planet that won't sit still"). Gravity and tectonics catalogue list fewer sources than in-page panels (3 of 5, 2 of 5).

## colour-spaces, why-hsl-lies, gamuts, named-colours, contrast (all changed)
- colour-spaces: OKLCH lineage incomplete (missing LCH, CIELAB, Munsell), now all nine; 4 of 9 OKLCH ramp swatches out of sRGB, so "close rather than perfect"; cut "not the year first drafted"; only the ends of the P3 ramp are outside sRGB; Sources matched.
- why-hsl-lies: cut "chosen in 1978 because it was cheap" (not in this chart); causal "which is why its hues stay put" softened; conversions live in lib/colour.ts; clamps per channel not "nearest displayable"; Sources matched. All readouts verified.
- gamuts: fill is "nearest sRGB colour, clipped"; "cannot describe" -> "cannot reproduce"; cut unsupported "too dark to read" claim; clip/compand order corrected; cut average-observer embellishment. Areas 100/136/135/189% verified.
- named-colours: "not a single hex value" false (notes contain hex) -> nothing on the wheel from typed hex; Sources matched.
- contrast: cut "third, plain luminance difference"; "strains your eyes at night" -> "still hard to read"; WCAG luminance from lib/colour.ts; notes under cards are hand-written; Sources matched.
- New source issues: facts.ts "OKLCH flat within 1.2 times" vs chart 1.1x at 50%. Contrast "Dark grey on black" note 2.3:1 vs card 2.37 (rounds 2.4). Named-colours lime note says HTML 3.2 green "became lime", contradicting green note and facts.ts. Gamuts idle panel says "nearest colour this screen can make" (it's clipped sRGB).

## typography, communication, x-height, letter, seven, spectrum (all changed, 22 claims)
- typography: walk skipped Italic node; "19th century arrives in a rush" wrong (five nodes); tech lane "no ancestors" contradicted Univers line -> "no parents outside itself"; reaches serif, sans, mono, not Blackletter; stand-in claim corrected (eight nodes show none, Inter/Fraunces/Recursive set in themselves); love letters "have a node of their own" wrong (Garamond, Baskerville, Bodoni inside style nodes); removed Vox-ATypI from Sources (classification, not a listed source).
- communication: opening year sequence added 1450 and 1516; original layout claim not in source, now said of the rebuild; "a few lines" -> "two lines"; ink-trap wording per entry; "people I interviewed" -> "interviews"; Meheux quotes are in Telephone and Computer, not mobile; added fourth interviewee Chris Bigg (Photocopy entry).
- x-height: opening stated live results (Verdana visibly taller) -> compares only EB Garamond and Verdana as the lead does; "headline says twenty-two" -> "description says"; font-size-adjust width/line-box claim -> "chart does not measure"; Sources matched.
- letter: ear "shape geometric sans threw away" wrong (note says double-storey g); EB Garamond is the genome's stand-in for Garaldes; metric lines use measureText not ink raster; "measures twenty-two" -> "up to"; Sources matched (removed ISO draft nomenclature).
- seven: Sources line "Sammii Kellow, VIC708" -> as footer names it.
- spectrum: sub-band list per plot corrected; mantis shrimp -> "surprisingly poor"; 37 C "in the middle" of pit viper bar -> "inside".
- Could not verify (kept): letter "I have not tested across many fonts" (writer's own limit); x-height "a Google family that fails to load is left out" (footer claim, failed load not tested).
- New source issues: letter footer lists only counters as not snapped onto ink; code also leaves eye and aperture. facts.ts `ear` vs specimen note. typography tech-lane fact/empty-state "every other lane".

## explorations: sky and physics (all seven changed)
- one-sky-many-stories: "23 points of light" -> "23 measured stars" (decorative field remains); hover shows tooltip only, position/parallax/ESA link on tap or Inspect; Seven Sisters names credited to "the Greek account", NASA/JPL identifies names with stars; "second slider" -> "one slider"; Te Papa source line no longer claims the nine names; Ngarrngga title per catalogue.
- the-sky-unravelling: "trail runs off the edge" -> "by far the longest"; cut radial-velocity mechanism; "constellations are temporary" -> "measured-data illustration, not a forecast"; CDS label matched.
- step-outside-the-pattern: cut parallax-baseline physics; "many fainter stars" -> "67 stars"; cut "no special relationship in space" (five are Ursa Major moving group).
- through-the-forbidden: cut ball-and-hill classical mechanics; readouts not "beside the canvas"; "borrowing energy" paragraph trimmed; dashed line moves with energy, "stays flat across three regions".
- a-little-less-certain: 0.25 nm is a spread (SD), not a width; Fitzpatrick claim softened; mechanism sentence replaced by what numbers show; covariance relation in physics.md not notes panel.
- the-shape-of-a-note: "real drum" -> "real membrane or instrument"; Chladni line per notes; frequency "computed for stated, illustrative parameters".
- patterns-that-grow: "a few thousandths in each rate" wrong (feed differs by 0.0245) -> removal <= 0.007, feed <= 0.0245; "does not simply fade" -> "need not".
- New source issues: nine Matariki names come from a third Te Papa page (what-and-who-matariki) that neither catalogue nor runtime lists. Two VizieR mirrors (cfa.harvard vs cds.unistra). Alula Australis description says "incident segments" (plural) but one dropped. Big Dipper notes panel lists ESA Orion article that belongs to the time view.
