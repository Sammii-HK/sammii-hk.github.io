---
title: "Reading the labs as connected series"
description: "Nine routes through the experiments, connecting the original questions, the tools they became and the decisions that changed along the way."
date: '2026-11-20'
tags: ['series', 'design-engineering', 'creative-coding', 'building-in-public']
draft: true
---

A gallery is good at showing what exists. It is less good at showing why one experiment belongs beside another, or what changed between an early version and the thing you can open today.

The [labs](https://labs.sammii.dev/) contain several kinds of work: tools, visual explanations, simulations and pieces that began as art. The connections are often the useful part. A colour chart explains a decision in a palette generator. A spring comparison becomes more concrete when you interrupt a moving panel. A sky map asks a different question when you move away from the observer who first saw the pattern.

These are nine reading paths through that work. Each follows a question far enough for it to become an engineering decision. Some also follow documented changes in the projects themselves. I keep those two kinds of sequence separate: a useful order for reading is not automatically the order in which the code was built.

## Colour: from coordinates to a useful tool

Start with the [family tree of colour spaces](https://labs.sammii.dev/charts/colour-spaces/), then the [comparison of lightness across hues](https://labs.sammii.dev/charts/why-hsl-lies/). The first asks where the coordinates came from. The second asks whether equal numbers produce the visual relationship you expected.

That gives the practical decisions in [Gamut](https://sammii.dev/blog/why-your-design-system-needs-oklch-not-hsl/) and [Tailwind Colour Creator](https://tailwind-colour-creator.vercel.app) a reason to exist. A palette generator must decide which properties to preserve, what to do near the display's limits and what its numbered steps mean. Keeping the input colour at a particular step is a product promise, not something every colour algorithm automatically supplies.

Finish with [gamuts](https://labs.sammii.dev/charts/gamuts/), [contrast](https://labs.sammii.dev/charts/contrast/) and [named colours](https://labs.sammii.dev/charts/named-colours/). They introduce three constraints the attractive swatch alone cannot settle: whether the display can reproduce it, whether a particular foreground and background work together, and whether a familiar name means what you think it does.

The development story here is a feedback loop between tools. [From a palette generator to Gamut, and back again](https://sammii.dev/blog/from-a-palette-generator-to-gamut-and-back-again/) follows the specific changes and compares what the same input colour becomes in each implementation.

## Typography: from a letter to a system

The [Love Letter to Garamond](https://sammii.dev/blog/love-letter-to-garamond/) is one way into the people and decisions behind a typeface. The [communication timeline](https://labs.sammii.dev/charts/communication/) and [typography family tree](https://labs.sammii.dev/charts/typography/) pull back to the larger relationships.

Then move closer again. [Letter anatomy](https://labs.sammii.dev/charts/letter/) gives names to shapes you can inspect. [X-height](https://labs.sammii.dev/charts/x-height/) asks why the same nominal size need not occupy the same visual space. Neither question is finished by choosing a font from a menu.

[Kern's earlier workflow](https://sammii.dev/blog/fluid-type-from-a-variable-font-explorer/) brings that judgement into adjustable specimens, variable axes and fluid type values. [The rebuild into Type Lab](https://sammii.dev/blog/from-kern-to-type-lab-making-the-font-data-drive-the-tool/) continues the story with a live font catalogue, shared heading and body roles, and previews that follow the selected system. The connection is from looking carefully to making a judgement explicit enough to reuse in an interface. The charts are related explanations, rather than previous releases of the font tool.

## Motion: from a curve to something you can interrupt

Open [easing versus springs](https://labs.sammii.dev/charts/springs/) and change the target while something is moving. The interesting moment is the second instruction. It arrives before the first movement has finished, and the animation has to decide what state to carry forward.

[Kinetic](https://kinetic.sammii.dev) makes that question available through different interactions. [Balloon Bonanza](https://balloon-bonanza.vercel.app) adds connected bodies and constraints. [Liquidity](https://liquidity-ten.vercel.app) shows why a fluid appearance does not identify the mechanism underneath it: a wave and a collection of rigid bodies can both suggest liquid while behaving very differently.

End with [touch targets](https://labs.sammii.dev/charts/touch-targets/). The reader needs a reliable way to cause the change before the response can feel good. This series connects input, state and visible motion, so an implementation choice can be judged by what happens during use.

## The browser: from an input to a visible result

This path follows the machinery behind the experiences. Begin with [a URL becoming a page](https://labs.sammii.dev/charts/url/) and [the event loop](https://labs.sammii.dev/charts/event-loop/). A network wait and a blocked main thread can both feel like a slow page, but they call for different investigations.

The middle chapters move through the cost of JavaScript, algorithms, caching and the small representational surprises of text and floating point. Then [keypress to pixel](https://labs.sammii.dev/charts/keypress/), [frame budget](https://labs.sammii.dev/charts/frame-budget/) and [how long now takes](https://labs.sammii.dev/charts/now/) connect computation to something a person can notice.

The CSS chapters ask a more local question: which rule or rendering step explains this particular result? Layout, specificity, stacking and anchor positioning make useful neighbours because they describe different causes of an element ending up somewhere unexpected. The path ends with [Git as a graph](https://labs.sammii.dev/charts/git-graph/), where the record of a change becomes something you can inspect too.

Two development histories run alongside those explanations. [When the browser became part of the explanation](https://sammii.dev/blog/when-the-browser-became-part-of-the-explanation/) follows the shift towards real controls and measured work. [When a blog post stopped needing a deploy](https://sammii.dev/blog/when-a-blog-post-stopped-needing-a-deploy/) follows the content reader, publication rules and feeds that deliver the writing around them.

## Building a sky: from a view to a model

Begin inside the [celestial map](https://celestial-map.sammii.dev). Then visit [one sky, many stories](https://labs.sammii.dev/explorations/constellations-and-sky-stories/), [the sky unravelling](https://labs.sammii.dev/explorations/constellations-through-time/) and [the Big Dipper in three dimensions](https://labs.sammii.dev/explorations/big-dipper-in-3d/).

Those pieces change different assumptions: which pattern is being drawn, which time is being represented and where the observer stands. A line on the sky can be meaningful without being a physical connection between stars.

[Day Lite](https://day-lite.vercel.app) brings the observer back to Earth and a local clock. The planetary explorations then vary the world itself: a day, a throw under another gravity, an interior, a changing surface. Read those as a sequence of modelling choices. The useful question is always which coordinates, quantities and timescales the interface is holding fixed while you change something else.

## Invisible worlds: what an interactive model can explain

This path starts with [two clocks near a black hole](https://labs.sammii.dev/explorations/black-hole-time-dilation/) and [light paths](https://labs.sammii.dev/explorations/black-hole-light-paths/), then moves through the quantum explorations to [vibrating membranes](https://labs.sammii.dev/explorations/vibrating-membranes/) and [reaction-diffusion patterns](https://labs.sammii.dev/explorations/reaction-diffusion/).

The subjects are different. The shared design problem is making a relationship available to investigate without letting the picture imply a more complete simulation than the code supplies. A control should have a defined meaning. A visual result should come with the assumptions needed to interpret it.

This is also where the development history of the collection matters. A reusable chart, a standalone page and an embedded exploration have different responsibilities. [From charts to explorable models](https://sammii.dev/blog/from-charts-to-explorable-models/) follows the actual changes to shared components, interactions and delivery, rather than presenting every new subject as a fresh technical beginning.

## Systems that learn and choose

Start with [tokens](https://labs.sammii.dev/charts/tokens/), [context windows](https://labs.sammii.dev/charts/context-window/) and [model latency](https://labs.sammii.dev/charts/llm-latency/). They make some of the constraints around an AI system visible before the system is given a personality or a job.

The [grimoire map](https://labs.sammii.dev/charts/grimoire-map/) concerns relationships in retrieved information. [Teaching a computer to paint](https://sammii.dev/experiments/teaching-a-computer-to-paint/index.html) asks how a proposed decision policy compares with a baseline on a recorded task. [Moth](https://sammii.dev/blog/moth-a-world-of-possibilities/) concerns an agent acting within a persistent world. [Isle](https://sammii.dev/blog/i-made-a-vs-code-extension-that-turns-my-ai-agents-into-animal-crossing-villagers/) makes agent activity visible through a different interface.

The public view has a development story too. [Moth: from a drawing gallery to an observatory](https://sammii.dev/blog/moth-from-a-drawing-gallery-to-an-observatory/) follows the change from inspecting drawings to inspecting relationships around them. [Lunary's validation story](https://sammii.dev/blog/lunary-the-right-data-did-not-stop-the-wrong-answer/) examines a different boundary: correct input data, a wrong generated claim, and the meaning of a check that must understand which time the sentence describes.

These should not share one vague success claim. Retrieval quality, image error, a visible action and subjective experience are different questions. [Tests for a mind](https://labs.sammii.dev/charts/tests-for-a-mind/) and [the model-selection article](https://sammii.dev/blog/moth-choosing-models-by-task/) belong here because they help keep those questions specific.

## Light, image and sound

The existing [Journey Through Light](https://sammii.dev/blog/beyond-the-visible-uv-acetate-and-the-installation-i-painted/) work provides an origin for this route: an experience made with physical materials and illumination. The [browser reconstruction](https://beyond-light-vr.vercel.app) has to express its reveal through geometry, textures and time.

The [spectrum](https://labs.sammii.dev/charts/spectrum/) and [retina](https://labs.sammii.dev/charts/retina/) pieces ask what a visible representation can contain. [Seven](https://labs.sammii.dev/charts/seven/) belongs to the cultural and symbolic strand of the earlier work; it is a different kind of explanation from the physical models.

From there, [Creative Coding](https://creative-coding.sammii.dev), [Refract](https://refract.sammii.dev) and [Spectra](https://spectra.sammii.dev) offer three different inputs to a rendered image: a photograph, instructions and sound. Their relationship is a continuing question about translation between materials. It does not require pretending that one is the next release of another.

## From footage to a decision

The [video outcomes chart](https://labs.sammii.dev/charts/videos/) begins with observations. [Text on screen](https://labs.sammii.dev/charts/text-on-screen/) makes one design assumption, reading time, adjustable. [Why this take won](https://sammii.dev/experiments/why-this-take-won/index.html) exposes a ranking calculation so that its trade-offs can be inspected.

Read together, the pieces ask what a recommendation is made from. An observed association does not automatically become a cause. A ranking score does not become taste just because it has several inputs. An overlay that fits within a clip is not necessarily comfortable to read.

That makes a useful series because the engineering decisions stay connected to the person editing or watching. Each instalment can show a concrete change, the reason for considering it, the evidence available and what remains unresolved.

## A series should have something to remember

The next chapter needs to retain a question from the previous one. It can show a constraint arriving, an assumption failing, a smaller component becoming reusable or a later tool sending an idea back to an earlier one.

Where there is a documented revision, I want to show the before and after: the code, the interface or the contract that changed. Where projects simply illuminate the same question, the reading path can say so. Both make the work easier to follow. Keeping the distinction visible makes the development story more useful too.
