---
title: "From Kern to Type Lab: letting the font data drive the tool"
description: "How a six-font explorer became a place to build a type system: live family metadata, shared heading and body roles, explicit scale endpoints and previews that stay faithful to their input."
date: '2026-11-22'
draft: true
series: "Typography"
tags: [typography, design-engineering, typescript, css, tools]
lab_url: "https://kern.sammii.dev"
---

The November rebuild of Kern changed the thing the tool lets you work on. The original version explored a font: pick a family, move its axes, compare it with another face. Type Lab carries a small type system through browsing, pairing, scale generation, previews and export.

The sliders still matter. The larger change is that their data now comes from a font catalogue, and the choices they edit belong to persistent heading, body and monospace roles. A decision made in one view has somewhere to go in the next.

My [first Kern article](/blog/the-kerning-pair-problem/) covered the original workflow, and the [later implementation post](/blog/fluid-type-from-a-variable-font-explorer/) examined its axis controls and fluid scale. This is the next chapter: what changed in the source on 20 and 21 November, and why the new pieces need to agree with one another.

## The original interface was already driven by data

The March version had [six families configured in `lib/fonts.ts`](https://github.com/Sammii-HK/kern/blob/5adaf8924f1469a43965171ea8c714c4f03fb67f/lib/fonts.ts): Inter, Fraunces, Recursive, Roboto Flex, Playfair Display and Source Serif 4. Each entry listed its axes, bounds, defaults and slider steps. The controls rendered that list.

That was a useful boundary from the start. The slider component could handle `wght`, `opsz` or Recursive's `CASL` without containing a separate interface for each font. Adding a family meant extending the configuration and loading its font.

The [20 November rebuild](https://github.com/Sammii-HK/kern/commit/2653379de2966aada2ce196cc378dddce37d16d3) moves the source of that configuration outside the application. It reads Google Fonts metadata and turns it into a smaller model of families, axes, supported weights and categories. The change is from maintaining a selected set of descriptions to maintaining a reliable translation of a changing catalogue.

That creates a new responsibility. A font tool has to distinguish a static family from a variable one, respect each family's available ranges and cope with incomplete metadata. The adapter becomes part of the interface's correctness, even though a visitor never sees it.

## A live catalogue needs a useful fallback

The [catalogue layer](https://github.com/Sammii-HK/kern/blob/0c7d2a3a69fbef412b087209c9f88c96335a6f0f/lib/catalogue/fetch.ts) first tries the Google Fonts site's metadata endpoint. If that fails, it tries the documented Developer API when a server-side API key is configured, then falls back to a bundled snapshot.

Those sources do not have identical shapes. The [normaliser](https://github.com/Sammii-HK/kern/blob/0c7d2a3a69fbef412b087209c9f88c96335a6f0f/lib/catalogue/slim.ts) translates their categories, filters malformed axis ranges and fills in missing defaults. The Developer API path uses the bundled axis registry for information it does not receive upstream. Google's [Developer API documentation](https://developers.google.com/fonts/docs/developer_api) is the reference for that supported endpoint; the site's metadata feed is a separate dependency.

The catalogue also filters to families with a Latin subset because the specimens use Latin text. That is a deliberate limit on what this version explores. A broader writing-system explorer would need different samples, filtering and evaluation, not just a larger list of names.

The fetch layer memoises successful catalogue results for a day. It also uses a 2.5-second patience timer: if the upstream work has not finished, the function can return the snapshot while the request continues. Freshness and immediate usefulness are handled separately.

Font loading follows the same principle of asking for what a particular view needs. The [loader](https://github.com/Sammii-HK/kern/blob/0c7d2a3a69fbef412b087209c9f88c96335a6f0f/lib/font-loader.ts) requests full families with their axis ranges when selected. Thumbnails use a text subset registered under a different family name, so their small preview face does not compete with the full variable family. Google's [CSS2 API](https://developers.google.com/fonts/docs/css2) supports both range requests and text subsets.

The useful optimisation here is structural: a catalogue of possibilities does not require downloading every complete font before somebody makes a choice.

## The state became a system of roles

The original playground URL described one selected font, its size and its axis settings. Type Lab's [shared state](https://github.com/Sammii-HK/kern/blob/0c7d2a3a69fbef412b087209c9f88c96335a6f0f/lib/lab-state.ts) describes three roles plus the scale they use. Reduced to the important fields, it looks like this:

```typescript
type RoleState = {
  family: string;
  axes: Record<string, number>;
};

type LabState = {
  heading: RoleState;
  body: RoleState;
  mono: RoleState;
  scale: ScaleConfig;
  headingFrom: number;
};
```

`headingFrom` specifies the scale step at which text starts using the heading face. The same system can therefore render a headline, body copy and an inline code sample with different families while retaining one scale.

Changing a role's family clears its previous axis overrides. That matters because a number meaningful for one family may be outside another family's range, or refer to an axis the replacement does not have. At rendering time, effective values are derived from the selected family's defaults and clamped overrides.

The URL records differences from the defaults. Navigation carries the system's parameters between pages, while page-specific searches and preview tabs can remain local to their view. The result is a useful distinction between “the design I am making” and “the part of the interface I am looking at”.

There is a subtle example in the default heading. It starts as Fraunces with a weight override of 600. A change to Newsreader with no overrides must stay empty when serialised and read back; it must not quietly acquire Fraunces's 600. That case works in a focused check of the saved state functions. The model makes the expectation explicit enough to check without involving a browser.

## The scale gained two independent endpoints

The original generator had one base size and one ratio. It derived the smaller end of each step by multiplying the exponent by 0.75. The November version gives each end its own base and ratio.

This simplified comparison of the two calculations shows the policy change:

```diff
- small = baseSize * ratio ** (step * 0.75)
- large = baseSize * ratio ** step
+ small = minBase * minRatio ** step
+ large = maxBase * maxRatio ** step
```

The [new implementation](https://github.com/Sammii-HK/kern/blob/0c7d2a3a69fbef412b087209c9f88c96335a6f0f/lib/scale.ts) then finds the straight line between those endpoints. Its default base is 17px at a 360px viewport and 20px at 1240px, with ratios of 1.2 and 1.25 respectively.

For step zero, that gives 17px, 18.5px and 20px at widths of 360, 800 and 1240px. Step two moves from 24.48px to 31.25px over the same range. These are evaluations of the pure scale function before output rounding.

The change makes the endpoints actual controls instead of a fixed relationship hidden inside the exponent. It also gives below-base steps room to behave differently. A larger desktop ratio can make a small step shrink as the viewport grows. The formatter orders the `clamp()` bounds numerically and permits a negative slope, preserving that valid case.

Leading and tracking accompany the sizes. Those are authored rules too, rather than facts a font catalogue can decide for every design. Keeping them beside the scale makes their effect visible in the preview and their values available to export.

## A preview has to obey the model it is showing

The pairing view now includes article, dashboard, pricing and form specimens. Those contexts give typography something to do: wrap a heading, sit beside a number, label a field or carry a paragraph.

The [preview styles](https://github.com/Sammii-HK/kern/blob/0c7d2a3a69fbef412b087209c9f88c96335a6f0f/lib/system-style.ts) use `cqi` in the fluid expression, while the exported page styles use `vw`. A container-relative unit lets the specimen respond to its own frame's inline size. Otherwise, a narrow preview inside a wide browser could retain the wide browser's type size. The [CSS container-unit definition](https://www.w3.org/TR/css-contain-3/#container-lengths) explains that distinction.

A [21 November correction](https://github.com/Sammii-HK/kern/commit/cd90de707b28246ad5b109272af893dc28ef012f) makes the boundary between editor and specimen even clearer. A global 44px minimum for controls was affecting the mock buttons and fields inside previews. The patch keeps those target sizes on the tool's controls and excludes descendants of `.preview-frame`.

For buttons, the relevant change is this excerpt:

```diff
- button {
+ button:not(.preview-frame *) {
    min-width: 44px;
  }
```

The broader rule applies the same boundary to control heights.

It illustrates a problem shared by editors and component playgrounds. Their own styles can contaminate the thing being inspected. The surrounding tool needs usable controls; the specimen needs to reveal the consequences of the chosen type system. A preview that silently changes those consequences gives misleading feedback.

## The name followed the new scope

The [rename commit](https://github.com/Sammii-HK/kern/commit/0b9763daa3dcafce7dffeced4aebb0e6f1de3390) changes the interface name and metadata to Type Lab while retaining the `kern` repository, package and address. It gives the broader workflow a clearer label without making the name change responsible for the architectural work.

That work connects the stages. Metadata defines available choices. Roles preserve a coherent selection. The scale defines sizes across a range. Previews show the selection doing useful work. The exporter writes CSS, Tailwind theme variables, token data and font-loading markup from the same system.

The next time a family or a scale changes, those stages have a common description to refer to. That is the development I find most useful in this revision: the tool has something coherent to carry from the first experiment to the code somebody takes away.

## Read this as a series

This article is part of **Typography: from a letter to a system**. [The series guide](https://sammii.dev/blog/reading-the-labs-as-connected-series/) connects the chapters and their different questions.

Continue through [the typography tree](https://labs.sammii.dev/charts/typography/) and [Kern's variable-font and fluid-type article](https://sammii.dev/blog/fluid-type-from-a-variable-font-explorer/). The connection is how a visible typographic judgement becomes an explicit control.
