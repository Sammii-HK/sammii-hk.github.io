---
title: "Pizzazz"
description: "A focused DOM-effects library with an actual-source playground, keyboard-safe bursts and copyable configuration."
techStack: "JavaScript, DOM, CSS transitions, Rollup, Jest"
updated: "2026-11-20"
status: "Unreleased local 6455b1a: library and playground verified; no package publication or demo deployment."
---

<!-- Kept in step with the canonical structured study in pizzazz.json. -->

Unreleased local 6455b1a: library and playground verified; no package publication or demo deployment.

## Make the playground exercise the package

Pizzazz attaches click or hover effects to a DOM target. The local product pass replaces the demo’s separate embedded copy with a build of the actual library source. Preset, size, duration, spread, rotation and easing controls now lead to generated JavaScript from the same implementation that makes the burst. The library remains framework-independent with no runtime dependencies.

_Actual unreleased local playground, scrolled to preview, settings and code. The controls use the library source, not a separate animation fork._

## A default argument can run before an SSR guard

- **What happened:** The default target was document. Calling addPizzazz with no target evaluated that browser global before the function could check for server rendering.
- **Why:** A guard inside the body cannot protect an expression evaluated while binding the function’s arguments.
- **Fix:** The local library resolves the default target after its environment check and returns a harmless cleanup when there is no document. The declared default export now exists in both built module formats, alongside the named API.

## Keep a native button at the centre

A keyboard activation can report zero pointer coordinates. Hover also has no useful meaning on many touch interfaces.

- **A native preview button with a keyboard fallback (chosen):** Zero-coordinate keyboard clicks centre the burst on the target. The same button remains usable in hover mode.
- **Require a pointer coordinate for every burst:** The effect could appear at a screen edge or leave keyboard users without a way to trigger the preview.

Actual Enter on the preview produced eight particles at the button’s horizontal centre; a later read found no containers remaining. Space worked while hover mode was selected. Phone-sized layout is not evidence of physical touch or hover behaviour on every device.

_Actual unreleased 390px introduction and preview. Physical touch was not exercised._

_Preview, settings and code follow that order on the phone. Decorative particle artwork is separate from the interface icons._

## Keep the particle artwork, repair the interface

The thirteen existing particle presets and custom-character API are decorative artwork. They were preserved; replacing the particles with UI icons would change the library’s purpose. Interface controls use text labels and named Lucide icons. Generated containers are hidden from assistive technology, and reduced-motion preference suppresses particle creation at the library boundary. The browser’s operating-system preference was not changed to claim a separate live test.

## A snippet should survive its own inputs

Custom text is escaped through JSON string encoding before it enters the generated JavaScript, preserving quotes, backslashes and line breaks. Clipboard feedback waits for the actual promise and gives a manual-copy path on failure. Moving one size endpoint beyond its neighbour also moves the other, so the exported range stays ordered. Reset restores the default preset, custom text, gravity, easing and snippet.

_Actual local configuration and clipboard success state. Spring is explicitly described as a CSS curve, not a physics simulation._

## Keep the motion claim proportionate

A trigger creates DOM spans, then CSS transform and opacity transitions animate them. Gravity chooses a downward target; bounce and spring are cubic-bezier presets. Attachment returns a listener cleanup function. Cleanup detaches future triggers while existing particles finish their configured duration. This is not a particle pool, shared simulation loop or measured frame-rate result.

> Local 6455b1a passes 19 Jest cases, 11 shared icon regressions, both package formats and the demo build, with dependency audit zero. Source icon scan has zero blocking findings; its 28 reviewed candidates are the fourteen decorative particle definitions repeated in source and bundle. Chrome desktop/390px checks cover centred keyboard bursts, container removal, ordered size controls, escaped clipboard contents, configuration, reset and no document overflow. Cross-browser, physical touch and broad assistive-technology conformance remain open. No package or demo release occurred.
